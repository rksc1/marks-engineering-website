import PDFDocument from "pdfkit";

import { quoteStatusLabels } from "@/lib/quote-schema";
import type { QuoteRequestDocument, QuoteReplyDocument } from "@/lib/quotes";
import { siteConfig } from "@/lib/utils";

type QuoteWithReplies = QuoteRequestDocument & {
  replies?: QuoteReplyDocument[];
};

export function buildQuotationPdf(quote: QuoteWithReplies, amount?: string | number | null) {
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 48 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(22).text(siteConfig.name, { continued: false });
    doc.fontSize(10).fillColor("#52525b").text(siteConfig.email).text(siteConfig.phone).moveDown(2);

    doc.fillColor("#18181b").fontSize(18).text("Fabrication Quotation", { align: "right" });
    doc.fontSize(10).text(`Quote ID: ${quote.quoteId}`, { align: "right" });
    doc.text(`Date: ${new Date().toLocaleDateString("en-IN")}`, { align: "right" }).moveDown(2);

    section(doc, "Client Details");
    row(doc, "Name", quote.name);
    row(doc, "Email", quote.email);
    row(doc, "Phone", quote.phone || "-");
    row(doc, "Company", quote.company || "-");
    row(doc, "Site Location", quote.siteLocation || "-");
    doc.moveDown();

    section(doc, "Quote Details");
    row(doc, "Project", quote.title);
    row(doc, "Category", quote.category);
    row(doc, "Material", quote.materialType);
    row(doc, "Quantity", quote.quantity || "-");
    row(doc, "Deadline", quote.deadline ? quote.deadline.toLocaleDateString("en-IN") : "-");
    row(doc, "Status", quoteStatusLabels[quote.status as keyof typeof quoteStatusLabels]);
    doc.moveDown();

    section(doc, "Scope");
    doc.fontSize(11).fillColor("#18181b").text(quote.description, { lineGap: 4 }).moveDown();

    section(doc, "Commercials");
    row(doc, "Estimated Amount", amount ? formatCurrency(amount) : quote.budgetRange || "To be confirmed after review");
    row(doc, "Validity", "15 days from quotation date");
    doc.moveDown();

    section(doc, "Terms");
    ["Final pricing may vary after drawing/site verification.", "Taxes, transport, and installation are subject to final scope.", "Production starts after written approval and agreed advance payment."].forEach((term) => {
      doc.fontSize(10).fillColor("#18181b").text(`- ${term}`, { lineGap: 3 });
    });

    doc.end();
  });
}

function section(doc: PDFKit.PDFDocument, title: string) {
  doc.moveDown(0.5).fontSize(13).fillColor("#b91c1c").text(title).moveDown(0.4).fillColor("#18181b");
}

function row(doc: PDFKit.PDFDocument, label: string, value: string) {
  doc.fontSize(10).fillColor("#52525b").text(label, { continued: true, width: 130 });
  doc.fillColor("#18181b").text(`  ${value}`);
}

function formatCurrency(value: number | string) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return String(value);
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}
