import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const URL='https://uqlolefsiktbznnymriy.supabase.co';
const KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const REM='komo_pulse_remember';
let client=null;

function storage(){return localStorage.getItem(REM)==='1'?localStorage:sessionStorage}
function sb(){if(!client)client=createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});return client}
function message(text){const el=document.querySelector('#clmMessage');if(el)el.textContent=text}

async function resolveOrganization(){
  const {data:{session}}=await sb().auth.getSession();
  if(!session?.user)throw new Error('Session expirée. Reconnectez-vous.');
  const result=await sb().from('organization_members')
    .select('organization_id,role,status,access_scope,organizations(id,name,slug,clinical_data_status,status)')
    .eq('user_id',session.user.id)
    .eq('status','active');
  if(result.error)throw result.error;
  const memberships=result.data||[];
  const selected=memberships.find(x=>x.organizations?.slug==='komo-poc')||memberships[0];
  if(!selected?.organization_id)throw new Error('Aucune organisation professionnelle active.');
  return selected;
}

async function submitPatient(event){
  event.preventDefault();
  event.stopImmediatePropagation();
  const form=event.currentTarget;
  if(form.dataset.komoSubmitting==='1')return;
  form.dataset.komoSubmitting='1';
  const button=form.querySelector('button[type="submit"]');
  if(button){button.disabled=true;button.textContent='Création…'}
  message('Création sécurisée du patient…');
  try{
    const fd=new FormData(form);
    const membership=await resolveOrganization();
    const payload={
      action:'create',
      organization_id:membership.organization_id,
      first_name:String(fd.get('first_name')||'').trim(),
      last_name:String(fd.get('last_name')||'').trim(),
      birth_date:String(fd.get('birth_date')||''),
      sex_at_birth:String(fd.get('sex_at_birth')||'')
    };
    const {data,error}=await sb().functions.invoke('professional-patient',{body:payload});
    if(error)throw new Error(error.message||'Erreur serveur lors de la création du patient.');
    if(data?.error)throw new Error(data.detail||data.error);
    if(!data?.patient?.id)throw new Error('Le patient a été créé mais son identifiant est indisponible.');
    localStorage.setItem('komo_clinical_patient',data.patient.id);
    localStorage.removeItem('komo_clinical_assessment');
    message('Patient créé. Ouverture du dossier…');
    setTimeout(()=>location.reload(),250);
  }catch(err){
    message(err?.message||'Impossible de créer le patient.');
    form.dataset.komoSubmitting='0';
    if(button){button.disabled=false;button.textContent='Créer le dossier synthétique'}
  }
}

function bind(){
  const form=document.querySelector('#clmNewPatient');
  if(!form||form.dataset.komoPatientCreateFix==='1')return;
  form.dataset.komoPatientCreateFix='1';
  // Capture phase intentionally runs before clinical-motion-v1's direct RLS insert handler.
  form.addEventListener('submit',submitPatient,true);
}

const observer=new MutationObserver(()=>bind());
observer.observe(document.body,{childList:true,subtree:true});
document.addEventListener('DOMContentLoaded',bind);
setTimeout(bind,600);
