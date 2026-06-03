import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerForm } from "@/components/forms/customer-form";
import { requireUser, staffRoles } from "@/lib/permissions";

export default async function NewCustomerPage() {
  await requireUser(staffRoles);
  return (
    <div className="max-w-4xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Add Customer</h1>
        <p className="text-sm text-muted-foreground">Create a customer record before receiving products for repair.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Customer Information</CardTitle></CardHeader>
        <CardContent><CustomerForm /></CardContent>
      </Card>
    </div>
  );
}
