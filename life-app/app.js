const root = document.documentElement;
const mobileMenu = document.querySelector('[data-mobile-menu]');

const ASSETS = {
  hero: { chunks: 5, mime: 'image/webp' },
  varsity: { chunks: 2, mime: 'image/webp' },
  library: { chunks: 1, mime: 'image/webp' }
};

async function hydrateAsset(name, config){
  const targets=[...document.querySelectorAll(`[data-asset="${name}"]`)];
  if(!targets.length) return;
  try{
    const chunks=await Promise.all(Array.from({length:config.chunks},(_,i)=>
      fetch(`assets/${name}.webp.${i}.b64`,{cache:'force-cache'}).then(r=>{
        if(!r.ok) throw new Error(`${name} chunk ${i} unavailable`);
        return r.text();
      })
    ));
    const src=`data:${config.mime};base64,${chunks.join('')}`;
    targets.forEach(img=>{img.addEventListener('load',()=>img.classList.add('is-loaded'),{once:true});img.src=src});
  }catch(error){console.warn(`[KŌMØ Life] ${name} visual could not load`,error)}
}
Object.entries(ASSETS).forEach(([name,config])=>hydrateAsset(name,config));

function initialLanguage(){
  const saved=localStorage.getItem('komo-life-language');
  if(saved==='en'||saved==='fr') return saved;
  return navigator.language?.toLowerCase().startsWith('fr')?'fr':'en';
}
function setLanguage(language){
  const lang=language==='fr'?'fr':'en';
  root.dataset.lang=lang;root.lang=lang;localStorage.setItem('komo-life-language',lang);
  document.querySelectorAll('[data-en][data-fr]').forEach(el=>{const value=lang==='fr'?el.dataset.fr:el.dataset.en;if(value!==undefined)el.textContent=value});
  document.querySelectorAll('[data-en-html][data-fr-html]').forEach(el=>{const value=lang==='fr'?el.dataset.frHtml:el.dataset.enHtml;if(value!==undefined)el.innerHTML=value});
  document.title=lang==='fr'?'KŌMØ Life — La longévité en mouvement':'KŌMØ Life — Longevity in Motion';
}
setLanguage(initialLanguage());
document.querySelectorAll('[data-language-toggle]').forEach(btn=>btn.addEventListener('click',()=>setLanguage(root.dataset.lang==='fr'?'en':'fr')));

function closeMenu(){mobileMenu?.classList.remove('is-open');mobileMenu?.setAttribute('aria-hidden','true');document.body.classList.remove('menu-open')}
function openMenu(){mobileMenu?.classList.add('is-open');mobileMenu?.setAttribute('aria-hidden','false');document.body.classList.add('menu-open')}
document.querySelector('[data-menu-open]')?.addEventListener('click',openMenu);
document.querySelector('[data-menu-close]')?.addEventListener('click',closeMenu);
window.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});

document.querySelectorAll('[data-scroll]').forEach(control=>control.addEventListener('click',()=>{
  const target=document.getElementById(control.dataset.scroll);closeMenu();if(!target)return;
  target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
}));
