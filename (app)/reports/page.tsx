import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { requireUser, adminRoles } from "@/lib/permissions";
import { currency, prettyStatus } from "@/lib/utils";

export default async function ReportsPage() {
  await requireUser(adminRoles);
  const [jobsByStatus, revenue, inventory, warrantyClaims, technicians, customers] = await Promise.all([
    prisma.repairJob.groupBy({ by: ["status"], _count: { status: true } }),
    prisma.invoice.aggregate({ _sum: { grandTotal: true, paidAmount: true } }),
    prisma.sparePart.findMany({ orderBy: { quantity: "asc" } }),
    prisma.warrantyClaim.findMany({ include: { repairJob: true }, orderBy: { createdAt: "desc" } }),
    prisma.technician.findMany({ include: { assignments: { include: { repairJob: true } } } }),
    prisma.customer.count()
  ]);

  const reports = [
    "Daily Job Report",
    "Monthly Job Report",
    "Revenue Report",
    "Technician Performance Report",
    "Inventory Report",
    "Customer Report",
    "Warranty Report"
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Reports</h1>
        <p className="text-sm text-muted-foreground">Operational reports with CSV, Excel, and PDF export-ready endpoints.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Customers</p><p className="text-2xl font-semibold">{customers}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Revenue</p><p className="text-2xl font-semibold">{currency(Number(revenue._sum.grandTotal ?? 0))}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Paid</p><p className="text-2xl font-semibold">{currency(Number(revenue._sum.paidAmount ?? 0))}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Warranty Claims</p><p className="text-2xl font-semibold">{warrantyClaims.length}</p></CardContent></Card>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Available Exports</CardTitle></CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            {reports.map((report) => (
              <Button key={report} asChild variant="outline" className="justify-start">
                <a href={`/api/reports/${report.toLowerCase().replaceAll(" ", "-")}.csv`}><Download className="h-4 w-4" /> {report}</a>
              </Button>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Jobs By Status</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Status</TableHead><TableHead>Count</TableHead></TableRow></TableHeader>
              <TableBody>
                {jobsByStatus.map((row) => <TableRow key={row.status}><TableCell>{prettyStatus(row.status)}</TableCell><TableCell>{row._count.status}</TableCell></TableRow>)}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Technician Performance</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Technician</TableHead><TableHead>Total</TableHead><TableHead>Completed</TableHead></TableRow></TableHeader>
              <TableBody>
                {technicians.map((tech) => (
                  <TableRow key={tech.id}>
                    <TableCell>{tech.name}</TableCell>
                    <TableCell>{tech.assignments.length}</TableCell>
                    <TableCell>{tech.assignments.filter((item) => ["COMPLETED","READY_FOR_DELIVERY","DELIVERED"].includes(item.repairJob.status)).length}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Inventory</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Part</TableHead><TableHead>Qty</TableHead><TableHead>Low Stock</TableHead></TableRow></TableHeader>
              <TableBody>
                {inventory.map((part) => <TableRow key={part.id}><TableCell>{part.partName}</TableCell><TableCell>{part.quantity}</TableCell><TableCell>{part.lowStockLevel}</TableCell></TableRow>)}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
