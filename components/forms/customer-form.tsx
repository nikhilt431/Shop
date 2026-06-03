import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createCustomer } from "@/app/(app)/customers/actions";

export function CustomerForm() {
  return (
    <form action={createCustomer} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input id="fullName" name="fullName" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="mobileNumber">Mobile Number</Label>
        <Input id="mobileNumber" name="mobileNumber" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="alternateNumber">Alternate Number</Label>
        <Input id="alternateNumber" name="alternateNumber" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" name="address" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="customerType">Customer Type</Label>
        <select id="customerType" name="customerType" className="h-10 w-full rounded-md border bg-background px-3 text-sm">
          <option value="WALK_IN">Walk-in</option>
          <option value="RESIDENTIAL">Residential</option>
          <option value="BUSINESS">Business</option>
          <option value="WARRANTY">Warranty</option>
        </select>
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" />
      </div>
      <div className="md:col-span-2">
        <Button><Save className="h-4 w-4" /> Save Customer</Button>
      </div>
    </form>
  );
}
