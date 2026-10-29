import { WORLDS, WORLD_BY_SLUG } from '/elysium/assets/store-data.mjs';
const AUTH_URL='https://uqlolefsiktbznnymriy.supabase.co';
const AUTH_KEY="sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n";
const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const isClub=document.body.dataset.elysium==='club';
const isMaison=document.body.dataset.elysium==='maison';
const slug=isMaison?location.pathname.split('/').filter(Boolean).at(-1):null;
const world=WORLD_BY_SLUG[slug];
const url=new URL(location.href);
let lang=(url.searchParams.get('lang')==='fr'||navigator.language?.startsWith('fr'))?'fr':'en';
let client=null,session=null,user=null,active=false;
const words={
 en:{wait:'Checking private access…',auth:'Please sign in to enter the members-only collection.',notActive:'Your membership must be approved and active before you can enter the private boutique.',failed:'Could not verify membership. Please try again.',sent:'Check your inbox for your secure sign-in link. It may take a moment.',authError:'Unable to send access link. Please check your address and try again.',applicationSent:'Your application has been received. Our team will review it individually. No payment has been taken.',applicationError:'Could not submit the application. Please try again.',previous:'Your membership application is under review. We will contact you after assessing your request.',add:'ADD TO SELECTION +',remove:'REMOVE',quote:'PRIVATE QUOTATION',empty:'Your private selection is empty.',mail:'Prepare your concierge email',request:'No payment is collected in the boutique. The concierge will confirm availability and quotation.',count:'Selected experiences'},
 fr:{wait:'Vérification de votre accès privé…',auth:'Connectez-vous pour accéder aux collections réservées aux membres.',notActive:'Votre adhésion doit être approuvée et active pour accéder à la boutique privée.',failed:'Impossible de vérifier votre adhésion. Veuillez réessayer.',sent:'Consultez votre messagerie pour recevoir votre lien de connexion sécurisé.',authError:"L’envoi du lien a échoué. Vérifiez votre adresse et réessayez.",applicationSent:'Votre demande a été enregistrée et sera étudiée individuellement. Aucun paiement n’a été effectué.',applicationError:"La demande n’a pas pu être enregistrée. Veuillez réessayer.",previous:'Votre demande d’adhésion est en cours de traitement. Nous vous contacterons après examen.',add:'AJOUTER À MA SÉLECTION +',remove:'RETIRER',quote:'SUR DEVIS',empty:'Votre sélection privée est vide.',mail:'Préparer mon e-mail au concierge',request:'Aucun paiement en ligne pour ces prestations. La conciergerie confirme disponibilité et devis.',count:'Expériences sélectionnées'}
};
const tt=(x)=>words[lang][x]||x;
const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const itemName=o=>lang==='fr'?(o.fr||o.en):o.en;
function say(sel,message,isError=false){const x=$(sel);if(x){x.textContent=message;x.classList.toggle('error',isError)}}
function show(id){const x=$('#'+id);if(x)x.style.display=id==='memberPanel'?'block':'block'}
function hide(id){const x=$('#'+id);if(x)x.style.display='none'}
function switchLanguage(){document.documentElement.lang=lang;$$('[data-en]').forEach(el=>{el.textContent=lang==='fr'?el.dataset.fr:el.dataset.en});if($('#toggleLanguage'))$('#toggleLanguage').textContent=lang==='en'?'FR':'EN';if(isMaison)renderMaisonMeta();if(isClub&&active)renderClub();if(isMaison&&active&&window.__elysiumProductData)renderProducts(window.__elysiumProductData);if(isMaison)renderSelection()}
$('#toggleLanguage')?.addEventListener('click',()=>{lang=lang==='fr'?'en':'fr';switchLanguage()});
function createClient(){if(!window.supabase?.createClient)return null;return window.supabase.createClient(AUTH_URL,AUTH_KEY,{auth:{detectSessionInUrl:true,persistSession:true,autoRefreshToken:true}})}
async function authorized(worldName){
 const {data:{session:current}}=await client.auth.getSession();
 if(!current?.access_token)return {ok:false,error:'sign_in_required'};
 session=current;
 try{const r=await fetch('/api/elysium-catalog?world='+encodeURIComponent(worldName),{headers:{Authorization:'Bearer '+session.access_token},cache:'no-store'});return await r.json()}catch{return {ok:false,error:'service_unavailable'}}
}
async function start(){
 switchLanguage();
 client=createClient();
 if(!client){if(isClub){hide('loading');show('authPanel');say('#loginMessage','Login is temporarily unavailable.',true)}
 if(isMaison)noAccess();return;}
 try{
  const {data:{session:s}}=await client.auth.getSession();
  session=s;if(!s){if(isClub){hide('loading');show('authPanel')}else noAccess();return}
  const response=await client.auth.getUser();
  user=response.data?.user;
  if(!user){if(isClub){hide('loading');show('authPanel')}else noAccess();return}
  const gate=await authorized(isClub?'overview':slug);
  if(gate.ok){active=true;if(isClub){hide('loading');hide('authPanel');hide('applicationPanel');show('memberPanel');renderClub(gate.worlds,gate.membership)}if(isMaison){renderMaisonMeta();renderProducts(gate.world.products);window.__elysiumProductData=gate.world.products}}
  else if(gate.error==='membership_required'){if(isClub)await applicationMode();else noAccess();}
  else if(gate.error==='sign_in_required'){if(isClub){hide('loading');show('authPanel')}else noAccess()}
  else{if(isClub){hide('loading');show('authPanel');say('#loginMessage',tt('failed'),true)}else noAccess()}
 }catch(e){if(isClub){hide('loading');show('authPanel');say('#loginMessage',tt('failed'),true)}else noAccess()}
 if($('#signOut'))$('#signOut').style.display=user?'inline-flex':'none';
}
async function applicationMode(){
 hide('loading');hide('authPanel');show('applicationPanel');
 $('#accountEmail').textContent=user?.email||'';
 const join=url.searchParams.get('join');
 if(['private','signature','on_board'].includes(join))$('#appTier').value=join;
 try{const {data}=await client.from('elysium_applications').select('id,tier,status,created_at').eq('user_id',user.id).order('created_at',{ascending:false}).limit(1);
 if(data?.length){$('#applicationHistory').style.display='block';$('#applicationHistory').textContent=tt('previous')+' · '+data[0].tier+' · '+data[0].status;}}
 catch(e){}
}
$('#loginForm')?.addEventListener('submit',async e=>{
 e.preventDefault();const email=$('#email').value.trim();const btn=$('#loginBtn');btn.disabled=true;
 say('#loginMessage',tt('wait'));
 try{const {error}=await client.auth.signInWithOtp({email,options:{emailRedirectTo:location.origin+'/elysium/club/',shouldCreateUser:true}});if(error)throw error;say('#loginMessage',tt('sent'))}
 catch(err){say('#loginMessage',tt('authError')+' '+String(err.message||''),true)}
 finally{btn.disabled=false}
});
$('#applicationForm')?.addEventListener('submit',async e=>{
 e.preventDefault();if(!user||!$('#appConsent').checked)return;
 const btn=$('#applyBtn');btn.disabled=true;
 const row={user_id:user.id,tier:$('#appTier').value,full_name:$('#appName').value.trim(),context:$('#appContext').value,destination:$('#appDestination').value.trim(),note:$('#appNote').value.trim(),consent:true};
 try{const {error}=await client.from('elysium_applications').insert(row);if(error)throw error;say('#applicationMessage',tt('applicationSent'));$('#applicationForm').reset()}
 catch(err){say('#applicationMessage',tt('applicationError')+' '+String(err.message||''),true)}
 finally{btn.disabled=false}
});
$('#signOut')?.addEventListener('click',async()=>{if(client)await client.auth.signOut();location.href='/elysium/club/'});
function renderClub(worldList,membership){
 const wheel=$('#memberWheel'),grid=$('#memberCards');
 if(!wheel||!grid)return;
 wheel.querySelectorAll('.wheel-link').forEach(x=>x.remove());grid.replaceChildren();
 WORLDS.forEach((w,i)=>{
  const angle=(-90+i*40)*Math.PI/180,x=50+39*Math.cos(angle),y=50+39*Math.sin(angle);
  const a=document.createElement('a');a.href='/elysium/maison/'+w.slug+'/';a.className='wheel-link';a.style.left=x+'%';a.style.top=y+'%';
  const em=document.createElement('span');em.className='wheel-icon';em.textContent=w.icon;
  const label=document.createElement('small');label.textContent=w.name==='Cosmetic & Supplements'?'Cosmetic':w.name;
  a.append(em,label);wheel.appendChild(a);
  const card=document.createElement('a');card.href=a.href;card.className='club-collection';
  const photo=document.createElement('img');photo.src=w.image;photo.alt='';photo.loading='lazy';
  const info=document.createElement('div');const eyebrow=document.createElement('span');eyebrow.textContent=w.no+' / 09';
  const title=document.createElement('h3');title.textContent=w.name;info.append(eyebrow,title);card.append(photo,info);grid.appendChild(card);
 });
 if(membership)$('#memberBadge').textContent=membership.tier.toUpperCase()+' · '+membership.status.toUpperCase();
}
function renderMaisonMeta(){
 if(!world)return;
 document.title=world.full+' · KŌMØ ELYSIUM Private Boutique';
 $('#maisonImage').src=world.image;
 $('#crumbName').textContent=world.name;
 $('#maisonKicker').textContent=world.eyebrow;
 $('#maisonTitle').textContent=world.name;
 $('#maisonDescription').textContent=lang==='fr'?world.subtitleFr:world.subtitleEn;
 $('#collectionDescription').textContent=lang==='fr'?world.copyFr:world.copyEn;
}
function noAccess(){if(isMaison){renderMaisonMeta();show('maisonAccess');$('#productGrid').replaceChildren();say('#shopMessage',tt('auth'))}}
function renderProducts(products){
 if(!isMaison||!Array.isArray(products))return;
 hide('maisonAccess');const grid=$('#productGrid');grid.replaceChildren();say('#shopMessage','');
 products.forEach(p=>{
  const card=document.createElement('article');card.className='store-card';
  const photo=document.createElement('div');photo.className='store-image';
  const img=document.createElement('img');img.src=p.image;img.loading='lazy';img.alt='';
  photo.appendChild(img);const info=document.createElement('div');info.className='store-info';
  const small=document.createElement('small');small.textContent=p.tag;
  const h=document.createElement('h3');h.textContent=itemName(p);
  const desc=document.createElement('p');desc.textContent=lang==='fr'?p.copyFr:p.copyEn;
  const footer=document.createElement('footer');const price=document.createElement('span');price.textContent=lang==='fr'?p.priceFr:p.priceEn;
  const button=document.createElement('button');button.type='button';button.textContent=tt('add');button.addEventListener('click',()=>addSelection(p,world.slug));
  footer.append(price,button);info.append(small,h,desc,footer);card.append(photo,info);grid.appendChild(card);
 });
}
function readSelection(){try{return JSON.parse(sessionStorage.getItem('elysium-selection-v2')||'[]')}catch{return []}}
function saveSelection(items){try{sessionStorage.setItem('elysium-selection-v2',JSON.stringify(items.slice(0,15)))}catch{}}
function addSelection(p,worldSlug){
 const items=readSelection();
 if(!items.some(x=>x.id===p.id)){items.push({id:p.id,world:worldSlug,en:p.en,fr:p.fr});saveSelection(items)}
 renderSelection();openDrawer();
}
function openDrawer(){const dr=$('#selectionDrawer');if(dr){dr.classList.add('open');$('#closeSelection')?.focus()}}
function closeDrawer(){const dr=$('#selectionDrawer');if(dr)dr.classList.remove('open')}
function renderSelection(){
 const container=$('#selectionItems');if(!container)return;
 const items=readSelection();container.replaceChildren();
 if(!items.length){const p=document.createElement('p');p.textContent=tt('empty');container.appendChild(p)}
 items.forEach(x=>{const row=document.createElement('div');row.className='selected-line';const title=document.createElement('b');title.textContent=itemName(x);const rm=document.createElement('button');rm.type='button';rm.setAttribute('aria-label','Remove '+x.en);rm.textContent='×';rm.addEventListener('click',()=>{saveSelection(readSelection().filter(i=>i.id!==x.id));renderSelection()});row.append(title,rm);container.appendChild(row)});
}
$('#openSelection')?.addEventListener('click',openDrawer);
$('#closeSelection')?.addEventListener('click',closeDrawer);
$('#selectionDrawer')?.addEventListener('click',e=>{if(e.target===$('#selectionDrawer'))closeDrawer()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDrawer()});
$('#sendSelection')?.addEventListener('click',()=>{
 const items=readSelection();if(!items.length){say('#selectionResponse',tt('empty'));return}
 const products=items.map(x=>'• '+x.en+' ('+x.world+')').join('\n');
 const message=($('#selectionNote')?.value||'').trim();
 const subject='KŌMØ ELYSIUM — Private member selection';
 const body='Hello KŌMØ ELYSIUM,\n\nMember email: '+(user?.email||'')+'\n\nMy selection:\n'+products+'\n\nNotes (no sensitive data):\n'+message+'\n\nPlease confirm availability, partner details and quotation.';
 say('#selectionResponse',tt('request'));
 location.href='mailto:contact@komolongevity.com?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
});
start();
