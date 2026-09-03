const CONTACT_TO = process.env.KOMO_CONTACT_TO_EMAIL || 'contact@komolongevity.com';
const CONTACT_FROM = process.env.KOMO_CONTACT_FROM_EMAIL || 'contact@komolongevity.com';

const trim = (value, max = 1000) => String(value || '').trim().slice(0, max);
const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const interestLabels = {
  demo: 'Request a private KŌMØ demonstration',
  case_purchase: 'KŌMØ Case — purchase / installation',
  pilot: 'Founding pilot / operated session',
  multisite: 'Multi-site deployment',
  hospitality: 'Hospitality / hotel / retreat',
  corporate: 'Corporate / workplace health',
  sport: 'Sport / performance',
  distribution: 'Distribution / network partnership',
  other: 'Other partnership'
};

const organisationLabels = {
  medical: 'Medical / longevity centre',
  physician: 'Physician / private practice',
  fitness: 'Fitness / performance club',
  hospitality: 'Hotel / spa / resort / retreat',
  corporate: 'Company / insurer / mutual',
  sport: 'Sports organisation / team',
  concierge: 'Private concierge / villa / yacht',
  distributor: 'Distributor / network',
  other: 'Other'
};

function parseBody(request) {
  if (!request.body) return {};
  if (typeof request.body === 'object') return request.body;
  try { return JSON.parse(request.body); } catch (_) { return {}; }
}

function cleanLead(input) {
  const interests = Array.isArray(input.interests)
    ? input.interests.map((value) => trim(value, 80)).filter(Boolean).slice(0, 8)
    : [];

  return {
    firstName: trim(input.firstName, 100),
    lastName: trim(input.lastName, 100),
    email: trim(input.email, 180).toLowerCase(),
    phone: trim(input.phone, 80),
    role: trim(input.role, 160),
    organisation: trim(input.organisation, 200),
    website: trim(input.website, 240),
    city: trim(input.city, 120),
    country: trim(input.country, 120),
    organisationType: trim(input.organisationType, 80),
    sites: trim(input.sites, 80),
    assessments: trim(input.assessments, 100),
    timeline: trim(input.timeline, 100),
    preferredContact: trim(input.preferredContact, 80),
    interests,
    message: trim(input.message, 5000),
    locale: trim(input.locale, 10) || 'en',
    source: trim(input.source, 600),
    utmSource: trim(input.utmSource, 120),
    utmMedium: trim(input.utmMedium, 120),
    utmCampaign: trim(input.utmCampaign, 180),
    honeypot: trim(input.companyUrl, 250),
    consent: Boolean(input.consent)
  };
}

function row(label, value) {
  if (!value) return '';
  return `<tr><td style="padding:9px 12px;border-bottom:1px solid #e8e5dc;color:#68756c;font-size:13px;vertical-align:top;width:180px">${escapeHtml(label)}</td><td style="padding:9px 12px;border-bottom:1px solid #e8e5dc;color:#152d24;font-size:14px;vertical-align:top">${escapeHtml(value)}</td></tr>`;
}

function buildEmail(lead) {
  const name = `${lead.firstName} ${lead.lastName}`.trim();
  const orgType = organisationLabels[lead.organisationType] || lead.organisationType;
  const interests = lead.interests.map((item) => interestLabels[item] || item).join(', ');
  const location = [lead.city, lead.country].filter(Boolean).join(', ');
  const subject = `[KŌMØ PRO] ${lead.organisation || name || lead.email}${interests ? ` — ${interests.split(', ')[0]}` : ''}`;

  const html = `<!doctype html><html><body style="margin:0;background:#f4f1e9;font-family:Arial,Helvetica,sans-serif;color:#152d24"><div style="max-width:720px;margin:0 auto;padding:28px 18px"><div style="background:#143d30;color:#fff;padding:24px 28px;border-radius:18px 18px 0 0"><div style="font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#c8d5c7">KŌMØ · Professional enquiry</div><h1 style="font-size:24px;line-height:1.2;margin:10px 0 0">${escapeHtml(lead.organisation || name || 'New professional lead')}</h1></div><div style="background:#fff;padding:8px 18px 22px;border-radius:0 0 18px 18px"><table role="presentation" style="width:100%;border-collapse:collapse">${row('Name', name)}${row('Professional email', lead.email)}${row('Phone', lead.phone)}${row('Role', lead.role)}${row('Organisation', lead.organisation)}${row('Organisation type', orgType)}${row('Location', location)}${row('Website', lead.website)}${row('Number of sites', lead.sites)}${row('Expected assessments', lead.assessments)}${row('Timeline', lead.timeline)}${row('Preferred contact', lead.preferredContact)}${row('Interested in', interests)}${row('Language', lead.locale.toUpperCase())}${row('Source page', lead.source)}${row('UTM source', lead.utmSource)}${row('UTM medium', lead.utmMedium)}${row('UTM campaign', lead.utmCampaign)}</table><div style="margin-top:22px;padding:18px;border-radius:14px;background:#eef1e8"><div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#68756c;margin-bottom:8px">Project / message</div><div style="font-size:15px;line-height:1.65;white-space:pre-wrap">${escapeHtml(lead.message || '—')}</div></div><p style="margin:20px 0 0;color:#7a817c;font-size:12px">Submitted from komolongevity.com · ${new Date().toISOString()}</p></div></div></body></html>`;

  const text = [
    'KŌMØ — Professional enquiry',
    '',
    `Name: ${name}`,
    `Email: ${lead.email}`,
    `Phone: ${lead.phone}`,
    `Role: ${lead.role}`,
    `Organisation: ${lead.organisation}`,
    `Organisation type: ${orgType}`,
    `Location: ${location}`,
    `Website: ${lead.website}`,
    `Number of sites: ${lead.sites}`,
    `Expected assessments: ${lead.assessments}`,
    `Timeline: ${lead.timeline}`,
    `Preferred contact: ${lead.preferredContact}`,
    `Interested in: ${interests}`,
    `Language: ${lead.locale}`,
    `Source: ${lead.source}`,
    '',
    'Project / message:',
    lead.message || '—'
  ].join('\n');

  return { subject, html, text, name };
}

async function sendWithBrevo(lead, email) {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      sender: { name: 'KŌMØ Website', email: CONTACT_FROM },
      to: [{ email: CONTACT_TO, name: 'KŌMØ' }],
      replyTo: { email: lead.email, name: email.name || lead.email },
      subject: email.subject,
      htmlContent: email.html,
      textContent: email.text,
      tags: ['website', 'professional-lead']
    })
  });
  if (!response.ok) throw new Error(`brevo_${response.status}`);
}

async function sendWithResend(lead, email) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      from: `KŌMØ Website <${CONTACT_FROM}>`,
      to: [CONTACT_TO],
      reply_to: lead.email,
      subject: email.subject,
      html: email.html,
      text: email.text
    })
  });
  if (!response.ok) throw new Error(`resend_${response.status}`);
}

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store, max-age=0');
  response.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const lead = cleanLead(parseBody(request));

  // Honeypot: silently accept bots without sending mail.
  if (lead.honeypot) return response.status(200).json({ ok: true });

  if (!lead.firstName || !lead.lastName || !isEmail(lead.email) || !lead.organisation || !lead.organisationType || !lead.consent) {
    return response.status(400).json({ ok: false, error: 'invalid_payload' });
  }

  const email = buildEmail(lead);

  try {
    if (process.env.BREVO_API_KEY) {
      await sendWithBrevo(lead, email);
    } else if (process.env.RESEND_API_KEY) {
      await sendWithResend(lead, email);
    } else {
      return response.status(503).json({ ok: false, error: 'email_provider_not_configured' });
    }

    return response.status(200).json({ ok: true });
  } catch (error) {
    console.error('[professional-contact] send failed', error);
    return response.status(502).json({ ok: false, error: 'send_failed' });
  }
}
