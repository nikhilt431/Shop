import { Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { requireUser, adminRoles } from "@/lib/permissions";

export default async function NotificationsPage() {
  await requireUser(adminRoles);
  const [templates, notifications] = await Promise.all([
    prisma.notificationTemplate.findMany({ orderBy: [{ eventKey: "asc" }, { channel: "asc" }] }),
    prisma.notification.findMany({ take: 20, orderBy: { createdAt: "desc" }, include: { customer: true, repairJob: true } })
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <p className="text-sm text-muted-foreground">Customizable SMS, WhatsApp, and email templates with delivery logs.</p>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Templates</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {templates.map((template) => (
              <form key={template.id} className="rounded-md border p-3">
                <div className="mb-2 grid gap-2 md:grid-cols-2">
                  <Input defaultValue={template.eventKey.replaceAll("_", " ")} readOnly />
                  <Input defaultValue={template.channel} readOnly />
                </div>
                <Textarea defaultValue={template.body} />
                <Button className="mt-2" variant="outline" disabled><Bell className="h-4 w-4" /> Save Template</Button>
              </form>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Notification Log</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Customer</TableHead><TableHead>Ticket</TableHead><TableHead>Channel</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {notifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell>{notification.customer.fullName}</TableCell>
                    <TableCell>{notification.repairJob?.ticketNumber || "N/A"}</TableCell>
                    <TableCell>{notification.channel}</TableCell>
                    <TableCell>{notification.status}</TableCell>
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
