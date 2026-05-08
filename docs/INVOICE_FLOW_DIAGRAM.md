# Invoice System - Visual Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      INVOICE SYSTEM FLOW                        │
└─────────────────────────────────────────────────────────────────┘

ADMIN WORKFLOW:
┌──────────────┐      ┌──────────────────┐      ┌────────────────┐
│   Create     │──→   │   API Creates    │──→   │   Generate     │
│  Invoice     │      │   MongoDB Doc    │      │   Excel File   │
│   Form       │      │   & Calculates   │      │   from Template│
└──────────────┘      │   Taxes, Totals  │      └────────────────┘
                      └──────────────────┘              │
                              ↑                         ↓
                              │                    ┌──────────────┐
                              │                    │  Save to     │
                              │                    │  /invoices/  │
                              │                    └──────────────┘
                              │                         │
                              │                         ↓
                      ┌──────────────────┐      ┌────────────────┐
                      │   Update Status  │      │  Invoice List  │
                      │   Paid, Pending  │      │   View/Download│
                      │   Sent, etc.     │      └────────────────┘
                      └──────────────────┘

CUSTOMER WORKFLOW:
┌──────────────────────────────────────┐
│   Customer Dashboard                 │
│   /customer/invoices                 │
│                                      │
│  ┌────────────────────────────────┐ │
│  │ Summary Cards:                 │ │
│  │ • Total Amount                 │ │
│  │ • Paid Amount                  │ │
│  │ • Pending Amount               │ │
│  └────────────────────────────────┘ │
│                                      │
│  ┌────────────────────────────────┐ │
│  │ Invoice List:                  │ │
│  │ • Invoice Number               │ │
│  │ • Date & Amount                │ │
│  │ • Status (Paid/Pending)        │ │
│  │ • Download Link                │ │
│  └────────────────────────────────┘ │
└──────────────────────────────────────┘
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    CREATE INVOICE FLOW                          │
└─────────────────────────────────────────────────────────────────┘

INPUT:
┌─────────────────────────┐
│  Customer Details       │
│  - Name, Email, Phone   │
│  - Company, GSTIN       │
│  - Address              │
└─────────────────────────┘
         ↓
┌─────────────────────────┐
│  Invoice Meta           │
│  - PO Number & Date     │
│  - Payment Terms        │
└─────────────────────────┘
         ↓
┌─────────────────────────┐
│  Line Items             │
│  - Particulars          │
│  - Qty × Rate           │
│  - HSN/SAC              │
└─────────────────────────┘
         ↓
    ╔═════════════╗
    ║  PROCESSING ║
    ╚═════════════╝
         ↓
    • Generate Invoice #
    • Calculate Taxable Value = Qty × Rate
    • Calculate CGST (9%)
    • Calculate SGST (9%)
    • Calculate Total
    • Convert to Words
         ↓
    ╔═════════════════════════════╗
    ║  MongoDB Insert             ║
    ║  All Invoice Data           ║
    ╚═════════════════════════════╝
         ↓
    ╔═════════════════════════════╗
    ║  Excel Generation           ║
    ║  Populate Template          ║
    ║  Save to /invoices/         ║
    ╚═════════════════════════════╝
         ↓
OUTPUT:
┌─────────────────────────┐
│  Invoice Created        │
│  ID: xxx                │
│  Number: INV-2026-001   │
│  File: /invoices/...    │
└─────────────────────────┘
```

## GST Calculation Example

```
┌─────────────────────────────────────────────┐
│           TAX CALCULATION FLOW              │
└─────────────────────────────────────────────┘

Single Line Item:
┌──────────────────────────────────────┐
│ Particulars: Fabrication Work        │
│ Qty: 10                              │
│ Rate: 1,000 per unit                 │
└──────────────────────────────────────┘
              ↓
    Taxable Value = 10 × 1,000 = 10,000
              ↓
    ┌─────────────────────────────────┐
    │ CGST (9%): 10,000 × 9% = 900    │
    │ SGST (9%): 10,000 × 9% = 900    │
    │ IGST (0%): 0                    │
    └─────────────────────────────────┘
              ↓
    Amount = 10,000 + 900 + 900 = 11,800
              ↓
For Multiple Items:
┌──────────────────────────────────┐
│ Item 1 Total: 11,800             │
│ Item 2 Total: 5,900              │
│ Item 3 Total: 8,500              │
├──────────────────────────────────┤
│ Grand Total:                     │
│ Subtotal:        26,200          │
│ Total CGST:      2,358           │
│ Total SGST:      2,358           │
│ Total IGST:      0               │
├──────────────────────────────────┤
│ INVOICE TOTAL:   31,316          │
│                                  │
│ In Words:                        │
│ "Thirty One Thousand Three       │
│  Hundred Sixteen Rupees"         │
└──────────────────────────────────┘
```

## File Organization

```
e:\Mark website\
│
├─ public/
│  ├─ templates/                    ← Master invoice template
│  │  ├─ invoice-template.xlsx       ← 📍 PLACE YOUR TEMPLATE HERE
│  │  └─ README.md
│  │
│  └─ invoices/                     ← Generated invoice files
│     ├─ INV-2026-001.xlsx
│     ├─ INV-2026-002.xlsx
│     └─ ...
│
├─ src/
│  ├─ lib/
│  │  ├─ invoice-schema.ts          ← TypeScript types
│  │  └─ invoices.ts                ← All utilities & DB functions
│  │
│  ├─ app/
│  │  ├─ api/admin/invoices/
│  │  │  ├─ route.ts                ← GET all invoices
│  │  │  ├─ create/route.ts         ← POST create invoice
│  │  │  └─ [id]/route.ts           ← GET/PATCH single invoice
│  │  │
│  │  ├─ admin/invoices/
│  │  │  ├─ page.tsx                ← Invoice list page
│  │  │  ├─ create/page.tsx         ← Create form page
│  │  │  └─ [id]/page.tsx           ← Detail page
│  │  │
│  │  └─ customer/invoices/
│  │     └─ page.tsx                ← Customer dashboard
│  │
│  └─ components/
│     ├─ admin-invoices-list.tsx
│     ├─ create-invoice-form.tsx
│     ├─ invoice-detail.tsx
│     └─ customer-invoices.tsx
│
└─ docs/
   ├─ invoice-quick-start.md        ← Start here
   ├─ invoice-system-setup.md       ← Detailed guide
   └─ INVOICE_SYSTEM_README.md      ← This file
```

## API Endpoints

```
┌──────────────────────────────────────────────────────────────┐
│                    API ENDPOINTS                             │
└──────────────────────────────────────────────────────────────┘

CREATE INVOICE
┌─────────────────────────────────────────────────────────────┐
│ POST /api/admin/invoices/create                             │
├─────────────────────────────────────────────────────────────┤
│ Body: {                                                     │
│   customerId: string,                                       │
│   billTo: { name, email, phone, company, gstin, address },  │
│   lineItems: [ { particulars, hsn, qty, rate }, ... ],      │
│   poNumber?: string,                                        │
│   paymentTerms?: string                                     │
│ }                                                           │
├─────────────────────────────────────────────────────────────┤
│ Response: { invoiceId, fileUrl }                            │
│ Status: 201 Created                                         │
└─────────────────────────────────────────────────────────────┘

LIST INVOICES
┌─────────────────────────────────────────────────────────────┐
│ GET /api/admin/invoices                                     │
├─────────────────────────────────────────────────────────────┤
│ Response: [ { Invoice }, ... ]                              │
│ Status: 200 OK                                              │
└─────────────────────────────────────────────────────────────┘

GET INVOICE
┌─────────────────────────────────────────────────────────────┐
│ GET /api/admin/invoices/[id]                                │
├─────────────────────────────────────────────────────────────┤
│ Response: { Invoice }                                       │
│ Status: 200 OK                                              │
└─────────────────────────────────────────────────────────────┘

UPDATE INVOICE
┌─────────────────────────────────────────────────────────────┐
│ PATCH /api/admin/invoices/[id]                              │
├─────────────────────────────────────────────────────────────┤
│ Body: {                                                     │
│   status: "Paid" | "Sent" | "Partially Paid" | ...,        │
│   paidAmount?: number                                       │
│ }                                                           │
├─────────────────────────────────────────────────────────────┤
│ Response: { success: true }                                 │
│ Status: 200 OK                                              │
└─────────────────────────────────────────────────────────────┘
```

## Page Navigation

```
ADMIN WORKFLOW:
┌──────────────┐
│ /admin       │
└──────┬───────┘
       │
       ├─→ /admin/invoices              (List all invoices)
       │        │
       │        ├─→ [VIEW] → /admin/invoices/[id]  (Invoice detail)
       │        │              • View details
       │        │              • Update status
       │        │              • Download file
       │        │
       │        └─→ [CREATE] → /admin/invoices/create  (New invoice)
       │                        • Form with line items
       │                        • Auto-calculations
       │                        • Generate Excel

CUSTOMER WORKFLOW:
┌──────────────────┐
│ /customer        │
└──────┬───────────┘
       │
       └─→ /customer/invoices           (Invoice dashboard)
               • Summary cards
               • Invoice list
               • Download links
               • Status tracking
```

## Status Flow

```
┌──────────────────────────────────────────────────────────────┐
│              INVOICE STATUS LIFECYCLE                        │
└──────────────────────────────────────────────────────────────┘

Created by Admin
       │
       ↓
   [Generated] ← Initial status
       │
       ├─→ Send to customer
       │   │
       │   ↓
       │  [Sent]
       │   │
       │   ├─→ Partial Payment Received
       │   │   │
       │   │   ↓
       │   │  [Partially Paid]
       │   │   │
       │   │   └─→ Final Payment
       │   │        │
       │   │        ↓
       │   │     [Paid] ✓
       │   │
       │   └─→ Full Payment
       │        │
       │        ↓
       │      [Paid] ✓
       │
       └─→ Cancel (if needed)
            │
            ↓
         [Cancelled]
```

## Database Schema (Simplified)

```
Invoice Collection:
{
  _id: ObjectId,
  invoiceNumber: "INV-2026-001",
  customerId: "cust123",
  billTo: {
    name: "Acme Corp",
    email: "bill@acme.com",
    phone: "9876543210",
    gstin: "27AABCT1234F1Z0"
  },
  lineItems: [
    {
      srNo: 1,
      particulars: "Fabrication Work",
      hsn: "7326",
      qty: 10,
      rate: 1000,
      taxableValue: 10000,
      cgst: 900,
      sgst: 900,
      amount: 11800
    }
  ],
  subtotal: 10000,
  totalCgst: 900,
  totalSgst: 900,
  total: 11800,
  amountInWords: "Eleven Thousand Eight Hundred Rupees",
  status: "Sent",
  paidAmount: 5900,
  fileUrl: "/invoices/INV-2026-001.xlsx",
  createdAt: 2026-05-07T...,
  updatedAt: 2026-05-07T...
}
```

---

**Legend**:
- 📍 = ACTION REQUIRED (Place your template here)
- ✓ = Complete
- → = Flow/Navigation
- ↓ = Process step
