(()=>{
'use strict';
const sb=window.supabase?.createClient('https://uqlolefsiktbznnymriy.supabase.co','sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n',
 {auth:{autoRefreshToken:true,persistSession:true,detectSessionInUrl:true}});
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
let current=null,owner=false,broker=null;
const val=id=>$(id).value.trim();
const msg=(id,s)=>{$(id).textContent=s};
const httpsOrNull=id=>{const v=val(id);if(!v)return null;try{const u=new URL(v);if(u.protocol!=='https:')throw Error('HTTPS required');return u.href}catch{throw Error('Les liens doivent commencer par https://')}};
const fmt=dt=>dt?new Date(dt).toLocaleDateString('fr-FR'):'—';
function box(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=String(txt);return e}
function showTab(name){$$('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===name));$$('.tab').forEach(el=>el.hidden=el.id!==name)}

let yachtStep=1;
const RECORD_PAGES={myListings:0,myCampaigns:0,adminItems:0};
function setBrokerScreen(screen){
 if(!['profile','listings','campaigns','myitems','admin'].includes(screen))return;
 if(screen==='admin'&&!owner)return;
 document.body.dataset.brokerScreen=screen;
 if(screen==='profile')showTab('listings');else if(screen!=='admin')showTab(screen);
 $('#brokerDock [data-broker-screen]').forEach(b=>{
  const active=b.dataset.brokerScreen===screen;
  b.classList.toggle('is-active',active);b.setAttribute('aria-current',active?'page':'false');
 });
}
function setYachtStep(n,{validate=false}={}){
 const next=Math.max(1,Math.min(3,n));
 if(validate&&next>yachtStep){
  const fields=[...$('#yachtForm .fields').children].slice((yachtStep===1?0:yachtStep===2?4:7),yachtStep===1?4:yachtStep===2?7:10);
  for(const field of fields){
   const el=field.querySelector('input,textarea,select');
   if(el&&!el.checkValidity()){el.reportValidity();return}
  }
 }
 yachtStep=next;document.body.dataset.listingStep=String(yachtStep);
 $('#listingStepLabel').textContent='ÉTAPE 0'+yachtStep+' / 03';
 $('#listingPrev').disabled=yachtStep===1;$('#listingNext').hidden=yachtStep===3;
}
function paginateRecord(id,limit){
 const host=$('#'+id);if(!host)return;
 const rows=[...host.children].filter(e=>e.classList.contains('entry'));
 const total=Math.max(1,Math.ceil(rows.length/limit));
 const page=Math.max(0,Math.min(total-1,RECORD_PAGES[id]||0));
 RECORD_PAGES[id]=page;
 rows.forEach((row,i)=>{row.hidden=i<page*limit||i>=(page+1)*limit});
 let pager=host.nextElementSibling;
 if(!pager?.classList.contains('broker-record-pager')){
  pager=document.createElement('div');pager.className='broker-record-pager';host.insertAdjacentElement('afterend',pager);
  const prev=box('button','','←');prev.type='button';prev.dataset.dir='-1';
  const label=box('span','','01 / 01');
  const next=box('button','','→');next.type='button';next.dataset.dir='1';
  pager.append(prev,label,next);
  [prev,next].forEach(b=>b.addEventListener('click',()=>{RECORD_PAGES[id]+=Number(b.dataset.dir);paginateRecord(id,limit)}));
 }
 pager.hidden=rows.length<=limit;
 pager.querySelector('span').textContent=String(page+1).padStart(2,'0')+' / '+String(total).padStart(2,'0');
 pager.querySelector('[data-dir="-1"]').disabled=page===0;
 pager.querySelector('[data-dir="1"]').disabled=page===total-1;
}

function row(title,desc,status){const e=box('article','entry');e.append(box('span','pill',status),box('h3','',title),box('p','',desc));return e}
function needLogin(){if(!current)throw Error('Veuillez vous connecter avant de continuer.')}
function needBroker(){needLogin();if(!broker)throw Error('Enregistrez d’abord votre profil broker.')}
async function loadState(){
 if(!sb)return msg('#authMessage','Bibliothèque de connexion indisponible.');
 const {data:{user},error}=await sb.auth.getUser();
 current=error?null:user;
 $('#signIn').hidden=!!current;$('#workspace').hidden=!current;
 $('#brokerDock').hidden=!current;if(!current)return;
 $('#whoami').textContent='SESSION BROKER · '+current.email;
 const check=await sb.rpc('elysium_verified_owner');owner=check.data===true;
 $('#adminPanel').hidden=!owner;
 const adm=$('#brokerDock [data-broker-screen="admin"]');if(adm)adm.hidden=!owner;
 const r=await sb.from('elysium_brokers').select('user_id,company_name,contact_name,contact_email,website,operating_area,verification_status').eq('user_id',current.id).maybeSingle();
 broker=r.data||null;
 if(broker){
  $('#company').value=broker.company_name;$('#contact').value=broker.contact_name;$('#brokerEmail').value=broker.contact_email;
  $('#website').value=broker.website||'';$('#territory').value=broker.operating_area;
 }
 $('#verification').textContent=broker?'Vérification : '+broker.verification_status.toUpperCase():'Profil à enregistrer pour déposer vos annonces.';
 await refreshMyItems();
 if(owner)await refreshAdmin();
}
async function login(){
 const email=val('#email'),password=$('#password').value;
 if(!email||!password)return msg('#authMessage','Renseignez votre e-mail et votre mot de passe.');
 const {error}=await sb.auth.signInWithPassword({email,password});
 if(error)return msg('#authMessage',error.message);
 msg('#authMessage','Connexion confirmée.');
 await loadState();
}
async function magicLink(){
 const email=val('#email');if(!email)return msg('#authMessage','Renseignez votre e-mail.');
 const {error}=await sb.auth.signInWithOtp({email,options:{emailRedirectTo:location.origin+'/elysium/club/',shouldCreateUser:true}});
 msg('#authMessage',error?error.message:'Lien envoyé. Après connexion, revenez sur ELYSIUM Broker Studio.');
}
async function saveProfile(ev){
 ev.preventDefault();needLogin();
 const values={user_id:current.id,company_name:val('#company'),contact_name:val('#contact'),
 contact_email:val('#brokerEmail'),website:httpsOrNull('#website'),operating_area:val('#territory')||'Riviera'};
 const editValues={...values};delete editValues.user_id;
 const r=broker?await sb.from('elysium_brokers').update(editValues).eq('user_id',current.id):
 await sb.from('elysium_brokers').insert(values);
 if(r.error)throw r.error;
 msg('#profileMessage','Profil enregistré. Vérification par ELYSIUM en cours.');
 await loadState();
}
async function submitYacht(ev){
 ev.preventDefault();needBroker();
 if(!$('#rightToPublish').checked)throw Error('Confirmez que vous avez les droits sur cette annonce et ses visuels.');
 const values={broker_user_id:current.id,title:val('#offerTitle'),yacht_name:val('#yachtName'),
 listing_type:val('#listingType'),location_city:val('#city'),length_m:val('#length')?Number(val('#length')):null,
 price_eur:val('#price')?Number(val('#price')):null,description:val('#description'),
 image_url:httpsOrNull('#image'),external_url:httpsOrNull('#external')};
 const {error}=await sb.from('elysium_yacht_listings').insert(values);
 if(error)throw error;
 msg('#listingMessage','Annonce transmise pour vérification. Sa publication est conditionnée au contrôle du mandat et au paiement de l’emplacement.');
 $('#yachtForm').reset();setYachtStep(1);await refreshMyItems();
}
async function submitCampaign(ev){
 ev.preventDefault();needBroker();
 const values={broker_user_id:current.id,placement:val('#placement'),location_city:val('#adCity'),
 headline:val('#adHeadline'),sponsor_name:broker.company_name,request_days:Number(val('#adDays')),listing_id:val('#adListing')||null};
 const {error}=await sb.from('elysium_ad_campaigns').insert(values);
 if(error)throw error;
 msg('#campaignMessage','Demande publicitaire enregistrée. ELYSIUM vous transmettra un devis et les modalités de paiement.');
 $('#campaignForm').reset();await refreshMyItems();
}
async function refreshMyItems(){
 if(!current)return;
 const [l,c]=await Promise.all([
 sb.from('elysium_yacht_listings').select('id,title,yacht_name,location_city,status,billing_status,paid_until').eq('broker_user_id',current.id).order('created_at',{ascending:false}).limit(50),
 sb.from('elysium_ad_campaigns').select('id,headline,placement,location_city,status,payment_status,confirmed_price_eur,ends_at').eq('broker_user_id',current.id).order('created_at',{ascending:false}).limit(50)
 ]);
 const host=$('#myListings'),ads=$('#myCampaigns'),select=$('#adListing');host.replaceChildren();ads.replaceChildren();
 select.replaceChildren(new Option('CAMPAGNE INSTITUTIONNELLE',''));
 (l.data||[]).forEach(x=>{
  host.append(row(x.title,x.location_city+' · '+x.yacht_name+' · paiement '+x.billing_status+(x.paid_until?' · jusqu’au '+fmt(x.paid_until):''),x.status.toUpperCase()));
  select.add(new Option(x.yacht_name+' — '+x.location_city,x.id));
 });
 if(!l.data?.length)host.append(box('p','note','Aucune annonce soumise.'));
 (c.data||[]).forEach(x=>ads.append(row(x.headline,x.placement+' · '+x.location_city+' · règlement '+x.payment_status+(x.ends_at?' · échéance '+fmt(x.ends_at):''),x.status.toUpperCase())));
 if(!c.data?.length)ads.append(box('p','note','Aucune campagne.'));
 paginateRecord('myListings',2);paginateRecord('myCampaigns',2);
}
async function refreshAdmin(){
 if(!owner)return;
 const host=$('#adminItems');host.replaceChildren();
 const [b,l,c]=await Promise.all([
 sb.from('elysium_brokers').select('user_id,company_name,contact_email,verification_status').order('created_at',{ascending:false}).limit(40),
 sb.from('elysium_yacht_listings').select('id,title,location_city,status,billing_status,broker_user_id').order('created_at',{ascending:false}).limit(60),
 sb.from('elysium_ad_campaigns').select('id,headline,placement,location_city,status,payment_status').order('created_at',{ascending:false}).limit(50)
 ]);
 function action(parent,label,fn){
  const btn=box('button','secondary',label);btn.type='button';btn.addEventListener('click',async()=>{btn.disabled=true;try{await fn();await refreshAdmin()}catch(e){alert(e.message||String(e))}finally{btn.disabled=false}});parent.append(btn);
 }
 (b.data||[]).forEach(x=>{
  const el=row(x.company_name,x.contact_email,x.verification_status);
  if(x.verification_status==='pending')action(el,'VÉRIFIER LE BROKER',async()=>{
   if(!confirm('Avez-vous vérifié l’identité de ce broker et son activité professionnelle ?'))return;
   const r=await sb.rpc('elysium_moderate_broker',{p_user_id:x.user_id,p_verified:true});if(r.error)throw r.error
  });
  host.append(el);
 });
 (l.data||[]).forEach(x=>{
  const el=row('YACHT · '+x.title,x.location_city+' · '+x.billing_status,x.status);
  if(x.status==='pending_review')action(el,'VALIDER L’ANNONCE',async()=>{
   if(!confirm('Mandat, droits de diffusion et vérification du broker contrôlés ?'))return;
   const r=await sb.rpc('elysium_moderate_yacht',{p_id:x.id,p_approve:true});if(r.error)throw r.error
  });
  if(x.status==='approved'&&x.billing_status!=='paid')action(el,'CONFIRMER PAIEMENT REÇU',async()=>{
   if(!confirm('ATTENTION : confirmez uniquement après constat réel du règlement et vérification du justificatif.'))return;
   const until=new Date(Date.now()+30*86400000).toISOString();
   const r=await sb.rpc('elysium_confirm_listing_payment',{p_id:x.id,p_end:until});if(r.error)throw r.error
  });
  host.append(el);
 });
 (c.data||[]).forEach(x=>{
  const el=row('PUBLICITÉ · '+x.headline,x.placement+' · '+x.location_city+' · '+x.payment_status,x.status);
  if(x.status==='pending_review'&&x.payment_status!=='paid')action(el,'ACTIVER APRÈS RÈGLEMENT',async()=>{
   const price=prompt('Montant HT en € effectivement facturé ET encaissé (saisissez après vérification bancaire) :');
   if(price===null)return;
   const num=Number(price);if(!Number.isFinite(num)||num<=0)throw Error('Montant strictement positif requis.');
   if(!confirm('Vous confirmez le paiement réellement encaissé, la conformité de la publicité et la durée de 30 jours ?'))return;
   const r=await sb.rpc('elysium_activate_paid_campaign',{p_id:x.id,p_price:num,p_start:new Date().toISOString(),p_end:new Date(Date.now()+30*86400000).toISOString()});
   if(r.error)throw r.error
  });
  host.append(el);
 });
 paginateRecord('adminItems',3);
}
function safe(fn,msgid){
 return async ev=>{try{await fn(ev)}catch(e){msg(msgid,e.message||String(e))}}
}
$('#brokerDock [data-broker-screen]').forEach(b=>b.addEventListener('click',()=>setBrokerScreen(b.dataset.brokerScreen)));
$('#listingPrev').addEventListener('click',()=>setYachtStep(yachtStep-1));
$('#listingNext').addEventListener('click',()=>setYachtStep(yachtStep+1,{validate:true}));
setYachtStep(1);
$('#login').addEventListener('click',safe(login,'#authMessage'));
$('#magicLink').addEventListener('click',safe(magicLink,'#authMessage'));
$('#logout').addEventListener('click',()=>sb.auth.signOut().then(loadState));
$('#brokerForm').addEventListener('submit',safe(saveProfile,'#profileMessage'));
$('#yachtForm').addEventListener('submit',safe(submitYacht,'#listingMessage'));
$('#campaignForm').addEventListener('submit',safe(submitCampaign,'#campaignMessage'));
$('#adminRefresh').addEventListener('click',()=>refreshAdmin());
$$('[data-tab]').forEach(el=>el.addEventListener('click',()=>showTab(el.dataset.tab)));
if(sb){sb.auth.onAuthStateChange(()=>setTimeout(loadState,0));loadState()}else msg('#authMessage','Connexion indisponible sur cet appareil.');
})();