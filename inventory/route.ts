import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, backOfficeRoles } from "@/lib/permissions";
import { inventorySchema } from "@/lib/validators";

export async function GET() {
  await requireUser(backOfficeRoles);
  const parts = await prisma.sparePart.findMany({ orderBy: { partName: "asc" } });
  return NextResponse.json(parts);
}

export async function POST(request: Request) {
  const user = await requireUser(backOfficeRoles);
  const parsed = inventorySchema.parse(await request.json());
  const part = await prisma.sparePart.create({
    data: {
      ...parsed,
      branchId: user.branchId ?? (await prisma.branch.findFirstOrThrow()).id
    }
  });
  return NextResponse.json(part, { status: 201 });
}
