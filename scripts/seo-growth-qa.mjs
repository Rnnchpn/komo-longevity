import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=dirname(dirname(fileURLToPath(import.meta.url)));const site=join(root,'site');
const key=['fr/index.html','fr/case/index.html','fr/motion/index.html','fr/clinical/index.html','fr/partners/index.html','fr/network/index.html','fr/pulse/index.html','fr/science/index.html'];
const titles=new Map();
for(const rel of key){
  const h=await readFile(join(site,rel),'utf8');
  const title=(h.match(/<title>([\s\S]*?)<\/title>/i)||[])[1]?.trim();
  const desc=(h.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)||[])[1]?.trim();
  const canonical=(h.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)||[])[1];
  if(!title || title.length<20 || title.length>75) throw new Error(`[seo-growth-qa] bad title ${rel}: ${title}`);
  if(!desc || desc.length<70 || desc.length>190) throw new Error(`[seo-growth-qa] bad description ${rel}: ${desc}`);
  if(!canonical?.startsWith('https://komolongevity.com/')) throw new Error(`[seo-growth-qa] missing canonical ${rel}`);
  if(!h.includes('data-seo-growth="organization"')) throw new Error(`[seo-growth-qa] organization schema missing ${rel}`);
  if(rel!=='fr/index.html' && !h.includes('seo-discovery')) throw new Error(`[seo-growth-qa] internal discovery missing ${rel}`);
  if(titles.has(title)) throw new Error(`[seo-growth-qa] duplicate title ${title} in ${rel} and ${titles.get(title)}`);
  titles.set(title,rel);
}
const sitemap=await readFile(join(site,'sitemap.xml'),'utf8');
for(const required of ['/fr/case/','/fr/motion/','/fr/clinical/','/fr/partners/','/fr/network/','/fr/pulse/','/fr/science/','/media']) if(!sitemap.includes(`https://komolongevity.com${required}`)) throw new Error(`[seo-growth-qa] sitemap missing ${required}`);
for(const legacy of ['https://komolongevity.com/library/','https://komolongevity.com/fr/library/','https://komolongevity.com/es/library/']) if(sitemap.includes(legacy)) throw new Error(`[seo-growth-qa] legacy URL still in sitemap: ${legacy}`);
console.log('[seo-growth-qa] SEO architecture checks passed');
