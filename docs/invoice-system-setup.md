# Invoice System Implementation Guide

## Setup Instructions

### 1. Invoice Template Placement

**Create this folder structure:**
```
e:\Mark website\
  public/
    templates/
      invoice-template.xlsx
```

**Place your Excel invoice template at:**
```
public/templates/invoice-template.xlsx
```

### 2. Template Structure Requirements

Your Excel template should have the following structure (you can customize the exact cell positions):

#### Header Section (Rows 1-4):
- **B2**: Invoice Number
- **E2**: Invoice Date
- **B3**: PO Number
- **E3**: PO Date
- **B4**: Payment Terms

#### Customer Details (Rows 8-11):
- **A8**: Customer Name
- **A9**: Email
- **A10**: Phone
- **A11**: Company
- **E8**: GSTIN

#### Items Table (Starting Row 15):
```
A - Sr No
B - Particulars
C - HSN/SAC
D - Qty
E - Rate
F - Taxable Value
G - CGST
H - SGST
I - IGST
J - Amount
```

#### Totals Section (After last item + 2 rows):
```
F - Subtotal (Taxable Value)
G - CGST Total
H - SGST Total
I - IGST Total
J - Grand Total
```

#### Amount in Words (Last row):
- **B**: Amount in words

### 3. Customize Cell References

If your template uses different cell positions, update `src/lib/invoices.ts` in the `populateInvoiceTemplate` function:

```typescript
const cellMap: Record<string, string> = {
  invoiceNumber: "B2",     // Update if different
  invoiceDate: "E2",        // Update if different
  // ... update other cell references
};
```

## Features Implemented

### Admin Features

#### 1. **Admin Invoice Dashboard**
- **Route**: `/admin/invoices`
- View all invoices with status filtering
- Search and sort functionality
- Download generated invoices

#### 2. **Create New Invoice**
- **Route**: `/admin/invoices/create`
- Add multiple line items
- Auto-calculate GST (CGST 9% + SGST 9% by default)
- Support for IGST
- Auto-populate from customer database
- Generated invoice numbers: `INV-2026-001`, `INV-2026-002`, etc.

#### 3. **Invoice Detail & Management**
- **Route**: `/admin/invoices/[id]`
- View complete invoice details
- Update payment status
- Track paid vs pending amounts
- Download generated Excel file

#### 4. **Payment Status Tracking**
Status options:
- **Generated**: Invoice just created
- **Sent**: Invoice sent to customer
- **Partially Paid**: Some amount received
- **Paid**: Full amount received
- **Cancelled**: Invoice cancelled

### Customer Features

#### 1. **Customer Invoice Dashboard**
- **Route**: `/customer/invoices`
- View all invoices with summary
- Track paid vs pending amounts
- Filter by status
- Download invoices

#### 2. **Invoice Summary Cards**
- Total amount due
- Total amount paid
- Pending amount

## Database Schema

### Invoice Document Structure
```typescript
{
  _id: string,
  invoiceNumber: "INV-2026-001",
  customerId: string,
  quoteRequestId?: string,
  
  // Invoice metadata
  invoiceDate: Date,
  poNumber?: string,
  poDate?: Date,
  paymentTerms?: string,
  
  // Customer details
  billTo: {
    name: string,
    email: string,
    phone: string,
    company?: string,
    gstin?: string,
    address?: string,
  },
  
  // Delivery address
  shipTo?: {
    name?: string,
    address?: string,
  },
  
  // Line items
  lineItems: [
    {
      srNo: number,
      particulars: string,
      hsn?: string,
      qty: number,
      rate: number,
      taxableValue: number,
      cgst: number,
      sgst: number,
      igst: number,
      amount: number,
    }
  ],
  
  // Totals
  subtotal: number,
  totalCgst: number,
  totalSgst: number,
  totalIgst: number,
  total: number,
  amountInWords: string,
  
  // Payment tracking
  status: "Generated" | "Sent" | "Partially Paid" | "Paid" | "Cancelled",
  paidAmount: number,
  paymentNotes?: string,
  
  // File storage
  fileUrl?: string,
  fileName?: string,
  
  // Metadata
  createdAt: Date,
  updatedAt: Date,
}
```

## API Endpoints

### Create Invoice
```
POST /api/admin/invoices/create
Content-Type: application/json

{
  "customerId": "cust123",
  "poNumber": "PO-2026-001",
  "poDate": "2026-05-07",
  "paymentTerms": "Net 30",
  "billTo": {
    "name": "Acme Corp",
    "email": "bill@acme.com",
    "phone": "9876543210",
    "company": "Acme Corporation",
    "gstin": "27AABCT1234F1Z0",
    "address": "123 Main St, City"
  },
  "lineItems": [
    {
      "particulars": "Fabrication Work",
      "hsn": "7326",
      "qty": 10,
      "rate": 1000
    }
  ]
}

Response:
{
  "invoiceId": "xxx",
  "fileUrl": "/invoices/INV-2026-001.xlsx"
}
```

### Get All Invoices
```
GET /api/admin/invoices

Response: [{ ...invoice }, ...]
```

### Get Invoice by ID
```
GET /api/admin/invoices/[id]

Response: { ...invoice }
```

### Update Invoice Status
```
PATCH /api/admin/invoices/[id]
Content-Type: application/json

{
  "status": "Paid",
  "paidAmount": 50000
}
```

## GST Calculations

Default tax rates:
- **CGST**: 9%
- **SGST**: 9%
- **IGST**: Not applied by default (for intra-state transactions)

Example calculation:
```
Item: Fabrication Work
Qty: 10
Rate: 1000
Taxable Value: 10 × 1000 = 10,000

CGST (9%): 10,000 × 0.09 = 900
SGST (9%): 10,000 × 0.09 = 900
Total: 10,000 + 900 + 900 = 11,800
```

## File Generation & Storage

### Excel File Generation
- Templates stored in: `public/templates/`
- Generated invoices saved to: `public/invoices/`
- File naming: `INV-2026-001.xlsx`
- Accessible via: `/invoices/INV-2026-001.xlsx`

### File Structure
```
public/
  templates/
    invoice-template.xlsx (your master template)
  invoices/
    INV-2026-001.xlsx
    INV-2026-002.xlsx
    ...
```

## Amount Conversion to Words

Example conversions:
- 10,000 → "Ten Thousand Rupees"
- 1,50,000 → "One Lakh Fifty Thousand Rupees"
- 12,34,567.50 → "Twelve Lakh Thirty Four Thousand Five Hundred Sixty Seven Rupees and Fifty Paise"

Implemented in: `src/lib/invoices.ts` → `convertAmountToWords()`

## Next Steps

1. **Prepare Excel Template**
   - Create your company's invoice format in Excel
   - Include all required fields mentioned above
   - Keep company branding, header, and footer design
   - Place it at `public/templates/invoice-template.xlsx`

2. **Test Invoice Creation**
   - Navigate to `/admin/invoices/create`
   - Fill in sample invoice data
   - Submit and verify Excel file is generated
   - Download and verify formatting

3. **Integrate with Quotes**
   - Update quote status to "COMPLETED"
   - Create invoice from completed quote (future enhancement)

4. **Email Integration (Optional Future)**
   - Add email sending functionality
   - Send invoices to customers
   - Payment reminders

5. **Advanced Features (Optional)**
   - Invoice numbering by year/month
   - Recurring invoices
   - Invoice templates for different document types
   - Payment gateway integration

## Testing

### Test Create Invoice
1. Go to `/admin/invoices/create`
2. Fill in customer details
3. Add line items with various amounts
4. Submit form
5. Verify Excel file is created and contains correct data

### Test Customer Dashboard
1. Login as customer
2. Navigate to `/customer/invoices`
3. Verify all invoices are displayed
4. Check summary totals
5. Download invoice

### Test Status Updates
1. Go to invoice detail page `/admin/invoices/[id]`
2. Update payment status
3. Update paid amount
4. Verify changes are saved

## Troubleshooting

### Template Not Found Error
- Verify `public/templates/invoice-template.xlsx` exists
- Check file permissions
- Ensure Excel file is valid (.xlsx format)

### Cell Reference Errors
- Update cell references in `populateInvoiceTemplate()` to match your template
- Use Excel column letters (A, B, C, etc.)
- Use 1-based row numbering

### GST Calculation Issues
- Default is CGST + SGST (intra-state)
- Modify rates in `calculateLineItemTotals()` if needed
- For IGST, update tax logic in the function

## File Reference Map

- **Schema**: `src/lib/invoice-schema.ts`
- **Utilities**: `src/lib/invoices.ts`
- **API Routes**: `src/app/api/admin/invoices/`
- **Admin Pages**: `src/app/admin/invoices/`
- **Admin Components**: `src/components/admin-invoices-list.tsx`, `create-invoice-form.tsx`, `invoice-detail.tsx`
- **Customer Pages**: `src/app/customer/invoices/page.tsx`
- **Customer Component**: `src/components/customer-invoices.tsx`
