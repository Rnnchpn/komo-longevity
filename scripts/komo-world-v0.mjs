import { cp, mkdir, rm, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = join(root, 'src', 'world');
const target = join(root, 'site', 'world');

const html=await readFile(join(source,'index.html'),'utf8');
const runtime=await readFile(join(source,'world-v1.js'),'utf8');
const multiplayer=await readFile(join(source,'world-multiplayer-v1.js'),'utf8');
const pulseAuth=await readFile('pulse-app/auth-gateway-v2.js','utf8');
const checks=[
  ['canonical World V1 runtime',runtime.includes("window.KomoWorld={")],
  ['render loop present',runtime.includes('renderer.render(scene,camera)')],
  ['living animation owner present',runtime.includes('function animateLiving(now)')],
  ['living animation invoked safely',runtime.includes('try{animateLiving(now)}')],
  ['retired undefined updateLiving call absent',!runtime.includes('updateLiving(now)')],
  ['multiplayer remains optional',runtime.includes("import('./world-multiplayer-v1.js')")&&runtime.includes('.catch(err=>console.warn')],
  ['true sky V1.8 present',runtime.includes('KOMO_TRUE_SKY_V18')&&runtime.includes('KOMO_CLOUD_FIELD_V18')],
  ['second floor V1.8 present',runtime.includes('KOMO_UPPER_LEVEL_V18')&&runtime.includes('KOMO_GRAND_STAIR_V18')],
  ['upper-floor navigation present',runtime.includes('syncPlayerElevation')&&runtime.includes('isUpperWalkable')],
  ['premium flooring V1.9 present',runtime.includes('KOMO_FLOORING_V19')&&runtime.includes('KOMO_EXTERIOR_FLOOR_V19')],
  ['ambient people V1.9 present',runtime.includes('KOMO_AMBIENT_PEOPLE_V19')&&runtime.includes('function updateNpc')],
  ['avatar presence V2.0+ present',runtime.includes('function npcNameTag')&&runtime.includes('lastFarUpdate')],
  ['avatar LOD V2.0 present',runtime.includes('lastFarUpdate')&&runtime.includes('distToCamera')],
  ['floor polish V2.0 present',runtime.includes('V2.0 floor polish')],
  ['smooth UX V2.1+ present',runtime.includes('function fastTravel')&&runtime.includes('world-menu')],
  ['adaptive performance V2.1+ present',runtime.includes('function updatePerformance')&&runtime.includes('applyRenderScale')],
  ['performance rescue V2.2+ present',runtime.includes('function applyEmergencyPerformance')&&runtime.includes('function freezeStaticScene')],
  ['low-power lights disabled',runtime.includes('l.visible=false;l.intensity=0')&&runtime.includes("antialias:!lowPower")],
  ['living entrance V2.3+ present',runtime.includes('KOMO_LIVING_ENTRANCE_V23')&&runtime.includes('function updateDoors(now,dt)')],
  ['arrival life cues V2.3 present',runtime.includes('KOMO_ARRIVAL_DETAILS_V23')],
  ['third-person V4.1 present',(runtime.includes('KOMO_PLAYER_AVATAR_V41')||runtime.includes('KOMO_PLAYER_AVATAR_V39'))&&runtime.includes("cameraMode='third'")],
  ['World Journey V2.4+ present',runtime.includes('KOMO_WORLD_JOURNEY_V24')&&runtime.includes('const JOURNEY_MISSIONS')&&runtime.includes('function completeJourney')],
  ['faster gameplay V2.4 present',runtime.includes('const speed=sprint?7.15:4.35')],
  ['living journey V2.5+ present',runtime.includes('KOMO_JOURNEY_GUIDE_V25')&&runtime.includes('function updateJourneyGuide')],
  ['NPC conversations V2.5 present',runtime.includes('function showNpcConversation')&&runtime.includes("id:'social'")],
  ['smart third-person camera V2.5 present',runtime.includes('thirdPersonDistance')&&runtime.includes('Cheap camera collision clamp')],
  ['Twin Lab V2.6+ present',runtime.includes('KOMO_TWIN_LAB_V26')&&runtime.includes('const twinInteractions')],
  ['Rehab Lab V2.6+ present',runtime.includes('KOMO_REHAB_LAB_V26')&&runtime.includes('const rehabInteractions')&&runtime.includes('function runRehabDemo')],
  ['One World interaction pool present',runtime.includes("const pool=[...interactions,...twinInteractions,...rehabInteractions,...arenaInteractions]")&&runtime.includes('function updateTwinVisuals')],
  ['Biomechanical Twin V2.7+ present',runtime.includes('KOMO_BIOMECH_TWIN_V27')&&runtime.includes('function updateBiomechTwin')],
  ['Rehab Coach V2.7 present',runtime.includes('KOMO_REHAB_COACH_V27')&&runtime.includes('function animateRehabCoach')&&runtime.includes("id:'rehab_coach'")],
  ['FPS budget V2.8+ present',runtime.includes('function updateLightBudget')&&runtime.includes('function updateVisibilityBudget')],
  ['shadow budget V2.8 present',runtime.includes('renderer.shadowMap.enabled=false')&&runtime.includes("qualityMode==='high'")],
  ['draw-call telemetry V2.8 present',runtime.includes('renderer.info.render.calls')&&runtime.includes('activeLightBudget')],
  ['Fitness Club V2.9+ present',runtime.includes('KOMO_FITNESS_CLUB_V29')&&runtime.includes('const FITNESS_ACTIVITIES')],
  ['daily Fitness program V2.9 present',runtime.includes('function fitnessToday')&&runtime.includes('function fitnessStreak')&&runtime.includes('function markFitnessTodayComplete')],
  ['Fitness Coach V2.9 present',runtime.includes('function runFitnessCoachPreview')&&runtime.includes('ALEX · FITNESS COACH')],
  ['Hall Living V3+ present',runtime.includes('KOMO_HALL_LIVING_V30')&&runtime.includes('function instancedStatic')],
  ['Hall Living social layer present',runtime.includes("label:'Camille'")&&runtime.includes("label:'Lina'")&&runtime.includes('TODAY AT KŌMØ')],
  ['Hall Living culling present',runtime.includes('hallLiving.visible=player.z<19&&player.z>-29')&&runtime.includes('mesh:m')],
  ['Retina sharpness V3.0.2+ present',runtime.includes('const retinaMobile=lowPower&&deviceDpr>=2')&&runtime.includes('pixelRatio:renderer.getPixelRatio()')],
  ['mobile no forced rescue V3.0.2+ present',!runtime.includes('if(lowPower)applyEmergencyPerformance();')&&runtime.includes('retinaMobile?1.02:.86')&&runtime.includes('retinaMobile?.78:.68')],
  ['Visual polish V4.1 present',runtime.includes('KOMO_PLAYER_AVATAR_V41')&&runtime.includes('KOMO_HALL_HOST_V31')&&runtime.includes('THREE.CapsuleGeometry')],
  ['player grounding V3.9 present',runtime.includes('Grounding — soft shadow only')&&runtime.includes('leftElbow')&&runtime.includes('rightElbow')&&runtime.includes('av.tag.visible=false')],
  ['World Hub V3.2+ present',runtime.includes('KOMO_WORLD_DISTRICT_V32')&&runtime.includes('KOMO_GRAND_FOUNTAIN_V32')],
  ['World Hub destination doors present',runtime.includes('KOMO_DESTINATION_DOOR_')&&runtime.includes('function updateDestinationDoors')],
  ['World Hub health + challenges present',runtime.includes('function showHealthOverview')&&runtime.includes('const CHALLENGE_KEY')&&runtime.includes('KOMO_CHALLENGE_BOARD_V32')],
  ['World Hub Life items present',runtime.includes('KOMO_LIFE_ITEMS_V32')&&runtime.includes('function showLifeItem')],
  ['World Hub avatar studio present',runtime.includes('AVATAR_KEY')&&runtime.includes('function showAvatarStudio')],
  ['World Hub mobile clouds present',runtime.includes('const cloudCount=lowPower?3:11')&&runtime.includes('if(living.clouds?.length)')],
  ['Immersive Hub V4.1 entry present',runtime.includes("version:'4.1.0-sprint'")&&runtime.includes('KOMO_HEALTH_STATION_V33')&&runtime.includes('KOMO_ENTRY_GUIDE_V33')],
  ['Immersive Hub V3.3 portals present',runtime.includes('KOMO_PORTAL_ARCH_V33_')&&runtime.includes('function updateDestinationDoors')],
  ['Immersive Hub V3.3 Life retail present',runtime.includes('KOMO_LIFE_RETAIL_WALL_V33')&&runtime.includes("id:'life_jacket'")&&runtime.includes("id:'life_band'")],
  ['Immersive Hub V3.3 quests present',runtime.includes("quest:'fitness'")&&runtime.includes("quest:'arena'")&&runtime.includes("id:'coach'")],
  ['Immersive Hub V3.3 district detail present',runtime.includes('KOMO_DISTRICT_DETAILS_V33')&&runtime.includes('HEALTH PAVILION')&&runtime.includes('CLUB HOUSE')],
  ['multiplayer reliable presence V0.8.0 present',multiplayer.includes("version:'0.8.0-v41-avatar'")&&multiplayer.includes("persistSession:true")&&multiplayer.includes("komo-world-auth-v1")],
  ['push-to-talk voice control present',multiplayer.includes('MAINTENIR POUR PARLER')&&multiplayer.includes('const startTalking=async')&&multiplayer.includes("U.talk.addEventListener('pointerdown'")&&multiplayer.includes('track.enabled=state.voice.talking')],
  ['voice signaling fallback present',multiplayer.includes('const pollVoiceSignals=async')&&multiplayer.includes("setInterval(()=>pollVoiceSignals(),350)")&&multiplayer.includes("VOICE_EXIT_M=22")],
  ['desktop social HUD present',multiplayer.includes('kwmp-chat-launcher')&&multiplayer.includes('kwmp-voicebox')&&multiplayer.includes("drawer.className='kwmp-chat'")&&multiplayer.includes('const openChat=()=>')],
  ['desktop clarity nav present',html.includes('data-nav-zone="hall"')&&html.includes('data-nav-zone="twin"')&&html.includes('data-nav-zone="life"')&&html.includes('data-nav-zone="upper"')&&runtime.includes('function syncQuickNav(zone)')],
  ['My World information menu present',html.includes('id="results-toggle"')&&html.includes('id="campus-toggle"')&&html.includes('id="journey-toggle"')&&html.includes('world-menu-summary')&&runtime.includes('function showCampusMap')],
  ['premium avatar refinement V4.1 present',runtime.includes("g.name='KOMO_PLAYER_AVATAR_V41'")&&runtime.includes('const leftShoe=')&&runtime.includes('const chestPin=')&&multiplayer.includes('function presenceAvatar(runtime,record)')&&multiplayer.includes('new THREE.CapsuleGeometry')],
  ['One World continuous campus present',runtime.includes("version:'4.1.0-sprint'")&&runtime.includes('KOMO_ONE_WORLD_LINKS_V37')&&runtime.includes('function inTwinZone')&&runtime.includes("mode='world';\n  world.visible=true;twinRoom.visible=true;rehabRoom.visible=true;arenaRoom.visible=true")],
  ['transient zone label present',runtime.includes("function showWorldZone(label,purpose='')")&&runtime.includes("locationChip?.classList.add('show')")&&runtime.includes("locationPurpose.textContent=purpose")],
  ['results dashboard V4.1 present',runtime.includes('results-hero-v41')&&runtime.includes('score-orbit')&&runtime.includes('results-domains')&&runtime.includes('results-timeline')&&runtime.includes('results-signals')],
  ['hall lighting V4.1 present',runtime.includes('KOMO_HALL_LIGHTING_V41')&&runtime.includes('hallAmbient')&&runtime.includes('hallLights')&&runtime.includes('renderer.toneMappingExposure=1.02')],
  ['hall materials V4.1 present',runtime.includes('color:0xeee7dd')&&runtime.includes('color:0xa77d4f')&&runtime.includes('transmission:.52')],
  ['persistent Minecraft-style chat present',multiplayer.includes("drawer.className='kwmp-chat'")&&multiplayer.includes("const openChat=()=>")&&multiplayer.includes("data-kwmp-target")],
  ['private messages present',multiplayer.includes("recipient_id")&&multiplayer.includes("setDmTarget")&&multiplayer.includes("dm.textContent='MP'")],
  ['community roles present',multiplayer.includes("komo_community_roles")&&multiplayer.includes("role_title")&&multiplayer.includes("display_title")],
  ['social communication XP present',multiplayer.includes("SOCIAL_KEY")&&multiplayer.includes("awardSocial")&&multiplayer.includes("runtime.completeSocial?.()")],
  ['proximity voice present',multiplayer.includes("getUserMedia")&&multiplayer.includes("RTCPeerConnection")&&multiplayer.includes("VOICE_ENTER_M=18")&&multiplayer.includes("world_voice_signals")],
  ['horizon sun disc removed',runtime.includes("V3.4 horizon cleanup")&&runtime.includes("living.sunSprite=null")],
  ['multiplayer clock-skew safety V0.5.3 present',multiplayer.includes('const CLOCK_SKEW_MS=180000')&&multiplayer.includes('timestampPlausible')&&multiplayer.includes('_local_seen_at')],
  ['multiplayer heartbeat verifies writes',multiplayer.includes("const {error}=await client.from('world_presence').upsert")&&multiplayer.includes("state.presenceLive=true")],
  ['multiplayer mobile presence tolerance',multiplayer.includes('const STALE_MS=45000')&&multiplayer.includes('const HEARTBEAT_MS=2200')],
  ['multiplayer roster present',multiplayer.includes('const renderRoster=()=>')&&multiplayer.includes('kwmpRoster')],
  ['multiplayer Safari restore present',multiplayer.includes('client.auth.getSession().then')&&multiplayer.includes('event.persisted')],
  ['Pulse cross-tab World bridge present',pulseAuth.includes('WORLD_BRIDGE_CHANNEL')&&pulseAuth.includes("type:'komo:pulse-world-session-request'")&&pulseAuth.includes("type:'komo:pulse-world-session-response'")],
  ['World bridge ACK present',pulseAuth.includes("type!=='komo:world-bridge-ack'")&&multiplayer.includes("type:'komo:world-bridge-ack'")],
  ['multiplayer join friend V0.5 present',runtime.includes('function joinPresence(target)')&&runtime.includes('joinPresence,')&&multiplayer.includes('runtime.joinPresence?.(row)')],
  ['multiplayer distance roster present',multiplayer.includes("Math.round(distance)+' m away'")&&multiplayer.includes("join.textContent='JOIN'")],
  ['multiplayer long-range beacon present',multiplayer.includes('distance<90')&&multiplayer.includes('beaconTop')&&multiplayer.includes('depthTest:false')],
  ['configurable keyboard controls present',runtime.includes("const KEYBIND_KEY='komo_world_keybinds_v1'")&&runtime.includes('function showControlsPanel')&&runtime.includes("controlsToggle.addEventListener")],
  ['movement uses configured controls',runtime.includes("if(isPressed('forward'))")&&runtime.includes("keyHas('action',e.code)")&&runtime.includes("keyHas('menu',e.code)")],
  ['multiplayer live motion V0.5.1 present',multiplayer.includes('const POSE_MS=125')&&multiplayer.includes("event:'pose'")&&multiplayer.includes(".on('broadcast',{event:'pose'}")],
  ['multiplayer live interpolation present',multiplayer.includes('lerp(peer.userData.target,.28)')&&multiplayer.includes('peer.rotation.y+=d*.26')],
  ['multiplayer symmetric Presence V0.5.2 present',multiplayer.includes("presence:{key:state.session.user.id}")&&multiplayer.includes(".on('presence',{event:'sync'}")&&multiplayer.includes(".on('presence',{event:'join'}")&&multiplayer.includes(".on('presence',{event:'leave'}")],
  ['multiplayer fallback refresh present',multiplayer.includes('const PRESENCE_REFRESH_MS=4000')&&multiplayer.includes('const refreshPresence=async')&&multiplayer.includes("U.people.addEventListener('click',async()=>{await refreshPresence()")]
];
for(const [label,ok] of checks){
  console.log(`[komo-world-qa] ${ok?'OK':'FAIL'} · ${label}`);
  if(!ok)process.exit(1);
}

await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
await cp(source, target, { recursive: true });

console.log(`[komo-world-qa] PASS · ${checks.length}/${checks.length} · canonical World copied to /site/world/`);
