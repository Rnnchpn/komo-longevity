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
  [PULSE_HOST]: { prefix: '/pulse-v13', private: true, routeHeader: 'X-KOMO-Pulse-Route' },
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

  // KŌMØ Operations: dedicated login page, signed HttpOnly session cookie,
  // and protected static assets. Command authentication is unchanged.
  const pilotagePath = incomingUrl.pathname.toLowerCase();
  const isPilotagePath = pilotagePath === '/pilotage' || pilotagePath.startsWith('/pilotage/');
  if (isPilotagePath) {
    const secret = process.env.KOMO_PILOTAGE_PASSWORD_HASH || '';
    const isAsset = /\.(css|js|mjs|svg|png|jpe?g|webp|ico|woff2?)$/i.test(incomingUrl.pathname);
    const noStore = {
      'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer'
    };
    const loginHtml = (failed = false, unavailable = false) => `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow,noarchive">
<title>KŌMØ Operations — Connexion</title>
<style>
:root{color-scheme:light}*{box-sizing:border-box}body{margin:0;min-height:100svh;font:14px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#20352a;background:radial-gradient(circle at 20% 10%,#ebf2e9 0,transparent 44%),#f6f6f1;display:flex;justify-content:center;align-items:center;padding:24px}
main{width:min(445px,100%);background:#fff;border:1px solid #e2e9df;border-radius:18px;padding:clamp(26px,7vw,45px);box-shadow:0 24px 70px rgba(20,42,26,.07)}
.brand{font-size:28px;font-weight:640;letter-spacing:.21em;color:#1e3b29}.brand i{font-style:normal;color:#88b29a;margin-left:-.1em}
.eyebrow{margin-top:29px;color:#668773;font-size:10px;font-weight:760;letter-spacing:.18em}
h1{font:normal clamp(27px,6vw,36px)/1.18 Georgia,serif;letter-spacing:-.03em;margin:12px 0}p{font-size:13px;color:#829184;margin-bottom:26px}
label{display:block;font-weight:660;font-size:12px;margin:16px 0 7px}
input{display:block;border:1px solid #d8e3d9;background:#fcfdfb;border-radius:9px;padding:13px 15px;width:100%;outline-offset:2px;color:#254032;font:inherit}
input:focus{outline:2px solid #9ec5a6;border-color:#7ba68b}
button{margin-top:23px;width:100%;padding:14px;border:0;border-radius:9px;background:#254832;color:white;font-weight:710;cursor:pointer}
button:hover{background:#356648}button:focus-visible{outline:3px solid #9fcaa7;outline-offset:3px}
.error{background:#fff2ee;color:#995248;border:1px solid #f3dcd6;border-radius:8px;padding:11px 13px;font-size:12px}
.note{margin-top:25px;padding-top:19px;border-top:1px solid #eef0ec;font-size:11px;color:#9ca89e}
</style>
</head>
<body><main>
<div class="brand">KŌMØ<i>.</i></div>
<div class="eyebrow">OPERATIONS / PILOTAGE</div>
<h1>Votre espace de pilotage.</h1>
<p>Accès privé à la coordination des missions, aux validations et aux encaissements KŌMØ.</p>
${failed ? '<div class="error" role="alert">Identifiant ou mot de passe incorrect.</div>' : ''}
${unavailable ? '<div class="error" role="alert">Accès temporairement indisponible. Contactez l’administrateur.</div>' : ''}
<form method="post" action="/Pilotage/login" autocomplete="on">
<label for="username">Identifiant</label>
<input id="username" name="username" type="text" required autocomplete="username" value="rchapon" maxlength="80">
<label for="password">Mot de passe</label>
<input id="password" name="password" type="password" required autocomplete="current-password">
<button type="submit">Accéder au pilotage →</button>
</form>
<div class="note">Zone privée · Session protégée · Aucune opération financière réelle dans le prototype.</div>
</main></body></html>`;
    const sameValue = (left, right) => {
      if (typeof left !== 'string' || typeof right !== 'string') return false;
      let difference = left.length ^ right.length;
      for (let i = 0; i < Math.max(left.length, right.length); i++) {
        difference |= (left.charCodeAt(i) || 0) ^ (right.charCodeAt(i) || 0);
      }
      return difference === 0;
    };
    const signatureFor = async (stamp) => {
      const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret),
        { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
      const signed = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode('pilotage-v1:' + stamp));
      return Array.from(new Uint8Array(signed), b => b.toString(16).padStart(2, '0')).join('');
    };
    const cookieName = 'komo_pilotage_session';
    const cookieHeader = request.headers.get('cookie') || '';
    const rawCookie = cookieHeader.split(';').map(p => p.trim()).find(p => p.startsWith(cookieName + '='));
    const session = rawCookie ? rawCookie.slice(cookieName.length + 1) : '';
    const [stamp, sig] = session.split('.');
    let sessionValid = false;
    if (secret && stamp && sig && /^[0-9a-z]{1,14}$/.test(stamp) && /^[0-9a-f]{64}$/.test(sig)) {
      const created = parseInt(stamp, 36);
      const now = Date.now();
      if (Number.isSafeInteger(created) && created < now + 300000 && now - created < 8 * 60 * 60 * 1000) {
        sessionValid = sameValue(sig, await signatureFor(stamp));
      }
    }
    if (pilotagePath === '/pilotage/logout') {
      const res = Response.redirect(new URL('/Pilotage/', request.url), 303);
      res.headers.append('Set-Cookie', cookieName + '=; Path=/Pilotage; Max-Age=0; HttpOnly; Secure; SameSite=Lax');
      Object.entries(noStore).forEach(([key, value]) => res.headers.set(key, value));
      return res;
    }
    if (pilotagePath === '/pilotage/login' && request.method === 'POST') {
      if (!secret) return new Response(loginHtml(false, true), {
        status: 503, headers: { ...noStore, 'Content-Type': 'text/html; charset=utf-8' }
      });
      let fields;
      try { fields = await request.formData(); } catch { fields = null; }
      const user = fields && fields.get('username');
      const password = fields && fields.get('password');
      const valid = typeof user === 'string' && user.trim().toLowerCase() === 'rchapon' &&
        typeof password === 'string' && password.length > 0 && password.length <= 200 &&
        sameValue(await sha256Hex('rchapon:' + password), secret);
      if (!valid) return new Response(loginHtml(true), {
        status: 401, headers: { ...noStore, 'Content-Type': 'text/html; charset=utf-8' }
      });
      const issued = Date.now().toString(36);
      const mac = await signatureFor(issued);
      const res = Response.redirect(new URL('/Pilotage/', request.url), 303);
      res.headers.append('Set-Cookie', cookieName + '=' + issued + '.' + mac +
        '; Path=/Pilotage; Max-Age=28800; HttpOnly; Secure; SameSite=Lax');
      Object.entries(noStore).forEach(([key, value]) => res.headers.set(key, value));
      return res;
    }
    if (!sessionValid) {
      if (isAsset) return new Response('Forbidden', { status: 403, headers: noStore });
      return new Response(loginHtml(false, !secret), {
        status: secret ? 200 : 503,
        headers: { ...noStore, 'Content-Type': 'text/html; charset=utf-8' }
      });
    }
    if (pilotagePath === '/pilotage/login' || pilotagePath === '/pilotage') {
      return Response.redirect(new URL('/Pilotage/', request.url), 303);
    }
    const response = next();
    Object.entries(noStore).forEach(([key, value]) => response.headers.set(key, value));
    return response;
  }

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


  // KŌMØ Intelligence is temporarily open for frictionless access.
  // Keep it out of search indexes and never cache authenticated/private-style content.
  const isIntelligenceApi = incomingUrl.pathname === '/api/intelligence-live';
  const isIntelligencePath = incomingUrl.pathname === '/intelligence' || incomingUrl.pathname.startsWith('/intelligence/');
  if (isIntelligencePath || isIntelligenceApi) {
    // Public for the next few days by product decision; only public/operational yacht data is exposed here.
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

  if (hostname === PULSE_HOST && isStaticAsset && !isVersionedAsset) {
    responseHeaders.set('Cache-Control', 'private, no-store, max-age=0');
    responseHeaders.delete('CDN-Cache-Control');
  } else if (isVersionedAsset) {
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
