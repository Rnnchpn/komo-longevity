import {readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';

const pulse=join(process.cwd(),'site','pulse-v12');
const htmlPath=join(pulse,'index.html');
const cssPath=join(pulse,'pulse-ui-v1.css');
const release='20260827-canonical-1';

let html=await readFile(htmlPath,'utf8');
let css=await readFile(cssPath,'utf8');

// Canonical runtime ownership:
// - desktop shell: core sidebar/topbar + bottom-dock/frozen-navigation CSS
// - phone/iPad shell: adaptive-shell-v4 only
// - mobile-guided-v2: content guidance only, never navigation
// These legacy shell runtimes are intentionally not shipped in production.
for(const file of ['mobile-menu-v3.js','tablet-patient-v1.js']){
  const escaped=file.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  html=html.replace(new RegExp(`\\s*<script(?: type="module")? src="\\./${escaped}(?:\\?v=[^\"']+)?"><\\/script>`,'g'),'');
}

function stripBundledFile(source,file){
  const marker=`/* FILE: ${file} */`;
  const start=source.indexOf(marker);
  if(start<0)return source;
  const next=source.indexOf('/* FILE:',start+marker.length);
  const end=next>=0?next:source.indexOf('/* Navigation responsiveness */',start+marker.length);
  return source.slice(0,start)+source.slice(end>=0?end:source.length);
}
for(const file of ['mobile-menu-v3.css','tablet-patient-v1.css'])css=stripBundledFile(css,file);

if(!css.includes('/* Canonical Pulse shell ownership */')){
  css+='\n/* Canonical Pulse shell ownership */\n/* Desktop: core + bottom dock. Phone/iPad: adaptive-shell-v4. Legacy mobile-menu/tablet layers retired. */\n';
}
await writeFile(cssPath,css);

// Force one coherent release across every local JS/CSS asset so mobile and desktop
// cannot keep a mixed cached generation after a deployment.
html=html.replace(/(src|href)="\.\/([^"?#]+\.(?:js|css))(?:\?v=[^"#]+)?"/g,(_,attr,file)=>`${attr}="./${file}?v=${release}"`);
html=html.replace(/\s*<meta name="komo-pulse-release"[^>]*>/g,'');
html=html.replace('</head>',`  <meta name="komo-pulse-release" content="${release}" />\n</head>`);
await writeFile(htmlPath,html);

console.log(`[pulse-production-consolidation] canonical shell locked · release ${release}`);
