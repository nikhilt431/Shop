"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, adminRoles } from "@/lib/permissions";
import { writeAudit } from "@/lib/audit";

export async function createCategory(formData: FormData) {
  const user = await requireUser(adminRoles);
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  if (!name) throw new Error("Category name is required.");
  const category = await prisma.repairCategory.create({ data: { name, description } });
  await writeAudit({ userId: user.id, action: "CREATE", entityType: "RepairCategory", entityId: category.id });
  revalidatePath("/categories");
}
