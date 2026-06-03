"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { RepairStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser, backOfficeRoles, staffRoles } from "@/lib/permissions";
import { noteSchema, repairJobSchema, statusUpdateSchema } from "@/lib/validators";
import { todayTicketNumber } from "@/lib/utils";
import { writeAudit } from "@/lib/audit";
import { queueRepairNotification } from "@/lib/notifications";

async function nextTicketNumber() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const count = await prisma.repairJob.count({ where: { createdAt: { gte: start } } });
  return todayTicketNumber(count + 1);
}

export async function createRepairJob(formData: FormData) {
  const user = await requireUser(staffRoles);
  const parsed = repairJobSchema.parse({
    ...Object.fromEntries(formData),
    technicianIds: formData.getAll("technicianIds").map(String)
  });
  const ticketNumber = await nextTicketNumber();
  const branchId = user.branchId ?? (await prisma.branch.findFirstOrThrow()).id;
  const warrantyExpiryDate = parsed.warrantyPeriodDays
    ? new Date(Date.now() + parsed.warrantyPeriodDays * 24 * 60 * 60 * 1000)
    : undefined;

  const job = await prisma.repairJob.create({
    data: {
      ticketNumber,
      customerId: parsed.customerId,
      categoryId: parsed.categoryId,
      branchId,
      brand: parsed.brand,
      modelNumber: parsed.modelNumber,
      serialNumber: parsed.serialNumber,
      productColor: parsed.productColor,
      productCondition: parsed.productCondition,
      accessoriesReceived: parsed.accessoriesReceived,
      problemDescription: parsed.problemDescription,
      expectedDeliveryDate: parsed.expectedDeliveryDate ? new Date(parsed.expectedDeliveryDate) : undefined,
      warrantyPeriodDays: parsed.warrantyPeriodDays,
      warrantyExpiryDate,
      createdById: user.id,
      statusHistory: {
        create: { status: RepairStatus.RECEIVED, createdBy: user.id, notes: "Product received and ticket generated." }
      },
      assignments: {
        create: parsed.technicianIds?.filter(Boolean).map((technicianId, index) => ({
          technicianId,
          isLead: index === 0
        }))
      }
    }
  });

  await writeAudit({ userId: user.id, action: "CREATE", entityType: "RepairJob", entityId: job.id });
  await queueRepairNotification({ eventKey: "JOB_RECEIVED", repairJobId: job.id });
  redirect(`/jobs/${job.id}`);
}

export async function updateJobStatus(formData: FormData) {
  const user = await requireUser(backOfficeRoles);
  const jobId = String(formData.get("jobId"));
  const parsed = statusUpdateSchema.parse(Object.fromEntries(formData));

  await prisma.$transaction([
    prisma.repairJob.update({ where: { id: jobId }, data: { status: parsed.status } }),
    prisma.repairStatusEvent.create({
      data: { repairJobId: jobId, status: parsed.status, notes: parsed.notes, createdBy: user.id }
    }),
    prisma.auditLog.create({
      data: { userId: user.id, action: "STATUS_UPDATE", entityType: "RepairJob", entityId: jobId, metadata: parsed }
    })
  ]);

  if (parsed.status === "IN_REPAIR") {
    await queueRepairNotification({ eventKey: "REPAIR_STARTED", repairJobId: jobId });
  }
  if (parsed.status === "READY_FOR_DELIVERY") {
    await queueRepairNotification({ eventKey: "READY_FOR_DELIVERY", repairJobId: jobId });
  }
  if (parsed.status === "DELIVERED") {
    await queueRepairNotification({ eventKey: "DELIVERED", repairJobId: jobId });
  }

  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/jobs");
}

export async function addRepairNote(formData: FormData) {
  const user = await requireUser(backOfficeRoles);
  const jobId = String(formData.get("jobId"));
  const parsed = noteSchema.parse(Object.fromEntries(formData));
  const technician = await prisma.technician.findUnique({ where: { userId: user.id } });

  await prisma.repairNote.create({
    data: {
      repairJobId: jobId,
      technicianId: technician?.id,
      type: parsed.type,
      note: parsed.note,
      createdBy: user.id
    }
  });

  await writeAudit({ userId: user.id, action: "ADD_NOTE", entityType: "RepairJob", entityId: jobId });
  revalidatePath(`/jobs/${jobId}`);
}

export async function consumeSparePart(formData: FormData) {
  const user = await requireUser(backOfficeRoles);
  const repairJobId = String(formData.get("repairJobId"));
  const sparePartId = String(formData.get("sparePartId"));
  const quantity = Number(formData.get("quantity") ?? 1);
  const part = await prisma.sparePart.findUniqueOrThrow({ where: { id: sparePartId } });

  if (part.quantity < quantity) {
    throw new Error("Insufficient stock for selected spare part.");
  }

  await prisma.$transaction([
    prisma.jobPartUsage.create({
      data: { repairJobId, sparePartId, quantity, unitPrice: part.sellingPrice, createdBy: user.id }
    }),
    prisma.sparePart.update({ where: { id: sparePartId }, data: { quantity: { decrement: quantity } } }),
    prisma.stockMovement.create({
      data: { sparePartId, type: "JOB_CONSUMPTION", quantity: -quantity, reason: `Consumed for repair ${repairJobId}`, createdBy: user.id }
    })
  ]);

  await writeAudit({ userId: user.id, action: "CONSUME_PART", entityType: "RepairJob", entityId: repairJobId });
  revalidatePath(`/jobs/${repairJobId}`);
  revalidatePath("/inventory");
}
