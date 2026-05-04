# MARKS Engineering & Co. Website

Modern responsive B2B website for MARKS Engineering & Co., an industrial fabrication and structural engineering company in Bilaspur, Chhattisgarh.

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS
- Framer Motion
- Shadcn-style UI primitives
- Route handlers for contact and quote inquiries

## Local Development

```bash
npm install
npm run dev
```

## Email Inquiries

Contact and quote forms post to:

- `POST /api/contact`
- `POST /api/quote`

Set these environment variables to send form submissions through Resend:

```bash
INQUIRY_EMAIL_TO=quotes@marksengineering.co
INQUIRY_EMAIL_FROM="MARKS Website <verified@yourdomain.com>"
RESEND_API_KEY=your_resend_api_key
```

Without `RESEND_API_KEY`, submissions are accepted and logged on the server, which keeps local development simple.

## MongoDB and Admin

Quote requests and contact messages are saved in MongoDB. Quote drawings are stored with the lead document and capped at 8MB.

```bash
MONGODB_URI=mongodb+srv://...
MONGODB_DB=marks_engineering
ADMIN_PASSWORD=change-this-password
ADMIN_SESSION_SECRET=long-random-secret
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Admin inbox:

- `/admin/login`
- `/admin`
- Protected drawing downloads from the inbox

## Marketplace-Ready Structure

The site keeps business content in `src/lib/data.ts`, reusable UI in `src/components`, and lead capture in API route handlers. This leaves room to add future job uploads, customer accounts, vendor acceptance flows, and project status tracking without rewriting the marketing pages.
