import {getSession,connectPulse,onSession} from '/world/komo-world-auth-v1.js?v=1';

const SUPABASE_URL='https://uqlolefsiktbznnymriy.supabase.co';
const SUPABASE_KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const state=document.querySelector('#cardState');
const pathToken=decodeURIComponent(location.pathname.split('/').filter(Boolean)[1]||'');
const token=new URLSearchParams(location.search).get('token')||pathToken;

function render(title,lead,actions='',tag=''){
  state.innerHTML='<p class="ey">KŌMØ CARD</p><h1>'+title+'</h1><p class="lead">'+lead+'</p>'+(tag?'<span class="tag">'+tag+'</span>':'')+(actions?'<div class="actions">'+actions+'</div>':'');
  document.querySelector('[data-confirm]')?.addEventListener('click',()=>connectPulse());
}
export async function verifyCardTap(cardToken=token){
  if(!cardToken||cardToken.length<20){render('Card not recognised.','This KŌMØ Card link is incomplete or invalid.','<a href="/world/">OPEN KŌMØ WORLD</a>');return}
  const session=await getSession();
  const res=await fetch(SUPABASE_URL+'/functions/v1/world-card',{
    method:'POST',
    headers:{'content-type':'application/json','apikey':SUPABASE_KEY,'authorization':'Bearer '+(session?.access_token||SUPABASE_KEY)},
    body:JSON.stringify({token:cardToken})
  });
  let data={};try{data=await res.json()}catch{}
  if(res.status===404||data.detected===false){render('Card not recognised.','This card is not registered with KŌMØ.','<a href="/world/">OPEN KŌMØ WORLD</a>');return}
  if(res.status===410||data.active===false){render('Card inactive.','This KŌMØ Card has been revoked, replaced or reported inactive. Contact KŌMØ if you need assistance.','<a href="mailto:contact@komolongevity.com">CONTACT KŌMØ</a>','INACTIVE');return}
  if(data.identity_required){render('Card detected.','Confirm your identity to open the World linked to this card.','<button class="primary" data-confirm>CONFIRM MY IDENTITY</button><a href="/world/">CONTINUE TO PUBLIC WORLD</a>',String(data.card_type||'KŌMØ').toUpperCase());return}
  if(res.status===403&&data.error==='card_identity_mismatch'){render('Identity does not match.','This card belongs to another KŌMØ identity. No access has been granted.','<a href="/world/">OPEN MY WORLD</a>','PROTECTED');return}
  if(res.status===403&&data.error==='membership_inactive'){render('Membership inactive.','The card was recognised, but its KŌMØ membership is not currently active.','<a href="mailto:contact@komolongevity.com">CONTACT KŌMØ</a>');return}
  if(res.ok&&data.owner&&data.membership_active){
    render('Welcome to KŌMØ '+String(data.tier||'').toUpperCase()+'.','Identity confirmed. Opening your World…','','IDENTITY CONFIRMED');
    setTimeout(()=>location.replace(data.redirect||'/world/?card=1'),650);return;
  }
  render('Unable to read card.','Please try again or continue to KŌMØ World.','<a href="/world/">OPEN KŌMØ WORLD</a>');
}
let lastSessionUser='__init__';
async function runVerification(){
  const session=await getSession();
  const uid=session?.user?.id||'';
  if(uid===lastSessionUser&&lastSessionUser!=='__init__')return;
  lastSessionUser=uid;
  await verifyCardTap(token);
}
window.KomoCardNfc={version:'1.0.0',verifyCardTap};
onSession(()=>runVerification());
runVerification();