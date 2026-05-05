import nodemailer from "nodemailer";

import { quoteStatusLabels } from "@/lib/quote-schema";
import { siteConfig } from "@/lib/utils";

type EmailPayload = {
  subject: string;
  fields: Record<string, string>;
};

type QuoteAcknowledgementPayload = {
  to: string;
  name: string;
  quoteId: string;
  title: string;
};

type AdminNotificationPayload = {
  quoteId: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  title: string;
  category: string;
  description: string;
};

type QuoteReplyEmailPayload = {
  to: string;
  name: string;
  quoteId: string;
  subject: string;
  message: string;
  amount?: number | string | null;
  timeline?: string | null;
  attachmentPath?: string | null;
  attachment?: {
    filename: string;
    content: Buffer;
    contentType: string;
  } | null;
};

export async function sendInquiryEmail(payload: EmailPayload) {
  const to = process.env.INQUIRY_EMAIL_TO || siteConfig.email;
  await sendMail({
    to,
    subject: payload.subject,
    html: tableTemplate(payload.subject, payload.fields)
  });
}

export async function sendQuoteAcknowledgement(payload: QuoteAcknowledgementPayload) {
  await sendMail({
    to: payload.to,
    subject: `Quote request received: ${payload.quoteId}`,
    html: baseTemplate(
      "Thank you for your quotation request.",
      `
        <p>Hello ${escapeHtml(payload.name)},</p>
        <p>We have received your request for <strong>${escapeHtml(payload.title)}</strong>.</p>
        <p>Your Quote ID is <strong>${escapeHtml(payload.quoteId)}</strong>. Please keep this ID for status tracking.</p>
        <p>Our team will review the details and contact you soon.</p>
      `
    )
  });
}

export async function sendQuoteAdminNotification(payload: AdminNotificationPayload) {
  const to = process.env.INQUIRY_EMAIL_TO || siteConfig.email;
  await sendMail({
    to,
    subject: `New quote request ${payload.quoteId}: ${payload.title}`,
    html: tableTemplate("New quote request", {
      quoteId: payload.quoteId,
      name: payload.name,
      email: payload.email,
      phone: payload.phone || "",
      company: payload.company || "",
      title: payload.title,
      category: payload.category,
      description: payload.description
    })
  });
}

export async function sendQuoteReplyEmail(payload: QuoteReplyEmailPayload) {
  const amountLine = payload.amount ? `<p><strong>Estimated amount:</strong> ${escapeHtml(formatCurrency(payload.amount))}</p>` : "";
  const timelineLine = payload.timeline ? `<p><strong>Timeline:</strong> ${escapeHtml(payload.timeline)}</p>` : "";

  await sendMail({
    to: payload.to,
    subject: payload.subject,
    html: baseTemplate(
      `Quotation response for ${payload.quoteId}`,
      `
        <p>Hello ${escapeHtml(payload.name)},</p>
        <p>Thank you for sharing your fabrication requirement with ${escapeHtml(siteConfig.shortName)}.</p>
        ${amountLine}
        ${timelineLine}
        <div style="margin:18px 0;padding:14px;border-left:4px solid #b91c1c;background:#f8fafc">
          ${escapeHtml(payload.message).replace(/\n/g, "<br />")}
        </div>
        <p>Please reply to this email for clarifications or approval.</p>
      `
    ),
    attachments: [
      ...(payload.attachmentPath ? [{ path: payload.attachmentPath }] : []),
      ...(payload.attachment ? [payload.attachment] : [])
    ]
  });
}

export function quoteStatusEmailLine(status: keyof typeof quoteStatusLabels) {
  return `Current status: ${quoteStatusLabels[status]}`;
}

async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{ filename?: string; path?: string; content?: Buffer; contentType?: string }>;
}) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || process.env.INQUIRY_EMAIL_FROM || `MARKS Engineering <${siteConfig.email}>`;

  if (!host || !user || !pass) {
    console.info("Email payload", { ...options, html: options.html.slice(0, 500) });
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });

  await transporter.sendMail({
    from,
    ...options
  });
}

function tableTemplate(title: string, fields: Record<string, string>) {
  return baseTemplate(
    title,
    `
      <table cellpadding="8" cellspacing="0" border="1" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">
        ${Object.entries(fields)
          .map(([key, value]) => `<tr><th align="left">${escapeHtml(labelize(key))}</th><td>${escapeHtml(value || "-")}</td></tr>`)
          .join("")}
      </table>
    `
  );
}

function baseTemplate(title: string, body: string) {
  return `
    <div style="font-family:Arial,sans-serif;color:#18181b;line-height:1.6">
      <h2 style="margin:0 0 16px">${escapeHtml(title)}</h2>
      ${body}
      <p style="margin-top:24px;color:#52525b">Regards,<br />MARKS Engineering & Co.</p>
    </div>
  `;
}

function formatCurrency(value: number | string) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return String(value);
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

function labelize(value: string) {
  return value.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
