"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, backOfficeRoles } from "@/lib/permissions";
import { inventorySchema } from "@/lib/validators";
import { writeAudit } from "@/lib/audit";

export async function createPart(formData: FormData) {
  const user = await requireUser(backOfficeRoles);
  const parsed = inventorySchema.parse(Object.fromEntries(formData));
  const part = await prisma.sparePart.create({
    data: {
      ...parsed,
      branchId: user.branchId ?? (await prisma.branch.findFirstOrThrow()).id,
      movements: {
        create: { type: "STOCK_IN", quantity: parsed.quantity, unitCost: parsed.purchaseCost, reason: "Initial stock", createdBy: user.id }
      }
    }
  });
  await writeAudit({ userId: user.id, action: "CREATE", entityType: "SparePart", entityId: part.id });
  revalidatePath("/inventory");
}
