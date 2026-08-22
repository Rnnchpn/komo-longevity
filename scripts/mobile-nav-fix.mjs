import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('../site/', import.meta.url).pathname;
const marker = 'id="komo-mobile-nav-scroll-fix"';
const style = `<style id="komo-mobile-nav-scroll-fix">
@media (max-width:1040px){
  .primary-nav{
    overflow-y:auto!important;
    overflow-x:hidden!important;
    overscroll-behavior:contain!important;
    -webkit-overflow-scrolling:touch!important;
    height:calc(100dvh - 67px)!important;
    max-height:calc(100dvh - 67px)!important;
    padding:1rem 1.15rem calc(7rem + env(safe-area-inset-bottom))!important;
    align-content:start!important;
    touch-action:pan-y!important;
  }
  .primary-nav.is-open{display:grid!important;visibility:visible!important;}
  .primary-nav a{flex:0 0 auto!important;min-height:54px!important;}
  .primary-nav a:last-child{margin-bottom:1.5rem!important;}
  body.menu-open .mobile-cta{opacity:0!important;pointer-events:none!important;}
  body.menu-open{overflow:hidden!important;position:relative!important;}
}
</style>`;

async function walk(dir){
  const entries = await readdir(dir,{withFileTypes:true});
  for(const entry of entries){
    const path = join(dir,entry.name);
    if(entry.isDirectory()) await walk(path);
    else if(entry.isFile() && entry.name.endsWith('.html')){
      let html = await readFile(path,'utf8');
      if(html.includes(marker) || !html.includes('</head>')) continue;
      html = html.replace('</head>', `${style}\n</head>`);
      await writeFile(path,html,'utf8');
    }
  }
}

await walk(root);
console.log('Applied KŌMØ mobile navigation scroll fix.');
