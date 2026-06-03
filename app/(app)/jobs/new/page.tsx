import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JobForm } from "@/components/forms/job-form";
import { prisma } from "@/lib/prisma";
import { requireUser, staffRoles } from "@/lib/permissions";

export default async function NewJobPage({ searchParams }: { searchParams: Promise<{ customerId?: string }> }) {
  await requireUser(staffRoles);
  const [{ customerId }, customers, categories, technicians] = await Promise.all([
    searchParams,
    prisma.customer.findMany({ orderBy: { fullName: "asc" } }),
    prisma.repairCategory.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.technician.findMany({ where: { status: "ACTIVE" }, orderBy: { name: "asc" } })
  ]);

  return (
    <div className="max-w-5xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Product Intake</h1>
        <p className="text-sm text-muted-foreground">Capture product details, problem description, photos, delivery date, and technician assignment.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Repair Ticket</CardTitle></CardHeader>
        <CardContent><JobForm customers={customers} categories={categories} technicians={technicians} defaultCustomerId={customerId} /></CardContent>
      </Card>
    </div>
  );
}
