const KPPC_ORG_KEY='komo_clinical_org';
let kppcSubmitting=false;
function kppcQ(s,r=document){return r.querySelector(s)}
function kppcEsc(v=''){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function kppcClient(){return window.KomoRuntime?.client||null}
function kppcToast(m){const t=kppcQ('#toast');if(!t)return;t.textContent=m;t.hidden=false;clearTimeout(kppcToast.timer);kppcToast.timer=setTimeout(()=>t.hidden=true,3400)}
function kppcStyles(){if(kppcQ('#kppcStyles'))return;const s=document.createElement('style');s.id='kppcStyles';s.textContent=`
.kppc-new{border:1px solid #293a30!important;border-radius:12px!important;background:#293a30!important;color:#fff!important;padding:10px 13px!important;font:inherit!important;font-size:9px!important;font-weight:800!important;cursor:pointer!important;white-space:nowrap}
.kppc-overlay{position:fixed;inset:0;z-index:22000;display:grid;place-items:center;padding:24px;background:rgba(20,28,23,.54);backdrop-filter:blur(12px)}
.kppc-modal{width:min(680px,100%);max-height:calc(100dvh - 48px);overflow:auto;border-radius:28px;background:#f8f6f0;box-shadow:0 32px 100px rgba(20,28,23,.28);padding:28px}
.kppc-head{display:flex;justify-content:space-between;gap:18px;align-items:start}.kppc-head h2{margin:5px 0 7px;font-size:30px;letter-spacing:-.045em}.kppc-head p{margin:0;max-width:530px;color:#727b74;font-size:10px;line-height:1.55}.kppc-close{width:40px;height:40px;border:0;border-radius:50%;background:#e9e5dc;font-size:22px;cursor:pointer}
.kppc-form{display:grid;gap:12px;margin-top:24px}.kppc-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.kppc-form label>span{display:block;margin-bottom:6px;font-size:8px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#6d776f}.kppc-form input,.kppc-form select{width:100%;box-sizing:border-box;border:1px solid #dcd8d0;border-radius:12px;background:#fff;padding:12px;font:inherit;font-size:11px;color:#2c3831}
.kppc-account{display:grid;grid-template-columns:auto 1fr;gap:11px;align-items:start;margin-top:4px;padding:14px;border-radius:16px;background:#edf1eb;border:1px solid #dbe3da}.kppc-account input{width:17px;height:17px;margin-top:2px}.kppc-account strong,.kppc-account small{display:block}.kppc-account strong{font-size:10px}.kppc-account small{margin-top:4px;color:#6c766e;font-size:9px;line-height:1.45}.kppc-note{margin:0;color:#7b837c;font-size:9px;line-height:1.5}.kppc-feedback{min-height:16px;margin:0;font-size:9px;color:#8c5148}.kppc-submit{width:100%;border:0;border-radius:13px;background:#293a30;color:#fff;padding:13px 16px;font:inherit;font-size:10px;font-weight:800;cursor:pointer}.kppc-submit:disabled{opacity:.5}
@media(max-width:620px){.kppc-overlay{padding:0}.kppc-modal{min-height:100dvh;max-height:100dvh;border-radius:0;padding:22px 18px}.kppc-grid{grid-template-columns:1fr}}
`;document.head.appendChild(s)}

function kppcSelectedOrg(){return kppcQ('#k2twOrg')?.value||localStorage.getItem(KPPC_ORG_KEY)||''}
function kppcEnsureButton(){
  const tools=kppcQ('.k2tw-tools');if(!tools||kppcQ('#kppcNewPatient',tools))return;
  kppcStyles();
  const b=document.createElement('button');b.type='button';b.id='kppcNewPatient';b.className='kppc-new';b.textContent='+ Nouveau patient';
  tools.appendChild(b);b.addEventListener('click',kppcOpen);
}
function kppcOpen(){
  const org=kppcSelectedOrg();if(!org){kppcToast('Sélectionnez d’abord un centre.');return}
  kppcQ('#kppcOverlay')?.remove();kppcStyles();
  const el=document.createElement('div');el.id='kppcOverlay';el.className='kppc-overlay';
  el.innerHTML=`<section class="kppc-modal" role="dialog" aria-modal="true" aria-labelledby="kppcTitle">
    <header class="kppc-head"><div><p class="eyebrow">KŌMØ CENTRE · PATIENT</p><h2 id="kppcTitle">Ajouter un patient.</h2><p>Créez immédiatement le dossier centre. Si vous ajoutez son e-mail, KŌMØ peut aussi créer ou relier son compte Pulse et lui envoyer l'invitation.</p></div><button type="button" class="kppc-close" aria-label="Fermer">×</button></header>
    <form class="kppc-form" id="kppcForm">
      <div class="kppc-grid"><label><span>Prénom</span><input name="first_name" autocomplete="given-name" required></label><label><span>Nom</span><input name="last_name" autocomplete="family-name" required></label></div>
      <div class="kppc-grid"><label><span>Date de naissance</span><input name="birth_date" type="date" autocomplete="bday" required></label><label><span>Sexe de référence</span><select name="sex_at_birth"><option value="not_stated">Non renseigné</option><option value="female">Femme</option><option value="male">Homme</option><option value="intersex">Intersexe</option></select></label></div>
      <div class="kppc-grid"><label><span>E-mail</span><input name="email" type="email" autocomplete="email" placeholder="patient@exemple.com"></label><label><span>Téléphone</span><input name="phone" type="tel" autocomplete="tel" placeholder="+33 …"></label></div>
      <label class="kppc-account"><input name="create_account" type="checkbox" checked><span><strong>Créer / relier le compte Pulse</strong><small>Si l'adresse est nouvelle, le patient reçoit une invitation sécurisée. Si un compte KŌMØ existe déjà, il est relié au dossier sans recréer de compte.</small></span></label>
      <p class="kppc-note">Le dossier peut aussi être créé sans compte : décochez cette option pour commencer immédiatement la consultation puis inviter le patient plus tard.</p>
      <p class="kppc-feedback" id="kppcFeedback" role="status"></p>
      <button class="kppc-submit" type="submit">Créer le patient et son accès Pulse →</button>
    </form>
  </section>`;
  document.body.appendChild(el);
  kppcQ('.kppc-close',el)?.addEventListener('click',()=>el.remove());
  el.addEventListener('click',e=>{if(e.target===el)el.remove()});
  kppcQ('#kppcForm',el)?.addEventListener('submit',kppcSubmit);
  kppcQ('[name="create_account"]',el)?.addEventListener('change',e=>{const b=kppcQ('.kppc-submit',el);if(b)b.textContent=e.target.checked?'Créer le patient et son accès Pulse →':'Créer le dossier patient →'});
  kppcQ('[name="first_name"]',el)?.focus();
}
async function kppcSubmit(e){
  e.preventDefault();if(kppcSubmitting)return;
  const c=kppcClient(),form=e.currentTarget,feedback=kppcQ('#kppcFeedback',form),button=kppcQ('.kppc-submit',form),fd=new FormData(form);
  if(!c){if(feedback)feedback.textContent='Session Pulse indisponible.';return}
  const createAccount=fd.get('create_account')==='on',email=String(fd.get('email')||'').trim();
  if(createAccount&&!email){if(feedback)feedback.textContent='Ajoutez l’e-mail du patient ou décochez la création du compte Pulse.';return}
  kppcSubmitting=true;if(button){button.disabled=true;button.textContent='Création sécurisée…'}if(feedback)feedback.textContent='';
  try{
    const body={action:'create',organization_id:kppcSelectedOrg(),first_name:String(fd.get('first_name')||'').trim(),last_name:String(fd.get('last_name')||'').trim(),birth_date:String(fd.get('birth_date')||''),sex_at_birth:String(fd.get('sex_at_birth')||'not_stated'),email,phone:String(fd.get('phone')||'').trim(),create_account:createAccount};
    const {data,error}=await c.functions.invoke('professional-patient',{body});
    if(error)throw new Error(error.message||'Erreur serveur.');
    if(data?.error)throw new Error(data.detail||data.error);
    localStorage.setItem('komo_clinical_patient',data.patient.id);
    localStorage.removeItem('komo_clinical_assessment');
    kppcQ('#kppcOverlay')?.remove();
    const status=data.account?.invited?'Invitation Pulse envoyée.':data.account?.linked?'Compte Pulse existant relié.':'Dossier patient créé.';
    kppcToast(status);
    await window.KomoCenterWorkspace?.openPatients?.();
    setTimeout(()=>window.KomoCenterWorkspace?.openDossier?.(data.patient.id),180);
  }catch(err){if(feedback)feedback.textContent=err?.message||'Impossible de créer le patient.';if(button){button.disabled=false;button.textContent=createAccount?'Créer le patient et son accès Pulse →':'Créer le dossier patient →'}}
  finally{kppcSubmitting=false}
}
function kppcSchedule(){if(location.hash==='#clinical')setTimeout(kppcEnsureButton,80)}
const kppcObserver=new MutationObserver(kppcSchedule);kppcObserver.observe(document.body,{subtree:true,childList:true});
window.addEventListener('hashchange',kppcSchedule);window.addEventListener('komo:route-ready',kppcSchedule);document.addEventListener('DOMContentLoaded',()=>setTimeout(kppcEnsureButton,900));setTimeout(kppcEnsureButton,1500);
window.KomoProPatientCreate={open:kppcOpen};
