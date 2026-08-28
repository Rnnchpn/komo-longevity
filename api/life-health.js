export default function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store, max-age=0');
  response.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const stripe = Boolean(process.env.STRIPE_SECRET_KEY);
  return response.status(200).json({
    ok: true,
    service: 'komo-life',
    productionOrigin: 'https://life.komolongevity.com/',
    checkoutProvider: 'stripe-checkout',
    checkoutConfigured: stripe,
    pointsMode: 'wallet-v1',
    pointsCheckoutConfigured: stripe,
    pointsPolicy: {
      kpPerEuro: 100,
      minimumRedemptionKp: 500,
      verifiedXpThreshold: 500,
      kpPerVerifiedThreshold: 250
    },
    release: 'life-wallet-v1'
  });
}
