const SELECTORS={analysis:'[data-kcp-tab="myocare"]',motion:'[data-kcp-tab="motion"]'};
let moving=false;

function activeClinical(){return location.hash==='#clinical'&&document.body.classList.contains('komo-pro-mode')}
function tabActive(sel){return document.querySelector(sel)?.classList.contains('active')}

function styles(){
  if(document.querySelector('#myocare-import-entry-v2-style'))return;
  const s=document.createElement('style');
  s.id='myocare-import-entry-v2-style';
  s.textContent=`
    .kmi2-entry{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:18px;align-items:center;margin:0 0 14px;padding:20px 22px;border:1px solid rgba(71,96,77,.22);border-radius:22px;background:linear-gradient(135deg,#f8f4eb,#eef3ed);box-shadow:0 12px 34px rgba(39,52,43,.055)}
    .kmi2-entry small{display:block;margin:0 0 6px;color:#758078;font-size:8px;font-weight:800;letter-spacing:.11em;text-transform:uppercase}.kmi2-entry h4{margin:0 0 6px;color:#29372f;font-size:19px;letter-spacing:-.025em}.kmi2-entry p{margin:0;max-width:740px;color:#727b75;font-size:9px;line-height:1.55}
    .kmi2-entry__steps{display:flex;gap:7px;flex-wrap:wrap;margin-top:12px}.kmi2-entry__steps span{display:inline-flex;align-items:center;gap:5px;padding:6px 8px;border:1px solid rgba(56,75,62,.1);border-radius:999px;background:rgba(255,255,255,.66);color:#667168;font-size:8px;font-weight:700}.kmi2-entry__steps b{color:#304137}
    .kmi2-entry button{min-height:43px;border:0;border-radius:13px;padding:0 15px;background:#293a30;color:#fff;font:inherit;font-size:9px;font-weight:800;cursor:pointer;white-space:nowrap}.kmi2-entry button:hover{filter:brightness(1.04)}
    .kmi2-priority{position:relative!important;border:1px solid rgba(64,92,71,.25)!important;background:linear-gradient(145deg,#fff,#f4f7f2)!important;box-shadow:0 14px 38px rgba(39,52,43,.06)!important}
    .kmi2-priority:before{content:'03 · IMPORT MYOCARE';display:inline-flex;margin:0 0 12px;padding:5px 8px;border-radius:999px;background:#e7eee7;color:#55695b;font-size:8px;font-weight:850;letter-spacing:.09em}
    .kmi2-priority .clm-card-head h3{font-size:20px!important}.kmi2-priority .clm-card-head p{font-size:10px!important}.kmi2-priority .clm-drop{border:1px dashed rgba(60,88,68,.32)!important;background:#fafcf9!important}.kmi2-priority .clm-drop strong{font-size:14px!important}.kmi2-priority #clmFile{cursor:pointer}
    .kmi2-helper{margin-top:9px;padding:10px 12px;border-radius:12px;background:#f1f4ef;color:#68756c;font-size:8px;line-height:1.5}.kmi2-helper strong{color:#34483a}
    @media(max-width:760px){.kmi2-entry{grid-template-columns:1fr;padding:18px}.kmi2-entry button{width:100%}}
  `;
  document.head.appendChild(s);
}

function notify(message){const t=document.querySelector('#toast');if(!t)return;t.textContent=message;t.hidden=false;clearTimeout(notify.timer);notify.timer=setTimeout(()=>t.hidden=true,3200)}

function decorateAnalysis(){
  if(!activeClinical()||!tabActive(SELECTORS.analysis))return;
  const host=document.querySelector('.kma');
  if(!host||host.querySelector('[data-kmi2-entry]'))return;
  styles();
  const box=document.createElement('section');
  box.className='kmi2-entry';
  box.dataset.kmi2Entry='1';
  box.innerHTML=`<div><small>IMPORT DES CAPTEURS · MYOCARE / MYODEV</small><h4>Importer l’export Excel du patient.</h4><p>L’import se rattache au bilan Motion actif. Formats acceptés : <strong>.xlsx, .xls, .csv et .json</strong>. Pulse contrôle les colonnes et affiche un aperçu avant enregistrement.</p><div class="kmi2-entry__steps"><span><b>1</b> Patient</span><span><b>2</b> Bilan Motion</span><span><b>3</b> Fichier MyoCare</span></div></div><button type="button" data-kmi2-open-import>Importer un fichier MyoCare →</button>`;
  const hero=host.querySelector('.kma-hero');
  if(hero?.nextSibling)host.insertBefore(box,hero.nextSibling);else host.prepend(box);
}

function decorateMotion(){
  if(!activeClinical()||!tabActive(SELECTORS.motion)||moving)return;
  const importer=document.querySelector('#clmImporter');
  const card=importer?.closest('.clm-card');
  if(!card)return;
  styles();
  moving=true;
  try{
    card.classList.add('kmi2-priority');
    if(!card.querySelector('[data-kmi2-helper]')){
      const helper=document.createElement('div');
      helper.className='kmi2-helper';
      helper.dataset.kmi2Helper='1';
      helper.innerHTML='<strong>Comment faire :</strong> exportez la session depuis MyoCare, sélectionnez le fichier ci-dessous, vérifiez l’aperçu puis confirmez l’import. Les données seront rattachées au patient et au bilan Motion sélectionnés au-dessus.';
      importer.insertAdjacentElement('afterend',helper);
    }
    const selectors=document.querySelector('[data-clinical-motion-v1] .clm-grid');
    if(selectors&&selectors.nextElementSibling!==card)selectors.insertAdjacentElement('afterend',card);
  }finally{moving=false}
}

function openImport(){
  const motion=document.querySelector(SELECTORS.motion);
  if(!motion){notify('Ouvrez le bilan Motion du patient pour importer le fichier.');return}
  motion.click();
  let tries=0;
  const seek=()=>{
    decorateMotion();
    const importer=document.querySelector('#clmImporter');
    if(importer){
      importer.closest('.clm-card')?.scrollIntoView({behavior:'smooth',block:'start'});
      setTimeout(()=>document.querySelector('#clmFile')?.focus({preventScroll:true}),450);
      notify('Choisissez maintenant l’export MyoCare du patient.');
      return;
    }
    const assessment=document.querySelector('#clmAssessment');
    if(assessment&&tries>8){
      assessment.closest('.clm-card')?.scrollIntoView({behavior:'smooth',block:'center'});
      notify('Sélectionnez d’abord le patient et son bilan Motion. La zone d’import apparaîtra juste dessous.');
      return;
    }
    if(tries++<35)setTimeout(seek,120);
  };
  setTimeout(seek,80);
}

function relabel(){
  document.querySelectorAll('[data-pro-nav="myocare"], [data-kcp-tab="myocare"]').forEach(el=>{
    el.title='Analyse musculaire · importer un export MyoCare (.xlsx/.csv)';
    el.setAttribute('aria-label','Analyse musculaire et import MyoCare');
  });
}

function run(){
  if(!activeClinical())return;
  relabel();
  decorateAnalysis();
  decorateMotion();
}

document.addEventListener('click',e=>{
  if(!e.target.closest?.('[data-kmi2-open-import]'))return;
  e.preventDefault();
  openImport();
},true);

window.addEventListener('hashchange',()=>setTimeout(run,80));
window.addEventListener('komo:route-ready',()=>setTimeout(run,60));
window.addEventListener('komo:clinical-motion-render',()=>setTimeout(run,30));
const observer=new MutationObserver(()=>setTimeout(run,20));
observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden']});
document.addEventListener('DOMContentLoaded',()=>setTimeout(run,500));
setTimeout(run,900);
