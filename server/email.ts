import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use STARTTLS (port 587) — port 465 is blocked on Render free tier
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export async function sendOtpEmail(to: string, otp: string) {
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    console.warn("SMTP_EMAIL or SMTP_PASSWORD not set. Logging OTP instead.");
    console.log(`[OTP] Email to ${to}: ${otp}`);
    return;
  }

  const otpDigits = otp.split('').join('</td><td style="width:48px;height:56px;background:#f0f4ff;border:2px solid #e0e7ff;border-radius:10px;text-align:center;vertical-align:middle;font-size:28px;font-weight:800;color:#4f46e5;font-family:\'Courier New\',monospace;padding:0 4px;margin:0 4px;">');

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>TrustLayer – Verify Your Login</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif;">

  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 0;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,0.10);max-width:580px;">

          <!-- Header Banner -->
          <tr>
            <td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);padding:40px 40px 32px 40px;text-align:center;">
              <!-- Logo Icon -->
              <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:16px;padding:12px 16px;margin-bottom:16px;">
                <span style="font-size:28px;">🔐</span>
              </div>
              <br/>
              <span style="color:#ffffff;font-size:26px;font-weight:800;letter-spacing:-0.5px;">TrustLayer</span>
              <br/>
              <span style="color:rgba(255,255,255,0.75);font-size:13px;letter-spacing:1.5px;text-transform:uppercase;margin-top:4px;display:block;">Secure Escrow Platform</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 48px 32px 48px;">

              <!-- Greeting -->
              <p style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:#111827;">Verify Your Identity</p>
              <p style="margin:0 0 28px 0;font-size:15px;color:#6b7280;line-height:1.6;">
                Someone (hopefully you!) is trying to log into <strong>TrustLayer</strong>.
                Use the one-time code below to securely access your account.
                This code is valid for <strong>10 minutes</strong>.
              </p>

              <!-- OTP Box -->
              <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 28px 0;">
                <tr>
                  <td align="center" style="background:#f8f9ff;border:1.5px dashed #c7d2fe;border-radius:16px;padding:28px 20px;">
                    <p style="margin:0 0 12px 0;font-size:12px;text-transform:uppercase;letter-spacing:2px;color:#6b7280;font-weight:600;">Your One-Time Login Code</p>
                    <!-- OTP Digits -->
                    <table cellpadding="0" cellspacing="6" style="margin:0 auto;">
                      <tr>
                        <td style="width:48px;height:56px;background:#f0f4ff;border:2px solid #e0e7ff;border-radius:10px;text-align:center;vertical-align:middle;font-size:28px;font-weight:800;color:#4f46e5;font-family:'Courier New',monospace;padding:0 4px;margin:0 4px;">${otpDigits}</td>
                      </tr>
                    </table>
                    <p style="margin:14px 0 0 0;font-size:12px;color:#9ca3af;">⏱ Expires in 10 minutes from when it was sent</p>
                  </td>
                </tr>
              </table>

              <!-- Security Notice -->
              <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 28px 0;">
                <tr>
                  <td style="background:#fffbeb;border-left:4px solid #f59e0b;border-radius:0 10px 10px 0;padding:14px 18px;">
                    <p style="margin:0;font-size:13px;color:#92400e;line-height:1.5;">
                      <strong>⚠️ Security Alert:</strong> TrustLayer will <strong>never</strong> call or email you asking for this code.
                      If you didn't request this, your account may be at risk — please ignore this email and change your email address immediately.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- What is TrustLayer blurb -->
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="border-top:1px solid #f3f4f6;padding-top:24px;">
                    <p style="margin:0 0 12px 0;font-size:13px;font-weight:600;color:#374151;text-transform:uppercase;letter-spacing:1px;">Why TrustLayer?</p>
                    <table cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="width:33%;text-align:center;padding:12px 8px;background:#f9fafb;border-radius:10px;">
                          <div style="font-size:22px;margin-bottom:6px;">🏦</div>
                          <p style="margin:0;font-size:11px;font-weight:600;color:#374151;">Secure Escrow</p>
                          <p style="margin:2px 0 0;font-size:11px;color:#9ca3af;">Funds held safely</p>
                        </td>
                        <td style="width:4%;"></td>
                        <td style="width:33%;text-align:center;padding:12px 8px;background:#f9fafb;border-radius:10px;">
                          <div style="font-size:22px;margin-bottom:6px;">🎯</div>
                          <p style="margin:0;font-size:11px;font-weight:600;color:#374151;">Milestones</p>
                          <p style="margin:2px 0 0;font-size:11px;color:#9ca3af;">Pay on delivery</p>
                        </td>
                        <td style="width:4%;"></td>
                        <td style="width:33%;text-align:center;padding:12px 8px;background:#f9fafb;border-radius:10px;">
                          <div style="font-size:22px;margin-bottom:6px;">✅</div>
                          <p style="margin:0;font-size:11px;font-weight:600;color:#374151;">Dispute Free</p>
                          <p style="margin:2px 0 0;font-size:11px;color:#9ca3af;">UAT verified</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:24px 48px;text-align:center;">
              <p style="margin:0 0 6px 0;font-size:12px;color:#9ca3af;">
                This email was sent to <strong>${to}</strong>. If you didn't request a login, please ignore this.
              </p>
              <p style="margin:0;font-size:12px;color:#d1d5db;">
                © ${new Date().getFullYear()} TrustLayer · Secure Freelance Escrow Platform
              </p>
            </td>
          </tr>

        </table>
        <!-- End Card -->

      </td>
    </tr>
  </table>

</body>
</html>
    `.trim();

  const text = `
TrustLayer – Your Login Code

Hi there,

Your one-time login code is: ${otp}

This code will expire in 10 minutes.

If you did not request this code, please ignore this email.

© ${new Date().getFullYear()} TrustLayer
    `.trim();

  try {
    const info = await transporter.sendMail({
      from: `"TrustLayer 🔐" <${process.env.SMTP_EMAIL}>`,
      to,
      subject: `${otp} is your TrustLayer verification code`,
      text,
      html,
    });
    console.log("OTP email sent: %s", info.messageId);
  } catch (err) {
    console.error("Error sending OTP email", err);
  }
}
