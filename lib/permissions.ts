import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { auth } from "@/lib/auth";

export async function requireUser(allowedRoles?: Role[]) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    redirect("/unauthorized");
  }

  return session.user;
}

export const adminRoles: Role[] = ["SUPER_ADMIN"];
export const staffRoles: Role[] = ["SUPER_ADMIN", "RECEPTION"];
export const backOfficeRoles: Role[] = ["SUPER_ADMIN", "RECEPTION", "TECHNICIAN"];
