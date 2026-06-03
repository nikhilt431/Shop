import { Save } from "lucide-react";
import { Customer, RepairCategory, Technician } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createRepairJob } from "@/app/(app)/jobs/actions";

export function JobForm({
  customers,
  categories,
  technicians,
  defaultCustomerId
}: {
  customers: Customer[];
  categories: RepairCategory[];
  technicians: Technician[];
  defaultCustomerId?: string;
}) {
  return (
    <form action={createRepairJob} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="customerId">Customer</Label>
        <select id="customerId" name="customerId" defaultValue={defaultCustomerId} required className="h-10 w-full rounded-md border bg-background px-3 text-sm">
          <option value="">Select customer</option>
          {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.fullName} · {customer.mobileNumber}</option>)}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="categoryId">Product Category</Label>
        <select id="categoryId" name="categoryId" required className="h-10 w-full rounded-md border bg-background px-3 text-sm">
          <option value="">Select category</option>
          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
      </div>
      <div className="space-y-2"><Label htmlFor="brand">Brand</Label><Input id="brand" name="brand" required /></div>
      <div className="space-y-2"><Label htmlFor="modelNumber">Model Number</Label><Input id="modelNumber" name="modelNumber" /></div>
      <div className="space-y-2"><Label htmlFor="serialNumber">Serial Number</Label><Input id="serialNumber" name="serialNumber" /></div>
      <div className="space-y-2"><Label htmlFor="productColor">Product Color</Label><Input id="productColor" name="productColor" /></div>
      <div className="space-y-2 md:col-span-2"><Label htmlFor="productCondition">Product Condition</Label><Textarea id="productCondition" name="productCondition" required /></div>
      <div className="space-y-2 md:col-span-2"><Label htmlFor="accessoriesReceived">Accessories Received</Label><Input id="accessoriesReceived" name="accessoriesReceived" placeholder="Remote, charger, power cable" /></div>
      <div className="space-y-2 md:col-span-2"><Label htmlFor="problemDescription">Problem Description</Label><Textarea id="problemDescription" name="problemDescription" required /></div>
      <div className="space-y-2"><Label htmlFor="expectedDeliveryDate">Expected Delivery</Label><Input id="expectedDeliveryDate" name="expectedDeliveryDate" type="date" /></div>
      <div className="space-y-2"><Label htmlFor="warrantyPeriodDays">Repair Warranty Days</Label><Input id="warrantyPeriodDays" name="warrantyPeriodDays" type="number" min="1" /></div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="technicianIds">Assign Technicians</Label>
        <select id="technicianIds" name="technicianIds" multiple className="min-h-28 w-full rounded-md border bg-background px-3 py-2 text-sm">
          {technicians.map((technician) => <option key={technician.id} value={technician.id}>{technician.name}</option>)}
        </select>
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="photos">Intake Photos</Label>
        <Input id="photos" name="photos" type="file" multiple accept="image/*" />
        <p className="text-xs text-muted-foreground">API storage support is included; this form keeps drafts lightweight until storage credentials are configured.</p>
      </div>
      <div className="md:col-span-2"><Button><Save className="h-4 w-4" /> Create Ticket</Button></div>
    </form>
  );
}
