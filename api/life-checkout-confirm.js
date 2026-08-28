const SUPABASE_URL = 'https://uqlolefsiktbznnymriy.supabase.co';
const SUPABASE_KEY = 'sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';

function reply(response, status, payload) {
  response.setHeader('Cache-Control', 'no-store, max-age=0');
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  return response.status(status).json(payload);
}

function isSameOrigin(request) {
  const origin = request.headers.origin;
  const host = request.headers.host;
  if (!origin || !host) return true;
  try { return new URL(origin).host === host; } catch { return false; }
}

function bearer(request) {
  const raw = String(request.headers.authorization || '');
  return raw.startsWith('Bearer ') ? raw.slice(7).trim() : '';
}

async function supabaseRpc(name, args, token) {
  const result = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(args || {})
  });
  const payload = await result.json().catch(() => null);
  if (!result.ok) throw new Error(payload?.message || payload?.code || `supabase_rpc_${result.status}`);
  return payload;
}

async function stripeSession(secret, sessionId) {
  const result = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
    headers: { Authorization: `Bearer ${secret}` }
  });
  const payload = await result.json().catch(() => null);
  if (!result.ok) throw new Error(payload?.error?.message || `stripe_${result.status}`);
  return payload;
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return reply(response, 405, { ok: false, error: 'method_not_allowed' });
  }
  if (!isSameOrigin(request)) return reply(response, 403, { ok: false, error: 'origin_not_allowed' });

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return reply(response, 503, { ok: false, error: 'checkout_not_configured' });

  const token = bearer(request);
  if (!token) return reply(response, 401, { ok: false, error: 'komo_account_required' });

  const sessionId = String(request.body?.session_id || '').trim();
  if (!/^cs_(test_|live_)?[A-Za-z0-9_]+$/.test(sessionId)) return reply(response, 400, { ok: false, error: 'invalid_session_id' });

  try {
    const session = await stripeSession(secret, sessionId);
    if (session?.payment_status !== 'paid' || session?.status !== 'complete') {
      return reply(response, 409, { ok: false, error: 'checkout_not_paid' });
    }
    if (session?.metadata?.storefront !== 'komo-life-v1') {
      return reply(response, 400, { ok: false, error: 'foreign_checkout_session' });
    }

    const redemptionId = String(session?.metadata?.points_redemption_id || '').trim();
    if (!redemptionId) {
      const wallet = await supabaseRpc('komo_wallet_summary', {}, token);
      return reply(response, 200, { ok: true, points_used: 0, wallet });
    }

    const redemption = await supabaseRpc('komo_finalize_life_redemption', {
      p_redemption_id: redemptionId,
      p_checkout_session_id: session.id
    }, token);
    const wallet = await supabaseRpc('komo_wallet_summary', {}, token);
    return reply(response, 200, { ok: true, points_used: Number(redemption?.points || 0), redemption, wallet });
  } catch (error) {
    console.error('[life-checkout-confirm]', error?.message || 'confirmation_failure');
    return reply(response, 502, { ok: false, error: 'checkout_confirmation_failed' });
  }
}
