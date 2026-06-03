import { CheckCircle2, Clock, Plus, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createTechnician } from "@/app/(app)/technicians/actions";
import { prisma } from "@/lib/prisma";
import { requireUser, adminRoles } from "@/lib/permissions";

export default async function TechniciansPage() {
  await requireUser(adminRoles);
  const [technicians, categories] = await Promise.all([
    prisma.technician.findMany({
      orderBy: { name: "asc" },
      include: {
        skillCategory: true,
        assignments: { include: { repairJob: true } }
      }
    }),
    prisma.repairCategory.findMany({ orderBy: { name: "asc" } })
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Technicians</h1>
        <p className="text-sm text-muted-foreground">Manage skills, workload, and completion performance.</p>
      </div>
      <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Plus className="h-4 w-4" /> Add Technician</CardTitle></CardHeader>
          <CardContent>
            <form action={createTechnician} className="space-y-3">
              <div className="space-y-2"><Label>Name</Label><Input name="name" required /></div>
              <div className="space-y-2"><Label>Mobile Number</Label><Input name="mobileNumber" required /></div>
              <div className="space-y-2"><Label>Address</Label><Input name="address" required /></div>
              <div className="space-y-2">
                <Label>Skill Category</Label>
                <select name="skillCategoryId" className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                  <option value="">General</option>
                  {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
              </div>
              <div className="space-y-2"><Label>Experience</Label><Input name="experience" required /></div>
              <Button><Wrench className="h-4 w-4" /> Save Technician</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Performance Dashboard</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Skill</TableHead><TableHead>Active Jobs</TableHead><TableHead>Completed</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {technicians.map((technician) => {
                  const active = technician.assignments.filter((assignment) => !["COMPLETED","READY_FOR_DELIVERY","DELIVERED","CANCELLED"].includes(assignment.repairJob.status)).length;
                  const completed = technician.assignments.filter((assignment) => ["COMPLETED","READY_FOR_DELIVERY","DELIVERED"].includes(assignment.repairJob.status)).length;
                  return (
                    <TableRow key={technician.id}>
                      <TableCell className="font-medium">{technician.name}</TableCell>
                      <TableCell>{technician.skillCategory?.name || "General"}</TableCell>
                      <TableCell><Clock className="mr-1 inline h-4 w-4" /> {active}</TableCell>
                      <TableCell><CheckCircle2 className="mr-1 inline h-4 w-4" /> {completed}</TableCell>
                      <TableCell>{technician.status.replaceAll("_", " ")}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
