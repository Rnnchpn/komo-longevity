import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const pulse=path.join(process.cwd(),'site','pulse-v12');
const bookingPath=path.join(pulse,'booking-layer-v1.js');
const centerPath=path.join(pulse,'center-two-tab-workspace-v1.js');
const htmlPath=path.join(pulse,'index.html');
for(const file of [bookingPath,centerPath,htmlPath])if(!fs.existsSync(file))throw new Error('[consultation-flow-final] missing '+file);

let booking=fs.readFileSync(bookingPath,'utf8');
let center=fs.readFileSync(centerPath,'utf8');
let html=fs.readFileSync(htmlPath,'utf8');

const replace=(src,from,to,label)=>{
  if(!src.includes(from))throw new Error('[consultation-flow-final] marker missing: '+label);
  return src.replace(from,to);
};

booking=replace(
  booking,
  "function assignedLabel(x){if(x.appointment_status==='completed')return'Voir mes résultats';if(!x.assessment_id)return'Pré-bilan en préparation';if(x.pre_bilan_complete)return'Relire mon pré-bilan';if(Number(x.pre_bilan_percent||0)>0)return'Reprendre mon pré-bilan';return'Commencer mon bilan Motion'}",
  "function assignedLabel(x){if(x.appointment_status==='completed')return'Voir mes résultats';if(!x.assessment_id)return'Consultation en préparation';if(x.pre_bilan_complete)return'Relire mes questionnaires';if(Number(x.pre_bilan_percent||0)>0)return'Reprendre consultation Motion';return'Débuter consultation Motion'}",
  'patient primary CTA'
);

const oldAssignedCard="function assignedCard(x,current){const pct=Math.max(0,Math.min(100,Number(x.pre_bilan_percent||0))),done=x.appointment_status==='completed';return`<article><div><span>${x.appointment_id===current?'PROCHAINE CONSULTATION':'CONSULTATION MOTION'}</span><strong>${esc(x.organization_name||'Centre KŌMØ')}</strong><small>${esc(fullDate(x.scheduled_start,x.timezone||'Europe/Paris'))}</small><small>${esc(apptStatus(x.appointment_status))}</small></div><div><b>Pré-bilan · ${x.pre_bilan_complete?'Complet':pct+'%'}</b><small>${Number(x.completed_sections||0)}/${Number(x.total_sections||6)} sections</small><button type=\"button\" ${done?'data-route=\"results\"':`data-kbook-assessment=\"${esc(x.assessment_id||'')}\"`} ${!done&&!x.assessment_id?'disabled':''}>${esc(assignedLabel(x))}</button></div></article>`}";
const newAssignedCard="function questionnairePreview(){return`<div class=\"kbook-qpreview\" aria-label=\"Questionnaires Motion à remplir\"><span>Profil & sécurité</span><span>GLFS-25</span><span>Sommeil & récupération</span><span>Bien-être</span><span>Mode de vie</span><span>Antécédents</span></div>`}\nfunction assignedCard(x,current){const pct=Math.max(0,Math.min(100,Number(x.pre_bilan_percent||0))),done=x.appointment_status==='completed';return`<article class=\"kbook-motion-card\"><div><span>${x.appointment_id===current?'CONSULTATION ATTRIBUÉE':'CONSULTATION MOTION'}</span><strong>${esc(x.organization_name||'Centre KŌMØ')}</strong><small>${esc(fullDate(x.scheduled_start,x.timezone||'Europe/Paris'))}</small><small>${esc(apptStatus(x.appointment_status))}</small>${!done?questionnairePreview():''}</div><div><b>Questionnaires · ${x.pre_bilan_complete?'Complets':pct+'%'}</b><small>${Number(x.completed_sections||0)}/${Number(x.total_sections||6)} sections complétées</small><button class=\"kbook-start-motion\" type=\"button\" ${done?'data-route=\"results\"':`data-kbook-assessment=\"${esc(x.assessment_id||'')}\"`} ${!done&&!x.assessment_id?'disabled':''}>${esc(assignedLabel(x))}</button></div></article>`}";
booking=replace(booking,oldAssignedCard,newAssignedCard,'patient questionnaire preview');

booking=replace(
  booking,
  "<h2>Votre consultation Motion.</h2><p>Votre centre attribue la consultation. Vous commencez ensuite votre pré-bilan dans Pulse avant les mesures.</p>",
  "<h2>Votre consultation Motion est prête.</h2><p>Votre centre vous a attribué la consultation. Débutez maintenant les questionnaires Motion ; vos réponses seront enregistrées au fur et à mesure avant les mesures Myodev.</p>",
  'patient hero copy'
);

center=replace(center,"document.querySelector('#pageTitle').textContent='Consultations Motion'","document.querySelector('#pageTitle').textContent='Myodev'",'centre page title');
center=replace(center,"<p class=\"eyebrow\">KŌMØ PULSE · CONSULTATION</p><h2>De l’attribution au bilan.</h2><p>Attribuez la consultation, vérifiez le pré-bilan puis réalisez les mesures Motion. Pas de carte, pas d’agenda.</p>","<p class=\"eyebrow\">KŌMØ CENTRE · MYODEV</p><h2>Attribuer une consultation Motion.</h2><p>Choisissez un patient, attribuez sa consultation, puis retrouvez son pré-bilan avant la réalisation des mesures Myodev.</p>",'centre hero');
center=center.replaceAll('Attribuer une consultation</button>','Attribuer consultation</button>');
center=center.replaceAll('Attribuer une consultation</h2>','Attribuer une consultation Motion</h2>');
center=center.replaceAll('Nouvelle consultation Motion','Attribuer une consultation Motion');

// Keep the patient list search usable while the list re-renders. Historical
// Centre layers used to steal focus/clicks; after pruning them, this preserves
// the search caret across the canonical owner's own render.
const oldBind="function bindPatients(){document.querySelector('#k2twSearch')?.addEventListener('input',e=>{S.search=e.target.value;renderPatients()});document.querySelector('#k2twAssignGlobal')?.addEventListener('click',()=>openAssign());";
const newBind="function bindPatients(){document.querySelector('#k2twSearch')?.addEventListener('input',e=>{const pos=e.target.selectionStart??e.target.value.length;S.search=e.target.value;renderPatients();requestAnimationFrame(()=>{const n=document.querySelector('#k2twSearch');if(n){n.focus();try{n.setSelectionRange(pos,pos)}catch{}}})});document.querySelector('#k2twAssignGlobal')?.addEventListener('click',()=>openAssign());";
center=replace(center,oldBind,newBind,'centre patient search focus');

if(!html.includes('id="kpMotionConsultationFinalV1"')){
  html=html.replace('</head>',`<style id="kpMotionConsultationFinalV1">
  /* Patient consultation */
  #viewRoot .kbook-qpreview{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin-top:14px;max-width:620px}
  #viewRoot .kbook-qpreview span{display:flex;align-items:center;min-height:34px;padding:7px 9px;border:1px solid rgba(255,255,255,.10);border-radius:10px;background:#0d120f;color:#aeb8b1;font-size:10px;line-height:1.2}
  #viewRoot .kbook-motion-card{border-color:rgba(143,179,154,.22)!important;background:#0a0e0b!important}
  #viewRoot .kbook-start-motion{min-height:44px;padding:0 16px;border:0;border-radius:12px;background:#8fb39a;color:#102017;font:inherit;font-weight:700;cursor:pointer}
  #viewRoot .kbook-start-motion:hover{filter:brightness(1.05)}
  #viewRoot .kbook-start-motion:disabled{opacity:.42;cursor:not-allowed}

  /* Definitive Myodev owner. The Clinical shell stays dark, but the working
     surface is warm and readable. These rules intentionally outrank the old
     global .kcp dark-theme inheritance without adding another runtime owner. */
  body.komo-pro-mode #kcpView .k2tw-patients{color:#243129!important;background:transparent!important}
  body.komo-pro-mode #kcpView .k2tw-head,
  body.komo-pro-mode #kcpView .k2tw-kpi,
  body.komo-pro-mode #kcpView .k2tw-row,
  body.komo-pro-mode #kcpView .k2tw-card{background:#f5f2ea!important;border-color:#ded9cf!important;color:#243129!important;box-shadow:none!important}
  body.komo-pro-mode #kcpView .k2tw-head{padding:24px 26px!important}
  body.komo-pro-mode #kcpView .k2tw-patients :is(h1,h2,h3,h4,strong,b){color:#1f2d25!important}
  body.komo-pro-mode #kcpView .k2tw-patients :is(p,span,small,label){color:#667169!important}
  body.komo-pro-mode #kcpView .k2tw-patients .eyebrow,
  body.komo-pro-mode #kcpView .k2tw-tools label span,
  body.komo-pro-mode #kcpView .k2tw-kpi span,
  body.komo-pro-mode #kcpView .k2tw-cell>span{color:#68746c!important}
  body.komo-pro-mode #kcpView .k2tw-tools input,
  body.komo-pro-mode #kcpView .k2tw-tools select{background:#fff!important;color:#18241d!important;border-color:#d7d2c8!important;box-shadow:none!important;-webkit-text-fill-color:#18241d!important}
  body.komo-pro-mode #kcpView .k2tw-tools input::placeholder{color:#929990!important;opacity:1}
  body.komo-pro-mode #kcpView .k2tw-progress{background:#ddd9cf!important}
  body.komo-pro-mode #kcpView .k2tw-progress i{background:#708677!important}
  body.komo-pro-mode #kcpView .k2tw-open,
  body.komo-pro-mode #kcpView .k2tw-btn.primary{background:#26392f!important;color:#f8faf8!important;border-color:#26392f!important;-webkit-text-fill-color:#f8faf8!important}
  body.komo-pro-mode #kcpView .k2tw-btn:not(.primary){background:#fff!important;color:#26392f!important;border-color:#d7d2c8!important;-webkit-text-fill-color:#26392f!important}
  body.komo-pro-mode #kcpView .k2tw-row:hover{border-color:#9fb0a4!important;background:#f8f6f0!important}
  body.komo-pro-mode #kcpView .k2tw-empty{background:#f5f2ea!important;color:#667169!important;border-color:#d7d2c8!important}

  /* Assignment drawer uses the same visual contract. */
  #k2twAssign .k2tw-panel,#k2twDrawer .k2tw-panel{background:#f3f0e8!important;color:#243129!important}
  #k2twAssign .k2tw-card,#k2twDrawer .k2tw-card{background:#fff!important;color:#243129!important;border-color:#ded9cf!important}
  #k2twAssign :is(h1,h2,h3,h4,strong,b),#k2twDrawer :is(h1,h2,h3,h4,strong,b){color:#1f2d25!important}
  #k2twAssign :is(p,span,small,label),#k2twDrawer :is(p,span,small,label){color:#667169!important}
  #k2twAssign input,#k2twAssign select{background:#fff!important;color:#18241d!important;border-color:#d7d2c8!important;-webkit-text-fill-color:#18241d!important}
  #k2twAssign .k2tw-btn.primary,#k2twDrawer .k2tw-btn.primary{background:#26392f!important;color:#fff!important;border-color:#26392f!important;-webkit-text-fill-color:#fff!important}

  @media(max-width:720px){#viewRoot .kbook-qpreview{grid-template-columns:1fr 1fr}#viewRoot .kbook-start-motion{width:100%}body.komo-pro-mode #kcpView .k2tw-head{padding:20px!important}}
  </style>\n</head>`);
}

fs.writeFileSync(bookingPath,booking);
fs.writeFileSync(centerPath,center);
fs.writeFileSync(htmlPath,html);

for(const file of [bookingPath,centerPath]){
  const check=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
  if(check.status!==0)throw new Error('[consultation-flow-final] syntax '+path.basename(file)+': '+(check.stderr||check.stdout));
}

const finalChecks=[
  ['Centre is Myodev',center.includes("textContent='Myodev'")],
  ['Centre assigns consultation',center.includes('Attribuer consultation')],
  ['Centre patient list search keeps focus',center.includes('setSelectionRange(pos,pos)')],
  ['patient start CTA',booking.includes('Débuter consultation Motion')],
  ['six-questionnaire preview',booking.includes('Profil & sécurité')&&booking.includes('GLFS-25')&&booking.includes('Sommeil & récupération')&&booking.includes('Bien-être')&&booking.includes('Mode de vie')&&booking.includes('Antécédents')],
  ['assigned assessment opens questionnaire engine',booking.includes('KomoQuestionnaireEngine')&&booking.includes('openAssessment(id)')],
  ['final consultation visual CSS',html.includes('kpMotionConsultationFinalV1')],
  ['Myodev contrast contract',html.includes('body.komo-pro-mode #kcpView .k2tw-patients')&&html.includes('-webkit-text-fill-color:#18241d!important')]
];
for(const [label,ok] of finalChecks)if(!ok)throw new Error('[consultation-flow-final] failed: '+label);
console.log('[consultation-flow-final] PASS · definitive Myodev owner · readable contrast · patient list stable · Motion handoff intact');
