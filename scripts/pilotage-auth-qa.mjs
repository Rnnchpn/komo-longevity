// Build-time smoke test for KŌMØ Operations private login.
// Uses a test-only password and fake 'next' response. Never touches production data.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const file = readFileSync('middleware.js', 'utf8');
assert.ok(file.includes("const isCommandApi"));
assert.ok(file.includes("KOMO_PILOTAGE_PASSWORD_HASH"));
let transformed = file
  .replace("import { next } from '@vercel/functions';", "const next = () => new Response('KOMO_NEXT_OK', { status: 200 });")
  .replace('export const config =', 'const config =')
  .replace('export default async function middleware', 'async function middleware');
transformed += '\nexport { middleware };';
const moduleUrl = 'data:text/javascript;base64,' + Buffer.from(transformed).toString('base64');
const { middleware } = await import(moduleUrl);

const prior = process.env.KOMO_PILOTAGE_PASSWORD_HASH;
const password = 'pilotage-qa-local-only';
process.env.KOMO_PILOTAGE_PASSWORD_HASH = createHash('sha256').update('rchapon:' + password).digest('hex');
try {
  const base = 'https://komolongevity.com/Pilotage/';
  const anonymous = await middleware(new Request(base));
  assert.equal(anonymous.status, 200);
  const loginScreen = await anonymous.text();
  assert.match(loginScreen, /KŌMØ Operations/);
  assert.match(loginScreen, /action="\/Pilotage\/login"/);
  assert.doesNotMatch(loginScreen, /KOMO_NEXT_OK/);

  const asset = await middleware(new Request(base + 'app.js'));
  assert.equal(asset.status, 403);

  const invalid = await middleware(new Request(base + 'login', {
    method: 'POST',
    body: new URLSearchParams({ username: 'rchapon', password: 'incorrect' })
  }));
  assert.equal(invalid.status, 401);
  assert.match(await invalid.text(), /Identifiant ou mot de passe incorrect/);
  assert.equal(invalid.headers.get('set-cookie'), null);

  const loggedIn = await middleware(new Request(base + 'login', {
    method: 'POST',
    body: new URLSearchParams({ username: 'rchapon', password })
  }));
  assert.equal(loggedIn.status, 303);
  assert.equal(loggedIn.headers.get('location'), base);
  assert.match(loggedIn.headers.get('set-cookie'), /HttpOnly; Secure; SameSite=Lax/);
  const cookie = loggedIn.headers.get('set-cookie').split(';')[0];

  const allowed = await middleware(new Request(base, { headers: { cookie } }));
  assert.equal(allowed.status, 200);
  assert.equal(await allowed.text(), 'KOMO_NEXT_OK');

  const allowedAsset = await middleware(new Request(base + 'app.js', { headers: { cookie } }));
  assert.equal(allowedAsset.status, 200);

  const tampered = await middleware(new Request(base, { headers: { cookie: cookie + 'tampered' } }));
  assert.equal(tampered.status, 200);
  assert.match(await tampered.text(), /Accéder au pilotage/);

  const logout = await middleware(new Request(base + 'logout', { headers: { cookie } }));
  assert.equal(logout.status, 303);
  assert.match(logout.headers.get('set-cookie'), /Max-Age=0/);

  console.log('[pilotage-auth-qa] PASS · anonymous login · denial · sign-in · session · logout');
} finally {
  if (prior === undefined) delete process.env.KOMO_PILOTAGE_PASSWORD_HASH;
  else process.env.KOMO_PILOTAGE_PASSWORD_HASH = prior;
}
