import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveSettings } from "@/app/(app)/settings/actions";
import { prisma } from "@/lib/prisma";
import { requireUser, adminRoles } from "@/lib/permissions";

export default async function SettingsPage() {
  await requireUser(adminRoles);
  const setting = await prisma.systemSetting.findUnique({ where: { key: "shop" } });
  const value = (setting?.value ?? {}) as { taxRate?: number; defaultWarrantyDays?: number; receiptFooter?: string };
  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">System Settings</h1>
        <p className="text-sm text-muted-foreground">Configure tax, warranty defaults, receipt wording, and operational preferences.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Shop Defaults</CardTitle></CardHeader>
        <CardContent>
          <form action={saveSettings} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2"><Label>Tax Rate</Label><Input name="taxRate" type="number" step="0.01" defaultValue={value.taxRate ?? 0} /></div>
            <div className="space-y-2"><Label>Default Warranty Days</Label><Input name="defaultWarrantyDays" type="number" defaultValue={value.defaultWarrantyDays ?? 90} /></div>
            <div className="space-y-2 md:col-span-2"><Label>Receipt Footer</Label><Textarea name="receiptFooter" defaultValue={value.receiptFooter ?? "Keep this receipt for delivery and warranty support."} /></div>
            <div className="md:col-span-2"><Button><Save className="h-4 w-4" /> Save Settings</Button></div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
