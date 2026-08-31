import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=dirname(dirname(fileURLToPath(import.meta.url))), site=join(root,'site');

async function walk(dir,out=[]){for(const e of await readdir(dir,{withFileTypes:true})){const p=join(dir,e.name);if(e.isDirectory())await walk(p,out);else if(e.name.endsWith('.html'))out.push(p)}return out}
const replacements=[
  [/https:\/\/komolongevity\.com\/fr\/confidentialite\//g,'https://komolongevity.com/fr/privacy/'],
  [/https:\/\/komolongevity\.com\/fr\/mentions-legales\//g,'https://komolongevity.com/fr/legal/'],
  [/https:\/\/komolongevity\.com\/fr\/cgv\//g,'https://komolongevity.com/fr/terms/'],
  [/href="\/fr\/confidentialite\/"/g,'href="/fr/privacy/"'],[/href="\/fr\/mentions-legales\/"/g,'href="/fr/legal/"'],[/href="\/fr\/cgv\/"/g,'href="/fr/terms/"'],[/href="\/fr\/method\/"/g,'href="/fr/methode/"'],
  [/href="\/confidentialite\/?"/g,'href="/privacy/"'],[/href="\/mentions-legales\/?"/g,'href="/legal/"'],[/href="\/legal\/conditions-generales-utilisation\/?"/g,'href="/terms/"']
];
let patched=0;
for(const p of await walk(site)){let h=await readFile(p,'utf8'),b=h;h=h.replace(/<script[^>]+src=["']\/_vercel\/insights\/script\.js["'][^>]*><\/script>/g,'').replace(/<script id=["']komo-public-analytics["']>[\s\S]*?<\/script>/g,'');for(const [r,v] of replacements)h=h.replace(r,v);if(h!==b){await writeFile(p,h);patched++}}

const partner={
  en:['partners/index.html','Ready to deploy KŌMØ?','Use the guided professional onboarding so we can qualify your organisation, volume and deployment model before a demonstration or proposal.','/contact/?intent=partner','Start my KŌMØ project →'],
  fr:['fr/partners/index.html','Prêt à déployer KŌMØ ?','Utilisez l’onboarding professionnel guidé : nous qualifierons votre structure, le volume envisagé et le bon modèle avant une démonstration ou une proposition.','/fr/contact/?intent=partner','Démarrer mon projet KŌMØ →'],
  es:['es/partners/index.html','¿Listo para desplegar KŌMØ?','Utiliza el onboarding profesional guiado para que podamos cualificar tu organización, volumen y modelo antes de una demostración o propuesta.','/es/contact/?intent=partner','Empezar mi proyecto KŌMØ →']
};
for(const [lang,[rel,title,lead,href,cta]] of Object.entries(partner)){const p=join(site,rel);let h=await readFile(p,'utf8');const section=`<section class="formsec" id="info"><div class="sh" style="display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:end"><div><p class="k">KŌMØ PRO · NEXT STEP</p><h2 class="h2">${title}</h2></div><div><p class="formintro">${lead}</p><p style="margin:24px 0 0"><a href="${href}" style="display:inline-flex;min-height:50px;align-items:center;padding:0 20px;border-radius:10px;background:#ded0b9;color:#090a0a;text-decoration:none;font-size:10px;font-weight:850;text-transform:uppercase">${cta}</a></p><p class="note" style="margin-top:16px">contact@komolongevity.com</p></div></div></section>`;h=h.replace(/<section class="formsec" id="info">[\s\S]*?<\/section>/,section).replace(/<script>[\s\S]*?proForm[\s\S]*?<\/script>/g,'');await writeFile(p,h)}

const contact={
  en:['contact/index.html','KŌMØ for Professionals — Partner enquiry','Tell KŌMØ about your clinic, longevity centre, fitness club, hotel, corporate or multi-site project.'],
  fr:['fr/contact/index.html','KŌMØ Professionnels — Demande de partenariat','Présentez votre projet KŌMØ : médecin, clinique, centre de longévité, fitness premium, hôtel, entreprise ou réseau multi-sites.'],
  es:['es/contact/index.html','KŌMØ Profesionales — Solicitud de colaboración','Cuéntanos tu proyecto KŌMØ: clínica, centro de longevidad, fitness premium, hotel, empresa o red multi-sede.']
};
for(const [lang,[rel,title,desc]] of Object.entries(contact)){const p=join(site,rel);let h=await readFile(p,'utf8');h=h.replace(/<meta property="og:title" content="[^"]*">/,`<meta property="og:title" content="${title}">`).replace(/<meta property="og:description" content="[^"]*">/,`<meta property="og:description" content="${desc}">`);await writeFile(p,h)}

await writeFile(join(site,'robots.txt'),'User-agent: *\nAllow: /\nSitemap: https://komolongevity.com/sitemap.xml\n');await mkdir(join(site,'pulse-v12'),{recursive:true});await writeFile(join(site,'pulse-v12','robots.txt'),'User-agent: *\nDisallow: /\n');
async function alias(rel,target,lang='fr'){const d=join(site,...rel.split('/').filter(Boolean));await mkdir(d,{recursive:true});await writeFile(join(d,'index.html'),`<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="robots" content="noindex,follow"><meta http-equiv="refresh" content="0;url=${target}"><link rel="canonical" href="https://komolongevity.com${target}"><title>KŌMØ</title></head><body><a href="${target}">Continue →</a><script>location.replace(${JSON.stringify(target)});</script></body></html>`)}
await alias('fr/confidentialite','/fr/privacy/');await alias('fr/mentions-legales','/fr/legal/');await alias('fr/cgv','/fr/terms/');await alias('fr/method','/fr/methode/');await alias('confidentialite','/privacy/','en');await alias('mentions-legales','/legal/','en');await alias('cgv','/terms/','en');await alias('legal/conditions-generales-utilisation','/terms/');await alias('media','/media','en');

const sm=join(site,'sitemap.xml');let s=await readFile(sm,'utf8');for(const [u,p] of [['https://komolongevity.com/','1.0'],['https://komolongevity.com/fr/','1.0'],['https://komolongevity.com/es/','1.0'],['https://komolongevity.com/contact/','0.7'],['https://komolongevity.com/es/contact/','0.7'],['https://komolongevity.com/locomotor/','0.8'],['https://komolongevity.com/es/locomotor/','0.8']])if(!s.includes(`<loc>${u}</loc>`))s=s.replace('</urlset>',`  <url><loc>${u}</loc><priority>${p}</priority></url>\n</urlset>`);await writeFile(sm,s);
console.log(`[public-site-final-hardening] ${patched} HTML files normalized; legacy partner form removed; robots, aliases and sitemap repaired.`);
