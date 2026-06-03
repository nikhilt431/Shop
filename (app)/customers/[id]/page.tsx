import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { requireUser, staffRoles } from "@/lib/permissions";
import { prettyStatus } from "@/lib/utils";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser(staffRoles);
  const { id } = await params;
  const customer = await prisma.customer.findUniqueOrThrow({
    where: { id },
    include: { repairJobs: { orderBy: { createdAt: "desc" }, include: { category: true, invoice: true } } }
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{customer.fullName}</h1>
          <p className="text-sm text-muted-foreground">{customer.customerCode} · {customer.mobileNumber}</p>
        </div>
        <Button asChild><Link href={`/jobs/new?customerId=${customer.id}`}><Plus className="h-4 w-4" /> New Repair Ticket</Link></Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card>
          <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div><span className="text-muted-foreground">Email:</span> {customer.email || "Not set"}</div>
            <div><span className="text-muted-foreground">Alternate:</span> {customer.alternateNumber || "Not set"}</div>
            <div><span className="text-muted-foreground">Address:</span> {customer.address}</div>
            <div><span className="text-muted-foreground">Type:</span> {customer.customerType.replaceAll("_", " ")}</div>
            <div><span className="text-muted-foreground">Notes:</span> {customer.notes || "None"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Repair History</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Invoice</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.repairJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium"><Link href={`/jobs/${job.id}`}>{job.ticketNumber}</Link></TableCell>
                    <TableCell>{job.brand} {job.category.name}</TableCell>
                    <TableCell><Badge>{prettyStatus(job.status)}</Badge></TableCell>
                    <TableCell>{job.invoice ? <Link href={`/billing/${job.invoice.id}`}>{job.invoice.invoiceNumber}</Link> : "Not generated"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
