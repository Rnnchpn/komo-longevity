import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const URL='https://uqlolefsiktbznnymriy.supabase.co';
const KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const REM='komo_pulse_remember';
const ALG='motion-sensor-index-v0.6.0';
let client=null,current='',busy=false,timer=null;

function storage(){return localStorage.getItem(REM)==='1'?localStorage:sessionStorage}
function sb(){return window.KomoRuntime?.client||(client||(client=createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})))}
function esc(v=''){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function n(v){const x=Number(v);return Number.isFinite(x)?x:null}
function pct(v){const x=n(v);return x===null?'—':`${Math.round(x)} %`}
function toast(msg){const t=document.querySelector('#toast');if(!t)return;t.textContent=msg;t.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.hidden=true,4200)}

function style(){
  if(document.querySelector('#motionCanonicalStyle'))return;
  const s=document.createElement('style');s.id='motionCanonicalStyle';s.textContent=`
.kmw{margin:0 0 18px;border:1px solid rgba(38,48,40,.10);border-radius:26px;background:#fff;padding:23px;box-shadow:0 16px 46px rgba(26,38,30,.035)}.kmw-head{display:flex;justify-content:space-between;gap:20px;align-items:flex-start}.kmw-eye{font-size:8px;font-weight:800;letter-spacing:.14em;color:#7a837d}.kmw h3{margin:6px 0 6px;font:600 23px/1.1 Manrope,sans-serif;letter-spacing:-.035em}.kmw p{margin:0;color:#707a73;font-size:10px;line-height:1.55}.kmw-badge{padding:8px 11px;border-radius:999px;background:#edf3ee;color:#45604c;font-size:9px;font-weight:800;white-space:nowrap}.kmw-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-top:17px}.kmw-gate{padding:14px;border-radius:16px;border:1px solid #e6e5df;background:#f8f8f5;min-height:105px}.kmw-gate.ok{background:#eef4ef;border-color:#d9e5da}.kmw-gate.warn{background:#fff8ed;border-color:#efe1ca}.kmw-gate i{width:22px;height:22px;border-radius:8px;display:grid;place-items:center;font-style:normal;background:#e9e9e4}.kmw-gate.ok i{background:#526c59;color:#fff}.kmw-gate strong,.kmw-gate span{display:block}.kmw-gate strong{margin-top:9px;font-size:11px}.kmw-gate span{margin-top:4px;color:#777f79;font-size:9px;line-height:1.45}.kmw-missing{margin-top:11px;padding:11px 13px;border-radius:13px;background:#fff1e7;color:#795139;font-size:9px}.kmw-actions{margin-top:14px;display:flex;gap:8px;align-items:center;flex-wrap:wrap}.kmw-btn{border:1px solid #dcd9d2;border-radius:12px;background:#fff;padding:10px 13px;font-size:10px;font-weight:700;cursor:pointer}.kmw-btn.primary{background:#223129;color:#fff;border-color:#223129}.kmw-btn:disabled{opacity:.42}.kmw-status{font-size:9px;color:#6f7871}.kmw-result{margin-top:17px;padding-top:17px;border-top:1px solid #e7e3dc;display:grid;grid-template-columns:175px 1fr;gap:18px;align-items:center}.kmw-score p{font-size:8px;font-weight:800;letter-spacing:.12em}.kmw-score strong{font:500 58px/.9 Manrope,sans-serif;letter-spacing:-.07em}.kmw-score small{font-size:12px;color:#828983}.kmw-meta{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.kmw-stat{padding:11px;border-radius:13px;background:#f3f4f1}.kmw-stat span,.kmw-stat strong{display:block}.kmw-stat span{font-size:7px;color:#7f8780;text-transform:uppercase;letter-spacing:.06em}.kmw-stat strong{margin-top:5px;font-size:13px}.kmw-note{margin-top:10px;color:#707a73;font-size:9px;line-height:1.5}.kmw-policy{margin-top:12px;padding:11px 13px;border-radius:13px;background:#f2f5f2;color:#536158;font-size:9px;line-height:1.5}.kmw-policy b{color:#293c30}@media(max-width:900px){.kmw-grid,.kmw-meta{grid-template-columns:1fr 1fr}.kmw-grid .kmw-gate:last-child{grid-column:1/-1}}@media(max-width:620px){.kmw{padding:17px}.kmw-head{flex-direction:column}.kmw-grid,.kmw-meta{grid-template-columns:1fr}.kmw-grid .kmw-gate:last-child{grid-column:auto}.kmw-result{grid-template-columns:1fr}}`;
  document.head.appendChild(s);
}

async function actor(){
  const {data:{session}}=await sb().auth.getSession();if(!session?.user)return null;
  const q=await sb().from('organization_members').select('role').eq('user_id',session.user.id).eq('status','active');
  return{user:session.user,roles:(q.data||[]).map(x=>x.role)};
}

async function snap(id){
  const c=sb();
  const[a,imp,mm,sc,who]=await Promise.all([
    c.from('assessments').select('id,protocol_version,status,context_class,patient_id').eq('id',id).single(),
    c.from('myodev_imports').select('id,status,source_file_name,source_version,contract_version,created_at').eq('assessment_id',id).order('created_at',{ascending:false}),
    c.from('myodev_metrics').select('metric_code,muscle_code,value,qc_status,myodev_import_id').eq('assessment_id',id),
    c.from('scores').select('*').eq('assessment_id',id).eq('algorithm_version',ALG).neq('release_status','superseded').order('calculated_at',{ascending:false}).limit(1),
    actor()
  ]);
  if(a.error)throw a.error;
  const imports=imp.data||[],metrics=mm.data||[],score=(sc.data||[])[0]||null,accepted=imports.find(x=>x.status==='accepted')||null;
  const validLsi=accepted?metrics.filter(x=>x.myodev_import_id===accepted.id&&x.metric_code==='LSI_pct'&&x.qc_status==='valid'&&n(x.value)!==null&&n(x.value)>=0&&n(x.value)<=100):[];
  const muscles=[...new Set(validLsi.map(x=>x.muscle_code).filter(Boolean))];
  const suspect=accepted?metrics.filter(x=>x.myodev_import_id===accepted.id&&x.qc_status==='suspect').length:0;
  const invalid=accepted?metrics.filter(x=>x.myodev_import_id===accepted.id&&x.qc_status==='invalid').length:0;
  const gates={import:!!accepted,symmetry:muscles.length>=3,context:a.data.context_class!=='D'};
  return{assessment:a.data,imports,accepted,validLsi,muscles,suspect,invalid,score,gates,ready:Object.values(gates).every(Boolean),actor:who};
}

function gate(ok,title,detail,warn=false){return`<div class="kmw-gate ${ok?'ok':warn?'warn':''}"><i>${ok?'✓':'·'}</i><strong>${esc(title)}</strong><span>${esc(detail)}</span></div>`}
function missing(s){const a=[];if(!s.gates.import)a.push('Import Myodev accepté requis');if(!s.gates.symmetry)a.push(`Symétrie LSI valide sur 3 groupes musculaires requise (${s.muscles.length}/3)`);if(!s.gates.context)a.push('Contexte D : calcul non publiable');return a}

function result(s){
  const x=s.score;if(!x)return'';
  const d=x.domain_scores||{},sym=n(d.neuromuscular_symmetry),release=x.release_status||'draft';
  const can=s.actor?.roles?.some(r=>['owner','clinical_admin','physician'].includes(r));
  return`<div class="kmw-result"><div class="kmw-score"><p>MOTION SCORE · SENSOR v0.6</p><div><strong>${x.motion_score==null?'—':Math.round(Number(x.motion_score))}</strong><small>/100</small></div></div><div><div class="kmw-meta"><div class="kmw-stat"><span>Symétrie neuromusculaire</span><strong>${sym===null?'—':sym.toFixed(1)+' %'}</strong></div><div class="kmw-stat"><span>Confiance</span><strong>${pct(Number(x.confidence||0)*100)}</strong></div><div class="kmw-stat"><span>Complétude capteur</span><strong>${pct(x.completeness)}</strong></div></div><div class="kmw-actions">${can&&release==='draft'&&['valid','provisional'].includes(x.status)?'<button class="kmw-btn" data-kmw-review>Revoir le score</button>':''}${can&&release==='clinician_reviewed'?'<button class="kmw-btn primary" data-kmw-release>Publier au patient</button>':''}<span class="kmw-status">${esc(x.status)} · ${esc(release)}</span></div><div class="kmw-note">Le score est calculé uniquement à partir des LSI valides des groupes musculaires mesurés par Myodev. Les mesures détaillées d’activation et de marche restent visibles comme résultats descriptifs.</div></div></div>`;
}

function html(s){
  const miss=missing(s),last=s.imports[0];
  return`<section class="kmw" data-motion-workflow><div class="kmw-head"><div><div class="kmw-eye">KŌMØ MOTION · SCORE CAPTEUR</div><h3>Importer, contrôler, calculer.</h3><p>Un seul chemin de calcul : données Myodev validées → Motion Score → revue professionnelle → publication.</p></div><span class="kmw-badge">${s.ready?'Prêt à calculer':`${miss.length} élément${miss.length>1?'s':''} à compléter`}</span></div><div class="kmw-grid">${gate(s.gates.import,'Import Myodev',s.accepted?`${s.accepted.source_file_name||'Fichier'} · accepté`:'Aucun fichier accepté')}${gate(s.gates.symmetry,'Symétrie capteur',`${s.muscles.length}/3 groupes · ${s.validLsi.length} LSI valides`,s.gates.import&&!s.gates.symmetry)}${gate(s.gates.context,'Qualité & contexte',`${s.assessment.context_class||'—'} · ${s.suspect} suspect · ${s.invalid} invalide`,s.suspect>0||s.invalid>0)}</div>${miss.length?`<div class="kmw-missing"><strong>Avant calcul :</strong> ${miss.map(esc).join(' · ')}</div>`:''}<div class="kmw-policy"><b>Règle Motion v0.6 :</b> GLFS‑25 = pré-bilan uniquement. Two-Step, Chair Stand, marche 4 m manuelle, appui unipodal et Stand-Up n’entrent ni dans le score ni dans ses prérequis.</div><div class="kmw-actions"><button class="kmw-btn primary" data-kmw-calc ${s.ready&&!busy?'':'disabled'}>${busy?'Calcul en cours…':'Calculer le Motion Score'}</button>${last?`<span class="kmw-status">Dernier import : ${esc(last.source_file_name||'Myodev')} · ${esc(last.status)}</span>`:''}</div>${result(s)}</section>`;
}

async function mount(){
  if(location.hash!=='#clinical')return;
  const root=document.querySelector('[data-clinical-motion-v1]'),id=document.querySelector('#clmAssessment')?.value;
  if(!root||!id)return;current=id;style();
  try{
    const s=await snap(id);if(current!==id)return;
    root.querySelector('[data-motion-workflow]')?.remove();root.querySelector('[data-mv05]')?.remove();
    const box=document.createElement('div');box.innerHTML=html(s);const el=box.firstElementChild;
    const importer=[...root.querySelectorAll('.clm-card')].find(x=>(x.querySelector('h3')?.textContent||'').includes('Import MyoCare'));
    if(importer)root.insertBefore(el,importer);else root.appendChild(el);bind(el,s);
  }catch(e){console.error('[motion-workflow]',e)}
}
function bind(el,s){el.querySelector('[data-kmw-calc]')?.addEventListener('click',()=>calculate(s.assessment.id));el.querySelector('[data-kmw-review]')?.addEventListener('click',()=>review(s.score.id,'review'));el.querySelector('[data-kmw-release]')?.addEventListener('click',()=>review(s.score.id,'release'))}
async function calculate(id){if(busy)return;busy=true;await mount();const r=await sb().rpc('calculate_motion_v06',{p_assessment_id:id});busy=false;if(r.error){toast(`Calcul bloqué : ${r.error.message}`);return mount()}toast(r.data?.motion_score==null?'Import enregistré mais score capteur encore incomplet.':`Motion Score : ${Number(r.data.motion_score).toFixed(1)}/100`);await mount();window.dispatchEvent(new CustomEvent('komo:motion-v06-calculated',{detail:r.data||{}}));window.dispatchEvent(new CustomEvent('komo:motion-v05-calculated',{detail:r.data||{}}))}
async function review(id,action){const r=await sb().rpc('review_pulse_motion_score',{target_score_id:id,review_action:action});if(r.error)return toast(r.error.message);toast(action==='review'?'Score revu.':'Score publié au patient.');await mount();window.dispatchEvent(new CustomEvent('komo:canonical-result-invalidated'))}
function schedule(ms=120){clearTimeout(timer);timer=setTimeout(mount,ms)}
['komo:clinical-motion-render','komo:myocare-imported','komo:motion-v06-calculated','komo:motion-v05-calculated','hashchange','pageshow'].forEach(e=>window.addEventListener(e,()=>schedule()));
document.addEventListener('change',e=>{if(e.target?.id==='clmAssessment')schedule(40)});
new MutationObserver(()=>{if(location.hash==='#clinical')schedule(160)}).observe(document.body,{subtree:true,childList:true});
document.addEventListener('DOMContentLoaded',()=>schedule(350));setTimeout(()=>schedule(),900);
window.KomoMotionWorkflow={version:'0.6.0',algorithm:ALG,policy:'sensor_only'};
