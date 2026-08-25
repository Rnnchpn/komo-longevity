import { next } from '@vercel/functions';

const PULSE_HOST = 'pulse.komolongevity.com';
const STATIC_ORIGIN = 'https://komolongevity.com';

export const config = {
  matcher: '/:path*',
};

export default async function middleware(request) {
  const incomingUrl = new URL(request.url);
  const hostname = (request.headers.get('host') || incomingUrl.hostname)
    .split(':')[0]
    .toLowerCase();

  if (hostname !== PULSE_HOST) {
    return next();
  }

  // Keep project APIs and Vercel internals on their native routes.
  if (
    incomingUrl.pathname.startsWith('/api/') ||
    incomingUrl.pathname.startsWith('/_vercel/')
  ) {
    return next();
  }

  // Proxy the public Pulse hostname to the already-built standalone Pulse files.
  // The browser keeps https://pulse.komolongevity.com/... while the source files
  // are served from the canonical production deployment under /pulse-v12/.
  let targetPath;
  if (incomingUrl.pathname === '/') {
    targetPath = '/pulse-v12/';
  } else if (incomingUrl.pathname.startsWith('/pulse-v12/')) {
    targetPath = incomingUrl.pathname;
  } else {
    targetPath = `/pulse-v12${incomingUrl.pathname}`;
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
  responseHeaders.set('Cache-Control', 'private, no-store, max-age=0');
  responseHeaders.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  responseHeaders.set('X-KOMO-Pulse-Route', 'middleware');

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}
