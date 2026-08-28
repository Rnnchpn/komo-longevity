export default function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store, max-age=0');
  response.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  return response.status(200).json({
    ok: true,
    service: 'komo-life',
    productionOrigin: 'https://life.komolongevity.com/',
    checkoutProvider: 'stripe-checkout',
    checkoutConfigured: Boolean(process.env.STRIPE_SECRET_KEY),
    pointsMode: 'preview-access-layer',
    release: 'life-v1'
  });
}
