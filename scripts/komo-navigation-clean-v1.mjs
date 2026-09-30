import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';

const site=join(process.cwd(),'site');

const css=`
<style id="komo-navigation-clean-v1-style">
.kt-simple-nav{display:flex!important;align-items:center!important;gap:28px!important}
.kt-simple-link,.kt-solutions>summary{font-size:12px!important;font-weight:600!important;letter-spacing:.01em!important;white-space:nowrap!important}
.kt-solutions{position:relative}
.kt-solutions>summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:7px;color:inherit}
.kt-solutions>summary::-webkit-details-marker{display:none}
.kt-solutions>summary:after{content:"⌄";font-size:11px;opacity:.55;transform:translateY(-1px)}
.kt-solutions[open]>summary:after{transform:rotate(180deg) translateY(1px)}
.kt-solutions-panel{position:absolute;top:calc(100% + 20px);right:-80px;width:430px;padding:22px;border:1px solid rgba(55,47,38,.13);border-radius:22px;background:#f7f2e9;box-shadow:0 26px 70px rgba(46,38,29,.14);z-index:999}
.kt-solutions-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px 20px}
.kt-solutions-link{display:block;padding:12px 0;border-bottom:1px solid rgba(55,47,38,.08);text-decoration:none;color:#171a17;font-size:13px}
.kt-solutions-link small{display:block;margin-top:4px;color:#777066;font-size:9px;line-height:1.35}
.kt-account-link{padding:10px 17px!important;border:1px solid rgba(40,42,36,.18)!important;border-radius:999px!important}
.kt-mobile-menu{background:#f7f2e9!important}
.kt-mobile-menu .kt-menu-group{margin:0 0 20px}
.kt-mobile-menu .kt-menu-group>strong{display:block;margin:0 0 8px;font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:#777066}
.kt-mobile-menu .kt-menu-link{font-size:16px!important;padding:11px 0!important}
.kt-mobile-menu .kt-mobile-account{display:block;margin-top:16px;padding:14px 18px;border-radius:999px;background:#1b211d;color:#fff;text-align:center;text-decoration:none}
.kp-mini{font-size:11px!important}
@media(max-width:1080px){.kt-simple-nav{gap:18px!important}.kt-simple-link,.kt-solutions>summary{font-size:11px!important}}
@media(max-width:980px){.kp-nav>.kt-simple-nav,.pv2-nav>.kt-simple-nav,.primary-nav>.kt-simple-nav,.nav>.kt-simple-nav{display:none!important}}
</style>`;

const locales={
 fr:{
   prefix:'/fr/',
   top:[['Motion','/fr/motion/'],['Clinical','/fr/clinical/']],
   science:['Science','/fr/science/'],
   solutionsLabel:'Solutions',
   solutions:[
     ['Signature','Programme privé coordonné','/fr/signature/'],
     ['Yachting','Évaluation et suivi à bord','/fr/yachting/'],
     ['Anywhere','Interventions sur site','/fr/experience/'],
     ['World','Modules numériques complémentaires','/fr/world/'],
     ['Professionnels','Hôtels, cliniques, clubs, yachts','/fr/partners/'],
     ['À propos','KŌMØ Longevity','/fr/a-propos/']
   ],
   login:'Se connecter',
   mobileGroups:[
     ['Solutions',[['Motion','/fr/motion/'],['Clinical','/fr/clinical/'],['Signature','/fr/signature/'],['Yachting','/fr/yachting/'],['Anywhere','/fr/experience/'],['World','/fr/world/']]],
     ['KŌMØ',[['Science','/fr/science/'],['Professionnels','/fr/partners/'],['À propos','/fr/a-propos/'],['Contact','/fr/contact/']]]
   ],
   appointment:'Prendre rendez-vous',
   appointmentHref:'/fr/contact/?intent=motion'
 },
 en:{
   prefix:'/en/',
   top:[['Motion','/motion/'],['Clinical','/clinical/']],
   science:['Science','/science/'],
   solutionsLabel:'Solutions',
   solutions:[
     ['Signature','Private coordinated programme','/signature/'],
     ['Yachting','Onboard assessment and follow-up','/en/yachting/'],
     ['Anywhere','On-site delivery','/experience/'],
     ['World','Optional digital modules','/en/world/'],
     ['Professionals','Hotels, clinics, clubs, yachts','/partners/'],
     ['About','KŌMØ Longevity','/about/']
   ],
   login:'Sign in',
   mobileGroups:[
     ['Solutions',[['Motion','/motion/'],['Clinical','/clinical/'],['Signature','/signature/'],['Yachting','/en/yachting/'],['Anywhere','/experience/'],['World','/en/world/']]],
     ['KŌMØ',[['Science','/science/'],['Professionals','/partners/'],['About','/about/'],['Contact','/contact/']]]
   ],
   appointment:'Book an assessment',
   appointmentHref:'/contact/?intent=motion'
 },
 es:{
   prefix:'/es/',
   top:[['Motion','/es/motion/'],['Clinical','/es/clinical/']],
   science:['Ciencia','/es/science/'],
   solutionsLabel:'Soluciones',
   solutions:[
     ['Signature','Programa privado coordinado','/es/signature/'],
     ['Yachting','Evaluación y seguimiento a bordo','/es/yachting/'],
     ['Anywhere','Intervenciones in situ','/es/experience/'],
     ['World','Módulos digitales opcionales','/es/world/'],
     ['Profesionales','Hoteles, clínicas, clubs, yachts','/es/partners/'],
     ['Sobre KŌMØ','KŌMØ Longevity','/es/sobre/']
   ],
   login:'Acceder',
   mobileGroups:[
     ['Soluciones',[['Motion','/es/motion/'],['Clinical','/es/clinical/'],['Signature','/es/signature/'],['Yachting','/es/yachting/'],['Anywhere','/es/experience/'],['World','/es/world/']]],
     ['KŌMØ',[['Ciencia','/es/science/'],['Profesionales','/es/partners/'],['Sobre KŌMØ','/es/sobre/'],['Contacto','/es/contact/']]]
   ],
   appointment:'Reservar evaluación',
   appointmentHref:'/es/contact/?intent=motion'
 }
};

function localeFor(rel){
  if(rel.startsWith('es/')) return locales.es;
  if(rel.startsWith('en/')) return locales.en;
  // Root English legacy pages must stay English.
  if(['motion/index.html','clinical/index.html','signature/index.html','experience/index.html','partners/index.html','science/index.html','about/index.html','contact/index.html'].includes(rel)) return locales.en;
  return locales.fr;
}
function solutionsPanel(l){
  return `<div class="kt-solutions-panel"><div class="kt-solutions-grid">${l.solutions.map(([t,s,h])=>`<a class="kt-solutions-link" href="${h}"><span>${t}</span><small>${s}</small></a>`).join('')}</div></div>`;
}
function desktopNav(l){
  const base=l.top.map(([t,h])=>`<a class="kt-simple-link" href="${h}">${t}</a>`).join('');
  return `<div class="kt-simple-nav">${base}<details class="kt-solutions"><summary>${l.solutionsLabel}</summary>${solutionsPanel(l)}</details><a class="kt-simple-link" href="${l.science[1]}">${l.science[0]}</a><a class="kt-simple-link kt-account-link" href="https://pulse.komolongevity.com/">${l.login}</a></div>`;
}
function mobileNav(l){
  const groups=l.mobileGroups.map(([title,links])=>`<div class="kt-menu-group"><strong>${title}</strong>${links.map(([t,h])=>`<a class="kt-menu-link" href="${h}">${t}</a>`).join('')}</div>`).join('');
  return groups+`<a class="kt-mobile-account" href="https://pulse.komolongevity.com/">${l.login} · Pulse</a>`;
}
function patch(html,l){
  if(!html.includes('komo-navigation-clean-v1-style')) html=html.replace('</head>',css+'\n</head>');
  html=html.replace(/<nav class="kp-nav">[\s\S]*?<\/nav>/,`<nav class="kp-nav">${desktopNav(l)}</nav>`);
  html=html.replace(/<nav class="pv2-nav"([^>]*)>[\s\S]*?<\/nav>/,`<nav class="pv2-nav"$1>${desktopNav(l)}</nav>`);
  html=html.replace(/<nav class="primary-nav"([^>]*)>[\s\S]*?<\/nav>/,`<nav class="primary-nav"$1>${desktopNav(l)}</nav>`);
  html=html.replace(/<nav class="nav">[\s\S]*?<\/nav>/,`<nav class="nav">${desktopNav(l)}</nav>`);
  html=html.replace(/<details class="kp-menu">[\s\S]*?<\/details>/,`<details class="kp-menu"><summary>Menu</summary><div class="kt-mobile-menu">${mobileNav(l)}</div></details>`);
  html=html.replace(/<details class="pv2-mobile">[\s\S]*?<\/details>/,`<details class="pv2-mobile"><summary>Menu</summary><div class="kt-mobile-menu">${mobileNav(l)}</div></details>`);
  html=html.replace(/<a class="kp-mini" href="[^"]*"[^>]*>[\s\S]*?<\/a>/,`<a class="kp-mini" href="${l.appointmentHref}">${l.appointment} →</a>`);
  return html;
}

async function walk(dir){
  const out=[];
  for(const name of await readdir(dir)){
    const fp=join(dir,name);
    const s=await stat(fp);
    if(s.isDirectory()){
      const rel=relative(site,fp).replaceAll('\\','/');
      if(['pulse-v12','command-v1','life-v1','assets','world'].includes(rel.split('/')[0])) continue;
      out.push(...await walk(fp));
    }else if(name==='index.html') out.push(fp);
  }
  return out;
}

for(const fp of await walk(site)){
  const rel=relative(site,fp).replaceAll('\\','/');
  let html=await readFile(fp,'utf8');
  if(!/(class="kp-top"|class="pv2-top"|class="primary-nav"|class="kp-nav"|class="pv2-nav")/.test(html)) continue;
  html=patch(html,localeFor(rel));
  await writeFile(fp,html,'utf8');
}

console.log('[komo-navigation-clean-v1] PASS · simplified public navigation applied across current KŌMØ pages.');
