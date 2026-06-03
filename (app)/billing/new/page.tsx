import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createInvoice } from "@/app/(app)/billing/actions";
import { prisma } from "@/lib/prisma";
import { requireUser, staffRoles } from "@/lib/permissions";
import { currency } from "@/lib/utils";

export default async function NewInvoicePage({ searchParams }: { searchParams: Promise<{ jobId?: string }> }) {
  await requireUser(staffRoles);
  const { jobId } = await searchParams;
  const job = jobId
    ? await prisma.repairJob.findUniqueOrThrow({ where: { id: jobId }, include: { customer: true, partsUsed: { include: { sparePart: true } } } })
    : null;
  const jobs = job ? [] : await prisma.repairJob.findMany({ where: { invoice: null }, include: { customer: true }, orderBy: { createdAt: "desc" } });
  const partsTotal = job?.partsUsed.reduce((sum, usage) => sum + Number(usage.unitPrice) * usage.quantity, 0) ?? 0;

  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Create Invoice</h1>
        <p className="text-sm text-muted-foreground">Labor charges combine with spare parts, tax, and discounts.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Invoice Details</CardTitle></CardHeader>
        <CardContent>
          <form action={createInvoice} className="grid gap-4 md:grid-cols-2">
            {job ? (
              <input type="hidden" name="repairJobId" value={job.id} />
            ) : (
              <div className="space-y-2 md:col-span-2">
                <Label>Repair Job</Label>
                <select name="repairJobId" required className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                  <option value="">Select job</option>
                  {jobs.map((item) => <option key={item.id} value={item.id}>{item.ticketNumber} · {item.customer.fullName}</option>)}
                </select>
              </div>
            )}
            {job ? <div className="md:col-span-2 rounded-md border p-3 text-sm">{job.ticketNumber} · {job.customer.fullName} · Parts: {currency(partsTotal)}</div> : null}
            <div className="space-y-2"><Label>Labor Charges</Label><Input name="laborCharges" type="number" step="0.01" min="0" required /></div>
            <div className="space-y-2"><Label>Tax</Label><Input name="tax" type="number" step="0.01" min="0" defaultValue="0" /></div>
            <div className="space-y-2"><Label>Discount</Label><Input name="discount" type="number" step="0.01" min="0" defaultValue="0" /></div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <select name="paymentMethod" className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                <option value="">Select method</option>
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="MOBILE_PAYMENT">Mobile Payment</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Payment Status</Label>
              <select name="paymentStatus" defaultValue="UNPAID" className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                <option value="UNPAID">Unpaid</option>
                <option value="PARTIALLY_PAID">Partially Paid</option>
                <option value="PAID">Paid</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>
            <div className="md:col-span-2"><Button><CreditCard className="h-4 w-4" /> Generate Invoice</Button></div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
