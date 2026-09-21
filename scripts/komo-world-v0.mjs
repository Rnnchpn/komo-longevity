import { cp, mkdir, rm, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = join(root, 'src', 'world');
const target = join(root, 'site', 'world');

const runtime=await readFile(join(source,'world-v1.js'),'utf8');
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
  ['third-person V2.4+ present',runtime.includes('KOMO_PLAYER_AVATAR_V24')&&runtime.includes("cameraMode='third'")],
  ['World Journey V2.4+ present',runtime.includes('KOMO_WORLD_JOURNEY_V24')&&runtime.includes('const JOURNEY_MISSIONS')&&runtime.includes('function completeJourney')],
  ['faster gameplay V2.4 present',runtime.includes('const speed=sprint?7.15:4.35')],
  ['living journey V2.5+ present',runtime.includes('KOMO_JOURNEY_GUIDE_V25')&&runtime.includes('function updateJourneyGuide')],
  ['NPC conversations V2.5 present',runtime.includes('function showNpcConversation')&&runtime.includes("id:'social'")],
  ['smart third-person camera V2.5 present',runtime.includes('thirdPersonDistance')&&runtime.includes('Cheap camera collision clamp')],
  ['Twin Lab V2.6+ present',runtime.includes('KOMO_TWIN_LAB_V26')&&runtime.includes('const twinInteractions')],
  ['Rehab Lab V2.6+ present',runtime.includes('KOMO_REHAB_LAB_V26')&&runtime.includes('const rehabInteractions')&&runtime.includes('function runRehabDemo')],
  ['Twin/Rehab room interactions V2.6 present',runtime.includes("mode==='twin'?twinInteractions:mode==='rehab'?rehabInteractions")&&runtime.includes('function updateTwinVisuals')],
  ['Biomechanical Twin V2.7+ present',runtime.includes('KOMO_BIOMECH_TWIN_V27')&&runtime.includes('function updateBiomechTwin')],
  ['Rehab Coach V2.7 present',runtime.includes('KOMO_REHAB_COACH_V27')&&runtime.includes('function animateRehabCoach')&&runtime.includes("id:'rehab_coach'")],
  ['FPS budget V2.8 present',runtime.includes("version:'2.8.1-fps-budget'")&&runtime.includes('function updateLightBudget')&&runtime.includes('function updateVisibilityBudget')],
  ['shadow budget V2.8 present',runtime.includes('renderer.shadowMap.enabled=false')&&runtime.includes("qualityMode==='high'")],
  ['draw-call telemetry V2.8 present',runtime.includes('renderer.info.render.calls')&&runtime.includes('activeLightBudget')]
];
for(const [label,ok] of checks){
  console.log(`[komo-world-qa] ${ok?'OK':'FAIL'} · ${label}`);
  if(!ok)process.exit(1);
}

await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
await cp(source, target, { recursive: true });

console.log(`[komo-world-qa] PASS · ${checks.length}/${checks.length} · canonical World copied to /site/world/`);
