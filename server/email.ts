export async function sendOtpEmail(to: string, otp: string) {
  // ALWAYS log OTP to console — readable in Render logs as fallback
  console.log(`[OTP] Code for ${to}: ${otp}`);

  const otpDigits = otp
    .split('')
    .map(
      (d) =>
        `<td style="width:48px;height:56px;background:#f0f4ff;border:2px solid #e0e7ff;border-radius:10px;text-align:center;vertical-align:middle;font-size:28px;font-weight:800;color:#4f46e5;font-family:'Courier New',monospace;padding:0 4px;">${d}</td>`
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>PAX – Verify Your Login</title></head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 0;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,0.10);max-width:580px;">
        <tr>
          <td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);padding:40px 40px 32px 40px;text-align:center;">
            <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:16px;padding:12px 16px;margin-bottom:16px;"><span style="font-size:28px;">🔐</span></div><br/>
            <span style="color:#ffffff;font-size:26px;font-weight:800;letter-spacing:-0.5px;">PAX</span><br/>
            <span style="color:rgba(255,255,255,0.75);font-size:13px;letter-spacing:1.5px;text-transform:uppercase;margin-top:4px;display:block;">Secure Escrow Platform</span>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 48px 32px 48px;">
            <p style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:#111827;">Verify Your Identity</p>
            <p style="margin:0 0 28px 0;font-size:15px;color:#6b7280;line-height:1.6;">
              Use the one-time code below to securely access your <strong>PAX</strong> account. Valid for <strong>10 minutes</strong>.
            </p>
            <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 28px 0;">
              <tr>
                <td align="center" style="background:#f8f9ff;border:1.5px dashed #c7d2fe;border-radius:16px;padding:28px 20px;">
                  <p style="margin:0 0 12px 0;font-size:12px;text-transform:uppercase;letter-spacing:2px;color:#6b7280;font-weight:600;">Your One-Time Login Code</p>
                  <table cellpadding="0" cellspacing="6" style="margin:0 auto;"><tr>${otpDigits}</tr></table>
                  <p style="margin:14px 0 0 0;font-size:12px;color:#9ca3af;">⏱ Expires in 10 minutes</p>
                </td>
              </tr>
            </table>
            <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 28px 0;">
              <tr>
                <td style="background:#fffbeb;border-left:4px solid #f59e0b;border-radius:0 10px 10px 0;padding:14px 18px;">
                  <p style="margin:0;font-size:13px;color:#92400e;line-height:1.5;">
                    <strong>⚠️ Security Alert:</strong> PAX will <strong>never</strong> ask you for this code. If you didn't request this, please ignore this email.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:24px 48px;text-align:center;">
            <p style="margin:0 0 6px 0;font-size:12px;color:#9ca3af;">Sent to <strong>${to}</strong></p>
            <p style="margin:0;font-size:12px;color:#d1d5db;">© ${new Date().getFullYear()} PAX · Secure Freelance Escrow Platform</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();

  const text = `PAX – Your Login Code\n\nYour one-time login code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you did not request this code, please ignore this email.\n\n© ${new Date().getFullYear()} PAX`;

  const subject = `${otp} is your PAX verification code`;

  // ── Option 1: Resend API (works on Render free tier — uses HTTPS port 443) ──
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'PAX <onboarding@resend.dev>',
          to: [to],
          subject,
          html,
          text,
        }),
      });
      if (res.ok) {
        console.log(`[EMAIL] OTP sent via Resend to ${to}`);
        return;
      }
      const err = await res.text();
      console.error(`[EMAIL] Resend error: ${err}`);
    } catch (err) {
      console.error('[EMAIL] Resend fetch failed:', err);
    }
    return;
  }

  // ── Option 2: Gmail SMTP via nodemailer (works on localhost) ──
  if (process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
    try {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.default.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.SMTP_EMAIL,
          pass: process.env.SMTP_PASSWORD,
        },
        tls: { rejectUnauthorized: false },
      });

      await transporter.sendMail({
        from: `"PAX" <${process.env.SMTP_EMAIL}>`,
        to,
        subject,
        html,
        text,
      });

      console.log(`[EMAIL] OTP sent via Gmail SMTP to ${to}`);
      return;
    } catch (err) {
      console.error('[EMAIL] Gmail SMTP failed:', err);
    }
  }

  console.warn('[EMAIL] No email provider configured — OTP only available in logs above.');
}
