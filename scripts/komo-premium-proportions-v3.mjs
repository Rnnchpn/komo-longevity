import {readFile,writeFile,access} from 'node:fs/promises';
import {join} from 'node:path';

const root=process.cwd();
const cssName='komo-premium-proportions-v3.css';
const href='/assets/'+cssName+'?v=20261029-3';
await access(join(root,'site','assets',cssName));
for(const file of ['index.html','fr/index.html','en/index.html','es/index.html']){
 const fp=join(root,'site',file);
 let html=await readFile(fp,'utf8');
 if(html.includes('data-ko-proportions-v3')) continue;
 if(!html.includes('class="kt-home ko-premium-v2"'))throw Error('Expected premium storefront markup absent: '+file);
 if(!html.includes('class="kc-hero kpv-hero khe-hero komo-hero-20260930"'))throw Error('Approved home hero missing: '+file);
 if(!html.includes('data-komo-premium-storefront-v2'))throw Error('Premium v2 layer missing: '+file);
 html=html.replace('</head>','<link rel="stylesheet" data-ko-proportions-v3 href="'+href+'">\n</head>');
 await writeFile(fp,html,'utf8');
 console.log('[proportions-v3] PASS '+file);
}
