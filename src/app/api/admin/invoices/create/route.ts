import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  generateInvoiceNumber,
  calculateLineItemTotals,
  calculateInvoiceTotals,
  convertAmountToWords,
  createInvoice,
  populateInvoiceTemplate,
  updateInvoiceFileUrl,
} from "@/lib/invoices";
import type { Invoice, InvoiceLineItem } from "@/lib/invoice-schema";
import path from "path";
import fs from "fs/promises";

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      customerId,
      quoteRequestId,
      poNumber,
      poDate,
      paymentTerms,
      lineItems: rawLineItems,
      billTo,
      shipTo,
    } = body;

    if (!customerId || !billTo || !rawLineItems || rawLineItems.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Process line items with calculations
    const lineItems: InvoiceLineItem[] = rawLineItems.map(
      (item: any, index: number) =>
        calculateLineItemTotals({
          srNo: index + 1,
          particulars: item.particulars,
          hsn: item.hsn,
          qty: item.qty,
          rate: item.rate,
          cgstRate: item.cgstRate || 9,
          sgstRate: item.sgstRate || 9,
          igstRate: item.igstRate || 0,
        })
    );

    const totals = calculateInvoiceTotals(lineItems);
    const invoiceNumber = await generateInvoiceNumber();
    const amountInWords = convertAmountToWords(totals.total);

    const invoiceData: Omit<Invoice, "_id" | "createdAt" | "updatedAt"> = {
      invoiceNumber,
      customerId,
      quoteRequestId,
      poNumber,
      poDate: poDate ? new Date(poDate) : undefined,
      invoiceDate: new Date(),
      paymentTerms,
      billTo,
      shipTo,
      lineItems,
      ...totals,
      amountInWords,
      status: "Generated",
      paidAmount: 0,
      balanceAmount: totals.total,
    };

    const invoiceId = await createInvoice(invoiceData);

    // Generate Excel file from template
    try {
      const templatePath = path.join(
        process.cwd(),
        "public/templates/Invoice.xltm"  // Using your .xltm template
      );

      // Check if template exists
      try {
        await fs.access(templatePath);
      } catch {
        return NextResponse.json(
          {
            invoiceId,
            warning:
              "Invoice created but template not found. Place Invoice.xltm at public/templates/",
          },
          { status: 201 }
        );
      }

      const invoice = {
        ...invoiceData,
        _id: invoiceId,
      } as Invoice;

      const fileBuffer = await populateInvoiceTemplate(invoice, templatePath);

      // Save to public folder
      const fileName = `${invoiceNumber}.xlsx`;
      const filePath = path.join(process.cwd(), "public/invoices", fileName);

      // Ensure directory exists
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, fileBuffer);

      // Update invoice with file URL
      await updateInvoiceFileUrl(invoiceId!, `/invoices/${fileName}`, fileName);

      return NextResponse.json(
        { invoiceId, fileUrl: `/invoices/${fileName}` },
        { status: 201 }
      );
    } catch (fileError) {
      console.error("File generation error:", fileError);
      return NextResponse.json(
        { invoiceId, warning: "Invoice created but file generation failed" },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Invoice creation error:", error);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}
