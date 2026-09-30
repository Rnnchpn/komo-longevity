function sb(){return window.KomoRuntime?.client||null}
function message(text){const el=document.querySelector('#clmMessage');if(el)el.textContent=text;const t=document.querySelector('#toast');if(t&&text){t.textContent=text;t.hidden=false;clearTimeout(message.timer);message.timer=setTimeout(()=>t.hidden=true,3400)}}
async function resolveOrganization(){
  const c=sb();if(!c)throw new Error('Session indisponible.');
  const {data:{session}}=await c.auth.getSession();if(!session?.user)throw new Error('Session expirée. Reconnectez-vous.');
  const result=await c.from('organization_members').select('organization_id,role,status,access_scope,organizations(id,name,slug,clinical_data_status,status)').eq('user_id',session.user.id).eq('status','active');
  if(result.error)throw result.error;
  const memberships=result.data||[];if(!memberships.length)throw new Error('Aucune organisation professionnelle active.');
  const selectedId=localStorage.getItem('komo_clinical_org')||'';
  let selected=selectedId?memberships.find(x=>x.organization_id===selectedId):null;
  if(!selected&&memberships.length===1)selected=memberships[0];
  if(!selected&&memberships.length>1)throw new Error('Sélectionnez le centre concerné avant de créer le patient.');
  if(!selected?.organization_id)throw new Error('Centre professionnel invalide.');
  localStorage.setItem('komo_clinical_org',selected.organization_id);return selected;
}
async function createPatient(fd){
  const c=sb();if(!c)throw new Error('Session indisponible.');
  const membership=await resolveOrganization();
  const firstName=String(fd.get('first_name')||'').trim(),lastName=String(fd.get('last_name')||'').trim();
  const birthDate=String(fd.get('birth_date')||''),email=String(fd.get('email')||'').trim(),phone=String(fd.get('phone')||'').trim();
  const createAccount=fd.get('create_account')==='on';
  if(!firstName||!lastName||!birthDate)throw new Error('Prénom, nom et date de naissance sont requis.');
  if(createAccount&&!email)throw new Error('Ajoutez l’e-mail du patient pour créer son accès Pulse.');
  const {data,error}=await c.rpc('komo_professional_create_patient',{
    p_organization_id:membership.organization_id,p_first_name:firstName,p_last_name:lastName,p_birth_date:birthDate,
    p_sex_at_birth:String(fd.get('sex_at_birth')||'not_stated'),p_email:email||null,p_phone:phone||null
  });
  if(error)throw error;
  const patient=data?.patient;if(!patient?.id)throw new Error('Le dossier patient n’a pas pu être créé.');
  if(createAccount){
    const {error:inviteError}=await c.auth.signInWithOtp({
      email,
      options:{shouldCreateUser:true,emailRedirectTo:'https://pulse.komolongevity.com/?mode=patient',data:{
        first_name:firstName,last_name:lastName,birth_date:birthDate,phone:phone||undefined,
        display_name:`${firstName} ${lastName}`.trim(),locale:'fr-FR',komo_patient_id:patient.id
      }}
    });
    if(inviteError)throw new Error('Dossier créé, mais l’accès Pulse n’a pas pu être envoyé : '+inviteError.message);
  }
  localStorage.setItem('komo_clinical_patient',patient.id);localStorage.removeItem('komo_clinical_assessment');
  return{patient,invited:createAccount,linked:Boolean(data?.account?.linked)};
}
async function submitPatient(event){
  event.preventDefault();event.stopImmediatePropagation();
  const form=event.currentTarget;if(form.dataset.komoSubmitting==='1')return;form.dataset.komoSubmitting='1';
  const button=form.querySelector('button[type="submit"]');if(button){button.disabled=true;button.textContent='Création sécurisée…'}
  const feedback=form.querySelector('[data-patient-create-feedback]');if(feedback)feedback.textContent='';
  try{
    const result=await createPatient(new FormData(form));
    document.querySelector('#komoPatientCreateModal')?.remove();
    message(result.invited?'Patient créé · accès Pulse envoyé.':'Dossier patient créé.');
    await window.KomoCenterWorkspace?.openPatients?.();
    setTimeout(()=>window.KomoCenterWorkspace?.openDossier?.(result.patient.id),120);
  }catch(err){
    const msg=err?.message||'Impossible de créer le patient.';if(feedback)feedback.textContent=msg;else message(msg);
    form.dataset.komoSubmitting='0';if(button){button.disabled=false;button.textContent=form.querySelector('[name="create_account"]')?.checked?'Créer le patient et envoyer l’accès Pulse →':'Créer le dossier patient →'}
  }
}
function openPatientModal(){
  document.querySelector('#komoPatientCreateModal')?.remove();
  const m=document.createElement('div');m.id='komoPatientCreateModal';m.className='pro-create-modal';
  m.innerHTML=`<div class="pro-create-backdrop" data-patient-create-close></div><section class="pro-create-sheet" role="dialog" aria-modal="true" aria-labelledby="patientCreateTitle"><button class="pro-create-close" type="button" data-patient-create-close>×</button><p class="eyebrow">KŌMØ CENTRE · PATIENT</p><h2 id="patientCreateTitle">Ajouter un patient.</h2><p class="pro-create-lead">Créez son dossier puis envoyez, si vous le souhaitez, son accès personnel Pulse par lien magique sécurisé.</p><form class="pro-create-form" id="komoPatientCreateForm"><div class="pro-create-fields"><label class="field"><span>Prénom *</span><input name="first_name" autocomplete="given-name" required></label><label class="field"><span>Nom *</span><input name="last_name" autocomplete="family-name" required></label><label class="field"><span>Date de naissance *</span><input name="birth_date" type="date" autocomplete="bday" required></label><label class="field"><span>Sexe de référence</span><select name="sex_at_birth"><option value="not_stated">Non renseigné</option><option value="female">Femme</option><option value="male">Homme</option><option value="intersex">Intersexe</option></select></label><label class="field"><span>E-mail</span><input name="email" type="email" autocomplete="email" placeholder="patient@exemple.com"></label><label class="field"><span>Téléphone</span><input name="phone" type="tel" autocomplete="tel" placeholder="+33 …"></label></div><label class="pro-create-consent"><input type="checkbox" name="create_account" checked><span><strong>Créer / relier son accès Pulse</strong><br>Le patient reçoit un lien de connexion sécurisé. Un compte KŌMØ existant est automatiquement relié au dossier.</span></label><p class="auth-pro-note">Vous pouvez décocher cette option pour commencer la consultation immédiatement sans bloquer sur la création du compte.</p><button class="primary-button pro-create-submit" type="submit">Créer le patient et envoyer l’accès Pulse →</button><p class="pro-create-feedback" data-patient-create-feedback></p></form></section>`;
  document.body.appendChild(m);
  m.querySelectorAll('[data-patient-create-close]').forEach(x=>x.addEventListener('click',()=>m.remove()));
  const form=m.querySelector('#komoPatientCreateForm');form.addEventListener('submit',submitPatient,true);
  form.querySelector('[name="create_account"]')?.addEventListener('change',e=>{form.querySelector('button[type="submit"]').textContent=e.target.checked?'Créer le patient et envoyer l’accès Pulse →':'Créer le dossier patient →'});
  form.querySelector('[name="first_name"]')?.focus();
}
function ensureQuickCreate(){
  const tools=document.querySelector('.k2tw-tools');if(!tools||tools.querySelector('[data-patient-quick-create]'))return;
  const b=document.createElement('button');b.type='button';b.className='k2tw-btn primary';b.dataset.patientQuickCreate='1';b.textContent='+ Nouveau patient';
  tools.appendChild(b);b.addEventListener('click',openPatientModal);
}
function bind(){
  const form=document.querySelector('#clmNewPatient');
  if(form&&form.dataset.komoPatientCreateFix!=='1'){form.dataset.komoPatientCreateFix='1';form.addEventListener('submit',submitPatient,true)}
  ensureQuickCreate();
}
const host=document.querySelector('#viewRoot');if(host){const observer=new MutationObserver(()=>bind());observer.observe(host,{childList:true,subtree:true})}
window.addEventListener('komo:session-ready',bind);window.addEventListener('komo:route-ready',bind);document.addEventListener('DOMContentLoaded',bind);setTimeout(bind,600);
window.KomoPatientCreate={open:openPatientModal};
