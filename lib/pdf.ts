import jsPDF from "jspdf";
import { currency } from "@/lib/utils";

export type InvoicePdfInput = {
  invoiceNumber: string;
  ticketNumber: string;
  customerName: string;
  customerMobile: string;
  laborCharges: number;
  sparePartsTotal: number;
  tax: number;
  discount: number;
  grandTotal: number;
};

export function buildInvoicePdf(invoice: InvoicePdfInput) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("Repair Invoice", 20, 22);
  doc.setFontSize(11);
  doc.text(`Invoice: ${invoice.invoiceNumber}`, 20, 36);
  doc.text(`Ticket: ${invoice.ticketNumber}`, 20, 44);
  doc.text(`Customer: ${invoice.customerName}`, 20, 58);
  doc.text(`Mobile: ${invoice.customerMobile}`, 20, 66);

  const rows = [
    ["Labor Charges", invoice.laborCharges],
    ["Spare Parts", invoice.sparePartsTotal],
    ["Tax", invoice.tax],
    ["Discount", -invoice.discount],
    ["Grand Total", invoice.grandTotal]
  ] as const;

  let y = 86;
  rows.forEach(([label, amount]) => {
    doc.text(label, 20, y);
    doc.text(currency(amount), 160, y, { align: "right" });
    y += 10;
  });

  doc.setFontSize(9);
  doc.text("Thank you for choosing our repair service.", 20, 136);
  return doc;
}
