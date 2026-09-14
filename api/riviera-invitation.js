const CONTACT_TO = process.env.KOMO_CONTACT_TO_EMAIL || 'contact@komolongevity.com';
const CONTACT_FROM = process.env.KOMO_CONTACT_FROM_EMAIL || 'contact@komolongevity.com';
const EXPERIENCE_ORIGIN = 'https://experience.komolongevity.com';

const clean = (value, max = 1000) => String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
const cleanEmail = (value) => clean(value, 254).toLowerCase();
const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

function requestBody(request) {
  if (!request.body) return {};
  if (typeof request.body === 'object') return request.body;
  try { return JSON.parse(request.body); } catch { return null; }
}

function allowedOrigin(request) {
  const origin = String(request.headers.origin || '').trim().replace(/\/$/, '');
  if (!origin) return '';
  if (origin === EXPERIENCE_ORIGIN || origin === 'http://localhost:3000') return origin;
  return null;
}

function responseJson(response, status, body, origin) {
  response.setHeader('Cache-Control', 'no-store, max-age=0');
  response.setHeader('Vary', 'Origin');
  if (origin) response.setHeader('Access-Control-Allow-Origin', origin);
  return response.status(status).json(body);
}

function selected(value, options, fallback) {
  return options.includes(value) ? value : fallback;
}

function leadFrom(input) {
  const utm = input && typeof input.utm === 'object' ? input.utm : {};
  return {
    firstName: clean(input.firstName, 80),
    email: cleanEmail(input.email),
    edition: selected(clean(input.edition, 40), ['weekend', 'signature_stay', 'private_edition', 'undecided'], 'undecided'),
    profile: selected(clean(input.profile, 40), ['guest', 'guest_pair', 'private_group', 'partner'], 'guest'),
    area: clean(input.area, 100),
    message: clean(input.message, 800),
    language: selected(clean(input.language, 5), ['en', 'fr', 'es'], 'en'),
    consent: input.consent === true,
    medicalNotice: input.medicalNotice === true,
    website: clean(input.website, 200),
    utm: {
      source: clean(utm.source, 200),
      medium: clean(utm.medium, 200),
      campaign: clean(utm.campaign, 200),
      content: clean(utm.content, 200)
    }
  };
}

function invitationEmail(lead) {
  const subject = '[KŌMØ Riviera] Invitation request — ' + lead.edition;
  const rows = [
    ['Name', lead.firstName],
    ['Email', lead.email],
    ['Requested edition', lead.edition],
    ['Profile', lead.profile],
    ['Location', lead.area],
    ['Language', lead.language.toUpperCase()],
    ['UTM source', lead.utm.source],
    ['UTM medium', lead.utm.medium],
    ['UTM campaign', lead.utm.campaign]
  ].filter(([, value]) => value).map(([label, value]) =>
    '<tr><td style="padding:9px 12px;border-bottom:1px solid #e8e5dc;color:#68756c;font-size:13px;vertical-align:top;width:180px">' +
    escapeHtml(label) + '</td><td style="padding:9px 12px;border-bottom:1px solid #e8e5dc;color:#152d24;font-size:14px;vertical-align:top">' +
    escapeHtml(value) + '</td></tr>'
  ).join('');

  const html = '<!doctype html><html><body style="margin:0;background:#f4f1e9;font-family:Arial,Helvetica,sans-serif;color:#152d24"><div style="max-width:720px;margin:0 auto;padding:28px 18px"><div style="background:#143d30;color:#fff;padding:24px 28px;border-radius:18px 18px 0 0"><div style="font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#c8d5c7">KŌMØ Experiences · Cannes</div><h1 style="font-size:24px;line-height:1.2;margin:10px 0 0">New Riviera invitation request</h1></div><div style="background:#fff;padding:8px 18px 22px;border-radius:0 0 18px 18px"><table role="presentation" style="width:100%;border-collapse:collapse">' + rows + '</table><div style="margin-top:22px;padding:18px;border-radius:14px;background:#eef1e8"><div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#68756c;margin-bottom:8px">Practical note</div><div style="font-size:15px;line-height:1.65;white-space:pre-wrap">' + escapeHtml(lead.message || '—') + '</div></div><p style="margin:20px 0 0;color:#7a817c;font-size:12px">Submitted from experience.komolongevity.com · ' + new Date().toISOString() + '</p></div></div></body></html>';
  const text = [
    'KŌMØ Riviera — invitation request',
    '',
    'Name: ' + lead.firstName,
    'Email: ' + lead.email,
    'Requested edition: ' + lead.edition,
    'Profile: ' + lead.profile,
    'Location: ' + lead.area,
    'Language: ' + lead.language,
    'Source: ' + lead.utm.source,
    '',
    'Practical note:',
    lead.message || '—'
  ].join('\n');
  return { subject, html, text };
}

async function sendWithBrevo(lead, email) {
  const result = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { accept: 'application/json', 'api-key': process.env.BREVO_API_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({
      sender: { name: 'KŌMØ Riviera', email: CONTACT_FROM },
      to: [{ email: CONTACT_TO, name: 'KŌMØ' }],
      replyTo: { email: lead.email, name: lead.firstName || lead.email },
      subject: email.subject,
      htmlContent: email.html,
      textContent: email.text,
      tags: ['website', 'riviera-experience', 'invitation-request']
    })
  });
  if (!result.ok) throw new Error('brevo_' + result.status);
}

async function sendWithResend(lead, email) {
  const result = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: 'Bearer ' + process.env.RESEND_API_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: 'KŌMØ Riviera <' + CONTACT_FROM + '>',
      to: [CONTACT_TO],
      reply_to: lead.email,
      subject: email.subject,
      html: email.html,
      text: email.text
    })
  });
  if (!result.ok) throw new Error('resend_' + result.status);
}

export default async function handler(request, response) {
  const origin = allowedOrigin(request);
  if (origin === null) return responseJson(response, 403, { message: 'Origin not allowed.' }, '');

  if (request.method === 'OPTIONS') {
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    response.setHeader('Access-Control-Max-Age', '86400');
    response.setHeader('Vary', 'Origin');
    if (origin) response.setHeader('Access-Control-Allow-Origin', origin);
    return response.status(204).end();
  }

  if (request.method !== 'POST') return responseJson(response, 405, { message: 'Method not allowed.' }, origin);

  const body = requestBody(request);
  if (!body) return responseJson(response, 400, { message: 'Invalid request.' }, origin);
  const lead = leadFrom(body);

  // Honeypot: silently accept automated submissions without delivering mail.
  if (lead.website) return responseJson(response, 202, { status: 'request_received' }, origin);

  if (!lead.firstName || !isEmail(lead.email) || !lead.area || !lead.consent || !lead.medicalNotice) {
    return responseJson(response, 422, { message: 'Please complete the required fields.' }, origin);
  }

  const email = invitationEmail(lead);
  try {
    if (process.env.BREVO_API_KEY) await sendWithBrevo(lead, email);
    else if (process.env.RESEND_API_KEY) await sendWithResend(lead, email);
    else return responseJson(response, 503, { message: 'The invitation service is not configured yet. Please contact contact@komolongevity.com.' }, origin);

    return responseJson(response, 200, { status: 'request_received' }, origin);
  } catch (error) {
    console.error('[riviera-invitation] send failed', error);
    return responseJson(response, 502, { message: 'Unable to submit this request. Please try again or contact us directly.' }, origin);
  }
}
