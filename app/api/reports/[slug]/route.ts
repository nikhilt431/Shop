import { prisma } from "@/lib/prisma";
import { requireUser, adminRoles } from "@/lib/permissions";

function csv(rows: Array<Record<string, unknown>>) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const body = rows.map((row) => headers.map((header) => JSON.stringify(row[header] ?? "")).join(","));
  return [headers.join(","), ...body].join("\n");
}

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  await requireUser(adminRoles);
  const { slug } = await params;
  const jobs = await prisma.repairJob.findMany({ include: { customer: true, category: true, invoice: true } });
  const rows = jobs.map((job) => ({
    ticketNumber: job.ticketNumber,
    customer: job.customer.fullName,
    category: job.category.name,
    status: job.status,
    receivedDate: job.receivedDate.toISOString(),
    invoiceTotal: job.invoice?.grandTotal ?? ""
  }));

  return new Response(csv(rows), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${slug}.csv"`
    }
  });
}
