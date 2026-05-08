# Invoice.xltm - Quick Setup

## ✅ Your Template is Connected
**File**: `public/templates/Invoice.xltm`  
**Status**: Ready to use

---

## 🎯 3 Simple Steps to Get Started

### 1️⃣ Open Your Template
Open `public/templates/Invoice.xltm` in Microsoft Excel

### 2️⃣ Find Cell Locations
Click on each field and note the cell address (shown in Name Box):

| What to Find | Find It In | Cell Address |
|---|---|---|
| Invoice Number field | In your template | _______ |
| Invoice Date field | In your template | _______ |
| PO Number field | In your template | _______ |
| First line item row | First row of items table | Row: _______ |
| Totals row | Where totals appear | Row: _______ |
| Amount in Words cell | In your template | _______ |

### 3️⃣ Update Configuration
Edit `src/lib/invoices.ts` line ~160:

```typescript
const cellMap: Record<string, string> = {
  invoiceNumber: "?",    // Put your cell address here
  invoiceDate: "?",      // Put your cell address here
  poNumber: "?",         // Put your cell address here
  // ... etc
};

const startRow = ?;      // Put your first line item row here
const totalRow = ?;      // Put your totals row here
```

---

## 📍 Example Configuration

If your template has:
- Invoice # in cell **B4**: `invoiceNumber: "B4"`
- Date in cell **D4**: `invoiceDate: "D4"`
- Line items starting at row **18**: `const startRow = 18`
- Totals at row **28**: `const totalRow = 28`

Then update to:
```typescript
const cellMap: Record<string, string> = {
  invoiceNumber: "B4",
  invoiceDate: "D4",
  // ... etc
};

const startRow = 18;
const totalRow = 28;
```

---

## 🧪 Test It

```bash
# 1. Build
npm run build

# 2. Start
npm run dev

# 3. Create invoice
# Go to: http://localhost:3000/admin/invoices/create

# 4. Download and verify
# Check public/invoices/INV-2026-001.xlsx
```

---

## 📚 More Help
Read: `docs/TEMPLATE_CONFIGURATION.md`

---

**Ready to configure?** Tell me your template's cell locations and I'll update them for you!
