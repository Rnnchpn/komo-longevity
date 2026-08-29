import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
const pulse=join(process.cwd(),'site','pulse-v12');
const html=await readFile(join(pulse,'index.html'),'utf8');
const urls=[...html.matchAll(/\.\/([A-Za-z0-9._-]+\.(?:js|css))\?v=([a-f0-9]{16})/g)];
const localRefs=[...html.matchAll(/\.\/([A-Za-z0-9._-]+\.(?:js|css))(?:\?v=[^"'<>\\\s]+)?/g)];
const fingerprinted=new Set(urls.map(m=>m[1]));
const referenced=new Set(localRefs.map(m=>m[1]));
const critical=['patient-home-clean-v1.js','patient-home-clean-v1.css','key-view-tabs-v1.js','key-view-tabs-v1.css','mobile-canonical-v1.js','mobile-canonical-v1.css','patient-navigation-core-v1.js','key-hub-v1.js','key-data-layer-v1.js'];
const checks=[
 ['fingerprint marker shipped',html.includes('komo-pulse-assets')&&html.includes('content-fingerprinted-v1')],
 ['all local JS/CSS refs are fingerprinted',[...referenced].every(x=>fingerprinted.has(x))],
 ['critical patient assets have content hashes',critical.every(x=>fingerprinted.has(x))],
 ['legacy human release token removed from clean Home ref',!html.includes('patient-home-clean-v1.js?v=20260829-patient-clean-room-v1')],
 ['legacy human release token removed from mobile canonical ref',!html.includes('mobile-canonical-v1.js?v=20260829-mobile-canonical-2')]
];
let failed=0;for(const [label,ok] of checks){console.log(`[pulse-asset-fingerprint-qa] ${ok?'OK':'FAIL'} · ${label}`);if(!ok)failed++}
if(failed)throw new Error(`[pulse-asset-fingerprint-qa] ${failed} check(s) failed`);
console.log(`[pulse-asset-fingerprint-qa] ${checks.length} checks passed · ${fingerprinted.size} fingerprinted assets.`);
