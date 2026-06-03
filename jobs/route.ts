import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, backOfficeRoles } from "@/lib/permissions";

export async function GET(request: Request) {
  await requireUser(backOfficeRoles);
  const searchParams = new URL(request.url).searchParams;
  const q = searchParams.get("q");
  const status = searchParams.get("status");
  const jobs = await prisma.repairJob.findMany({
    where: {
      ...(status ? { status: status as never } : {}),
      ...(q
        ? {
            OR: [
              { ticketNumber: { contains: q, mode: "insensitive" } },
              { serialNumber: { contains: q, mode: "insensitive" } },
              { customer: { fullName: { contains: q, mode: "insensitive" } } }
            ]
          }
        : {})
    },
    include: { customer: true, category: true, assignments: { include: { technician: true } } },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(jobs);
}
