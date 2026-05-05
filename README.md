# MARKS Engineering & Co. Website

Modern responsive B2B website for MARKS Engineering & Co., an industrial fabrication and structural engineering company in Bilaspur, Chhattisgarh.

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS
- Framer Motion
- Shadcn-style UI primitives
- MongoDB for quote requests and admin workflow
- Zod, React Hook Form, Nodemailer, and PDFKit for quote workflow

## Local Development

```bash
npm install
npm run dev
```

## Quote and Admin Workflow

Quote forms post to:

- `POST /api/quote`

Set these environment variables for database, admin auth, and SMTP email:

```bash
MONGODB_URI=mongodb+srv://...
MONGODB_DB=marks_engineering
ADMIN_SESSION_SECRET=long-random-secret
ADMIN_PASSWORD=local-fallback-password
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=smtp-user
SMTP_PASS=smtp-password
SMTP_FROM="MARKS Engineering <quotes@marksengineering.co>"
INQUIRY_EMAIL_TO=quotes@marksengineering.co
```

Without SMTP credentials, emails are logged on the server for local development.

Admin routes:

- `/admin/login`
- `/admin`
- `/admin/quotes/[id]`

Customer tracking:

- `/track-quote`

See `docs/quote-admin-setup.md` for detailed setup, admin user creation, upload notes, and production guidance.

## Marketplace-Ready Structure

The site keeps business content in `src/lib/data.ts`, reusable UI in `src/components`, quote operations in MongoDB collections, and a documented `vendors` collection path for future job assignment and vendor dashboards.
