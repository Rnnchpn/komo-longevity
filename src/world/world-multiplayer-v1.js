import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const URL='https://uqlolefsiktbznnymriy.supabase.co';
const KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const PULSE_ORIGIN='https://pulse.komolongevity.com';
const STALE_MS=45000;
const HEARTBEAT_MS=2200;
const CHAT_LIMIT=50;

function escText(v,max=500){return String(v??'').replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,max)}
function css(){
  if(document.querySelector('#komo-world-mp-style'))return;
  const s=document.createElement('style');s.id='komo-world-mp-style';s.textContent=`
  .kwmp-dock{position:fixed;z-index:82;top:92px;right:18px;display:flex;gap:7px;align-items:center}
  .kwmp-pill{height:31px;padding:0 12px;border:1px solid rgba(255,255,255,.09);border-radius:999px;background:rgba(24,39,31,.76);backdrop-filter:blur(15px);color:rgba(242,236,226,.76);font-size:7px;font-weight:800;letter-spacing:.11em;cursor:pointer}
  .kwmp-pill[data-state="online"]{border-color:rgba(190,218,193,.18);color:#dce9dd}.kwmp-pill[data-state="online"]::before{content:"";display:inline-block;width:5px;height:5px;border-radius:50%;background:#a8c9ab;margin-right:7px;box-shadow:0 0 10px rgba(168,201,171,.38)}
  .kwmp-chat{position:fixed;z-index:96;right:18px;top:132px;width:min(360px,calc(100vw - 36px));height:min(520px,calc(100vh - 154px));display:grid;grid-template-rows:auto auto 1fr auto auto;border:1px solid rgba(255,255,255,.09);border-radius:22px;background:linear-gradient(150deg,rgba(20,35,28,.96),rgba(27,42,34,.93));backdrop-filter:blur(24px);box-shadow:0 26px 70px rgba(10,18,13,.24);overflow:hidden;opacity:0;visibility:hidden;transform:translateY(-7px);transition:.22s ease}
  .kwmp-chat.open{opacity:1;visibility:visible;transform:none}
  .kwmp-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:16px 16px 12px;border-bottom:1px solid rgba(255,255,255,.07)}
  .kwmp-head span{display:block;color:#d6b67f;font-size:7px;font-weight:800;letter-spacing:.16em}.kwmp-head strong{display:block;margin-top:4px;font:500 23px/1 Georgia,serif}.kwmp-close{width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.055);color:#eee5d8;font-size:18px;cursor:pointer}
  .kwmp-roster{padding:10px 14px;border-bottom:1px solid rgba(255,255,255,.06);display:grid;gap:6px}.kwmp-person{display:grid;grid-template-columns:1fr auto auto;gap:8px;align-items:center;padding:7px 9px;border:1px solid rgba(255,255,255,.055);border-radius:10px;background:rgba(255,255,255,.025)}.kwmp-person b{font-size:7px;letter-spacing:.04em}.kwmp-person span{font-size:6px;color:#d8ba86;letter-spacing:.09em;white-space:nowrap}.kwmp-person small{display:block;margin-top:3px;font-size:5px;color:rgba(240,234,224,.42);letter-spacing:.05em}.kwmp-person button{height:24px;padding:0 8px;border:1px solid rgba(216,186,134,.22);border-radius:8px;background:rgba(216,186,134,.09);color:#ead9ba;font-size:5px;font-weight:850;letter-spacing:.08em;cursor:pointer}.kwmp-person button:hover{background:rgba(216,186,134,.16)}.kwmp-person.mine{border-color:rgba(216,186,134,.14)}
  .kwmp-messages{overflow:auto;padding:14px;display:flex;flex-direction:column;gap:10px}.kwmp-msg{max-width:86%;padding:9px 11px;border:1px solid rgba(255,255,255,.07);border-radius:14px;background:rgba(255,255,255,.035)}.kwmp-msg.mine{align-self:flex-end;background:rgba(210,179,126,.09);border-color:rgba(210,179,126,.13)}.kwmp-msg b{display:block;margin-bottom:4px;font-size:8px}.kwmp-msg p{margin:0;font-size:9px;line-height:1.45;color:rgba(242,236,226,.72);white-space:pre-wrap;word-break:break-word}.kwmp-msg small{display:block;margin-top:5px;font-size:7px;color:rgba(242,236,226,.34)}
  .kwmp-empty{margin:auto;color:rgba(242,236,226,.40);font-size:9px;text-align:center;line-height:1.5;padding:18px}
  .kwmp-compose{display:flex;gap:7px;padding:10px 12px;border-top:1px solid rgba(255,255,255,.07)}.kwmp-compose input{flex:1;min-width:0;height:38px;border:1px solid rgba(255,255,255,.08);border-radius:12px;background:rgba(255,255,255,.045);color:#f0e8da;padding:0 11px;font-size:9px;outline:none}.kwmp-compose button{height:38px;padding:0 12px;border-radius:12px;background:#d8ba86;color:#1d2d25;font-size:8px;font-weight:850;cursor:pointer}.kwmp-compose button:disabled,.kwmp-compose input:disabled{opacity:.42}
  .kwmp-note{padding:0 13px 12px;color:rgba(242,236,226,.34);font-size:7px;line-height:1.45}
  @media(max-width:900px),(pointer:coarse){
    .kwmp-dock{top:63px;right:8px;gap:4px;align-items:center}
    .kwmp-pill{height:25px;padding:0 8px;font-size:5px;letter-spacing:.08em;background:rgba(22,37,29,.90);backdrop-filter:none}
    .kwmp-chat{right:8px;top:96px;width:min(360px,calc(100vw - 16px));height:min(500px,calc(100vh - 106px))}
  }
  @media(max-width:520px){
    .kwmp-dock{top:109px;right:8px}
    .kwmp-pill{height:24px;padding:0 7px}
    .kwmp-pill[data-kwmp-connect]{max-width:82px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .kwmp-chat{top:140px;height:min(500px,calc(100vh - 150px))}
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
    drawer:document.querySelector('#kwmpChat'),
    roster:document.querySelector('#kwmpRoster'),
    messages:document.querySelector('#kwmpMessages'),
    form:document.querySelector('#kwmpCompose'),
    input:document.querySelector('#kwmpInput')
  };
  dock=document.createElement('div');dock.id='kwmpDock';dock.className='kwmp-dock';
  dock.innerHTML='<button type="button" class="kwmp-pill" data-kwmp-connect data-state="offline">CONNECT PULSE</button><button type="button" class="kwmp-pill" data-kwmp-people>PEOPLE · 0</button><button type="button" class="kwmp-pill" data-kwmp-chat>CHAT</button>';
  document.body.appendChild(dock);
  const drawer=document.createElement('aside');drawer.id='kwmpChat';drawer.className='kwmp-chat';drawer.setAttribute('aria-hidden','true');
  drawer.innerHTML='<div class="kwmp-head"><div><span>KŌMØ WORLD · SOCIAL</span><strong>World Chat</strong></div><button type="button" class="kwmp-close" data-kwmp-close>×</button></div><div class="kwmp-roster" id="kwmpRoster"><div class="kwmp-empty">Aucune présence World active.</div></div><div class="kwmp-messages" id="kwmpMessages"><div class="kwmp-empty">Connectez votre session Pulse pour voir les personnes présentes et discuter.</div></div><form class="kwmp-compose" id="kwmpCompose"><input id="kwmpInput" maxlength="500" autocomplete="off" placeholder="Écrire dans World…" disabled><button type="submit" disabled>ENVOYER</button></form><div class="kwmp-note">Identité sociale uniquement. Les données Motion, Clinical et de santé ne sont jamais partagées dans World.</div>';
  document.body.appendChild(drawer);
  return {dock,connect:dock.querySelector('[data-kwmp-connect]'),people:dock.querySelector('[data-kwmp-people]'),chat:dock.querySelector('[data-kwmp-chat]'),drawer,roster:drawer.querySelector('#kwmpRoster'),messages:drawer.querySelector('#kwmpMessages'),form:drawer.querySelector('#kwmpCompose'),input:drawer.querySelector('#kwmpInput')};
}
function labelSprite(THREE,text){
  const c=document.createElement('canvas');c.width=512;c.height=144;const x=c.getContext('2d');
  x.clearRect(0,0,512,144);
  x.fillStyle='rgba(19,31,24,.84)';x.fillRect(24,18,464,104);
  x.strokeStyle='rgba(216,185,132,.58)';x.lineWidth=2;x.strokeRect(25,19,462,102);
  x.fillStyle='#f3ede3';x.font='600 35px Arial';x.textAlign='center';x.textBaseline='middle';
  x.fillText(escText(text,24)||'KŌMØ Member',256,59);
  x.fillStyle='rgba(216,185,132,.92)';x.font='700 16px Arial';x.fillText('PULSE MEMBER',256,92);
  const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;tx.anisotropy=2;
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,transparent:true,depthWrite:false,depthTest:true}));
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

  const ring=new THREE.Mesh(new THREE.RingGeometry(.42,.46,40),accent);ring.rotation.x=-Math.PI/2;ring.position.y=.015;g.add(ring);
  const tag=labelSprite(THREE,record.display_name);g.add(tag);

  g.userData.target=new THREE.Vector3(Number(record.x)||0,Number(record.y)||0,Number(record.z)||0);
  g.userData.targetYaw=record.yaw||0;g.userData.zone=record.zone||'world';g.position.copy(g.userData.target);
  g.userData.avatar={hips,torso,head,leftLeg,rightLeg,leftKnee,rightKnee,leftArm,rightArm,leftElbow,rightElbow,tag,lastPosition:g.position.clone(),walkPhase:0};
  runtime.scene.add(g);return g;
}
export async function mount(runtime){
  if(!runtime?.scene||!runtime?.THREE||!runtime?.getState)return;
  const U=ui();
  const client=createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storageKey:'komo-world-auth-v1'}});
  const state={session:null,profile:null,channel:null,peers:new Map(),rows:new Map(),connected:false,presenceLive:false,subscribed:false,lastZone:'',timer:null,raf:0,popup:null,messages:[],started:false,lastPresenceError:'',lastPresenceErrorAt:0};

  const setOnlineUI=()=>{
    if(state.presenceLive){
      U.connect.textContent=(escText(state.profile?.display_name||'WORLD',14)||'WORLD').toUpperCase()+' · ONLINE';
      U.connect.dataset.state='online';
    }else if(state.session?.user){
      U.connect.textContent='WORLD · SYNCING';
      U.connect.dataset.state='syncing';
    }else{
      U.connect.textContent='CONNECT WORLD';
      U.connect.dataset.state='offline';
    }
    U.input.disabled=!state.presenceLive;U.form.querySelector('button').disabled=!state.presenceLive;
  };
  const renderMessages=()=>{
    U.messages.innerHTML='';
    if(!state.messages.length){const e=document.createElement('div');e.className='kwmp-empty';e.textContent=state.connected?'Aucun message pour le moment.':'Connectez votre session Pulse pour discuter.';U.messages.appendChild(e);return}
    for(const m of state.messages.slice(-CHAT_LIMIT)){
      const d=document.createElement('div');d.className='kwmp-msg'+(m.user_id===state.session?.user?.id?' mine':'');
      const n=document.createElement('b');n.textContent=escText(m.display_name,60)||'KŌMØ Member';
      const p=document.createElement('p');p.textContent=escText(m.body,500);
      const small=document.createElement('small');const date=new Date(m.created_at||Date.now());small.textContent=date.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
      d.append(n,p,small);U.messages.appendChild(d);
    }
    U.messages.scrollTop=U.messages.scrollHeight;
  };
  const zoneLabel=z=>({world:'WORLD',twin:'TWIN',rehab:'KŌMØ FIT',arena:'ARENA'}[z]||'WORLD');
  const renderRoster=()=>{
    if(!U.roster)return;
    U.roster.innerHTML='';
    const now=Date.now(),own=state.session?.user?.id,local=runtime.getState();
    const active=[...state.rows.values()].filter(row=>now-new Date(row.updated_at||0).getTime()<STALE_MS);
    if(state.presenceLive&&own&&!active.some(r=>r.user_id===own)){
      const st=runtime.getState();
      active.unshift({user_id:own,display_name:state.profile?.display_name||'You',zone:st.mode||'world',x:st.position.x,y:st.position.y,z:st.position.z,updated_at:new Date().toISOString()});
    }
    active.sort((a,b)=>(a.user_id===own?-1:b.user_id===own?1:String(a.display_name||'').localeCompare(String(b.display_name||''))));
    if(!active.length){const e=document.createElement('div');e.className='kwmp-empty';e.textContent=state.session?.user?'Synchronisation de la présence…':'Connectez World pour voir les personnes présentes.';U.roster.appendChild(e);return}
    for(const row of active){
      const mine=row.user_id===own;
      const item=document.createElement('div');item.className='kwmp-person'+(mine?' mine':'');
      const copy=document.createElement('div');
      const n=document.createElement('b');n.textContent=(mine?'YOU · ':'')+(escText(row.display_name,40)||'KŌMØ Member');
      const meta=document.createElement('small');
      const sameZone=(row.zone||'world')===local.mode;
      const distance=sameZone?Math.hypot((Number(row.x)||0)-local.position.x,(Number(row.z)||0)-local.position.z):null;
      meta.textContent=mine?'CURRENT POSITION':sameZone?(Math.round(distance)+' m away'):'Different space';
      copy.append(n,meta);
      const z=document.createElement('span');z.textContent=zoneLabel(row.zone);
      item.append(copy,z);
      if(!mine){
        const join=document.createElement('button');join.type='button';join.textContent='JOIN';
        join.addEventListener('click',()=>{
          const ok=runtime.joinPresence?.(row);
          if(ok){
            U.drawer.classList.remove('open');U.drawer.setAttribute('aria-hidden','true');
            runtime.notify?.('Joining '+(escText(row.display_name,28)||'member'));
            setTimeout(()=>heartbeat(),320);
          }
        });
        item.append(join);
      }
      U.roster.appendChild(item);
    }
  };
  const fresh=(row)=>Date.now()-new Date(row.updated_at||0).getTime()<STALE_MS;
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
    if(!row?.user_id)return;state.rows.set(row.user_id,row);syncPeers();
  };
  const removePresence=(row)=>{
    if(!row?.user_id)return;state.rows.delete(row.user_id);const p=state.peers.get(row.user_id);if(p){p.removeFromParent();state.peers.delete(row.user_id)};syncPeers();
  };
  const loadInitial=async()=>{
    const cutoff=new Date(Date.now()-STALE_MS).toISOString();
    const [{data:presence,error:pe},{data:messages,error:me}]=await Promise.all([
      client.from('world_presence').select('user_id,display_name,avatar_config,zone,x,y,z,yaw,updated_at').gte('updated_at',cutoff),
      client.from('world_chat_messages').select('id,user_id,display_name,body,created_at').order('created_at',{ascending:false}).limit(CHAT_LIMIT)
    ]);
    if(pe)throw pe;if(me)throw me;
    (presence||[]).forEach(consumePresence);state.messages=(messages||[]).reverse();renderMessages();
  };
  const presencePayload=()=>{
    const st=runtime.getState();return{
      user_id:state.session.user.id,
      display_name:escText(state.profile?.display_name||'KŌMØ Member',60)||'KŌMØ Member',
      avatar_config:state.profile?.avatar_config&&typeof state.profile.avatar_config==='object'?state.profile.avatar_config:{},
      zone:['world','twin','rehab','arena'].includes(st.mode)?st.mode:'world',
      x:+st.position.x.toFixed(3),y:+(st.position.y||0).toFixed(3),z:+st.position.z.toFixed(3),yaw:+st.yaw.toFixed(4),updated_at:new Date().toISOString()
    }};
  const heartbeat=async()=>{
    if(!state.session?.user)return false;
    try{
      const payload=presencePayload();state.lastZone=payload.zone;
      const {error}=await client.from('world_presence').upsert(payload,{onConflict:'user_id'});
      if(error)throw error;
      const firstLive=!state.presenceLive;
      state.presenceLive=true;state.connected=true;state.lastPresenceError='';
      state.rows.set(payload.user_id,payload);setOnlineUI();syncPeers();
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
    state.channel=client.channel('komo-world-db-v1')
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'world_presence'},({new:row})=>consumePresence(row))
      .on('postgres_changes',{event:'UPDATE',schema:'public',table:'world_presence'},({new:row})=>consumePresence(row))
      .on('postgres_changes',{event:'DELETE',schema:'public',table:'world_presence'},({old:row})=>removePresence(row))
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'world_chat_messages'},({new:row})=>{if(!row?.id||state.messages.some(x=>x.id===row.id))return;state.messages.push(row);if(state.messages.length>CHAT_LIMIT)state.messages.shift();renderMessages()})
      .subscribe(status=>{if(status==='SUBSCRIBED'){state.subscribed=true;setOnlineUI();heartbeat()}else if(status==='CHANNEL_ERROR'||status==='TIMED_OUT'){state.subscribed=false;state.presenceLive=false;state.connected=false;setOnlineUI();syncPeers()}});
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
  U.people.addEventListener('click',()=>{U.drawer.classList.add('open');U.drawer.setAttribute('aria-hidden','false')});
  U.chat.addEventListener('click',()=>{U.drawer.classList.toggle('open');U.drawer.setAttribute('aria-hidden',U.drawer.classList.contains('open')?'false':'true')});
  U.drawer.querySelector('[data-kwmp-close]').addEventListener('click',()=>{U.drawer.classList.remove('open');U.drawer.setAttribute('aria-hidden','true')});
  U.form.addEventListener('submit',async e=>{
    e.preventDefault();if(!state.presenceLive||!state.session?.user)return;
    const body=escText(U.input.value,500);if(!body)return;U.input.value='';
    const row={user_id:state.session.user.id,display_name:escText(state.profile?.display_name||'KŌMØ Member',60)||'KŌMØ Member',body};
    const {error}=await client.from('world_chat_messages').insert(row);if(error){runtime.notify?.('Message non envoyé');console.warn('[World chat]',error)}
  });

  function animatePeers(){
    const local=runtime.getState(),cam=runtime.camera;
    for(const peer of state.peers.values()){
      peer.visible=peer.userData.zone===local.mode;
      if(!peer.visible)continue;
      const av=peer.userData.avatar;
      const beforeX=peer.position.x,beforeZ=peer.position.z;
      peer.position.lerp(peer.userData.target,.18);
      let d=((peer.userData.targetYaw-peer.rotation.y+Math.PI)%(Math.PI*2))-Math.PI;
      peer.rotation.y+=d*.18;

      if(av){
        const speed=Math.hypot(peer.position.x-beforeX,peer.position.z-beforeZ);
        av.walkPhase+=Math.min(.22,speed*7.0);
        const stride=Math.sin(av.walkPhase);
        const distance=cam?cam.position.distanceTo(peer.position):0;
        const near=distance<24;
        av.tag.visible=distance<26;
        if(av.tag.visible){
          const k=Math.max(1,Math.min(1.24,1+distance*.011));
          av.tag.scale.set(2.25*k,.64*k,1);
        }
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
  animatePeers();setOnlineUI();renderMessages();renderRoster();
  client.auth.getSession().then(({data,error})=>{
    if(error){console.warn('[World auth restore]',error);return}
    if(data?.session?.user)startLiveSession(data.session).catch(err=>console.warn('[World session restore]',err));
  });

  const cleanup=()=>{
    clearInterval(state.timer);cancelAnimationFrame(state.raf);window.removeEventListener('message',onMessage);
    if(state.channel)client.removeChannel(state.channel);
    if(state.session?.user)client.from('world_presence').delete().eq('user_id',state.session.user.id).then(()=>{});
  };
  window.addEventListener('pagehide',event=>{if(!event.persisted)cleanup()});
  window.addEventListener('pageshow',event=>{if(event.persisted&&state.session?.user){if(!state.timer)state.timer=setInterval(()=>{heartbeat();syncPeers()},HEARTBEAT_MS);heartbeat();syncPeers()}});

  window.KomoWorldMultiplayer={version:'0.5.0-join-friend',connect:openPulse,state};
}
