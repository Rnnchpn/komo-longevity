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
 en:{wait:'Checking private access…',auth:'Please sign in to enter the members-only collection.',notActive:'Your membership must be approved and active before you can enter the private boutique.',failed:'Could not verify membership. Please try again.',sent:'Check your inbox for your secure sign-in link. It may take a moment.',authError:'Unable to send access link. Please check your address and try again.',applicationSent:'Your ELYSIUM request has been recorded. We will review it personally and contact you about approval. No payment has been taken.',applicationError:'Could not submit the application. Please try again.',previous:'Your membership application is under review. We will contact you after assessing your request.',add:'ADD TO SELECTION +',remove:'REMOVE',quote:'PRIVATE QUOTATION',empty:'Your private selection is empty.',mail:'Prepare your concierge email',request:'No payment is collected in the boutique. The concierge will confirm availability and quotation.',count:'Selected experiences'},
 fr:{wait:'Vérification de votre accès privé…',auth:'Connectez-vous pour accéder aux collections réservées aux membres.',notActive:'Votre adhésion doit être approuvée et active pour accéder à la boutique privée.',failed:'Impossible de vérifier votre adhésion. Veuillez réessayer.',sent:'Consultez votre messagerie pour recevoir votre lien de connexion sécurisé.',authError:"L’envoi du lien a échoué. Vérifiez votre adresse et réessayez.",applicationSent:'Votre demande d’adhésion ELYSIUM est enregistrée. Notre équipe l’examinera personnellement et vous contactera après validation. Aucun paiement n’a été effectué.',applicationError:"La demande n’a pas pu être enregistrée. Veuillez réessayer.",previous:'Votre demande d’adhésion est en cours de traitement. Nous vous contacterons après examen.',add:'AJOUTER À MA SÉLECTION +',remove:'RETIRER',quote:'SUR DEVIS',empty:'Votre sélection privée est vide.',mail:'Préparer mon e-mail au concierge',request:'Aucun paiement en ligne pour ces prestations. La conciergerie confirme disponibilité et devis.',count:'Expériences sélectionnées'}
};
const tt=(x)=>words[lang][x]||x;
const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const itemName=o=>lang==='fr'?(o.fr||o.en):o.en;
function say(sel,message,isError=false){const x=$(sel);if(x){x.textContent=message;x.classList.toggle('error',isError)}}
function show(id){const x=$('#'+id);if(x)x.style.display=id==='memberPanel'?'block':'block'}
function hide(id){const x=$('#'+id);if(x)x.style.display='none'}
function switchLanguage(){document.documentElement.lang=lang;$('[data-en]').forEach(el=>{const v=lang==='fr'?el.dataset.fr:el.dataset.en;if(el.closest('.longevity-maison')&&/<(?:em|br)>/.test(v))el.innerHTML=v;else el.textContent=v});if($('#toggleLanguage'))$('#toggleLanguage').textContent=lang==='en'?'FR':'EN';if(isMaison)renderMaisonMeta();if(isClub&&active)renderClub(null,clubMembership);if(isMaison&&active&&window.__elysiumProductData)renderProducts(window.__elysiumProductData);if(isMaison)renderSelection()}
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
  if(gate.ok){active=true;if(isClub){hide('loading');hide('authPanel');hide('applicationPanel');show('memberPanel');document.body.classList.add('elysium-app-mode');renderClub(gate.worlds,gate.membership)}if(isMaison){renderMaisonMeta();renderProducts(gate.world.products);window.__elysiumProductData=gate.world.products}}
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
 if(['private','on_board'].includes(join))$('#appTier').value=join;
 try{const {data}=await client.from('elysium_applications').select('id,tier,status,created_at').eq('user_id',user.id).order('created_at',{ascending:false}).limit(1);
 if(data?.length){$('#applicationHistory').style.display='block';$('#applicationHistory').textContent=tt('previous')+' · '+data[0].tier+' · '+data[0].status;}}
 catch(e){}
}
// Password login is handled on the ELYSIUM origin so existing KŌMØ users
// are not redirected to the Pulse site by the Supabase Auth default Site URL.
$('#passwordLoginForm')?.addEventListener('submit',async e=>{
 e.preventDefault();
 if(!client){say('#passwordLoginMessage',lang==='fr'?'Connexion indisponible.':'Sign-in unavailable.',true);return}
 const email=$('#passwordEmail').value.trim(),password=$('#passwordValue').value;
 const btn=$('#passwordLoginBtn');btn.disabled=true;
 say('#passwordLoginMessage',lang==='fr'?'Vérification de votre compte…':'Verifying your account…');
 try{
  const {error}=await client.auth.signInWithPassword({email,password});
  if(error)throw error;
  $('#passwordValue').value='';
  say('#passwordLoginMessage','');
  await start();
 }catch(err){
  say('#passwordLoginMessage',lang==='fr'?'Adresse ou mot de passe incorrect. Vérifiez vos identifiants KŌMØ.':'Incorrect email or password. Please check your KŌMØ credentials.',true);
 }finally{btn.disabled=false}
});
$('#loginForm')?.addEventListener('submit',async e=>{
 e.preventDefault();const email=$('#email').value.trim();const btn=$('#loginBtn');btn.disabled=true;
 say('#loginMessage',tt('wait'));
 try{const redirect=new URL('/elysium/club/',location.origin);const join=url.searchParams.get('join');if(['private','on_board'].includes(join))redirect.searchParams.set('join',join);const {error}=await client.auth.signInWithOtp({email,options:{emailRedirectTo:redirect.toString(),shouldCreateUser:true}});if(error)throw error;say('#loginMessage',tt('sent'))}
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
// All nine illustrations are original CSS/SVG line graphics, no stock imagery.
const ELYSIUM_GLYPHS={
 longevity:'<circle cx="60" cy="60" r="38" stroke-dasharray="2 8" opacity=".48"/><path d="M19 66 C33 66 38 31 48 31 S65 88 75 78 S89 54 101 54"/><circle cx="48" cy="31" r="4" fill="currentColor" stroke="none"/><path d="M27 91h66" opacity=".32"/>',
 aesthetic:'<path d="M65 18C42 19 30 40 35 56c3 12 15 13 18 24 2 8-2 16-9 21"/><path d="M66 18c17 11 23 26 20 42-3 16-17 29-35 33" opacity=".47"/><path d="M33 60c9-2 16-1 22 2M44 73c8 6 15 5 23-1"/><circle cx="79" cy="30" r="3" fill="currentColor" stroke="none"/>',
 'iv-drip':'<path d="M60 16C48 35 33 53 33 69a27 27 0 0 0 54 0C87 53 72 35 60 16Z"/><path d="M44 70a16 16 0 0 0 16 16"/><circle cx="60" cy="61" r="9" stroke-dasharray="1 6"/><path d="M60 39v10M60 73v10M44 61h10M66 61h10" opacity=".6"/>',
 'cosmetic-supplements':'<rect x="36" y="36" width="48" height="62" rx="5"/><rect x="44" y="22" width="32" height="14" rx="2"/><path d="M41 61h38M41 70h38M51 82h18" opacity=".55"/><path d="M90 26l7-7M95 39h12M29 22l-6-6" stroke-dasharray="2 4"/>',
 life:'<circle cx="60" cy="55" r="23"/><path d="M13 80h94M25 89h70M35 98h50"/><path d="M60 12v11M21 55H10M110 55H99M30 26l-8-8M90 26l8-8"/><path d="M38 80c5-13 13-19 22-19s17 6 22 19" opacity=".6"/>',
 gastronomy:'<circle cx="60" cy="60" r="35"/><circle cx="60" cy="60" r="25" stroke-dasharray="2 7" opacity=".65"/><path d="M60 38c-8 8 8 17 0 26s8 13 0 22" opacity=".85"/><path d="M18 25v67M13 25v17M23 25v17M102 25v67" opacity=".58"/>',
 'high-luxury':'<path d="M30 43h60l14 15-44 44-44-44 14-15Z"/><path d="M16 58h88M30 43l17 15 13 44 13-44 17-15M47 58l13-15 13 15"/><path d="M60 12v16M26 20l7 8M95 20l-7 8" opacity=".6"/>',
 service:'<circle cx="60" cy="60" r="13"/><circle cx="60" cy="17" r="5"/><circle cx="98" cy="42" r="5"/><circle cx="87" cy="94" r="5"/><circle cx="27" cy="89" r="5"/><circle cx="19" cy="39" r="5"/><path d="M60 22v25M73 56l20-12M68 70l16 20M49 68L31 85M48 55L23 41" opacity=".6"/><circle cx="60" cy="60" r="35" stroke-dasharray="2 8" opacity=".4"/>',
 team:'<circle cx="60" cy="37" r="13"/><circle cx="32" cy="56" r="10"/><circle cx="88" cy="56" r="10"/><path d="M38 95c0-20 10-30 22-30s22 10 22 30M13 96c0-16 7-24 20-25M107 96c0-16-7-24-20-25"/><circle cx="60" cy="37" r="23" stroke-dasharray="1 8" opacity=".4"/>'
};
const ELYSIUM_LABELS={
 longevity:['Longevity','Longévité'],aesthetic:['Aesthetic','Esthétique'],
 'iv-drip':['IV Drip','IV Drip'],'cosmetic-supplements':['Cosmetics','Cosmétiques'],
 life:['Lifestyle','Lifestyle'],gastronomy:['Gastronomy','Gastronomie'],
 'high-luxury':['High Luxury','High Luxury'],service:['Service','Service'],team:['Team','Équipe']
};
let orbitIndex=0,orbitReady=false,clubMembership=null;
function orbitTitle(w){
 return (ELYSIUM_LABELS[w.slug]||[w.name,w.name])[lang==='fr'?1:0];
}
function orbitPosition(){
 const wheel=$('#memberWheel');
 if(!wheel)return;
 wheel.querySelectorAll('.ely-node').forEach((node,i)=>{
  const angle=(-90+(i-orbitIndex)*40)*Math.PI/180;
  node.style.left=(50+38.6*Math.cos(angle)).toFixed(3)+'%';
  node.style.top=(50+37.5*Math.sin(angle)).toFixed(3)+'%';
  node.style.setProperty('--depth',(Math.sin(angle)+1)/2);
  node.classList.toggle('is-selected',i===orbitIndex);
  node.setAttribute('aria-current',i===orbitIndex?'true':'false');
 });
 const selected=WORLDS[orbitIndex],selectedName=orbitTitle(selected);
 if($('#elyOrbitActive'))$('#elyOrbitActive').textContent=selected.no+'  /  09   —   '+selectedName;
 if($('#elyOrbitInstruction'))$('#elyOrbitInstruction').textContent=lang==='fr'?'FAITES GLISSER LA ROUE OU CHOISISSEZ UN UNIVERS':'SWIPE THE WHEEL OR CHOOSE A WORLD';
}
function orbitStep(delta){
 orbitIndex=(orbitIndex+delta+WORLDS.length)%WORLDS.length;
 orbitPosition();
}
function renderClub(worldList,membership){
 const wheel=$('#memberWheel');
 if(!wheel)return;
 if(membership)clubMembership=membership;
 wheel.querySelectorAll('.ely-node').forEach(x=>x.remove());
 WORLDS.forEach((w,i)=>{
  const node=document.createElement('a');
  node.className='ely-node';
  node.href='/elysium/maison/'+encodeURIComponent(w.slug)+'/';
  node.setAttribute('aria-label',w.no+' · '+orbitTitle(w));
  node.style.setProperty('--node-delay',(i*55)+'ms');
  node.style.setProperty('--node-tint',['#9eb9af','#c7acaa','#b4c6c5','#e0cfc0','#aab5ad','#d4b79a','#d3bf9b','#a5b4b4','#b8b7ab'][i]);
  const number=document.createElement('span');number.className='ely-node-index';number.textContent=w.no;
  const glyph=document.createElementNS('http://www.w3.org/2000/svg','svg');
  glyph.setAttribute('viewBox','0 0 120 120');
  glyph.setAttribute('aria-hidden','true');
  glyph.setAttribute('class','ely-node-glyph');
  glyph.innerHTML='<g fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">'+(ELYSIUM_GLYPHS[w.slug]||ELYSIUM_GLYPHS.life)+'</g>';
  const name=document.createElement('span');name.className='ely-node-name';name.textContent=orbitTitle(w);
  node.append(number,glyph,name);
  node.addEventListener('pointerenter',()=>{if(!matchMedia('(hover:hover)').matches)return;node.classList.add('is-hovered')});
  node.addEventListener('pointerleave',()=>node.classList.remove('is-hovered'));
  wheel.append(node);
 });
 orbitPosition();
 const badge=$('#memberBadge');
 if(badge&&clubMembership)badge.textContent=clubMembership.tier==='maison'?'MAISON PRIVÉE':(lang==='fr'?'MEMBRE PRIVÉ':'PRIVATE MEMBER');
 if(orbitReady)return;
 orbitReady=true;
 $('#elyOrbitPrev')?.addEventListener('click',()=>orbitStep(-1));
 $('#elyOrbitNext')?.addEventListener('click',()=>orbitStep(1));
 wheel.addEventListener('keydown',event=>{
  if(event.key==='ArrowRight'||event.key==='ArrowLeft'){
   event.preventDefault();orbitStep(event.key==='ArrowRight'?1:-1);
   wheel.querySelectorAll('.ely-node')[orbitIndex]?.focus();
  }
 });
 let x0=null,y0=null;
 wheel.addEventListener('touchstart',event=>{
  if(event.touches.length!==1)return;
  x0=event.touches[0].clientX;y0=event.touches[0].clientY;
 },{passive:true});
 wheel.addEventListener('touchend',event=>{
  if(x0===null||!event.changedTouches.length)return;
  const dx=event.changedTouches[0].clientX-x0,dy=event.changedTouches[0].clientY-y0;
  x0=null;y0=null;
  if(Math.abs(dx)>38&&Math.abs(dx)>Math.abs(dy)*1.15){
   event.preventDefault();orbitStep(dx<0?1:-1);
  }
 },{passive:false});
}
function renderMaisonMeta(){
 if(!world)return;
 document.title=world.full+' · KŌMØ ELYSIUM Private Boutique';
 const heroImg=$('#maisonImage');
 if(heroImg)heroImg.src=world.image;
 if($('#crumbName'))$('#crumbName').textContent=world.name;
 if($('#maisonKicker'))$('#maisonKicker').textContent=world.eyebrow;
 if($('#maisonTitle')&&slug!=='longevity')$('#maisonTitle').textContent=world.name;
 if($('#maisonDescription'))$('#maisonDescription').textContent=slug==='longevity'
  ?(lang==='fr'?'Une nouvelle lecture de vos capacités fonctionnelles, de vos forces et de votre trajectoire — en toute discrétion.':'A fresh perspective on your functional capacity, strengths and trajectory — with complete discretion.')
  :(lang==='fr'?world.subtitleFr:world.subtitleEn);
 if($('#collectionDescription'))$('#collectionDescription').textContent=lang==='fr'?world.copyFr:world.copyEn;
}
function noAccess(){if(isMaison){renderMaisonMeta();show('maisonAccess');$('#productGrid').replaceChildren();say('#shopMessage',tt('auth'))}}

const LONGEVITY_OFFER_ART={
 pulse:'<circle cx="60" cy="60" r="41" stroke-dasharray="2 7" opacity=".44"/><path d="M14 65h24l11-26 22 47 13-24h22"/><circle cx="49" cy="39" r="4" fill="currentColor" stroke="none"/>',
 rings:'<circle cx="60" cy="60" r="38"/><circle cx="60" cy="60" r="25" opacity=".58"/><circle cx="60" cy="60" r="11" opacity=".68"/><path d="M60 9v21M60 90v21M9 60h21M90 60h21"/><circle cx="60" cy="60" r="4" fill="currentColor" stroke="none"/>',
 horizon:'<path d="M18 77h84M28 85h64M40 92h40"/><path d="M30 77c0-18 13-32 30-32s30 14 30 32"/><path d="M60 17v14M19 37l12 9M101 37l-12 9"/><path d="M30 77l30-16 30 16" opacity=".44"/>',
 trajectory:'<path d="M14 94h93M22 100V22" opacity=".58"/><path d="M26 85c15 0 13-29 31-29s18 15 29-9l12-24"/><path d="M84 23h14v14"/><circle cx="57" cy="56" r="5" fill="currentColor" stroke="none"/>'
};
function renderLongevityProducts(products,grid){
 grid.classList.add('lv-offers');
 products.forEach((p,i)=>{
  const card=document.createElement('article');card.className='lv-offer';
  const top=document.createElement('div');top.className='lv-offer-top';
  const index=document.createElement('span');index.className='lv-offer-index';index.textContent=String(i+1).padStart(2,'0')+' / 04';
  const price=document.createElement('span');price.className='lv-offer-price';price.textContent=lang==='fr'?p.priceFr:p.priceEn;
  top.append(index,price);
  const motif=document.createElement('div');motif.className='lv-offer-motif';motif.setAttribute('aria-hidden','true');
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 120 120');
  svg.innerHTML='<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5">'+(LONGEVITY_OFFER_ART[p.glyph]||LONGEVITY_OFFER_ART.rings)+'</g>';
  motif.append(svg);
  const eyebrow=document.createElement('div');eyebrow.className='lv-offer-eyebrow';eyebrow.textContent=p.kind;
  const h=document.createElement('h3');h.textContent=itemName(p);
  const desc=document.createElement('p');desc.className='lv-offer-description';desc.textContent=lang==='fr'?p.copyFr:p.copyEn;
  const points=document.createElement('ul');points.className='lv-offer-points';
  const list=lang==='fr'?p.pointsFr:p.pointsEn;
  if(Array.isArray(list))list.forEach(value=>{const li=document.createElement('li');li.textContent=value;points.append(li)});
  const btn=document.createElement('button');btn.type='button';btn.className='lv-offer-cta';
  btn.textContent=(lang==='fr'?p.buttonFr:p.buttonEn)||tt('add');
  btn.addEventListener('click',()=>addSelection(p,'longevity'));
  card.append(top,motif,eyebrow,h,desc,points,btn);grid.append(card);
 });
}
function renderProducts(products){
 if(!isMaison||!Array.isArray(products))return;
 hide('maisonAccess');const grid=$('#productGrid');grid.replaceChildren();say('#shopMessage','');
 if(slug==='longevity'){renderLongevityProducts(products,grid);return;}
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
