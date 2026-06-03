import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, staffRoles } from "@/lib/permissions";
import { customerSchema } from "@/lib/validators";

export async function GET(request: Request) {
  await requireUser(staffRoles);
  const q = new URL(request.url).searchParams.get("q");
  const customers = await prisma.customer.findMany({
    where: q
      ? { OR: [{ fullName: { contains: q, mode: "insensitive" } }, { mobileNumber: { contains: q } }] }
      : undefined,
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(customers);
}

export async function POST(request: Request) {
  const user = await requireUser(staffRoles);
  const parsed = customerSchema.parse(await request.json());
  const count = await prisma.customer.count();
  const customer = await prisma.customer.create({
    data: {
      ...parsed,
      email: parsed.email || undefined,
      customerCode: `CUS-${String(count + 1).padStart(4, "0")}`,
      branchId: user.branchId ?? (await prisma.branch.findFirstOrThrow()).id
    }
  });
  return NextResponse.json(customer, { status: 201 });
}
