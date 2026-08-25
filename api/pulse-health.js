const PROJECT_REF = 'uqlolefsiktbznnymriy';

export default function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store, max-age=0');
  response.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  return response.status(200).json({
    ok: true,
    service: 'komo-pulse',
    projectRef: PROJECT_REF,
    identityBackend: 'supabase-auth',
    dataBackend: 'supabase-postgres',
    notificationBackend: 'supabase-edge:pulse-notify',
    authEmailBackend: 'supabase-auth-custom-smtp',
    productionOrigin: 'https://pulse.komolongevity.com/',
    note: 'Server-side email secrets are held in Supabase configuration and are never exposed by this endpoint.'
  });
}
