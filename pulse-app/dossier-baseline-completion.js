import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const URL='https://uqlolefsiktbznnymriy.supabase.co';
const KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const REM='komo_pulse_remember';
let client=null,dossier=null,registry=null,busy=false;

function storage(){return localStorage.getItem(REM)==='1'?localStorage:sessionStorage}
function sb(){return client||(client=createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}))}
function esc(v=''){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function toast(m){const t=document.querySelector('#toast');if(!t)return;t.textContent=m;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>t.hidden=true,5200)}
function patientId(){return new URLSearchParams(location.search).get('patient')||''}

async function load(){
  const id=patientId();if(!id)throw new Error('Patient non sélectionné.');
  const [d,r]=await Promise.all([
    sb().rpc('komo_professional_patient_dossier',{p_patient_id:id}),
    sb().from('instrument_registry').select('code,version,configuration').eq('code','KOMO_BASELINE_CORE').single()
  ]);
  if(d.error)throw d.error;if(r.error)throw r.error;
  dossier=d.data;registry=r.data;return dossier;
}

function baseline(){return(dossier?.questionnaires||[]).find(q=>q.instrument_code==='KOMO_BASELINE_CORE')||null}
function requiredItems(){const items=registry?.configuration?.items||{};return Object.entries(items).filter(([,cfg])=>cfg?.required)}
function missingItems(){const q=baseline(),answered=new Set((q?.responses||[]).map(r=>r.item_code));return requiredItems().filter(([code])=>!answered.has(code))}

function field(code,cfg){
  const id=`kbc-${code}`;
  if(cfg.type==='yes_no') return `<label class="kbc-field"><span>${esc(cfg.prompt)}</span><select id="${id}" data-item="${code}" data-type="yes_no"><option value="">Choisir…</option><option value="false">Non</option><option value="true">Oui</option></select>${cfg.safety?'<small>Question de sécurité clinique.</small>':''}</label>`;
  if(cfg.type==='number') return `<label class="kbc-field"><span>${esc(cfg.prompt)}</span><div class="kbc-number"><input id="${id}" data-item="${code}" data-type="number" type="number" min="${esc(cfg.min??'')}" max="${esc(cfg.max??'')}" step="${esc(cfg.step??1)}"><em>${esc(cfg.suffix||'')}</em></div></label>`;
  if(cfg.type==='choice') return `<label class="kbc-field"><span>${esc(cfg.prompt)}</span><select id="${id}" data-item="${code}" data-type="choice"><option value="">Choisir…</option>${(cfg.options||[]).map(o=>`<option value="${esc(o.value)}">${esc(o.label)}</option>`).join('')}</select></label>`;
  return '';
}

function style(){if(document.querySelector('#kbcStyle'))return;const s=document.createElement('style');s.id='kbcStyle';s.textContent=`
.kbc{margin:10px 0 0 34px;padding:15px;border-radius:14px;background:#fff8ed;border:1px solid #eadcc7}.kbc h4{margin:0;font-size:12px}.kbc>p{margin:5px 0 12px;color:#79684e;font-size:9px;line-height:1.5}.kbc-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.kbc-field{padding:11px;border-radius:12px;background:#fff}.kbc-field>span{display:block;font-size:10px;font-weight:700;line-height:1.35;margin-bottom:7px}.kbc-field small{display:block;margin-top:5px;color:#986c4c;font-size:8px}.kbc-field select,.kbc-field input{width:100%;border:1px solid #d9d5cd;border-radius:10px;background:#fff;padding:9px 10px;font:inherit;font-size:10px;color:var(--ink)}.kbc-number{display:grid;grid-template-columns:1fr auto;gap:7px;align-items:center}.kbc-number em{font-style:normal;color:var(--muted);font-size:9px}.kbc-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:12px}.kbc-btn{border:0;border-radius:11px;padding:10px 13px;background:var(--green);color:#fff;font:700 10px DM Sans,sans-serif;cursor:pointer}.kbc-btn:disabled{opacity:.45}.kbc-status{font-size:9px;color:#79684e}.kmi-qrow[data-q="KOMO_BASELINE_CORE"] .kmi-score{display:none!important}.kmi-qrow[data-q="KOMO_BASELINE_CORE"]{grid-template-columns:auto minmax(0,1fr)!important}@media(max-width:700px){.kbc{margin-left:0}.kbc-grid{grid-template-columns:1fr}}
`;document.head.appendChild(s)}

function renderPanel(){
  style();const row=document.querySelector('.kmi-qrow[data-q="KOMO_BASELINE_CORE"]');if(!row)return false;
  document.querySelector('#baselineCompletionPanel')?.remove();
  const q=baseline(),missing=missingItems();
  if(!q||q.status==='completed'||Number(q.completeness||0)>=100||!missing.length)return true;
  const panel=document.createElement('div');panel.className='kbc';panel.id='baselineCompletionPanel';
  panel.innerHTML=`<h4>Compléter ${missing.length} question${missing.length>1?'s':''} obligatoire${missing.length>1?'s':''}</h4><p>Les ${q.responses?.length||0} réponses déjà présentes restent intactes. Vous ne renseignez ici que les éléments manquants, avec une provenance clinicien.</p><div class="kbc-grid">${missing.map(([code,cfg])=>field(code,cfg)).join('')}</div><div class="kbc-actions"><button class="kbc-btn" id="kbcSave">Enregistrer les réponses manquantes + recalculer</button><span class="kbc-status">Complétude actuelle : ${Number(q.completeness||0).toFixed(1)} %</span></div>`;
  row.insertAdjacentElement('afterend',panel);document.querySelector('#kbcSave')?.addEventListener('click',save);return true;
}

function payload(){
  const out=[];document.querySelectorAll('#baselineCompletionPanel [data-item]').forEach(el=>{
    const code=el.dataset.item,type=el.dataset.type,v=el.value;
    if(v==='')return;
    if(type==='yes_no'){const b=v==='true';out.push({itemCode:code,rawValue:b,responseCode:b?'yes':'no'})}
    else if(type==='number'){const x=Number(v);if(Number.isFinite(x))out.push({itemCode:code,rawValue:x})}
    else out.push({itemCode:code,rawValue:v,responseCode:v});
  });return out;
}

async function save(){if(busy)return;const btn=document.querySelector('#kbcSave');try{
  busy=true;if(btn){btn.disabled=true;btn.textContent='Enregistrement…'}
  const missing=missingItems(),entries=payload();if(entries.length!==missing.length)throw new Error('Renseignez toutes les questions manquantes.');
  const assessmentId=dossier?.motion?.id;if(!assessmentId)throw new Error('Aucun bilan Motion actif.');
  const r=await sb().rpc('complete_professional_baseline_missing_items',{p_assessment_id:assessmentId,p_entries:entries});if(r.error)throw r.error;
  if(r.data?.safety_review_required){toast('Section complétée · revue clinique requise avant calcul.');setTimeout(()=>location.reload(),900);return}
  const calc=await sb().rpc('calculate_motion_v05',{p_assessment_id:assessmentId});if(calc.error)throw calc.error;
  const score=Number(calc.data?.motion_score);toast(Number.isFinite(score)?`Section complétée · KŌMØ Motion Score ${score.toFixed(1)}/100`:'Section complétée · d’autres éléments restent à renseigner.');setTimeout(()=>location.reload(),900);
}catch(e){console.error('[baseline completion]',e);toast(`Complétion impossible : ${e.message||e}`);busy=false;if(btn){btn.disabled=false;btn.textContent='Enregistrer les réponses manquantes + recalculer'}}}

async function render(){try{await load();let tries=0;const tick=()=>{if(renderPanel())return;if(++tries<12)setTimeout(tick,180)};tick()}catch(e){console.error('[baseline completion render]',e)}}
document.addEventListener('DOMContentLoaded',()=>setTimeout(render,950));window.addEventListener('pageshow',()=>setTimeout(render,600));setTimeout(render,1700);
window.KomoBaselineCompletion={version:'canonical-1',refresh:render};
