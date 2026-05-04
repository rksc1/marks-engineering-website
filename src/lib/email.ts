import { siteConfig } from "@/lib/utils";

type EmailPayload = {
  subject: string;
  fields: Record<string, string>;
};

export async function sendInquiryEmail(payload: EmailPayload) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const to = process.env.INQUIRY_EMAIL_TO || siteConfig.email;
  const from = process.env.INQUIRY_EMAIL_FROM || "MARKS Website <onboarding@resend.dev>";

  const html = `
    <h2>${escapeHtml(payload.subject)}</h2>
    <table cellpadding="8" cellspacing="0" border="1" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">
      ${Object.entries(payload.fields)
        .map(
          ([key, value]) =>
            `<tr><th align="left">${escapeHtml(labelize(key))}</th><td>${escapeHtml(value || "-")}</td></tr>`
        )
        .join("")}
    </table>
  `;

  if (!resendApiKey) {
    console.info("Inquiry email payload", { to, subject: payload.subject, fields: payload.fields });
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to,
      subject: payload.subject,
      html
    })
  });

  if (!response.ok) {
    throw new Error(`Email provider failed with status ${response.status}`);
  }
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
