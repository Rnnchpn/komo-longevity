import { loadCanonicalResult, getCanonicalClient } from './canonical-result-runtime.js';
import { levelLabel } from './normative-engine-v1.js';

const VERSION='5.0.0-premium-results';
const REPORT_RELEASE='20260903-motion-report-complete-v7';
let timer=null;
let lazyStores=new Map();

const n=v=>{const x=Number(v);return Number.isFinite(x)?x:null};
const esc=(v='')=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const route=()=>window.KomoPatientNavigation?.route?.()||location.hash.replace(/^#/,'')||'home';
const fmtDate=v=>{if(!v)return'—';const d=new Date(v);return Number.isNaN(d.getTime())?'—':new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'short',year:'numeric'}).format(d)};
const fmtDateTime=v=>{if(!v)return'—';const d=new Date(v);return Number.isNaN(d.getTime())?'—':new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(d)};
const score=v=>n(v)===null?'—':`${Math.round(n(v))}`;
const pct=(v,d=0)=>n(v)===null?'—':`${n(v).toFixed(d)} %`;
const display=(v,unit='',digits=1)=>{const x=n(v);if(x===null)return v===null||v===undefined||v===''?'—':String(v);const out=x.toLocaleString('fr-FR',{minimumFractionDigits:digits,maximumFractionDigits:digits});return `${out}${unit?` ${unit}`:''}`};
const statusLabel=v=>v==='released'?'Publié':v==='clinician_reviewed'?'Relu · à publier':'En validation';
const tone=s=>s==='favorable'?'good':s==='watch'?'watch':['priority','review'].includes(s)?'bad':'neutral';
const qcTone=s=>String(s||'').toLowerCase()==='valid'?'good':['invalid'].includes(String(s||'').toLowerCase())?'bad':String(s||'').toLowerCase()==='suspect'?'watch':'neutral';
const qcLabel=s=>({valid:'Mesure valide',suspect:'À vérifier',invalid:'Invalide',pending:'En attente'})[String(s||'').toLowerCase()]||'Descriptif';
const sideLabel=s=>({left:'Gauche',right:'Droite',bilateral:'Bilatéral',na:'—',LEFT:'Gauche',RIGHT:'Droite'})[s]||s||'—';
const valueText=v=>{if(v===null||v===undefined||v==='')return'—';if(typeof v==='boolean')return v?'Oui':'Non';if(Array.isArray(v))return v.map(valueText).join(', ');if(typeof v==='object'){try{return JSON.stringify(v)}catch{return String(v)}}return String(v).replaceAll('_',' ')};

function installStyle(){
  if(document.querySelector('#kresultsV5Style'))return;
  document.querySelector('#kresultsV4Style')?.remove();
  document.querySelector('#kresultsV2Style')?.remove();
  const s=document.createElement('style');
  s.id='kresultsV5Style';
  s.textContent=`
body.kresults-v4 .main-shell,
body.kresults-v4 #viewRoot{
  background:#f4f7f5!important;
}
body.kresults-v4 #viewRoot{
  min-height:0!important;
  overflow-y:auto!important;
  overflow-x:hidden!important;
  scrollbar-width:none!important;
}
body.kresults-v4 #viewRoot::-webkit-scrollbar{display:none!important}
.kr5{
  --bg:#f4f7f5;
  --panel:#fff;
  --soft:#f8faf9;
  --ink:#17251d;
  --muted:#6e7d74;
  --line:#dce6df;
  --green:#2f8b60;
  --green-dark:#205f43;
  --green-soft:#edf7f1;
  --blue:#647cf1;
  --amber:#b98328;
  --amber-soft:#fff6e4;
  --red:#b95b50;
  --red-soft:#fff1ee;
  width:min(1280px,100%);
  margin:0 auto;
  padding:10px clamp(18px,3vw,42px) 96px;
  display:grid;
  gap:10px;
  color:var(--ink);
  font-family:"DM Sans",system-ui,sans-serif;
  box-sizing:border-box;
}
.kr5 *{box-sizing:border-box}
.kr5 button,.kr5 summary{font-family:"DM Sans",system-ui,sans-serif}
.kr5-card{
  border:1px solid var(--line);
  border-radius:22px;
  background:rgba(255,255,255,.96);
  box-shadow:0 13px 34px rgba(38,67,50,.06);
}
.kr5-eyebrow{
  margin:0;
  color:#668073;
  font:600 8px/1 "DM Sans",sans-serif;
  letter-spacing:.11em;
  text-transform:uppercase;
}
.kr5-top{
  min-height:58px;
  display:grid;
  grid-template-columns:minmax(0,1fr) auto;
  gap:18px;
  align-items:center;
}
.kr5-top h1{
  margin:5px 0 0;
  color:#18382a;
  font:600 clamp(26px,2.7vw,38px)/1 Manrope,"DM Sans",sans-serif;
  letter-spacing:-.048em;
}
.kr5-top p{
  margin:6px 0 0;
  color:var(--muted);
  font:400 10px/1.35 "DM Sans",sans-serif;
}
.kr5-actions{display:flex;align-items:center;gap:7px;flex-wrap:wrap;justify-content:flex-end}
.kr5-btn{
  min-height:36px;
  padding:0 13px;
  border:1px solid #d8e3dc;
  border-radius:999px;
  background:#fff;
  color:#355947;
  font:600 8px/1 "DM Sans",sans-serif;
  cursor:pointer;
}
.kr5-btn.primary{
  border-color:transparent;
  background:#2f8059;
  color:#fff;
  box-shadow:0 8px 20px rgba(47,128,89,.16);
}
.kr5-btn.blue{border-color:#dce1fb;background:#f4f6ff;color:#4c5eb4}

.kr5-hero{
  min-height:300px;
  display:grid;
  grid-template-columns:minmax(0,1.02fr) minmax(470px,.98fr);
  overflow:hidden;
  background:
    radial-gradient(520px 300px at 2% 0%,rgba(69,169,119,.12),transparent 70%),
    radial-gradient(460px 300px at 98% 8%,rgba(100,124,241,.08),transparent 72%),
    #fff;
}
.kr5-score-pane{
  min-width:0;
  padding:28px 30px;
  display:grid;
  grid-template-rows:auto 1fr auto;
  border-right:1px solid #e3ebe6;
}
.kr5-score-head{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
}
.kr5-chip{
  display:inline-flex;
  align-items:center;
  gap:6px;
  min-height:25px;
  padding:0 9px;
  border-radius:999px;
  background:#eef5f1;
  color:#4e705e;
  font:600 7px/1 "DM Sans",sans-serif;
}
.kr5-chip:before{
  content:"";
  width:6px;
  height:6px;
  border-radius:50%;
  background:#45a977;
}
.kr5-chip.watch{background:var(--amber-soft);color:#8f671e}
.kr5-chip.watch:before{background:#d5a03f}
.kr5-chip.priority{background:var(--red-soft);color:#a45248}
.kr5-chip.priority:before{background:#cf6a5c}
.kr5-score-wrap{align-self:center}
.kr5-score{
  display:flex;
  align-items:flex-end;
  gap:8px;
  margin-top:4px;
}
.kr5-score strong{
  color:#236b49;
  font:500 clamp(86px,8vw,124px)/.78 Manrope,"DM Sans",sans-serif;
  letter-spacing:-.09em;
}
.kr5-score span{
  margin-bottom:8px;
  color:#7c8a82;
  font:500 15px/1 "DM Sans",sans-serif;
}
.kr5-score-wrap h2{
  max-width:620px;
  margin:20px 0 0;
  color:#203f30;
  font:600 clamp(21px,2.2vw,31px)/1.04 Manrope,"DM Sans",sans-serif;
  letter-spacing:-.04em;
}
.kr5-score-wrap p{
  max-width:600px;
  margin:9px 0 0;
  color:#6d7e74;
  font:400 10px/1.55 "DM Sans",sans-serif;
}
.kr5-score-meta{
  display:flex;
  gap:14px;
  flex-wrap:wrap;
  padding-top:12px;
  color:#819087;
  font:500 8px/1 "DM Sans",sans-serif;
}

.kr5-muscles{
  min-width:0;
  padding:18px;
  display:grid;
  grid-template-rows:auto repeat(3,minmax(0,1fr));
  gap:8px;
  background:rgba(249,251,250,.75);
}
.kr5-muscles-head{
  display:flex;
  justify-content:space-between;
  gap:12px;
  align-items:center;
  padding:2px 2px 4px;
}
.kr5-muscles-head strong{
  color:#2a4939;
  font:600 11px/1 "DM Sans",sans-serif;
}
.kr5-muscles-head span{
  color:#829087;
  font:400 8px/1 "DM Sans",sans-serif;
}
.kr5-lsi{
  min-width:0;
  padding:14px 15px;
  display:grid;
  grid-template-columns:minmax(0,1fr) auto;
  gap:14px;
  align-items:center;
  border:1px solid #e1e9e5;
  border-radius:16px;
  background:#fff;
}
.kr5-lsi.priority{border-color:#efd7d2;background:#fff7f5}
.kr5-lsi.watch{border-color:#eadfbd;background:#fffaf0}
.kr5-lsi-copy{min-width:0}
.kr5-lsi-copy span{
  display:block;
  color:#75847b;
  font:500 8px/1 "DM Sans",sans-serif;
}
.kr5-lsi-copy strong{
  display:block;
  margin-top:6px;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  color:#294a39;
  font:600 14px/1.05 Manrope,"DM Sans",sans-serif;
}
.kr5-lsi-value{
  min-width:76px;
  text-align:right;
  color:#286b4c;
  font:600 28px/1 Manrope,"DM Sans",sans-serif;
  letter-spacing:-.045em;
}
.kr5-lsi.priority .kr5-lsi-value{color:#ad574d}
.kr5-lsi.watch .kr5-lsi-value{color:#9b711f}

.kr5-priority{
  min-height:94px;
  padding:16px 18px;
  display:grid;
  grid-template-columns:150px minmax(0,1fr) auto;
  gap:18px;
  align-items:center;
}
.kr5-priority-label strong{
  display:block;
  margin-top:7px;
  color:#6f7e75;
  font:500 9px/1.2 "DM Sans",sans-serif;
}
.kr5-priority-main h3{
  margin:0;
  color:#274636;
  font:600 clamp(17px,1.55vw,22px)/1.08 Manrope,"DM Sans",sans-serif;
  letter-spacing:-.03em;
}
.kr5-priority-main p{
  margin:7px 0 0;
  color:#718078;
  font:400 9px/1.35 "DM Sans",sans-serif;
}
.kr5-recheck{
  min-width:142px;
  padding:10px 12px;
  border:1px solid #dfe8e3;
  border-radius:13px;
  background:#f8faf9;
}
.kr5-recheck span{
  display:block;
  color:#839088;
  font:500 7px/1 "DM Sans",sans-serif;
  text-transform:uppercase;
  letter-spacing:.07em;
}
.kr5-recheck strong{
  display:block;
  margin-top:6px;
  color:#315642;
  font:600 11px/1.15 "DM Sans",sans-serif;
}

.kr5-strip{
  display:grid;
  grid-template-columns:repeat(3,minmax(0,1fr));
  gap:10px;
}
.kr5-mini{
  min-width:0;
  min-height:88px;
  padding:15px 16px;
}
.kr5-mini span{
  display:block;
  color:#75847c;
  font:500 8px/1 "DM Sans",sans-serif;
}
.kr5-mini strong{
  display:block;
  margin-top:8px;
  color:#294b39;
  font:600 21px/1 Manrope,"DM Sans",sans-serif;
  letter-spacing:-.035em;
}
.kr5-mini p{
  margin:7px 0 0;
  color:#829087;
  font:400 8px/1.3 "DM Sans",sans-serif;
}

.kr5-detail{
  overflow:hidden;
}
.kr5-detail>summary{
  min-height:66px;
  padding:0 18px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:18px;
  list-style:none;
  cursor:pointer;
}
.kr5-detail>summary::-webkit-details-marker{display:none}
.kr5-detail-title strong{
  display:block;
  color:#294938;
  font:600 13px/1 "DM Sans",sans-serif;
}
.kr5-detail-title span{
  display:block;
  margin-top:5px;
  color:#829087;
  font:400 8px/1.25 "DM Sans",sans-serif;
}
.kr5-detail-arrow{
  flex:none;
  width:32px;
  height:32px;
  display:grid;
  place-items:center;
  border-radius:50%;
  background:#f0f5f2;
  color:#456452;
  font:600 14px/1 "DM Sans",sans-serif;
  transition:transform .18s ease;
}
.kr5-detail[open] .kr5-detail-arrow{transform:rotate(45deg)}
.kr5-detail-body{
  padding:0 10px 10px;
  display:grid;
  gap:8px;
  border-top:1px solid #e5ece8;
  background:#f8faf9;
}

/* Existing scientific sections are deliberately secondary inside the disclosure. */
.kr5-detail-body .kr4-card{
  border:1px solid #e1e9e5!important;
  border-radius:17px!important;
  background:#fff!important;
  box-shadow:none!important;
  color:#17251d!important;
}
.kr5-detail-body .kr4-section,
.kr5-detail-body .kr4-clinical-hero{padding:17px!important}
.kr5-detail-body .kr4-section-head{
  display:flex!important;
  align-items:flex-end!important;
  justify-content:space-between!important;
  gap:16px!important;
  margin-bottom:14px!important;
}
.kr5-detail-body .kr4-kicker{color:#668073!important;font:600 7px/1 "DM Sans",sans-serif!important}
.kr5-detail-body :is(h2,h3,h4,strong){color:#294938!important}
.kr5-detail-body .kr4-section-head h3{font:600 21px/1.02 Manrope,"DM Sans",sans-serif!important;letter-spacing:-.035em!important}
.kr5-detail-body :is(p,small,span){color:#78877f!important}
.kr5-detail-body .kr4-section-head p{max-width:580px!important;margin:0!important;font:400 8px/1.45 "DM Sans",sans-serif!important;text-align:right!important}
.kr5-detail-body .kr4-grid,.kr5-detail-body .kr4-muscle{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:7px!important}
.kr5-detail-body .kr4-signal,
.kr5-detail-body .kr4-muscle-card,
.kr5-detail-body .kr4-row,
.kr5-detail-body .kr4-q,
.kr5-detail-body .kr4-details,
.kr5-detail-body .kr4-clinical-card{
  border:1px solid #e3eae6!important;
  border-radius:13px!important;
  background:#fafcfb!important;
  color:#294938!important;
  box-shadow:none!important;
}
.kr5-detail-body .kr4-signal,
.kr5-detail-body .kr4-muscle-card{padding:12px!important}
.kr5-detail-body .kr4-row{padding:10px 11px!important}
.kr5-detail-body .kr4-signal.good,
.kr5-detail-body .kr4-muscle-card.good,
.kr5-detail-body .kr4-row.good{background:#eef8f2!important}
.kr5-detail-body .kr4-signal.watch,
.kr5-detail-body .kr4-muscle-card.watch,
.kr5-detail-body .kr4-row.watch{background:#fff8e9!important}
.kr5-detail-body .kr4-signal.bad,
.kr5-detail-body .kr4-muscle-card.bad,
.kr5-detail-body .kr4-row.bad{background:#fff2ef!important}
.kr5-detail-body .kr4-status{
  display:inline-flex!important;
  align-items:center!important;
  min-height:22px!important;
  padding:0 7px!important;
  border-radius:999px!important;
  font:600 7px/1 "DM Sans",sans-serif!important;
}
.kr5-detail-body .kr4-status.good{background:#e8f6ee!important;color:#337551!important}
.kr5-detail-body .kr4-status.watch{background:#fff3d8!important;color:#91691e!important}
.kr5-detail-body .kr4-status.bad{background:#ffede9!important;color:#a9564c!important}
.kr5-detail-body .kr4-status.neutral{background:#eef2f0!important;color:#68776f!important}
.kr5-detail-body .kr4-signal strong{font:600 18px/1 Manrope,"DM Sans",sans-serif!important}
.kr5-detail-body .kr4-muscle-value{font:600 25px/1 Manrope,"DM Sans",sans-serif!important;color:#2c6d4f!important}
.kr5-detail-body .kr4-rowlist{display:grid!important;gap:6px!important}
.kr5-detail-body .kr4-row{display:grid!important;grid-template-columns:minmax(160px,1fr) 110px minmax(180px,.8fr) auto!important;gap:10px!important;align-items:center!important}
.kr5-detail-body .kr4-table{width:100%!important;border-collapse:separate!important;border-spacing:0 4px!important}
.kr5-detail-body .kr4-table td{padding:9px!important;background:#fafcfb!important;border-color:#e4ebe7!important;font-size:8px!important}
.kr5-detail-body .kr4-questionnaires{display:grid!important;gap:7px!important}
.kr5-detail-body .kr4-q summary,
.kr5-detail-body .kr4-details>summary{padding:12px 13px!important}
.kr5-detail-body .kr4-q-body,
.kr5-detail-body .kr4-detail-body{border-top:1px solid #e5ece8!important;padding:10px 12px!important}
.kr5-detail-body .kr4-empty{
  padding:14px!important;
  border:1px solid #e3eae6!important;
  border-radius:12px!important;
  background:#fafcfb!important;
  color:#7c8a82!important;
  font:400 9px/1.45 "DM Sans",sans-serif!important;
}

body.kresults-v4 #komoAssistantRail{
  width:48px!important;
  min-width:48px!important;
  height:48px!important;
  min-height:48px!important;
  right:11px!important;
  bottom:86px!important;
  padding:0!important;
  border:1px solid #dce6df!important;
  border-radius:16px!important;
  background:rgba(255,255,255,.94)!important;
  color:#244c37!important;
  box-shadow:0 12px 30px rgba(31,57,42,.12)!important;
  writing-mode:horizontal-tb!important;
  transform:none!important;
}
body.kresults-v4 #komoAssistantRail .ka2-rail-copy{display:none!important}

/* Results V5 is the only patient Results visual owner.
   Legacy report/free layers may still exist in historical scripts, but never render here. */
body.kresults-v4 [data-krpatient],
body.kresults-v4 [data-kfree-v2],
body.kresults-v4 [data-kfree-v2-library],
body.kresults-v4 .pulse-free-result-v2,
body.kresults-v4 .pulse-free-entry,
body.kresults-v4 [data-kpa-trio],
body.kresults-v4 [data-kts]{
  display:none!important;
}
html[data-adaptive-shell][data-adaptive-mode="patient"] body.kresults-v4 #kamRoleRow{
  display:none!important;
}

@media(max-width:900px){
  .kr5{padding-left:12px;padding-right:12px}
  .kr5-hero{grid-template-columns:1fr}
  .kr5-score-pane{border-right:0;border-bottom:1px solid #e3ebe6}
  .kr5-muscles{grid-template-columns:repeat(3,minmax(0,1fr));grid-template-rows:auto 1fr}
  .kr5-muscles-head{grid-column:1/-1}
  .kr5-lsi{grid-template-columns:1fr;gap:8px}
  .kr5-lsi-value{text-align:left}
}
/* iPad portrait — use the complete app canvas instead of the stacked
   narrow-tablet composition. Keep the scientific overview visible at once,
   with a two-column score/muscle cockpit and full-width secondary cards. */
@media (min-width:701px) and (max-width:1024px) and (orientation:portrait){
  body.kresults-v4 .main-shell{
    height:100dvh!important;
    max-height:100dvh!important;
    min-height:0!important;
    padding-bottom:calc(76px + 12px + env(safe-area-inset-bottom))!important;
    overflow:hidden!important;
  }
  body.kresults-v4 #viewRoot{
    flex:1 1 0!important;
    width:100%!important;
    height:auto!important;
    max-height:none!important;
    min-height:0!important;
    padding:0!important;
    overflow-y:auto!important;
    overflow-x:hidden!important;
    -webkit-overflow-scrolling:touch!important;
  }
  html[data-adaptive-shell][data-adaptive-mode="patient"] body.kresults-v4 #kamRoleRow{
    display:none!important;
  }
  .kr5{
    width:100%;
    min-height:100%;
    margin:0;
    padding:12px 14px 18px;
    gap:10px;
    align-content:start;
  }
  .kr5-top{
    min-height:64px;
    grid-template-columns:minmax(0,1fr) auto;
    gap:12px;
  }
  .kr5-top h1{font-size:30px}
  .kr5-top p{font-size:9px}
  .kr5-actions{gap:6px}
  .kr5-btn{min-height:34px;padding:0 11px;font-size:7.5px}

  .kr5-hero{
    min-height:390px;
    grid-template-columns:minmax(0,1.08fr) minmax(300px,.92fr);
  }
  .kr5-score-pane{
    padding:22px 24px;
    border-right:1px solid #e3ebe6;
    border-bottom:0;
  }
  .kr5-score strong{font-size:86px}
  .kr5-score-wrap h2{margin-top:16px;font-size:24px}
  .kr5-score-wrap p{font-size:9px}
  .kr5-score-meta{font-size:7px}

  .kr5-muscles{
    padding:14px;
    grid-template-columns:1fr;
    grid-template-rows:auto repeat(3,minmax(0,1fr));
    gap:7px;
  }
  .kr5-muscles-head{grid-column:auto}
  .kr5-lsi{
    min-height:0;
    padding:12px 13px;
    display:grid;
    grid-template-columns:minmax(0,1fr) auto;
    gap:10px;
    align-items:center;
  }
  .kr5-lsi-copy span{font-size:7px}
  .kr5-lsi-copy strong{font-size:12px}
  .kr5-lsi-value{min-width:64px;text-align:right;font-size:24px}

  .kr5-priority{
    min-height:104px;
    padding:15px 16px;
    grid-template-columns:130px minmax(0,1fr) 132px;
    gap:14px;
  }
  .kr5-priority-main h3{font-size:18px}
  .kr5-priority-main p{font-size:8px}
  .kr5-recheck{min-width:0;padding:9px 10px}

  .kr5-strip{grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
  .kr5-mini{min-height:94px;padding:14px 15px}
  .kr5-mini strong{font-size:20px}
  .kr5-detail>summary{min-height:64px}
}

/* Phone */
@media(max-width:700px){
  body.kresults-v4 .topbar{
    min-height:52px!important;
    height:52px!important;
    padding:7px 12px!important;
    border-bottom:1px solid #dce6df!important;
    display:flex!important;
    align-items:center!important;
  }
  body.kresults-v4 .topbar>div:first-child{
    min-width:0!important;
  }
  body.kresults-v4 #pageEyebrow{
    display:none!important;
  }
  body.kresults-v4 #pageTitle{
    margin:0!important;
    font:600 18px/1 Manrope,"DM Sans",sans-serif!important;
    letter-spacing:-.035em!important;
  }
  body.kresults-v4 .topbar-actions{
    margin-left:auto!important;
    gap:6px!important;
  }
  body.kresults-v4 #komoWorldTopEntry{
    min-height:30px!important;
    padding:0 9px!important;
    font-size:6px!important;
  }
  body.kresults-v4 #refreshButton{
    width:30px!important;
    min-width:30px!important;
    height:30px!important;
  }
  body.kresults-v4 #viewRoot{
    padding-top:0!important;
  }
  .kr5{padding:6px 8px calc(76px + env(safe-area-inset-bottom));gap:7px}
  .kr5-top{min-height:52px;grid-template-columns:minmax(0,1fr) auto;gap:8px}
  .kr5-top h1{font-size:23px}
  .kr5-top p{font-size:8px}
  .kr5-actions{gap:4px}
  .kr5-btn{min-height:30px;padding:0 8px;font-size:6.5px}
  .kr5-actions .blue{display:none}
  .kr5-card{border-radius:16px}
  .kr5-hero{min-height:0;grid-template-columns:1fr}
  .kr5-score-pane{padding:16px}
  .kr5-score strong{font-size:72px}
  .kr5-score span{font-size:10px;margin-bottom:5px}
  .kr5-score-wrap h2{margin-top:14px;font-size:19px}
  .kr5-score-wrap p{font-size:8px}
  .kr5-score-meta{font-size:6.5px}
  .kr5-muscles{padding:10px;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px}
  .kr5-muscles-head{grid-column:1/-1}
  .kr5-lsi{min-height:82px;padding:9px;display:flex;flex-direction:column;align-items:flex-start;gap:7px}
  .kr5-lsi-copy span{font-size:6px}
  .kr5-lsi-copy strong{font-size:9px;white-space:normal}
  .kr5-lsi-value{min-width:0;font-size:21px}
  .kr5-priority{min-height:0;padding:12px;grid-template-columns:1fr auto;gap:8px}
  .kr5-priority-label{grid-column:1/-1}
  .kr5-priority-main h3{font-size:14px}
  .kr5-priority-main p{font-size:7px}
  .kr5-recheck{min-width:106px;padding:8px}
  .kr5-recheck span{font-size:5.5px}
  .kr5-recheck strong{font-size:8px}
  .kr5-strip{gap:5px}
  .kr5-mini{min-height:74px;padding:10px}
  .kr5-mini span{font-size:6px}
  .kr5-mini strong{margin-top:6px;font-size:15px}
  .kr5-mini p{font-size:6px}
  .kr5-detail>summary{min-height:58px;padding:0 12px}
  .kr5-detail-title strong{font-size:10px}
  .kr5-detail-title span{font-size:6.5px}
  .kr5-detail-body{padding:0 6px 6px}
  .kr5-detail-body .kr4-section-head{display:block!important}
  .kr5-detail-body .kr4-section-head p{margin-top:6px!important;text-align:left!important}
  .kr5-detail-body .kr4-grid,.kr5-detail-body .kr4-muscle{grid-template-columns:1fr!important}
  .kr5-detail-body .kr4-row{grid-template-columns:1fr!important}
  .kr5-detail-body .kr4-table{display:block!important;overflow-x:auto!important}
  body.kresults-v4 #komoAssistantRail{width:44px!important;min-width:44px!important;height:44px!important;min-height:44px!important;bottom:76px!important}
}
`;
  document.head.appendChild(s);
}
function topFindings(r){return[...(r?.summary?.priorities||[]),...(r?.summary?.strengths||[])].filter((x,i,a)=>a.findIndex(y=>y.id===x.id)===i).slice(0,3)}
function summaryValues(result){const s=result.score||{},d=s.domain_scores||{};return{score:s.motion_score,symmetry:d.neuromuscular_symmetry,confidence:n(s.confidence)===null?null:Number(s.confidence)*100,completeness:s.completeness}}
function bindRoutes(root=document){root.querySelectorAll?.('[data-route]').forEach(b=>{if(b.dataset.kcanonBound)return;b.dataset.kcanonBound='1';b.addEventListener('click',()=>window.KomoPatientNavigation?.go?.(b.dataset.route)||(location.hash=`#${b.dataset.route}`))})}
function overrideMotionRing(result){const ringItems=[...document.querySelectorAll('[data-my-komo-home] .mykomo-ring-item')];if(ringItems.length<2)return;const item=ringItems[1],v=n(result.score?.motion_score);item.querySelector('.mykomo-ring')?.style.setProperty('--value',String(v??0));const strong=item.querySelector('.mykomo-ring strong');if(strong)strong.innerHTML=v===null?'—':`${Math.round(v)}<small>/100</small>`;const copy=item.querySelector(':scope > small');if(copy)copy.textContent=statusLabel(result.score?.release_status)}
function fourMetrics(v){return`<div class="kcanon-metrics"><div class="kcanon-metric"><small>Motion Score</small><strong>${score(v.score)}/100</strong></div><div class="kcanon-metric"><small>Symétrie</small><strong>${v.symmetry==null?'—':pct(v.symmetry,1)}</strong></div><div class="kcanon-metric"><small>Confiance</small><strong>${pct(v.confidence)}</strong></div><div class="kcanon-metric"><small>Complétude</small><strong>${pct(v.completeness)}</strong></div></div>`}
function findingHtml(f){const t=tone(f.status);return`<div class="kcanon-finding ${t}"><i class="kcanon-dot"></i><div><strong>${esc(f.title)} · ${esc(f.displayValue||'—')}</strong><span>${esc(levelLabel(f.status))} · ${esc(f.patientMessage||'')}</span></div></div>`}
function ensureLegacyStyle(){if(document.querySelector('#kcanonCompatStyle'))return;const s=document.createElement('style');s.id='kcanonCompatStyle';s.textContent=`.kcanon{border:1px solid rgba(255,255,255,.08);background:#0b100d;border-radius:18px;color:#eef2ef}.kcanon-home{margin-top:14px;padding:16px}.kcanon-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.kcanon-kicker{font-size:8px;letter-spacing:.12em;text-transform:uppercase;color:#79877e;font-weight:800}.kcanon-title{margin:4px 0 0;font:600 15px/1.25 Manrope,sans-serif}.kcanon-badge{padding:6px 9px;border-radius:999px;background:rgba(255,255,255,.06);color:#89958d;font-size:8px;font-weight:800;white-space:nowrap}.kcanon-badge.published{background:rgba(125,173,139,.13);color:#9bc0a4}.kcanon-metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:12px}.kcanon-metric{padding:11px;border-radius:14px;background:rgba(255,255,255,.035)}.kcanon-metric small,.kcanon-metric strong{display:block}.kcanon-metric small{font-size:7px;letter-spacing:.08em;color:#7a877e;text-transform:uppercase}.kcanon-metric strong{margin-top:5px;font-size:17px}.kcanon-findings{display:grid;gap:7px;margin-top:11px}.kcanon-finding{display:grid;grid-template-columns:auto 1fr;gap:9px;align-items:start;padding:9px 10px;border-radius:12px;background:rgba(255,255,255,.03)}.kcanon-dot{width:8px;height:8px;border-radius:50%;margin-top:3px;background:#8e9690}.kcanon-finding.good .kcanon-dot{background:#9bc0a4}.kcanon-finding.bad .kcanon-dot{background:#db8c83}.kcanon-finding.watch .kcanon-dot{background:#d7b66f}.kcanon-finding strong,.kcanon-finding span{display:block}.kcanon-finding strong{font-size:9px}.kcanon-finding span{margin-top:2px;font-size:8px;color:#7d8981;line-height:1.35}.kcanon-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:11px}.kcanon-btn{border:1px solid rgba(255,255,255,.1);background:#111712;color:#e0e6e1;border-radius:11px;padding:9px 11px;font:700 9px DM Sans,sans-serif;cursor:pointer}.kcanon-btn.primary{background:#edf2ee;border-color:#edf2ee;color:#1a261d}.kcanon-account,.kcanon-doc{padding:18px;margin-top:14px}.kcanon-account-grid,.kcanon-doc-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:12px}.kcanon-account .hero-score,.kcanon-account .mini,.kcanon-doc-main,.kcanon-doc-side{padding:14px;border-radius:14px;background:rgba(255,255,255,.035)}.kcanon-account small,.kcanon-doc small{display:block;color:#7d8981;font-size:7px;text-transform:uppercase}.kcanon-account strong,.kcanon-doc strong{display:block;margin-top:6px}.kcanon-account .meta{margin-top:10px;font-size:8px;color:#78847c}@media(max-width:700px){.kcanon-metrics,.kcanon-account-grid,.kcanon-doc-grid{grid-template-columns:1fr 1fr}}`;document.head.appendChild(s)}
function renderHome(result){const host=document.querySelector('[data-my-komo-home] .mykomo-score-card');if(!host)return;ensureLegacyStyle();overrideMotionRing(result);host.querySelector('[data-kcanon-home]')?.remove();const s=result.score||{},v=summaryValues(result),box=document.createElement('section');box.dataset.kcanonHome='1';box.className='kcanon kcanon-home';box.innerHTML=`<div class="kcanon-head"><div><div class="kcanon-kicker">KŌMØ · DERNIER BILAN</div><div class="kcanon-title">Votre référence Motion.</div></div><span class="kcanon-badge ${s.release_status==='released'?'published':''}">${esc(statusLabel(s.release_status))}</span></div>${fourMetrics(v)}<div class="kcanon-findings">${topFindings(result.interpretation).map(findingHtml).join('')}</div><div class="kcanon-actions"><button class="kcanon-btn primary" type="button" data-route="results">Voir mes résultats</button><button class="kcanon-btn" type="button" data-route="motion">Ouvrir Motion</button></div>`;host.appendChild(box);bindRoutes(box)}
function renderAccount(result){if(route()!=='profile')return;const grid=document.querySelector('[data-account-hub-v2] .kah-grid');if(!grid)return;ensureLegacyStyle();grid.querySelector('[data-kcanon-account]')?.remove();const s=result.score||{},v=summaryValues(result),box=document.createElement('article');box.dataset.kcanonAccount='1';box.className='kcanon kcanon-account';box.innerHTML=`<div class="kcanon-head"><div><div class="kcanon-kicker">MES RÉSULTATS</div><div class="kcanon-title">Dernier bilan KŌMØ Motion</div></div><span class="kcanon-badge ${s.release_status==='released'?'published':''}">${esc(statusLabel(s.release_status))}</span></div><div class="kcanon-account-grid"><div class="hero-score"><small>Motion Score</small><strong>${score(v.score)}/100</strong></div><div class="mini"><small>Symétrie</small><strong>${v.symmetry==null?'—':pct(v.symmetry,1)}</strong></div><div class="mini"><small>Confiance</small><strong>${pct(v.confidence)}</strong></div><div class="mini"><small>Complétude</small><strong>${pct(v.completeness)}</strong></div></div><div class="meta">Dernier calcul · ${esc(fmtDate(s.calculated_at))}</div><div class="kcanon-actions"><button class="kcanon-btn primary" type="button" data-route="results">Ouvrir tous mes résultats</button><button class="kcanon-btn" type="button" data-komo-export-report>Exporter le PDF</button></div>`;grid.prepend(box);bindRoutes(box)}
function renderDocuments(result){if(route()!=='documents')return;const root=document.querySelector('#viewRoot');if(!root)return;ensureLegacyStyle();root.querySelector('[data-kcanon-doc]')?.remove();const s=result.score||{},v=summaryValues(result),box=document.createElement('section');box.dataset.kcanonDoc='1';box.className='kcanon kcanon-doc';box.innerHTML=`<div class="kcanon-head"><div><div class="kcanon-kicker">DOCUMENTS</div><div class="kcanon-title">Compte-rendu KŌMØ Motion</div></div><span class="kcanon-badge ${s.release_status==='released'?'published':''}">${esc(statusLabel(s.release_status))}</span></div><div class="kcanon-doc-grid"><div class="kcanon-doc-main"><small>MOTION REPORT</small><strong>${score(v.score)}/100</strong></div><div class="kcanon-doc-side"><small>Rapport complet</small><strong>Mêmes mesures que Résultats.</strong></div><div class="kcanon-actions"><button class="kcanon-btn primary" type="button" data-komo-export-report>Générer le PDF</button><button class="kcanon-btn" type="button" data-route="results">Voir les résultats</button></div></div>`;root.prepend(box);bindRoutes(box)}

async function reportPayload(result){if(window.KomoReportPayload?.build)return window.KomoReportPayload.build(result);const mod=await import(`./report-payload-v1.js?v=${REPORT_RELEASE}`);return mod.buildReportPayload(result)}
function findingMap(result){return new Map((result?.interpretation?.findings||[]).map(f=>[f.id,f]))}
function statusChip(status,label=null){const t=tone(status);return `<span class="kr4-status ${t}">${esc(label||levelLabel(status)||'Descriptif')}</span>`}
function qcChip(qc){const t=qcTone(qc);return `<span class="kr4-status ${t}">${esc(qcLabel(qc))}</span>`}
function resultStatusForId(findings,id){return findings.get(id)?.status||'descriptive'}
function metricSignal(label,value,sub,status='descriptive'){const t=tone(status);return `<article class="kr4-signal ${t}"><div class="kr4-signal-top"><div><span>${esc(label)}</span><strong>${esc(value)}</strong></div>${statusChip(status)}</div><p>${esc(sub||'')}</p></article>`}

function motionHero(result,payload,findings){const s=payload.summary||{},fn=payload.function||{},sensor=payload.sensor||{},context=payload.context||{},heroFinding=findings.get('neuromuscular_symmetry'),heroStatus=heroFinding?.status||'descriptive';const wording=heroFinding?.patientMessage||s.sentence||'Votre bilan Motion constitue votre référence instrumentée.';return `<article class="kr4-card kr4-hero"><div class="kr4-hero-main"><div><div class="kr4-hero-top"><div><div class="kr4-kicker">RÉSULTAT MOTION</div><div class="kr4-score">${score(s.score)}<small>/100</small></div></div>${statusChip(heroStatus,statusLabel(s.releaseStatus))}</div><div class="kr4-headline"><h2>${esc(heroFinding?.status==='favorable'?'Votre mouvement est dans une zone favorable.':heroFinding?.status==='priority'?'Une priorité ressort clairement.':heroFinding?.status==='watch'?'Un point mérite votre attention.':'Votre référence Motion.')}</h2><p>${esc(wording)}</p></div></div><div class="kr4-actions"><button class="kr4-btn primary" type="button" data-komo-export-report>Télécharger mon rapport PDF</button><button class="kr4-btn" type="button" data-scroll-clinical>Voir l’analyse Clinical</button></div></div><aside class="kr4-hero-side"><div class="kr4-stat"><span>Symétrie</span><strong>${pct(s.symmetry,1)}</strong><small>LSI neuromusculaire</small></div><div class="kr4-stat"><span>Confiance</span><strong>${pct(s.confidence)}</strong><small>Qualité du calcul</small></div><div class="kr4-stat"><span>Marqueurs</span><strong>${sensor.totalMetricCount??0}</strong><small>Mesures Myodev conservées</small></div><div class="kr4-stat"><span>Fonction</span><strong>${fn.availableCount??0}/${fn.totalCount??7}</strong><small>Tests documentés</small></div><div class="kr4-stat"><span>Marche</span><strong>${sensor.gait?.scalarCountPresent??0}/${sensor.gait?.scalarCountExpected??15}</strong><small>Valeurs spatio-temporelles</small></div><div class="kr4-stat"><span>Questionnaires</span><strong>${context.completedQuestionnaireCount??0}/${context.questionnaireCount??0}</strong><small>Questionnaires complétés</small></div></aside></article>`}

function summarySection(result,payload,findings){const strength=result?.interpretation?.summary?.strengths||[],priority=result?.interpretation?.summary?.priorities||[],items=[...priority,...strength].filter((x,i,a)=>a.findIndex(y=>y.id===x.id)===i);return `<article class="kr4-card kr4-section"><div class="kr4-section-head"><div><div class="kr4-kicker">EN UN REGARD</div><h3>Ce qu’il faut comprendre.</h3></div><p>Vert : zone favorable selon une référence explicite. Rouge : priorité. Ambre : à surveiller. Gris : mesure descriptive sans seuil appliqué.</p></div><div class="kr4-grid">${items.length?items.slice(0,6).map(f=>metricSignal(f.title,f.displayValue||'—',f.patientMessage||f.referenceLabel||'',f.status)).join(''):'<div class="kr4-empty">Aucun signal interprétable publié pour ce bilan.</div>'}</div></article>`}

function functionalSection(payload){const tests=payload.function?.tests||[];return `<article class="kr4-card kr4-section"><div class="kr4-section-head"><div><div class="kr4-kicker">RÉSULTATS FONCTIONNELS</div><h3>Fonction, autonomie et performance.</h3></div><p>Les sept tests du Motion Report sont restitués ici avec source, qualité et date. Ils documentent votre fonction sans modifier le Motion Score sensor-only.</p></div>${tests.length?`<div class="kr4-rowlist">${tests.map(r=>{const t=r.available?qcTone(r.qcStatus):'neutral';const val=r.available?(typeof r.value==='number'?display(r.value,r.unit||'',r.code==='M-FUN-03'||r.code==='M-FUN-05'?2:1):`${valueText(r.value)}${r.unit?` ${r.unit}`:''}`):'Non recueilli';return `<article class="kr4-row ${t}"><div><strong>${esc(r.label)}</strong><small>${esc(r.code)} · ${esc(fmtDate(r.recordedAt))}</small></div><div class="kr4-value">${esc(val)}</div><div class="kr4-source">${esc(r.source||'—')}<br><small>Contexte fonctionnel · hors calcul du Motion Score</small></div>${r.available?qcChip(r.qcStatus):statusChip('descriptive','Non recueilli')}</article>`}).join('')}</div>`:'<div class="kr4-empty">Aucun résultat fonctionnel enregistré.</div>'}</article>`}

function muscleSection(payload,findings){const muscle=payload.muscle||{},activation=new Map((payload.sensor?.activation||[]).map(x=>[x.muscle,x]));const lsi=payload.sensor?.lsi||[];const idFor={VM:'lsi_vl',VL:'lsi_vl',BF:'lsi_bf',GM:'lsi_gm'};const cards=lsi.map(m=>{const a=activation.get(m.muscle)||{},status=resultStatusForId(findings,idFor[m.muscle]||`lsi_${String(m.muscle||'').toLowerCase()}`),t=tone(status);return `<article class="kr4-muscle-card ${t}"><div class="kr4-signal-top"><div><div class="kr4-kicker">${esc(m.label||m.muscle)}</div><span class="kr4-muscle-value">${display(m.value,'%',1)}</span></div>${statusChip(status)}</div><div class="kr4-pair"><div><span>Activation G</span><strong>${display(a.left,'%MVC',1)}</strong></div><div><span>Activation D</span><strong>${display(a.right,'%MVC',1)}</strong></div></div></article>`}).join('');return `<article class="kr4-card kr4-section"><div class="kr4-section-head"><div><div class="kr4-kicker">MUSCLE</div><h3>Symétrie et recrutement neuromusculaire.</h3></div><p>Les LSI sont les seules mesures qui alimentent numériquement le Motion Score v0.6. Activation, coactivation et fatigabilité restent descriptives.</p></div><div class="kr4-muscle">${cards||'<div class="kr4-empty">Analyse musculaire en attente.</div>'}</div><div class="kr4-grid" style="margin-top:8px">${metricSignal('Activation moyenne',display(muscle.activationMean,'%MVC',1),'Recrutement moyen des canaux valides.')}${metricSignal('Coactivation CCI',display(muscle.coactivationMean,'%',1),'Mesure descriptive lorsqu’elle est disponible.')}${metricSignal('Fatigabilité',display(muscle.fatigabilityMean,'%',1),'Comparaison avec protocole identique.')}${metricSignal('QC capteurs',`${muscle.validCount??0} valides`,`${muscle.suspectCount??0} suspectes · ${muscle.invalidCount??0} invalides`,muscle.invalidCount?'priority':muscle.suspectCount?'watch':'favorable')}${metricSignal('Calibration',String(muscle.calibrationCount??0),'Références/calibrations conservées dans le dossier.')}</div></article>`}

function gaitSection(payload,findings){const gait=payload.sensor?.gait||{},globals=gait.globals||[],bilateral=gait.bilateral||[];return `<article class="kr4-card kr4-section"><div class="kr4-section-head"><div><div class="kr4-kicker">MARCHE</div><h3>Profil spatio-temporel complet.</h3></div><p>${gait.scalarCountPresent??0}/${gait.scalarCountExpected??15} valeurs disponibles. Les paramètres sans norme KŌMØ validée restent volontairement descriptifs.</p></div><div class="kr4-grid">${globals.map(g=>metricSignal(g.label,display(g.value,g.unit||'',g.unit==='pas/min'?0:2),findings.get(g.id)?.patientMessage||'Mesure Myodev descriptive ; utile surtout dans le suivi longitudinal.',resultStatusForId(findings,g.id))).join('')}</div>${bilateral.length?`<table class="kr4-table"><thead><tr><th>Paramètre</th><th>Gauche</th><th>Droite</th><th>Unité</th><th>Statut</th></tr></thead><tbody>${bilateral.map(r=>`<tr><td><strong>${esc(r.label)}</strong></td><td>${esc(display(r.left,'',3))}</td><td>${esc(display(r.right,'',3))}</td><td>${esc(r.unit||'—')}</td><td>${statusChip('descriptive','Descriptif')}</td></tr>`).join('')}</tbody></table>`:''}</article>`}

function postureSection(payload){const p=payload.posture||{};return `<article class="kr4-card kr4-section"><div class="kr4-section-head"><div><div class="kr4-kicker">POSTURE</div><h3>Alignement documenté.</h3></div><p>La posture est tracée dans le rapport mais reste séparée du calcul du Motion Score.</p></div>${p.available?`<div class="kr4-grid">${metricSignal('SVA',display(p.svaMm,p.unit||'mm',1),`${p.source||'Source enregistrée'} · ${fmtDate(p.recordedAt)}`,'descriptive')}${metricSignal('Qualité',qcLabel(p.qcStatus),p.protocolVersion||'Protocole enregistré',p.qcStatus==='valid'?'favorable':p.qcStatus==='suspect'?'watch':p.qcStatus==='invalid'?'priority':'descriptive')}</div>`:'<div class="kr4-empty">Aucune mesure posturale publiée dans ce bilan.</div>'}</article>`}

function questionnaireStatus(q){const s=String(q.scoreStatus||'').toLowerCase();if(['favorable','normal','low_risk','within_range'].includes(s))return'favorable';if(['watch','at_risk','borderline'].includes(s))return'watch';if(['priority','high_risk','abnormal'].includes(s))return'priority';return'descriptive'}
function questionnaireSection(payload){const qs=payload.context?.questionnaires||[],responses=payload.appendix?.questionnaireResponses||[];const grouped=new Map();for(const r of responses){const k=r.instrumentCode||r.instrumentLabel||'Questionnaire';if(!grouped.has(k))grouped.set(k,[]);grouped.get(k).push(r)}return `<article class="kr4-card kr4-section"><div class="kr4-section-head"><div><div class="kr4-kicker">QUESTIONNAIRES</div><h3>Votre contexte, question par question.</h3></div><p>${payload.context?.completedQuestionnaireCount??0}/${payload.context?.questionnaireCount??0} questionnaires complétés. Les réponses sont restituées intégralement, sans contribution au Motion Score.</p></div><div class="kr4-questionnaires">${qs.length?qs.map(q=>{const rs=grouped.get(q.instrumentCode)||[],status=questionnaireStatus(q);return `<details class="kr4-q"><summary><div><strong>${esc(q.label||q.instrumentCode)}</strong><span>${esc(q.instrumentCode||'')} · ${q.responseCount??rs.length} réponses</span></div><div>${q.score!==null&&q.score!==undefined?`Score ${esc(valueText(q.score))}`:`${Math.round(n(q.completeness)||0)} % complété`}</div>${statusChip(status)}</summary><div class="kr4-q-body">${rs.length?rs.map(r=>`<div class="kr4-response"><strong>${esc(r.itemCode||'Question')}</strong><div><small>Réponse</small><br>${esc(valueText(r.rawValue??r.rawText))}</div><div><small>Normalisé</small><br>${esc(valueText(r.normalizedValue??r.normalizedText))}</div></div>`).join(''):'<div class="kr4-empty">Aucune réponse détaillée disponible.</div>'}</div></details>`}).join(''):'<div class="kr4-empty">Aucun questionnaire associé à ce bilan.</div>'}</div></article>`}

function prioritiesSection(payload){const rows=payload.priorities||[];if(!rows.length)return'';return `<article class="kr4-card kr4-section"><div class="kr4-section-head"><div><div class="kr4-kicker">AGIR</div><h3>Ce que vos résultats suggèrent de travailler.</h3></div><p>Ces priorités reprennent le Motion Report et restent à adapter au contexte individuel.</p></div><div class="kr4-grid">${rows.map(p=>`<article class="kr4-signal"><div class="kr4-kicker">PRIORITÉ ${p.rank??''}</div><strong>${esc(p.title||p.domain||'Priorité')}</strong><p>${esc((p.actions||[]).join(' · ')||p.firstAction||'À définir avec votre professionnel.')}</p><em>Recontrôle : ${esc(p.recheck||'à définir')}</em></article>`).join('')}</div></article>`}

function technicalSections(payload){lazyStores=new Map();const sensor=payload.appendix?.sensorMetrics||[],measurements=payload.appendix?.measurements||[];lazyStores.set('sensor',sensor);lazyStores.set('measurements',measurements);const sensorDetail=`<details class="kr4-details" data-lazy-key="sensor"><summary><div><div class="kr4-kicker">ANNEXE TECHNIQUE</div><strong>Données Myodev · ${sensor.length} marqueurs</strong></div><span>Afficher toutes les mesures →</span></summary><div class="kr4-detail-body"><div class="kr4-lazy-empty">Ouvrez cette section pour charger le détail.</div></div></details>`;const measurementDetail=`<details class="kr4-details" data-lazy-key="measurements"><summary><div><div class="kr4-kicker">ANNEXE TECHNIQUE</div><strong>Mesures fonctionnelles & cliniques · ${measurements.length}</strong></div><span>Afficher les sources →</span></summary><div class="kr4-detail-body"><div class="kr4-lazy-empty">Ouvrez cette section pour charger le détail.</div></div></details>`;return `<article class="kr4-card kr4-section"><div class="kr4-section-head"><div><div class="kr4-kicker">TOUTES LES MESURES</div><h3>Le dossier complet, jusqu’au marqueur brut.</h3></div><p>Le même contenu technique que le PDF, chargé à la demande pour garder Pulse rapide sur mobile.</p></div><div style="display:grid;gap:8px">${sensorDetail}${measurementDetail}</div><p class="kr4-note">Un marqueur valide indique que la mesure est exploitable techniquement. Cela ne signifie pas automatiquement qu’elle est physiologiquement favorable.</p></article>`}

function provenanceSection(payload){const s=payload.sensor||{},p=payload.provenance||{},id=payload.identity||{};const pairs=[['Algorithme',id.algorithmVersion],['Référence',id.referenceVersion],['Fichier source',s.sourceFile],['Version source',s.sourceVersion],['Import',fmtDateTime(s.importedAt)],['Publié',fmtDateTime(p.scoreReleasedAt)],['Assessment',id.assessmentId],['Score ID',id.scoreId]];return `<article class="kr4-card kr4-section"><details class="kr4-details"><summary><div><div class="kr4-kicker">QUALITÉ & PROVENANCE</div><strong>Traçabilité du résultat</strong></div><span>Voir le détail →</span></summary><div class="kr4-detail-body"><div class="kr4-rowlist">${pairs.map(([k,v])=>`<div class="kr4-row"><strong>${esc(k)}</strong><div class="kr4-source" style="grid-column:2/-1">${esc(v||'—')}</div></div>`).join('')}</div></div></details></article>`}

async function loadClinical(client,patientId){if(!patientId)return{assessments:[],scores:[],reports:[]};const a=await client.from('assessments').select('id,status,created_at').eq('patient_id',patientId).eq('product_mode','clinical').order('created_at',{ascending:false}).limit(8);if(a.error||!(a.data||[]).length)return{assessments:[],scores:[],reports:[]};const ids=a.data.map(x=>x.id);const [sq,rq]=await Promise.all([client.from('scores').select('assessment_id,motion_score,domain_scores,release_status,calculated_at,released_at').in('assessment_id',ids).eq('release_status','released').order('calculated_at',{ascending:false}),client.from('reports').select('assessment_id,version,report_type,status,content_manifest,released_at').in('assessment_id',ids).eq('status','released').order('released_at',{ascending:false})]);return{assessments:a.data||[],scores:sq.error?[]:sq.data||[],reports:rq.error?[]:rq.data||[]}}
function clinicalManifestText(m){if(!m||typeof m!=='object')return'';const candidates=[m.medical_conclusion,m.medicalConclusion,m.conclusion,m.summary,m.patient_summary,m.patientSummary,m.title].filter(x=>typeof x==='string'&&x.trim());return candidates[0]||''}
function clinicalSection(clinical){const scores=clinical?.scores||[],reports=clinical?.reports||[];const has=scores.length||reports.length;return `<article class="kr4-card kr4-clinical" id="clinicalResults"><div class="kr4-clinical-hero"><div><div class="kr4-kicker">RÉSULTAT CLINICAL</div><h2>Clinical, lorsque nécessaire.</h2><p>L’interprétation médicale reste distincte du Motion Score. Seuls les éléments Clinical effectivement publiés apparaissent ici.</p></div>${has?statusChip('favorable','Publié'):statusChip('descriptive','Aucun résultat publié')}</div><div class="kr4-clinical-list">${has?[...reports.map(r=>`<article class="kr4-clinical-card"><div class="kr4-kicker">${esc(r.report_type||'CLINICAL REPORT')} · V${esc(r.version??'—')}</div><strong>${esc(clinicalManifestText(r.content_manifest)||'Compte-rendu Clinical publié')}</strong><p>Publié le ${esc(fmtDate(r.released_at))}. Le détail médical reste celui du compte-rendu validé.</p></article>`),...scores.map(s=>`<article class="kr4-clinical-card"><div class="kr4-kicker">CLINICAL · SCORE PUBLIÉ</div><strong>${s.motion_score!==null&&s.motion_score!==undefined?`${score(s.motion_score)}/100`:'Résultat publié'}</strong><p>${esc(fmtDate(s.released_at||s.calculated_at))}</p></article>`)].join(''):'<div class="kr4-empty">Aucun résultat Clinical publié pour le moment. Cette absence ne modifie pas votre résultat Motion.</div>'}</div></article>`}

function lazySensorRows(rows){if(!rows.length)return'<div class="kr4-empty">Aucun marqueur capteur disponible.</div>';return rows.map(r=>`<div class="kr4-tech-row"><div><strong>${esc(r.metricCode||'Mesure')}</strong><small>${esc(r.taskCode||'—')}</small></div><div><strong>${esc(display(r.value,r.unit||'',2))}</strong><small>${esc(sideLabel(r.side))}</small></div><div>${esc(r.muscleLabel||r.muscleCode||'Global')}<br><small>${esc(r.phaseWindow||'')}</small></div><div>${qcChip(r.qcStatus)}</div><div><small>${esc(fmtDate(r.recordedAt))}</small></div></div>`).join('')}
function lazyMeasurementRows(rows){if(!rows.length)return'<div class="kr4-empty">Aucune mesure complémentaire disponible.</div>';return rows.map(r=>`<div class="kr4-tech-row"><div><strong>${esc(r.indicatorCode||'Mesure')}</strong><small>${esc(r.taskCode||'')}</small></div><div><strong>${esc(valueText(r.numericValue??r.textValue??r.rawText))}</strong><small>${esc(r.unit||'')}</small></div><div>${esc(r.source||'—')}<br><small>${esc(r.protocolVersion||'')}</small></div><div>${qcChip(r.qcStatus)}</div><div><small>${esc(fmtDate(r.recordedAt))}</small></div></div>`).join('')}
function bindResults(root){root.querySelector('[data-scroll-clinical]')?.addEventListener('click',()=>root.querySelector('#clinicalResults')?.scrollIntoView({behavior:'smooth',block:'start'}));root.querySelectorAll('details[data-lazy-key]').forEach(d=>d.addEventListener('toggle',()=>{if(!d.open||d.dataset.loaded)return;d.dataset.loaded='1';const key=d.dataset.lazyKey,rows=lazyStores.get(key)||[],body=d.querySelector('.kr4-detail-body');if(body)body.innerHTML=key==='sensor'?lazySensorRows(rows):lazyMeasurementRows(rows)}));bindRoutes(root)}


function kr5Lsi(payload,keys,label){
  const rows=payload?.sensor?.lsi||[];
  const keyset=new Set(keys.map(x=>String(x).toUpperCase()));
  const row=rows.find(x=>keyset.has(String(x?.muscle||'').toUpperCase())||keys.some(k=>String(x?.label||'').toLowerCase().includes(String(k).toLowerCase())));
  return {value:n(row?.value),label:row?.label||label,muscle:row?.muscle||''};
}
function kr5ToneForLsi(v){
  if(v===null)return'';
  if(v<85)return'priority';
  if(v<90)return'watch';
  return'';
}
function kr5Priority(payload,result){
  const p=(payload?.priorities||[])[0]||result?.interpretation?.summary?.priorities?.[0]||null;
  return {
    title:p?.title||p?.domain||'Poursuivre votre progression locomotrice',
    recheck:p?.recheck||'6–8 semaines',
    copy:(p?.actions||[]).join(' · ')||p?.firstAction||p?.patientMessage||'Votre trajectoire transforme ce résultat en prochaines actions.'
  };
}
function kr5HeroStatus(result){
  const f=(result?.interpretation?.summary?.priorities||[])[0];
  if(f?.status==='priority')return['priority','Priorité identifiée'];
  if(f?.status==='watch')return['watch','À surveiller'];
  return['','Bilan publié'];
}
function kr5LsiCard(item,fallbackLabel){
  const tone=kr5ToneForLsi(item.value);
  return `<article class="kr5-lsi ${tone}"><div class="kr5-lsi-copy"><span>SYMETRIE LSI</span><strong>${esc(fallbackLabel)}</strong></div><div class="kr5-lsi-value">${item.value===null?'—':Math.round(item.value)+' %'}</div></article>`;
}
function kr5Overview(result,payload){
  const s=payload.summary||{};
  const quad=kr5Lsi(payload,['VM','VL','quadriceps'],'Quadriceps');
  const ham=kr5Lsi(payload,['BF','ischio','hamstring'],'Ischio-jambiers');
  const calf=kr5Lsi(payload,['GM','gastro','mollet','calf'],'Mollets');
  const priority=kr5Priority(payload,result);
  const [chipTone,chipLabel]=kr5HeroStatus(result);
  const heroFinding=(result?.interpretation?.findings||[]).find(x=>x.id==='neuromuscular_symmetry');
  const headline=heroFinding?.status==='priority'?'Une priorité claire ressort de votre bilan.':heroFinding?.status==='watch'?'Votre bilan est solide avec un point à surveiller.':'Votre mouvement constitue une base solide.';
  const copy=heroFinding?.patientMessage||s.sentence||'Votre Motion Score synthétise vos mesures instrumentées et sert de référence pour suivre votre évolution.';
  const released=s.releaseStatus||result?.score?.release_status;
  const calculated=result?.score?.calculated_at||payload?.provenance?.scoreReleasedAt;
  return `
    <header class="kr5-top">
      <div>
        <p class="kr5-eyebrow">KŌMØ PULSE · RÉSULTATS</p>
        <h1>Votre bilan Motion.</h1>
        <p>Votre état actuel, les points qui comptent et la prochaine étape.</p>
      </div>
      <div class="kr5-actions">
        <button class="kr5-btn primary" type="button" data-komo-export-report>Rapport PDF</button>
        <button class="kr5-btn blue" type="button" data-route="path">Ma trajectoire</button>
      </div>
    </header>
    <article class="kr5-card kr5-hero">
      <section class="kr5-score-pane">
        <div class="kr5-score-head">
          <p class="kr5-eyebrow">MOTION SCORE</p>
          <span class="kr5-chip ${chipTone}">${esc(chipLabel)}</span>
        </div>
        <div class="kr5-score-wrap">
          <div class="kr5-score"><strong>${score(s.score)}</strong><span>/100</span></div>
          <h2>${esc(headline)}</h2>
          <p>${esc(copy)}</p>
        </div>
        <div class="kr5-score-meta">
          <span>Dernier bilan · ${esc(fmtDate(calculated))}</span>
          <span>${esc(statusLabel(released))}</span>
        </div>
      </section>
      <aside class="kr5-muscles">
        <div class="kr5-muscles-head"><strong>Symétrie musculaire</strong><span>LSI · gauche / droite</span></div>
        ${kr5LsiCard(quad,'Quadriceps')}
        ${kr5LsiCard(ham,'Ischio-jambiers')}
        ${kr5LsiCard(calf,'Mollets')}
      </aside>
    </article>
    <article class="kr5-card kr5-priority">
      <div class="kr5-priority-label">
        <p class="kr5-eyebrow">PRIORITÉ ACTUELLE</p>
        <strong>Ce que KŌMØ vous recommande de travailler maintenant.</strong>
      </div>
      <div class="kr5-priority-main">
        <h3>${esc(priority.title)}</h3>
        <p>${esc(priority.copy)}</p>
      </div>
      <div class="kr5-recheck"><span>PROCHAIN RECHECK</span><strong>${esc(priority.recheck)}</strong></div>
    </article>
    <section class="kr5-strip">
      <article class="kr5-card kr5-mini"><span>SYMETRIE GLOBALE</span><strong>${pct(s.symmetry,1)}</strong><p>Indice neuromusculaire global.</p></article>
      <article class="kr5-card kr5-mini"><span>CONFIANCE</span><strong>${pct(s.confidence)}</strong><p>Qualité du calcul instrumenté.</p></article>
      <article class="kr5-card kr5-mini"><span>DONNÉES CAPTEURS</span><strong>${payload?.sensor?.totalMetricCount??0}</strong><p>Marqueurs conservés dans votre bilan.</p></article>
    </section>
  `;
}
function kr5Details(result,payload,findings,clinical){
  return `<details class="kr5-card kr5-detail">
    <summary>
      <div class="kr5-detail-title"><strong>Voir le détail du bilan</strong><span>Muscle, fonction, marche, posture, questionnaires, Clinical et traçabilité.</span></div>
      <span class="kr5-detail-arrow">+</span>
    </summary>
    <div class="kr5-detail-body">
      ${summarySection(result,payload,findings)}
      ${muscleSection(payload,findings)}
      ${functionalSection(payload)}
      ${gaitSection(payload,findings)}
      ${postureSection(payload)}
      ${questionnaireSection(payload)}
      ${technicalSections(payload)}
      ${provenanceSection(payload)}
      ${clinicalSection(clinical)}
    </div>
  </details>`;
}

async function renderResults(result){
  if(route()!=='results')return;
  const root=document.querySelector('#viewRoot');
  if(!root)return;
  installStyle();
  document.body.classList.remove('kresults-v2');
  document.body.classList.add('kresults-v4');
  const pe=document.querySelector('#pageEyebrow'),pt=document.querySelector('#pageTitle');
  if(pe)pe.textContent='KŌMØ PULSE · RÉSULTATS';
  if(pt)pt.textContent='Vos résultats.';
  let payload;
  try{payload=await reportPayload(result)}
  catch(e){
    console.error('[results-v5-payload]',e);
    root.innerHTML='<section class="kr5"><div class="kr5-card kr5-mini"><strong>Votre rapport est momentanément indisponible.</strong><p>Réessayez dans quelques instants.</p></div></section>';
    return;
  }
  if(route()!=='results')return;
  const client=getCanonicalClient();
  const clinical=await loadClinical(client,result.patientId).catch(()=>({assessments:[],scores:[],reports:[]}));
  if(route()!=='results')return;
  const findings=findingMap(result);
  root.innerHTML=`<section class="kr5" data-kresults-v4 data-kresults-v5 data-motion-report-payload="${esc(payload.schemaVersion||'')}">${kr5Overview(result,payload)}${kr5Details(result,payload,findings,clinical)}</section>`;
  bindResults(root);
}

async function render(force=false){try{const result=await loadCanonicalResult({force});renderHome(result);renderAccount(result);renderDocuments(result);await renderResults(result)}catch(e){console.error('[patient-canonical-results]',e);if(route()==='results'){installStyle();const root=document.querySelector('#viewRoot');if(root){root.innerHTML='<section class="kr5"><header class="kr5-top"><div><p class="kr5-eyebrow">KŌMØ PULSE · RÉSULTATS</p><h1>Votre bilan Motion.</h1><p>Votre prochain résultat apparaîtra ici après publication de votre bilan.</p></div></header><article class="kr5-card kr5-priority"><div class="kr5-priority-label"><p class="kr5-eyebrow">PROCHAINE ÉTAPE</p><strong>Aucun bilan publié pour le moment.</strong></div><div class="kr5-priority-main"><h3>Planifiez votre prochain rendez-vous KŌMØ.</h3><p>Une fois le bilan validé, votre Motion Score, vos priorités et votre rapport apparaîtront ici.</p></div><button class="kr5-btn primary" type="button" data-route="documents">Prendre rendez-vous</button></article></section>';bindRoutes(root)}}}}
function schedule(force=false){clearTimeout(timer);timer=setTimeout(()=>render(force),80)}
function cleanup(){if(route()!=='results')document.body.classList.remove('kresults-v4')}
window.addEventListener('hashchange',()=>{cleanup();schedule(false)});window.addEventListener('komo:route-ready',()=>schedule(false));window.addEventListener('komo:data-ready',()=>schedule(true));window.addEventListener('komo:canonical-result-invalidated',()=>schedule(true));window.addEventListener('komo:motion-v06-calculated',()=>schedule(true));document.addEventListener('DOMContentLoaded',()=>schedule(false));setTimeout(()=>schedule(false),360);window.KomoCanonicalResults={version:VERSION,refresh:()=>render(true)};
