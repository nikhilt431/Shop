import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { requireUser, backOfficeRoles } from "@/lib/permissions";
import { prettyStatus } from "@/lib/utils";

export default async function JobsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const user = await requireUser(backOfficeRoles);
  const { q, status } = await searchParams;
  const technician = user.role === "TECHNICIAN" ? await prisma.technician.findUnique({ where: { userId: user.id } }) : null;
  const jobs = await prisma.repairJob.findMany({
    where: {
      ...(status ? { status: status as never } : {}),
      ...(technician ? { assignments: { some: { technicianId: technician.id } } } : {}),
      ...(q
        ? {
            OR: [
              { ticketNumber: { contains: q, mode: "insensitive" } },
              { serialNumber: { contains: q, mode: "insensitive" } },
              { brand: { contains: q, mode: "insensitive" } },
              { customer: { fullName: { contains: q, mode: "insensitive" } } },
              { customer: { mobileNumber: { contains: q } } },
              { assignments: { some: { technician: { name: { contains: q, mode: "insensitive" } } } } }
            ]
          }
        : {})
    },
    orderBy: { createdAt: "desc" },
    include: { customer: true, category: true, assignments: { include: { technician: true } } }
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Repair Jobs</h1>
          <p className="text-sm text-muted-foreground">Track every product from intake to delivery.</p>
        </div>
        {user.role !== "TECHNICIAN" ? <Button asChild><Link href="/jobs/new"><Plus className="h-4 w-4" /> New Ticket</Link></Button> : null}
      </div>
      <Card>
        <CardHeader>
          <form className="grid gap-3 md:grid-cols-[1fr_220px]">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input name="q" defaultValue={q} placeholder="Search customer, ticket, serial, technician" className="pl-9" />
            </div>
            <select name="status" defaultValue={status} className="h-10 rounded-md border bg-background px-3 text-sm">
              <option value="">All statuses</option>
              {["RECEIVED","INSPECTION_PENDING","UNDER_INSPECTION","WAITING_FOR_PARTS","IN_REPAIR","TESTING","COMPLETED","READY_FOR_DELIVERY","DELIVERED","CANCELLED"].map((item) => (
                <option key={item} value={item}>{prettyStatus(item)}</option>
              ))}
            </select>
          </form>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Technicians</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium"><Link href={`/jobs/${job.id}`}>{job.ticketNumber}</Link></TableCell>
                  <TableCell>{job.customer.fullName}</TableCell>
                  <TableCell>{job.brand} {job.category.name}</TableCell>
                  <TableCell>{job.assignments.map((assignment) => assignment.technician.name).join(", ") || "Unassigned"}</TableCell>
                  <TableCell><Badge>{prettyStatus(job.status)}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
