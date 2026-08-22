import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const pages = [
  ['en','site/check/index.html','https://komolongevity.com/check/'],
  ['fr','site/fr/check/index.html','https://komolongevity.com/fr/check/'],
  ['es','site/es/check/index.html','https://komolongevity.com/es/check/']
];
const errors=[];
const text=(html,re)=>html.match(re)?.[1]?.replace(/<[^>]+>/g,'').trim()||'';
for(const [locale,path,canonical] of pages){
  let html='';
  try{ html=await readFile(join(root,path),'utf8'); }catch{ errors.push(`${locale}: missing ${path}`); continue; }
  const title=text(html,/<title>([\s\S]*?)<\/title>/i);
  const desc=html.match(/<meta name="description" content="([^"]+)"/i)?.[1]||'';
  const h1=(html.match(/<h1\b/gi)||[]).length;
  if(title.length<30||title.length>65) errors.push(`${locale}: title length ${title.length} outside 30–65`);
  if(desc.length<110||desc.length>170) errors.push(`${locale}: meta description length ${desc.length} outside 110–170`);
  if(h1!==1) errors.push(`${locale}: expected exactly 1 H1, found ${h1}`);
  if(!html.includes(`<link rel="canonical" href="${canonical}">`)) errors.push(`${locale}: canonical mismatch`);
  for(const hreflang of ['en','fr','es','x-default']) if(!html.includes(`hreflang="${hreflang}"`)) errors.push(`${locale}: missing hreflang ${hreflang}`);
  if(!html.includes('name="robots" content="index,follow')) errors.push(`${locale}: missing index/follow robots`);
  if(!html.includes('"@type":"FAQPage"')) errors.push(`${locale}: missing FAQPage JSON-LD`);
  if(!html.includes('"@type":"WebPage"')) errors.push(`${locale}: missing WebPage JSON-LD`);
  if(!html.includes('KŌMØ Library')) errors.push(`${locale}: missing Library internal link`);
  if(!/Science|Ciencia/.test(html)) errors.push(`${locale}: missing Science internal link`);
  if(!html.includes('pubmed.ncbi.nlm.nih.gov/22222445')) errors.push(`${locale}: missing GLFS-25 bibliographic reference`);
  if(!html.includes('locomo-joa.jp/en')) errors.push(`${locale}: missing official JOA reference`);
  if(!/does not diagnose|ne diagnostique|No diagnostica/i.test(html)) errors.push(`${locale}: missing explicit non-diagnostic boundary`);
}
if(errors.length){ console.error('[check-seo-qa] failed\n- '+errors.join('\n- ')); process.exit(1); }
console.log('[check-seo-qa] 3 localized Check pages passed SEO, scientific-source and medical-boundary checks');
