import { readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const site=join(root,'site');
const ORIGIN='https://komolongevity.com';
const legacy=new Set(['/library/','/fr/library/','/es/library/']);

async function walk(dir,out=[]){
  for(const e of await readdir(dir,{withFileTypes:true})){
    const p=join(dir,e.name);
    if(e.isDirectory()) await walk(p,out);
    else if(e.isFile() && e.name==='index.html') out.push(p);
  }
  return out;
}

const urls=new Set();
for(const file of await walk(site)){
  let h; try{h=await readFile(file,'utf8')}catch{continue}
  const robots=(h.match(/<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i)||[])[1]||'';
  if(/noindex/i.test(robots)) continue;
  const canonical=(h.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)||[])[1];
  if(!canonical || !canonical.startsWith(ORIGIN)) continue;
  const u=new URL(canonical);
  if(legacy.has(u.pathname)) continue;
  if(u.pathname.startsWith('/assets/')) continue;
  urls.add(u.origin+u.pathname.replace(/\/index\.html$/,'')+(u.pathname==='/'?'':u.pathname.endsWith('/')?'':'')+(u.search||''));
}

const priority=(url)=>{
  const p=new URL(url).pathname;
  if(['/', '/fr/', '/es/'].includes(p)) return '1.0';
  if(/\/(check|case|motion|clinical|partners|network|pulse|science)\/?$/.test(p)) return '0.8';
  if(p.includes('/media')) return '0.7';
  return '0.5';
};

const ordered=[...urls].sort((a,b)=>{
  const pa=new URL(a).pathname,pb=new URL(b).pathname;
  const rank=x=>x.includes('/media/')?4:x.includes('/legal')||x.includes('/privacy')||x.includes('/terms')||x.includes('/cookies')?9:x.split('/').filter(Boolean).length;
  return rank(pa)-rank(pb) || pa.localeCompare(pb);
});
const xml=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${ordered.map(u=>`  <url><loc>${u.replace(/&/g,'&amp;')}</loc><priority>${priority(u)}</priority></url>`).join('\n')}\n</urlset>\n`;
await writeFile(join(site,'sitemap.xml'),xml,'utf8');
await writeFile(join(site,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${ORIGIN}/sitemap.xml\n`,'utf8');
console.log(`[seo-sitemap-v2] ${ordered.length} canonical URLs`);
