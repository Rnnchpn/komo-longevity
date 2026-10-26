// Server-only Acuity connection diagnostic for KŌMØ admins.
// Deliberately reads calendars only: no patient/appointment data, no database writes.
const SUPABASE_URL = 'https://uqlolefsiktbznnymriy.supabase.co';
const SUPABASE_PUBLISHABLE = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const ALLOWED_ORIGIN = 'https://pulse.komolongevity.com';

function send(res, status, payload) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.status(status).json(payload);
}
async function supabaseJson(path, token) {
  const reply = await fetch(SUPABASE_URL + path, {
    method: 'GET',
    headers: { apikey: SUPABASE_PUBLISHABLE, Authorization: 'Bearer ' + token, Accept: 'application/json' },
    signal: AbortSignal.timeout(9000),
    cache: 'no-store'
  });
  if (!reply.ok) return null;
  return reply.json();
}
export default async function handler(req, res) {
  const origin = String(req.headers.origin || '');
  if (origin && origin === ALLOWED_ORIGIN) {
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Vary', 'Origin');
  }
  if (req.method === 'OPTIONS') return res.status(origin === ALLOWED_ORIGIN ? 204 : 403).end();
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    return send(res, 405, { ok: false, status: 'method_not_allowed' });
  }
  if (origin && origin !== ALLOWED_ORIGIN) return send(res, 403, { ok: false, status: 'origin_not_allowed' });
  const auth = /^Bearer ([\w.\-~+/=]{20,5000})$/.exec(String(req.headers.authorization || ''));
  if (!auth) return send(res, 401, { ok: false, status: 'authentication_required' });
  try {
    // Verify the token against Supabase Auth; do not trust claims from the browser.
    const user = await supabaseJson('/auth/v1/user', auth[1]);
    if (!user?.id || !/^[0-9a-f-]{36}$/i.test(user.id)) return send(res, 401, { ok: false, status: 'invalid_session' });
    const roles = await supabaseJson('/rest/v1/account_roles?select=role&user_id=eq.' + encodeURIComponent(user.id) + '&limit=1', auth[1]);
    if (!Array.isArray(roles) || roles[0]?.role !== 'admin') return send(res, 403, { ok: false, status: 'admin_only' });
    const id = String(process.env.ACUITY_USER_ID || '').trim();
    const key = String(process.env.ACUITY_API_KEY || '').trim();
    if (!id || !key) return send(res, 503, {
      ok: false, status: 'not_configured',
      required: [!id ? 'ACUITY_USER_ID' : null, !key ? 'ACUITY_API_KEY' : null].filter(Boolean)
    });
    if (!/^\d{1,25}$/.test(id)) return send(res, 503, { ok: false, status: 'invalid_user_id_format' });
    const response = await fetch('https://acuityscheduling.com/api/v1/calendars', {
      headers: { Authorization: 'Basic ' + Buffer.from(id + ':' + key, 'utf8').toString('base64'), Accept: 'application/json' },
      signal: AbortSignal.timeout(10000),
      cache: 'no-store'
    });
    if (response.status === 401 || response.status === 403) return send(res, 502, { ok: false, status: 'acuity_auth_failed' });
    if (!response.ok) return send(res, 502, { ok: false, status: 'acuity_unavailable' });
    const calendars = await response.json();
    if (!Array.isArray(calendars)) return send(res, 502, { ok: false, status: 'acuity_invalid_response' });
    const safeCalendars = calendars.slice(0, 50).map(c => ({
      id: typeof c.id === 'number' ? c.id : Number(c.id) || null,
      name: String(c.name || 'Calendrier sans nom').slice(0, 120)
    }));
    return send(res, 200, { ok: true, status: 'connected', calendars: safeCalendars });
  } catch (error) {
    // Never log credential-bearing Authorization headers or raw upstream payloads.
    console.error('[acuity-connection] diagnostic failed:', error?.name || 'unknown_error');
    return send(res, 502, { ok: false, status: 'connection_error' });
  }
}
