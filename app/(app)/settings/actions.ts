"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, adminRoles } from "@/lib/permissions";

export async function saveSettings(formData: FormData) {
  await requireUser(adminRoles);
  await prisma.systemSetting.upsert({
    where: { key: "shop" },
    update: {
      value: {
        taxRate: Number(formData.get("taxRate") || 0),
        defaultWarrantyDays: Number(formData.get("defaultWarrantyDays") || 0),
        receiptFooter: String(formData.get("receiptFooter") || "")
      }
    },
    create: {
      key: "shop",
      value: {
        taxRate: Number(formData.get("taxRate") || 0),
        defaultWarrantyDays: Number(formData.get("defaultWarrantyDays") || 0),
        receiptFooter: String(formData.get("receiptFooter") || "")
      }
    }
  });
  revalidatePath("/settings");
}
