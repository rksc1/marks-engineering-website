# Template Configuration Guide - Invoice.xltm

## 🎯 Your Template File
**Location**: `public/templates/Invoice.xltm`  
**Status**: ✅ Detected and configured

---

## 📋 How to Configure Cell References

Your invoice system is now set up to use your `Invoice.xltm` template. To make it work perfectly, you need to tell the system where each field is located in your Excel template.

### Step 1: Open Your Template
Open `public/templates/Invoice.xltm` in Excel and identify the cell locations for each field.

### Step 2: Update Cell References
Edit `src/lib/invoices.ts` and find the `populateInvoiceTemplate()` function.

Update these sections based on your template layout:

---

## Header Fields Configuration

```typescript
// File: src/lib/invoices.ts (around line 160)

const cellMap: Record<string, string> = {
  invoiceNumber: "C7",      // ← UPDATE: Where is invoice number in your template?
  invoiceDate: "C8",         // ← UPDATE: Where is invoice date?
  poNumber: "C9",            // ← UPDATE: Where is PO number?
  poDate: "C10",             // ← UPDATE: Where is PO date?
  paymentTerms: "C11",       // ← UPDATE: Where are payment terms?
  customerName: "C14",       // ← UPDATE: Where is customer name?
  customerEmail: "C15",      // ← UPDATE: Where is email?
  customerPhone: "C16",      // ← UPDATE: Where is phone?
  customerCompany: "C17",    // ← UPDATE: Where is company?
  customerGstin: "C18",      // ← UPDATE: Where is GSTIN?
};
```

---

## Line Items Configuration

```typescript
// File: src/lib/invoices.ts (around line 185)

const startRow = 22;  // ← UPDATE: Which row do line items START?

const itemColumns = {
  srNo: "A",          // Sr No column
  particulars: "B",   // Description/Particulars column
  hsn: "C",           // HSN/SAC column
  qty: "D",           // Quantity column
  rate: "E",          // Rate/Price column
  taxableValue: "F",  // Taxable Value column
  cgst: "G",          // CGST column
  sgst: "H",          // SGST column
  igst: "I",          // IGST column
  amount: "J",        // Total Amount column
};
```

---

## Totals Configuration

```typescript
// File: src/lib/invoices.ts (around line 210)

const totalRow = 30;  // ← UPDATE: Which row are TOTALS in your template?
```

This row should have:
- Column F: Subtotal
- Column G: CGST Total
- Column H: SGST Total
- Column I: IGST Total
- Column J: Grand Total

---

## Amount in Words Configuration

```typescript
// File: src/lib/invoices.ts (around line 217)

const amountWordsRow = 32;      // ← UPDATE: Which row is "Amount in Words"?
const amountWordsCol = "C";     // ← UPDATE: Which column?
```

---

## 🔍 How to Find Cell References

1. **Open Invoice.xltm in Excel**
2. **Click on a cell** you want to map
3. **Look at the Name Box** (top-left, shows cell address like "C7")
4. **Use that cell address** in your configuration

### Example:
If your invoice number is in cell **B3**:
```typescript
invoiceNumber: "B3",  // Not "C7"
```

---

## Template Structure Example

Here's a typical invoice template structure (yours may vary):

```
Row 1   [Company Header]
Row 2   [Company Details]
Row 3
Row 4   Invoice #: [C7]          Date: [C8]
Row 5   PO #: [C9]               PO Date: [C10]
Row 6   Payment Terms: [C11]

Row 8   BILL TO:
Row 9   Name: [C14]
Row 10  Email: [C15]
Row 11  Phone: [C16]
Row 12  Company: [C17]
Row 13  GSTIN: [C18]

Row 15  [Table Headers]
Row 16  Sr No | Particulars | HSN | Qty | Rate | Tax Value | CGST | SGST | IGST | Amount
Row 17  [Empty - first line item]
Row 22  1     | Item 1      | ... | ... | ...  | ...       | ...  | ...  | ...  | ...

Row 30  TOTALS: [F30] | [G30] | [H30] | [I30] | [J30]

Row 32  Amount in Words: [C32]
```

---

## 🚀 How to Test

### 1. Configure your cell references
Edit `src/lib/invoices.ts` with your actual template cell locations.

### 2. Start dev server
```bash
npm run dev
```

### 3. Create a test invoice
- Go to: http://localhost:3000/admin/invoices/create
- Fill in sample data
- Click "Create Invoice"

### 4. Download and verify
- Check if Excel file was generated in `public/invoices/`
- Open the file
- Verify all data is in the correct cells

### 5. If data is in wrong cells
- Note which cells have data
- Update the cell references in `src/lib/invoices.ts`
- Test again

---

## Common Issues & Solutions

### Issue: Data appears in wrong cells
**Solution**: Double-check your cell references. Use Excel's Name Box to verify exact cell locations.

### Issue: Line items not appearing
**Solution**: Update `startRow` to the correct first row of your line items table.

### Issue: Totals not appearing
**Solution**: Update `totalRow` to where your totals row is located.

### Issue: Column letters don't match
**Solution**: Update the `itemColumns` object to match your template's layout.

---

## 📝 Template Requirements

Your `Invoice.xltm` template should have:

✅ **Header Section**
- Invoice number field
- Invoice date field
- PO number and date fields
- Payment terms field

✅ **Customer Section**
- Name
- Email
- Phone
- Company
- GSTIN

✅ **Line Items Table**
- Column headers
- Rows for multiple items
- Columns: Sr No, Particulars, HSN, Qty, Rate, Taxable Value, CGST, SGST, IGST, Amount

✅ **Totals Section**
- Subtotal
- CGST Total
- SGST Total
- IGST Total
- Grand Total

✅ **Amount in Words**
- A cell to display the total amount in words

---

## Default Configuration

If your template follows the standard layout below, these defaults should work:

```typescript
// Default cell mapping
const cellMap: Record<string, string> = {
  invoiceNumber: "C7",      // Update to your actual cell
  invoiceDate: "C8",        // Update to your actual cell
  poNumber: "C9",           // Update to your actual cell
  poDate: "C10",            // Update to your actual cell
  paymentTerms: "C11",      // Update to your actual cell
  customerName: "C14",      // Update to your actual cell
  customerEmail: "C15",     // Update to your actual cell
  customerPhone: "C16",     // Update to your actual cell
  customerCompany: "C17",   // Update to your actual cell
  customerGstin: "C18",     // Update to your actual cell
};

const startRow = 22;  // First line item row
const totalRow = 30;  // Totals row
const amountWordsRow = 32;  // Amount in words row
```

---

## Quick Checklist

- [ ] Open `Invoice.xltm` and identify all field locations
- [ ] Edit `src/lib/invoices.ts` - Update `cellMap` with your cell references
- [ ] Edit `src/lib/invoices.ts` - Update `startRow` (where line items begin)
- [ ] Edit `src/lib/invoices.ts` - Update `totalRow` (where totals are)
- [ ] Edit `src/lib/invoices.ts` - Update `amountWordsRow` and `amountWordsCol`
- [ ] Run `npm run build` - Verify no errors
- [ ] Test creating an invoice at `/admin/invoices/create`
- [ ] Download and verify Excel output

---

## Support

If you need help mapping cells:

1. **Open your template** in Excel
2. **Tell me the cell locations** of key fields (invoice number, date, first line item, totals, etc.)
3. I can update the configuration for you

---

**Status**: ✅ System ready - awaiting template cell configuration
