import { next } from '@vercel/functions';

const PULSE_HOST = 'pulse.komolongevity.com';
const LIFE_HOST = 'life.komolongevity.com';
const SHOP_HOST = 'shop.komolongevity.com';
const EXPERIENCE_HOST = 'experience.komolongevity.com';
const COMMAND_HOST = 'command.komolongevity.com';
const COMMAND_USERS = {
  rchapon: '4900c828a7304e1dce3bd454ee775bba6d94c5157f125f807567d7455a091902',
  ucalia: '3308429ccb096d68db94915215a0a041d042ad50c6edd0b94ae9149f1ed724af',
  blebeau: 'b60d32cbe1ecc8d599650b72a8d8b6cd567220d004824f62b43ed5f9ff0dff42'
};
const STATIC_ORIGIN = 'https://komolongevity.com';
const STATIC_ASSET_RE = /\.(?:css|js|mjs|svg|png|jpe?g|webp|gif|ico|woff2?|ttf|otf)$/i;

const EXPERIENCE_CLEAN_ROUTES = {
  '/cannes': '/cannes.html',
  '/spain': '/spain.html',
  '/yachting': '/yachting.html',
};

const HOST_APPS = {
  [PULSE_HOST]: { prefix: '/pulse-v12', private: true, routeHeader: 'X-KOMO-Pulse-Route' },
  [LIFE_HOST]: { prefix: '/life-v1', private: false, routeHeader: 'X-KOMO-Life-Route' },
  [EXPERIENCE_HOST]: { prefix: '/experience', private: false, routeHeader: 'X-KOMO-Experience-Route' },
  [COMMAND_HOST]: { prefix: '/command-v1', private: true, routeHeader: 'X-KOMO-Command-Route' },
};

export const config = { matcher: '/:path*' };

async function sha256Hex(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

export default async function middleware(request) {
  const incomingUrl = new URL(request.url);
  const hostname = (request.headers.get('host') || incomingUrl.hostname).split(':')[0].toLowerCase();

  const isCommandApi = incomingUrl.pathname === '/command-api';
  const isCommandPath = incomingUrl.pathname === '/command' || incomingUrl.pathname.startsWith('/command/');
  if (hostname === COMMAND_HOST || isCommandPath || isCommandApi) {
    const authorization = request.headers.get('authorization') || '';
    let username = '';
    let password = '';
    if (authorization.startsWith('Basic ')) {
      try {
        const decoded = atob(authorization.slice(6));
        const separator = decoded.indexOf(':');
        username = separator >= 0 ? decoded.slice(0, separator).trim().toLowerCase() : '';
        password = separator >= 0 ? decoded.slice(separator + 1) : '';
      } catch {}
    }
    const expectedHash = COMMAND_USERS[username];
    const valid = Boolean(expectedHash && password && (await sha256Hex(username + ':' + password)) === expectedHash);
    if (!valid) {
      return new Response('KOMO Command — authentication required', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="KOMO Command", charset="UTF-8"',
          'Cache-Control': 'private, no-store, max-age=0',
          'X-Robots-Tag': 'noindex, nofollow, noarchive'
        }
      });
    }

    if (isCommandApi) {
      const target = 'https://uqlolefsiktbznnymriy.supabase.co/functions/v1/command-state';
      const headers = new Headers();
      headers.set('authorization', authorization);
      headers.set('content-type', request.headers.get('content-type') || 'application/json');
      const upstream = await fetch(target, {
        method: request.method,
        headers,
        body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
        redirect: 'manual'
      });
      const responseHeaders = new Headers(upstream.headers);
      responseHeaders.set('Cache-Control', 'private, no-store, max-age=0');
      responseHeaders.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
      return new Response(upstream.body, { status: upstream.status, statusText: upstream.statusText, headers: responseHeaders });
    }

    const commandRole = hostname === COMMAND_HOST
      ? incomingUrl.pathname.split('/').filter(Boolean)[0]
      : incomingUrl.pathname.split('/').filter(Boolean)[1];

    if (!commandRole) {
      const destination = new URL(request.url);
      destination.pathname = hostname === COMMAND_HOST ? '/' + username : '/command/' + username;
      return Response.redirect(destination, 307);
    }

    if (commandRole !== username) {
      const destination = new URL(request.url);
      destination.pathname = hostname === COMMAND_HOST ? '/' + username : '/command/' + username;
      return Response.redirect(destination, 307);
    }
  }

  if (hostname === SHOP_HOST) {
    const destination = new URL(incomingUrl.pathname + incomingUrl.search, `https://${LIFE_HOST}`);
    return Response.redirect(destination, 308);
  }

  const app = HOST_APPS[hostname];
  // COMMAND is only reachable through its dedicated host; hide the generated path on public hosts.
  if (!app && incomingUrl.pathname.startsWith('/command-v1')) {
    return new Response('Not Found', { status: 404, headers: { 'X-Robots-Tag': 'noindex, nofollow, noarchive' } });
  }
  if (!app) return next();

  if (incomingUrl.pathname.startsWith('/api/') || incomingUrl.pathname.startsWith('/_vercel/')) return next();

  let incomingPath = incomingUrl.pathname;
  if (hostname === EXPERIENCE_HOST && EXPERIENCE_CLEAN_ROUTES[incomingPath]) {
    incomingPath = EXPERIENCE_CLEAN_ROUTES[incomingPath];
  }

  let targetPath;
  if (hostname === COMMAND_HOST) targetPath = `${app.prefix}/`;
  else if (incomingPath === '/') targetPath = `${app.prefix}/`;
  else if (incomingPath.startsWith(`${app.prefix}/`)) targetPath = incomingPath;
  else targetPath = `${app.prefix}${incomingPath}`;

  const targetUrl = new URL(targetPath, STATIC_ORIGIN);
  targetUrl.search = incomingUrl.search;
  const proxyHeaders = new Headers(request.headers);
  proxyHeaders.delete('host');

  const upstream = await fetch(targetUrl, { method: request.method, headers: proxyHeaders, redirect: 'manual' });
  const responseHeaders = new Headers(upstream.headers);
  const isStaticAsset = STATIC_ASSET_RE.test(incomingPath);
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
    responseHeaders.set('Cache-Control', 'public, max-age=0, must-revalidate');
    responseHeaders.set('CDN-Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
  }

  if (app.private) responseHeaders.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  else responseHeaders.delete('X-Robots-Tag');
  responseHeaders.set(app.routeHeader, 'middleware');

  return new Response(upstream.body, { status: upstream.status, statusText: upstream.statusText, headers: responseHeaders });
}
