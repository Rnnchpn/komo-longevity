const PROJECT_REF = 'uqlolefsiktbznnymriy';

export default function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store, max-age=0');
  response.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const checks = {
    supabaseProject: true,
    resendApiKey: Boolean(process.env.RESEND_API_KEY),
    emailFrom: Boolean(process.env.PULSE_EMAIL_FROM),
    emailReplyTo: Boolean(process.env.PULSE_EMAIL_REPLY_TO),
    appOrigin: Boolean(process.env.PULSE_APP_ORIGIN)
  };

  const requiredReady = checks.supabaseProject && checks.resendApiKey && checks.emailFrom;

  return response.status(requiredReady ? 200 : 503).json({
    ok: requiredReady,
    service: 'komo-pulse',
    projectRef: PROJECT_REF,
    checks,
    note: requiredReady
      ? 'Pulse infrastructure is ready for Supabase + Resend transactional email.'
      : 'One or more server-side email variables are not configured. No secret value is exposed.'
  });
}
