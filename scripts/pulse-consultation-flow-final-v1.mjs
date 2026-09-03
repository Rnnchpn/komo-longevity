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

if(!html.includes('id="kpMotionConsultationFinalV1"')){
  html=html.replace('</head>',`<style id="kpMotionConsultationFinalV1">
  #viewRoot .kbook-qpreview{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin-top:14px;max-width:620px}
  #viewRoot .kbook-qpreview span{display:flex;align-items:center;min-height:34px;padding:7px 9px;border:1px solid rgba(255,255,255,.10);border-radius:10px;background:#0d120f;color:#aeb8b1;font-size:10px;line-height:1.2}
  #viewRoot .kbook-motion-card{border-color:rgba(143,179,154,.22)!important;background:#0a0e0b!important}
  #viewRoot .kbook-start-motion{min-height:44px;padding:0 16px;border:0;border-radius:12px;background:#8fb39a;color:#102017;font:inherit;font-weight:700;cursor:pointer}
  #viewRoot .kbook-start-motion:hover{filter:brightness(1.05)}
  #viewRoot .kbook-start-motion:disabled{opacity:.42;cursor:not-allowed}
  @media(max-width:720px){#viewRoot .kbook-qpreview{grid-template-columns:1fr 1fr}#viewRoot .kbook-start-motion{width:100%}}
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
  ['patient start CTA',booking.includes('Débuter consultation Motion')],
  ['six-questionnaire preview',booking.includes('Profil & sécurité')&&booking.includes('GLFS-25')&&booking.includes('Sommeil & récupération')&&booking.includes('Bien-être')&&booking.includes('Mode de vie')&&booking.includes('Antécédents')],
  ['assigned assessment opens questionnaire engine',booking.includes('KomoQuestionnaireEngine')&&booking.includes('openAssessment(id)')],
  ['final consultation visual CSS',html.includes('kpMotionConsultationFinalV1')]
];
for(const [label,ok] of finalChecks)if(!ok)throw new Error('[consultation-flow-final] failed: '+label);
console.log('[consultation-flow-final] PASS · Centre Myodev → attribution patient → Débuter consultation Motion → 6 questionnaires');
