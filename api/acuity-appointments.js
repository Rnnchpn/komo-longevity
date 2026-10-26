// Read-only Acuity appointment overview for KŌMØ global admins.
// No contact emails, intake forms or payment details are sent to the frontend.
// Appointments are NOT automatically linked to patient records.
const SUPABASE_URL = 'https://uqlolefsiktbznnymriy.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const ALLOWED_ORIGIN = 'https://pulse.komolongevity.com';

function reply(res, status, json) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  return res.status(status).json(json);
}
async function supabaseGet(path, token) {
  const response = await fetch(SUPABASE_URL + path, {
    headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + token, Accept: 'application/json' },
    cache: 'no-store',
    signal: AbortSignal.timeout(9000)
  });
  return response.ok ? response.json() : null;
}
export default async function handler(req, res) {
  const origin = String(req.headers.origin || '');
  if (origin === ALLOWED_ORIGIN) {
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization');
    res.setHeader('Vary', 'Origin');
  }
  if (req.method === 'OPTIONS') return res.status(origin === ALLOWED_ORIGIN ? 204 : 403).end();
  if (req.method !== 'GET') return reply(res, 405, { ok: false, status: 'method_not_allowed' });
  if (origin && origin !== ALLOWED_ORIGIN) return reply(res, 403, { ok: false, status: 'origin_not_allowed' });
  const auth = /^Bearer ([\w.\-~+/=]{20,5000})$/.exec(String(req.headers.authorization || ''));
  if (!auth) return reply(res, 401, { ok: false, status: 'authentication_required' });
  try {
    const user = await supabaseGet('/auth/v1/user', auth[1]);
    if (!user?.id || !/^[0-9a-f-]{36}$/i.test(user.id)) return reply(res, 401, { ok: false, status: 'invalid_session' });
    const roles = await supabaseGet('/rest/v1/account_roles?select=role&user_id=eq.' + encodeURIComponent(user.id) + '&limit=1', auth[1]);
    if (!Array.isArray(roles) || roles[0]?.role !== 'admin') return reply(res, 403, { ok: false, status: 'admin_only' });
    const id = String(process.env.ACUITY_USER_ID || '').trim();
    const key = String(process.env.ACUITY_API_KEY || '').trim();
    if (!id || !key) return reply(res, 503, { ok: false, status: 'not_configured' });
    if (!/^\d{1,25}$/.test(id)) return reply(res, 503, { ok: false, status: 'invalid_user_id_format' });
    const now = new Date();
    const from = new Date(now.getTime() - 7 * 86400000).toISOString().slice(0, 10);
    const to = new Date(now.getTime() + 60 * 86400000).toISOString().slice(0, 10);
    const url = new URL('https://acuityscheduling.com/api/v1/appointments');
    url.searchParams.set('minDate', from);
    url.searchParams.set('maxDate', to);
    url.searchParams.set('max', '100');
    url.searchParams.set('showall', 'true');
    url.searchParams.set('excludeForms', 'true');
    const response = await fetch(url, {
      headers: { Authorization: 'Basic ' + Buffer.from(id + ':' + key, 'utf8').toString('base64'), Accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(13000)
    });
    if (response.status === 401 || response.status === 403) return reply(res, 502, { ok: false, status: 'acuity_auth_failed' });
    if (!response.ok) return reply(res, 502, { ok: false, status: 'acuity_unavailable' });
    const raw = await response.json();
    if (!Array.isArray(raw)) return reply(res, 502, { ok: false, status: 'acuity_invalid_response' });
    // Deliberately whitelist only necessary display fields, excluding emails, phone, forms and notes.
    const events = raw.slice(0, 100).map(x => ({
      id: Number(x.id) || null,
      name: [x.firstName, x.lastName].filter(v => typeof v === 'string').map(v => v.trim().slice(0, 100)).join(' ').slice(0, 180),
      at: typeof x.datetime === 'string' ? x.datetime.slice(0, 50) : '',
      appointment: typeof x.type === 'string' ? x.type.slice(0, 120) : '',
      calendar: typeof x.calendar === 'string' ? x.calendar.slice(0, 120) : '',
      calendarID: Number(x.calendarID) || null,
      canceled: x.canceled === true,
      noShow: x.noShow === true
    })).filter(x => Number.isInteger(x.id) && x.id > 0 && !Number.isNaN(Date.parse(x.at)))
      .sort((a,b)=>Date.parse(a.at)-Date.parse(b.at));
    return reply(res, 200, {
      ok: true,
      status: 'connected',
      events,
      window: { from, to },
      maxResultsReached: raw.length >= 100,
      source: 'acuity_read_only',
      patientLinking: false
    });
  } catch (error) {
    console.error('[acuity-appointments] error type:', error?.name || 'unexpected_error');
    return reply(res, 502, { ok: false, status: 'connection_error' });
  }
}
