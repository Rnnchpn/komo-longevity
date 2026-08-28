const CATALOG = {
  'KL-VARSITY-001': { priceEnv: 'LIFE_STRIPE_PRICE_VARSITY', sizes: ['XS','S','M','L','XL'] },
  'KL-QZIP-001': { priceEnv: 'LIFE_STRIPE_PRICE_QZIP', sizes: ['XS','S','M','L','XL'] },
  'KL-KNIT-001': { priceEnv: 'LIFE_STRIPE_PRICE_KNIT', sizes: ['XS','S','M','L','XL'] },
  'KL-TEE-001': { priceEnv: 'LIFE_STRIPE_PRICE_TEE', sizes: ['XS','S','M','L','XL','XXL'] },
  'KL-HOOD-001': { priceEnv: 'LIFE_STRIPE_PRICE_HOODIE', sizes: ['XS','S','M','L','XL'] },
  'KL-CAP-001': { priceEnv: 'LIFE_STRIPE_PRICE_CAP', sizes: ['One size'] },
  'KL-TOTE-001': { priceEnv: 'LIFE_STRIPE_PRICE_TOTE', sizes: ['One size'] },
  'KL-SWEAT-001': { priceEnv: 'LIFE_STRIPE_PRICE_SWEATSHIRT', sizes: ['XS','S','M','L','XL'] }
};

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

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return reply(response, 405, { ok: false, error: 'method_not_allowed' });
  }

  if (!isSameOrigin(request)) return reply(response, 403, { ok: false, error: 'origin_not_allowed' });

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return reply(response, 503, { ok: false, error: 'checkout_not_configured' });

  const items = Array.isArray(request.body?.items) ? request.body.items : [];
  if (!items.length || items.length > 20) return reply(response, 400, { ok: false, error: 'invalid_cart' });

  const params = new URLSearchParams();
  params.set('mode', 'payment');
  params.set('success_url', 'https://life.komolongevity.com/?checkout=success&session_id={CHECKOUT_SESSION_ID}');
  params.set('cancel_url', 'https://life.komolongevity.com/?checkout=cancelled');
  params.set('billing_address_collection', 'auto');
  params.set('shipping_address_collection[allowed_countries][0]', 'FR');
  params.set('shipping_address_collection[allowed_countries][1]', 'BE');
  params.set('shipping_address_collection[allowed_countries][2]', 'LU');
  params.set('shipping_address_collection[allowed_countries][3]', 'NL');
  params.set('shipping_address_collection[allowed_countries][4]', 'DE');
  params.set('shipping_address_collection[allowed_countries][5]', 'ES');
  params.set('shipping_address_collection[allowed_countries][6]', 'IT');
  params.set('shipping_address_collection[allowed_countries][7]', 'PT');
  params.set('allow_promotion_codes', 'true');
  params.set('automatic_tax[enabled]', 'true');
  params.set('phone_number_collection[enabled]', 'false');
  params.set('metadata[storefront]', 'komo-life-v1');

  const sizeMetadata = [];
  for (let index = 0; index < items.length; index += 1) {
    const raw = items[index];
    const config = CATALOG[raw?.sku];
    const quantity = Number(raw?.quantity);
    if (!config || !Number.isInteger(quantity) || quantity < 1 || quantity > 5 || !config.sizes.includes(raw?.size)) {
      return reply(response, 400, { ok: false, error: 'invalid_line_item' });
    }
    const priceId = process.env[config.priceEnv];
    if (!priceId) return reply(response, 503, { ok: false, error: 'catalog_not_configured', sku: raw.sku });
    params.set(`line_items[${index}][price]`, priceId);
    params.set(`line_items[${index}][quantity]`, String(quantity));
    sizeMetadata.push(`${raw.sku}:${raw.size}x${quantity}`);
  }
  params.set('metadata[sizes]', sizeMetadata.join('|').slice(0, 490));

  try {
    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });
    const stripe = await stripeResponse.json();
    if (!stripeResponse.ok || !stripe?.url) {
      console.error('[life-checkout] Stripe error', stripe?.error?.type || stripeResponse.status);
      return reply(response, 502, { ok: false, error: 'checkout_provider_error' });
    }
    return reply(response, 200, { ok: true, url: stripe.url });
  } catch (error) {
    console.error('[life-checkout] network failure', error?.message);
    return reply(response, 502, { ok: false, error: 'checkout_provider_unreachable' });
  }
}
