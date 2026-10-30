// Motion Online: only authenticated, paid, consented bookings reach private persistence.
// Browser never holds the database service key. No photo, video or audio is sent.
import {snapshotProgress} from './session-progress.mjs';
export const CONSENT_VERSION='KOMO_MOTION_ONLINE_CONSENT_V1';
const URL='https://uqlolefsiktbznnymriy.supabase.co/functions/v1/motion-online-dossier';
const STRIPE_URL='https://uqlolefsiktbznnymriy.supabase.co/functions/v1/motion-online-stripe-dossier';
const STRIPE_SESSION=/^cs_(?:test|live)_[A-Za-z0-9]{8,200}$/;
const PUBLISHABLE='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
async function request({accessToken,appointmentId,mode,snapshot,fetcher=fetch}){
 const stripe=STRIPE_SESSION.test(String(appointmentId||''));
 if(!stripe&&!/^[1-9][0-9]{0,11}$/.test(String(appointmentId||'')))throw Error('invalid_booking');
 if(typeof accessToken!=='string'||!accessToken)throw Error('authentication_required');
 const input=stripe?{checkoutSessionId:String(appointmentId),mode}:{appointmentId:String(appointmentId),mode};
 if(mode==='save'){
  input.consentAccepted=true;
  input.consentVersion=CONSENT_VERSION;
  input.snapshot=snapshotProgress(snapshot);
 }
 const response=await fetcher(stripe?STRIPE_URL:URL,{method:'POST',headers:{
  apikey:PUBLISHABLE,authorization:'Bearer '+accessToken,'content-type':'application/json'
 },cache:'no-store',body:JSON.stringify(input)});
 const data=await response.json();
 if(!response.ok||data.ok!==true)throw Error(data.error||'secure_storage_unavailable');
 return data;
}
export async function loadSecureDossier(accessToken,appointmentId,fetcher){
 return request({accessToken,appointmentId,mode:'load',fetcher});
}
export async function saveSecureDossier(accessToken,appointmentId,state,fetcher){
 return request({accessToken,appointmentId,mode:'save',snapshot:state,fetcher});
}
export function createDossierQueue({accessToken,appointmentId,onStatus=()=>{},fetcher}){
 let last=null,inflight=false,timer=null,destroyed=false,staged='',written='',failure=false;
 const encode=state=>JSON.stringify(snapshotProgress(state));
 async function drain(){
  if(destroyed||inflight||last===null)return;
  inflight=true;
  while(!destroyed&&last!==null){
   const current=last;last=null;staged=current;
   onStatus('Enregistrement sécurisé…','saving');
   try{
    await saveSecureDossier(accessToken,appointmentId,JSON.parse(current),fetcher);
    written=current;failure=false;
    onStatus('Progression enregistrée dans Pulse','saved');
   }catch{
    failure=true;if(last===null)last=current; // Never overwrite a newer queued snapshot.
    onStatus('Sauvegarde impossible : vérifiez la connexion avant de quitter cette page.','error');
    break;
   }
  }
  inflight=false;
 }
 return {
  enqueue(state){
   if(destroyed)return;
   const encoded=encode(state);
   if(encoded===written&&!failure)return;
   last=encoded;
   if(timer)clearTimeout(timer);
   timer=setTimeout(()=>{timer=null;void drain()},450);
  },
  async flush(){
   if(timer){clearTimeout(timer);timer=null;}
   await drain();
   if(inflight){while(inflight)await new Promise(resolve=>setTimeout(resolve,30));}
   return !failure&&last===null;
  },
  async firstSave(state){
   const encoded=encode(state);
   try{
    onStatus('Création de votre dossier privé…','saving');
    await saveSecureDossier(accessToken,appointmentId,JSON.parse(encoded),fetcher);
    written=encoded;failure=false;onStatus('Dossier créé et protégé','saved');return true;
   }catch{
    onStatus('Dossier indisponible : impossible de démarrer sans enregistrement sécurisé.','error');
    return false;
   }
  },
  destroy(){destroyed=true;if(timer)clearTimeout(timer);timer=null;last=null;},
  getStatus(){return {failure,hasPending:Boolean(last)||inflight,written:written.length>0}}
 };
}
