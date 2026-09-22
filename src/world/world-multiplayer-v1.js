import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const URL='https://uqlolefsiktbznnymriy.supabase.co';
const KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const PULSE_ORIGIN='https://pulse.komolongevity.com';
const STALE_MS=45000;
const CLOCK_SKEW_MS=180000;
const HEARTBEAT_MS=2200;
const POSE_MS=125;
const PRESENCE_REFRESH_MS=4000;
const CHAT_LIMIT=50;
const VOICE_ENTER_M=11;
const VOICE_EXIT_M=14;
const SOCIAL_KEY='komo_world_social_v1';
function dayKey(d=new Date()){return d.toISOString().slice(0,10)}
function loadSocial(){
  try{
    const raw=JSON.parse(localStorage.getItem(SOCIAL_KEY)||'{}');
    return {day:raw.day||dayKey(),xp:Number(raw.xp)||0,done:raw.done&&typeof raw.done==='object'?raw.done:{},streak:Number(raw.streak)||0,lastActive:raw.lastActive||''};
  }catch{return {day:dayKey(),xp:0,done:{},streak:0,lastActive:''}}
}

function escText(v,max=500){return String(v??'').replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,max)}
function css(){
  if(document.querySelector('#komo-world-mp-style'))return;
  const s=document.createElement('style');s.id='komo-world-mp-style';s.textContent=`
  .kwmp-dock{position:fixed;z-index:82;top:92px;right:18px;display:flex;gap:7px;align-items:center;flex-wrap:wrap;justify-content:flex-end;max-width:520px}
  .kwmp-pill{height:31px;padding:0 12px;border:1px solid rgba(255,255,255,.09);border-radius:999px;background:rgba(24,39,31,.76);backdrop-filter:blur(15px);color:rgba(242,236,226,.76);font-size:7px;font-weight:800;letter-spacing:.11em;cursor:pointer}
  .kwmp-pill[data-state="online"],.kwmp-pill[data-state="on"]{border-color:rgba(190,218,193,.24);color:#dce9dd}
  .kwmp-pill[data-state="online"]::before,.kwmp-pill[data-state="on"]::before{content:"";display:inline-block;width:5px;height:5px;border-radius:50%;background:#a8c9ab;margin-right:7px;box-shadow:0 0 10px rgba(168,201,171,.38)}
  .kwmp-chat{position:fixed;z-index:96;left:18px;bottom:18px;width:min(440px,calc(100vw - 36px));max-height:min(350px,48vh);display:grid;grid-template-rows:auto auto minmax(70px,1fr) auto auto;border:1px solid rgba(255,255,255,.07);border-radius:16px;background:linear-gradient(150deg,rgba(11,18,14,.52),rgba(18,28,22,.38));backdrop-filter:blur(10px);box-shadow:0 14px 42px rgba(8,14,10,.16);overflow:hidden;opacity:1;visibility:visible;transform:none}
  .kwmp-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 10px 6px;border-bottom:1px solid rgba(255,255,255,.045)}
  .kwmp-head span{display:block;color:#d6b67f;font-size:6px;font-weight:800;letter-spacing:.15em}.kwmp-head strong{display:block;margin-top:2px;font:500 14px/1.1 Georgia,serif}
  .kwmp-world-btn{height:24px;padding:0 9px;border:1px solid rgba(216,186,134,.18);border-radius:8px;background:rgba(216,186,134,.07);color:#ead9ba;font-size:6px;font-weight:850;letter-spacing:.08em;cursor:pointer}
  .kwmp-roster{display:none;padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.05);gap:5px;max-height:130px;overflow:auto}.kwmp-chat.people-open .kwmp-roster{display:grid}
  .kwmp-person{display:grid;grid-template-columns:1fr auto auto auto;gap:6px;align-items:center;padding:6px 7px;border:1px solid rgba(255,255,255,.05);border-radius:9px;background:rgba(255,255,255,.025)}
  .kwmp-person b{font-size:7px;letter-spacing:.03em}.kwmp-person span{font-size:6px;color:#d8ba86;letter-spacing:.07em;white-space:nowrap}.kwmp-person small{display:block;margin-top:2px;font-size:5px;color:rgba(240,234,224,.42)}
  .kwmp-person button{height:22px;padding:0 7px;border:1px solid rgba(216,186,134,.18);border-radius:7px;background:rgba(216,186,134,.07);color:#ead9ba;font-size:5px;font-weight:850;letter-spacing:.07em;cursor:pointer}.kwmp-person button:hover{background:rgba(216,186,134,.14)}.kwmp-person.mine{border-color:rgba(216,186,134,.13)}
  .kwmp-messages{overflow:auto;padding:8px 10px;display:flex;flex-direction:column;justify-content:flex-end;gap:4px;min-height:84px}
  .kwmp-msg{max-width:96%;padding:3px 6px;border-radius:7px;background:rgba(8,13,10,.18);text-shadow:0 1px 2px rgba(0,0,0,.32)}.kwmp-msg.mine{align-self:stretch;background:rgba(210,179,126,.055)}.kwmp-msg.dm{border-left:2px solid rgba(216,186,134,.62);background:rgba(101,81,48,.13)}
  .kwmp-msg b{display:inline;margin-right:5px;font-size:8px;color:#f0e8da}.kwmp-msg p{display:inline;margin:0;font-size:9px;line-height:1.35;color:rgba(242,236,226,.80);white-space:pre-wrap;word-break:break-word}.kwmp-msg small{display:inline;margin-left:6px;font-size:6px;color:rgba(242,236,226,.28)}
  .kwmp-empty{margin:auto;color:rgba(242,236,226,.38);font-size:8px;text-align:center;line-height:1.45;padding:12px}
  .kwmp-compose{display:grid;grid-template-columns:auto 1fr auto;gap:6px;padding:7px 8px;border-top:1px solid rgba(255,255,255,.055)}
  .kwmp-target{height:34px;padding:0 8px;border:1px solid rgba(216,186,134,.20);border-radius:9px;background:rgba(216,186,134,.08);color:#ead9ba;font-size:6px;font-weight:900;letter-spacing:.07em;cursor:pointer;max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .kwmp-compose input{min-width:0;height:34px;border:1px solid rgba(255,255,255,.07);border-radius:9px;background:rgba(255,255,255,.04);color:#f0e8da;padding:0 10px;font-size:9px;outline:none}.kwmp-compose button[type="submit"]{height:34px;padding:0 10px;border-radius:9px;background:#d8ba86;color:#1d2d25;font-size:7px;font-weight:850;cursor:pointer}.kwmp-compose button:disabled,.kwmp-compose input:disabled{opacity:.42}
  .kwmp-note{padding:0 9px 7px;color:rgba(242,236,226,.28);font-size:6px;line-height:1.35}
  @media(max-width:900px),(pointer:coarse){
    .kwmp-dock{top:63px;right:8px;gap:4px;max-width:calc(100vw - 16px)}
    .kwmp-pill{height:25px;padding:0 8px;font-size:5px;letter-spacing:.07em;background:rgba(22,37,29,.90);backdrop-filter:none}
    .kwmp-chat{left:8px;bottom:74px;width:min(420px,calc(100vw - 16px));max-height:34vh;background:linear-gradient(150deg,rgba(11,18,14,.66),rgba(18,28,22,.52));backdrop-filter:none}
  }
  @media(max-width:520px){
    .kwmp-dock{top:109px}.kwmp-pill{height:24px;padding:0 7px}
    .kwmp-pill[data-kwmp-connect]{max-width:78px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .kwmp-chat{bottom:82px;max-height:31vh}.kwmp-head strong{font-size:12px}.kwmp-note{display:none}
  }
  `;document.head.appendChild(s);
}
function ui(){
  css();
  let dock=document.querySelector('#kwmpDock');
  if(dock)return {
    dock,
    connect:dock.querySelector('[data-kwmp-connect]'),
    people:dock.querySelector('[data-kwmp-people]'),
    chat:dock.querySelector('[data-kwmp-chat]'),
    voice:dock.querySelector('[data-kwmp-voice]'),
    social:dock.querySelector('[data-kwmp-social]'),
    drawer:document.querySelector('#kwmpChat'),
    roster:document.querySelector('#kwmpRoster'),
    messages:document.querySelector('#kwmpMessages'),
    form:document.querySelector('#kwmpCompose'),
    input:document.querySelector('#kwmpInput'),
    target:document.querySelector('#kwmpTarget'),
    worldBtn:document.querySelector('[data-kwmp-world]')
  };
  dock=document.createElement('div');dock.id='kwmpDock';dock.className='kwmp-dock';
  dock.innerHTML='<button type="button" class="kwmp-pill" data-kwmp-connect data-state="offline">CONNECT WORLD</button><button type="button" class="kwmp-pill" data-kwmp-people>PEOPLE · 0</button><button type="button" class="kwmp-pill" data-kwmp-chat>CHAT</button><button type="button" class="kwmp-pill" data-kwmp-voice data-state="off">VOICE · OFF</button><button type="button" class="kwmp-pill" data-kwmp-social>SOCIAL · 0</button>';
  document.body.appendChild(dock);
  const drawer=document.createElement('aside');drawer.id='kwmpChat';drawer.className='kwmp-chat open';drawer.setAttribute('aria-hidden','false');
  drawer.innerHTML='<div class="kwmp-head"><div><span>KŌMØ WORLD · LIVE</span><strong>World Chat</strong></div><button type="button" class="kwmp-world-btn" data-kwmp-world>WORLD</button></div><div class="kwmp-roster" id="kwmpRoster"><div class="kwmp-empty">Aucune présence World active.</div></div><div class="kwmp-messages" id="kwmpMessages"><div class="kwmp-empty">Connectez World pour discuter.</div></div><form class="kwmp-compose" id="kwmpCompose"><button type="button" class="kwmp-target" id="kwmpTarget" data-kwmp-target>WORLD</button><input id="kwmpInput" maxlength="500" autocomplete="off" placeholder="Message World…" disabled><button type="submit" disabled>ENVOYER</button></form><div class="kwmp-note">ENTER · écrire · PEOPLE → MP · VOICE = vocal de proximité. Les données de santé ne sont jamais partagées.</div>';
  document.body.appendChild(drawer);
  return {dock,connect:dock.querySelector('[data-kwmp-connect]'),people:dock.querySelector('[data-kwmp-people]'),chat:dock.querySelector('[data-kwmp-chat]'),voice:dock.querySelector('[data-kwmp-voice]'),social:dock.querySelector('[data-kwmp-social]'),drawer,roster:drawer.querySelector('#kwmpRoster'),messages:drawer.querySelector('#kwmpMessages'),form:drawer.querySelector('#kwmpCompose'),input:drawer.querySelector('#kwmpInput'),target:drawer.querySelector('#kwmpTarget'),worldBtn:drawer.querySelector('[data-kwmp-world]')};
}
function labelSprite(THREE,text,subtitle='PULSE MEMBER'){
  const c=document.createElement('canvas');c.width=512;c.height=144;const x=c.getContext('2d');
  x.clearRect(0,0,512,144);
  x.fillStyle='rgba(19,31,24,.84)';x.fillRect(24,18,464,104);
  x.strokeStyle='rgba(216,185,132,.58)';x.lineWidth=2;x.strokeRect(25,19,462,102);
  x.fillStyle='#f3ede3';x.font='600 35px Arial';x.textAlign='center';x.textBaseline='middle';
  x.fillText(escText(text,24)||'KŌMØ Member',256,59);
  x.fillStyle='rgba(216,185,132,.92)';x.font='700 16px Arial';x.fillText(escText(subtitle,28)||'PULSE MEMBER',256,92);
  const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;tx.anisotropy=2;
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,transparent:true,depthWrite:false,depthTest:false}));
  sp.scale.set(2.25,.64,1);sp.position.y=2.52;sp.renderOrder=30;return sp;
}
function presenceAvatar(runtime,record){
  const {THREE}=runtime,g=new THREE.Group();g.name='KOMO_REMOTE_'+record.user_id;
  const cfg=record.avatar_config||{};
  const skin={porcelain:0xe9d5c3,sand:0xd8b797,amber:0xb9845e,bronze:0x8e6248,deep:0x5d4034}[cfg.skin]||0xc79772;
  const outfit={tee:0x294238,sweat:0x56675a,varsity:0x21352f,motion:0x334b3e}[cfg.outfit]||0x294238;
  const hairColor={dark:0x26221f,brown:0x594438,sand:0x8b745d,black:0x171717}[cfg.hair]||0x2c2521;
  const matSkin=new THREE.MeshStandardMaterial({color:skin,roughness:.80});
  const matOut=new THREE.MeshStandardMaterial({color:outfit,roughness:.72});
  const matTrouser=new THREE.MeshStandardMaterial({color:0x343a36,roughness:.80});
  const matHair=new THREE.MeshStandardMaterial({color:hairColor,roughness:.90});
  const matShoe=new THREE.MeshStandardMaterial({color:0x222220,roughness:.65});
  const accent=new THREE.MeshStandardMaterial({color:0xaa8254,roughness:.40,metalness:.38});

  const hips=new THREE.Mesh(new THREE.CylinderGeometry(.24,.25,.28,14),matTrouser);hips.position.y=.93;g.add(hips);
  const torso=new THREE.Mesh(new THREE.CylinderGeometry(.24,.30,.72,16),matOut);torso.position.y=1.31;g.add(torso);
  const shoulders=new THREE.Mesh(new THREE.BoxGeometry(.68,.16,.24),matOut);shoulders.position.y=1.56;g.add(shoulders);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.205,18,14),matSkin);head.position.y=1.88;head.scale.set(.92,1.05,.94);g.add(head);
  const hair=new THREE.Mesh(new THREE.SphereGeometry(.211,16,10,0,Math.PI*2,0,Math.PI*.50),matHair);hair.position.set(0,1.95,-.005);hair.scale.set(.94,.88,.96);g.add(hair);

  const leftLeg=new THREE.Group(),rightLeg=new THREE.Group();leftLeg.position.set(-.13,.90,0);rightLeg.position.set(.13,.90,0);g.add(leftLeg,rightLeg);
  const leftKnee=new THREE.Group(),rightKnee=new THREE.Group();leftKnee.position.y=-.31;rightKnee.position.y=-.31;leftLeg.add(leftKnee);rightLeg.add(rightKnee);
  let q=new THREE.Mesh(new THREE.CylinderGeometry(.072,.078,.34,10),matTrouser);q.position.y=-.17;leftLeg.add(q);
  q=new THREE.Mesh(new THREE.CylinderGeometry(.072,.078,.34,10),matTrouser);q.position.y=-.17;rightLeg.add(q);
  q=new THREE.Mesh(new THREE.CylinderGeometry(.060,.068,.32,10),matTrouser);q.position.y=-.17;leftKnee.add(q);
  q=new THREE.Mesh(new THREE.CylinderGeometry(.060,.068,.32,10),matTrouser);q.position.y=-.17;rightKnee.add(q);
  q=new THREE.Mesh(new THREE.BoxGeometry(.15,.09,.30),matShoe);q.position.set(0,-.37,.065);leftKnee.add(q);
  q=new THREE.Mesh(new THREE.BoxGeometry(.15,.09,.30),matShoe);q.position.set(0,-.37,.065);rightKnee.add(q);

  const leftArm=new THREE.Group(),rightArm=new THREE.Group();leftArm.position.set(-.34,1.54,0);rightArm.position.set(.34,1.54,0);g.add(leftArm,rightArm);
  const leftElbow=new THREE.Group(),rightElbow=new THREE.Group();leftElbow.position.y=-.28;rightElbow.position.y=-.28;leftArm.add(leftElbow);rightArm.add(rightElbow);
  q=new THREE.Mesh(new THREE.CylinderGeometry(.052,.060,.30,10),matSkin);q.position.y=-.15;leftArm.add(q);
  q=new THREE.Mesh(new THREE.CylinderGeometry(.052,.060,.30,10),matSkin);q.position.y=-.15;rightArm.add(q);
  q=new THREE.Mesh(new THREE.CylinderGeometry(.045,.052,.27,10),matSkin);q.position.y=-.14;leftElbow.add(q);
  q=new THREE.Mesh(new THREE.CylinderGeometry(.045,.052,.27,10),matSkin);q.position.y=-.14;rightElbow.add(q);

  const ringMat=new THREE.MeshBasicMaterial({color:0xd6b779,transparent:true,opacity:.48,depthWrite:false});
  const ring=new THREE.Mesh(new THREE.RingGeometry(.42,.50,40),ringMat);ring.rotation.x=-Math.PI/2;ring.position.y=.018;ring.renderOrder=28;g.add(ring);
  const beacon=new THREE.Mesh(new THREE.CylinderGeometry(.014,.014,3.3,6),new THREE.MeshBasicMaterial({color:0xd6b779,transparent:true,opacity:.20,depthWrite:false,depthTest:false}));
  beacon.position.y=1.65;beacon.renderOrder=27;g.add(beacon);
  const beaconTop=new THREE.Mesh(new THREE.RingGeometry(.12,.18,24),new THREE.MeshBasicMaterial({color:0xf0d4a0,transparent:true,opacity:.58,depthWrite:false,depthTest:false}));
  beaconTop.position.y=3.28;beaconTop.rotation.x=-Math.PI/2;beaconTop.renderOrder=29;g.add(beaconTop);
  const tag=labelSprite(THREE,record.display_name,record.role_title||'PULSE MEMBER');g.add(tag);

  g.userData.target=new THREE.Vector3(Number(record.x)||0,Number(record.y)||0,Number(record.z)||0);
  g.userData.targetYaw=record.yaw||0;g.userData.zone=record.zone||'world';g.position.copy(g.userData.target);
  g.userData.avatar={hips,torso,head,leftLeg,rightLeg,leftKnee,rightKnee,leftArm,rightArm,leftElbow,rightElbow,tag,ring,beacon,beaconTop,lastPosition:g.position.clone(),walkPhase:0};
  runtime.scene.add(g);return g;
}
export async function mount(runtime){
  if(!runtime?.scene||!runtime?.THREE||!runtime?.getState)return;
  const U=ui();
  const client=createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storageKey:'komo-world-auth-v1'}});
  const state={session:null,profile:null,channel:null,peers:new Map(),rows:new Map(),roles:new Map(),connected:false,presenceLive:false,subscribed:false,lastZone:'',timer:null,poseTimer:null,presenceRefreshTimer:null,raf:0,popup:null,messages:[],started:false,lastPresenceError:'',lastPresenceErrorAt:0,lastPose:null,lastPoseSentAt:0,lastTrackSentAt:0,dmTarget:null,social:loadSocial(),voice:{enabled:false,stream:null,peers:new Map(),lastSweep:0,connected:new Set()}};
  const roleFor=id=>state.roles.get(id)||null;
  const decoratePresence=row=>row?{...row,role_title:roleFor(row.user_id)?.display_title||''}:row;
  const saveSocial=()=>{try{localStorage.setItem(SOCIAL_KEY,JSON.stringify(state.social))}catch{}};
  const updateSocialUI=()=>{U.social.textContent='SOCIAL · '+state.social.xp+(state.social.streak>1?' · '+state.social.streak+'D':'')};
  const awardSocial=(kind,xp)=>{
    const today=dayKey();
    if(state.social.day!==today){
      const yesterday=dayKey(new Date(Date.now()-86400000));
      state.social={day:today,xp:0,done:{},streak:state.social.lastActive===yesterday?Math.max(1,state.social.streak+1):1,lastActive:state.social.lastActive||''};
    }
    if(state.social.done[kind])return false;
    state.social.done[kind]=Date.now();state.social.xp+=xp;state.social.lastActive=today;if(!state.social.streak)state.social.streak=1;saveSocial();updateSocialUI();
    runtime.completeSocial?.();runtime.notify?.('SOCIAL +'+xp+' XP');
    return true;
  };

  const setOnlineUI=()=>{
    if(state.presenceLive){
      const ownRole=roleFor(state.session?.user?.id)?.display_title||'';
      U.connect.textContent=((escText(state.profile?.display_name||'WORLD',12)||'WORLD')+(ownRole?' · '+ownRole:'')).toUpperCase();
      U.connect.dataset.state='online';
    }else if(state.session?.user){
      U.connect.textContent='WORLD · SYNCING';
      U.connect.dataset.state='syncing';
    }else{
      U.connect.textContent='CONNECT WORLD';
      U.connect.dataset.state='offline';
    }
    U.input.disabled=!state.presenceLive;U.form.querySelector('button[type="submit"]').disabled=!state.presenceLive;
    updateSocialUI();
  };
  const updateVoiceUI=()=>{
    const n=state.voice.connected.size;
    U.voice.dataset.state=state.voice.enabled?'on':'off';
    U.voice.textContent=state.voice.enabled?('VOICE · ON'+(n?' · '+n:'')):'VOICE · OFF';
  };
  const displayNameFor=id=>state.rows.get(id)?.display_name||roleFor(id)?.display_title||'Member';
  const renderMessages=()=>{
    U.messages.innerHTML='';
    if(!state.messages.length){const e=document.createElement('div');e.className='kwmp-empty';e.textContent=state.connected?'Le chat World est ouvert.':'Connectez World pour discuter.';U.messages.appendChild(e);return}
    for(const m of state.messages.slice(-CHAT_LIMIT)){
      const mine=m.user_id===state.session?.user?.id,isDm=!!m.recipient_id;
      const d=document.createElement('div');d.className='kwmp-msg'+(mine?' mine':'')+(isDm?' dm':'');
      const role=roleFor(m.user_id);
      const n=document.createElement('b');n.textContent=(escText(m.display_name,60)||'KŌMØ Member')+(role?.display_title?' · '+role.display_title:'');
      const p=document.createElement('p');p.textContent=escText(m.body,500);
      const small=document.createElement('small');const date=new Date(m.created_at||Date.now());
      const dmLabel=isDm?(mine?' · MP → '+displayNameFor(m.recipient_id):' · MP'):'';
      small.textContent=date.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})+dmLabel;
      d.append(n,p,small);U.messages.appendChild(d);
    }
    U.messages.scrollTop=U.messages.scrollHeight;
  };
  const setDmTarget=(row=null)=>{
    state.dmTarget=row?{user_id:row.user_id,display_name:row.display_name}:null;
    U.target.textContent=row?('MP · '+escText(row.display_name,18)):'WORLD';
    U.input.placeholder=row?('Message privé à '+escText(row.display_name,28)+'…'):'Message World…';
    U.target.title=row?'Cliquer pour revenir au chat World':'Chat World';
    U.input.focus();
  };
  const zoneLabel=z=>({world:'WORLD',twin:'TWIN',rehab:'KŌMØ FIT',arena:'ARENA'}[z]||'WORLD');
  const renderRoster=()=>{
    if(!U.roster)return;
    U.roster.innerHTML='';
    const own=state.session?.user?.id,local=runtime.getState();
    const active=[...state.rows.values()].filter(row=>fresh(row));
    if(state.presenceLive&&own&&!active.some(r=>r.user_id===own)){
      const st=runtime.getState();
      active.unshift(decoratePresence({user_id:own,display_name:state.profile?.display_name||'You',zone:st.mode||'world',x:st.position.x,y:st.position.y,z:st.position.z,voice_enabled:state.voice.enabled,updated_at:new Date().toISOString()}));
    }
    active.sort((a,b)=>(a.user_id===own?-1:b.user_id===own?1:String(a.display_name||'').localeCompare(String(b.display_name||''))));
    if(!active.length){const e=document.createElement('div');e.className='kwmp-empty';e.textContent=state.session?.user?'Synchronisation de la présence…':'Connectez World pour voir les personnes présentes.';U.roster.appendChild(e);return}
    for(const row of active){
      const mine=row.user_id===own,role=roleFor(row.user_id);
      const item=document.createElement('div');item.className='kwmp-person'+(mine?' mine':'');
      const copy=document.createElement('div');
      const n=document.createElement('b');n.textContent=(mine?'YOU · ':'')+(escText(row.display_name,40)||'KŌMØ Member')+(role?.display_title?' · '+role.display_title:'');
      const meta=document.createElement('small');
      const sameZone=(row.zone||'world')===local.mode;
      const distance=sameZone?Math.hypot((Number(row.x)||0)-local.position.x,(Number(row.z)||0)-local.position.z):null;
      meta.textContent=mine?'CURRENT POSITION':sameZone?(Math.round(distance)+' m away'+(row.voice_enabled?' · VOICE':'')):'Different space';
      copy.append(n,meta);
      const z=document.createElement('span');z.textContent=zoneLabel(row.zone);
      item.append(copy,z);
      if(!mine){
        const join=document.createElement('button');join.type='button';join.textContent='JOIN';
        join.addEventListener('click',()=>{
          const ok=runtime.joinPresence?.(row);
          if(ok){runtime.notify?.('Joining '+(escText(row.display_name,28)||'member'));setTimeout(()=>{heartbeat();sendPose(true)},320)}
        });
        const dm=document.createElement('button');dm.type='button';dm.textContent='MP';dm.addEventListener('click',()=>{setDmTarget(row);U.drawer.classList.remove('people-open')});
        item.append(join,dm);
      }
      U.roster.appendChild(item);
    }
  };
  const timestampPlausible=(row)=>{
    const t=new Date(row?.updated_at||0).getTime();
    if(!Number.isFinite(t)||!t)return true;
    const age=Date.now()-t;
    return age<STALE_MS+CLOCK_SKEW_MS&&age>-CLOCK_SKEW_MS;
  };
  const fresh=(row)=>{
    const seen=Number(row?._local_seen_at)||0;
    return seen?Date.now()-seen<STALE_MS:timestampPlausible(row);
  };
  const syncPeers=()=>{
    const own=state.session?.user?.id;let count=state.presenceLive?1:0;
    for(const [id,row] of [...state.rows]){
      if(!fresh(row)){state.rows.delete(id);const p=state.peers.get(id);if(p){p.removeFromParent();state.peers.delete(id)};continue}
      if(id===own)continue;count++;
      let peer=state.peers.get(id);if(!peer){peer=presenceAvatar(runtime,row);state.peers.set(id,peer)}
      peer.userData.target.set(Number(row.x)||0,Number(row.y)||0,Number(row.z)||0);peer.userData.targetYaw=Number(row.yaw)||0;peer.userData.zone=row.zone||'world';
    }
    U.people.textContent='PEOPLE · '+count;renderRoster();
  };
  const consumePresence=(row)=>{
    if(!row?.user_id||!timestampPlausible(row))return;
    state.rows.set(row.user_id,{...decoratePresence(row),_local_seen_at:Date.now()});syncPeers();
  };
  const removePresence=(row)=>{
    if(!row?.user_id)return;state.rows.delete(row.user_id);const p=state.peers.get(row.user_id);if(p){p.removeFromParent();state.peers.delete(row.user_id)};syncPeers();
  };
  const loadInitial=async()=>{
    const [{data:roles,error:re},{data:presence,error:pe},{data:messages,error:me}]=await Promise.all([
      client.from('komo_community_roles').select('user_id,role_key,display_title,icon,sort_order,is_active').eq('is_active',true),
      client.from('world_presence').select('user_id,display_name,avatar_config,zone,x,y,z,yaw,voice_enabled,updated_at').order('updated_at',{ascending:false}).limit(50),
      client.from('world_chat_messages').select('id,user_id,recipient_id,display_name,body,created_at').order('created_at',{ascending:false}).limit(CHAT_LIMIT)
    ]);
    if(re)throw re;if(pe)throw pe;if(me)throw me;
    for(const role of roles||[])if(role?.user_id)state.roles.set(role.user_id,role);
    (presence||[]).forEach(consumePresence);state.messages=(messages||[]).reverse();renderMessages();setOnlineUI();syncPeers();
  };
  const refreshPresence=async()=>{
    if(!state.session?.user)return false;
    try{
      const {data,error}=await client.from('world_presence')
        .select('user_id,display_name,avatar_config,zone,x,y,z,yaw,voice_enabled,updated_at')
        .order('updated_at',{ascending:false}).limit(50);
      if(error)throw error;
      const seen=new Set();
      for(const row of data||[]){
        if(!row?.user_id)continue;
        seen.add(row.user_id);
        if(timestampPlausible(row)||row.user_id===state.session.user.id)consumePresence(row);
      }
      for(const [id,row] of [...state.rows]){
        if(id===state.session.user.id)continue;
        if(!seen.has(id)&&!fresh(row))removePresence(row);
      }
      syncPeers();return true;
    }catch(err){console.warn('[World presence refresh]',err);return false}
  };
  const syncRealtimePresence=()=>{
    if(!state.channel?.presenceState)return;
    const presenceState=state.channel.presenceState()||{};
    for(const entries of Object.values(presenceState)){
      for(const row of Array.isArray(entries)?entries:[]){
        if(!row?.user_id||row.user_id===state.session?.user?.id)continue;
        consumePresence(row);
      }
    }
    syncPeers();
  };
  const presencePayload=()=>{
    const st=runtime.getState();return{
      user_id:state.session.user.id,
      display_name:escText(state.profile?.display_name||'KŌMØ Member',60)||'KŌMØ Member',
      avatar_config:state.profile?.avatar_config&&typeof state.profile.avatar_config==='object'?state.profile.avatar_config:{},
      zone:['world','twin','rehab','arena'].includes(st.mode)?st.mode:'world',
      x:+st.position.x.toFixed(3),y:+(st.position.y||0).toFixed(3),z:+st.position.z.toFixed(3),yaw:+st.yaw.toFixed(4),voice_enabled:!!state.voice.enabled,updated_at:new Date().toISOString()
    }};
  const posePayload=()=>{
    const p=presencePayload();
    return {user_id:p.user_id,display_name:p.display_name,avatar_config:p.avatar_config,zone:p.zone,x:p.x,y:p.y,z:p.z,yaw:p.yaw,voice_enabled:p.voice_enabled,updated_at:p.updated_at};
  };
  const poseChanged=(a,b)=>{
    if(!a||!b)return true;
    return a.zone!==b.zone||Math.abs(a.x-b.x)>.015||Math.abs(a.y-b.y)>.015||Math.abs(a.z-b.z)>.015||Math.abs(a.yaw-b.yaw)>.008;
  };
  const sendPose=async(force=false)=>{
    if(!state.presenceLive||!state.subscribed||!state.channel||!state.session?.user)return false;
    const payload=posePayload(),now=Date.now();
    if(!force&&!poseChanged(payload,state.lastPose)&&now-state.lastPoseSentAt<900)return false;
    state.lastPose=payload;state.lastPoseSentAt=now;
    try{
      const status=await state.channel.send({type:'broadcast',event:'pose',payload});
      if(now-state.lastTrackSentAt>900&&state.channel.track){
        state.lastTrackSentAt=now;
        try{await state.channel.track(payload)}catch(err){console.warn('[World presence track]',err)}
      }
      return status==='ok'||status==='timed out'?status==='ok':true;
    }catch(err){console.warn('[World pose broadcast]',err);return false}
  };

  const sendVoiceSignal=async(recipientId,signalType,payload={})=>{
    if(!state.session?.user||!recipientId)return false;
    const {error}=await client.from('world_voice_signals').insert({sender_id:state.session.user.id,recipient_id:recipientId,signal_type:signalType,payload});
    if(error){console.warn('[World voice signal]',error);return false}return true;
  };
  const closeVoicePeer=(id,{signal=false}={})=>{
    const peer=state.voice.peers.get(id);if(!peer)return;
    if(signal&&state.session?.user)sendVoiceSignal(id,'hangup',{}).catch(()=>{});
    try{peer.pc.onicecandidate=null;peer.pc.ontrack=null;peer.pc.close()}catch{}
    try{peer.audio?.pause();peer.audio?.remove()}catch{}
    state.voice.peers.delete(id);state.voice.connected.delete(id);updateVoiceUI();
  };
  const voiceDistance=row=>{
    const local=runtime.getState();if(!row||(row.zone||'world')!==local.mode)return Infinity;
    return Math.hypot((Number(row.x)||0)-local.position.x,(Number(row.z)||0)-local.position.z);
  };
  const ensureVoicePeer=async(row,{offer=true}={})=>{
    if(!state.voice.enabled||!state.voice.stream||!row?.user_id||row.user_id===state.session?.user?.id||!row.voice_enabled)return null;
    const id=row.user_id;let peer=state.voice.peers.get(id);if(peer)return peer;
    const pc=new RTCPeerConnection({iceServers:[{urls:'stun:stun.l.google.com:19302'}]});
    const audio=document.createElement('audio');audio.autoplay=true;audio.playsInline=true;audio.volume=0;audio.dataset.komoVoice=id;document.body.appendChild(audio);
    peer={pc,audio,pending:[],offering:false};state.voice.peers.set(id,peer);
    for(const track of state.voice.stream.getAudioTracks())pc.addTrack(track,state.voice.stream);
    pc.onicecandidate=e=>{if(e.candidate)sendVoiceSignal(id,'candidate',{candidate:e.candidate.toJSON?e.candidate.toJSON():e.candidate}).catch(()=>{})};
    pc.ontrack=e=>{audio.srcObject=e.streams?.[0]||new MediaStream([e.track]);audio.play().catch(()=>{})};
    pc.onconnectionstatechange=()=>{
      if(pc.connectionState==='connected'){
        state.voice.connected.add(id);updateVoiceUI();awardSocial('voice',15);
      }else if(['failed','closed'].includes(pc.connectionState)){closeVoicePeer(id)}
    };
    if(offer&&String(state.session.user.id)<String(id)){
      peer.offering=true;
      try{
        const desc=await pc.createOffer({offerToReceiveAudio:true});await pc.setLocalDescription(desc);
        await sendVoiceSignal(id,'offer',{sdp:pc.localDescription});
      }catch(err){console.warn('[World voice offer]',err);closeVoicePeer(id)}
      finally{peer.offering=false}
    }
    return peer;
  };
  const handleVoiceSignal=async(row)=>{
    if(!row?.id||row.recipient_id!==state.session?.user?.id)return;
    try{
      const sender=state.rows.get(row.sender_id);
      if(row.signal_type==='hangup'){closeVoicePeer(row.sender_id);return}
      if(!state.voice.enabled||!state.voice.stream||!sender?.voice_enabled)return;
      const peer=await ensureVoicePeer(sender,{offer:false});if(!peer)return;
      const pc=peer.pc,p=row.payload||{};
      if(row.signal_type==='offer'&&p.sdp){
        await pc.setRemoteDescription(new RTCSessionDescription(p.sdp));
        for(const cand of peer.pending.splice(0))await pc.addIceCandidate(cand);
        const answer=await pc.createAnswer();await pc.setLocalDescription(answer);
        await sendVoiceSignal(row.sender_id,'answer',{sdp:pc.localDescription});
      }else if(row.signal_type==='answer'&&p.sdp){
        if(!pc.currentRemoteDescription){await pc.setRemoteDescription(new RTCSessionDescription(p.sdp));for(const cand of peer.pending.splice(0))await pc.addIceCandidate(cand)}
      }else if(row.signal_type==='candidate'&&p.candidate){
        const cand=new RTCIceCandidate(p.candidate);
        if(pc.remoteDescription)await pc.addIceCandidate(cand);else peer.pending.push(cand);
      }
    }catch(err){console.warn('[World voice receive]',err)}
    finally{client.from('world_voice_signals').delete().eq('id',row.id).then(()=>{})}
  };
  const updateVoiceProximity=(now=performance.now())=>{
    if(!state.voice.enabled||now-state.voice.lastSweep<320)return;state.voice.lastSweep=now;
    const own=state.session?.user?.id;
    for(const [id,row] of state.rows){
      if(id===own)continue;
      const d=voiceDistance(row),peer=state.voice.peers.get(id);
      if(row.voice_enabled&&d<=VOICE_ENTER_M&&!peer)ensureVoicePeer(row).catch(()=>{});
      if(peer){
        peer.audio.volume=Math.max(0,Math.min(1,1-(Math.max(2,d)-2)/(VOICE_EXIT_M-2)));
        if(!row.voice_enabled||d>VOICE_EXIT_M)closeVoicePeer(id,{signal:true});
      }
    }
  };
  const disableVoice=async()=>{
    state.voice.enabled=false;for(const id of [...state.voice.peers.keys()])closeVoicePeer(id,{signal:true});
    if(state.voice.stream){for(const t of state.voice.stream.getTracks())t.stop();state.voice.stream=null}
    updateVoiceUI();await heartbeat();await sendPose(true);
  };
  const toggleVoice=async()=>{
    if(state.voice.enabled){await disableVoice();runtime.notify?.('VOICE PROXIMITY · OFF');return}
    if(!navigator.mediaDevices?.getUserMedia){runtime.notify?.('Microphone non disponible');return}
    try{
      state.voice.stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true},video:false});
      state.voice.enabled=true;updateVoiceUI();await heartbeat();await sendPose(true);runtime.notify?.('VOICE PROXIMITY · ON · 11 m');
      updateVoiceProximity();
    }catch(err){state.voice.enabled=false;state.voice.stream=null;updateVoiceUI();runtime.notify?.('Autorisez le microphone pour le vocal');console.warn('[World voice permission]',err)}
  };

  const heartbeat=async()=>{
    if(!state.session?.user)return false;
    try{
      const payload=presencePayload();state.lastZone=payload.zone;
      const {error}=await client.from('world_presence').upsert(payload,{onConflict:'user_id'});
      if(error)throw error;
      const firstLive=!state.presenceLive;
      state.presenceLive=true;state.connected=true;state.lastPresenceError='';
      state.rows.set(payload.user_id,{...decoratePresence(payload),_local_seen_at:Date.now()});setOnlineUI();syncPeers();
      if(firstLive)runtime.notify?.('World multiplayer online');
      return true;
    }catch(err){
      state.presenceLive=false;state.connected=false;setOnlineUI();syncPeers();
      const msg=escText(err?.message||String(err),160);state.lastPresenceError=msg;
      const now=Date.now();if(now-state.lastPresenceErrorAt>8000){state.lastPresenceErrorAt=now;runtime.notify?.('World presence unavailable');}
      console.warn('[World presence]',err);return false;
    }
  };
  const subscribe=()=>{
    state.channel=client.channel('komo-world-db-v1',{
      config:{
        presence:{key:state.session.user.id},
        broadcast:{self:false}
      }
    })
      .on('presence',{event:'sync'},()=>syncRealtimePresence())
      .on('presence',{event:'join'},({newPresences})=>{for(const row of newPresences||[])if(row?.user_id&&row.user_id!==state.session?.user?.id)consumePresence(row)})
      .on('presence',{event:'leave'},({leftPresences})=>{for(const row of leftPresences||[])if(row?.user_id&&row.user_id!==state.session?.user?.id)removePresence(row)})
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'world_presence'},({new:row})=>consumePresence(row))
      .on('postgres_changes',{event:'UPDATE',schema:'public',table:'world_presence'},({new:row})=>consumePresence(row))
      .on('postgres_changes',{event:'DELETE',schema:'public',table:'world_presence'},({old:row})=>removePresence(row))
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'world_chat_messages'},({new:row})=>{
        if(!row?.id||state.messages.some(x=>x.id===row.id))return;
        state.messages.push(row);if(state.messages.length>CHAT_LIMIT)state.messages.shift();renderMessages();
        if(row.recipient_id===state.session?.user?.id)runtime.notify?.('MP · '+(escText(row.display_name,24)||'Member'));
      })
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'world_voice_signals'},({new:row})=>handleVoiceSignal(row))
      .on('broadcast',{event:'pose'},({payload})=>{
        if(!payload?.user_id||payload.user_id===state.session?.user?.id)return;
        consumePresence(payload);
      })
      .subscribe(async status=>{
        if(status==='SUBSCRIBED'){
          state.subscribed=true;setOnlineUI();
          const live=await heartbeat();
          if(live){
            try{await state.channel.track(posePayload());state.lastTrackSentAt=Date.now()}catch(err){console.warn('[World presence initial track]',err)}
            await refreshPresence();await sendPose(true);
          }
        }else if(status==='CHANNEL_ERROR'||status==='TIMED_OUT'){
          state.subscribed=false;state.presenceLive=false;state.connected=false;setOnlineUI();syncPeers()
        }
      });
  };
  const loadProfile=async(profileHint={})=>{
    let profile={};
    try{const r=await client.from('profiles').select('display_name,avatar_config,interests').eq('id',state.session.user.id).maybeSingle();profile=r.data||{}}catch{}
    state.profile={
      display_name:escText(profile?.display_name||profileHint?.display_name||state.session.user.user_metadata?.display_name||'KŌMØ Member',60)||'KŌMØ Member',
      avatar_config:profile?.avatar_config&&typeof profile.avatar_config==='object'?profile.avatar_config:(profileHint?.avatar_config||{}),
      interests:Array.isArray(profile?.interests)?profile.interests.slice(0,8):(profileHint?.interests||[]).slice(0,8)
    };
  };
  const startLiveSession=async(session,profileHint={})=>{
    if(!session?.user)return false;
    state.session=session;await loadProfile(profileHint);setOnlineUI();
    if(!state.started){
      state.started=true;await loadInitial();subscribe();
      state.timer=setInterval(()=>{heartbeat();syncPeers()},HEARTBEAT_MS);
      state.poseTimer=setInterval(()=>sendPose(false),POSE_MS);
      state.presenceRefreshTimer=setInterval(()=>refreshPresence(),PRESENCE_REFRESH_MS);
    }
    const live=await heartbeat();syncPeers();return !!live;
  };
  const connectWithBridge=async(payload)=>{
    if(!payload?.session?.access_token||!payload?.session?.refresh_token)return false;
    try{
      const {data,error}=await client.auth.setSession({access_token:payload.session.access_token,refresh_token:payload.session.refresh_token});if(error)throw error;
      if(!data.session?.user)throw new Error('Session Pulse invalide');
      return await startLiveSession(data.session,payload.profile||{});
    }catch(err){console.error('[World Pulse bridge]',err);state.presenceLive=false;state.connected=false;setOnlineUI();runtime.notify?.('Connexion World impossible');return false}
  };
  const openPulse=()=>{
    const url=PULSE_ORIGIN+'/?world_bridge=1&world_origin='+encodeURIComponent(location.origin);
    state.popup=window.open(url,'komoPulseWorldBridge','popup=yes,width=520,height=760,resizable=yes,scrollbars=yes');
    if(!state.popup)runtime.notify?.('Autorisez la fenêtre Pulse pour connecter World');
  };
  const onMessage=(event)=>{
    if(event.origin!==PULSE_ORIGIN)return;
    const d=event.data;if(!d||d.type!=='komo:pulse-world-session')return;
    if(d.status==='authenticated'){
      connectWithBridge(d).then(ok=>{
        try{event.source?.postMessage({type:'komo:world-bridge-ack',status:ok?'connected':'error',request_id:d.request_id||''},PULSE_ORIGIN)}catch{}
      });
    }else if(d.status==='signed_out'){
      runtime.notify?.('Connectez-vous à Pulse pour activer le multiplayer');
      try{event.source?.postMessage({type:'komo:world-bridge-ack',status:'error',request_id:d.request_id||''},PULSE_ORIGIN)}catch{}
    }
  };
  window.addEventListener('message',onMessage);

  U.connect.addEventListener('click',()=>state.presenceLive?runtime.notify?.('World multiplayer actif'):state.session?.user?heartbeat():openPulse());
  U.people.addEventListener('click',async()=>{await refreshPresence();U.drawer.classList.toggle('people-open');renderRoster()});
  U.chat.addEventListener('click',()=>U.input.focus());
  U.voice.addEventListener('click',()=>toggleVoice());
  U.worldBtn.addEventListener('click',()=>setDmTarget(null));
  U.target.addEventListener('click',()=>{if(state.dmTarget)setDmTarget(null);else U.input.focus()});
  document.addEventListener('keydown',e=>{
    if(e.code!=='Enter'||e.metaKey||e.ctrlKey||e.altKey)return;
    const a=document.activeElement,tag=a?.tagName;
    if(tag==='INPUT'||tag==='TEXTAREA'||a?.isContentEditable)return;
    e.preventDefault();U.input.focus();
  });
  U.form.addEventListener('submit',async e=>{
    e.preventDefault();if(!state.presenceLive||!state.session?.user)return;
    const body=escText(U.input.value,500);if(!body)return;U.input.value='';
    const recipient_id=state.dmTarget?.user_id||null;
    const row={user_id:state.session.user.id,recipient_id,display_name:escText(state.profile?.display_name||'KŌMØ Member',60)||'KŌMØ Member',body};
    const {error}=await client.from('world_chat_messages').insert(row);
    if(error){runtime.notify?.('Message non envoyé');console.warn('[World chat]',error);return}
    awardSocial(recipient_id?'dm':'chat',recipient_id?10:5);
  });

  function animatePeers(){
    const local=runtime.getState(),cam=runtime.camera;updateVoiceProximity();
    for(const peer of state.peers.values()){
      const localZone=local.mode==='rehab'?'rehab':local.mode;
      peer.visible=peer.userData.zone===localZone;
      if(!peer.visible)continue;
      const av=peer.userData.avatar;
      const beforeX=peer.position.x,beforeZ=peer.position.z;
      peer.position.lerp(peer.userData.target,.28);
      let d=((peer.userData.targetYaw-peer.rotation.y+Math.PI)%(Math.PI*2))-Math.PI;
      peer.rotation.y+=d*.26;

      if(av){
        const speed=Math.hypot(peer.position.x-beforeX,peer.position.z-beforeZ);
        av.walkPhase+=Math.min(.22,speed*7.0);
        const stride=Math.sin(av.walkPhase);
        const distance=cam?cam.position.distanceTo(peer.position):0;
        const near=distance<28;
        av.tag.visible=distance<90;
        if(av.tag.visible){
          const k=Math.max(1,Math.min(1.85,1+distance*.014));
          av.tag.scale.set(2.25*k,.64*k,1);
        }
        if(av.beacon){
          av.beacon.visible=distance>7&&distance<90;
          av.beacon.material.opacity=THREE.MathUtils.clamp(.34-distance*.0025,.12,.32);
        }
        if(av.beaconTop){
          av.beaconTop.visible=distance>5&&distance<90;
          const pulse=1+.12*Math.sin(performance.now()*.004);
          av.beaconTop.scale.setScalar(pulse);
        }
        if(av.ring)av.ring.material.opacity=distance<30?.56:.34;
        if(near&&speed>.002){
          av.leftLeg.rotation.x=stride*.38;av.rightLeg.rotation.x=-stride*.38;
          av.leftKnee.rotation.x=Math.max(0,-stride)*.28;av.rightKnee.rotation.x=Math.max(0,stride)*.28;
          av.leftArm.rotation.x=-stride*.28;av.rightArm.rotation.x=stride*.28;
          av.leftElbow.rotation.x=Math.max(0,stride)*.14;av.rightElbow.rotation.x=Math.max(0,-stride)*.14;
          av.torso.rotation.z=Math.cos(av.walkPhase*.5)*.017;
          av.hips.rotation.y=Math.sin(av.walkPhase*.5)*.025;
          av.head.rotation.y=Math.sin(av.walkPhase*.24)*.06;
        }else{
          av.leftLeg.rotation.x*=.78;av.rightLeg.rotation.x*=.78;
          av.leftArm.rotation.x*=.78;av.rightArm.rotation.x*=.78;
          av.leftKnee.rotation.x*=.72;av.rightKnee.rotation.x*=.72;
        }
      }
    }
    state.raf=requestAnimationFrame(animatePeers);
  }
  animatePeers();setOnlineUI();updateVoiceUI();updateSocialUI();renderMessages();renderRoster();
  client.auth.getSession().then(({data,error})=>{
    if(error){console.warn('[World auth restore]',error);return}
    if(data?.session?.user)startLiveSession(data.session).catch(err=>console.warn('[World session restore]',err));
  });

  const cleanup=()=>{
    clearInterval(state.timer);clearInterval(state.poseTimer);clearInterval(state.presenceRefreshTimer);cancelAnimationFrame(state.raf);window.removeEventListener('message',onMessage);for(const id of [...state.voice.peers.keys()])closeVoicePeer(id);if(state.voice.stream)for(const t of state.voice.stream.getTracks())t.stop();
    if(state.channel)client.removeChannel(state.channel);
    if(state.session?.user)client.from('world_presence').delete().eq('user_id',state.session.user.id).then(()=>{});
  };
  window.addEventListener('pagehide',event=>{if(!event.persisted)cleanup()});
  window.addEventListener('pageshow',event=>{if(event.persisted&&state.session?.user){
    if(!state.timer)state.timer=setInterval(()=>{heartbeat();syncPeers()},HEARTBEAT_MS);
    if(!state.poseTimer)state.poseTimer=setInterval(()=>sendPose(false),POSE_MS);
    if(!state.presenceRefreshTimer)state.presenceRefreshTimer=setInterval(()=>refreshPresence(),PRESENCE_REFRESH_MS);
    heartbeat();refreshPresence();sendPose(true);syncPeers()
  }});

  window.KomoWorldMultiplayer={version:'0.6.0-social-voice',connect:openPulse,state};
}
