(() => {
  async function accessToken() {
    if (window.KomoLifeWallet?.getAccessToken) return window.KomoLifeWallet.getAccessToken();
    return null;
  }

  async function start(items, points = 0) {
    const normalizedPoints = Number(points || 0);
    if (!Array.isArray(items) || !items.length) throw new Error('invalid_cart');
    if (!Number.isInteger(normalizedPoints) || normalizedPoints < 0) throw new Error('invalid_points_amount');

    const headers = { 'Content-Type': 'application/json' };
    if (normalizedPoints > 0) {
      const token = await accessToken();
      if (!token) throw new Error('komo_account_required');
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch('/api/life-checkout', {
      method: 'POST',
      headers,
      body: JSON.stringify({ items, points: normalizedPoints })
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.url) {
      const error = new Error(payload?.error || 'checkout_failed');
      error.payload = payload;
      throw error;
    }
    location.assign(payload.url);
    return payload;
  }

  window.KomoLifeCheckout = {
    start,
    policy: Object.freeze({ kpPerEuro: 100, minimumRedemptionKp: 500, redemptionStepKp: 100 }),
    version: '1.0.0'
  };
})();
