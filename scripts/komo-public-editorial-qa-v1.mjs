import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const site=join(process.cwd(),'site');
const locales={
  fr:{home:'fr/index.html',motion:'fr/motion/index.html',clinical:'fr/clinical/index.html',signature:'fr/signature/index.html',experience:'fr/experience/index.html',about:'fr/a-propos/index.html',science:'fr/science/index.html',partners:'fr/partners/index.html',book:'/fr/contact/?intent=experience',login:'Se connecter',route:'/fr/',method:'Mesurer.',optional:'OPTIONNEL',worldBoundary:'3D n’est jamais obligatoire',paths:{motion:'/fr/motion/',clinical:'/fr/clinical/',signature:'/fr/signature/',experience:'/fr/experience/',about:'/fr/a-propos/',science:'/fr/science/',partners:'/fr/partners/'}},
  en:{home:'index.html',motion:'motion/index.html',clinical:'clinical/index.html',signature:'signature/index.html',experience:'experience/index.html',about:'about/index.html',science:'science/index.html',partners:'partners/index.html',book:'/contact/?intent=experience',login:'Sign in',route:'/',method:'Measure.',optional:'OPTIONAL',worldBoundary:'3D is never required',paths:{motion:'/motion/',clinical:'/clinical/',signature:'/signature/',experience:'/experience/',about:'/about/',science:'/science/',partners:'/partners/'}},
  es:{home:'es/index.html',motion:'es/motion/index.html',clinical:'es/clinical/index.html',signature:'es/signature/index.html',experience:'es/experience/index.html',about:'es/sobre/index.html',science:'es/science/index.html',partners:'es/partners/index.html',book:'/es/contact/?intent=experience',login:'Acceder',route:'/es/',method:'Medir.',optional:'OPCIONAL',worldBoundary:'3D nunca es obligatoria',paths:{motion:'/es/motion/',clinical:'/es/clinical/',signature:'/es/signature/',experience:'/es/experience/',about:'/es/sobre/',science:'/es/science/',partners:'/es/partners/'} }
};
const failures=[];
async function page(relative){
  const path=join(site,relative);
  try{await access(path);return await readFile(path,'utf8');}
  catch{failures.push(`missing route source: ${relative}`);return '';}
}
for(const [locale,routes] of Object.entries(locales)){
  const home=await page(routes.home);
  const requiredHome=['KŌMØ Motion','KŌMØ Clinical','KŌMØ Signature','KŌMØ Anywhere',routes.method,'KŌMØ PULSE','KŌMØ WORLD',routes.optional];
  for(const text of requiredHome) if(!home.includes(text)) failures.push(`${locale} home is missing ${text}`);
  if(!home.includes(`href="${routes.book}"`)) failures.push(`${locale} booking CTA is missing or misrouted`);
  if(!home.includes(`>${routes.login}</a>`)) failures.push(`${locale} Pulse sign-in link is missing`);
  if(!home.includes('https://pulse.komolongevity.com/')) failures.push(`${locale} home does not link to the existing Pulse host`);
  if(/test gratuit|free test|test gratuito/i.test(home)) failures.push(`${locale} home still foregrounds a free test`);
  if(!home.includes(routes.worldBoundary)) failures.push(`${locale} World is missing its optional 3D-accessibility statement`);
  if(!home.includes(`href="https://komolongevity.com${routes.route}"`)) failures.push(`${locale} home canonical is incorrect`);
  for(const type of ['motion','clinical','signature','experience','about','science','partners']){
    const html=await page(routes[type]);
    if(!html.includes('rel="canonical"')) failures.push(`${locale} ${type} has no canonical URL`);
    if(!html.includes(`href="https://komolongevity.com${routes.paths[type]}"`)) failures.push(`${locale} ${type} canonical is incorrect`);
  }
  const clinical=await page(routes.clinical);
  if(!/médecin|physician|médico/i.test(clinical)) failures.push(`${locale} Clinical page does not establish medical responsibility`);
  const experience=await page(routes.experience);
  if(locale==='fr'&&!experience.includes('AU TRAVAIL')) failures.push('French Anywhere page is missing the work setting');
}
const sitemap=await readFile(join(site,'sitemap.xml'),'utf8').catch(()=> '');
for(const path of ['/signature/','/fr/signature/','/es/signature/','/about/','/fr/a-propos/','/es/sobre/'])
  if(!sitemap.includes(`https://komolongevity.com${path}`)) failures.push(`sitemap is missing ${path}`);
for(const relative of ['assets/images/hero-mediterranean-motion-v1.webp','assets/images/clinical-pathway-v1.webp','assets/images/real-case/komo-six-myodev-sensors.jpeg','assets/images/real-case/komo-motion-tablet.jpeg'])
  await access(join(site,relative)).catch(()=>failures.push(`missing image asset: ${relative}`));

if(failures.length){console.error('[komo-public-editorial-qa] FAIL\n- '+failures.join('\n- '));process.exit(1);}
console.log('[komo-public-editorial-qa] PASS · localized offers, booking and Pulse routes, medical separation, optional World, public pages, sitemap and image assets verified.');
