import { next } from '@vercel/functions';

const PULSE_HOST = 'pulse.komolongevity.com';
const LIFE_HOST = 'life.komolongevity.com';
const SHOP_HOST = 'shop.komolongevity.com';
const STATIC_ORIGIN = 'https://komolongevity.com';
const STATIC_ASSET_RE = /\.(?:css|js|mjs|svg|png|jpe?g|webp|gif|ico|woff2?|ttf|otf)$/i;

const HOST_APPS = {
  [PULSE_HOST]: { prefix: '/pulse-v12', private: true, routeHeader: 'X-KOMO-Pulse-Route' },
  [LIFE_HOST]: { prefix: '/life-v1', private: false, routeHeader: 'X-KOMO-Life-Route' },
};

export const config = {
  matcher: '/:path*',
};

export default async function middleware(request) {
  const incomingUrl = new URL(request.url);
  const hostname = (request.headers.get('host') || incomingUrl.hostname)
    .split(':')[0]
    .toLowerCase();

  if (hostname === SHOP_HOST) {
    const destination = new URL(incomingUrl.pathname + incomingUrl.search, `https://${LIFE_HOST}`);
    return Response.redirect(destination, 308);
  }

  const app = HOST_APPS[hostname];
  if (!app) return next();

  // APIs and Vercel internals stay on native project routes for both Pulse and Life.
  if (
    incomingUrl.pathname.startsWith('/api/') ||
    incomingUrl.pathname.startsWith('/_vercel/')
  ) {
    return next();
  }

  let targetPath;
  if (incomingUrl.pathname === '/') {
    targetPath = `${app.prefix}/`;
  } else if (incomingUrl.pathname.startsWith(`${app.prefix}/`)) {
    targetPath = incomingUrl.pathname;
  } else {
    targetPath = `${app.prefix}${incomingUrl.pathname}`;
  }

  const targetUrl = new URL(targetPath, STATIC_ORIGIN);
  targetUrl.search = incomingUrl.search;

  const proxyHeaders = new Headers(request.headers);
  proxyHeaders.delete('host');

  const upstream = await fetch(targetUrl, {
    method: request.method,
    headers: proxyHeaders,
    redirect: 'manual',
  });

  const responseHeaders = new Headers(upstream.headers);
  const isStaticAsset = STATIC_ASSET_RE.test(incomingUrl.pathname);
  const isVersionedAsset = isStaticAsset && incomingUrl.searchParams.has('v');

  if (isVersionedAsset) {
    responseHeaders.set('Cache-Control', 'public, max-age=31536000, immutable');
    responseHeaders.set('CDN-Cache-Control', 'public, s-maxage=31536000, immutable');
  } else if (isStaticAsset) {
    responseHeaders.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600');
    responseHeaders.set('CDN-Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
  } else if (app.private) {
    responseHeaders.set('Cache-Control', 'private, no-store, max-age=0');
    responseHeaders.delete('CDN-Cache-Control');
  } else {
    // Life is a public, indexable storefront. Keep HTML fresh while allowing short CDN caching.
    responseHeaders.set('Cache-Control', 'public, max-age=0, must-revalidate');
    responseHeaders.set('CDN-Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
  }

  if (app.private) {
    responseHeaders.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  } else {
    responseHeaders.delete('X-Robots-Tag');
  }
  responseHeaders.set(app.routeHeader, 'middleware');

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}
