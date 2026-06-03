import Link from "next/link";
import { Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { requireUser, staffRoles } from "@/lib/permissions";
import { deleteCustomer } from "@/app/(app)/customers/actions";

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireUser(staffRoles);
  const { q } = await searchParams;
  const customers = await prisma.customer.findMany({
    where: q
      ? {
          OR: [
            { fullName: { contains: q, mode: "insensitive" } },
            { mobileNumber: { contains: q } },
            { email: { contains: q, mode: "insensitive" } }
          ]
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { repairJobs: true } } }
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Customers</h1>
          <p className="text-sm text-muted-foreground">Add, search, edit, and view complete repair history.</p>
        </div>
        <Button asChild><Link href="/customers/new"><Plus className="h-4 w-4" /> Add Customer</Link></Button>
      </div>

      <Card>
        <CardHeader>
          <form className="relative max-w-lg">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input name="q" defaultValue={q} placeholder="Search by name, mobile, or email" className="pl-9" />
          </form>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Jobs</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium"><Link href={`/customers/${customer.id}`}>{customer.customerCode}</Link></TableCell>
                  <TableCell>{customer.fullName}</TableCell>
                  <TableCell>{customer.mobileNumber}</TableCell>
                  <TableCell>{customer.customerType.replaceAll("_", " ")}</TableCell>
                  <TableCell>{customer._count.repairJobs}</TableCell>
                  <TableCell>
                    <form action={deleteCustomer}>
                      <input type="hidden" name="id" value={customer.id} />
                      <Button size="icon" variant="ghost" title="Delete customer"><Trash2 className="h-4 w-4" /></Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
