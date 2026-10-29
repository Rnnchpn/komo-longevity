import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import assert from 'node:assert/strict';

const root=join(process.cwd(),'site');
const css=await readFile(join(root,'assets/komo-premium-proportions-v3.css'),'utf8');
for(const selector of [
 '.ko-premium-v2 .komo-hero-20260930.kc-hero.kpv-hero.khe-hero',
 '.ko-premium-v2 .komo-hero-20260930 .kc-hero-copy .kt-title',
 '.ko-premium-v2 .komo-hero-20260930 .kpv-hero-grid',
 '.ko-premium-v2 .ko-card h3',
 '@media(max-width:760px)',
 '@media(max-width:480px)',
 '@media(prefers-reduced-motion:reduce)'
]) assert(css.includes(selector), 'Missing size correction: '+selector);
assert(css.includes('min-height:clamp(515px,48vw,626px)!important'),'hero size override');
assert(css.includes('font-size:clamp(41px,3.85vw,55px)!important'),'hero typography override');
assert(!/@import\b/.test(css),'third-party fonts/stylesheets not needed');
for(const [route,price49,price200] of [
 ['index.html','49 €','200 €'],
 ['fr/index.html','49 €','200 €'],
 ['en/index.html','€49','€200'],
 ['es/index.html','49 €','200 €']
]){
 const html=await readFile(join(root,route),'utf8');
 assert.equal((html.match(/data-ko-proportions-v3/g)||[]).length,1,'v3 once '+route);
 assert(html.indexOf('data-ko-proportions-v3')>html.indexOf('data-komo-premium-storefront-v2'),'v3 loaded after v2 '+route);
 for(const marker of ['appointmentType=99940918','id="solutions"','https://pulse.komolongevity.com/online/',price49,price200,'komo-hero-hd-v4.webp']){
  assert(html.includes(marker),'commercial content changed '+route+': '+marker);
 }
 console.log('[proportions-v3-qa] PASS '+route);
}
