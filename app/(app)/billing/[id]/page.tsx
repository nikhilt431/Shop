import { format } from "date-fns";
import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { requireUser, staffRoles } from "@/lib/permissions";
import { currency } from "@/lib/utils";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser(staffRoles);
  const { id } = await params;
  const invoice = await prisma.invoice.findUniqueOrThrow({
    where: { id },
    include: { customer: true, repairJob: { include: { category: true, partsUsed: { include: { sparePart: true } } } }, branch: true }
  });

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="no-print flex justify-end gap-2">
        <Button variant="outline"><Printer className="h-4 w-4" /> Print</Button>
        <Button asChild><a href={`/api/invoices/${invoice.id}/pdf`}><Download className="h-4 w-4" /> PDF</a></Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>Invoice {invoice.invoiceNumber}</span>
            <span className="text-sm font-normal">{format(invoice.issuedAt, "PP")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-semibold">{invoice.branch.name}</h3>
              <p className="text-sm text-muted-foreground">{invoice.branch.address}</p>
              <p className="text-sm text-muted-foreground">{invoice.branch.phone}</p>
            </div>
            <div className="md:text-right">
              <h3 className="font-semibold">{invoice.customer.fullName}</h3>
              <p className="text-sm text-muted-foreground">{invoice.customer.mobileNumber}</p>
              <p className="text-sm text-muted-foreground">{invoice.customer.address}</p>
            </div>
          </div>
          <Table>
            <TableHeader><TableRow><TableHead>Description</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
            <TableBody>
              <TableRow><TableCell>Labor charges for {invoice.repairJob.ticketNumber}</TableCell><TableCell className="text-right">{currency(Number(invoice.laborCharges))}</TableCell></TableRow>
              {invoice.repairJob.partsUsed.map((usage) => (
                <TableRow key={usage.id}><TableCell>{usage.sparePart.partName} x {usage.quantity}</TableCell><TableCell className="text-right">{currency(Number(usage.unitPrice) * usage.quantity)}</TableCell></TableRow>
              ))}
              <TableRow><TableCell>Tax</TableCell><TableCell className="text-right">{currency(Number(invoice.tax))}</TableCell></TableRow>
              <TableRow><TableCell>Discount</TableCell><TableCell className="text-right">-{currency(Number(invoice.discount))}</TableCell></TableRow>
              <TableRow><TableCell className="font-semibold">Grand Total</TableCell><TableCell className="text-right font-semibold">{currency(Number(invoice.grandTotal))}</TableCell></TableRow>
            </TableBody>
          </Table>
          <p className="text-sm text-muted-foreground">Payment: {invoice.paymentStatus.replaceAll("_", " ")} {invoice.paymentMethod ? `via ${invoice.paymentMethod.replaceAll("_", " ")}` : ""}</p>
        </CardContent>
      </Card>
    </div>
  );
}
