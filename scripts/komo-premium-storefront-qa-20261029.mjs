import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const site=join(process.cwd(),'site');
const css=await readFile(join(site,'assets/komo-premium-storefront-v2.css'),'utf8');
const js=await readFile(join(site,'assets/komo-premium-storefront-v2.js'),'utf8');
assert(css.includes('prefers-reduced-motion:reduce'),'reduced-motion styling required');
assert(css.includes('@media(max-width:500px)'),'mobile styling required');
assert(js.includes('IntersectionObserver'),'scroll observer required');
assert(!/fetch\s*\(|sendBeacon\s*\(|localStorage|sessionStorage/.test(js),'visual runtime must not send/store customer data');
for (const [file,price39,price200] of [
  ['index.html','39 €','200 €'],
  ['fr/index.html','39 €','200 €'],
  ['en/index.html','€39','€200'],
  ['es/index.html','39 €','200 €']
]) {
 const html=await readFile(join(site,file),'utf8');
 assert(html.includes('ko-premium-v2'),'premium class '+file);
 assert(html.includes('ko-premium-header'),'header class '+file);
 assert(html.includes('ko-premium-footer'),'footer class '+file);
 assert.equal((html.match(/data-komo-premium-storefront-v2/g)||[]).length,1,'stylesheet one per route '+file);
 assert.equal((html.match(/komo-premium-storefront-v2\.js/g)||[]).length,1,'script one per route '+file);
 assert(html.includes('https://buy.stripe.com/fZucN6bUTeTCd4B4EX0VO00'),'Stripe checkout link '+file);
 assert(html.includes('owner=40696577'),'Acuity owner unchanged '+file);
 assert(html.includes(price39)&&html.includes(price200),'updated offers intact '+file);
 assert(html.includes('https://pulse.komolongevity.com/online/'),'Pulse preparation intact '+file);
 assert(html.includes('/assets/images/komo-hero-hd-v4.webp'),'existing hero image retained '+file);
 assert(html.includes('id="solutions"'),'offers anchor present '+file);
 console.log('[premium-storefront-qa] PASS '+file);
}
