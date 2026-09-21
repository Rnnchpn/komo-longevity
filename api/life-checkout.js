const SUPABASE_URL = 'https://uqlolefsiktbznnymriy.supabase.co';
const SUPABASE_KEY = 'sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';

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

const CASE01 = Object.freeze({
  sku: 'KL-CASE01-001',
  leather: Object.freeze({ signature: 1500000, heritage: 1650000, atelier: 1850000 }),
  exterior: Object.freeze(['obsidian','graphite','sand','sage','navy','cognac','bordeaux','ivory']),
  interior: Object.freeze(['sand','graphite','sage','navy','cognac']),
  stitching: Object.freeze({ tonal: 0, contrast: 18000, signature: 25000 }),
  hardware: Object.freeze({ silver: 0, champagne: 25000, black: 25000, titanium: 35000 }),
  personalisation: Object.freeze({ none: 0, initials: 18000, name: 24000 })
});

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

function bearer(request) {
  const raw = String(request.headers.authorization || '');
  return raw.startsWith('Bearer ') ? raw.slice(7).trim() : '';
}

function oneOf(value, allowed) {
  return allowed.includes(value);
}

function validateCase01(raw) {
  if (raw?.sku !== CASE01.sku || raw?.size !== 'Configured' || Number(raw?.quantity) !== 1) {
    return { ok: false, error: 'invalid_case01_line' };
  }

  const cfg = raw?.configuration && typeof raw.configuration === 'object' ? raw.configuration : {};
  const leather = String(cfg.leather || '');
  const exterior = String(cfg.exterior || '');
  const interior = String(cfg.interior || '');
  const stitching = String(cfg.stitching || '');
  const hardware = String(cfg.hardware || '');
  const personalisation = String(cfg.personalisation || '');
  const inscription = String(cfg.inscription || '').trim();

  if (leather === 'bespoke' || personalisation === 'custom') {
    return { ok: false, error: 'bespoke_requires_quote' };
  }
  if (!Object.hasOwn(CASE01.leather, leather) ||
      !oneOf(exterior, CASE01.exterior) ||
      !oneOf(interior, CASE01.interior) ||
      !Object.hasOwn(CASE01.stitching, stitching) ||
      !Object.hasOwn(CASE01.hardware, hardware) ||
      !Object.hasOwn(CASE01.personalisation, personalisation)) {
    return { ok: false, error: 'invalid_case01_configuration' };
  }
  if (inscription.length > 40 || (personalisation !== 'none' && !inscription) || (personalisation === 'none' && inscription)) {
    return { ok: false, error: 'invalid_case01_inscription' };
  }

  const unitAmount =
    CASE01.leather[leather] +
    CASE01.stitching[stitching] +
    CASE01.hardware[hardware] +
    CASE01.personalisation[personalisation];

  const configuration = { leather, exterior, interior, stitching, hardware, personalisation, inscription };
  return {
    ok: true,
    line: {
      sku: CASE01.sku,
      size: 'Configured',
      quantity: 1,
      dynamic: true,
      unitAmount,
      configuration,
      productName: `KŌMØ CASE 01 — ${leather.charAt(0).toUpperCase() + leather.slice(1)}`
    }
  };
}

function compactCaseMetadata(configuration) {
  if (!configuration) return '';
  const data = {
    l: configuration.leather,
    e: configuration.exterior,
    i: configuration.interior,
    s: configuration.stitching,
    h: configuration.hardware,
    p: configuration.personalisation,
    n: configuration.inscription || ''
  };
  return JSON.stringify(data).slice(0, 490);
}

async function supabaseRpc(name, args, token) {
  const result = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(args || {})
  });
  const payload = await result.json().catch(() => null);
  if (!result.ok) {
    const error = new Error(payload?.message || payload?.code || `supabase_rpc_${result.status}`);
    error.status = result.status;
    throw error;
  }
  return payload;
}

async function stripeForm(secret, path, form, method = 'POST') {
  const result = await fetch(`https://api.stripe.com/v1/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${secret}`,
      ...(method === 'POST' ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {})
    },
    ...(method === 'POST' ? { body: form?.toString() || '' } : {})
  });
  const payload = await result.json().catch(() => null);
  if (!result.ok) {
    const error = new Error(payload?.error?.message || `stripe_${result.status}`);
    error.type = payload?.error?.type;
    error.status = result.status;
    throw error;
  }
  return payload;
}

async function cartSubtotal(secret, validated) {
  const cache = new Map();
  let total = 0;
  for (const line of validated) {
    if (line.dynamic) {
      total += line.unitAmount * line.quantity;
      continue;
    }
    let price = cache.get(line.priceId);
    if (!price) {
      price = await stripeForm(secret, `prices/${encodeURIComponent(line.priceId)}`, null, 'GET');
      cache.set(line.priceId, price);
    }
    if (price?.currency !== 'eur' || !Number.isInteger(price?.unit_amount) || price.unit_amount <= 0) {
      throw new Error('invalid_stripe_price');
    }
    total += price.unit_amount * line.quantity;
  }
  return total;
}

async function cancelRedemption(id, token) {
  if (!id || !token) return;
  try { await supabaseRpc('komo_cancel_life_redemption', { p_redemption_id: id }, token); }
  catch (error) { console.error('[life-checkout] redemption cancel failed', error?.message); }
}

async function expireSession(secret, sessionId) {
  if (!sessionId) return;
  try { await stripeForm(secret, `checkout/sessions/${encodeURIComponent(sessionId)}/expire`, new URLSearchParams()); }
  catch (error) { console.error('[life-checkout] session expiry failed', error?.message); }
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

  const requestedPoints = Number(request.body?.points || 0);
  if (!Number.isInteger(requestedPoints) || requestedPoints < 0 || (requestedPoints > 0 && (requestedPoints < 500 || requestedPoints % 100 !== 0))) {
    return reply(response, 400, { ok: false, error: 'invalid_points_amount' });
  }
  const token = requestedPoints > 0 ? bearer(request) : '';
  if (requestedPoints > 0 && !token) return reply(response, 401, { ok: false, error: 'komo_account_required' });

  const validated = [];
  const sizeMetadata = [];
  const caseLines = [];

  for (let index = 0; index < items.length; index += 1) {
    const raw = items[index];
    const quantity = Number(raw?.quantity);

    if (raw?.sku === CASE01.sku) {
      const checked = validateCase01(raw);
      if (!checked.ok) return reply(response, 400, { ok: false, error: checked.error });
      validated.push(checked.line);
      caseLines.push(checked.line);
      sizeMetadata.push(`${CASE01.sku}:Configuredx1`);
      continue;
    }

    const config = CATALOG[raw?.sku];
    if (!config || !Number.isInteger(quantity) || quantity < 1 || quantity > 5 || !config.sizes.includes(raw?.size)) {
      return reply(response, 400, { ok: false, error: 'invalid_line_item' });
    }
    const priceId = process.env[config.priceEnv];
    if (!priceId) return reply(response, 503, { ok: false, error: 'catalog_not_configured', sku: raw.sku });
    validated.push({ sku: raw.sku, size: raw.size, quantity, priceId, dynamic: false });
    sizeMetadata.push(`${raw.sku}:${raw.size}x${quantity}`);
  }

  if (caseLines.length > 1) return reply(response, 400, { ok: false, error: 'case01_quantity_limit' });

  let redemption = null;
  let session = null;
  try {
    let subtotal = 0;
    if (requestedPoints > 0) {
      subtotal = await cartSubtotal(secret, validated);
      const maxRedeemable = Math.max(0, subtotal - 100);
      if (requestedPoints > maxRedeemable) {
        return reply(response, 400, { ok: false, error: 'points_exceed_cart', max_points: Math.floor(maxRedeemable / 100) * 100 });
      }
      redemption = await supabaseRpc('komo_create_life_redemption', { p_points: requestedPoints }, token);
    }

    const params = new URLSearchParams();
    params.set('mode', 'payment');
    params.set('success_url', 'https://life.komolongevity.com/?checkout=success&session_id={CHECKOUT_SESSION_ID}');
    params.set('cancel_url', 'https://life.komolongevity.com/?checkout=cancelled');
    params.set('billing_address_collection', 'auto');
    ['FR','BE','LU','NL','DE','ES','IT','PT'].forEach((country, index) => params.set(`shipping_address_collection[allowed_countries][${index}]`, country));
    params.set('automatic_tax[enabled]', 'true');
    params.set('phone_number_collection[enabled]', caseLines.length ? 'true' : 'false');
    params.set('metadata[storefront]', 'komo-life-v1');
    params.set('metadata[sizes]', sizeMetadata.join('|').slice(0, 490));
    if (caseLines[0]) {
      params.set('metadata[product]', 'KOMO_CASE_01');
      params.set('metadata[case_configuration]', compactCaseMetadata(caseLines[0].configuration));
    }

    validated.forEach((line, index) => {
      if (line.dynamic) {
        params.set(`line_items[${index}][price_data][currency]`, 'eur');
        params.set(`line_items[${index}][price_data][unit_amount]`, String(line.unitAmount));
        params.set(`line_items[${index}][price_data][tax_behavior]`, 'exclusive');
        params.set(`line_items[${index}][price_data][product_data][name]`, line.productName);
        params.set(`line_items[${index}][price_data][product_data][description]`, 'Configured leather attaché-case · 2 iPads · 6 sensors · tripod · accessories');
        params.set(`line_items[${index}][quantity]`, '1');
      } else {
        params.set(`line_items[${index}][price]`, line.priceId);
        params.set(`line_items[${index}][quantity]`, String(line.quantity));
      }
    });

    if (redemption?.id) {
      const couponParams = new URLSearchParams();
      couponParams.set('duration', 'once');
      couponParams.set('amount_off', String(redemption.value_cents));
      couponParams.set('currency', 'eur');
      couponParams.set('name', 'KŌMØ Points');
      couponParams.set('metadata[program]', 'komo-wallet-v1');
      couponParams.set('metadata[redemption_id]', redemption.id);
      const coupon = await stripeForm(secret, 'coupons', couponParams);
      params.set('discounts[0][coupon]', coupon.id);
      params.set('metadata[points_redemption_id]', redemption.id);
      params.set('metadata[points_amount]', String(redemption.points));
    } else {
      params.set('allow_promotion_codes', 'true');
    }

    session = await stripeForm(secret, 'checkout/sessions', params);
    if (!session?.url || !session?.id) throw new Error('checkout_session_invalid');

    if (redemption?.id) {
      try {
        await supabaseRpc('komo_attach_life_checkout', {
          p_redemption_id: redemption.id,
          p_checkout_session_id: session.id
        }, token);
      } catch (error) {
        await expireSession(secret, session.id);
        await cancelRedemption(redemption.id, token);
        throw error;
      }
    }

    return reply(response, 200, {
      ok: true,
      url: session.url,
      session_id: session.id,
      points: redemption ? { reserved: redemption.points, value_cents: redemption.value_cents } : null
    });
  } catch (error) {
    if (redemption?.id && !session?.id) await cancelRedemption(redemption.id, token);
    console.error('[life-checkout]', error?.type || error?.message || 'checkout_failure');
    const authLike = Number(error?.status) === 401 || Number(error?.status) === 403;
    return reply(response, authLike ? 401 : 502, { ok: false, error: authLike ? 'komo_wallet_authorization_failed' : 'checkout_provider_error' });
  }
}
