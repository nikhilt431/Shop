import { endOfMonth, format, startOfDay, startOfMonth, subDays, subMonths } from "date-fns";
import { Activity, CheckCircle2, ClipboardList, DollarSign, PackageSearch, Users } from "lucide-react";
import { RepairStatus } from "@prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DailyRepairsChart, RevenueChart } from "@/components/dashboard/charts";
import { prisma } from "@/lib/prisma";
import { requireUser, staffRoles } from "@/lib/permissions";
import { currency, prettyStatus } from "@/lib/utils";

const inProgressStatuses: RepairStatus[] = [
  "INSPECTION_PENDING",
  "UNDER_INSPECTION",
  "WAITING_FOR_PARTS",
  "IN_REPAIR",
  "TESTING"
];

export default async function DashboardPage() {
  await requireUser(staffRoles);

  const today = startOfDay(new Date());
  const monthStart = startOfMonth(new Date());

  const [
    totalCustomers,
    totalJobs,
    jobsInProgress,
    completedJobs,
    revenueToday,
    revenueThisMonth,
    recentJobs,
    pendingDeliveries,
    lowStock
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.repairJob.count(),
    prisma.repairJob.count({ where: { status: { in: inProgressStatuses } } }),
    prisma.repairJob.count({ where: { status: { in: ["COMPLETED", "READY_FOR_DELIVERY", "DELIVERED"] } } }),
    prisma.invoice.aggregate({ _sum: { grandTotal: true }, where: { issuedAt: { gte: today }, paymentStatus: "PAID" } }),
    prisma.invoice.aggregate({ _sum: { grandTotal: true }, where: { issuedAt: { gte: monthStart }, paymentStatus: "PAID" } }),
    prisma.repairJob.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { customer: true, category: true, assignments: { include: { technician: true } } }
    }),
    prisma.repairJob.findMany({
      take: 6,
      where: { status: "READY_FOR_DELIVERY" },
      orderBy: { updatedAt: "desc" },
      include: { customer: true }
    }),
    prisma.sparePart.findMany({ orderBy: { quantity: "asc" } })
  ]);

  const dailyRepairs = await Promise.all(
    Array.from({ length: 7 }).map(async (_, index) => {
      const day = subDays(new Date(), 6 - index);
      const next = new Date(day);
      next.setDate(day.getDate() + 1);
      return {
        day: format(day, "EEE"),
        jobs: await prisma.repairJob.count({ where: { createdAt: { gte: startOfDay(day), lt: startOfDay(next) } } })
      };
    })
  );

  const monthlyRevenue = await Promise.all(
    Array.from({ length: 6 }).map(async (_, index) => {
      const month = subMonths(new Date(), 5 - index);
      const total = await prisma.invoice.aggregate({
        _sum: { grandTotal: true },
        where: { issuedAt: { gte: startOfMonth(month), lte: endOfMonth(month) }, paymentStatus: "PAID" }
      });
      return { month: format(month, "MMM"), revenue: Number(total._sum.grandTotal ?? 0) };
    })
  );

  const cards = [
    { label: "Total Customers", value: totalCustomers, icon: Users },
    { label: "Total Jobs", value: totalJobs, icon: ClipboardList },
    { label: "Jobs In Progress", value: jobsInProgress, icon: Activity },
    { label: "Completed Jobs", value: completedJobs, icon: CheckCircle2 },
    { label: "Revenue Today", value: currency(Number(revenueToday._sum.grandTotal ?? 0)), icon: DollarSign },
    { label: "Revenue This Month", value: currency(Number(revenueThisMonth._sum.grandTotal ?? 0)), icon: DollarSign }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Operational view of repair intake, revenue, workload, and stock risk.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="mt-1 text-2xl font-semibold">{card.value}</p>
              </div>
              <card.icon className="h-8 w-8 text-primary" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Daily Repairs</CardTitle>
            <CardDescription>New repair jobs over the last seven days</CardDescription>
          </CardHeader>
          <CardContent>
            <DailyRepairsChart data={dailyRepairs} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
            <CardDescription>Paid invoice totals for the last six months</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart data={monthlyRevenue} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Recent Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Technician</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.ticketNumber}</TableCell>
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

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Deliveries</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingDeliveries.map((job) => (
                <div key={job.id} className="rounded-md border p-3">
                  <div className="font-medium">{job.ticketNumber}</div>
                  <div className="text-sm text-muted-foreground">{job.customer.fullName}</div>
                </div>
              ))}
              {!pendingDeliveries.length ? <p className="text-sm text-muted-foreground">No products waiting for delivery.</p> : null}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><PackageSearch className="h-4 w-4" /> Low Stock Parts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {lowStock.filter((part) => part.quantity <= part.lowStockLevel).slice(0, 8).map((part) => (
                <div key={part.id} className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <div className="font-medium">{part.partName}</div>
                    <div className="text-sm text-muted-foreground">{part.sku}</div>
                  </div>
                  <Badge>{part.quantity} left</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
