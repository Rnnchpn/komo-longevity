import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { join, basename } from 'node:path';

const root=process.cwd();
const pulse=join(root,'site','pulse-v12');
const htmlPath=join(pulse,'index.html');
let html=await readFile(htmlPath,'utf8');
const cache=new Map();

async function fingerprint(file){
  if(cache.has(file))return cache.get(file);
  const body=await readFile(join(pulse,file));
  const hash=createHash('sha256').update(body).digest('hex').slice(0,16);
  cache.set(file,hash);
  return hash;
}

// Fingerprint every local JS/CSS URL appearing in script/link tags or in the lazy-route manifest.
// Vercel may mark query-versioned static assets immutable; content hashes guarantee the URL changes
// whenever the generated asset changes, so a previously open browser cannot keep an older UI bundle.
const re=/\.\/([A-Za-z0-9._-]+\.(?:js|css))(?:\?v=[^"'<>\\\s]+)?/g;
const matches=[...html.matchAll(re)];
const files=[...new Set(matches.map(m=>m[1]))];
for(const file of files){
  const hash=await fingerprint(file);
  const escaped=file.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  html=html.replace(new RegExp(`\\./${escaped}(?:\\?v=[^"'<>\\\\s]+)?`,'g'),`./${file}?v=${hash}`);
}

html=html.replace(/<meta name="komo-pulse-assets"[^>]*>/g,'');
html=html.replace('</head>',`  <meta name="komo-pulse-assets" content="content-fingerprinted-v1" />\n</head>`);
await writeFile(htmlPath,html,'utf8');
console.log(`[pulse-asset-fingerprint] ${files.length} JS/CSS assets content-fingerprinted · ${basename(htmlPath)}`);
