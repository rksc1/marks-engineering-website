# Invoice System - Quick Start Guide

## What Was Built

A complete invoice generation system for your fabrication ERP with:

✅ **Admin Invoice Management**
- Create invoices from scratch or linked to quotes
- View all invoices with sorting/filtering
- Update payment status (Generated, Sent, Paid, Partially Paid, Cancelled)
- Track paid vs pending amounts
- Download generated Excel invoices

✅ **Customer Invoice Portal**
- View all issued invoices
- Track payment status
- Download invoices
- Summary dashboard with total/paid/pending amounts

✅ **Automatic Features**
- Invoice number generation: `INV-2026-001`, `INV-2026-002`, etc.
- GST calculation: CGST 9% + SGST 9% per item
- Amount to words conversion (e.g., "Eleven Thousand Eight Hundred Rupees")
- Excel template population with all data
- Line item tax calculations

✅ **Database Integration**
- MongoDB collections for invoices
- Customer-invoice linking
- Quote-invoice association (ready for integration)
- Payment tracking

## Quick Start (3 Steps)

### Step 1: Place Your Invoice Template
1. **Get your company's invoice Excel format** (if not available, create a basic one)
2. **Create folder**: `public/templates/`
3. **Save template as**: `public/templates/invoice-template.xlsx`

📍 **Location**: `e:\Mark website\public\templates\invoice-template.xlsx`

### Step 2: Configure Template Cell References (if needed)
If your template cells don't match defaults:
1. Open `src/lib/invoices.ts`
2. Find the `populateInvoiceTemplate()` function
3. Update cell references in `cellMap` object to match your template

Default expected cell positions:
```
B2  = Invoice Number
E2  = Invoice Date
B3  = PO Number
E3  = PO Date
B4  = Payment Terms
A8  = Customer Name
E8  = Customer GSTIN
(and so on...)
```

### Step 3: Access the Invoice System

**For Admin:**
- Create invoice: http://localhost:3000/admin/invoices/create
- View all: http://localhost:3000/admin/invoices
- View details: http://localhost:3000/admin/invoices/[invoice-id]

**For Customers:**
- My invoices: http://localhost:3000/customer/invoices

## Try It Now (Demo)

1. **Start dev server**:
   ```bash
   cd "e:\Mark website"
   npm run dev
   ```

2. **Login to admin** (if not already):
   - Go to http://localhost:3000/admin
   - Enter admin credentials

3. **Create test invoice**:
   - Go to http://localhost:3000/admin/invoices/create
   - Fill sample data:
     - Customer: "Acme Corp"
     - Email: "test@acme.com"
     - Phone: "9876543210"
     - Item 1: "Fabrication Work", Qty: 10, Rate: 1000
   - Click "Create Invoice"

4. **Verify**:
   - Check if Excel file is generated
   - Download and open it
   - Verify all data is populated correctly

## Key Features

### Automatic GST Calculation
```
Item Rate: 1,000 × Qty: 10 = 10,000 (Taxable Value)
CGST 9%:  10,000 × 0.09 = 900
SGST 9%:  10,000 × 0.09 = 900
Total:    10,000 + 900 + 900 = 11,800
```

### Payment Status Workflow
```
Generated → Sent → Partially Paid → Paid
                  ↘ (if cancelled) → Cancelled
```

### File Storage
```
Generated invoices saved to: public/invoices/
Accessible via: /invoices/INV-2026-001.xlsx
```

## File Locations

| Component | Location |
|-----------|----------|
| Schema | `src/lib/invoice-schema.ts` |
| Utilities | `src/lib/invoices.ts` |
| Admin API | `src/app/api/admin/invoices/` |
| Admin Pages | `src/app/admin/invoices/` |
| Admin Components | `src/components/admin-*.tsx` |
| Customer Page | `src/app/customer/invoices/page.tsx` |
| Customer Component | `src/components/customer-invoices.tsx` |
| Setup Guide | `docs/invoice-system-setup.md` |
| **Your Template** | `public/templates/invoice-template.xlsx` |

## Customization Points

### 1. GST Rates
File: `src/lib/invoices.ts` → `calculateLineItemTotals()`
```typescript
cgstRate: number = 9,  // Change if needed
sgstRate: number = 9,  // Change if needed
igstRate: number = 18  // For inter-state
```

### 2. Invoice Number Format
File: `src/lib/invoices.ts` → `generateInvoiceNumber()`
Current: `INV-2026-001`
Change the format in the return statement.

### 3. Template Cell References
File: `src/lib/invoices.ts` → `populateInvoiceTemplate()`
Update the `cellMap` object with your template's cell positions.

### 4. Status Options
File: `src/lib/invoice-schema.ts`
Update the `invoiceStatuses` array to add/remove status options.

## API Examples

### Create Invoice
```bash
curl -X POST http://localhost:3000/api/admin/invoices/create \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "cust123",
    "billTo": {
      "name": "Acme Corp",
      "email": "bill@acme.com",
      "phone": "9876543210"
    },
    "lineItems": [
      {
        "particulars": "Fabrication",
        "qty": 10,
        "rate": 1000
      }
    ]
  }'
```

### Update Payment Status
```bash
curl -X PATCH http://localhost:3000/api/admin/invoices/[id] \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Paid",
    "paidAmount": 11800
  }'
```

## Future Enhancements

- [ ] Email invoice to customer
- [ ] Bulk invoice generation
- [ ] Payment reminders
- [ ] Invoice numbering by month/quarter
- [ ] PDF export in addition to Excel
- [ ] Invoice templates for different document types
- [ ] Payment gateway integration
- [ ] Automatic invoice creation from completed quotes
- [ ] Invoice analytics/reports
- [ ] Multi-currency support

## Database Collections Used

- **invoices**: Stores all invoice documents
- Linked to: customers, quotes (ready for integration)

## Testing Checklist

- [ ] Invoice created successfully
- [ ] Excel file generated and downloadable
- [ ] GST calculations correct
- [ ] Amount in words correct
- [ ] Payment status updates work
- [ ] Customer dashboard shows invoices
- [ ] Invoice download works from customer view
- [ ] Build passes: `npm run build`

## Troubleshooting

**Issue**: Template not found
**Solution**: Verify `public/templates/invoice-template.xlsx` exists

**Issue**: Excel file not generated
**Solution**: Check `public/invoices/` folder has write permissions

**Issue**: Wrong cell data
**Solution**: Update cell references in `src/lib/invoices.ts`

**Issue**: GST calculations off
**Solution**: Check rates in `calculateLineItemTotals()` function

## Support Files

- Complete setup guide: `docs/invoice-system-setup.md`
- Schema definition: `src/lib/invoice-schema.ts`
- All utilities: `src/lib/invoices.ts`

---

**Status**: ✅ Ready to use
**Build Status**: ✅ Passes
**Template Status**: ⏳ Awaiting your Excel template

**Next Action**: Place your invoice template at `public/templates/invoice-template.xlsx`
