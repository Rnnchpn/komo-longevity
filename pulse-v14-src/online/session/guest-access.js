import {snapshotProgress} from './session-progress.mjs';
const GUEST_ENDPOINT='https://uqlolefsiktbznnymriy.supabase.co/functions/v1/motion-online-guest';
const GUEST_KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const GUEST_CONSENT='KOMO_MOTION_ONLINE_CONSENT_V1';
export const guestInvite=new URLSearchParams(window.location.search).get('invite')||'';

export async function guestRequest(action,snapshot=null){
 if(!/^[A-Za-z0-9_-]{43}$/.test(guestInvite))throw Error('invitation_invalide');
 const payload={action,invite:guestInvite};
 if(action==='save'){payload.snapshot=snapshot;payload.consentAccepted=true;payload.consentVersion=GUEST_CONSENT;}
 const response=await fetch(GUEST_ENDPOINT,{method:'POST',cache:'no-store',credentials:'omit',
  headers:{'Content-Type':'application/json',apikey:GUEST_KEY},body:JSON.stringify(payload)});
 let data={};try{data=await response.json()}catch{throw Error('serveur_indisponible')}
 if(!response.ok||data.ok!==true)throw Error(data.error||'invitation_indisponible');
 return data;
}
export function createGuestQueue(onStatus=()=>{}){
 let last=null,inflight=false,timer=null,destroyed=false,failed=false;
 const encode=s=>JSON.stringify(snapshotProgress(s));
 async function drain(){
  if(destroyed||inflight||last===null)return;
  inflight=true;
  while(!destroyed&&last!==null){
   const current=last;last=null;onStatus('Enregistrement sécurisé…');
   try{await guestRequest('save',JSON.parse(current));failed=false;onStatus('Progression enregistrée dans Pulse');}
   catch{failed=true;if(last===null)last=current;onStatus('Enregistrement indisponible : conservez cette page ouverte et vérifiez la connexion.');break;}
  }
  inflight=false;
 }
 return {
  enqueue(state){if(destroyed)return;last=encode(state);if(timer)clearTimeout(timer);timer=setTimeout(()=>{timer=null;void drain()},450);},
  async firstSave(state){
   try{onStatus('Ouverture de votre dossier privé…');await guestRequest('save',snapshotProgress(state));
    failed=false;onStatus('Dossier privé ouvert et sécurisé');return true;
   }catch{onStatus('Impossible de créer le dossier : vérifiez votre connexion.');return false;}
  },
  async flush(){
   if(timer){clearTimeout(timer);timer=null;}
   await drain();
   if(inflight){while(inflight)await new Promise(resolve=>setTimeout(resolve,35));}
   return !failed&&last===null;
  },
  destroy(){destroyed=true;if(timer)clearTimeout(timer);last=null;}
 };
}

