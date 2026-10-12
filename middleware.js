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

  // Pilotage: standalone sign-in, signed HTTP-only cookie, access checks on every file.
  const pilotagePath = incomingUrl.pathname.toLowerCase();
  const isPilotage = pilotagePath === '/pilotage' || pilotagePath.startsWith('/pilotage/');
  if (isPilotage) {
    const cookieName = 'komo_pilotage_session';
    const cookieValue = request.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith(cookieName+'='))?.slice(cookieName.length+1) || '';
    const sessionKey = process.env.KOMO_PILOTAGE_SESSION_SECRET || '';
    const verifier = process.env.KOMO_PILOTAGE_PASSWORD_HASH || '';
    const secure = 'Path=/Pilotage; HttpOnly; Secure; SameSite=Strict; Max-Age=43200';
    async function sign(data) {
      const k = await crypto.subtle.importKey('raw',new TextEncoder().encode(sessionKey),{name:'HMAC',hash:'SHA-256'},false,['sign']);
      const h = await crypto.subtle.sign('HMAC',k,new TextEncoder().encode(data));
      return Array.from(new Uint8Array(h),b=>b.toString(16).padStart(2,'0')).join('');
    }
    let validSession=false;
    if(sessionKey && cookieValue.includes('.')) {
      const [expires,mac]=cookieValue.split('.');
      if(/^\\d{10,13}$/.test(expires) && /^[a-f0-9]{64}$/.test(mac||'') && Number(expires)>Date.now()) {
        validSession=(await sign('rchapon:'+expires))===mac;
      }
    }
    if(pilotagePath==='/pilotage/logout') {
      return new Response(null,{status:303,headers:{'Location':'/Pilotage/','Set-Cookie':cookieName+'=; '+secure+'; Max-Age=0','Cache-Control':'no-store'}});
    }
    if(pilotagePath==='/pilotage/login' && request.method==='POST') {
      const form=await request.formData().catch(()=>null);
      const username=String(form?.get('username')||'').trim().toLowerCase();
      const password=String(form?.get('password')||'');
      const ok=Boolean(sessionKey && verifier && username==='rchapon' && password && await sha256Hex(username+':'+password)===verifier);
      if(ok) {
        const expiry=String(Date.now()+43200000);
        const cookie=expiry+'.'+await sign('rchapon:'+expiry);
        return new Response(null,{status:303,headers:{'Location':'/Pilotage/','Set-Cookie':cookieName+'='+cookie+'; '+secure,'Cache-Control':'private, no-store'}});
      }
      return new Response(null,{status:303,headers:{'Location':'/Pilotage/?error=1','Cache-Control':'no-store'}});
    }
    if(!validSession){
      if(request.method!=='GET' && request.method!=='HEAD')return new Response('Unauthorized',{status:401,headers:{'Cache-Control':'no-store'}});
      if(pilotagePath!== '/pilotage' && pilotagePath!== '/pilotage/')return new Response('Unauthorized',{status:401,headers:{'Cache-Control':'no-store'}});
      const html=`<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>KŌMØ — Connexion Pilotage</title><style>*{box-sizing:border-box}body{margin:0;background:#f4f5f1;color:#223328;font:14px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;min-height:100vh;display:grid;place-items:center}.login{width:min(420px,calc(100vw - 36px));padding:38px;background:#fff;border:1px solid #e1e7df;border-radius:12px;box-shadow:0 20px 65px #1d342017}.brand{font-size:27px;letter-spacing:.25em;font-weight:700;color:#203e2c}.kicker{font-size:11px;letter-spacing:.17em;color:#819185;margin-top:13px;text-transform:uppercase}h1{margin:37px 0 7px;font-size:25px;font-weight:560}p{color:#879387;font-size:12px;line-height:1.6;margin-bottom:24px}label{display:block;font-size:12px;font-weight:600;margin:17px 0 7px}input{width:100%;padding:12px;border:1px solid #cfdad0;border-radius:7px;color:#213d2a;background:#fff;font:inherit}button{background:#234530;color:#fff;border:0;padding:13px;width:100%;border-radius:7px;font:inherit;font-weight:650;cursor:pointer;margin-top:24px}.error{background:#fff1ee;color:#ac504b;border-radius:6px;padding:11px;margin:18px 0;font-size:12px}</style></head><body><main class="login"><div class="brand">KŌMØ</div><div class="kicker">Gestion des opérations</div><h1>Connexion</h1><p>Accès réservé à l'équipe autorisée.</p>${incomingUrl.searchParams.has('error')?'<div class="error">Identifiant ou mot de passe incorrect.</div>':''}<form method="post" action="/Pilotage/login"><label for="user">Identifiant</label><input id="user" name="username" autocomplete="username" required autofocus><label for="pass">Mot de passe</label><input id="pass" name="password" type="password" autocomplete="current-password" required><button type="submit">Se connecter</button></form></main></body></html>`;
      return new Response(html,{status:200,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow'}});
    }
    const response=next();
    response.headers.set('Cache-Control','private, no-store');
    response.headers.set('X-Robots-Tag','noindex, nofollow');
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
