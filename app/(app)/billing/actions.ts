"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser, staffRoles } from "@/lib/permissions";
import { invoiceSchema } from "@/lib/validators";
import { writeAudit } from "@/lib/audit";

async function nextInvoiceNumber() {
  const count = await prisma.invoice.count();
  return `INV-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`;
}

export async function createInvoice(formData: FormData) {
  const user = await requireUser(staffRoles);
  const parsed = invoiceSchema.parse(Object.fromEntries(formData));
  const job = await prisma.repairJob.findUniqueOrThrow({
    where: { id: parsed.repairJobId },
    include: { customer: true, partsUsed: true }
  });
  const sparePartsTotal = job.partsUsed.reduce((sum, usage) => sum + Number(usage.unitPrice) * usage.quantity, 0);
  const grandTotal = parsed.laborCharges + sparePartsTotal + parsed.tax - parsed.discount;

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: await nextInvoiceNumber(),
      repairJobId: job.id,
      customerId: job.customerId,
      branchId: job.branchId,
      laborCharges: parsed.laborCharges,
      sparePartsTotal,
      tax: parsed.tax,
      discount: parsed.discount,
      grandTotal,
      paidAmount: parsed.paymentStatus === "PAID" ? grandTotal : 0,
      paymentMethod: parsed.paymentMethod,
      paymentStatus: parsed.paymentStatus
    }
  });

  await writeAudit({ userId: user.id, action: "CREATE", entityType: "Invoice", entityId: invoice.id });
  revalidatePath("/billing");
  redirect(`/billing/${invoice.id}`);
}
