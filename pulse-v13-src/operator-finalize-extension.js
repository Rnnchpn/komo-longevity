
// KŌMØ Pulse V13 — Operator finalization extension.
// Kept build-time concatenated into app.js so V13 still loads one application script.
async function komoV13FinalizeActiveOperatorSession(){
  const patientId=localStorage.getItem('komo_v13_patient');
  if(!patientId)return toast('Sélectionnez un patient.');
  const {data:rows,error}=await sb.from('pulse_operator_sessions')
    .select('id,status')
    .eq('patient_id',patientId)
    .in('status',['draft','running','paused','review'])
    .order('created_at',{ascending:false})
    .limit(1);
  if(error)return toast(error.message);
  const session=rows?.[0];
  if(!session)return toast('Aucune session D0 active.');
  const {data,error:finalizeError}=await sb.rpc('finalize_pulse_operator_session_v1',{p_session_id:session.id});
  if(finalizeError)return toast(finalizeError.message);
  toast(data?.status==='completed'
    ? 'D0 finalisé · checkpoints S2/S6/S12/M6/M12 créés.'
    : 'D0 transmis en revue clinique.');
  await loadPro();
  operator();
}
function komoV13MountFinalize(){
  if(location.hash.replace(/^#/,'')!=='operator')return;
  const actions=[...document.querySelectorAll('.actions')].find(x=>x.closest('.card')?.textContent?.includes('KŌMØ OPERATOR TEAM'));
  if(!actions||actions.querySelector('#finalizeOp'))return;
  const b=document.createElement('button');
  b.id='finalizeOp';
  b.type='button';
  b.className='btn green';
  b.textContent='Finaliser D0';
  b.addEventListener('click',komoV13FinalizeActiveOperatorSession);
  actions.appendChild(b);
}
window.addEventListener('hashchange',()=>setTimeout(komoV13MountFinalize,80));
new MutationObserver(()=>requestAnimationFrame(komoV13MountFinalize))
  .observe(document.documentElement,{subtree:true,childList:true});
setTimeout(komoV13MountFinalize,500);
