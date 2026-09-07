import fs from 'node:fs';
import path from 'node:path';

const pulse=path.join(process.cwd(),'site','pulse-v12');
const indexPath=path.join(pulse,'index.html');
const myKomoPath=path.join(pulse,'my-komo-stable-v5.js');
for(const f of [indexPath,myKomoPath])if(!fs.existsSync(f))throw new Error('[world-entry-hotfix] missing '+f);

let html=fs.readFileSync(indexPath,'utf8');
let mykomo=fs.readFileSync(myKomoPath,'utf8');

// Keep My KŌMØ as the single route owner; this only strengthens its existing World destination.
mykomo=mykomo.replace("const V='6.0.0-social-profile'","const V='6.1.0-world-access'");

if(!mykomo.includes('data-mkv5-world-hero')){
  mykomo=mykomo.replace(
    '<div class="mks-actions"><button class="mks-btn" type="button" data-mkv5-route="club">Entrer dans le Club →</button><button class="mks-btn alt" type="button" data-mkv5-route="profile">Réglages du profil</button></div>',
    '<div class="mks-actions"><button class="mks-btn" type="button" data-mkv5-world data-mkv5-world-hero>Entrer dans KŌMØ World →</button><button class="mks-btn alt" type="button" data-mkv5-route="club">Entrer dans le Club</button><button class="mks-btn alt" type="button" data-mkv5-route="profile">Réglages du profil</button></div>'
  );
}

if(!mykomo.includes('data-mkv5-world-quick')){
  mykomo=mykomo.replace(
    '<div class="mks-control-actions"><button class="mks-mini-btn primary" type="button" data-mkv5-route="club">KŌMØ Club</button>',
    '<div class="mks-control-actions"><button class="mks-mini-btn primary" type="button" data-mkv5-world data-mkv5-world-quick>KŌMØ World</button><button class="mks-mini-btn" type="button" data-mkv5-route="club">KŌMØ Club</button>'
  );
}

mykomo=mykomo.replace(
  "document.querySelector('[data-mkv5-world]')?.addEventListener('click',()=>{location.href='https://komolongevity.com/world/'})",
  "document.querySelectorAll('[data-mkv5-world]').forEach(b=>b.addEventListener('click',()=>{location.href='https://komolongevity.com/world/'}))"
);

// The production HTML gets a direct World entry too. appShell is auth-gated already,
// so this does not create a second route owner or expose patient data.
if(!html.includes('id="komoWorldTopEntry"')){
  html=html.replace(
    '<div class="topbar-actions">',
    '<div class="topbar-actions"><a id="komoWorldTopEntry" href="https://komolongevity.com/world/" aria-label="Entrer dans KŌMØ World">World ↗</a>'
  );
  html=html.replace(
    '</head>',
    `<style id="kpWorldEntryHotfixV1">#komoWorldTopEntry{display:inline-flex;align-items:center;justify-content:center;min-height:42px;padding:0 14px;border:1px solid rgba(143,179,154,.22);border-radius:13px;background:#17271c;color:#edf2ee;text-decoration:none;font:700 9px 'DM Sans',sans-serif;letter-spacing:.03em;white-space:nowrap}#komoWorldTopEntry:hover{border-color:rgba(143,179,154,.42);background:#1d3022}@media(max-width:680px){#komoWorldTopEntry{min-height:38px;padding:0 10px;font-size:8px}}</style>\n</head>`
  );
}

// Force a new browser request for the canonical My KŌMØ owner after this release.
html=html.replace(/\.\/my-komo-stable-v5\.js\?v=[^\"']+/g,'./my-komo-stable-v5.js?v=20260907-world-access-v1');

fs.writeFileSync(myKomoPath,mykomo);
fs.writeFileSync(indexPath,html);

const checks=[
  ['World hero CTA',mykomo.includes('data-mkv5-world-hero')],
  ['World card',mykomo.includes('mks-world')&&mykomo.includes('Entrer dans World →')],
  ['World quick access',mykomo.includes('data-mkv5-world-quick')],
  ['all World CTAs bound',mykomo.includes("querySelectorAll('[data-mkv5-world]')")],
  ['topbar World entry',html.includes('id="komoWorldTopEntry"')],
  ['explicit My KŌMØ cache bust',html.includes('my-komo-stable-v5.js?v=20260907-world-access-v1')]
];
for(const [label,ok] of checks)if(!ok)throw new Error('[world-entry-hotfix] failed: '+label);
console.log('[world-entry-hotfix] PASS · World visible in header + My KŌMØ hero + World card + quick access');
