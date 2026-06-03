import { PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createPart } from "@/app/(app)/inventory/actions";
import { prisma } from "@/lib/prisma";
import { requireUser, backOfficeRoles } from "@/lib/permissions";
import { currency } from "@/lib/utils";

export default async function InventoryPage() {
  await requireUser(backOfficeRoles);
  const parts = await prisma.sparePart.findMany({ orderBy: { partName: "asc" } });
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Spare Parts Inventory</h1>
        <p className="text-sm text-muted-foreground">Stock in, stock out, low stock alerts, and technician consumption.</p>
      </div>
      <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
        <Card>
          <CardHeader><CardTitle>Add Part</CardTitle></CardHeader>
          <CardContent>
            <form action={createPart} className="space-y-3">
              <div className="space-y-2"><Label>Part Name</Label><Input name="partName" required /></div>
              <div className="space-y-2"><Label>SKU</Label><Input name="sku" required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Quantity</Label><Input name="quantity" type="number" min="0" required /></div>
                <div className="space-y-2"><Label>Low Stock</Label><Input name="lowStockLevel" type="number" min="0" defaultValue="5" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Purchase Cost</Label><Input name="purchaseCost" type="number" min="0" step="0.01" required /></div>
                <div className="space-y-2"><Label>Selling Price</Label><Input name="sellingPrice" type="number" min="0" step="0.01" required /></div>
              </div>
              <div className="space-y-2"><Label>Supplier</Label><Input name="supplier" /></div>
              <Button><PackagePlus className="h-4 w-4" /> Save Part</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Inventory Report</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Part</TableHead><TableHead>SKU</TableHead><TableHead>Qty</TableHead><TableHead>Cost</TableHead><TableHead>Price</TableHead><TableHead>Supplier</TableHead></TableRow></TableHeader>
              <TableBody>
                {parts.map((part) => (
                  <TableRow key={part.id}>
                    <TableCell className="font-medium">{part.partName}</TableCell>
                    <TableCell>{part.sku}</TableCell>
                    <TableCell>{part.quantity <= part.lowStockLevel ? <Badge>{part.quantity} low</Badge> : part.quantity}</TableCell>
                    <TableCell>{currency(Number(part.purchaseCost))}</TableCell>
                    <TableCell>{currency(Number(part.sellingPrice))}</TableCell>
                    <TableCell>{part.supplier || "N/A"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
