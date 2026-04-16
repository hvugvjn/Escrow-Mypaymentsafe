// ============================================================
// PAX – Professional Email Service  |  Powered by Resend API
// ============================================================
// Categories:
//   OTP          → Zero-latency, tracking DISABLED for max speed
//   Milestone    → Project lifecycle updates, tracking ENABLED
//   Marketing    → High-conversion onboarding, tracking ENABLED
// Brand: #0e4573 (Deep Blue) · #f2df74 (Gold) · #722f37 (Wine)
// ============================================================

// ── Brand Design Tokens ──────────────────────────────────────────────────────
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

// Sender addresses — update to your verified domain once paxdot.com is added in Resend
const FROM_OTP       = 'PAX Security <onboarding@resend.dev>';
const FROM_NOTIFY    = 'PAX <onboarding@resend.dev>';
const FROM_MARKETING = 'PAX <onboarding@resend.dev>';
// Once domain verified, replace with:
// const FROM_OTP       = 'PAX Security <security@paxdot.com>';
// const FROM_NOTIFY    = 'PAX <notifications@paxdot.com>';
// const FROM_MARKETING = 'PAX <hello@paxdot.com>';

// ── Core Resend API Sender ───────────────────────────────────────────────────
interface ResendPayload {
  from: string;
  to: string[];
  subject: string;
  html: string;
  text: string;
  tags?: { name: string; value: string }[];
}

async function sendViaResend(
  payload: ResendPayload,
  trackingEnabled: boolean = true
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error('[EMAIL] ‼️  RESEND_API_KEY is not set. Email not sent.');
    console.warn(`[EMAIL FALLBACK] Would have sent → To: ${payload.to.join(', ')} | Subject: "${payload.subject}"`);
    return;
  }

  // Build request body — Resend does not support open/click tracking toggle via body;
  // tracking is managed per-domain in the Resend dashboard.
  // For OTPs we tag them separately so you can filter analytics.
  const body = { ...payload };

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // ── Success ──────────────────────────────────────────────────────────────
    if (res.status === 200 || res.status === 201) {
      const data = await res.json() as { id?: string };
      console.log(`[EMAIL] ✅ Delivered via Resend → ${payload.to.join(', ')} | id: ${data.id ?? 'n/a'}`);
      return;
    }

    // ── Error: non-200/201 response ──────────────────────────────────────────
    const errorText = await res.text();
    console.error(`[EMAIL] ❌ Resend error (HTTP ${res.status}): ${errorText}`);

    // Structured fallback alert — pipe this to Slack / PagerDuty if needed
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
    // ── Network / fetch failure ──────────────────────────────────────────────
    if (!err.message?.startsWith('Resend API returned')) {
      console.error('[EMAIL] ❌ Network error reaching Resend:', err.message);
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

// ── Base Email Shell ─────────────────────────────────────────────────────────
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

        <!-- ═══ HEADER ════════════════════════════════════════════════════ -->
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

        <!-- ═══ BODY ══════════════════════════════════════════════════════ -->
        <tr>
          <td style="padding:40px 44px 36px 44px;">
            ${bodyHtml}
          </td>
        </tr>

        <!-- ═══ DIVIDER ══════════════════════════════════════════════════ -->
        <tr><td style="padding:0 40px;"><div style="border-top:1px solid ${C.border};"></div></td></tr>

        <!-- ═══ FOOTER ═══════════════════════════════════════════════════ -->
        <tr>
          <td style="padding:24px 40px 28px 40px;text-align:center;background:#f4f7fb;border-radius:0 0 24px 24px;">
            ${footerNote
              ? `<p style="margin:0 0 10px 0;font-size:12px;color:${C.muted};">${footerNote}</p>`
              : ''}
            <p style="margin:0;font-size:11px;color:#90a8c0;line-height:1.6;">
              © ${new Date().getFullYear()} PAX · Secure Milestone Escrow Platform ·
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

// ── Milestone Progress Bar ───────────────────────────────────────────────────
// activeStep: 1=Agreement  2=Escrow  3=Approved  4=Released
function buildProgressBar(activeStep: 1 | 2 | 3 | 4): string {
  const steps = [
    { icon: '📋', label: 'Agreement\nSigned'   },
    { icon: '🔒', label: 'Funds in\nEscrow'    },
    { icon: '✅', label: 'Work\nApproved'      },
    { icon: '💸', label: 'Payment\nReleased'   },
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

// ── CTA Button ───────────────────────────────────────────────────────────────
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

// ═══════════════════════════════════════════════════════════════════════════════
// 1️⃣  OTP EMAIL — Minimalist · High-Security · Tracking DISABLED
// ═══════════════════════════════════════════════════════════════════════════════
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
      Valid for <strong>10 minutes</strong> — do not share it with anyone.
    </p>

    <!-- OTP Card -->
    <div style="background:#f7f9ff;border:1.5px dashed ${C.primary};border-radius:18px;
                padding:32px 20px;text-align:center;margin-bottom:28px;">
      <p style="margin:0 0 18px 0;font-size:10.5px;text-transform:uppercase;letter-spacing:3px;
                color:${C.muted};font-weight:700;">Your One-Time Login Code</p>

      <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto;">
        <tr>${digitCells}</tr>
      </table>

      <p style="margin:18px 0 0 0;font-size:12px;color:${C.muted};">⏱ Expires in 10 minutes</p>
    </div>

    <!-- Security Warning -->
    <div style="background:#fff8f2;border-left:4px solid ${C.accent};border-radius:0 12px 12px 0;padding:16px 20px;">
      <p style="margin:0;font-size:13px;color:#5c1c24;line-height:1.65;">
        <strong>⚠️ Security Notice:</strong> PAX will <strong>never</strong> call, chat, or email you
        asking for this code. If you didn't request this, please ignore — your account is safe.
      </p>
    </div>`;

  const html = buildBaseTemplate(
    'PAX – Verify Your Identity',
    'Secure Authentication',
    body,
    `This code was requested for ${to}`
  );

  const text = [
    'PAX – Verify Your Identity',
    '',
    `Your one-time login code: ${otp}`,
    '',
    'Expires in 10 minutes. Do not share this code.',
    'If you did not request this, please ignore this email.',
  ].join('\n');

  await sendViaResend({
    from: FROM_OTP,
    to: [to],
    subject: `${otp} – Your PAX Verification Code`,
    html,
    text,
    tags: [{ name: 'category', value: 'otp' }],
  }, false); // ← tracking DISABLED for OTPs
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2️⃣  MILESTONE EMAILS — Lifecycle updates with visual progress bar
// ═══════════════════════════════════════════════════════════════════════════════

// ── 2a. Project Created ──────────────────────────────────────────────────────
export async function sendProjectCreatedEmail(
  to: string,
  projectTitle: string,
  joinCode: string
): Promise<void> {
  const body = `
    <p style="margin:0 0 6px 0;font-size:24px;font-weight:800;color:${C.text};">Project Created 🎉</p>
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

    ${ctaButton('View Project Dashboard →')}`;

  const html = buildBaseTemplate(`Project Created: ${projectTitle}`, 'Milestone Update', body);
  const text = `Project Created: ${projectTitle}\n\nTalent Invite Code: ${joinCode}\n\nShare this code so your talent can join on PAX.\nhttps://paxdot.com/dashboard`;

  await sendViaResend({
    from: FROM_NOTIFY,
    to: [to],
    subject: `🎉 Project Created: ${projectTitle}`,
    html,
    text,
    tags: [{ name: 'category', value: 'milestone' }],
  }, true);
}

// ── 2b. Escrow Funded ────────────────────────────────────────────────────────
export async function sendEscrowFundedEmail(
  to: string,
  projectTitle: string,
  amount: number
): Promise<void> {
  const formatted = (amount / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  const body = `
    <p style="margin:0 0 6px 0;font-size:24px;font-weight:800;color:${C.text};">Escrow Secured 🔒</p>
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
        🛡️ <strong>PAX Guarantee:</strong> Funds are held in escrow and cannot be accessed by anyone
        until both parties confirm the milestone is complete.
      </p>
    </div>

    ${ctaButton('Begin Working on Milestones →')}`;

  const html = buildBaseTemplate(`Escrow Funded: ${projectTitle}`, 'Milestone Update', body);
  const text = `Escrow Secured for: ${projectTitle}\n\nAmount in Escrow: ${formatted}\n\nFunds are held securely. You can safely begin working on milestones.\nhttps://paxdot.com/dashboard`;

  await sendViaResend({
    from: FROM_NOTIFY,
    to: [to],
    subject: `🔒 Escrow Secured: ${projectTitle} – ${formatted}`,
    html,
    text,
    tags: [{ name: 'category', value: 'milestone' }],
  }, true);
}

// ── 2c. Work Submitted for Review ────────────────────────────────────────────
export async function sendWorkSubmittedEmail(
  to: string,
  projectTitle: string,
  milestoneTitle: string
): Promise<void> {
  const body = `
    <p style="margin:0 0 6px 0;font-size:24px;font-weight:800;color:${C.text};">Review Requested 📝</p>
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
        ⏰ <strong>Action Required:</strong> Log in to review the submitted deliverables.
        Approve to release the milestone payment, or request a revision if changes are needed.
      </p>
    </div>

    ${ctaButton('Review & Approve Work →')}`;

  const html = buildBaseTemplate(`Review Requested: ${milestoneTitle}`, 'Milestone Update', body);
  const text = `Work Submitted for Review\n\nMilestone: ${milestoneTitle}\nProject: ${projectTitle}\n\nLog in to PAX to review and approve.\nhttps://paxdot.com/dashboard`;

  await sendViaResend({
    from: FROM_NOTIFY,
    to: [to],
    subject: `📝 Review Requested: ${milestoneTitle}`,
    html,
    text,
    tags: [{ name: 'category', value: 'milestone' }],
  }, true);
}

// ── 2d. Payment Released ─────────────────────────────────────────────────────
export async function sendPaymentReleasedEmail(
  to: string,
  projectTitle: string,
  amount: number
): Promise<void> {
  const formatted = (amount / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  const body = `
    <p style="margin:0 0 6px 0;font-size:24px;font-weight:800;color:${C.text};">Payment Released! 💸</p>
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
        🎉 Great work! Keep growing your reputation on PAX — every approved milestone builds your trust score.
      </p>
    </div>

    ${ctaButton('View Transaction History →')}`;

  const html = buildBaseTemplate(`Payment Released: ${projectTitle}`, 'Milestone Update', body);
  const text = `Payment Released!\n\nAmount: ${formatted}\nProject: ${projectTitle}\n\nFunds are on their way to your account.\nhttps://paxdot.com/dashboard`;

  await sendViaResend({
    from: FROM_NOTIFY,
    to: [to],
    subject: `💸 Payment Released: ${formatted} for ${projectTitle}`,
    html,
    text,
    tags: [{ name: 'category', value: 'milestone' }],
  }, true);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3️⃣  MARKETING EMAILS — High-conversion · Tracking ENABLED
// ═══════════════════════════════════════════════════════════════════════════════

// ── 3a. Admin Growth Chime (personalised AI outreach) ───────────────────────
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
    ${ctaButton('Go to My Dashboard →')}`;

  const html = buildBaseTemplate(subject, 'A Message from PAX', contentHtml);

  await sendViaResend({
    from: FROM_MARKETING,
    to: [to],
    subject,
    html,
    text: body,
    tags: [{ name: 'category', value: 'chime' }],
  }, true);
}

// ── 3b. Welcome Broadcast — PAX Platform Introduction ───────────────────────
export async function sendWelcomeBroadcastEmail(to: string): Promise<void> {

  // How-it-works step builder
  const step = (num: string, icon: string, title: string, desc: string) => `
    <tr>
      <td style="padding:0 0 22px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td width="56" style="vertical-align:top;padding-right:18px;">
              <div style="width:52px;height:52px;background:${C.secondary};border-radius:14px;
                          text-align:center;line-height:52px;font-size:24px;
                          box-shadow:0 4px 14px rgba(14,69,115,0.15);">${icon}</div>
            </td>
            <td style="vertical-align:top;">
              <div style="margin-bottom:4px;">
                <span style="background:${C.primary};color:${C.white};font-size:9px;font-weight:700;
                             padding:3px 10px;border-radius:20px;letter-spacing:1.5px;
                             text-transform:uppercase;">Step ${num}</span>
              </div>
              <p style="margin:6px 0 4px 0;font-size:15px;font-weight:700;color:${C.text};">${title}</p>
              <p style="margin:0;font-size:13px;color:${C.muted};line-height:1.6;">${desc}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;

  // Trust pillar card builder
  const pillar = (icon: string, title: string, desc: string) => `
    <td width="33%" style="vertical-align:top;padding:0 6px;text-align:center;">
      <div style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.15);
                  border-radius:16px;padding:24px 14px;">
        <div style="font-size:34px;margin-bottom:10px;">${icon}</div>
        <p style="margin:0 0 6px 0;font-size:13px;font-weight:700;color:${C.secondary};">${title}</p>
        <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.6);line-height:1.5;">${desc}</p>
      </div>
    </td>`;

  const body = `
    <!-- ─── Hero ─────────────────────────────────────────────────────────── -->
    <div style="background:linear-gradient(140deg,${C.primary} 0%,#0a3a60 100%);border-radius:20px;
                padding:40px 32px;text-align:center;margin-bottom:36px;">
      <div style="display:inline-block;background:${C.secondary};border-radius:8px;
                  padding:4px 14px;margin-bottom:14px;font-size:10px;font-weight:800;
                  color:${C.primary};text-transform:uppercase;letter-spacing:2px;">
        Trusted Globally
      </div>
      <h1 style="margin:0 0 16px 0;font-size:30px;font-weight:800;color:${C.white};line-height:1.3;
                 font-family:${FONT};">
        The New Standard for<br/>Secure Global Work
      </h1>
      <p style="margin:0 0 30px 0;font-size:14px;color:rgba(255,255,255,0.75);line-height:1.75;
                max-width:400px;margin-left:auto;margin-right:auto;">
        PAX ensures your money is safe, your work is verified, and your trust is never compromised —
        every milestone, every time.
      </p>

      <!-- Pillar Cards -->
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:30px;">
        <tr>
          ${pillar('🔒', 'Zero Risk', 'Funds secured in escrow before work begins')}
          ${pillar('⚡', 'Instant Payout', 'Released the moment work is approved')}
          ${pillar('🌍', 'Global Teams', 'Multi-currency, multi-timezone support')}
        </tr>
      </table>

      <a href="https://paxdot.com/dashboard"
         style="display:inline-block;background:${C.secondary};color:${C.primary};
                padding:16px 38px;text-decoration:none;border-radius:14px;font-weight:800;
                font-size:14px;letter-spacing:0.5px;box-shadow:0 10px 28px rgba(0,0,0,0.3);">
        Access Your PAX Workspace →
      </a>
    </div>

    <!-- ─── How PAX Works ─────────────────────────────────────────────────── -->
    <p style="margin:0 0 22px 0;font-size:19px;font-weight:800;color:${C.text};">How PAX Works ⚙️</p>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      ${step('1', '📋', 'Agree on Scope', 'Both parties agree on the project scope, milestones, and deliverables upfront — no surprises.')}
      ${step('2', '🔒', 'Client Funds Escrow', 'The total project value is deposited into PAX&#39;s secure vault. Talent can safely begin work.')}
      ${step('3', '🚀', 'Deliver Milestones', 'Talent submits each milestone. The client can review, approve, or request revisions in real time.')}
      ${step('4', '💸', 'Instant Payment', 'Upon approval, PAX instantly releases the milestone payment directly to talent. Done and verified.')}
    </table>

    <!-- ─── PAX for Freelancers ───────────────────────────────────────────── -->
    <div style="background:linear-gradient(135deg,#f0f6ff,#e6effc);border-radius:18px;
                padding:28px 28px;margin:28px 0;border:1px solid ${C.border};">
      <p style="margin:0 0 14px 0;font-size:16px;font-weight:800;color:${C.text};">
        🧑‍💻 For Freelancers & Independent Talent
      </p>
      <p style="margin:0 0 16px 0;font-size:13px;color:${C.muted};line-height:1.7;">
        No more chasing invoices. No more working for free. PAX guarantees that every hour you work,
        every deliverable you ship is backed by a secured payment waiting in escrow.
      </p>
      <table cellpadding="0" cellspacing="0" role="presentation">
        <tr><td style="padding:5px 0;">
          <span style="font-size:13px;color:${C.text};">✅ &nbsp;Get funded before you start</span>
        </td></tr>
        <tr><td style="padding:5px 0;">
          <span style="font-size:13px;color:${C.text};">✅ &nbsp;Real-time milestone tracking</span>
        </td></tr>
        <tr><td style="padding:5px 0;">
          <span style="font-size:13px;color:${C.text};">✅ &nbsp;Dispute resolution built in</span>
        </td></tr>
      </table>
    </div>

    <!-- ─── PAX for Companies ─────────────────────────────────────────────── -->
    <div style="background:linear-gradient(135deg,#fff8f2,#ffe8d6);border-radius:18px;
                padding:28px 28px;margin:0 0 28px 0;border:1px solid #f5d7c0;">
      <p style="margin:0 0 14px 0;font-size:16px;font-weight:800;color:${C.text};">
        🏢 For Companies & Enterprises
      </p>
      <p style="margin:0 0 16px 0;font-size:13px;color:${C.muted};line-height:1.7;">
        PAX gives your team a single source of truth for every external project. Track spend,
        approve milestones, and maintain a clean audit trail — all from one dashboard.
      </p>
      <table cellpadding="0" cellspacing="0" role="presentation">
        <tr><td style="padding:5px 0;">
          <span style="font-size:13px;color:${C.text};">✅ &nbsp;Full spend visibility</span>
        </td></tr>
        <tr><td style="padding:5px 0;">
          <span style="font-size:13px;color:${C.text};">✅ &nbsp;Complete audit trail</span>
        </td></tr>
        <tr><td style="padding:5px 0;">
          <span style="font-size:13px;color:${C.text};">✅ &nbsp;Scales from 1 to 1,000 projects</span>
        </td></tr>
      </table>
    </div>

    <!-- ─── Trust Banner ──────────────────────────────────────────────────── -->
    <div style="background:linear-gradient(135deg,${C.accent} 0%,#8f2f39 100%);border-radius:18px;
                padding:30px 32px;margin-bottom:28px;text-align:center;">
      <p style="margin:0 0 10px 0;font-size:20px;font-weight:800;color:${C.white};">
        Built on Trust. Powered by Security.
      </p>
      <p style="margin:0 0 22px 0;font-size:13px;color:rgba(255,255,255,0.75);line-height:1.7;">
        PAX is the escrow partner that ambitious companies rely on to protect every rupee and every
        deliverable. From bootstrapped startups to scaling enterprises — PAX is the boost for any team
        that runs on trust.
      </p>
      <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto;">
        <tr>
          <td style="padding:0 6px;">
            <span style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:8px;
                         padding:8px 14px;font-size:11px;color:${C.white};font-weight:600;">
              🛡️ Bank-Grade Security
            </span>
          </td>
          <td style="padding:0 6px;">
            <span style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:8px;
                         padding:8px 14px;font-size:11px;color:${C.white};font-weight:600;">
              📊 Full Audit Trail
            </span>
          </td>
          <td style="padding:0 6px;">
            <span style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:8px;
                         padding:8px 14px;font-size:11px;color:${C.white};font-weight:600;">
              ⚡ Real-Time Updates
            </span>
          </td>
        </tr>
      </table>
    </div>

    ${ctaButton('Start Your First Project on PAX →')}`;

  const subject = `Welcome to PAX – The New Standard for Secure Global Work`;
  const html = buildBaseTemplate(subject, 'Welcome to PAX', body);
  const text = [
    'Welcome to PAX – The New Standard for Secure Global Work.',
    '',
    'PAX is your secure escrow partner.',
    '1. Agree on scope  →  2. Fund escrow  →  3. Deliver milestones  →  4. Get paid instantly.',
    '',
    'No more chasing invoices. No more risk.',
    '',
    'Visit https://paxdot.com to get started.',
  ].join('\n');

  await sendViaResend({
    from: FROM_MARKETING,
    to: [to],
    subject,
    html,
    text,
    tags: [{ name: 'category', value: 'onboarding' }],
  }, true);
}
