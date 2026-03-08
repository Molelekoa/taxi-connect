import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const MAILEROO_API_KEY = Deno.env.get("MAILEROO_API_KEY")!;
const MAILEROO_SENDER_EMAIL = Deno.env.get("MAILEROO_SENDER_EMAIL")!;
const APP_URL = Deno.env.get("APP_URL") || "https://parcolo.com";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;

// ─── Parcolo brand email templates ───────────────────────────────────

function baseLayout(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Parcolo</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f9f6;font-family:'Nunito','Inter',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f9f6;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,128,105,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#00917c 0%,#00b894 100%);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;font-family:'Fredoka','Nunito',sans-serif;font-size:28px;font-weight:700;color:#ffffff;letter-spacing:1px;">
                PARCOLO
              </h1>
              <p style="margin:4px 0 0;font-size:10px;font-weight:600;letter-spacing:3px;color:rgba(255,255,255,0.85);text-transform:uppercase;">
                We Deliver Together
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px 28px;border-top:1px solid #e8f5f0;text-align:center;">
              <p style="margin:0;font-size:12px;color:#7a8a84;line-height:1.6;">
                © ${new Date().getFullYear()} Parcolo · South Africa<br/>
                <a href="${APP_URL}/privacy-policy" style="color:#00917c;text-decoration:none;">Privacy Policy</a>
                &nbsp;·&nbsp;
                <a href="${APP_URL}/terms-of-service" style="color:#00917c;text-decoration:none;">Terms of Service</a>
              </p>
              <p style="margin:12px 0 0;font-size:11px;color:#a0afa8;">
                You received this because you signed up at <a href="${APP_URL}" style="color:#00917c;text-decoration:none;">parcolo.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function confirmSignupEmail(confirmUrl: string): string {
  return baseLayout(`
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1a2e28;">
      Welcome aboard! 🎉
    </h2>
    <p style="margin:0 0 24px;font-size:15px;color:#4a5c55;line-height:1.6;">
      Thanks for joining Parcolo — the community-powered delivery network. 
      Please confirm your email to get started.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
      <tr>
        <td style="background:linear-gradient(135deg,#00917c,#00b894);border-radius:10px;">
          <a href="${confirmUrl}" target="_blank" style="display:inline-block;padding:14px 36px;font-family:'Nunito',sans-serif;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.5px;">
            Confirm my email
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:13px;color:#7a8a84;line-height:1.5;">
      If you didn't create a Parcolo account, you can safely ignore this email.
    </p>
  `);
}

function passwordResetEmail(resetUrl: string): string {
  return baseLayout(`
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1a2e28;">
      Reset your password
    </h2>
    <p style="margin:0 0 24px;font-size:15px;color:#4a5c55;line-height:1.6;">
      We received a request to reset your Parcolo password. Click the button below to choose a new one.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
      <tr>
        <td style="background:linear-gradient(135deg,#00917c,#00b894);border-radius:10px;">
          <a href="${resetUrl}" target="_blank" style="display:inline-block;padding:14px 36px;font-family:'Nunito',sans-serif;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.5px;">
            Reset password
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:13px;color:#7a8a84;line-height:1.5;">
      If you didn't request this, your account is safe — just ignore this email.
    </p>
  `);
}

function magicLinkEmail(linkUrl: string): string {
  return baseLayout(`
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1a2e28;">
      Your login link
    </h2>
    <p style="margin:0 0 24px;font-size:15px;color:#4a5c55;line-height:1.6;">
      Click the button below to sign in to your Parcolo account. This link expires in 10 minutes.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
      <tr>
        <td style="background:linear-gradient(135deg,#00917c,#00b894);border-radius:10px;">
          <a href="${linkUrl}" target="_blank" style="display:inline-block;padding:14px 36px;font-family:'Nunito',sans-serif;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.5px;">
            Sign in to Parcolo
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:13px;color:#7a8a84;line-height:1.5;">
      If you didn't request this link, you can safely ignore this email.
    </p>
  `);
}

function emailChangeEmail(confirmUrl: string): string {
  return baseLayout(`
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1a2e28;">
      Confirm your new email
    </h2>
    <p style="margin:0 0 24px;font-size:15px;color:#4a5c55;line-height:1.6;">
      You requested to change your email address on Parcolo. Please confirm by clicking below.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
      <tr>
        <td style="background:linear-gradient(135deg,#00917c,#00b894);border-radius:10px;">
          <a href="${confirmUrl}" target="_blank" style="display:inline-block;padding:14px 36px;font-family:'Nunito',sans-serif;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.5px;">
            Confirm new email
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:13px;color:#7a8a84;line-height:1.5;">
      If you didn't request this change, please contact us immediately.
    </p>
  `);
}

// ─── Email type → template mapping ───────────────────────────────────

function getEmailContent(
  emailType: string,
  actionUrl: string
): { subject: string; html: string } {
  switch (emailType) {
    case "signup":
    case "confirmation":
      return {
        subject: "Welcome to Parcolo — Confirm your email",
        html: confirmSignupEmail(actionUrl),
      };
    case "recovery":
    case "reset":
      return {
        subject: "Reset your Parcolo password",
        html: passwordResetEmail(actionUrl),
      };
    case "magiclink":
    case "magic_link":
      return {
        subject: "Your Parcolo login link",
        html: magicLinkEmail(actionUrl),
      };
    case "email_change":
    case "email_change_new":
    case "email_change_current":
      return {
        subject: "Confirm your new email — Parcolo",
        html: emailChangeEmail(actionUrl),
      };
    default:
      return {
        subject: "Parcolo — Action Required",
        html: confirmSignupEmail(actionUrl),
      };
  }
}

// ─── Send via Maileroo ───────────────────────────────────────────────

async function sendViaMaileroo(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch("https://smtp.maileroo.com/api/v2/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MAILEROO_API_KEY}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        from: {
          address: MAILEROO_SENDER_EMAIL,
          display_name: "Parcolo",
        },
        to: [{ address: to }],
        subject,
        html,
      }),
    });

    const body = await res.text();
    if (!res.ok) {
      console.error("Maileroo error:", res.status, body);
      throw new Error(`Maileroo returned ${res.status}: ${body}`);
    }
    console.log("Email sent successfully to", to);
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Edge function handler ───────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();

    // Support both direct calls and Supabase Auth Hook format
    const emailType =
      payload.type || payload.email_data?.type || "signup";
    const recipientEmail =
      payload.email || payload.user?.email || payload.email_data?.email_address;
    const actionUrl =
      payload.action_url ||
      payload.email_data?.confirmation_url ||
      payload.email_data?.action_link ||
      `${APP_URL}`;

    if (!recipientEmail) {
      return new Response(
        JSON.stringify({ error: "Missing recipient email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { subject, html } = getEmailContent(emailType, actionUrl);
    await sendViaMaileroo(recipientEmail, subject, html);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("send-auth-email error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to send email" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
