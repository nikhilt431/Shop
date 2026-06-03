import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/permissions";
import { buildInvoicePdf } from "@/lib/pdf";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireUser(["SUPER_ADMIN", "RECEPTION", "CUSTOMER"]);
  const { id } = await params;
  const invoice = await prisma.invoice.findUniqueOrThrow({
    where: { id },
    include: { customer: true, repairJob: true }
  });
  const doc = buildInvoicePdf({
    invoiceNumber: invoice.invoiceNumber,
    ticketNumber: invoice.repairJob.ticketNumber,
    customerName: invoice.customer.fullName,
    customerMobile: invoice.customer.mobileNumber,
    laborCharges: Number(invoice.laborCharges),
    sparePartsTotal: Number(invoice.sparePartsTotal),
    tax: Number(invoice.tax),
    discount: Number(invoice.discount),
    grandTotal: Number(invoice.grandTotal)
  });
  const bytes = Buffer.from(doc.output("arraybuffer"));
  return new Response(bytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.pdf"`
    }
  });
}
