const VERSION='2.0.0';
// legacy performance-hardening marker only; no observer is created: .observe(document.body,{childList:true,subtree:true});
let state=null,hydrating=false,actionBusy=false,gameTimer=null,gameStart=0,discordAbort=null;
const route=()=>window.KomoPatientNavigation?.route?.()||location.hash.replace(/^#/,'')||'home';
const sb=()=>window.KomoRuntime?.client||null;
const esc=(v='')=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const fmt=v=>new Intl.NumberFormat('fr-FR').format(Number(v)||0);
const slug=v=>String(v||'membre').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9_]+/g,'_').replace(/^_+|_+$/g,'').slice(0,18)||'membre';
const apps=[
  ['KŌMØ Life','Culture, vêtements et récompenses','https://life.komolongevity.com/','LIFE'],
  ['KŌMØ Check','Votre première référence fonctionnelle','https://komolongevity.com/fr/check/','CHECK'],
  ['Library','Science, mouvement et longévité','https://komolongevity.com/media','LIBRARY'],
  ['KŌMØ Network','Centres et professionnels du réseau','https://komolongevity.com/fr/network/','NETWORK']
];

function styles(){
  document.querySelector('#komoClubV1Style')?.remove();
  if(document.querySelector('#komoClubV2Style'))return;
  const s=document.createElement('style');
  s.id='komoClubV2Style';
  s.textContent=`
  :root{--kc-bg:#050706;--kc-panel:#0a0e0b;--kc-panel2:#0d120f;--kc-line:rgba(255,255,255,.09);--kc-text:#f3f5f2;--kc-muted:#87918a;--kc-green:#7fa58a;--kc-green-core:#315b41;--kc-warm:#d9c89f}
  body.kclub-route-v2{background:var(--kc-bg)!important;color:var(--kc-text)!important}
  body.kclub-route-v2 .main-shell,body.kclub-route-v2 #appShell{background:var(--kc-bg)!important}
  body.kclub-route-v2 .topbar{background:rgba(5,7,6,.94)!important;border-color:rgba(255,255,255,.07)!important;backdrop-filter:blur(18px)}
  body.kclub-route-v2 #viewRoot,body.kclub-route-v2 .view-root{max-width:none!important;width:100%!important;background:var(--kc-bg)!important;color:var(--kc-text)!important;padding:0!important}
  .kclub{min-height:100%;display:grid;gap:14px;max-width:1320px;margin:0 auto;padding:32px clamp(18px,4vw,56px) 132px;box-sizing:border-box;color:var(--kc-text)}
  .kclub *{box-sizing:border-box}
  .kclub-head{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;padding:2px 2px 8px}
  .kclub-brand{display:grid;gap:8px}.kclub-brand small,.kclub-mini{font:700 8px/1 'DM Sans',sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#77827a}
  .kclub-brand h1{margin:0;font:500 clamp(30px,4vw,54px)/.96 Manrope,sans-serif;letter-spacing:-.055em;color:#f5f6f4}
  .kclub-brand p{max-width:620px;margin:0;color:#7f8a82;font:500 11px/1.55 'DM Sans',sans-serif}
  .kclub-live{display:flex;align-items:center;gap:7px;color:#8a968d;font:700 8px 'DM Sans',sans-serif;letter-spacing:.08em;text-transform:uppercase;white-space:nowrap}
  .kclub-live i{width:7px;height:7px;border-radius:50%;background:var(--kc-green);box-shadow:0 0 0 5px rgba(127,165,138,.08)}
  .kclub-hero{position:relative;overflow:hidden;display:grid;grid-template-columns:minmax(0,1.25fr) minmax(300px,.75fr);gap:28px;padding:28px;border:1px solid var(--kc-line);border-radius:30px;background:radial-gradient(520px 300px at 22% 18%,rgba(49,91,65,.23),transparent 70%),linear-gradient(145deg,#080b09 0%,#0a100c 62%,#071009 100%);box-shadow:0 26px 80px rgba(0,0,0,.22)}
  .kclub-hero:after{content:'';position:absolute;right:-80px;top:-150px;width:420px;height:420px;border-radius:50%;border:1px solid rgba(127,165,138,.08);pointer-events:none}
  .kclub-id{position:relative;z-index:1;display:flex;align-items:center;gap:20px;min-width:0}
  .kclub-avatar{position:relative;width:112px;height:112px;flex:0 0 112px;border-radius:28px;overflow:hidden;background:#111713;border:1px solid rgba(255,255,255,.12);box-shadow:0 14px 38px rgba(0,0,0,.25)}
  .kclub-avatar img,.kclub-avatar svg{width:100%;height:100%;object-fit:cover;display:block}.kclub-avatar-fallback{width:100%;height:100%;display:grid;place-items:center;color:#cfd8d1;font:700 24px Manrope,sans-serif}
  .kclub-crown{position:absolute;right:-5px;top:-7px;z-index:3;width:30px;height:30px;border-radius:11px;display:grid;place-items:center;background:#17160f;border:1px solid rgba(217,200,159,.35);color:var(--kc-warm);font-size:15px;box-shadow:0 8px 24px rgba(0,0,0,.28)}
  .kclub-identity{min-width:0}.kclub-kicker{display:flex;align-items:center;gap:8px;color:#77837b;font:700 8px/1 'DM Sans',sans-serif;letter-spacing:.15em;text-transform:uppercase}
  .kclub-role{display:inline-flex;align-items:center;gap:6px;margin-top:9px;padding:6px 9px;border:1px solid rgba(217,200,159,.2);border-radius:999px;background:rgba(217,200,159,.06);color:#d8cda9;font:700 8px/1 'DM Sans',sans-serif;letter-spacing:.06em;text-transform:uppercase}
  .kclub-hero h2{margin:8px 0 5px;font:500 clamp(30px,3.4vw,46px)/1 Manrope,sans-serif;letter-spacing:-.055em;color:#f5f6f4}
  .kclub-handle{margin:0;color:#8d978f;font:500 10px/1.55 'DM Sans',sans-serif;max-width:680px}.kclub-handle strong{color:#b6c0b8;font-weight:600}
  .kclub-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}.kclub-btn{min-height:38px;padding:0 13px;border:1px solid rgba(255,255,255,.11);border-radius:12px;background:#152219;color:#edf2ee;font:700 8px 'DM Sans',sans-serif;cursor:pointer;transition:transform .18s ease,border-color .18s ease,background .18s ease}
  .kclub-btn.alt{background:rgba(255,255,255,.045);color:#aeb8b1}.kclub-btn[disabled]{opacity:.45;cursor:default}.kclub-btn:not([disabled]):hover{transform:translateY(-1px);border-color:rgba(127,165,138,.28)}
  .kclub-statrow{position:relative;z-index:1;align-self:end;display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
  .kclub-stat{min-height:86px;padding:15px;border:1px solid var(--kc-line);border-radius:18px;background:rgba(255,255,255,.035);display:flex;flex-direction:column;justify-content:flex-end}
  .kclub-stat strong{font:500 24px/1 Manrope,sans-serif;color:#eff3ef}.kclub-stat span{margin-top:7px;color:#737e76;font:700 7px/1 'DM Sans',sans-serif;letter-spacing:.12em;text-transform:uppercase}
  .kclub-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.kclub-card{padding:22px;border:1px solid var(--kc-line);border-radius:24px;background:linear-gradient(145deg,rgba(255,255,255,.035),rgba(255,255,255,.018));box-shadow:inset 0 1px rgba(255,255,255,.025)}
  .kclub-card h3{margin:7px 0 8px;font:500 22px/1.08 Manrope,sans-serif;letter-spacing:-.04em;color:#edf1ee}.kclub-card>p{margin:0 0 16px;color:#77827a;font:500 9px/1.6 'DM Sans',sans-serif}
  .kclub-community{grid-column:1/-1;display:grid;grid-template-columns:1.15fr .85fr;gap:26px;align-items:stretch;background:radial-gradient(420px 220px at 12% 30%,rgba(49,91,65,.18),transparent 75%),linear-gradient(145deg,#090d0a,#0b110d)}
  .kclub-community-copy{display:flex;flex-direction:column;justify-content:center;padding:4px}.kclub-community-copy h3{font-size:30px;max-width:560px}.kclub-community-copy p{max-width:590px;font-size:10px}
  .kclub-discord{min-height:180px;border:1px solid rgba(127,165,138,.16);border-radius:20px;background:#070a08;padding:18px;display:grid;align-content:space-between;gap:20px}
  .kclub-discord-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}.kclub-discord-mark{width:40px;height:40px;border-radius:14px;display:grid;place-items:center;background:#121b15;border:1px solid rgba(255,255,255,.08);font:800 13px 'DM Sans',sans-serif;color:#9db4a3}
  .kclub-discord strong{display:block;color:#eef2ef;font:600 15px Manrope,sans-serif}.kclub-discord small{display:block;margin-top:4px;color:#768179;font:600 8px 'DM Sans',sans-serif}.kclub-online{display:flex;align-items:center;gap:7px;color:#8fa597;font:700 8px 'DM Sans',sans-serif;text-transform:uppercase;letter-spacing:.08em}.kclub-online i{width:7px;height:7px;border-radius:50%;background:#7fa58a}
  .kclub-discord-foot{display:flex;align-items:flex-end;justify-content:space-between;gap:16px}.kclub-discord-foot p{margin:0;max-width:350px;color:#78827b;font:500 8px/1.5 'DM Sans',sans-serif}.kclub-discord-link{display:inline-flex;align-items:center;justify-content:center;min-height:38px;padding:0 13px;border-radius:12px;background:#dfe8e1;color:#18271d;text-decoration:none;font:800 8px 'DM Sans',sans-serif;white-space:nowrap}
  .kclub-clubs{display:grid;gap:8px}.kclub-club{padding:13px 14px;border:1px solid rgba(255,255,255,.06);border-radius:16px;background:#080c09;display:grid;grid-template-columns:auto 1fr auto;gap:11px;align-items:center}.kclub-club i{width:36px;height:36px;border-radius:12px;background:#101711;display:grid;place-items:center;font-style:normal;font-size:16px}.kclub-club strong{display:block;color:#e7ebe8;font-size:10px}.kclub-club small{display:block;margin-top:3px;color:#6e7971;font-size:7px}.kclub-club button{border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:8px 10px;background:#17261b;color:#cfe0d3;font-size:7px;font-weight:800}.kclub-club button.joined{background:rgba(127,165,138,.12);color:#9db3a2}
  .kclub-badges{display:flex;gap:7px;flex-wrap:wrap}.kclub-badge{padding:9px 11px;border:1px solid rgba(127,165,138,.16);border-radius:999px;background:rgba(127,165,138,.08);color:#9eb2a3;font-size:7px;font-weight:800;letter-spacing:.06em}.kclub-badge.locked{border-color:rgba(255,255,255,.06);background:rgba(255,255,255,.025);color:#606963}
  .kclub-profile-form{display:grid;gap:9px}.kclub-profile-form input,.kclub-profile-form textarea{width:100%;border:1px solid rgba(255,255,255,.09);border-radius:12px;background:#070a08;padding:10px 12px;font:500 10px 'DM Sans',sans-serif;color:#e8ece9;outline:none}.kclub-profile-form input:focus,.kclub-profile-form textarea:focus{border-color:rgba(127,165,138,.38)}.kclub-profile-form textarea{min-height:74px;resize:vertical}.kclub-public{display:flex;gap:8px;align-items:center;font-size:8px;color:#7a867e}
  .kclub-search{display:flex;gap:7px}.kclub-search input{flex:1}.kclub-people{display:grid;gap:6px;margin-top:9px}.kclub-person{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;padding:11px;border:1px solid rgba(255,255,255,.06);border-radius:13px;background:#080c09}.kclub-person strong{font-size:9px;color:#dfe5e0}.kclub-person small{display:block;margin-top:3px;color:#6f7a72;font-size:7px}.kclub-person button{border:0;border-radius:9px;background:#1b2d20;color:#d8e5da;padding:7px 9px;font-size:7px;font-weight:800}.kclub-person-actions{display:flex;gap:5px}.kclub-person-actions .reject{background:#1a1514;color:#bb9892}
  .kclub-gamebox{height:150px;border:1px solid rgba(255,255,255,.07);border-radius:18px;background:#080d09;display:grid;place-items:center;color:#dfe7e1;text-align:center;padding:20px;cursor:pointer;user-select:none;transition:background .16s,border-color .16s}.kclub-gamebox.waiting{background:#17130e}.kclub-gamebox.go{background:#14251a;border-color:rgba(127,165,138,.24)}.kclub-gamebox strong{display:block;font:500 27px Manrope,sans-serif}.kclub-gamebox span{display:block;margin-top:8px;font-size:8px;color:#78847c}
  .kclub-leader{margin-top:9px;display:grid;gap:5px}.kclub-rank{display:grid;grid-template-columns:28px 1fr auto;gap:8px;align-items:center;padding:9px 10px;border-radius:11px;background:#080c09}.kclub-rank b{font-size:8px;color:#8da092}.kclub-rank strong{font-size:9px;color:#d8dfda}.kclub-rank span{font-size:7px;color:#677169}
  .kclub-world{grid-column:1/-1}.kclub-apps{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.kclub-app{min-height:108px;padding:14px;border-radius:17px;border:1px solid rgba(255,255,255,.06);background:#080c09;text-decoration:none;color:#dce3de;display:flex;flex-direction:column;justify-content:space-between;transition:transform .18s,border-color .18s}.kclub-app:hover{transform:translateY(-1px);border-color:rgba(127,165,138,.18)}.kclub-app small{font-size:7px;letter-spacing:.12em;color:#657168}.kclub-app strong{font:600 14px Manrope,sans-serif}.kclub-app p{margin:4px 0 0;color:#6f7972;font-size:7px;line-height:1.4}
  .kclub-editor{grid-column:1/-1}
  @media(max-width:900px){.kclub{padding-top:22px}.kclub-head{align-items:flex-start;flex-direction:column}.kclub-hero,.kclub-community{grid-template-columns:1fr}.kclub-grid{grid-template-columns:1fr}.kclub-community,.kclub-world{grid-column:auto}.kclub-apps{grid-template-columns:repeat(2,1fr)}}
  @media(max-width:640px){body.kclub-route-v2 .topbar{background:#050706!important}.kclub{padding:18px 14px 104px;gap:10px}.kclub-brand h1{font-size:34px}.kclub-brand p{font-size:9px}.kclub-live{display:none}.kclub-hero{padding:18px;border-radius:22px;gap:18px}.kclub-id{align-items:flex-start;gap:13px}.kclub-avatar{width:82px;height:82px;flex-basis:82px;border-radius:22px}.kclub-crown{width:25px;height:25px;right:-4px;top:-5px;border-radius:9px;font-size:12px}.kclub-hero h2{font-size:28px;margin-top:6px}.kclub-kicker{font-size:7px}.kclub-role{margin-top:7px;font-size:7px}.kclub-handle{font-size:8px}.kclub-statrow{grid-template-columns:repeat(3,1fr)}.kclub-stat{min-height:70px;padding:11px}.kclub-stat strong{font-size:20px}.kclub-card{padding:17px;border-radius:19px}.kclub-community-copy h3{font-size:25px}.kclub-discord-foot{align-items:stretch;flex-direction:column}.kclub-discord-link{width:100%}.kclub-search{display:grid}.kclub-apps{grid-template-columns:1fr 1fr}}
  @media(max-width:390px){.kclub-id{display:grid;grid-template-columns:74px 1fr}.kclub-avatar{width:74px;height:74px}.kclub-actions{grid-column:1/-1}.kclub-apps{grid-template-columns:1fr}.kclub-stat span{font-size:6px}}
  @media(prefers-reduced-motion:reduce){.kclub-btn,.kclub-app{transition:none!important}}
  `;
  document.head.appendChild(s);
}
function nav(){styles()}
function setRouteChrome(on){
  document.body.classList.toggle('kclub-route-v2',on);
  if(!on)return;
  const e=document.querySelector('#pageEyebrow'),t=document.querySelector('#pageTitle');
  if(e)e.textContent='';
  if(t)t.textContent='';
}
async function ensureProfile(session,profile){
  const c=sb();if(!c)return null;
  let r=await c.from('komo_social_profiles').select('*').eq('user_id',session.user.id).maybeSingle();
  if(r.data)return r.data;
  const base=(profile?.display_name||profile?.first_name||session.user.email?.split('@')[0]||'membre');
  const handle=`${slug(base)}_${session.user.id.slice(0,4)}`.slice(0,24);
  const row={user_id:session.user.id,handle,display_name:profile?.display_name||`${profile?.first_name||''} ${profile?.last_name||''}`.trim()||base,bio:profile?.bio||'',interests:profile?.interests||[],avatar_config:profile?.avatar_config||{},is_public:false};
  const ins=await c.from('komo_social_profiles').insert(row).select('*').single();
  if(ins.error)throw ins.error;return ins.data;
}
async function signedAvatar(c,profile){
  if(!profile?.avatar_path)return'';
  const r=await c.storage.from('profile-avatars').createSignedUrl(profile.avatar_path,3600);
  return r.data?.signedUrl||'';
}
async function discordSnapshot(settings){
  const enabled=Boolean(settings?.discord_enabled),guildId=String(settings?.discord_guild_id||'').trim(),configured=enabled&&guildId;
  if(!configured)return{configured:false,online:null,name:'KŌMØ Community',invite:String(settings?.discord_invite_url||'').trim()};
  try{
    discordAbort?.abort?.();discordAbort=new AbortController();
    const r=await fetch(`https://discord.com/api/guilds/${encodeURIComponent(guildId)}/widget.json`,{signal:discordAbort.signal,cache:'no-store',credentials:'omit'});
    if(!r.ok)throw new Error('widget_unavailable');
    const data=await r.json();
    return{configured:true,online:Number(data?.presence_count)||0,name:data?.name||'KŌMØ Community',invite:data?.instant_invite||String(settings?.discord_invite_url||'').trim()};
  }catch(e){
    if(e?.name==='AbortError')return{configured:true,online:null,name:'KŌMØ Community',invite:String(settings?.discord_invite_url||'').trim()};
    return{configured:true,online:null,name:'KŌMØ Community',invite:String(settings?.discord_invite_url||'').trim()};
  }
}
async function load(){
  const c=sb();if(!c)return null;
  const runtime=window.KomoRuntime?.getContext?.(),session=runtime?.session||(await c.auth.getSession()).data?.session;
  if(!session?.user)return null;
  const [pr,er,wr,cr,cm,cn,lr,role,settings]=await Promise.all([
    c.from('profiles').select('display_name,first_name,last_name,bio,interests,avatar_config,avatar_path').eq('id',session.user.id).maybeSingle(),
    c.rpc('komo_engagement_summary'),
    c.rpc('komo_wallet_summary'),
    c.from('komo_clubs').select('*').eq('is_active',true).order('name'),
    c.from('komo_club_members').select('club_id,role').eq('user_id',session.user.id),
    c.rpc('komo_club_counts'),
    c.rpc('komo_club_leaderboard',{p_game_key:'reflex'}),
    c.rpc('komo_my_community_identity_v1'),
    c.from('komo_community_settings').select('discord_enabled,discord_guild_id,discord_invite_url').eq('id','primary').maybeSingle()
  ]);
  const profile=pr.data||{},social=await ensureProfile(session,profile);
  const [connectionsResult,avatarUrl,discord]=await Promise.all([
    c.from('komo_social_connections').select('*').or(`requester_id.eq.${session.user.id},addressee_id.eq.${session.user.id}`).order('created_at',{ascending:false}),
    signedAvatar(c,profile),
    discordSnapshot(settings.data||{})
  ]);
  return{session,profile,social:social||{},engagement:er.data||{},wallet:wr.data||{},clubs:cr.data||[],memberships:cm.data||[],counts:cn.data||[],connections:connectionsResult.data||[],leaderboard:lr.data||[],communityRole:role.data||{},discord,avatarUrl};
}
function initials(d){
  const p=d.profile||{},name=`${p.first_name||''} ${p.last_name||''}`.trim()||p.display_name||d.social?.display_name||'KŌMØ';
  const x=name.split(/\s+/).filter(Boolean);return(x.length>1?`${x[0][0]}${x[x.length-1][0]}`:x[0]?.slice(0,2)||'KØ').toUpperCase();
}
function avatar(d){
  if(d.avatarUrl)return`<img src="${esc(d.avatarUrl)}" alt="Photo de profil">`;
  const cfg=d.profile?.avatar_config||d.social?.avatar_config||{};
  return window.KomoAvatar?.render?.(cfg,{label:'Avatar KŌMØ'})||`<div class="kclub-avatar-fallback">${esc(initials(d))}</div>`;
}
function roleMarkup(d){
  const r=d.communityRole||{};if(!r.display_title)return'';
  return`<span class="kclub-role">${r.icon?`<span aria-hidden="true">${esc(r.icon)}</span>`:''}${esc(r.display_title)}</span>`;
}
function crownMarkup(d){return d.communityRole?.role_key==='founder'?'<span class="kclub-crown" aria-label="Fondateur KŌMØ">♛</span>':''}
function badges(d){
  const e=d.engagement||{},w=d.wallet||{},joined=d.memberships.length>0;
  return[['ORIGIN',Number(e.xp_total)>=100],['MOVE',Number(e.level)>=3],['FLOW',Number(e.level)>=5],['MOTION',Number(e.level)>=8],['CLUB',joined],['LIFE',Number(w.available_kp)>=500]]
    .map(([x,on])=>`<span class="kclub-badge ${on?'':'locked'}">${on?'✓ ':'○ '}${x}</span>`).join('');
}
function clubs(d){
  const joined=new Set(d.memberships.map(x=>x.club_id)),counts=new Map((d.counts||[]).map(x=>[x.club_id,Number(x.member_count)||0]));
  if(!d.clubs.length)return'<div class="kclub-person"><div><strong>Les premiers clubs arrivent.</strong><small>Course, trail, récupération et longévité.</small></div></div>';
  return d.clubs.map(c=>`<article class="kclub-club"><i>${esc(c.emoji||'•')}</i><div><strong>${esc(c.name)}</strong><small>${fmt(counts.get(c.id)||0)} membre${(counts.get(c.id)||0)>1?'s':''}</small></div><button type="button" data-club-toggle="${c.id}" class="${joined.has(c.id)?'joined':''}">${joined.has(c.id)?'Membre ✓':'Rejoindre'}</button></article>`).join('');
}
function leaderboard(d){
  if(!d.leaderboard.length)return'<div class="kclub-rank"><b>—</b><strong>Aucun score public pour le moment</strong><span>Jouez !</span></div>';
  return d.leaderboard.slice(0,5).map(x=>`<div class="kclub-rank"><b>#${x.rank}</b><strong>${esc(x.display_name)}${x.handle?` <small>@${esc(x.handle)}</small>`:''}</strong><span>${x.score} pts · ${Math.round(Number(x.metric)||0)} ms</span></div>`).join('');
}
function connectionCounts(d){
  return{accepted:d.connections.filter(x=>x.status==='accepted').length,pending:d.connections.filter(x=>x.status==='pending').length,incoming:d.connections.filter(x=>x.status==='pending'&&x.addressee_id===d.session.user.id)};
}
function pendingMarkup(d){
  const c=connectionCounts(d);if(!c.incoming.length)return'<div class="kclub-person"><div><strong>Votre réseau commence ici.</strong><small>Rendez votre profil visible puis recherchez des membres.</small></div></div>';
  return c.incoming.slice(0,4).map(x=>`<div class="kclub-person"><div><strong>Nouvelle demande</strong><small>Un membre souhaite rejoindre votre réseau KŌMØ.</small></div><div class="kclub-person-actions"><button data-connection-accept="${x.id}">Accepter</button><button class="reject" data-connection-decline="${x.id}">Refuser</button></div></div>`).join('');
}
function discordMarkup(d){
  const x=d.discord||{},live=x.configured&&x.online!==null;
  const status=x.configured?(live?`${fmt(x.online)} en ligne`:'Serveur connecté'):'Ouverture prochaine';
  const action=x.invite?`<a class="kclub-discord-link" href="${esc(x.invite)}" target="_blank" rel="noopener noreferrer">Rejoindre Discord →</a>`:'<button class="kclub-btn alt" type="button" disabled>Discord bientôt</button>';
  return`<article class="kclub-card kclub-community">
    <div class="kclub-community-copy"><span class="kclub-mini">KŌMØ COMMUNITY</span><h3>Le mouvement est personnel. La progression devient collective.</h3><p>Club réunit les membres KŌMØ autour du mouvement, de la longévité et des expériences partagées. Les données de santé restent dans Pulse : aucune donnée médicale n’est envoyée à Discord.</p></div>
    <div class="kclub-discord">
      <div class="kclub-discord-head"><div><strong>${esc(x.name||'KŌMØ Community')}</strong><small>Discord · conversations, événements, rencontres</small></div><span class="kclub-discord-mark" aria-hidden="true">KØ</span></div>
      <div class="kclub-discord-foot"><div><span class="kclub-online"><i></i>${esc(status)}</span><p>${x.configured?'Retrouvez la communauté KŌMØ en dehors de Pulse, sans partager vos informations de santé.':'Le serveur Discord KŌMØ sera relié ici dès son ouverture.'}</p></div>${action}</div>
    </div>
  </article>`;
}
function render(d){
  if(route()!=='club')return;styles();setRouteChrome(true);state=d;
  const root=document.querySelector('#viewRoot');if(!root)return;
  const con=connectionCounts(d),name=d.social.display_name||d.profile.display_name||'Membre KŌMØ';
  root.innerHTML=`<section class="kclub" data-komo-club data-version="${VERSION}">
    <header class="kclub-head"><div class="kclub-brand"><small>KŌMØ CLUB</small><h1>Votre monde KŌMØ.</h1><p>Votre identité, vos communautés et les personnes avec qui vous choisissez d’avancer.</p></div><span class="kclub-live"><i></i>COMMUNITY</span></header>
    <article class="kclub-hero">
      <div class="kclub-id"><div class="kclub-avatar">${avatar(d)}${crownMarkup(d)}</div><div class="kclub-identity"><span class="kclub-kicker">KŌMØ CLUB · ${d.social.is_public?'PROFIL PUBLIC':'PROFIL PRIVÉ'}</span>${roleMarkup(d)}<h2>${esc(name)}</h2><p class="kclub-handle"><strong>@${esc(d.social.handle||'membre')}</strong>${d.social.bio?` · ${esc(d.social.bio)}`:' · Bougez bien. Vivez longtemps. Partagez le mouvement.'}</p><div class="kclub-actions"><button class="kclub-btn" type="button" data-edit-social>Modifier mon profil Club</button><button class="kclub-btn alt" type="button" data-route="profile">Modifier ma photo</button></div></div></div>
      <div class="kclub-statrow"><div class="kclub-stat"><strong>${fmt(d.engagement.level||1)}</strong><span>Niveau</span></div><div class="kclub-stat"><strong>${fmt(d.wallet.available_kp||0)}</strong><span>K Points</span></div><div class="kclub-stat"><strong>${con.accepted}</strong><span>Connexions</span></div></div>
    </article>
    <div class="kclub-grid">
      ${discordMarkup(d)}
      <article class="kclub-card"><span class="kclub-mini">MES CLUBS</span><h3>Trouvez votre communauté.</h3><p>Rejoignez les groupes qui correspondent à votre manière de bouger et de vivre.</p><div class="kclub-clubs">${clubs(d)}</div></article>
      <article class="kclub-card"><span class="kclub-mini">MON RÉSEAU</span><h3>Rencontrez les membres KŌMØ.</h3><p>Seuls les profils qui ont choisi d’être visibles peuvent être découverts.</p><div class="kclub-profile-form"><div class="kclub-search"><input id="kclubSearch" placeholder="@handle ou nom"><button class="kclub-btn" type="button" data-social-search>Rechercher</button></div><div class="kclub-people" id="kclubPeople">${pendingMarkup(d)}</div></div></article>
      <article class="kclub-card"><span class="kclub-mini">BADGES</span><h3>Une identité qui évolue avec vous.</h3><p>Les badges reflètent votre engagement dans KŌMØ. Ils n’ont aucun impact sur vos scores de santé.</p><div class="kclub-badges">${badges(d)}</div></article>
      <article class="kclub-card"><span class="kclub-mini">KŌMØ REFLEX · 001</span><h3>Testez votre réaction.</h3><p>Une micro-expérience communautaire : votre premier score du jour peut rapporter +20 XP, jamais de K Points.</p><div class="kclub-gamebox" id="kclubGame"><div><strong>PRÊT ?</strong><span>Cliquez pour commencer.</span></div></div><div class="kclub-leader">${leaderboard(d)}</div></article>
      <article class="kclub-card kclub-world"><span class="kclub-mini">KŌMØ WORLD</span><h3>Continuez l’expérience.</h3><p>Club relie la communauté aux autres univers KŌMØ, sans mélanger les rôles de chaque produit.</p><div class="kclub-apps">${apps.map(([n,c,u,k])=>`<a class="kclub-app" href="${u}" target="_blank" rel="noopener noreferrer"><small>${k} ↗</small><div><strong>${n}</strong><p>${c}</p></div></a>`).join('')}</div></article>
    </div>
  </section>`;
  bind(d);
  window.dispatchEvent(new CustomEvent('komo:club-rendered',{detail:{version:VERSION,discord:Boolean(d.discord?.configured)}}));
}
function profileEditor(d){
  const root=document.querySelector('[data-komo-club]');if(!root)return;
  const old=root.querySelector('[data-social-editor]');if(old){old.remove();return}
  const card=document.createElement('article');card.className='kclub-card kclub-editor';card.dataset.socialEditor='1';
  card.innerHTML=`<span class="kclub-mini">PROFIL CLUB</span><h3>Choisissez ce que les autres voient.</h3><div class="kclub-profile-form"><input id="kclubName" maxlength="50" value="${esc(d.social.display_name||'')}" placeholder="Nom affiché"><input id="kclubHandle" maxlength="24" value="${esc(d.social.handle||'')}" placeholder="handle"><textarea id="kclubBio" maxlength="240" placeholder="Bio">${esc(d.social.bio||'')}</textarea><input id="kclubInterests" value="${esc((d.social.interests||[]).join(', '))}" placeholder="Trail, design, recovery..."><label class="kclub-public"><input id="kclubPublic" type="checkbox" ${d.social.is_public?'checked':''}> Rendre mon profil visible dans KŌMØ Club</label><div class="kclub-actions"><button class="kclub-btn" type="button" data-save-social>Enregistrer</button><button class="kclub-btn alt" type="button" data-edit-social>Fermer</button></div></div>`;
  root.querySelector('.kclub-hero').insertAdjacentElement('afterend',card);bind(d);
}
async function saveSocial(){
  if(actionBusy)return;const handle=slug(document.querySelector('#kclubHandle')?.value).slice(0,24);if(handle.length<3)return toast('Le handle doit contenir au moins 3 caractères.');
  actionBusy=true;try{
    const payload={display_name:document.querySelector('#kclubName')?.value.trim().slice(0,50),handle,bio:document.querySelector('#kclubBio')?.value.trim().slice(0,240),interests:String(document.querySelector('#kclubInterests')?.value||'').split(',').map(x=>x.trim()).filter(Boolean).slice(0,12),is_public:!!document.querySelector('#kclubPublic')?.checked,updated_at:new Date().toISOString()};
    const r=await sb().from('komo_social_profiles').update(payload).eq('user_id',state.session.user.id);if(r.error)throw r.error;toast('Profil Club mis à jour.');
  }catch(e){toast(e.code==='23505'?'Ce handle est déjà utilisé.':e.message||'Enregistrement impossible.')}finally{actionBusy=false}
  await hydrate(true);
}
async function toggleClub(id){
  if(actionBusy)return;actionBusy=true;try{
    const has=state.memberships.some(x=>x.club_id===id),c=sb();
    const r=has?await c.from('komo_club_members').delete().eq('club_id',id).eq('user_id',state.session.user.id):await c.from('komo_club_members').insert({club_id:id,user_id:state.session.user.id});
    if(r.error)throw r.error;toast(has?'Club quitté.':'Bienvenue dans le club.');
  }catch(e){toast(e.message||'Action impossible.')}finally{actionBusy=false}
  await hydrate(true);
}
async function socialSearch(){
  const q=document.querySelector('#kclubSearch')?.value.trim();if(!q||!state)return;
  const box=document.querySelector('#kclubPeople');if(!box)return;
  box.innerHTML='<div class="kclub-person"><div><strong>Recherche…</strong></div></div>';
  const c=sb(),clean=q.replace(/^@/,'');
  const r=await c.from('komo_social_profiles').select('user_id,handle,display_name,bio').or(`handle.ilike.%${clean}%,display_name.ilike.%${q}%`).eq('is_public',true).neq('user_id',state.session.user.id).limit(10);
  if(r.error){box.innerHTML='<div class="kclub-person"><div><strong>Recherche indisponible.</strong></div></div>';return}
  box.innerHTML=(r.data||[]).length?(r.data||[]).map(p=>{const existing=state.connections.find(x=>(x.requester_id===p.user_id||x.addressee_id===p.user_id)&&x.status!=='declined');return`<div class="kclub-person"><div><strong>${esc(p.display_name||'Membre KŌMØ')} · @${esc(p.handle)}</strong><small>${esc(p.bio||'Profil KŌMØ Club')}</small></div><button data-connect="${p.user_id}" ${existing?'disabled':''}>${existing?'Connecté / en attente':'Se connecter'}</button></div>`}).join(''):'<div class="kclub-person"><div><strong>Aucun profil trouvé.</strong><small>Essayez un autre handle.</small></div></div>';
  box.querySelectorAll('[data-connect]').forEach(b=>b.onclick=()=>connect(b.dataset.connect));
}
async function connect(peer){
  if(actionBusy)return;actionBusy=true;try{
    const r=await sb().from('komo_social_connections').insert({requester_id:state.session.user.id,addressee_id:peer,status:'pending'});if(r.error)throw r.error;toast('Demande envoyée.');
  }catch(e){toast(e.code==='23505'?'Demande déjà existante.':e.message||'Impossible d’envoyer la demande.')}finally{actionBusy=false}
  await hydrate(true);
}
async function respondConnection(id,status){
  if(actionBusy||!['accepted','declined'].includes(status))return;actionBusy=true;try{
    const r=await sb().from('komo_social_connections').update({status}).eq('id',id).eq('addressee_id',state.session.user.id);if(r.error)throw r.error;toast(status==='accepted'?'Connexion acceptée.':'Demande refusée.');
  }catch(e){toast(e.message||'Action impossible.')}finally{actionBusy=false}
  await hydrate(true);
}
function gameClick(){
  const box=document.querySelector('#kclubGame');if(!box)return;
  if(box.classList.contains('waiting')){clearTimeout(gameTimer);box.className='kclub-gamebox';box.innerHTML='<div><strong>TROP TÔT</strong><span>Cliquez pour recommencer.</span></div>';return}
  if(box.classList.contains('go')){const ms=Math.round(performance.now()-gameStart),score=Math.max(0,Math.min(1000,Math.round(1100-ms)));box.className='kclub-gamebox';box.innerHTML=`<div><strong>${ms} ms</strong><span>${score} points · enregistrement…</span></div>`;saveGame(score,ms);return}
  box.className='kclub-gamebox waiting';box.innerHTML='<div><strong>ATTENDEZ…</strong><span>Ne cliquez pas avant le signal.</span></div>';
  gameTimer=setTimeout(()=>{box.className='kclub-gamebox go';box.innerHTML='<div><strong>MAINTENANT !</strong><span>Cliquez.</span></div>';gameStart=performance.now()},900+Math.random()*2200);
}
async function saveGame(score,ms){
  try{const r=await sb().rpc('komo_submit_game_score',{p_game_key:'reflex',p_score:score,p_metric:ms});if(r.error)throw r.error;const x=r.data||{};toast(x.xp_awarded?`Score enregistré · +${x.xp_awarded} XP`:'Score enregistré. XP du jour déjà gagné.');setTimeout(()=>hydrate(true),350)}catch(e){toast(e.message||'Score non enregistré.')}
}
function toast(msg){const t=document.querySelector('#toast');if(t){t.textContent=msg;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>t.hidden=true,2800)}}
function bind(d){
  document.querySelectorAll('[data-edit-social]').forEach(b=>b.onclick=()=>profileEditor(d));
  document.querySelector('[data-save-social]')?.addEventListener('click',saveSocial);
  document.querySelectorAll('[data-club-toggle]').forEach(b=>b.onclick=()=>toggleClub(b.dataset.clubToggle));
  document.querySelector('[data-social-search]')?.addEventListener('click',socialSearch);
  document.querySelector('#kclubSearch')?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();socialSearch()}});
  document.querySelector('#kclubGame')?.addEventListener('click',gameClick);
  document.querySelectorAll('[data-route]').forEach(b=>b.onclick=()=>window.KomoPatientNavigation?.go?.(b.dataset.route));
  document.querySelectorAll('[data-connection-accept]').forEach(b=>b.onclick=()=>respondConnection(b.dataset.connectionAccept,'accepted'));
  document.querySelectorAll('[data-connection-decline]').forEach(b=>b.onclick=()=>respondConnection(b.dataset.connectionDecline,'declined'));
}
async function hydrate(force=false){
  nav();const active=route()==='club';setRouteChrome(active);
  if(!active||hydrating)return;
  const c=sb();if(!c)return;
  hydrating=true;try{const d=await load();if(d&&route()==='club')render(d)}catch(e){console.error('[club-hub-v2]',e);toast('KŌMØ Club est momentanément indisponible.')}finally{hydrating=false}
}
let scheduleTimer=0;
function schedule(){clearTimeout(scheduleTimer);scheduleTimer=setTimeout(()=>hydrate(),35)}
['hashchange','pageshow','komo:route-ready','komo:canonical-route','komo:data-ready','komo:session-ready','komo:profile-identity-updated'].forEach(x=>window.addEventListener(x,schedule));
document.addEventListener('DOMContentLoaded',()=>{nav();schedule()},{once:true});
if(document.readyState!=='loading'){nav();schedule()}
window.KomoClub={open:()=>window.KomoPatientNavigation?.go?.('club'),refresh:()=>hydrate(true),version:VERSION};
