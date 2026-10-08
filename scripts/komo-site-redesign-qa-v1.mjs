import {readFile,access} from 'node:fs/promises';
import {join} from 'node:path';
const root=join(process.cwd(),'site');
const routeParts={fr:['index.html','fr/motion/index.html','fr/phenotype/index.html','fr/experience/index.html','fr/partenaires/index.html','fr/approche/index.html','fr/contact/index.html'],en:['en/index.html','en/motion/index.html','en/phenotype/index.html','en/experience/index.html','en/partners/index.html','en/approach/index.html','en/contact/index.html'],es:['es/index.html','es/motion/index.html','es/fenotipo/index.html','es/experiencia/index.html','es/profesionales/index.html','es/metodo/index.html','es/contacto/index.html']};
let checks=0;
for(const [lang,pages] of Object.entries(routeParts)){
  for(const file of pages){
    const html=await readFile(join(root,file),'utf8');
    const assert=(value,message)=>{if(!value)throw new Error(file+': '+message);checks++};
    assert(html.includes('<html lang="'+lang+'">'),'incorrect language');
    assert(/<title>[^<]+<\/title>/.test(html),'missing title');
    assert(/<h1 class="serif">/.test(html),'missing page hero');
    assert(html.includes('rel="canonical"'),'missing canonical');
    assert(html.includes('hreflang="fr"')&&html.includes('hreflang="en"')&&html.includes('hreflang="es"'),'missing language alternates');
    assert(html.includes('href="'+(lang==='en'?'/privacy/':'/'+lang+'/privacy/')+'"'),'missing privacy');
    assert(html.includes('href="'+(lang==='en'?'/legal/':'/'+lang+'/legal/')+'"'),'missing legal');
    assert(html.includes('https://pulse.komolongevity.com/'),'missing Pulse');
    assert(!/myodev|myocare|free test|test gratuit/i.test(html),'retired product phrasing');
    if(file.endsWith('/contact/index.html')){
      assert(html.includes('action dark" type="submit"'),'missing form button');
      assert(html.includes('/api/assessment-enquiry'),'missing lead endpoint');
      assert(html.includes('name="consent" required'),'consent missing');
    }
  }
}
const assets=['komo-hero-hd-v4.webp','komo-motion-hd-v4.webp','komo-clinical-hd-v4.webp','komo-experience-hd-v4.webp'];
for(const file of assets){await access(join(root,'assets','images',file));checks++}
for(const file of ['pulse-v13/index.html','world/index.html','life-v1/index.html']) {await access(join(root,file));checks++}
const xml=await readFile(join(root,'sitemap.xml'),'utf8');
for(const key of ['fr/motion/','fr/phenotype/','fr/experience/','fr/partenaires/','en/phenotype/','es/fenotipo/']) {if(!xml.includes('https://komolongevity.com/'+key)) throw Error('Sitemap missing '+key);checks++}
console.log('[komo-site-redesign-qa] PASS · '+checks+' assertions · 21 localized pages + canonical + legal + media + app isolation');
