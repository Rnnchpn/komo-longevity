const SUPABASE_URL = 'https://uqlolefsiktbznnymriy.supabase.co';
const SUPABASE_KEY = 'sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';

const templates = {
  welcome: {
    subject: 'Welcome to KŌMØ',
    eyebrow: 'KŌMØ PULSE',
    title: 'Votre espace est prêt.',
    body: 'Pulse rassemble vos repères, votre trajectoire et les prochaines étapes de votre parcours KŌMØ.'
  },
  assessment_ready: {
    subject: 'Your KŌMØ assessment is ready',
    eyebrow: 'KŌMØ PULSE',
    title: 'Votre nouvelle lecture est disponible.',
    body: 'Connectez-vous à votre espace sécurisé KŌMØ Pulse pour retrouver les éléments qui ont été mis à votre disposition.'
  },
  prepare_assessment: {
    subject: 'Prepare for your upcoming KŌMØ assessment',
    eyebrow: 'KŌMØ PULSE',
    title: 'Votre prochaine évaluation approche.',
    body: 'Les éléments utiles à préparer sont disponibles dans votre espace KŌMØ Pulse.'
  },
  clinical_invitation: {
    subject: 'You have been invited to KŌMØ Clinical',
    eyebrow: 'KŌMØ CLINICAL',
    title: 'Votre accès professionnel évolue.',
    body: 'Une invitation KŌMØ Clinical vous attend. Connectez-vous à Pulse pour poursuivre dans l’environnement sécurisé.'
  }
};

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function readBody(request) {
  if (request.body && typeof request.body === 'object') return request.body;
  if (typeof request.body === 'string') {
    try { return JSON.parse(request.body); } catch { return {}; }
  }
  return {};
}

async function authenticate(request) {
  const authorization = request.headers.authorization || '';
  if (!authorization.startsWith('Bearer ')) return null;

  const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: authorization
    }
  });
  if (!authResponse.ok) return null;
  return authResponse.json();
}

function renderEmail(template, displayName, appOrigin) {
  const safeName = escapeHtml(displayName || '');
  const greeting = safeName ? `Bonjour ${safeName},` : 'Bonjour,';
  const safeOrigin = escapeHtml(appOrigin);
  return `<!doctype html><html><body style="margin:0;background:#f4f1eb;font-family:Arial,sans-serif;color:#202421"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:42px 18px"><table role="presentation" width="100%" style="max-width:620px;background:#ffffff;border-radius:24px;border:1px solid #e9e5de"><tr><td style="padding:42px"><div style="font-size:20px;letter-spacing:.18em;font-weight:700;margin-bottom:48px">KŌMØ</div><div style="font-size:11px;letter-spacing:.16em;color:#748078;margin-bottom:12px">${template.eyebrow}</div><h1 style="font-size:32px;line-height:1.12;font-weight:500;letter-spacing:-.03em;margin:0 0 24px">${template.title}</h1><p style="font-size:15px;line-height:1.7;color:#5f665f;margin:0 0 12px">${greeting}</p><p style="font-size:15px;line-height:1.7;color:#5f665f;margin:0 0 30px">${template.body}</p><a href="${safeOrigin}" style="display:inline-block;background:#202421;color:#ffffff;text-decoration:none;border-radius:12px;padding:14px 20px;font-size:14px;font-weight:600">Ouvrir KŌMØ Pulse</a><p style="font-size:12px;line-height:1.6;color:#8a8f8a;margin:38px 0 0">Pour protéger votre confidentialité, cet e-mail ne contient aucune donnée de santé ni résultat clinique.</p></td></tr></table></td></tr></table></body></html>`;
}

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store, max-age=0');

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  if (!process.env.RESEND_API_KEY || !process.env.PULSE_EMAIL_FROM) {
    return response.status(503).json({ ok: false, error: 'email_not_configured' });
  }

  const user = await authenticate(request);
  if (!user?.id || !user?.email) {
    return response.status(401).json({ ok: false, error: 'unauthorized' });
  }

  const body = await readBody(request);
  const kind = String(body.kind || '');
  const template = templates[kind];
  if (!template) {
    return response.status(400).json({ ok: false, error: 'unsupported_template' });
  }

  const eventReference = String(body.eventReference || new Date().toISOString().slice(0, 10))
    .replace(/[^a-zA-Z0-9._:-]/g, '')
    .slice(0, 100);
  const idempotencyKey = `pulse:${kind}:${user.id}:${eventReference}`.slice(0, 240);
  const appOrigin = process.env.PULSE_APP_ORIGIN || 'https://pulse.komolongevity.com/';
  const displayName = user.user_metadata?.display_name || user.user_metadata?.full_name || '';

  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey
    },
    body: JSON.stringify({
      from: process.env.PULSE_EMAIL_FROM,
      to: [user.email],
      reply_to: process.env.PULSE_EMAIL_REPLY_TO || undefined,
      subject: template.subject,
      html: renderEmail(template, displayName, appOrigin)
    })
  });

  const result = await resendResponse.json().catch(() => ({}));
  if (!resendResponse.ok) {
    console.error('[pulse-email] Resend delivery failed', { status: resendResponse.status, kind, userId: user.id });
    return response.status(502).json({ ok: false, error: 'delivery_failed' });
  }

  return response.status(200).json({ ok: true, id: result.id || null, kind });
}
