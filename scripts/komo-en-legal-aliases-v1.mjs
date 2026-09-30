import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const site=join(process.cwd(),'site');
const origin='https://komolongevity.com';
const slugs=['legal','privacy','cookies','terms','medical-information','intellectual-property','cgv'];

function rewrite(html,slug){
  html=html.replace(/<link rel="canonical" href="[^"]+">/, `<link rel="canonical" href="${origin}/en/${slug}/">`);
  html=html.replace(/<meta property="og:url" content="[^"]+">/, `<meta property="og:url" content="${origin}/en/${slug}/">`);
  for(const target of slugs){
    html=html.replaceAll(`href="/${target}/"`,`href="/en/${target}/"`);
    html=html.replaceAll(`${origin}/${target}/`,`${origin}/en/${target}/`);
  }
  html=html.replaceAll('href="/"','href="/en/"');
  return html;
}

for(const slug of slugs){
  const src=join(site,slug,'index.html');
  const dst=join(site,'en',slug,'index.html');
  const html=await readFile(src,'utf8');
  await mkdir(dirname(dst),{recursive:true});
  await writeFile(dst,rewrite(html,slug),'utf8');
}

console.log('[komo-en-legal-aliases-v1] PASS · English legal routes available under /en/.');
