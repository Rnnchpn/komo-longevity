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
const VOICE_ENTER_M=18;
const VOICE_EXIT_M=22;
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
  .kwmp-chat-launcher{display:none}
  .kwmp-voicebox{display:contents}
  .kwmp-voice-toggle,.kwmp-voice-collapse{display:none}
  .kwmp-talk{position:fixed;z-index:94;left:50%;bottom:22px;transform:translateX(-50%);height:54px;min-width:210px;padding:0 22px;border:1px solid rgba(216,186,134,.32);border-radius:999px;background:linear-gradient(180deg,rgba(38,58,47,.96),rgba(21,35,28,.96));box-shadow:0 12px 34px rgba(7,12,9,.24);color:#f1e7d7;font-size:8px;font-weight:900;letter-spacing:.12em;cursor:pointer;user-select:none;touch-action:none;transition:.16s ease}
  .kwmp-talk:hover{transform:translateX(-50%) translateY(-1px);border-color:rgba(216,186,134,.50)}
  .kwmp-talk[data-state="talking"]{background:linear-gradient(180deg,rgba(128,55,49,.98),rgba(83,35,31,.98));border-color:rgba(255,190,171,.62);box-shadow:0 0 0 5px rgba(180,85,70,.10),0 12px 34px rgba(7,12,9,.26)}
  .kwmp-talk:disabled{opacity:.42;cursor:not-allowed}
  @media(min-width:901px) and (pointer:fine){
    .kwmp-dock{
      top:108px;right:24px;gap:5px;max-width:720px;flex-wrap:nowrap;
      padding:5px;border:1px solid rgba(241,222,188,.12);border-radius:18px;
      background:linear-gradient(145deg,rgba(14,29,22,.90),rgba(29,45,35,.80));
      -webkit-backdrop-filter:blur(18px) saturate(1.05);backdrop-filter:blur(18px) saturate(1.05);
      box-shadow:0 15px 40px rgba(5,13,9,.13),inset 0 1px 0 rgba(255,255,255,.035)
    }
    .kwmp-pill{
      height:34px;padding:0 12px;border-radius:12px;background:transparent;border-color:transparent;
      color:rgba(246,239,228,.78);font-size:6px;letter-spacing:.10em;box-shadow:none
    }
    .kwmp-pill:hover{background:rgba(255,255,255,.055);border-color:rgba(216,186,134,.22)}
    .kwmp-pill[data-kwmp-chat],.kwmp-pill[data-kwmp-social]{display:none}
    .kwmp-pill[data-kwmp-voice]{display:none}
    .kwmp-dock{
      top:64px;right:24px;padding:0;border:0;background:transparent;
      -webkit-backdrop-filter:none;backdrop-filter:none;box-shadow:none
    }
    .kwmp-pill{
      height:29px;padding:0 10px;border:1px solid rgba(255,255,255,.06);
      border-radius:10px;background:rgba(13,27,20,.62);font-size:5px;letter-spacing:.09em;
      color:rgba(245,239,230,.68);box-shadow:0 7px 18px rgba(5,12,8,.07);
      -webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px)
    }
    .kwmp-pill:hover{background:rgba(20,37,28,.78);border-color:rgba(218,187,132,.14);color:#f5eee4}
    .kwmp-chat-launcher{
      border-color:rgba(255,255,255,.055)!important;
      background:rgba(13,27,20,.68)!important;
      box-shadow:0 9px 24px rgba(5,12,8,.09)!important;
      -webkit-backdrop-filter:blur(16px)!important;backdrop-filter:blur(16px)!important
    }
    .kwmp-chat{
      border-color:rgba(255,255,255,.06)!important;
      background:linear-gradient(160deg,rgba(13,27,20,.96),rgba(24,39,30,.94))!important;
      box-shadow:0 20px 60px rgba(5,12,8,.18)!important;
      -webkit-backdrop-filter:blur(24px)!important;backdrop-filter:blur(24px)!important
    }
    .kwmp-voicebox{
      border-color:rgba(255,255,255,.055)!important;
      background:rgba(13,27,20,.68)!important;
      box-shadow:0 9px 24px rgba(5,12,8,.09)!important
    }
    .kwmp-talk{
      border-color:rgba(218,187,132,.16)!important;
      background:rgba(23,42,32,.82)!important;
      box-shadow:none!important
    }
    .kwmp-chat-launcher{
      min-width:176px!important;height:52px!important;padding:0 16px!important;
      border-radius:16px!important;color:rgba(245,239,230,.72)!important;
    }
    .kwmp-chat-launcher i{opacity:.52!important}
    .kwmp-chat-launcher span{font-size:6px!important;letter-spacing:.13em!important}
    .kwmp-chat-launcher b{
      width:20px!important;height:20px!important;border-radius:999px!important;
      background:rgba(218,187,132,.10)!important;color:#e4c893!important
    }
    .kwmp-chat{
      width:min(420px,calc(100vw - 48px))!important;
      border-radius:19px!important;
    }
    .kwmp-head{
      padding:11px 12px 9px!important;border-bottom-color:rgba(255,255,255,.04)!important
    }
    .kwmp-head span{color:rgba(215,183,127,.74)!important}
    .kwmp-head strong{font:500 16px/1.1 Georgia,serif!important;letter-spacing:-.02em}
    .kwmp-messages{padding:10px 11px!important;gap:5px!important}
    .kwmp-msg{
      padding:5px 7px!important;border-radius:9px!important;
      background:rgba(255,255,255,.012)!important;text-shadow:none!important
    }
    .kwmp-msg.mine{background:rgba(218,187,132,.022)!important}
    .kwmp-msg.dm{border-left-color:rgba(218,187,132,.40)!important}
    .kwmp-msg b{font-size:7px!important;color:rgba(245,239,230,.88)!important}
    .kwmp-msg p{font-size:8px!important;color:rgba(245,239,230,.68)!important}
    .kwmp-compose{padding:8px!important;border-top-color:rgba(255,255,255,.04)!important}
    .kwmp-compose input{
      border-color:rgba(255,255,255,.045)!important;
      background:rgba(255,255,255,.014)!important;
      border-radius:10px!important;
    }
    .kwmp-compose button[type="submit"]{
      border-radius:10px!important;background:linear-gradient(135deg,#ead3a5,#caa26b)!important;color:#182820!important
    }
    .kwmp-voicebox{
      border-radius:16px!important;padding:5px!important;gap:5px!important
    }
    .kwmp-talk{
      height:46px!important;min-width:174px!important;border-radius:12px!important;
      background:rgba(20,38,29,.76)!important;
      font-size:6px!important;letter-spacing:.10em!important;color:rgba(245,239,230,.80)!important
    }
    .kwmp-talk[data-state="talking"]{
      background:rgba(105,52,43,.82)!important;
      border-color:rgba(227,159,138,.28)!important;
      color:#fff0e9!important
    }
    .kwmp-voice-toggle,.kwmp-voice-collapse{
      height:46px!important;border-color:rgba(255,255,255,.04)!important;
      background:rgba(255,255,255,.010)!important;color:rgba(245,239,230,.50)!important
    }
    .kwmp-chat{
      left:22px;bottom:22px;width:430px;max-height:min(390px,50vh);
      border-radius:18px;background:linear-gradient(150deg,rgba(14,27,20,.94),rgba(26,41,31,.88));
      -webkit-backdrop-filter:blur(22px) saturate(1.04);backdrop-filter:blur(22px) saturate(1.04);
      box-shadow:0 22px 58px rgba(7,14,10,.20),inset 0 1px 0 rgba(255,255,255,.025);
      opacity:0;visibility:hidden;transform:translateY(10px) scale(.985);pointer-events:none;transition:.18s ease
    }
    .kwmp-chat.open{opacity:1;visibility:visible;transform:none;pointer-events:auto}
    .kwmp-head{padding:12px 13px 10px}
    .kwmp-head strong{font-size:17px}.kwmp-head span{font-size:6px}
    .kwmp-chat-close{width:28px;height:28px;border:1px solid rgba(255,255,255,.07);border-radius:50%;background:rgba(255,255,255,.035);color:#efe7da;cursor:pointer}
    .kwmp-chat-launcher{
      position:fixed;z-index:93;left:24px;bottom:18px;height:60px;min-width:206px;
      display:flex;align-items:center;gap:11px;padding:0 16px;border:1px solid rgba(255,255,255,.09);border-radius:18px;
      background:linear-gradient(145deg,rgba(21,37,29,.84),rgba(28,43,35,.76));
      -webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px);
      box-shadow:0 16px 42px rgba(8,16,11,.14);color:#efe8dc;cursor:pointer
    }
    .kwmp-chat-launcher:hover{background:linear-gradient(145deg,rgba(26,44,35,.91),rgba(34,50,40,.84))}
    .kwmp-chat-launcher i{font-style:normal;font-size:18px;opacity:.82}
    .kwmp-chat-launcher span{font-size:7px;font-weight:850;letter-spacing:.12em}
    .kwmp-chat-launcher b{display:grid;place-items:center;min-width:22px;height:22px;padding:0 6px;border-radius:999px;background:#dfbd80;color:#203027;font-size:7px}
    .kwmp-chat.open+.kwmp-chat-launcher{display:none}
    .kwmp-voicebox{
      display:flex;position:fixed;z-index:94;right:24px;bottom:18px;align-items:center;gap:8px;
      padding:6px;border:1px solid rgba(255,255,255,.09);border-radius:19px;
      background:linear-gradient(145deg,rgba(21,37,29,.88),rgba(28,43,35,.80));
      -webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px);
      box-shadow:0 18px 44px rgba(8,16,11,.15),inset 0 1px 0 rgba(255,255,255,.025)
    }
    .kwmp-talk{
      position:static;transform:none;height:50px;min-width:188px;padding:0 18px;border-radius:14px;
      box-shadow:none;background:linear-gradient(180deg,rgba(35,57,45,.96),rgba(24,40,31,.96));font-size:7px
    }
    .kwmp-talk:hover{transform:none}
    .kwmp-voice-toggle{display:block;height:50px;min-width:74px;padding:0 11px;border-left:1px solid rgba(255,255,255,.065);background:transparent;color:rgba(242,236,226,.62);font-size:6px;font-weight:850;letter-spacing:.08em;cursor:pointer}
    .kwmp-voice-collapse{display:block;width:32px;height:32px;border-radius:10px;background:rgba(255,255,255,.035);color:#e8dfd1;cursor:pointer}
    .kwmp-voicebox.collapsed .kwmp-talk{min-width:48px;width:48px;padding:0;font-size:0}
    .kwmp-voicebox.collapsed .kwmp-talk:before{content:"🎙";font-size:16px}
    .kwmp-voicebox.collapsed .kwmp-voice-toggle{display:none}
    .kwmp-voicebox.collapsed .kwmp-voice-collapse{transform:rotate(180deg)}
    .kwmp-note{display:none}
  }
  @media(max-width:900px),(pointer:coarse){
    .kwmp-dock{top:63px;right:8px;gap:4px;max-width:calc(100vw - 16px)}
    .kwmp-pill{height:25px;padding:0 8px;font-size:5px;letter-spacing:.07em;background:rgba(22,37,29,.90);backdrop-filter:none}
    .kwmp-chat{left:8px;bottom:74px;width:min(420px,calc(100vw - 16px));max-height:34vh;background:linear-gradient(150deg,rgba(11,18,14,.66),rgba(18,28,22,.52));backdrop-filter:none}
    .kwmp-talk{bottom:12px;height:50px;min-width:190px;padding:0 18px;font-size:7px}
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
    voice:document.querySelector('[data-kwmp-voice]'),
    talk:document.querySelector('#kwmpTalk'),
    voicebox:document.querySelector('#kwmpVoicebox'),
    voiceCollapse:document.querySelector('[data-kwmp-voice-collapse]'),
    chatLauncher:document.querySelector('#kwmpChatLauncher'),
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
  dock.innerHTML='<button type="button" class="kwmp-pill" data-kwmp-connect data-state="offline">CONNECT WORLD</button><button type="button" class="kwmp-pill" data-kwmp-people>PEOPLE · 0</button><button type="button" class="kwmp-pill" data-kwmp-chat>CHAT</button><button type="button" class="kwmp-pill" data-kwmp-social>SOCIAL · 0</button>';
  document.body.appendChild(dock);
  const voicebox=document.createElement('div');voicebox.id='kwmpVoicebox';voicebox.className='kwmp-voicebox';
  voicebox.innerHTML='<button type="button" class="kwmp-talk" id="kwmpTalk" data-state="idle" disabled aria-label="Maintenir pour parler aux joueurs proches">🎙  MAINTENIR POUR PARLER</button><button type="button" class="kwmp-voice-toggle" data-kwmp-voice data-state="off">VOICE<br>OFF</button><button type="button" class="kwmp-voice-collapse" data-kwmp-voice-collapse aria-label="Réduire le contrôle vocal">⌄</button>';
  document.body.appendChild(voicebox);
  const talk=voicebox.querySelector('#kwmpTalk');
  const drawer=document.createElement('aside');drawer.id='kwmpChat';drawer.className='kwmp-chat';drawer.setAttribute('aria-hidden','true');
  drawer.innerHTML='<div class="kwmp-head"><div><span>KŌMØ WORLD · SOCIAL</span><strong>World Chat</strong></div><div style="display:flex;gap:6px"><button type="button" class="kwmp-world-btn" data-kwmp-world>WORLD</button><button type="button" class="kwmp-chat-close" data-kwmp-chat-close aria-label="Fermer le chat">×</button></div></div><div class="kwmp-roster" id="kwmpRoster"><div class="kwmp-empty">Aucune présence World active.</div></div><div class="kwmp-messages" id="kwmpMessages"><div class="kwmp-empty">Connectez World pour discuter.</div></div><form class="kwmp-compose" id="kwmpCompose"><button type="button" class="kwmp-target" id="kwmpTarget" data-kwmp-target>WORLD</button><input id="kwmpInput" maxlength="500" autocomplete="off" placeholder="Message World…" disabled><button type="submit" disabled>ENVOYER</button></form><div class="kwmp-note">Les données de santé ne sont jamais partagées dans World.</div>';
  document.body.appendChild(drawer);
  const chatLauncher=document.createElement('button');chatLauncher.type='button';chatLauncher.id='kwmpChatLauncher';chatLauncher.className='kwmp-chat-launcher';chatLauncher.innerHTML='<i>◔</i><span>WORLD CHAT</span><b data-kwmp-unread>0</b>';document.body.appendChild(chatLauncher);
  return {dock,connect:dock.querySelector('[data-kwmp-connect]'),people:dock.querySelector('[data-kwmp-people]'),chat:dock.querySelector('[data-kwmp-chat]'),voice:voicebox.querySelector('[data-kwmp-voice]'),talk,voicebox,voiceCollapse:voicebox.querySelector('[data-kwmp-voice-collapse]'),chatLauncher,social:dock.querySelector('[data-kwmp-social]'),drawer,roster:drawer.querySelector('#kwmpRoster'),messages:drawer.querySelector('#kwmpMessages'),form:drawer.querySelector('#kwmpCompose'),input:drawer.querySelector('#kwmpInput'),target:drawer.querySelector('#kwmpTarget'),worldBtn:drawer.querySelector('[data-kwmp-world]')};
}
function labelSprite(THREE,text,subtitle='PULSE MEMBER'){
  const c=document.createElement('canvas');c.width=512;c.height=128;const x=c.getContext('2d');
  x.clearRect(0,0,512,128);
  const rr=(ctx,x0,y0,w,h,r)=>{ctx.beginPath();ctx.roundRect(x0,y0,w,h,r);ctx.closePath()};
  rr(x,58,18,396,88,24);x.fillStyle='rgba(16,29,22,.78)';x.fill();
  x.strokeStyle='rgba(223,197,151,.28)';x.lineWidth=1.5;x.stroke();
  x.fillStyle='#f5eee4';x.font='600 29px Arial';x.textAlign='center';x.textBaseline='middle';
  x.fillText(escText(text,24)||'KŌMØ Member',256,52);
  x.fillStyle='rgba(224,197,148,.82)';x.font='700 13px Arial';x.fillText(escText(subtitle,28)||'PULSE MEMBER',256,80);
  const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;tx.anisotropy=2;
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,transparent:true,depthWrite:false,depthTest:false,opacity:.96}));
  sp.scale.set(1.72,.43,1);sp.position.y=2.42;sp.renderOrder=30;return sp;
}
function presenceAvatar(runtime,record){
  const {THREE}=runtime,g=new THREE.Group();g.name='KOMO_REMOTE_'+record.user_id;
  const cfg=record.avatar_config||{};
  const skin={porcelain:0xe9d5c3,sand:0xd8b797,amber:0xb9845e,bronze:0x8e6248,deep:0x5d4034}[cfg.skin]||0xc79772;
  const outfit={tee:0x294238,sweat:0x56675a,varsity:0x21352f,motion:0x334b3e}[cfg.outfit]||0x294238;
  const hairColor={dark:0x26221f,brown:0x594438,sand:0x8b745d,black:0x171717}[cfg.hair]||0x2c2521;
  const matSkin=new THREE.MeshStandardMaterial({color:skin,roughness:.74});
  const matSkinWarm=new THREE.MeshStandardMaterial({color:new THREE.Color(skin).multiplyScalar(.88),roughness:.78});
  const matOut=new THREE.MeshStandardMaterial({color:outfit,roughness:.60,metalness:.015});
  const matOutDark=new THREE.MeshStandardMaterial({color:new THREE.Color(outfit).multiplyScalar(.72),roughness:.66});
  const matTrouser=new THREE.MeshStandardMaterial({color:0x343a36,roughness:.76});
  const matHair=new THREE.MeshStandardMaterial({color:hairColor,roughness:.86});
  const matShoe=new THREE.MeshStandardMaterial({color:0x222220,roughness:.50});
  const matSole=new THREE.MeshStandardMaterial({color:0xd1ccc2,roughness:.84});
  const accent=new THREE.MeshStandardMaterial({color:0xaa8254,roughness:.34,metalness:.38});
  const capsule=(r,len,mat,parent,y=0)=>{
    const m=new THREE.Mesh(new THREE.CapsuleGeometry(r,len,5,12),mat);m.position.y=y;parent.add(m);return m;
  };

  const hips=new THREE.Group();hips.position.y=.98;g.add(hips);
  let q=new THREE.Mesh(new THREE.SphereGeometry(.24,16,10),matTrouser);q.scale.set(1,.72,.80);hips.add(q);

  const torso=new THREE.Group();torso.position.y=1.42;g.add(torso);
  q=new THREE.Mesh(new THREE.CapsuleGeometry(.215,.42,7,16),matOut);q.scale.set(1.04,1,.80);torso.add(q);
  q=new THREE.Mesh(new THREE.SphereGeometry(.30,16,10),matOut);q.position.y=.14;q.scale.set(1.17,.48,.70);torso.add(q);
  q=new THREE.Mesh(new THREE.SphereGeometry(.235,14,9),matOutDark);q.position.y=-.29;q.scale.set(1,.26,.76);torso.add(q);
  q=new THREE.Mesh(new THREE.BoxGeometry(.014,.44,.018),accent);q.position.set(0,-.01,.202);torso.add(q);

  const head=new THREE.Group();head.position.y=2.055;g.add(head);
  q=new THREE.Mesh(new THREE.SphereGeometry(.178,22,16),matSkin);q.scale.set(.90,1.08,.94);head.add(q);
  q=new THREE.Mesh(new THREE.SphereGeometry(.130,14,10),matSkin);q.position.set(0,-.105,.015);q.scale.set(.90,.60,.88);head.add(q);
  q=new THREE.Mesh(new THREE.SphereGeometry(.184,18,12,0,Math.PI*2,0,Math.PI*.56),matHair);q.position.set(0,.068,-.009);q.scale.set(.92,.86,.96);head.add(q);
  q=new THREE.Mesh(new THREE.SphereGeometry(.028,8,6),matSkinWarm);q.position.set(0,-.002,.187);q.scale.set(.62,.74,1.10);head.add(q);

  const leftLeg=new THREE.Group(),rightLeg=new THREE.Group();leftLeg.position.set(-.14,.93,0);rightLeg.position.set(.14,.93,0);g.add(leftLeg,rightLeg);
  const leftKnee=new THREE.Group(),rightKnee=new THREE.Group();leftKnee.position.y=-.405;rightKnee.position.y=-.405;leftLeg.add(leftKnee);rightLeg.add(rightKnee);
  capsule(.074,.28,matTrouser,leftLeg,-.215);capsule(.074,.28,matTrouser,rightLeg,-.215);
  capsule(.058,.25,matTrouser,leftKnee,-.205);capsule(.058,.25,matTrouser,rightKnee,-.205);
  const leftShoe=new THREE.Mesh(new THREE.SphereGeometry(.12,14,9),matShoe);leftShoe.position.set(0,-.445,.070);leftShoe.scale.set(.72,.42,1.28);leftKnee.add(leftShoe);
  const rightShoe=leftShoe.clone();rightKnee.add(rightShoe);
  const leftSole=new THREE.Mesh(new THREE.SphereGeometry(.117,12,8),matSole);leftSole.position.set(0,-.485,.082);leftSole.scale.set(.70,.19,1.24);leftKnee.add(leftSole);
  const rightSole=leftSole.clone();rightKnee.add(rightSole);

  const leftArm=new THREE.Group(),rightArm=new THREE.Group();leftArm.position.set(-.335,1.66,0);rightArm.position.set(.335,1.66,0);leftArm.rotation.z=-.055;rightArm.rotation.z=.055;g.add(leftArm,rightArm);
  const leftElbow=new THREE.Group(),rightElbow=new THREE.Group();leftElbow.position.y=-.315;rightElbow.position.y=-.315;leftArm.add(leftElbow);rightArm.add(rightElbow);
  capsule(.055,.22,matOut,leftArm,-.175);capsule(.055,.22,matOut,rightArm,-.175);
  capsule(.044,.19,matSkin,leftElbow,-.15);capsule(.044,.19,matSkin,rightElbow,-.15);
  q=new THREE.Mesh(new THREE.SphereGeometry(.054,10,8),matSkin);q.position.set(0,-.33,.006);q.scale.set(.84,1.05,.68);leftElbow.add(q);
  q=q.clone();rightElbow.add(q);

  const ringMat=new THREE.MeshBasicMaterial({color:0xd6b779,transparent:true,opacity:.18,depthWrite:false});
  const ring=new THREE.Mesh(new THREE.RingGeometry(.37,.405,36),ringMat);ring.rotation.x=-Math.PI/2;ring.position.y=.018;ring.renderOrder=28;g.add(ring);
  const beacon=new THREE.Mesh(new THREE.CylinderGeometry(.010,.010,3.0,6),new THREE.MeshBasicMaterial({color:0xd6b779,transparent:true,opacity:.10,depthWrite:false,depthTest:false}));
  beacon.position.y=1.52;beacon.renderOrder=27;g.add(beacon);
  const beaconTop=new THREE.Mesh(new THREE.RingGeometry(.09,.14,24),new THREE.MeshBasicMaterial({color:0xf0d4a0,transparent:true,opacity:.32,depthWrite:false,depthTest:false}));
  beaconTop.position.y=3.05;beaconTop.rotation.x=-Math.PI/2;beaconTop.renderOrder=29;g.add(beaconTop);
  const tag=labelSprite(THREE,record.display_name,record.role_title||'PULSE MEMBER');g.add(tag);

  g.userData.target=new THREE.Vector3(Number(record.x)||0,Number(record.y)||0,Number(record.z)||0);
  g.userData.targetYaw=record.yaw||0;g.userData.zone=record.zone||'world';g.position.copy(g.userData.target);
  g.userData.avatar={hips,torso,head,leftLeg,rightLeg,leftKnee,rightKnee,leftArm,rightArm,leftElbow,rightElbow,leftShoe,rightShoe,tag,ring,beacon,beaconTop,lastPosition:g.position.clone(),walkPhase:0};
  runtime.scene.add(g);return g;
}
export async function mount(runtime){
  if(!runtime?.scene||!runtime?.THREE||!runtime?.getState)return;
  const U=ui();
  const client=createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storageKey:'komo-world-auth-v1'}});
  const state={session:null,profile:null,channel:null,peers:new Map(),rows:new Map(),roles:new Map(),connected:false,presenceLive:false,subscribed:false,lastZone:'',timer:null,poseTimer:null,presenceRefreshTimer:null,raf:0,popup:null,messages:[],started:false,lastPresenceError:'',lastPresenceErrorAt:0,lastPose:null,lastPoseSentAt:0,lastTrackSentAt:0,dmTarget:null,unread:0,social:loadSocial(),voice:{enabled:false,stream:null,peers:new Map(),lastSweep:0,connected:new Set(),talking:false,pttHeld:false,signalPollTimer:null,seenSignals:new Set()}};
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
    updateSocialUI();updateVoiceUI();
  };
  const updateVoiceUI=()=>{
    const n=state.voice.connected.size;
    U.voice.dataset.state=state.voice.enabled?'on':'off';
    U.voice.textContent=state.voice.enabled?(n?('VOICE · LINKED · '+n):'VOICE · READY'):'VOICE · OFF';
    U.talk.disabled=!state.presenceLive;
    U.talk.dataset.state=state.voice.talking?'talking':'idle';
    U.talk.textContent=state.voice.talking?'●  VOUS PARLEZ':'🎙  MAINTENIR POUR PARLER';
  };
  const updateUnread=()=>{
    const badge=U.chatLauncher?.querySelector('[data-kwmp-unread]');if(!badge)return;
    badge.textContent=String(Math.min(99,state.unread||0));badge.style.display=state.unread?'grid':'none';
  };
  const openChat=()=>{
    U.drawer.classList.add('open');U.drawer.setAttribute('aria-hidden','false');state.unread=0;updateUnread();setTimeout(()=>U.input.focus(),30);
  };
  const closeChat=()=>{U.drawer.classList.remove('open','people-open');U.drawer.setAttribute('aria-hidden','true')};
  const toggleChat=()=>U.drawer.classList.contains('open')?closeChat():openChat();
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
    if(!row?.id||row.recipient_id!==state.session?.user?.id||state.voice.seenSignals.has(row.id))return false;
    state.voice.seenSignals.add(row.id);
    let handled=false;
    try{
      const sender=state.rows.get(row.sender_id);
      if(row.signal_type==='hangup'){closeVoicePeer(row.sender_id);handled=true;return true}
      if(!state.voice.enabled||!state.voice.stream||!sender?.voice_enabled){state.voice.seenSignals.delete(row.id);return false}
      const peer=await ensureVoicePeer(sender,{offer:false});if(!peer){state.voice.seenSignals.delete(row.id);return false}
      const pc=peer.pc,p=row.payload||{};
      if(row.signal_type==='offer'&&p.sdp){
        await pc.setRemoteDescription(new RTCSessionDescription(p.sdp));
        for(const cand of peer.pending.splice(0))await pc.addIceCandidate(cand);
        const answer=await pc.createAnswer();await pc.setLocalDescription(answer);
        await sendVoiceSignal(row.sender_id,'answer',{sdp:pc.localDescription});handled=true;
      }else if(row.signal_type==='answer'&&p.sdp){
        if(!pc.currentRemoteDescription){await pc.setRemoteDescription(new RTCSessionDescription(p.sdp));for(const cand of peer.pending.splice(0))await pc.addIceCandidate(cand)}
        handled=true;
      }else if(row.signal_type==='candidate'&&p.candidate){
        const cand=new RTCIceCandidate(p.candidate);
        if(pc.remoteDescription)await pc.addIceCandidate(cand);else peer.pending.push(cand);
        handled=true;
      }
      if(handled)client.from('world_voice_signals').delete().eq('id',row.id).then(()=>{});
      return handled;
    }catch(err){
      state.voice.seenSignals.delete(row.id);
      console.warn('[World voice receive]',err);return false;
    }
  };
  const pollVoiceSignals=async()=>{
    if(!state.voice.enabled||!state.session?.user)return false;
    try{
      const {data,error}=await client.from('world_voice_signals')
        .select('id,sender_id,recipient_id,signal_type,payload,created_at')
        .eq('recipient_id',state.session.user.id)
        .order('created_at',{ascending:true})
        .limit(40);
      if(error)throw error;
      for(const row of data||[])await handleVoiceSignal(row);
      return true;
    }catch(err){console.warn('[World voice fallback]',err);return false}
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
  const setTransmit=active=>{
    state.voice.talking=!!active&&state.voice.enabled&&!!state.voice.stream;
    if(state.voice.stream)for(const track of state.voice.stream.getAudioTracks())track.enabled=state.voice.talking;
    updateVoiceUI();
  };
  const disableVoice=async()=>{
    state.voice.pttHeld=false;setTransmit(false);state.voice.enabled=false;
    if(state.voice.signalPollTimer){clearInterval(state.voice.signalPollTimer);state.voice.signalPollTimer=null}
    state.voice.seenSignals.clear();
    for(const id of [...state.voice.peers.keys()])closeVoicePeer(id,{signal:true});
    if(state.voice.stream){for(const t of state.voice.stream.getTracks())t.stop();state.voice.stream=null}
    updateVoiceUI();await heartbeat();await sendPose(true);
  };
  const enableVoice=async()=>{
    if(state.voice.enabled&&state.voice.stream)return true;
    if(!navigator.mediaDevices?.getUserMedia){runtime.notify?.('Microphone non disponible');return false}
    try{
      state.voice.stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true},video:false});
      for(const track of state.voice.stream.getAudioTracks())track.enabled=false;
      state.voice.enabled=true;updateVoiceUI();await heartbeat();await sendPose(true);updateVoiceProximity();
      await pollVoiceSignals();
      if(!state.voice.signalPollTimer)state.voice.signalPollTimer=setInterval(()=>pollVoiceSignals(),350);
      runtime.notify?.('VOCAL PRÊT · 18 m · maintenez PARLER');
      return true;
    }catch(err){
      state.voice.enabled=false;state.voice.stream=null;setTransmit(false);runtime.notify?.('Autorisez le microphone pour parler');console.warn('[World voice permission]',err);return false
    }
  };
  const toggleVoice=async()=>{
    if(state.voice.enabled){await disableVoice();runtime.notify?.('VOICE PROXIMITY · OFF');return}
    await enableVoice();
  };
  const startTalking=async()=>{
    if(!state.presenceLive||!state.session?.user)return;
    state.voice.pttHeld=true;
    const ready=await enableVoice();
    if(ready&&state.voice.pttHeld){setTransmit(true);runtime.notify?.('Vous parlez aux joueurs proches')}
  };
  const stopTalking=()=>{
    state.voice.pttHeld=false;
    if(state.voice.talking)setTransmit(false);
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
        if(row.user_id!==state.session?.user?.id&&!U.drawer.classList.contains('open')){state.unread++;updateUnread()}
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
  U.people.addEventListener('click',async()=>{await refreshPresence();openChat();U.drawer.classList.add('people-open');renderRoster()});
  U.chat.addEventListener('click',()=>{openChat();U.drawer.classList.remove('people-open')});
  U.chatLauncher?.addEventListener('click',openChat);
  U.drawer.querySelector('[data-kwmp-chat-close]')?.addEventListener('click',closeChat);
  U.voice.addEventListener('click',()=>toggleVoice());
  U.voiceCollapse?.addEventListener('click',()=>U.voicebox?.classList.toggle('collapsed'));
  U.talk.addEventListener('pointerdown',e=>{e.preventDefault();try{U.talk.setPointerCapture(e.pointerId)}catch{};startTalking()});
  U.talk.addEventListener('pointerup',e=>{e.preventDefault();stopTalking()});
  U.talk.addEventListener('pointercancel',stopTalking);
  window.addEventListener('pointerup',stopTalking);
  U.worldBtn.addEventListener('click',()=>setDmTarget(null));
  U.target.addEventListener('click',()=>{if(state.dmTarget)setDmTarget(null);else U.input.focus()});
  document.addEventListener('keydown',e=>{
    if(e.code!=='Enter'||e.metaKey||e.ctrlKey||e.altKey)return;
    const a=document.activeElement,tag=a?.tagName;
    if(tag==='INPUT'||tag==='TEXTAREA'||a?.isContentEditable)return;
    e.preventDefault();openChat();
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
          const k=Math.max(1,Math.min(1.48,1+distance*.008));
          av.tag.scale.set(1.72*k,.43*k,1);
        }
        if(av.beacon){
          av.beacon.visible=distance>15&&distance<90;
          av.beacon.material.opacity=THREE.MathUtils.clamp(.18-distance*.0012,.06,.16);
        }
        if(av.beaconTop){
          av.beaconTop.visible=distance>15&&distance<90;
          const pulse=1+.07*Math.sin(performance.now()*.0032);
          av.beaconTop.scale.setScalar(pulse);
        }
        if(av.ring)av.ring.material.opacity=distance<18?.18:.10;
        if(near&&speed>.002){
          av.leftLeg.rotation.x=stride*.34;av.rightLeg.rotation.x=-stride*.34;
          av.leftKnee.rotation.x=Math.max(0,-stride)*.36;av.rightKnee.rotation.x=Math.max(0,stride)*.36;
          av.leftArm.rotation.x=-stride*.23;av.rightArm.rotation.x=stride*.23;
          av.leftElbow.rotation.x=Math.max(0,stride)*.12;av.rightElbow.rotation.x=Math.max(0,-stride)*.12;
          av.torso.rotation.z=Math.cos(av.walkPhase*.5)*.012;
          av.torso.rotation.y=Math.sin(av.walkPhase*.5)*.016;
          av.hips.rotation.y=Math.sin(av.walkPhase*.5)*.026;
          av.head.rotation.y=Math.sin(av.walkPhase*.24)*.045;
          if(av.leftShoe)av.leftShoe.rotation.x=-Math.max(0,-stride)*.10;
          if(av.rightShoe)av.rightShoe.rotation.x=-Math.max(0,stride)*.10;
        }else{
          av.leftLeg.rotation.x*=.78;av.rightLeg.rotation.x*=.78;
          av.leftArm.rotation.x*=.78;av.rightArm.rotation.x*=.78;
          av.leftKnee.rotation.x*=.72;av.rightKnee.rotation.x*=.72;
        }
      }
    }
    state.raf=requestAnimationFrame(animatePeers);
  }
  animatePeers();setOnlineUI();updateVoiceUI();updateSocialUI();updateUnread();renderMessages();renderRoster();
  client.auth.getSession().then(({data,error})=>{
    if(error){console.warn('[World auth restore]',error);return}
    if(data?.session?.user)startLiveSession(data.session).catch(err=>console.warn('[World session restore]',err));
  });

  const cleanup=()=>{
    clearInterval(state.timer);clearInterval(state.poseTimer);clearInterval(state.presenceRefreshTimer);if(state.voice.signalPollTimer)clearInterval(state.voice.signalPollTimer);cancelAnimationFrame(state.raf);window.removeEventListener('message',onMessage);stopTalking();for(const id of [...state.voice.peers.keys()])closeVoicePeer(id);if(state.voice.stream)for(const t of state.voice.stream.getTracks())t.stop();
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

  window.KomoWorldMultiplayer={version:'0.8.0-v41-avatar',connect:openPulse,state};
}
