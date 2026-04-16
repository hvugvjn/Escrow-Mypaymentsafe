// ============================================================
// PAX â€“ Professional Email Service  |  Powered by Resend API
// ============================================================
// Categories:
//   OTP          â†’ Zero-latency, tracking DISABLED for max speed
//   Milestone    â†’ Project lifecycle updates, tracking ENABLED
//   Marketing    â†’ High-conversion onboarding, tracking ENABLED
// Brand: #0e4573 (Deep Blue) Â· #f2df74 (Gold) Â· #722f37 (Wine)
// ============================================================

// â”€â”€ Brand Design Tokens â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const C = {
  primary:    '#0e4573', // Deep Blue
  secondary:  '#f2df74', // Gold / Yellow
  accent:     '#722f37', // Wine / Deep Red
  white:      '#ffffff',
  bg:         '#eef2f7',
  cardBg:     '#ffffff',
  text:       '#0d1f2d',
  muted:      '#4a6580',
  border:     '#cddaea',
  success:    '#1a7a47',
  successBg:  '#edfaf3',
  darkblue:   '#071e33',
};

const FONT = "'Montserrat','Trebuchet MS',Arial,sans-serif";

// Sender addresses â€” paxdot.com must be verified in Resend dashboard first
const FROM_OTP       = 'PAX Security <security@paxdot.com>';
const FROM_NOTIFY    = 'PAX Notifications <notifications@paxdot.com>';
const FROM_MARKETING = 'Vishal from PAX <hello@paxdot.com>'; // personal name â†’ avoids Promotions
const REPLY_TO       = 'support@paxdot.com';

// â”€â”€ Core Resend API Sender â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface ResendPayload {
  from: string;
  reply_to?: string;
  to: string[];
  subject: string;
  html: string;
  text: string;
  tags?: { name: string; value: string }[];
  headers?: Record<string, string>;
}

async function sendViaResend(
  payload: ResendPayload,
  trackingEnabled: boolean = true
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error('[EMAIL] â€¼ï¸  RESEND_API_KEY is not set. Email not sent.');
    console.warn(`[EMAIL FALLBACK] Would have sent â†’ To: ${payload.to.join(', ')} | Subject: "${payload.subject}"`);
    return;
  }

  // Merge anti-spam / deliverability headers
  const body = {
    ...payload,
    headers: {
      'X-Mailer': 'PAX-Mailer/1.0',
      'X-Entity-Ref-ID': `pax-${Date.now()}`,
      ...(payload.headers ?? {}),
    },
  };

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // â”€â”€ Success â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (res.status === 200 || res.status === 201) {
      const data = await res.json() as { id?: string };
      console.log(`[EMAIL] âœ… Delivered via Resend â†’ ${payload.to.join(', ')} | id: ${data.id ?? 'n/a'}`);
      return;
    }

    // â”€â”€ Error: non-200/201 response â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const errorText = await res.text();
    console.error(`[EMAIL] âŒ Resend error (HTTP ${res.status}): ${errorText}`);

    // Structured fallback alert â€” pipe this to Slack / PagerDuty if needed
    console.error(JSON.stringify({
      level: 'ALERT',
      service: 'resend-email',
      statusCode: res.status,
      to: payload.to,
      subject: payload.subject,
      error: errorText,
      timestamp: new Date().toISOString(),
    }));

    throw new Error(`Resend API returned ${res.status}: ${errorText}`);

  } catch (err: any) {
    // â”€â”€ Network / fetch failure â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (!err.message?.startsWith('Resend API returned')) {
      console.error('[EMAIL] âŒ Network error reaching Resend:', err.message);
      console.error(JSON.stringify({
        level: 'ALERT',
        service: 'resend-email',
        type: 'network_failure',
        to: payload.to,
        subject: payload.subject,
        error: err.message,
        timestamp: new Date().toISOString(),
      }));
    }
    throw err;
  }
}

// â”€â”€ Base Email Shell â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function buildBaseTemplate(
  pageTitle: string,
  headerLabel: string,
  bodyHtml: string,
  footerNote = ''
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>${pageTitle}</title>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
</head>
<body style="margin:0;padding:0;background-color:${C.bg};font-family:${FONT};-webkit-font-smoothing:antialiased;mso-line-height-rule:exactly;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${C.bg};padding:32px 12px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" role="presentation"
             style="max-width:600px;width:100%;background:${C.cardBg};border-radius:24px;overflow:hidden;box-shadow:0 12px 48px rgba(14,69,115,0.13);">

        <!-- â•â•â• HEADER â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• -->
        <tr>
          <td style="background:linear-gradient(140deg,${C.primary} 0%,#1560a8 60%,#0a3358 100%);padding:40px 40px 32px 40px;text-align:center;">
            <!-- Logo pill -->
            <div style="display:inline-block;background:${C.secondary};border-radius:14px;padding:9px 22px;margin-bottom:18px;">
              <span style="font-family:${FONT};font-size:20px;font-weight:800;color:${C.primary};letter-spacing:4px;">PAX</span>
            </div>
            <!-- Tagline -->
            <div style="color:rgba(255,255,255,0.75);font-size:11px;letter-spacing:2.5px;text-transform:uppercase;font-weight:600;">${headerLabel}</div>
          </td>
        </tr>

        <!-- â•â•â• BODY â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• -->
        <tr>
          <td style="padding:40px 44px 36px 44px;">
            ${bodyHtml}
          </td>
        </tr>

        <!-- â•â•â• DIVIDER â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• -->
        <tr><td style="padding:0 40px;"><div style="border-top:1px solid ${C.border};"></div></td></tr>

        <!-- â•â•â• FOOTER â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• -->
        <tr>
          <td style="padding:24px 40px 28px 40px;text-align:center;background:#f4f7fb;border-radius:0 0 24px 24px;">
            ${footerNote
              ? `<p style="margin:0 0 10px 0;font-size:12px;color:${C.muted};">${footerNote}</p>`
              : ''}
            <p style="margin:0;font-size:11px;color:#90a8c0;line-height:1.6;">
              Â© ${new Date().getFullYear()} PAX Â· Secure Milestone Escrow Platform Â·
              <a href="https://paxdot.com" style="color:${C.primary};text-decoration:none;font-weight:600;">paxdot.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// â”€â”€ Milestone Progress Bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// activeStep: 1=Agreement  2=Escrow  3=Approved  4=Released
function buildProgressBar(activeStep: 1 | 2 | 3 | 4): string {
  const steps = [
    { icon: 'ðŸ“‹', label: 'Agreement\nSigned'   },
    { icon: 'ðŸ”’', label: 'Funds in\nEscrow'    },
    { icon: 'âœ…', label: 'Work\nApproved'      },
    { icon: 'ðŸ’¸', label: 'Payment\nReleased'   },
  ];

  const connectors = steps.map((_, i) => i < steps.length - 1).filter(Boolean);

  const stepCells = steps.map((s, i) => {
    const n = i + 1;
    const isDone   = n < activeStep;
    const isActive = n === activeStep;
    const isPending = n > activeStep;

    const bgColor     = isDone ? C.success : isActive ? C.primary : '#d8e4f0';
    const textColor   = (isDone || isActive) ? C.white : '#8faec8';
    const labelColor  = isActive ? C.primary : isDone ? C.success : '#8faec8';
    const fontWeight  = isActive ? '700' : '500';
    const glow        = isActive ? `box-shadow:0 0 0 5px rgba(242,223,116,0.35);` : '';
    const border      = isActive ? `border:2.5px solid ${C.secondary};` : 'border:2.5px solid transparent;';

    return `
      <td width="25%" style="text-align:center;vertical-align:top;padding:0 4px;">
        <!-- Circle -->
        <div style="width:52px;height:52px;border-radius:50%;background:${bgColor};margin:0 auto 10px auto;
                    line-height:48px;font-size:22px;${border}${glow}text-align:center;">
          ${s.icon}
        </div>
        <!-- Label -->
        <div style="font-size:11px;font-weight:${fontWeight};color:${labelColor};line-height:1.5;white-space:pre-line;">${s.label}</div>
        <!-- Active badge -->
        ${isActive ? `
          <div style="margin-top:7px;">
            <span style="background:${C.secondary};color:${C.primary};font-size:9px;font-weight:800;
                         padding:3px 10px;border-radius:20px;letter-spacing:1px;text-transform:uppercase;">NOW</span>
          </div>` : ''}
      </td>
      ${i < steps.length - 1 ? `
      <td style="vertical-align:top;padding-top:26px;">
        <div style="height:2px;background:${n < activeStep ? C.success : C.border};min-width:6px;border-radius:2px;"></div>
      </td>` : ''}
    `;
  }).join('');

  return `
    <div style="background:#f0f6ff;border-radius:18px;padding:28px 16px 24px 16px;margin:24px 0;border:1px solid ${C.border};">
      <p style="text-align:center;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2.5px;
                color:${C.muted};margin:0 0 22px 0;">Project Progress</p>
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>${stepCells}</tr>
      </table>
    </div>`;
}

// â”€â”€ CTA Button â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ctaButton(label: string, href = 'https://paxdot.com/dashboard'): string {
  return `
    <div style="text-align:center;margin-top:32px;">
      <a href="${href}"
         style="display:inline-block;background:linear-gradient(135deg,${C.primary} 0%,#1a6aad 100%);
                color:${C.white};padding:15px 36px;text-decoration:none;border-radius:14px;
                font-weight:700;font-size:14px;letter-spacing:0.5px;
                box-shadow:0 8px 24px rgba(14,69,115,0.28);">${label}</a>
    </div>`;
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// 1ï¸âƒ£  OTP EMAIL â€” Minimalist Â· High-Security Â· Tracking DISABLED
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  // Always log OTP to server console as a hard fallback (visible in Render logs)
  console.log(`[OTP] Code for ${to}: ${otp}`);

  const digitCells = otp.split('').map(d => `
    <td style="width:54px;height:64px;
               background:#f0f6ff;
               border:2px solid ${C.primary};
               border-radius:12px;
               text-align:center;
               vertical-align:middle;
               font-size:32px;
               font-weight:800;
               color:${C.primary};
               font-family:'Courier New',Courier,monospace;">
      ${d}
    </td>
    <td style="width:6px;"></td>
  `).join('');

  const body = `
    <!-- Heading -->
    <p style="margin:0 0 6px 0;font-size:26px;font-weight:800;color:${C.text};letter-spacing:-0.5px;">
      Verify Your Identity
    </p>
    <p style="margin:0 0 30px 0;font-size:14px;color:${C.muted};line-height:1.7;">
      Use the one-time code below to securely access your <strong>PAX</strong> account.
      Valid for <strong>10 minutes</strong> â€” do not share it with anyone.
    </p>

    <!-- OTP Card -->
    <div style="background:#f7f9ff;border:1.5px dashed ${C.primary};border-radius:18px;
                padding:32px 20px;text-align:center;margin-bottom:28px;">
      <p style="margin:0 0 18px 0;font-size:10.5px;text-transform:uppercase;letter-spacing:3px;
                color:${C.muted};font-weight:700;">Your One-Time Login Code</p>

      <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto;">
        <tr>${digitCells}</tr>
      </table>

      <p style="margin:18px 0 0 0;font-size:12px;color:${C.muted};">â± Expires in 10 minutes</p>
    </div>

    <!-- Security Warning -->
    <div style="background:#fff8f2;border-left:4px solid ${C.accent};border-radius:0 12px 12px 0;padding:16px 20px;">
      <p style="margin:0;font-size:13px;color:#5c1c24;line-height:1.65;">
        <strong>âš ï¸ Security Notice:</strong> PAX will <strong>never</strong> call, chat, or email you
        asking for this code. If you didn't request this, please ignore â€” your account is safe.
      </p>
    </div>`;

  const html = buildBaseTemplate(
    'PAX â€“ Verify Your Identity',
    'Secure Authentication',
    body,
    `This code was requested for ${to}`
  );

  const text = [
    'PAX â€“ Verify Your Identity',
    '',
    `Your one-time login code: ${otp}`,
    '',
    'Expires in 10 minutes. Do not share this code.',
    'If you did not request this, please ignore this email.',
  ].join('\n');

  await sendViaResend({
    from: FROM_OTP,
    reply_to: REPLY_TO,
    to: [to],
    subject: `${otp} â€“ Your PAX Verification Code`,
    html,
    text,
    tags: [{ name: 'category', value: 'otp' }],
    headers: {
      // OTP: plain, no-tracking, high-priority
      'X-Priority': '1',
      'Importance': 'high',
    },
  }, false); // â† tracking DISABLED for OTPs
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// 2ï¸âƒ£  MILESTONE EMAILS â€” Lifecycle updates with visual progress bar
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// â”€â”€ 2a. Project Created â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function sendProjectCreatedEmail(
  to: string,
  projectTitle: string,
  joinCode: string
): Promise<void> {
  const body = `
    <p style="margin:0 0 6px 0;font-size:24px;font-weight:800;color:${C.text};">Project Created ðŸŽ‰</p>
    <p style="margin:0 0 26px 0;font-size:14px;color:${C.muted};line-height:1.7;">
      Your project <strong style="color:${C.text};">${projectTitle}</strong> is live on PAX.
      Share the invite code below with your talent to link them to the project.
    </p>

    ${buildProgressBar(1)}

    <!-- Invite Code Card -->
    <div style="background:linear-gradient(135deg,#f0f6ff,#e6effc);border:1.5px dashed ${C.primary};
                border-radius:18px;padding:30px;text-align:center;margin-bottom:28px;">
      <p style="margin:0 0 10px 0;font-size:10px;text-transform:uppercase;letter-spacing:3px;
                color:${C.muted};font-weight:700;">Talent Invite Code</p>
      <div style="font-size:38px;font-weight:800;letter-spacing:10px;color:${C.primary};
                  font-family:'Courier New',Courier,monospace;margin:4px 0 10px 0;">${joinCode}</div>
      <p style="margin:0;font-size:12px;color:${C.muted};">Share this code so your talent can join the project</p>
    </div>

    ${ctaButton('View Project Dashboard â†’')}`;

  const html = buildBaseTemplate(`Project Created: ${projectTitle}`, 'Milestone Update', body);
  const text = `Project Created: ${projectTitle}\n\nTalent Invite Code: ${joinCode}\n\nShare this code so your talent can join on PAX.\nhttps://paxdot.com/dashboard`;

  await sendViaResend({
    from: FROM_NOTIFY,
    reply_to: REPLY_TO,
    to: [to],
    subject: `Project Created: ${projectTitle}`,
    html,
    text,
    tags: [{ name: 'category', value: 'milestone' }],
  }, true);
}

// â”€â”€ 2b. Escrow Funded â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function sendEscrowFundedEmail(
  to: string,
  projectTitle: string,
  amount: number
): Promise<void> {
  const formatted = (amount / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  const body = `
    <p style="margin:0 0 6px 0;font-size:24px;font-weight:800;color:${C.text};">Escrow Secured ðŸ”’</p>
    <p style="margin:0 0 26px 0;font-size:14px;color:${C.muted};line-height:1.7;">
      The client has funded the escrow for <strong style="color:${C.text};">${projectTitle}</strong>.
      Your payment is protected in PAX's secure vault and will be released upon milestone approval.
    </p>

    ${buildProgressBar(2)}

    <!-- Amount Card -->
    <div style="background:linear-gradient(135deg,${C.primary} 0%,#0f5499 100%);border-radius:18px;
                padding:30px;text-align:center;margin-bottom:28px;color:${C.white};">
      <p style="margin:0 0 8px 0;font-size:11px;text-transform:uppercase;letter-spacing:2.5px;
                opacity:0.7;font-weight:600;">Amount Secured in Escrow</p>
      <div style="font-size:44px;font-weight:800;color:${C.secondary};line-height:1;">${formatted}</div>
      <p style="margin:10px 0 0 0;font-size:12px;opacity:0.65;">Held securely until you approve the work</p>
    </div>

    <!-- Trust Note -->
    <div style="background:#f0f9ff;border:1px solid #bdd9f2;border-radius:14px;padding:16px 20px;margin-bottom:8px;">
      <p style="margin:0;font-size:13px;color:#0a3d6b;line-height:1.65;">
        ðŸ›¡ï¸ <strong>PAX Guarantee:</strong> Funds are held in escrow and cannot be accessed by anyone
        until both parties confirm the milestone is complete.
      </p>
    </div>

    ${ctaButton('Begin Working on Milestones â†’')}`;

  const html = buildBaseTemplate(`Escrow Funded: ${projectTitle}`, 'Milestone Update', body);
  const text = `Escrow Secured for: ${projectTitle}\n\nAmount in Escrow: ${formatted}\n\nFunds are held securely. You can safely begin working on milestones.\nhttps://paxdot.com/dashboard`;

  await sendViaResend({
    from: FROM_NOTIFY,
    reply_to: REPLY_TO,
    to: [to],
    subject: `Escrow Secured: ${projectTitle}`,
    html,
    text,
    tags: [{ name: 'category', value: 'milestone' }],
  }, true);
}

// â”€â”€ 2c. Work Submitted for Review â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function sendWorkSubmittedEmail(
  to: string,
  projectTitle: string,
  milestoneTitle: string
): Promise<void> {
  const body = `
    <p style="margin:0 0 6px 0;font-size:24px;font-weight:800;color:${C.text};">Review Requested ðŸ“</p>
    <p style="margin:0 0 26px 0;font-size:14px;color:${C.muted};line-height:1.7;">
      Your talent has submitted work for milestone
      <strong style="color:${C.text};">"${milestoneTitle}"</strong>
      on project <strong style="color:${C.text};">${projectTitle}</strong>.
      Please review and either approve to release payment, or request a revision.
    </p>

    ${buildProgressBar(3)}

    <!-- Action Required Banner -->
    <div style="background:#fff8ed;border:1.5px solid #f5c842;border-radius:14px;padding:18px 22px;margin-bottom:28px;">
      <p style="margin:0;font-size:13px;color:#6b3d00;line-height:1.7;">
        â° <strong>Action Required:</strong> Log in to review the submitted deliverables.
        Approve to release the milestone payment, or request a revision if changes are needed.
      </p>
    </div>

    ${ctaButton('Review & Approve Work â†’')}`;

  const html = buildBaseTemplate(`Review Requested: ${milestoneTitle}`, 'Milestone Update', body);
  const text = `Work Submitted for Review\n\nMilestone: ${milestoneTitle}\nProject: ${projectTitle}\n\nLog in to PAX to review and approve.\nhttps://paxdot.com/dashboard`;

  await sendViaResend({
    from: FROM_NOTIFY,
    reply_to: REPLY_TO,
    to: [to],
    subject: `Review Requested: ${milestoneTitle}`,
    html,
    text,
    tags: [{ name: 'category', value: 'milestone' }],
  }, true);
}

// â”€â”€ 2d. Payment Released â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function sendPaymentReleasedEmail(
  to: string,
  projectTitle: string,
  amount: number
): Promise<void> {
  const formatted = (amount / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  const body = `
    <p style="margin:0 0 6px 0;font-size:24px;font-weight:800;color:${C.text};">Payment Released! ðŸ’¸</p>
    <p style="margin:0 0 26px 0;font-size:14px;color:${C.muted};line-height:1.7;">
      Congratulations! The client has approved your work for
      <strong style="color:${C.text};">${projectTitle}</strong>.
      Your payment is now on its way.
    </p>

    ${buildProgressBar(4)}

    <!-- Payment Badge -->
    <div style="background:linear-gradient(135deg,#155d34 0%,#0c4224 100%);border-radius:18px;
                padding:30px;text-align:center;margin-bottom:28px;color:${C.white};">
      <p style="margin:0 0 8px 0;font-size:11px;text-transform:uppercase;letter-spacing:2.5px;
                opacity:0.7;font-weight:600;">Amount Released to You</p>
      <div style="font-size:44px;font-weight:800;color:#86efac;line-height:1;">${formatted}</div>
      <p style="margin:10px 0 0 0;font-size:12px;opacity:0.65;">Funds are on their way to your registered account</p>
    </div>

    <!-- Celebrate Banner -->
    <div style="background:linear-gradient(135deg,#fff8e6,#fff3cc);border:1px solid #f5d87a;
                border-radius:14px;padding:16px 22px;margin-bottom:8px;text-align:center;">
      <p style="margin:0;font-size:14px;color:#5a3d00;font-weight:600;">
        ðŸŽ‰ Great work! Keep growing your reputation on PAX â€” every approved milestone builds your trust score.
      </p>
    </div>

    ${ctaButton('View Transaction History â†’')}`;

  const html = buildBaseTemplate(`Payment Released: ${projectTitle}`, 'Milestone Update', body);
  const text = `Payment Released!\n\nAmount: ${formatted}\nProject: ${projectTitle}\n\nFunds are on their way to your account.\nhttps://paxdot.com/dashboard`;

  await sendViaResend({
    from: FROM_NOTIFY,
    reply_to: REPLY_TO,
    to: [to],
    subject: `Payment Released: ${formatted} for ${projectTitle}`,
    html,
    text,
    tags: [{ name: 'category', value: 'milestone' }],
  }, true);
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// 3ï¸âƒ£  MARKETING EMAILS â€” High-conversion Â· Tracking ENABLED
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// â”€â”€ 3a. Admin Growth Chime (personalised AI outreach) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function sendMarketingChimeEmail(
  to: string,
  subject: string,
  body: string
): Promise<void> {
  const contentHtml = `
    <p style="margin:0 0 6px 0;font-size:22px;font-weight:800;color:${C.text};">${subject}</p>
    <div style="font-size:15px;color:${C.muted};line-height:1.85;white-space:pre-wrap;margin:0 0 8px 0;">
      ${body}
    </div>
    ${ctaButton('Go to My Dashboard â†’')}`;

  const html = buildBaseTemplate(subject, 'A Message from PAX', contentHtml);

  await sendViaResend({
    from: FROM_MARKETING,
    reply_to: REPLY_TO,
    to: [to],
    subject,
    html,
    text: body,
    tags: [{ name: 'category', value: 'chime' }],
    headers: {
      'List-Unsubscribe': '<mailto:unsubscribe@paxdot.com>',
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  }, true);
}

// â”€â”€ 3b. Welcome Broadcast â€” Personal plain-email style (lands in Primary inbox) â”€â”€
export async function sendWelcomeBroadcastEmail(to: string): Promise<void> {
  const subject = `Your PAX account is ready`;

  // Plain-text-style HTML â€” no gradients, no banners, no List-Unsubscribe
  // This mimics a personal email from a real person â†’ Gmail Primary inbox
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#ffffff;font-family:Arial,Helvetica,sans-serif;">
<div style="max-width:580px;margin:0 auto;padding:48px 28px 40px 28px;">

  <p style="font-size:15px;color:#111111;line-height:1.8;margin:0 0 16px 0;">Hi,</p>

  <p style="font-size:15px;color:#111111;line-height:1.8;margin:0 0 16px 0;">
    I wanted to personally reach out and welcome you to <strong>PAX</strong> â€” the secure escrow
    platform built for freelancers and businesses who want every project to run without financial risk.
  </p>

  <p style="font-size:15px;color:#111111;line-height:1.8;margin:0 0 20px 0;">
    Here is how PAX protects you in 4 simple steps:
  </p>

  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 24px 0;border-left:3px solid #0e4573;padding-left:0;">
    <tr><td style="padding:10px 0 10px 18px;font-size:14px;color:#222222;line-height:1.7;">
      <strong>1. Agree on scope</strong><br>
      Both parties lock in milestones, deliverables, and payment amounts â€” before any work starts.
    </td></tr>
    <tr><td style="padding:10px 0 10px 18px;font-size:14px;color:#222222;line-height:1.7;border-top:1px solid #f0f0f0;">
      <strong>2. Secure funds in escrow</strong><br>
      The client deposits the full amount into PAX's secure vault. Work begins only after funds are confirmed.
    </td></tr>
    <tr><td style="padding:10px 0 10px 18px;font-size:14px;color:#222222;line-height:1.7;border-top:1px solid #f0f0f0;">
      <strong>3. Deliver and review milestones</strong><br>
      Talent submits work. The client reviews it in real time and can approve or request revisions.
    </td></tr>
    <tr><td style="padding:10px 0 10px 18px;font-size:14px;color:#222222;line-height:1.7;border-top:1px solid #f0f0f0;">
      <strong>4. Get paid instantly</strong><br>
      Once the client approves, PAX releases the payment to talent immediately â€” no delays, no disputes.
    </td></tr>
  </table>

  <p style="font-size:15px;color:#111111;line-height:1.8;margin:0 0 16px 0;">
    No more chasing invoices. No more working without a guarantee. PAX is the single platform
    that makes every project secure â€” for both sides.
  </p>

  <p style="font-size:15px;color:#111111;line-height:1.8;margin:0 0 28px 0;">
    When you are ready to start:
    <br>
    <a href="https://paxdot.com/dashboard" style="color:#0e4573;font-weight:bold;">
      â†’ paxdot.com/dashboard
    </a>
  </p>

  <p style="font-size:15px;color:#111111;line-height:1.6;margin:0 0 4px 0;">Warm regards,</p>
  <p style="font-size:15px;color:#111111;font-weight:bold;margin:0 0 4px 0;">Vishal</p>
  <p style="font-size:13px;color:#555555;margin:0 0 36px 0;">
    Founder, PAX &mdash;
    <a href="https://paxdot.com" style="color:#0e4573;">paxdot.com</a>
  </p>

  <hr style="border:none;border-top:1px solid #eeeeee;margin:0 0 20px 0;">
  <p style="font-size:11px;color:#aaaaaa;line-height:1.6;margin:0;">
    PAX Escrow Platform &middot; paxdot.com &middot;
    You received this because you created an account at paxdot.com.
    To unsubscribe, reply to this email with the word "unsubscribe".
  </p>

</div>
</body>
</html>`;

  const text = [
    'Hi,',
    '',
    'I wanted to personally reach out and welcome you to PAX â€” the secure escrow',
    'platform built for freelancers and businesses who want every project to run without financial risk.',
    '',
    'How PAX works:',
    '1. Agree on scope â€” lock in milestones and payment amounts upfront.',
    '2. Secure funds in escrow â€” client deposits before work begins.',
    '3. Deliver and review milestones â€” talent submits, client reviews in real time.',
    '4. Get paid instantly â€” PAX releases payment on approval.',
    '',
    'No more chasing invoices. No more working without a guarantee.',
    '',
    'Start here: https://paxdot.com/dashboard',
    '',
    'Warm regards,',
    'Vishal',
    'Founder, PAX — paxdot.com',
  ].join('\n');

  await sendViaResend({
    from: FROM_MARKETING,
    reply_to: REPLY_TO,
    to: [to],
    subject,
    html,
    text,
    tags: [{ name: 'category', value: 'onboarding' }],
    // NO List-Unsubscribe header — avoids Gmail Promotions classification
  }, false); // tracking OFF for better inbox placement
}
