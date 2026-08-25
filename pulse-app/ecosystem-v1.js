const LINKS={
  public:[
    ['Méthode','Comprendre la méthode KŌMØ','https://komolongevity.com/fr/methode/'],
    ['Library','Lire les contenus de référence','https://komolongevity.com/media'],
    ['Science','Preuves, méthode et validation','https://komolongevity.com/fr/science/'],
    ['Network','Trouver l’écosystème KŌMØ','https://komolongevity.com/fr/network/']
  ],
  assess:[
    ['KŌMØ Pulse','Votre espace personnel','#home','primary'],
    ['Mes tests','Préparer et réaliser vos tests','#results'],
    ['KŌMØ Motion','Mesure fonctionnelle et instrumentée','https://komolongevity.com/fr/partners/motion/'],
    ['KŌMØ Clinical','Évaluation médicale approfondie','https://komolongevity.com/fr/partners/clinical/']
  ],
  pro:[
    ['Clinical Workspace','Patients, Motion et validation','#clinical'],
    ['KŌMØ Case','Le système de mesure sur site','https://komolongevity.com/fr/case/'],
    ['Professionnels','Déployer KŌMØ','https://komolongevity.com/fr/partners/'],
    ['Contact','Parler à l’équipe KŌMØ','https://komolongevity.com/fr/contact/']
  ]
};
function esc(v=''){return String(v).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]))}
function launcher(){const b=document.createElement('button');b.type='button';b.className='komo-ecosystem-launcher';b.innerHTML='<span class="dots"><i></i><i></i><i></i><i></i></span><span class="launcher-label">KŌMØ</span>';b.setAttribute('aria-label','Ouvrir l’écosystème KŌMØ');b.addEventListener('click',open);return b}
function linkHtml([title,sub,href,tone]){return `<a class="komo-ecosystem-link ${tone||''}" href="${esc(href)}" ${href.startsWith('http')?'target="_blank" rel="noopener noreferrer"':''}><strong>${esc(title)}</strong><span>${esc(sub)}</span></a>`}
function section(label,items){return `<section class="komo-ecosystem-section"><p>${label}</p><div class="komo-ecosystem-links">${items.map(linkHtml).join('')}</div></section>`}
function ensureOverlay(){let o=document.querySelector('#komoEcosystemOverlay');if(o)return o;o=document.createElement('div');o.id='komoEcosystemOverlay';o.className='komo-ecosystem-overlay';o.hidden=true;o.innerHTML=`<aside class="komo-ecosystem-panel" role="dialog" aria-modal="true" aria-label="Écosystème KŌMØ"><div class="komo-ecosystem-head"><div class="komo-ecosystem-brand"><strong>KŌMØ</strong><span>Longevity in Motion</span></div><button class="komo-ecosystem-close" type="button" aria-label="Fermer">×</button></div>${section('Comprendre',LINKS.public)}${section('Mesurer & suivre',LINKS.assess)}${section('Professionnels',LINKS.pro)}<div class="komo-ecosystem-current">Vous êtes dans <strong>KŌMØ Pulse</strong>, le cockpit personnel et professionnel qui conserve le fil entre chaque mesure, consultation et étape du programme.</div></aside>`;document.body.appendChild(o);o.addEventListener('click',e=>{if(e.target===o||e.target.closest('.komo-ecosystem-close'))close()});o.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',()=>close()));document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});return o}
function open(){ensureOverlay().hidden=false;document.body.style.overflow='hidden'}function close(){const o=ensureOverlay();o.hidden=true;document.body.style.overflow=''}
function mount(){const shell=document.querySelector('#appShell');if(!shell||shell.hidden)return;ensureOverlay();const sidebar=document.querySelector('.sidebar .sidebar-foot');if(sidebar&&!sidebar.querySelector('.komo-ecosystem-launcher'))sidebar.prepend(launcher());const actions=document.querySelector('.topbar-actions');if(actions&&matchMedia('(max-width:820px)').matches&&!actions.querySelector('.komo-ecosystem-launcher'))actions.prepend(launcher());document.querySelectorAll('#desktopNav [data-route="explore"],#mobileNav [data-route="explore"]').forEach(x=>x.remove())}
function entry(){const u=new URL(location.href),e=u.searchParams.get('entry');if(!e)return;const map={tests:'results',mykomo:'path',plan:'plan',agenda:'documents',clinical:'clinical',motion:'clinical',professional:'clinical'};const r=map[e];if(r&&location.hash!==`#${r}`)location.hash=r;u.searchParams.delete('entry');history.replaceState({},'',u.pathname+u.search+location.hash)}
const obs=new MutationObserver(()=>requestAnimationFrame(mount));obs.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden']});window.addEventListener('resize',mount);document.addEventListener('DOMContentLoaded',()=>{setTimeout(()=>{mount();entry()},500)});setTimeout(()=>{mount();entry()},1000);