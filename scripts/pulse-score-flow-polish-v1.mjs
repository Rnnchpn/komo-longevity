import {readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';

const pulse=join(process.cwd(),'site','pulse-v12');
const paths={
  home:join(pulse,'my-komo-home-v1.js'),
  trilogy:join(pulse,'tests-score-trilogy-v1.js'),
  details:join(pulse,'patient-score-details-v1.js'),
  motion:join(pulse,'motion-v05-workflow-v1.js'),
  report:join(pulse,'score-report-pdf-v1.js'),
  css:join(pulse,'pulse-ui-v1.css')
};
let [home,trilogy,details,motion,report,css]=await Promise.all(Object.values(paths).map(p=>readFile(p,'utf8')));

// Patient surfaces are explicitly fail-closed even for multi-role accounts.
home=home.replace(
  ".in('assessment_id',scoreIds).order('calculated_at',{ascending:false})",
  ".in('assessment_id',scoreIds).eq('release_status','released').order('calculated_at',{ascending:false})"
);
trilogy=trilogy.replace(
  ".in('assessment_id',ids).order('calculated_at',{ascending:false})",
  ".in('assessment_id',ids).eq('release_status','released').order('calculated_at',{ascending:false})"
);

const startCard=`function startCard(){
  const r=S.free;
  if(!r)return\`<article class="kst-card"><div class="kst-top"><span>01 · START</span><span class="kst-pill pending">À réaliser</span></div><h3>KŌMŌ Start</h3><strong class="kst-main pending">En attente</strong><p>Votre premier repère de mobilité apparaîtra ici après le questionnaire, le Chair Stand et le Two-Step.</p><div class="kst-foot"><span>Dépistage · non diagnostique</span></div></article>\`;
  const favorable=r.level===0,label=favorable?'Favorable':\`Niveau \${r.level}/3\`;
  return\`<article class="kst-card is-ready"><div class="kst-top"><span>01 · START</span><span class="kst-pill good">Disponible</span></div><h3>KŌMŌ Start</h3><strong class="kst-main">\${label}</strong><p>Lecture de dépistage basée sur le questionnaire et le Two-Step\${r.date?\` · \${fmt(r.date)}\`:''}. Le Chair Stand reste une mesure de référence personnelle.</p><div class="kst-metrics"><div><span>Questionnaire</span><b>\${r.q===null?'—':Math.round(r.q)+'/100'}</b></div><div><span>Chair Stand</span><b>\${r.chair===null?'—':Math.round(r.chair)+' rép.'}</b><small>repère</small></div><div><span>Two-Step</span><b>\${r.two===null?'—':r.two.toFixed(2)}</b></div></div></article>\`;
}`;
trilogy=trilogy.replace(/function startCard\(\)\{[\s\S]*?\n\}\nfunction scoreCard/,`${startCard}\nfunction scoreCard`);

const scoreCard=`function scoreCard(kind,index,title,assessment,score){
  const center=S.patient?.organizations?.name||'';
  if(kind==='clinical'){
    const done=assessment&&['validated','released','completed'].includes(assessment.status);
    const status=assessment?statusLabel(assessment.status):'En attente';
    return\`<article class="kst-card \${done?'is-ready':''}"><div class="kst-top"><span>\${String(index).padStart(2,'0')} · CLINICAL</span><span class="kst-pill \${done?'good':'pending'}">\${esc(status)}</span></div><h3>\${esc(title)}</h3><strong class="kst-main \${done?'':'pending'}">\${done?'Interprétation validée':'En attente'}</strong><p>Lecture clinique, contexte médical et priorités validées par le professionnel. Aucun score numérique Clinical n'est calculé dans cette version.</p><div class="kst-foot"><span>\${center?esc(center):'Après KŌMŌ Motion et validation médicale'}</span></div></article>\`;
  }
  const value=n(score?.motion_score??score?.overall_score),available=value!==null;
  const status=available?'Disponible':assessment?statusLabel(assessment.status):'En attente';
  return\`<article class="kst-card \${available?'is-ready':''}"><div class="kst-top"><span>\${String(index).padStart(2,'0')} · MOTION</span><span class="kst-pill \${available?'good':'pending'}">\${esc(status)}</span></div><h3>\${esc(title)}</h3><strong class="kst-main \${available?'':'pending'}">\${available?Math.round(value)+'/100':'En attente'}</strong><p>POC v0.5 : mobilité KŌMŌ 60 % + symétrie musculaire 40 %. Posture, activation et coordination restent descriptives.</p><div class="kst-foot"><span>\${center?esc(center):'Centre à sélectionner'}</span>\${!available?'<button type="button" data-kst-motion>Planifier Motion →</button>':''}</div></article>\`;
}`;
trilogy=trilogy.replace(/function scoreCard\(kind,index,title,assessment,score\)\{[\s\S]*?\n\}\n\nfunction cleanupLegacy/,`${scoreCard}\n\nfunction cleanupLegacy`);
trilogy=trilogy.replace("scoreCard('clinical',3,'Score KŌMØ Clinical'","scoreCard('clinical',3,'KŌMØ Clinical'");

// Score detail uses the shared runtime and one stable root observer.
details=details.replace(
  "function sb(){if(!client)client=createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});return client}",
  "function sb(){return window.KomoRuntime?.client||(client||(client=createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})))}"
);
details=details.replace("myocare_symmetry:'Symétrie MyoCare'","myocare_symmetry:'Symétrie musculaire'");
const detailMount=`async function mount(){
  if(location.hash!=='#path')return;
  const summary=document.querySelector('[data-krpt]');if(!summary||summary.querySelector('[data-ksd]'))return;
  const runtime=window.KomoRuntime?.getContext?.(),session=runtime?.session||(await sb().auth.getSession()).data?.session;if(!session?.user)return;
  const p=await sb().from('patients').select('id').eq('patient_user_id',session.user.id);const pids=(p.data||[]).map(x=>x.id);if(!pids.length)return;
  const a=await sb().from('assessments').select('id').in('patient_id',pids);const aids=(a.data||[]).map(x=>x.id);if(!aids.length)return;
  const s=await sb().from('scores').select('*').in('assessment_id',aids).eq('release_status','released').order('calculated_at',{ascending:false});
  const scores=(s.data||[]).filter(x=>x.motion_score!=null);if(!scores.length)return;
  const latest=scores.find(x=>x.algorithm_version==='motion-functional-index-v0.5-poc')||scores[0],d=latest.domain_scores||{},sig=latest.muscle_signature||{},manifest=latest.input_manifest||{},history=scores.slice(0,5);
  const box=document.createElement('section');box.dataset.ksd='1';box.className='ksd-v2';
  box.innerHTML=\`<div class="ksd-score"><small>DERNIER KŌMŌ MOTION · \${esc(latest.algorithm_version==='motion-functional-index-v0.5-poc'?'POC v0.5':'version historique')}</small><strong>\${Math.round(Number(latest.motion_score))}<em>/100</em></strong><span>Publié le \${date(latest.released_at||latest.calculated_at)}</span></div><div class="ksd-body"><div class="ksd-weighted"><article><small>60 % · pondéré</small><span>Mobilité KŌMŌ</span><strong>\${d.mobility==null?'—':Math.round(Number(d.mobility))}/100</strong></article><article><small>40 % · pondéré</small><span>Symétrie musculaire</span><strong>\${d.myocare_symmetry==null?'—':Math.round(Number(d.myocare_symmetry))}/100</strong></article></div><div class="ksd-context"><span>SVA <b>\${manifest?.inputs?.sva_mm==null?'—':Math.round(Number(manifest.inputs.sva_mm))+' mm'}</b></span><span>Activation <b>\${sig.activation?.mean_pctMVC==null?'—':sig.activation.mean_pctMVC+' %MVC'}</b></span><span>CCI <b>\${sig.coordination?.mean_CCI_pct==null?'—':sig.coordination.mean_CCI_pct+' %'}</b></span><span>Confiance <b>\${Math.round(Number(latest.confidence||0)*100)} %</b></span></div><p>Les mesures de posture, activation et coordination contextualisent le résultat mais ne modifient pas le Motion Score POC actuel.</p><div class="ksd-history"><small>HISTORIQUE MOTION</small>\${history.map((x,i)=>\`<div><span>\${i===0?'Référence actuelle':date(x.calculated_at)}</span><strong>\${Math.round(Number(x.motion_score))}/100</strong></div>\`).join('')}</div></div>\`;
  summary.appendChild(box);document.querySelector('.patient-v4 .pv4-grid')?.setAttribute('hidden','');
}`;
details=details.replace(/async function mount\(\)\{[\s\S]*?\}\nfunction schedule\(\)/,`${detailMount}\nfunction schedule()`);
details=details.replace(/const o=new MutationObserver\(\(\)=>\{if\(location.hash==='#path'\)schedule\(\)\}\);o\.observe\(document\.body,\{childList:true,subtree:true\}\);/,"const o=new MutationObserver(()=>{if(location.hash==='#path'&&!document.querySelector('[data-ksd]'))schedule()});const scoreRoot=document.querySelector('#viewRoot');if(scoreRoot)o.observe(scoreRoot,{childList:true,subtree:true});");

// Professional Motion result: make weighting, contextual metrics and validation flow explicit.
motion=motion.replace(
  "function sb(){if(!client)client=createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});return client}",
  "function sb(){return window.KomoRuntime?.client||(client||(client=createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})))}"
);
const proResult=`function result(s){
  const x=s.score;if(!x)return'';const d=x.domain_scores||{},sig=x.muscle_signature||{},release=x.release_status||'draft',canReview=s.actor?.roles?.some(r=>['owner','clinical_admin','physician'].includes(r));
  const reviewed=['clinician_reviewed','released'].includes(release),released=release==='released';
  return\`<div class="mv05-result mv05-result-v2"><section class="mv05-score-hero"><small>MOTION SCORE · POC v0.5</small><div><strong>\${x.motion_score==null?'—':Math.round(Number(x.motion_score))}</strong><em>/100</em></div><p>Deux composantes pondérées. Les autres mesures restent contextuelles.</p><span>Confiance \${Math.round(Number(x.confidence||0)*100)} % · Complétude \${Math.round(Number(x.completeness||0))} %</span></section><section class="mv05-result-body"><div class="mv05-weighted"><article><small>60 % · PONDÉRÉ</small><span>Mobilité KŌMŌ</span><strong>\${d.mobility==null?'—':Math.round(Number(d.mobility))}/100</strong></article><article><small>40 % · PONDÉRÉ</small><span>Symétrie musculaire</span><strong>\${d.myocare_symmetry==null?'—':Math.round(Number(d.myocare_symmetry))}/100</strong></article></div><div class="mv05-context"><article><small>NON PONDÉRÉ</small><span>SVA</span><strong>\${s.sva==null?'—':Number(s.sva).toFixed(0)+' mm'}</strong></article><article><small>DESCRIPTIF</small><span>Activation</span><strong>\${sig.activation?.mean_pctMVC==null?'—':sig.activation.mean_pctMVC+' %MVC'}</strong></article><article><small>DESCRIPTIF</small><span>Coactivation CCI</span><strong>\${sig.coordination?.mean_CCI_pct==null?'—':sig.coordination.mean_CCI_pct+' %'}</strong></article><article><small>DESCRIPTIF</small><span>Fatigabilité</span><strong>\${sig.endurance?.mean_drift_pct==null?'—':sig.endurance.mean_drift_pct+' %'}</strong></article></div><div class="mv05-validation"><span class="done">1 · Calculé</span><span class="\${reviewed?'done':''}">2 · Revu</span><span class="\${released?'done':''}">3 · Publié</span></div><div class="mv05-actions">\${canReview&&release==='draft'&&['valid','provisional'].includes(x.status)?'<button class="mv05-btn" data-mv05-review>Revoir le score</button>':''}\${canReview&&release==='clinician_reviewed'?'<button class="mv05-btn primary" data-mv05-release>Publier au patient</button>':''}<span class="mv05-status">\${esc(x.status)} · \${esc(release)}</span></div><div class="mv05-note"><b>Formule POC actuelle :</b> 60 % mobilité KŌMŌ + 40 % symétrie issue de l'analyse musculaire Myodev/MyoCare. SVA, activation, CCI et fatigabilité n'entrent pas dans le chiffre final tant que leurs références ne sont pas verrouillées.</div></section></div>\`;
}`;
motion=motion.replace(/function result\(s\)\{[\s\S]*?\}\nfunction html\(s\)/,`${proResult}\nfunction html(s)`);
motion=motion.replace('MyoCare / Myodev','Analyse musculaire · Myodev');

// Report language mirrors the exact POC contract.
report=report.replace(
  "function sb(){if(!client)client=createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});return client}",
  "function sb(){return window.KomoRuntime?.client||(client||(client=createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})))}"
);
report=report.replaceAll('Symétrie MyoCare','Symétrie musculaire');
report=report.replace("`Level 1 · Niveau ${st.level}`","st.level===0?'Favorable':`Niveau ${st.level}/3`");
report=report.replace('MyoCare doivent être complétés puis validés.','les données Myodev doivent être complétés puis validés.');
report=report.replace('60 % repère de mobilité KŌMØ + 40 % symétrie MyoCare.','60 % mobilité KŌMØ + 40 % symétrie musculaire issue de Myodev/MyoCare.');

const polish=`
/* Score pathway polish · canonical-4p3 */
.kst-card.is-ready{background:linear-gradient(145deg,#fbfaf6,#eef2ec);box-shadow:0 18px 52px rgba(38,48,40,.055)}
.kst-main{font-size:clamp(34px,4vw,46px)}.kst-metrics small{display:block;margin-top:3px;color:#9a9e98;font-size:7px;text-transform:uppercase;letter-spacing:.07em}
.ksd-v2{display:grid;grid-template-columns:minmax(180px,.36fr) minmax(0,1fr);gap:18px;margin-top:14px;padding:20px;border:1px solid rgba(38,48,40,.1);border-radius:24px;background:linear-gradient(145deg,#fff,#f5f2ea)}
.ksd-score{padding:19px;border-radius:19px;background:#263229;color:#fff;align-self:start}.ksd-score>small{display:block;color:rgba(255,255,255,.56);font-size:7.5px;letter-spacing:.11em}.ksd-score>strong{display:block;margin-top:16px;font:600 54px/1 Manrope,sans-serif;letter-spacing:-.065em}.ksd-score>strong em{font-style:normal;font-size:13px;color:rgba(255,255,255,.54);letter-spacing:0}.ksd-score>span{display:block;margin-top:8px;color:rgba(255,255,255,.6);font-size:8px}.ksd-body{min-width:0}.ksd-weighted{display:grid;grid-template-columns:1fr 1fr;gap:8px}.ksd-weighted article{padding:14px;border:1px solid #e4e0d8;border-radius:16px;background:#fff}.ksd-weighted small,.ksd-history>small{display:block;color:#7e857f;font-size:7px;letter-spacing:.1em}.ksd-weighted span{display:block;margin-top:8px;color:#606b62;font-size:9px}.ksd-weighted strong{display:block;margin-top:4px;color:#28362d;font-size:21px}.ksd-context{display:flex;flex-wrap:wrap;gap:6px;margin-top:9px}.ksd-context span{padding:7px 9px;border-radius:999px;background:#ece9e1;color:#717971;font-size:8px}.ksd-context b{color:#38483c}.ksd-body>p{margin:10px 0;color:#828881;font-size:8px;line-height:1.5}.ksd-history{margin-top:11px;border-top:1px solid #e8e4dc;padding-top:10px}.ksd-history div{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #eeeae3;color:#687068;font-size:8.5px}.ksd-history strong{color:#35443a}
.mv05-result-v2{grid-template-columns:minmax(190px,.42fr) minmax(0,1fr);gap:16px}.mv05-score-hero{padding:18px;border-radius:19px;background:#243129;color:#fff}.mv05-score-hero>small{color:rgba(255,255,255,.55);font-size:7.5px;letter-spacing:.11em}.mv05-score-hero>div{display:flex;align-items:baseline;gap:5px;margin-top:16px}.mv05-score-hero strong{font:600 58px/1 Manrope,sans-serif;letter-spacing:-.065em}.mv05-score-hero em{font-style:normal;color:rgba(255,255,255,.52);font-size:12px}.mv05-score-hero p{margin:11px 0 0;color:rgba(255,255,255,.68);font-size:8.5px;line-height:1.45}.mv05-score-hero>span{display:block;margin-top:9px;color:rgba(255,255,255,.52);font-size:7.5px}.mv05-result-body{min-width:0}.mv05-weighted{display:grid;grid-template-columns:1fr 1fr;gap:8px}.mv05-weighted article,.mv05-context article{padding:12px;border:1px solid #e5e1d9;border-radius:15px;background:#fff}.mv05-weighted small,.mv05-context small{display:block;color:#858c86;font-size:7px;letter-spacing:.08em}.mv05-weighted span,.mv05-context span{display:block;margin-top:7px;color:#687169;font-size:8.5px}.mv05-weighted strong{display:block;margin-top:4px;color:#29372e;font-size:20px}.mv05-context{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-top:8px}.mv05-context strong{display:block;margin-top:4px;color:#36443a;font-size:11px}.mv05-validation{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}.mv05-validation span{padding:7px 9px;border-radius:999px;background:#ece9e2;color:#8a8e89;font-size:7.5px;font-weight:700}.mv05-validation span.done{background:#dfe9df;color:#4d6352}
@media(max-width:760px){.ksd-v2,.mv05-result-v2{grid-template-columns:1fr}.ksd-weighted,.mv05-weighted{grid-template-columns:1fr 1fr}.mv05-context{grid-template-columns:1fr 1fr}.ksd-score{display:grid;grid-template-columns:1fr auto;align-items:end}.ksd-score>strong{grid-row:1/4;grid-column:2;margin:0}}
@media(max-width:520px){.ksd-weighted,.mv05-weighted,.mv05-context{grid-template-columns:1fr}.mv05-score-hero strong{font-size:50px}}
`;
css=css.replace(/\n\/\* Score pathway polish · canonical-4p3 \*\/[\s\S]*$/,'');
css+=polish;

await Promise.all([
  writeFile(paths.home,home),writeFile(paths.trilogy,trilogy),writeFile(paths.details,details),
  writeFile(paths.motion,motion),writeFile(paths.report,report),writeFile(paths.css,css)
]);

const checks=[
  ['patient home only reads released scores',home.includes("eq('release_status','released')")],
  ['Start explicitly separates Chair Stand from classification',trilogy.includes('Chair Stand reste une mesure de référence personnelle')],
  ['Clinical is not presented as a numeric score',trilogy.includes("Aucun score numérique Clinical n'est calculé")],
  ['patient Motion detail shows weighted components',details.includes('60 % · pondéré')&&details.includes('40 % · pondéré')],
  ['patient score details avoid body observer',!details.includes('o.observe(document.body')],
  ['professional result shows 3-step validation',motion.includes('1 · Calculé')&&motion.includes('2 · Revu')&&motion.includes('3 · Publié')],
  ['professional result clearly separates contextual metrics',motion.includes("n'entrent pas dans le chiffre final")],
  ['patient wording uses muscle symmetry instead of MyoCare feature name',details.includes('Symétrie musculaire')],
  ['score polish styles bundled',css.includes('/* Score pathway polish · canonical-4p3 */')]
];
let failed=0;for(const [label,ok] of checks){console.log(`[pulse-score-flow-polish] ${ok?'OK':'FAIL'} · ${label}`);if(!ok)failed++}
if(failed)process.exit(1);
console.log(`[pulse-score-flow-polish] ${checks.length} checks passed.`);
