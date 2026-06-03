import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/permissions";
import { prettyStatus } from "@/lib/utils";

export default async function CustomerPortalPage() {
  const user = await requireUser(["CUSTOMER"]);
  const customer = await prisma.customer.findUniqueOrThrow({
    where: { userId: user.id },
    include: {
      repairJobs: {
        orderBy: { createdAt: "desc" },
        include: { category: true, invoice: true, photos: true, statusHistory: { orderBy: { createdAt: "desc" } } }
      }
    }
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">My Repairs</h1>
        <p className="text-sm text-muted-foreground">Track repair status, history, invoices, warranty, and repair photos.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>{customer.fullName}</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Ticket</TableHead><TableHead>Product</TableHead><TableHead>Status</TableHead><TableHead>Updated</TableHead><TableHead>Invoice</TableHead></TableRow></TableHeader>
            <TableBody>
              {customer.repairJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.ticketNumber}</TableCell>
                  <TableCell>{job.brand} {job.category.name}</TableCell>
                  <TableCell><Badge>{prettyStatus(job.status)}</Badge></TableCell>
                  <TableCell>{job.statusHistory[0] ? format(job.statusHistory[0].createdAt, "PPp") : "N/A"}</TableCell>
                  <TableCell>{job.invoice ? <Button asChild variant="outline" size="sm"><Link href={`/api/invoices/${job.invoice.id}/pdf`}>Download</Link></Button> : "Pending"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
