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

  await sendEmail(to, subject, html, text);
}

// ── Shared Transport Helper ──
async function sendEmail(to: string, subject: string, html: string, text: string) {
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
        console.log(`[EMAIL] Sent via Resend to ${to}`);
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

      console.log(`[EMAIL] Sent via Gmail SMTP to ${to}`);
      return;
    } catch (err) {
      console.error('[EMAIL] Gmail SMTP failed:', err);
    }
  }

  console.warn('[EMAIL] No email provider configured — email not sent. Payload:', { to, subject });
}

// ── Notification Templates ──

function getBaseTemplate(title: string, contentHtml: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>${title}</title></head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 0;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,0.10);max-width:580px;">
        <tr>
          <td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);padding:40px 40px 32px 40px;text-align:center;">
             <span style="color:#ffffff;font-size:26px;font-weight:800;letter-spacing:-0.5px;">PAX</span><br/>
             <span style="color:rgba(255,255,255,0.75);font-size:13px;letter-spacing:1.5px;text-transform:uppercase;margin-top:4px;display:block;">Secure Escrow Platform</span>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 48px 32px 48px;">
            ${contentHtml}
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:24px 48px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#d1d5db;">© ${new Date().getFullYear()} PAX · Secure Freelance Escrow Platform</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();
}

export async function sendProjectCreatedEmail(to: string, projectTitle: string, joinCode: string) {
  const content = `
    <h2 style="margin:0 0 16px 0;font-size:22px;color:#111827;">Project Created Successfully</h2>
    <p style="margin:0 0 20px 0;font-size:15px;color:#4b5563;line-height:1.6;">Your project <strong>${projectTitle}</strong> has been created. Share the code below with your freelancer so they can join.</p>
    <div style="background:#f8f9ff;border:1.5px dashed #c7d2fe;border-radius:12px;padding:20px;text-align:center;">
      <span style="font-size:14px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Join Code</span><br/>
      <span style="display:inline-block;margin-top:8px;font-size:32px;font-weight:800;letter-spacing:4px;color:#4f46e5;font-family:monospace;">${joinCode}</span>
    </div>
  `;
  const subject = `Project Created: ${projectTitle}`;
  const html = getBaseTemplate(subject, content);
  const text = `Project Created: ${projectTitle}\n\nJoin Code: ${joinCode}`;
  await sendEmail(to, subject, html, text);
}

export async function sendEscrowFundedEmail(to: string, projectTitle: string, amount: number) {
  const content = `
    <h2 style="margin:0 0 16px 0;font-size:22px;color:#111827;">Escrow Funded! 🔒</h2>
    <p style="margin:0 0 20px 0;font-size:15px;color:#4b5563;line-height:1.6;">Great news! The buyer has securely funded the escrow for <strong>${projectTitle}</strong> with <strong>$${(amount / 100).toFixed(2)}</strong>.</p>
    <p style="margin:0;font-size:15px;color:#4b5563;line-height:1.6;">You can now safely begin working on the milestones. Your payment is secured and guaranteed upon approval.</p>
  `;
  const subject = `Escrow Secured: ${projectTitle}`;
  const html = getBaseTemplate(subject, content);
  const text = `Escrow Secured for ${projectTitle}\n\nAmount: $${(amount / 100).toFixed(2)}\n\nYou can now safely begin working.`;
  await sendEmail(to, subject, html, text);
}

export async function sendWorkSubmittedEmail(to: string, projectTitle: string, milestoneTitle: string) {
  const content = `
    <h2 style="margin:0 0 16px 0;font-size:22px;color:#111827;">Review Requested 📝</h2>
    <p style="margin:0 0 20px 0;font-size:15px;color:#4b5563;line-height:1.6;">Your freelancer has submitted work for the milestone: <strong>${milestoneTitle}</strong> on project <strong>${projectTitle}</strong>.</p>
    <p style="margin:0;font-size:15px;color:#4b5563;line-height:1.6;">Please log in to PAX Escrow to review the deliverables and approve the payment release, or request a revision if needed.</p>
  `;
  const subject = `Review Requested: ${projectTitle}`;
  const html = getBaseTemplate(subject, content);
  const text = `Work submitted for milestone: ${milestoneTitle} in project: ${projectTitle}.\nPlease log in to review.`;
  await sendEmail(to, subject, html, text);
}

export async function sendPaymentReleasedEmail(to: string, projectTitle: string, amount: number) {
  const content = `
    <h2 style="margin:0 0 16px 0;font-size:22px;color:#111827;">Payment Released! 💸</h2>
    <p style="margin:0 0 20px 0;font-size:15px;color:#4b5563;line-height:1.6;">Congratulations! The buyer has approved your work for <strong>${projectTitle}</strong>.</p>
    <div style="background:#f0faeb;border:1.5px solid #bbf7d0;border-radius:12px;padding:20px;text-align:center;">
      <span style="font-size:14px;color:#166534;font-weight:600;">Amount Released</span><br/>
      <span style="display:inline-block;margin-top:8px;font-size:32px;font-weight:800;color:#15803d;">$${(amount / 100).toFixed(2)}</span>
    </div>
    <p style="margin:20px 0 0 0;font-size:15px;color:#4b5563;line-height:1.6;">The funds are currently on their way to your registered bank account.</p>
  `;
  const subject = `Payment Released: $${(amount / 100).toFixed(2)}`;
  const html = getBaseTemplate(subject, content);
  const text = `Payment Released: $${(amount / 100).toFixed(2)} for ${projectTitle}.\nFunds are on the way.`;
  await sendEmail(to, subject, html, text);
}
