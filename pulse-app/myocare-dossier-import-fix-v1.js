import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const URL='https://uqlolefsiktbznnymriy.supabase.co';
const KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const REM='komo_pulse_remember';
const ASSESSMENT_KEY='komo_clinical_assessment';
let client=null;

function storage(){return localStorage.getItem(REM)==='1'?localStorage:sessionStorage}
function sb(){return window.KomoRuntime?.client||(client||(client=createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})))}
function toast(message){const t=document.querySelector('#toast');if(!t)return;t.textContent=message;t.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.hidden=true,3200)}
function style(){if(document.querySelector('#kmdi-style'))return;const s=document.createElement('style');s.id='kmdi-style';s.textContent=`
.kmdi-shell{margin-top:12px;padding:16px;border:1px solid #d9dfd8;border-radius:18px;background:linear-gradient(145deg,#fbfcfa,#f1f5f0)}.kmdi-head{display:flex;justify-content:space-between;gap:12px;align-items:start;margin-bottom:12px}.kmdi-head small{display:block;font-size:8px;letter-spacing:.09em;text-transform:uppercase;color:#728078;font-weight:800}.kmdi-head strong{display:block;margin-top:5px;font-size:13px;color:#304039}.kmdi-head span{display:block;margin-top:4px;font-size:8px;color:#7b847e}.kmdi-shell #clmImporter{margin-top:8px}.kmdi-shell .clm-import{margin:0}.kmdi-shell .clm-drop{background:#fff!important}.kmdi-ready{padding:9px 10px;border-radius:11px;background:#e9f0e9;color:#536b58;font-size:8px;font-weight:750}
`;
document.head.appendChild(s)}

async function directImport(){
  const host=document.querySelector('#k2twImportHost');
  const assessmentId=localStorage.getItem(ASSESSMENT_KEY)||'';
  if(!host){toast('Ouvrez d’abord le dossier patient.');return}
  if(!assessmentId){toast('Aucun bilan Motion actif pour ce patient.');return}
  style();
  let importer=document.querySelector('#clmImporter');
  host.innerHTML='';
  const shell=document.createElement('section');shell.className='kmdi-shell';
  shell.innerHTML='<div class="kmdi-head"><div><small>IMPORT MYOCARE · DOSSIER PATIENT</small><strong>Sélectionnez l’export Excel MyoCare.</strong><span>.xlsx · .xls · .csv · .json · aperçu avant enregistrement</span></div><div class="kmdi-ready">Bilan Motion sélectionné</div></div>';
  if(importer){shell.appendChild(importer)}else{importer=document.createElement('div');importer.id='clmImporter';shell.appendChild(importer)}
  host.appendChild(shell);
  const {data:{session}}=await sb().auth.getSession();
  if(!session?.user){toast('Session expirée. Reconnectez-vous.');return}
  window.dispatchEvent(new CustomEvent('komo:clinical-motion-render',{detail:{assessmentId,userId:session.user.id}}));
  let tries=0;
  const ready=()=>{
    const input=host.querySelector('#clmFile');
    if(input){shell.scrollIntoView({behavior:'smooth',block:'center'});toast('Import MyoCare prêt : choisissez maintenant le fichier Excel.');return}
    if(tries++<30)setTimeout(ready,80);else toast('L’importeur n’a pas pu se charger. Actualisez puis réessayez.');
  };
  setTimeout(ready,20);
}

document.addEventListener('click',e=>{
  const button=e.target.closest?.('[data-k2tw-import]');
  if(!button)return;
  e.preventDefault();
  e.stopImmediatePropagation();
  e.stopPropagation();
  directImport().catch(err=>{console.error('[myocare-dossier-import]',err);toast('Impossible de préparer l’import MyoCare.');});
},true);

window.KomoMyoCareDossierImport={open:directImport};
