// ============================================================
// PAX — Cashfree Payment Gateway Service
// ============================================================
// Flow:
//   1. Client approves milestone → createMilestonePaymentLink()
//   2. Cashfree sends webhook → verifyCashfreeWebhook()
//   3. PAX marks milestone RELEASED automatically
// ============================================================

const APP_ID     = (process.env.CASHFREE_APP_ID || '').trim();
const SECRET_KEY = (process.env.CASHFREE_SECRET_KEY || '').trim();

const isProdKey = SECRET_KEY?.includes('_prod_');
const CASHFREE_BASE_URL =
  (process.env.CASHFREE_ENV === 'production' || isProdKey)
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';
const API_VERSION = '2023-08-01';

// ── Common headers for all Cashfree API calls ─────────────────────────────
function cashfreeHeaders() {
  return {
    'x-client-id':     APP_ID,
    'x-client-secret': SECRET_KEY,
    'x-api-version':   API_VERSION,
    'Content-Type':    'application/json',
  };
}

// ── Types ─────────────────────────────────────────────────────────────────
export interface CashfreePaymentLink {
  link_id:    string;
  link_url:   string;
  link_status: string;
}

export interface CashfreePlatformOrder {
  order_id:       string;
  payment_session_id: string;
  order_status:   string;
}

// ── 1. Create a Payment Link for a Milestone ─────────────────────────────
// Client pays talent directly using this link.
// link_id = milestone ID so webhook knows which milestone to release.
export async function createMilestonePaymentLink(params: {
  milestoneId:     string;
  projectTitle:    string;
  milestoneTitle:  string;
  amountInPaise:   number;   // e.g. ₹10,000 = 1000000 paise
  clientName:      string;
  clientEmail:     string;
  clientPhone:     string;
  talentUpiOrBank?: string;
  returnUrl:       string;   // Where to redirect after payment
}): Promise<{ payment_session_id: string; order_id: string; link_url?: string }> {

  if (!APP_ID || !SECRET_KEY) {
    throw new Error('Cashfree credentials not configured. Set CASHFREE_APP_ID and CASHFREE_SECRET_KEY in .env');
  }

  // Convert paise to rupees (Cashfree uses INR as decimal)
  const amountInRupees = params.amountInPaise / 100;

  const orderId = `order_${params.milestoneId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20)}_${Date.now()}`;

  const body = {
    order_id:       orderId,
    order_amount:   amountInRupees,
    order_currency: 'INR',
    order_note:     `PAX: ${params.projectTitle} — ${params.milestoneTitle}`.slice(0, 50),
    customer_details: {
      customer_id:    `cust_${params.clientPhone.replace(/\D/g, '').slice(-10) || '9999999999'}`,
      customer_name:  params.clientName,
      customer_email: params.clientEmail || 'no-reply@paxdot.com',
      customer_phone: params.clientPhone.replace(/\D/g, '').slice(-10) || '9999999999',
    },
    order_meta: {
      return_url: params.returnUrl,
    },
    order_tags: {
      milestone_id: params.milestoneId,
    }
  };

  const res = await fetch(`${CASHFREE_BASE_URL}/orders`, {
    method:  'POST',
    headers: cashfreeHeaders(),
    body:    JSON.stringify(body),
  });

  const data = await res.json() as any;

  if (!res.ok) {
    console.error('[CASHFREE] Order creation failed:', data);
    throw new Error(`Cashfree error: ${data?.message || JSON.stringify(data)}`);
  }

  console.log(`[CASHFREE] ✅ Order created for milestone ${params.milestoneId}: ${data.order_id}`);

  return {
    payment_session_id: data.payment_session_id,
    order_id: data.order_id,
    link_url: `https://checkout.cashfree.com/api/v1/session/${data.payment_session_id}` // Fallback redirect if JS SDK fails
  };
}

// ── 2. Create a Platform Fee Payment Link (₹199 per project) ─────────────────────
// Charged to the CLIENT when they create a project.
export async function createPlatformFeeLink(params: {
  projectId:   string;
  clientName:  string;
  clientEmail: string;
  clientPhone: string;
  returnUrl:   string;
}): Promise<CashfreePaymentLink> {

  if (!APP_ID || !SECRET_KEY) {
    throw new Error('Cashfree credentials not configured.');
  }

  const feeInRupees = parseInt(process.env.PLATFORM_FEE_INR || '199', 10);
  const linkId = `pax-fee-${params.projectId.slice(0, 20)}-${Date.now()}`;

  const body = {
    link_id:          linkId,
    link_amount:      feeInRupees,
    link_currency:    'INR',
    link_purpose:     'PAX Platform Fee — Project Creation',
    customer_details: {
      customer_name:  params.clientName,
      customer_email: params.clientEmail,
      customer_phone: params.clientPhone.replace(/\D/g, '').slice(-10) || '9999999999',
    },
    link_notify: {
      send_sms:   true,
      send_email: true,
    },
    link_return_url: `${params.returnUrl}?fee=paid`,
    link_meta: {
      project_id:   params.projectId,
      is_fee:       'true',
    },
  };

  const res = await fetch(`${CASHFREE_BASE_URL}/links`, {
    method:  'POST',
    headers: cashfreeHeaders(),
    body:    JSON.stringify(body),
  });

  const data = await res.json() as any;

  if (!res.ok) {
    console.error('[CASHFREE] Platform fee link creation failed:', data);
    throw new Error(`Cashfree error: ${data?.message || JSON.stringify(data)}`);
  }

  console.log(`[CASHFREE] ✅ Platform fee link created: ${data.link_url}`);

  return {
    link_id:     data.link_id,
    link_url:    data.link_url,
    link_status: data.link_status,
  };
}

// ── 3. Verify Cashfree Webhook Signature ──────────────────────────────────
// Cashfree signs every webhook with HMAC-SHA256.
// We verify the signature to ensure it's genuine.
import crypto from 'crypto';

export function verifyCashfreeWebhook(
  rawBody:   string,
  timestamp: string,
  signature: string
): boolean {
  const secret = process.env.CASHFREE_WEBHOOK_SECRET;

  if (!secret || secret === 'your_webhook_secret_here') {
    // If no webhook secret configured, log warning and accept
    // (configure this in Cashfree dashboard ASAP)
    console.warn('[CASHFREE] ⚠️  CASHFREE_WEBHOOK_SECRET not set. Accepting webhook without verification.');
    return true;
  }

  try {
    const message  = `${timestamp}${rawBody}`;
    const expected = crypto
      .createHmac('sha256', secret)
      .update(message)
      .digest('base64');

    return expected === signature;
  } catch {
    return false;
  }
}

// ── 4. Get Payment Link Status ────────────────────────────────────────────
export async function getPaymentLinkStatus(linkId: string): Promise<string> {
  const res = await fetch(`${CASHFREE_BASE_URL}/links/${linkId}`, {
    method:  'GET',
    headers: cashfreeHeaders(),
  });

  const data = await res.json() as any;
  return data?.link_status || 'UNKNOWN';
}
