import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import type { Invoice, InvoiceLineItem } from "@/lib/invoice-schema";
import * as ExcelJS from "exceljs";
import path from "path";
import fs from "fs/promises";

export async function generateInvoiceNumber(): Promise<string> {
  const db = await getDb();
  const invoices = await db
    .collection<Invoice>("invoices")
    .find({})
    .sort({ createdAt: -1 })
    .limit(1)
    .toArray();

  const year = new Date().getFullYear();
  let number = 1;

  if (invoices.length > 0) {
    const lastInvoice = invoices[0];
    // Parse format: MEC-2026-27-01 (MEC-YYYY-MM-sequence)
    const match = lastInvoice.invoiceNumber.match(/MEC-(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const lastYear = parseInt(match[1]);
      const lastMonth = parseInt(match[2]);
      const lastSeq = parseInt(match[3]);
      
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, "0");
      
      if (lastYear === currentYear && lastMonth === parseInt(currentMonth)) {
        number = lastSeq + 1;
      }
    }
  }

  const currentDate = new Date();
  const year_str = currentDate.getFullYear();
  const month_str = (currentDate.getMonth() + 1).toString().padStart(2, "0");

  return `MEC-${year_str}-${month_str}-${String(number).padStart(2, "0")}`;
}

export function calculateLineItemTotals(
  item: Omit<InvoiceLineItem, "taxableValue" | "amount" | "cgst" | "sgst" | "igst">,
): InvoiceLineItem {
  const taxableValue = item.qty * item.rate;
  
  const cgstRate = item.cgstRate || 9;
  const sgstRate = item.sgstRate || 9;
  const igstRate = item.igstRate || 0;
  
  let cgst = 0, sgst = 0, igst = 0;
  
  // Determine tax type based on rates (for now, assume CGST + SGST for intra-state)
  cgst = Math.round((taxableValue * cgstRate) / 100 * 100) / 100;
  sgst = Math.round((taxableValue * sgstRate) / 100 * 100) / 100;
  igst = Math.round((taxableValue * igstRate) / 100 * 100) / 100;
  
  const amount = taxableValue + cgst + sgst + igst;

  return {
    ...item,
    taxableValue: Math.round(taxableValue * 100) / 100,
    cgst,
    sgst,
    igst,
    amount: Math.round(amount * 100) / 100,
  };
}

export function calculateInvoiceTotals(lineItems: InvoiceLineItem[]) {
  const subtotal = lineItems.reduce((sum, item) => sum + item.taxableValue, 0);
  const totalCgst = lineItems.reduce((sum, item) => sum + item.cgst, 0);
  const totalSgst = lineItems.reduce((sum, item) => sum + item.sgst, 0);
  const totalIgst = lineItems.reduce((sum, item) => sum + item.igst, 0);
  const total = subtotal + totalCgst + totalSgst + totalIgst;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    totalCgst: Math.round(totalCgst * 100) / 100,
    totalSgst: Math.round(totalSgst * 100) / 100,
    totalIgst: Math.round(totalIgst * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

export function convertAmountToWords(amount: number): string {
  const ones = [
    "", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"
  ];
  const teens = [
    "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen",
    "sixteen", "seventeen", "eighteen", "nineteen"
  ];
  const tens = [
    "", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"
  ];
  const scales = [
    "", "thousand", "crore", "lakh"
  ];

  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);

  function convert(num: number): string {
    if (num === 0) return "zero";
    
    let result = "";
    let groupIndex = 0;
    let group = num % 100;
    
    while (num > 0) {
      if (group !== 0) {
        const hundred = Math.floor(num / 100) % 10;
        let groupText = "";

        if (hundred > 0) {
          groupText = ones[hundred] + " hundred ";
        }

        const remainder = num % 100;
        if (remainder >= 10 && remainder < 20) {
          groupText += teens[remainder - 10];
        } else {
          const ten = Math.floor(remainder / 10);
          const one = remainder % 10;
          if (ten > 0) {
            groupText += tens[ten];
          }
          if (one > 0) {
            groupText += (ten > 0 ? " " : "") + ones[one];
          }
        }

        if (groupIndex > 0) {
          groupText += " " + scales[groupIndex];
        }

        result = groupText + (result ? " " + result : "");
      }

      num = Math.floor(num / 100);
      group = num % 100;
      groupIndex++;
    }

    return result.trim();
  }

  let words = convert(rupees) + " rupees";
  if (paise > 0) {
    words += " and " + convert(paise) + " paise";
  }

  return words.charAt(0).toUpperCase() + words.slice(1);
}

export async function populateInvoiceTemplate(
  invoice: Invoice,
  templatePath: string
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  
  try {
    // ExcelJS can handle .xltm files
    await workbook.xlsx.readFile(templatePath);
  } catch (error) {
    throw new Error(`Failed to read template: ${error}`);
  }

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error("No worksheet found in template");
  }

  // Cell references mapped to your Invoice.xltm template layout
  // Exact mappings as provided:
  const headerMap: Record<string, string> = {
    invoiceNumber: "N12",      // Invoice Number
    invoiceDate: "N11",        // Invoice Date
    poNumber: "N13",           // PO Number
    poDate: "N14",             // PO Date
    paymentTerms: "N18",       // Payment Terms
  };

  const customerMap: Record<string, string> = {
    billTo: "C12",             // Customer details start at C12
    shipTo: "C16",             // Ship To details at C16
  };

  // Populate header fields
  try {
    worksheet.getCell(headerMap.invoiceNumber).value = invoice.invoiceNumber;
    worksheet.getCell(headerMap.invoiceDate).value = new Date(invoice.invoiceDate);
    
    if (invoice.poNumber) {
      worksheet.getCell(headerMap.poNumber).value = invoice.poNumber;
    }
    if (invoice.poDate) {
      worksheet.getCell(headerMap.poDate).value = new Date(invoice.poDate);
    }
    if (invoice.paymentTerms) {
      worksheet.getCell(headerMap.paymentTerms).value = invoice.paymentTerms;
    }

    // Populate Bill To details at C12
    // Format: Name, Address, GSTIN
    let billToText = invoice.billTo.name;
    if (invoice.billTo.company) {
      billToText = `${invoice.billTo.company}\n${billToText}`;
    }
    if (invoice.billTo.address) {
      billToText = `${billToText}\n${invoice.billTo.address}`;
    }
    if (invoice.billTo.gstin) {
      billToText = `${billToText}\nGSTIN: ${invoice.billTo.gstin}`;
    }
    worksheet.getCell(customerMap.billTo).value = billToText;
    worksheet.getCell(customerMap.billTo).alignment = { wrapText: true, vertical: "top" };

    // Populate Ship To details at C16 (if different from Bill To)
    if (invoice.shipTo) {
      let shipToText = invoice.shipTo.name || invoice.billTo.name;
      if (invoice.shipTo.address) {
        shipToText = `${shipToText}\n${invoice.shipTo.address}`;
      }
      worksheet.getCell(customerMap.shipTo).value = shipToText;
      worksheet.getCell(customerMap.shipTo).alignment = { wrapText: true, vertical: "top" };
    }

  } catch (error) {
    console.warn("Some header fields could not be populated:", error);
  }

  // Populate line items
  // Starting row: 21, Columns: A through O
  // A=Sr No, B=Particulars, C=HSN, D=Qty, E=Rate, F=Taxable Value, G=CGST Rate, H=CGST, I=SGST Rate, J=SGST, K=IGST Rate, L=IGST, M=Item Total
  const lineItemStartRow = 21;
  const lineItemColumns = {
    srNo: "A",
    particulars: "B",
    hsn: "C",
    qty: "D",
    rate: "E",
    taxableValue: "F",
    cgstRate: "G",
    cgst: "H",
    sgstRate: "I",
    sgst: "J",
    igstRate: "K",
    igst: "L",
    amount: "M",
  };

  invoice.lineItems.forEach((item, index) => {
    const row = lineItemStartRow + index;
    worksheet.getCell(`${lineItemColumns.srNo}${row}`).value = item.srNo;
    worksheet.getCell(`${lineItemColumns.particulars}${row}`).value = item.particulars;
    if (item.hsn) {
      worksheet.getCell(`${lineItemColumns.hsn}${row}`).value = item.hsn;
    }
    worksheet.getCell(`${lineItemColumns.qty}${row}`).value = item.qty;
    worksheet.getCell(`${lineItemColumns.rate}${row}`).value = item.rate;
    worksheet.getCell(`${lineItemColumns.taxableValue}${row}`).value = item.taxableValue;
    
    // Set rates and tax amounts
    worksheet.getCell(`${lineItemColumns.cgstRate}${row}`).value = item.cgstRate || 9;
    worksheet.getCell(`${lineItemColumns.cgst}${row}`).value = item.cgst;
    worksheet.getCell(`${lineItemColumns.sgstRate}${row}`).value = item.sgstRate || 9;
    worksheet.getCell(`${lineItemColumns.sgst}${row}`).value = item.sgst;
    worksheet.getCell(`${lineItemColumns.igstRate}${row}`).value = item.igstRate || 0;
    worksheet.getCell(`${lineItemColumns.igst}${row}`).value = item.igst;
    
    worksheet.getCell(`${lineItemColumns.amount}${row}`).value = item.amount;
  });

  // Populate totals row (row 37)
  // This row should contain total taxable value, total CGST, total SGST, total IGST, total amount
  const totalsRow = 37;
  worksheet.getCell(`${lineItemColumns.taxableValue}${totalsRow}`).value = invoice.subtotal;
  worksheet.getCell(`${lineItemColumns.cgst}${totalsRow}`).value = invoice.totalCgst;
  worksheet.getCell(`${lineItemColumns.sgst}${totalsRow}`).value = invoice.totalSgst;
  worksheet.getCell(`${lineItemColumns.igst}${totalsRow}`).value = invoice.totalIgst;
  worksheet.getCell(`${lineItemColumns.amount}${totalsRow}`).value = invoice.total;

  // Populate amount in words at C38
  worksheet.getCell("C38").value = invoice.amountInWords || convertAmountToWords(invoice.total);
  
  // Populate final summary total at N43
  worksheet.getCell("N43").value = invoice.total;

  // Populate payment info if status is paid or partially paid
  if (invoice.status === "Paid" || invoice.status === "Partially Paid") {
    // You can add cells for payment date, method, etc. based on your template
    // Example: worksheet.getCell("N45").value = new Date(invoice.updatedAt);
  }

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer as any);
}

// Database functions
export async function createInvoice(invoice: Omit<Invoice, "_id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  const result = await db.collection<Invoice>("invoices").insertOne({
    ...invoice,
    _id: new ObjectId().toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any);

  return result.insertedId?.toString();
}

export async function getInvoiceById(id: string) {
  const db = await getDb();
  return db.collection<Invoice>("invoices").findOne({ _id: id } as any);
}

export async function getInvoicesByCustomerId(customerId: string) {
  const db = await getDb();
  return db
    .collection<Invoice>("invoices")
    .find({ customerId })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function getAllInvoices() {
  const db = await getDb();
  return db
    .collection<Invoice>("invoices")
    .find({})
    .sort({ createdAt: -1 })
    .toArray();
}

export async function updateInvoiceStatus(
  invoiceId: string,
  status: Invoice["status"],
  paidAmount?: number
) {
  const db = await getDb();
  const updateData: any = {
    status,
    updatedAt: new Date(),
  };

  if (paidAmount !== undefined) {
    updateData.paidAmount = paidAmount;
    
    // Get invoice to calculate balance
    const invoice = await getInvoiceById(invoiceId);
    if (invoice) {
      updateData.balanceAmount = Math.max(0, invoice.total - paidAmount);
    }
  }

  return db
    .collection<Invoice>("invoices")
    .updateOne({ _id: invoiceId } as any, { $set: updateData });
}

export async function updateInvoiceFileUrl(invoiceId: string, fileUrl: string, fileName: string) {
  const db = await getDb();
  return db
    .collection<Invoice>("invoices")
    .updateOne(
      { _id: invoiceId } as any,
      {
        $set: {
          fileUrl,
          fileName,
          updatedAt: new Date(),
        },
      }
    );
}
