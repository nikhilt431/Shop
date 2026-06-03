import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createCategory } from "@/app/(app)/categories/actions";
import { prisma } from "@/lib/prisma";
import { requireUser, adminRoles } from "@/lib/permissions";

export default async function CategoriesPage() {
  await requireUser(adminRoles);
  const categories = await prisma.repairCategory.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { jobs: true } } } });
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Repair Categories</h1>
        <p className="text-sm text-muted-foreground">Create unlimited repair categories for intake and technician skills.</p>
      </div>
      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader><CardTitle>Add Category</CardTitle></CardHeader>
          <CardContent>
            <form action={createCategory} className="space-y-3">
              <div className="space-y-2"><Label>Name</Label><Input name="name" required /></div>
              <div className="space-y-2"><Label>Description</Label><Input name="description" /></div>
              <Button><Plus className="h-4 w-4" /> Save Category</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Categories</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Description</TableHead><TableHead>Jobs</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}><TableCell className="font-medium">{category.name}</TableCell><TableCell>{category.description || ""}</TableCell><TableCell>{category._count.jobs}</TableCell><TableCell>{category.isActive ? "Active" : "Inactive"}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
