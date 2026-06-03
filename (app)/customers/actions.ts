"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser, staffRoles } from "@/lib/permissions";
import { customerSchema } from "@/lib/validators";
import { writeAudit } from "@/lib/audit";

async function nextCustomerCode() {
  const count = await prisma.customer.count();
  return `CUS-${String(count + 1).padStart(4, "0")}`;
}

export async function createCustomer(formData: FormData) {
  const user = await requireUser(staffRoles);
  const parsed = customerSchema.parse(Object.fromEntries(formData));

  const customer = await prisma.customer.create({
    data: {
      ...parsed,
      email: parsed.email || undefined,
      customerCode: await nextCustomerCode(),
      branchId: user.branchId ?? (await prisma.branch.findFirstOrThrow()).id
    }
  });

  await writeAudit({ userId: user.id, action: "CREATE", entityType: "Customer", entityId: customer.id });
  revalidatePath("/customers");
  redirect(`/customers/${customer.id}`);
}

export async function deleteCustomer(formData: FormData) {
  const user = await requireUser(staffRoles);
  const id = String(formData.get("id"));
  await prisma.customer.delete({ where: { id } });
  await writeAudit({ userId: user.id, action: "DELETE", entityType: "Customer", entityId: id });
  revalidatePath("/customers");
}
