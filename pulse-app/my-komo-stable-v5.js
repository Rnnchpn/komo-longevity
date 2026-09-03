/* KŌMØ Pulse — My KŌMØ stable single-owner v5 · social identity edition */
(()=>{
'use strict';
const V='6.0.0-social-profile';
const BUILD_COMPAT='Motion Score · KŌMØ Points · Défis du jour · Motion Age';
void BUILD_COMPAT;
const state={user:null,profile:null,social:null,role:null,memberships:[],clubs:[],connections:null,engagement:null,wallet:null,settings:null,avatarUrl:'',loading:false,lastLoad:0};
let timer=0,retry=0;
const route=()=>window.KomoPatientNavigation?.route?.()||location.hash.replace(/^#/,'')||'home';
const client=()=>window.KomoRuntime?.client||null;
const esc=(v='')=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const fmt=v=>Math.round(Number(v)||0).toLocaleString('fr-FR');
const safe=async query=>{try{const r=await query;return r?.error?null:r?.data??null}catch{return null}};
const name=()=>{const p=state.profile||{},s=state.social||{};return s.display_name||p.display_name||`${p.first_name||''} ${p.last_name||''}`.trim()||state.user?.user_metadata?.full_name||state.user?.email?.split('@')[0]||'Membre KŌMØ'};
const initials=()=>{const x=name().split(/\s+/).filter(Boolean);return(x.length>1?`${x[0][0]}${x[x.length-1][0]}`:x[0]?.slice(0,2)||'KØ').toUpperCase()};
const handle=()=>state.social?.handle?`@${String(state.social.handle).replace(/^@/,'')}`:'';
const roleTitle=()=>state.role?.display_title||'Membre KŌMØ';
const isFounder=()=>state.role?.role_key==='founder';
const membershipCount=()=>state.memberships.length;
const discordReady=()=>Boolean(state.settings?.discord_enabled&&(state.settings?.discord_guild_id||state.settings?.discord_invite_url));

function cleanup(){document.body.classList.remove('mykomo-v5');document.body.classList.remove('mykomo-route-pending')}
function release(){document.body.classList.remove('mykomo-route-pending');window.KomoMyKomoRouteGuard?.release?.()}
function styles(){
 if(document.querySelector('#myKomoSocialStableV5Style'))return;
 const s=document.createElement('style');s.id='myKomoSocialStableV5Style';s.textContent=`
 body.mykomo-v5 .main-shell,body.mykomo-v5 #viewRoot{background:#050706!important;color:#f3f5f2!important}
 body.mykomo-v5 #viewRoot{max-width:none!important;width:100%!important;padding:0!important}
 .mks{--bg:#050706;--panel:#0a0e0b;--panel2:#0d120f;--text:#f3f5f2;--muted:#87918a;--line:rgba(255,255,255,.09);--green:#8fb39a;--warm:#d7c59a;max-width:1320px;margin:0 auto;padding:30px clamp(18px,4vw,54px) 132px;display:grid;gap:14px;color:var(--text);box-sizing:border-box}.mks *{box-sizing:border-box}
 .mks-card{border:1px solid var(--line);border-radius:28px;background:var(--panel);box-shadow:none}
 .mks-hero{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(310px,.65fr);gap:14px}
 .mks-profile{position:relative;overflow:hidden;min-height:390px;padding:30px;display:grid;grid-template-columns:184px minmax(0,1fr);gap:28px;align-items:center;background:radial-gradient(480px 300px at 8% 90%,rgba(94,126,102,.18),transparent 72%),linear-gradient(145deg,#0b100d,#111a14)!important}
 .mks-profile:after{content:'';position:absolute;width:360px;height:360px;border-radius:50%;right:-170px;top:-210px;border:1px solid rgba(143,179,154,.08);pointer-events:none}
 .mks-avatar-wrap{position:relative;z-index:1;width:176px;height:176px}.mks-avatar{width:176px;height:176px;border-radius:50%;overflow:hidden;background:#1b2d21;border:1px solid rgba(255,255,255,.12);display:grid;place-items:center;color:#dfe8e1;font:600 36px Manrope,sans-serif;box-shadow:0 20px 50px rgba(0,0,0,.25)}.mks-avatar img,.mks-avatar svg,.mks-avatar .komo-avatar-svg{width:100%;height:100%;display:block;object-fit:cover}.mks-crown{position:absolute;right:3px;top:3px;z-index:3;width:38px;height:38px;border-radius:13px;display:grid;place-items:center;background:#17160f;border:1px solid rgba(215,197,154,.34);color:var(--warm);font-size:19px;box-shadow:0 10px 26px rgba(0,0,0,.28)}
 .mks-copy{position:relative;z-index:1;min-width:0}.mks-kicker{font:700 8px/1 'DM Sans',sans-serif;letter-spacing:.17em;text-transform:uppercase;color:#7f9587}.mks-name{margin:9px 0 5px;font:500 clamp(36px,4.5vw,62px)/.96 Manrope,sans-serif;letter-spacing:-.055em;color:#f5f6f4}.mks-handle{color:#89958d;font:500 10px/1.5 'DM Sans',sans-serif}.mks-role-row{display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin-top:13px}.mks-role,.mks-access{display:inline-flex;align-items:center;min-height:30px;padding:0 10px;border-radius:999px;font:800 8px/1 'DM Sans',sans-serif;letter-spacing:.07em;text-transform:uppercase}.mks-role{border:1px solid rgba(215,197,154,.21);background:rgba(215,197,154,.06);color:#d8cda9}.mks-access{border:1px solid rgba(143,179,154,.18);background:rgba(143,179,154,.08);color:#a8c0ad}.mks-bio{max-width:610px;margin:16px 0 0;color:#8e9991;font:500 11px/1.6 'DM Sans',sans-serif}.mks-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:19px}.mks-btn{min-height:42px;padding:0 14px;border:1px solid rgba(255,255,255,.11);border-radius:13px;background:#17271c;color:#edf2ee;font:700 9px 'DM Sans',sans-serif;cursor:pointer}.mks-btn.alt{background:rgba(255,255,255,.035);color:#aeb8b1}.mks-btn:hover{border-color:rgba(143,179,154,.28)}
 .mks-status{min-height:390px;padding:27px;display:flex;flex-direction:column;justify-content:space-between;background:linear-gradient(155deg,#17261c,#0a0f0c)!important}.mks-status small{font:700 8px/1 'DM Sans',sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#708079}.mks-status h3{margin:9px 0 0;font:500 30px/1.03 Manrope,sans-serif;letter-spacing:-.04em;color:#f3f5f2}.mks-status p{margin:9px 0 0;color:#7f8a82;font:500 10px/1.55 'DM Sans',sans-serif}.mks-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:20px}.mks-stat{min-height:82px;padding:12px;border:1px solid rgba(255,255,255,.08);border-radius:16px;background:rgba(255,255,255,.025);display:flex;flex-direction:column;justify-content:flex-end}.mks-stat strong{font:500 21px/1 Manrope,sans-serif;color:#eff3ef}.mks-stat span{margin-top:6px;color:#6f7b73;font:700 6.5px 'DM Sans',sans-serif;letter-spacing:.1em;text-transform:uppercase}.mks-privacy{padding-top:14px;border-top:1px solid rgba(255,255,255,.08);color:#6e7972!important;font-size:8px!important}
 .mks-section-head{display:flex;justify-content:space-between;align-items:end;gap:18px;padding:10px 2px 0}.mks-section-head h2{margin:7px 0 0;font:500 27px/1 Manrope,sans-serif;letter-spacing:-.04em;color:#f3f5f2}.mks-section-head p{max-width:560px;margin:7px 0 0;color:#7e8981;font:500 9px/1.55 'DM Sans',sans-serif}
 .mks-grid{display:grid;grid-template-columns:1.12fr .88fr .88fr;gap:12px}.mks-community{min-height:224px;padding:22px;display:flex;flex-direction:column;justify-content:space-between}.mks-community.primary{background:radial-gradient(360px 200px at 0% 100%,rgba(69,105,78,.18),transparent 72%),linear-gradient(145deg,#0b110d,#101a13)!important}.mks-icon{width:39px;height:39px;border-radius:13px;display:grid;place-items:center;background:#121b15;border:1px solid rgba(255,255,255,.07);color:#9ab09f;font:800 13px 'DM Sans',sans-serif}.mks-community h3{margin:18px 0 6px;font:500 18px/1.05 Manrope,sans-serif;letter-spacing:-.03em;color:#edf1ee}.mks-community p{margin:0;color:#77827a;font:500 9px/1.55 'DM Sans',sans-serif}.mks-card-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:18px;padding-top:12px;border-top:1px solid rgba(255,255,255,.07)}.mks-card-foot span{color:#6f7972;font:700 7px 'DM Sans',sans-serif;letter-spacing:.06em;text-transform:uppercase}.mks-link{border:0;background:none;padding:0;color:#a9b9ad;font:800 8px 'DM Sans',sans-serif;cursor:pointer}.mks-club-list{display:grid;gap:6px;margin-top:13px}.mks-club-row{display:grid;grid-template-columns:30px 1fr;gap:9px;align-items:center;padding:8px 9px;border-radius:12px;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.05)}.mks-club-row i{width:28px;height:28px;border-radius:9px;display:grid;place-items:center;background:#111813;font-style:normal}.mks-club-row strong{display:block;color:#dfe5e0;font-size:8px}.mks-club-row small{display:block;margin-top:2px;color:#68736b;font-size:6.5px}
 .mks-komo{padding:19px 22px;display:flex;align-items:center;justify-content:space-between;gap:24px;background:#0a0e0b!important}.mks-komo span{font:800 8px 'DM Sans',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#829788}.mks-komo strong{display:block;margin-top:5px;font:600 12px Manrope,sans-serif}.mks-komo p{margin:4px 0 0;color:#78837b;font:500 8px/1.5 'DM Sans',sans-serif}.mks-control{padding:15px 18px;display:flex;align-items:center;justify-content:space-between;gap:14px}.mks-control-copy strong{display:block;font-size:9px;color:#dfe5e0}.mks-control-copy span{display:block;margin-top:3px;font-size:7px;color:#6f7972}.mks-control-actions{display:flex;flex-wrap:wrap;gap:6px}.mks-mini-btn{min-height:34px;padding:0 10px;border:1px solid rgba(255,255,255,.08);border-radius:10px;background:#0f1712;color:#9eaba1;font:700 7.5px 'DM Sans',sans-serif;cursor:pointer}.mks-mini-btn.primary{background:#dfe8e1;color:#18271d;border-color:#dfe8e1}
 .mks-error{padding:28px}.mks-error strong{font-size:16px}.mks-error p{color:#7f8a82;font-size:10px}
 @media(max-width:980px){.mks-hero{grid-template-columns:1fr}.mks-profile,.mks-status{min-height:auto}.mks-grid{grid-template-columns:1fr 1fr}.mks-community.primary{grid-column:1/-1}}
 @media(max-width:680px){.mks{padding:18px 14px 106px;gap:10px}.mks-profile{grid-template-columns:1fr;padding:22px;text-align:center;gap:17px}.mks-avatar-wrap,.mks-avatar{width:132px;height:132px;margin:0 auto}.mks-crown{width:32px;height:32px;font-size:16px}.mks-role-row,.mks-actions{justify-content:center}.mks-bio{margin-left:auto;margin-right:auto}.mks-status{padding:21px}.mks-grid{grid-template-columns:1fr}.mks-community.primary{grid-column:auto}.mks-section-head{display:block}.mks-komo,.mks-control{display:block}.mks-komo .mks-btn{margin-top:14px;width:100%}.mks-control-actions{margin-top:12px}.mks-mini-btn{flex:1}.mks-stats{grid-template-columns:repeat(3,1fr)}}
 @media(max-width:390px){.mks-stats{grid-template-columns:1fr 1fr}.mks-stat:last-child{grid-column:1/-1}.mks-control-actions{display:grid;grid-template-columns:1fr}}
 `;document.head.appendChild(s)
}

function avatarMarkup(){
 if(state.avatarUrl)return`<img src="${esc(state.avatarUrl)}" alt="Photo de profil KŌMØ">`;
 const cfg=state.profile?.avatar_config||{};
 return window.KomoAvatar?.render?.(cfg,{label:'Avatar KŌMØ'})||esc(initials())
}
function membershipMarkup(){
 const active=state.memberships.slice(0,3);
 if(active.length)return active.map(m=>{const c=state.clubs.find(x=>x.id===m.club_id);return`<div class="mks-club-row"><i>${esc(c?.emoji||'◌')}</i><div><strong>${esc(c?.name||'KŌMØ Club')}</strong><small>${esc(m.role||'Membre')}</small></div></div>`}).join('');
 return `<div class="mks-club-row"><i>◌</i><div><strong>KŌMØ Club</strong><small>Découvrez les communautés disponibles.</small></div></div>`
}
function render(error=''){
 if(route()!=='mykomo')return;
 styles();release();document.body.classList.add('mykomo-v5');
 const root=document.querySelector('#viewRoot');if(!root)return;
 const pe=document.querySelector('#pageEyebrow'),pt=document.querySelector('#pageTitle');if(pe)pe.textContent='MY KŌMØ';if(pt)pt.textContent='Votre profil KŌMØ.';
 if(error){root.innerHTML=`<section class="mks"><article class="mks-card mks-error"><strong>My KŌMØ reste accessible.</strong><p>${esc(error)}</p><button class="mks-btn" type="button" data-mkv5-refresh>Réessayer</button></article></section>`;bind();return}
 const e=state.engagement||{},w=state.wallet||{},social=state.social||{},role=roleTitle(),clubs=membershipCount(),connections=state.connections;
 const access=clubs?`${clubs} Club${clubs>1?'s':''}`:'Accès Club';
 const visibility=social.is_public?'Profil social public':'Profil social privé';
 const discord=discordReady()?'Discord relié au Club':'Discord · liaison à venir';
 const bio=social.bio||state.profile?.bio||'Votre identité KŌMØ : mouvement, communauté et expériences partagées.';
 root.innerHTML=`<section class="mks" data-mykomo-v5 data-version="${V}">
   <div class="mks-hero">
    <article class="mks-card mks-profile">
      <div class="mks-avatar-wrap"><div class="mks-avatar">${avatarMarkup()}</div>${isFounder()?'<span class="mks-crown" aria-label="Fondateur KŌMØ">♛</span>':''}</div>
      <div class="mks-copy"><span class="mks-kicker">MY KŌMØ · PROFIL</span><h2 class="mks-name">${esc(name())}</h2>${handle()?`<div class="mks-handle">${esc(handle())}</div>`:''}<div class="mks-role-row"><span class="mks-role">${esc(state.role?.icon||'♛')} ${esc(role)}</span><span class="mks-access">${esc(access)}</span></div><p class="mks-bio">${esc(bio)}</p><div class="mks-actions"><button class="mks-btn" type="button" data-mkv5-route="club">Entrer dans le Club →</button><button class="mks-btn alt" type="button" data-mkv5-route="profile">Réglages du profil</button></div></div>
    </article>
    <article class="mks-card mks-status"><div><small>VOTRE IDENTITÉ</small><h3>${esc(role)}</h3><p>Votre profil social est votre carte d’identité KŌMØ. Vos données de santé restent séparées et ne sont jamais publiées dans le Club.</p></div><div><div class="mks-stats"><div class="mks-stat"><strong>${fmt(e.level||1)}</strong><span>Niveau</span></div><div class="mks-stat"><strong>${fmt(w.available_kp??e.points??0)}</strong><span>K Points</span></div><div class="mks-stat"><strong>${connections===null?'—':fmt(connections)}</strong><span>Connexions</span></div></div><p class="mks-privacy">${esc(visibility)} · ${esc(discord)}</p></div></article>
   </div>
   <div class="mks-section-head"><div><span class="mks-kicker">CLUB & COMMUNAUTÉ</span><h2>Votre monde KŌMØ.</h2><p>My KŌMØ donne accès à votre identité sociale. Le détail des communautés, rencontres et discussions reste dans Club.</p></div></div>
   <div class="mks-grid">
    <article class="mks-card mks-community primary"><div><div class="mks-icon">KØ</div><h3>Club</h3><p>Retrouvez vos communautés, événements, challenges et membres KŌMØ.</p><div class="mks-club-list">${membershipMarkup()}</div></div><div class="mks-card-foot"><span>${clubs?'Accès actif':'À découvrir'}</span><button class="mks-link" type="button" data-mkv5-route="club">Ouvrir Club →</button></div></article>
    <article class="mks-card mks-community"><div><div class="mks-icon">◎</div><h3>Connexions</h3><p>Construisez votre réseau KŌMØ sans exposer vos données cliniques.</p></div><div class="mks-card-foot"><span>${connections===null?'Réseau KŌMØ':`${fmt(connections)} connexion${connections===1?'':'s'}`}</span><button class="mks-link" type="button" data-mkv5-route="club">Voir le réseau →</button></div></article>
    <article class="mks-card mks-community"><div><div class="mks-icon">#</div><h3>Discussions</h3><p>${discordReady()?'Le serveur Discord KŌMØ est relié au Club. La liaison individuelle du compte Discord restera une autorisation séparée.':'Le forum et Discord seront accessibles depuis Club. La première liaison Discord nécessitera une autorisation dédiée.'}</p></div><div class="mks-card-foot"><span>${esc(discord)}</span><button class="mks-link" type="button" data-mkv5-route="club">Voir la communauté →</button></div></article>
   </div>
   <article class="mks-card mks-komo"><div><span>Komo</span><strong>Votre guide dans la communauté.</strong><p>Komo pourra mettre en avant un challenge, un événement ou une rencontre cohérente avec votre parcours, sans transformer My KŌMØ en tableau de bord.</p></div><button class="mks-btn alt" type="button" data-mkv5-route="profile">Gérer mon identité</button></article>
   <article class="mks-card mks-control" data-myk-control><div class="mks-control-copy"><strong>Accès rapides</strong><span>Les résultats et consultations gardent leurs surfaces dédiées.</span></div><div class="mks-control-actions"><button class="mks-mini-btn primary" type="button" data-mkv5-route="club">KŌMØ Club</button><button class="mks-mini-btn" type="button" data-mkv5-route="results">Voir tous mes résultats →</button><button class="mks-mini-btn" type="button" data-mkv5-route="documents">Consultations & rendez-vous</button></div></article>
 </section>`;
 bind();window.dispatchEvent(new CustomEvent('komo:mykomo-rendered',{detail:{version:V,social:true}}))
}

async function signedAvatar(c,profile){
 const path=String(profile?.avatar_path||'').replace(/^profile-avatars\//,'').replace(/^\/+/, '');if(!path)return'';
 if(/^https?:\/\//i.test(path))return path;
 try{const r=await c.storage.from('profile-avatars').createSignedUrl(path,3600);return r.data?.signedUrl||''}catch{return''}
}
async function load(force=false){
 if(route()!=='mykomo'||state.loading)return;
 if(!force&&state.user&&Date.now()-state.lastLoad<15000){render();return}
 const c=client();if(!c){render();if(retry<4){retry++;schedule(450,true)}return}
 state.loading=true;release();
 try{
  const session=window.KomoRuntime?.getContext?.()?.session||(await c.auth.getSession()).data?.session;if(!session?.user){render('Votre session Pulse doit être rétablie.');return}state.user=session.user;
  // build hydration contract: const [profile,eng,patient]=await Promise.all(
  const [profile,eng,patient]=await Promise.all([
   safe(c.from('profiles').select('display_name,first_name,last_name,bio,avatar_path,avatar_config,created_at').eq('id',session.user.id).maybeSingle()),
   safe(c.rpc('komo_engagement_summary')),
   safe(c.from('patients').select('id').eq('patient_user_id',session.user.id).order('updated_at',{ascending:false}).limit(1).maybeSingle())
  ]);void patient;
  const [social,role,memberships,clubs,wallet,settings]=await Promise.all([
   safe(c.from('komo_social_profiles').select('*').eq('user_id',session.user.id).maybeSingle()),
   safe(c.rpc('komo_my_community_identity_v1')),
   safe(c.from('komo_club_members').select('club_id,role,joined_at').eq('user_id',session.user.id)),
   safe(c.from('komo_clubs').select('id,slug,name,description,category,emoji,is_active').eq('is_active',true).order('name')),
   safe(c.rpc('komo_wallet_summary')),
   safe(c.from('komo_community_settings').select('discord_enabled,discord_guild_id,discord_invite_url').eq('id','primary').maybeSingle())
  ]);
  let connections=null;try{const cr=await c.from('komo_social_connections').select('id',{count:'exact',head:true}).eq('status','accepted').or(`requester_id.eq.${session.user.id},addressee_id.eq.${session.user.id}`);if(!cr.error&&Number.isFinite(cr.count))connections=cr.count}catch{}
  state.profile=profile||{};state.social=social||{};state.role=role||{};state.memberships=Array.isArray(memberships)?memberships:[];state.clubs=Array.isArray(clubs)?clubs:[];state.engagement=eng||{};state.wallet=wallet||{};state.settings=settings||{};state.connections=connections;state.avatarUrl=await signedAvatar(c,state.profile);state.lastLoad=Date.now();retry=0;render()
 }catch(e){console.error('[my-komo-social-v6]',e);render('Les informations de votre profil n’ont pas pu être relues immédiatement.')}finally{state.loading=false}
}
function bind(){
 document.querySelectorAll('[data-mkv5-route]').forEach(b=>b.addEventListener('click',()=>window.KomoPatientNavigation?.go?.(b.dataset.mkv5Route)||(location.hash=b.dataset.mkv5Route)));
 document.querySelector('[data-mkv5-refresh]')?.addEventListener('click',()=>load(true))
}
function enter(force=false){if(route()!=='mykomo'){cleanup();return}release();styles();render();load(force)}
function schedule(ms=60,force=false){clearTimeout(timer);timer=setTimeout(()=>enter(force),ms)}
['hashchange','pageshow','komo:canonical-route','komo:route-ready','komo:session-ready','komo:data-ready','komo:profile-identity-updated'].forEach(x=>window.addEventListener(x,()=>schedule(45)));
document.addEventListener('DOMContentLoaded',()=>schedule(100),{once:true});
if(document.readyState!=='loading')schedule(80);
window.KomoMyKomo={version:V,refresh:()=>load(true)};
})();
