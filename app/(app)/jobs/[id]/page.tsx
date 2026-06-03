import Link from "next/link";
import { format } from "date-fns";
import { FileText, Printer, Save, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { addRepairNote, consumeSparePart, updateJobStatus } from "@/app/(app)/jobs/actions";
import { prisma } from "@/lib/prisma";
import { requireUser, backOfficeRoles } from "@/lib/permissions";
import { currency, prettyStatus } from "@/lib/utils";

const statuses = [
  "RECEIVED",
  "INSPECTION_PENDING",
  "UNDER_INSPECTION",
  "WAITING_FOR_PARTS",
  "IN_REPAIR",
  "TESTING",
  "COMPLETED",
  "READY_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED"
];

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser(backOfficeRoles);
  const { id } = await params;
  const [job, parts] = await Promise.all([
    prisma.repairJob.findUniqueOrThrow({
      where: { id },
      include: {
        customer: true,
        category: true,
        assignments: { include: { technician: true } },
        statusHistory: { orderBy: { createdAt: "desc" } },
        notes: { orderBy: { createdAt: "desc" }, include: { technician: true } },
        partsUsed: { include: { sparePart: true }, orderBy: { createdAt: "desc" } },
        photos: { orderBy: { createdAt: "desc" } },
        invoice: true
      }
    }),
    prisma.sparePart.findMany({ where: { quantity: { gt: 0 } }, orderBy: { partName: "asc" } })
  ]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{job.ticketNumber}</h1>
          <p className="text-sm text-muted-foreground">{job.customer.fullName} · {job.brand} {job.category.name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" type="button"><Printer className="h-4 w-4" /> Print Receipt</Button>
          {job.invoice ? (
            <Button asChild><Link href={`/billing/${job.invoice.id}`}><FileText className="h-4 w-4" /> Invoice</Link></Button>
          ) : (
            <Button asChild><Link href={`/billing/new?jobId=${job.id}`}><FileText className="h-4 w-4" /> Create Invoice</Link></Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Repair Summary</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div><p className="text-sm text-muted-foreground">Status</p><Badge className="mt-1">{prettyStatus(job.status)}</Badge></div>
              <div><p className="text-sm text-muted-foreground">Received</p><p>{format(job.receivedDate, "PPp")}</p></div>
              <div><p className="text-sm text-muted-foreground">Expected Delivery</p><p>{job.expectedDeliveryDate ? format(job.expectedDeliveryDate, "PP") : "Not set"}</p></div>
              <div><p className="text-sm text-muted-foreground">Technicians</p><p>{job.assignments.map((assignment) => assignment.technician.name).join(", ") || "Unassigned"}</p></div>
              <div><p className="text-sm text-muted-foreground">Model / Serial</p><p>{job.modelNumber || "N/A"} · {job.serialNumber || "N/A"}</p></div>
              <div><p className="text-sm text-muted-foreground">Warranty</p><p>{job.warrantyPeriodDays ? `${job.warrantyPeriodDays} days` : "No warranty set"}</p></div>
              <div className="md:col-span-2"><p className="text-sm text-muted-foreground">Problem</p><p>{job.problemDescription}</p></div>
              <div className="md:col-span-2"><p className="text-sm text-muted-foreground">Condition and Accessories</p><p>{job.productCondition} {job.accessoriesReceived ? `· ${job.accessoriesReceived}` : ""}</p></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Repair Notes</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <form action={addRepairNote} className="grid gap-3">
                <input type="hidden" name="jobId" value={job.id} />
                <div className="grid gap-3 md:grid-cols-[220px_1fr]">
                  <select name="type" className="h-10 rounded-md border bg-background px-3 text-sm">
                    <option value="INSPECTION">Inspection Notes</option>
                    <option value="REPAIR">Repair Notes</option>
                    <option value="TESTING">Testing Notes</option>
                    <option value="CUSTOMER_COMMUNICATION">Customer Communication</option>
                    <option value="INTERNAL">Internal</option>
                  </select>
                  <Textarea name="note" placeholder="Add repair notes, test results, or customer updates" required />
                </div>
                <Button className="w-fit"><Save className="h-4 w-4" /> Add Note</Button>
              </form>
              {job.notes.map((note) => (
                <div key={note.id} className="rounded-md border p-3">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <Badge>{prettyStatus(note.type)}</Badge>
                    <span className="text-muted-foreground">{format(note.createdAt, "PPp")}</span>
                    {note.technician ? <span>{note.technician.name}</span> : null}
                  </div>
                  <p className="mt-2 text-sm">{note.note}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Used Spare Parts</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <form action={consumeSparePart} className="grid gap-3 md:grid-cols-[1fr_120px_auto]">
                <input type="hidden" name="repairJobId" value={job.id} />
                <select name="sparePartId" className="h-10 rounded-md border bg-background px-3 text-sm" required>
                  <option value="">Select spare part</option>
                  {parts.map((part) => <option key={part.id} value={part.id}>{part.partName} · {part.quantity} in stock</option>)}
                </select>
                <Input name="quantity" type="number" min="1" defaultValue="1" />
                <Button><Wrench className="h-4 w-4" /> Use Part</Button>
              </form>
              <Table>
                <TableHeader><TableRow><TableHead>Part</TableHead><TableHead>Qty</TableHead><TableHead>Total</TableHead></TableRow></TableHeader>
                <TableBody>
                  {job.partsUsed.map((usage) => (
                    <TableRow key={usage.id}>
                      <TableCell>{usage.sparePart.partName}</TableCell>
                      <TableCell>{usage.quantity}</TableCell>
                      <TableCell>{currency(Number(usage.unitPrice) * usage.quantity)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Update Status</CardTitle></CardHeader>
            <CardContent>
              <form action={updateJobStatus} className="space-y-3">
                <input type="hidden" name="jobId" value={job.id} />
                <Label htmlFor="status">Repair Status</Label>
                <select id="status" name="status" defaultValue={job.status} className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                  {statuses.map((status) => <option key={status} value={status}>{prettyStatus(status)}</option>)}
                </select>
                <Textarea name="notes" placeholder="Optional status note" />
                <Button className="w-full">Update Status</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Repair Timeline</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {job.statusHistory.map((event) => (
                <div key={event.id} className="border-l-2 border-primary pl-3">
                  <div className="font-medium">{prettyStatus(event.status)}</div>
                  <div className="text-xs text-muted-foreground">{format(event.createdAt, "PPp")}</div>
                  {event.notes ? <p className="mt-1 text-sm">{event.notes}</p> : null}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Photos</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {job.photos.map((photo) => (
                <div key={photo.id} className="aspect-square rounded-md border bg-muted p-2 text-xs">{prettyStatus(photo.type)}<br />{photo.caption}</div>
              ))}
              {!job.photos.length ? <p className="col-span-2 text-sm text-muted-foreground">No repair photos uploaded yet.</p> : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
