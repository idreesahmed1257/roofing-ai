import nodemailer from "nodemailer";
import type { Lead } from "./leads";

export type BrevoSendResult =
  | { ok: true; messageId: string }
  | { ok: false; skipped?: boolean; error: string };

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function buildEmail(lead: Lead) {
  const subject = `New estimate request — ${lead.name} (${lead.phone})`;
  const rows = [
    ["Lead ID", lead.id],
    ["Name", lead.name],
    ["Phone", lead.phone],
    ["Email", lead.email || "—"],
    ["Address", lead.address || "—"],
    ["Issue", lead.issue_summary],
    ["Preferred time", lead.preferred_time || "—"],
    ["Created", lead.createdAt],
  ]
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666;width:140px;">${escapeHtml(label)}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;"><strong>${escapeHtml(String(value))}</strong></td></tr>`,
    )
    .join("");

  const html = `
    <div style="font-family:Segoe UI,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
      <h2 style="margin:0 0 8px;">New AI sales agent lead</h2>
      <p style="margin:0 0 16px;color:#555;">A homeowner booked an estimate through the Ridgeform demo voice sales agent.</p>
      <table style="width:100%;border-collapse:collapse;background:#fafafa;border:1px solid #eee;">${rows}</table>
      <p style="margin:16px 0 0;color:#888;font-size:12px;">Sent by the Ridgeform Roofing voice demo via Brevo.</p>
    </div>
  `;

  const text = [
    "New AI sales agent lead",
    `Lead ID: ${lead.id}`,
    `Name: ${lead.name}`,
    `Phone: ${lead.phone}`,
    `Email: ${lead.email || "—"}`,
    `Address: ${lead.address || "—"}`,
    `Issue: ${lead.issue_summary}`,
    `Preferred time: ${lead.preferred_time || "—"}`,
    `Created: ${lead.createdAt}`,
  ].join("\n");

  return { subject, html, text };
}

async function sendViaRestApi(
  lead: Lead,
  apiKey: string,
  toEmail: string,
  fromEmail: string,
  fromName: string,
): Promise<BrevoSendResult> {
  const { subject, html, text } = buildEmail(lead);
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: { name: fromName, email: fromEmail },
      to: [{ email: toEmail }],
      subject,
      htmlContent: html,
      textContent: text,
      tags: ["ridgeform-demo", "voice-lead"],
    }),
  });

  const data = (await res.json().catch(() => ({}))) as {
    messageId?: string;
    message?: string;
  };

  if (!res.ok) {
    return { ok: false, error: data.message || `Brevo HTTP ${res.status}` };
  }

  return { ok: true, messageId: data.messageId || "sent" };
}

async function sendViaSmtp(
  lead: Lead,
  smtpKey: string,
  toEmail: string,
  fromEmail: string,
  fromName: string,
  smtpLogin: string,
): Promise<BrevoSendResult> {
  const { subject, html, text } = buildEmail(lead);
  const transporter = nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST?.trim() || "smtp-relay.brevo.com",
    port: Number(process.env.BREVO_SMTP_PORT || "587"),
    secure: false,
    auth: {
      user: smtpLogin,
      pass: smtpKey,
    },
  });

  const info = await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: toEmail,
    subject,
    text,
    html,
  });

  return { ok: true, messageId: info.messageId || "sent" };
}

export async function sendLeadNotificationEmail(
  lead: Lead,
): Promise<BrevoSendResult> {
  const restApiKey =
    process.env.BREVO_API_KEY?.trim() ||
    process.env.BREVO_API_KEY_V3?.trim() ||
    "";
  const smtpKey =
    process.env.SMTP_API_KEY?.trim() ||
    process.env.BREVO_SMTP_KEY?.trim() ||
    "";
  const toEmail = process.env.BREVO_TO_EMAIL?.trim();
  const fromEmail = process.env.BREVO_FROM_EMAIL?.trim();
  const fromName =
    process.env.BREVO_FROM_NAME?.trim() || "Ridgeform Roofing Demo";
  const smtpLogin =
    process.env.BREVO_SMTP_LOGIN?.trim() ||
    process.env.BREVO_SMTP_USER?.trim() ||
    fromEmail ||
    "";

  if (!toEmail || !fromEmail) {
    return {
      ok: false,
      skipped: true,
      error:
        "Set BREVO_TO_EMAIL (your inbox) and BREVO_FROM_EMAIL (verified Brevo sender).",
    };
  }

  try {
    // Prefer REST API key (xkeysib-...) when present
    if (restApiKey) {
      return await sendViaRestApi(
        lead,
        restApiKey,
        toEmail,
        fromEmail,
        fromName,
      );
    }

    // SMTP key (xsmtpsib-...) — what you added as SMTP_API_KEY
    if (smtpKey) {
      if (!smtpLogin) {
        return {
          ok: false,
          skipped: true,
          error:
            "SMTP key found, but set BREVO_SMTP_LOGIN (Brevo account email / SMTP login) too.",
        };
      }
      return await sendViaSmtp(
        lead,
        smtpKey,
        toEmail,
        fromEmail,
        fromName,
        smtpLogin,
      );
    }

    return {
      ok: false,
      skipped: true,
      error: "Missing SMTP_API_KEY or BREVO_API_KEY.",
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Email send failed",
    };
  }
}
