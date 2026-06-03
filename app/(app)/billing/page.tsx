import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { requireUser, staffRoles } from "@/lib/permissions";
import { currency } from "@/lib/utils";

export default async function BillingPage() {
  await requireUser(staffRoles);
  const invoices = await prisma.invoice.findMany({
    orderBy: { issuedAt: "desc" },
    include: { customer: true, repairJob: true }
  });
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Billing</h1>
        <p className="text-sm text-muted-foreground">Invoices, payments, tax, discounts, and printable PDFs.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Invoices</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Invoice</TableHead><TableHead>Ticket</TableHead><TableHead>Customer</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium"><Link href={`/billing/${invoice.id}`}>{invoice.invoiceNumber}</Link></TableCell>
                  <TableCell>{invoice.repairJob.ticketNumber}</TableCell>
                  <TableCell>{invoice.customer.fullName}</TableCell>
                  <TableCell>{currency(Number(invoice.grandTotal))}</TableCell>
                  <TableCell><Badge>{invoice.paymentStatus.replaceAll("_", " ")}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
