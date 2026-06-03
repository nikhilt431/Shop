"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, adminRoles } from "@/lib/permissions";
import { technicianSchema } from "@/lib/validators";
import { writeAudit } from "@/lib/audit";

export async function createTechnician(formData: FormData) {
  const user = await requireUser(adminRoles);
  const parsed = technicianSchema.parse(Object.fromEntries(formData));
  const technician = await prisma.technician.create({
    data: {
      ...parsed,
      skillCategoryId: parsed.skillCategoryId || undefined,
      branchId: user.branchId ?? (await prisma.branch.findFirstOrThrow()).id
    }
  });
  await writeAudit({ userId: user.id, action: "CREATE", entityType: "Technician", entityId: technician.id });
  revalidatePath("/technicians");
}
