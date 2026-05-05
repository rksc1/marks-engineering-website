# Quote and Admin Setup

## Environment variables

```env
MONGODB_URI="mongodb+srv://USER:PASSWORD@cluster.mongodb.net/?retryWrites=true&w=majority"
MONGODB_DB="marks_engineering"
ADMIN_SESSION_SECRET="use-a-long-random-secret"
ADMIN_PASSWORD="temporary-local-fallback-password"

SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="smtp-user"
SMTP_PASS="smtp-password"
SMTP_FROM="MARKS Engineering <quotes@marksengineering.co>"
INQUIRY_EMAIL_TO="admin@marksengineering.co"
```

`ADMIN_PASSWORD` is the simplest login path. If you want database-backed admins, create a document in the `admin_users` collection with:

```json
{
  "name": "MARKS Admin",
  "email": "admin@marksengineering.co",
  "password": "scrypt:...",
  "createdAt": "2026-05-05T00:00:00.000Z",
  "updatedAt": "2026-05-05T00:00:00.000Z"
}
```

The app still accepts `ADMIN_PASSWORD` as a fallback, which is practical for this site.

## Collections

- `quote_requests`: customer quote requests, status, uploaded drawing metadata, tags, follow-up dates, and embedded reply history.
- `admin_users`: optional database-backed admin users.
- `vendors`: reserved future collection for vendor/job assignment workflows.

## Uploads

Quote drawings are saved under `public/uploads/quotes` and served to admins through a protected download route. Admin quotation attachments are saved under `public/uploads/quotations`. The form accepts PDF, JPG, PNG, and DWG files up to 8MB.

For production, move these uploads to object storage such as S3, Cloudinary, or Netlify Blob and keep the same `fileUrl` fields in MongoDB.

## Workflow

1. Customer submits `/get-quote`.
2. Server validates with Zod, stores the quote in MongoDB, saves the drawing, sends admin notification, and sends customer acknowledgement with Quote ID.
3. Admin logs in at `/admin/login`.
4. Admin manages quote status, notes, tags, follow-up date, replies, and PDFs from `/admin`.
5. Customer tracks status from `/track-quote`.

## Local run

```bash
npm install
npm run dev
```
