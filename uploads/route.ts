import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, backOfficeRoles } from "@/lib/permissions";
import { uploadRepairPhoto } from "@/lib/storage";

export async function POST(request: Request) {
  const user = await requireUser(backOfficeRoles);
  const formData = await request.formData();
  const repairJobId = String(formData.get("repairJobId"));
  const type = String(formData.get("type") || "INTERNAL") as "INTAKE" | "BEFORE_REPAIR" | "INTERNAL" | "AFTER_REPAIR";
  const files = formData.getAll("files").filter((item): item is File => item instanceof File);
  const job = await prisma.repairJob.findUniqueOrThrow({ where: { id: repairJobId } });

  const photos = await Promise.all(
    files.map(async (file) => {
      const uploaded = await uploadRepairPhoto(file, job.ticketNumber);
      return prisma.repairPhoto.create({
        data: {
          repairJobId,
          type,
          url: uploaded.url,
          storageKey: uploaded.storageKey,
          uploadedBy: user.id
        }
      });
    })
  );

  return NextResponse.json(photos, { status: 201 });
}
