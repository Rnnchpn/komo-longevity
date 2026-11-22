// Du résultat à l'action (21/11/2026) : zones par capacité, 3 priorités, programme maison, objectifs à 6 semaines.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {buildLongevityPlan,assessCapacities,profileFrom,LONGEVITY_PLAN_VERSION} from '../pulse-v14-src/motion-longevity-plan.mjs';
import {buildClinicPassport} from '../pulse-v14-src/motion-live-clinic-passport-v2.mjs';
const zone=(plan,id)=>plan.capacities.find(c=>c.id===id).zone;
const r={
 gait_4m:{status:'done',fields:{gait_4m_s_1:4.6,gait_4m_s_2:4.4},derived:{gait_speed_ms:0.89}},
 two_step:{status:'done',value:180,two_step_index:1.12},
 sts:{status:'done',value:11},
 unipodal_left:{status:'done',value:7.5},unipodal_right:{status:'done',value:22},
 fd_quiet_stand:{status:'done',fields:{fd_qs_velocity_mms:14.2,fd_qs_asym_pct:12}},
 fd_sts:{status:'done',fields:{fd_sts_time_to_stand_s:1.12,fd_sts_asym_pct:8}},
 dynamo_grip:{status:'done',fields:{grip_left_n:210,grip_right_n:240},derived:{lsi_pct:88}},
 dynamo_knee_ext:{status:'done',fields:{knee_ext_left_n:250,knee_ext_right_n:330},derived:{lsi_pct:76}},
 posture:{status:'done',observation:'apparent_offset'},arms:{status:'done',value:24}
};
// Profil : année de naissance seule (01/01) et sexe de référence.
assert.deepEqual(profileFrom({sex_at_birth:'female',birth_date:'1953-01-01'},new Date('2026-11-24')),{age:73,sex:'female'});
assert.deepEqual(profileFrom({sex_at_birth:'not_stated'},new Date()),{age:null,sex:null});
const plan=buildLongevityPlan(r,{age:73,sex:'female'});
assert.equal(plan.version,LONGEVITY_PLAN_VERSION);
// Repères publiés : marche 0,8/1,0 m/s, appui 10 s, chaise femme 70–74 ans 10/14, préhension femme 16 kg, LSI 80/90.
assert.equal(zone(plan,'walk'),'consolidate');
assert.equal(zone(plan,'legs'),'consolidate');
assert.equal(zone(plan,'balance'),'priority');
assert.equal(zone(plan,'strength'),'solid');
assert.equal(zone(plan,'symmetry'),'priority');
assert.deepEqual(plan.priorities.map(p=>p.id),['balance','symmetry','walk']);
assert.ok(plan.priorities.every(p=>p.why.length>40&&p.objective&&p.basis));
assert.equal(plan.priorities[0].objective,'10 s sur chaque pied');
// Reproductibilité : aucun objectif plus petit que la marge d'erreur de sa mesure.
const good=buildLongevityPlan({two_step:{status:'done',value:200,two_step_index:1.2},gait_4m:{status:'done',derived:{gait_speed_ms:1.1}},
 unipodal_left:{status:'done',value:14},unipodal_right:{status:'done',value:30},dynamo_grip:{status:'done',fields:{grip_left_n:300,grip_right_n:310}}},{sex:'female',age:66});
const obj=Object.fromEntries(good.capacities.map(c=>[c.id,c]));
assert.ok(JSON.stringify(good.objectives).includes('indice ≥ 1,3')||good.priorities.some(p=>p.objective.includes('1,3')));
assert.ok(!JSON.stringify(good).match(/\+2 kg|\+10 cm|\+5 s/),'objectifs sous la marge d’erreur interdits');
assert.equal(plan.priorities[2].objective,'Vitesse de marche ≥ 0,99 m/s');
assert.equal(plan.exercises.length,5);
assert.ok(plan.exercises.some(e=>e.key==='chair'),'le lever de chaise reste le socle');
assert.equal(plan.exercises.at(-1).key,'walk');
assert.ok(plan.exercises.every(e=>e.dose&&e.frequency&&e.instructions&&e.caution));
assert.equal(plan.exercises.find(e=>e.key==='stand').dose,'3 × 10 s par côté','dose prudente en zone priorité');
// Seuils limites.
const z=(res,prof)=>Object.fromEntries(assessCapacities(res,prof).capacities.map(c=>[c.id,c.zone]));
assert.equal(z({gait_4m:{status:'done',derived:{gait_speed_ms:0.79}}},{}).walk,'priority');
assert.equal(z({gait_4m:{status:'done',derived:{gait_speed_ms:1.0}}},{}).walk,'solid');
assert.equal(z({sts:{status:'done',value:13}},{sex:'male',age:62}).legs,'priority');
assert.equal(z({sts:{status:'done',value:17}},{sex:'male',age:62}).legs,'solid');
assert.equal(z({sts:{status:'done',value:12}},{sex:'female',age:45}).legs,'consolidate','moins de 60 ans : tranche 60–64');
assert.equal(z({dynamo_grip:{status:'done',fields:{grip_left_n:250,grip_right_n:260}}},{sex:'male'}).strength,'priority','26,5 kg < 27 kg');
assert.equal(z({unipodal_left:{status:'done',value:30},unipodal_right:{status:'done',value:30}},{}).balance,'solid');
assert.equal(z({unipodal_left:{status:'done',value:30},unipodal_right:{status:'done',value:12}},{}).balance,'consolidate');
assert.equal(z({posture:{status:'done',observation:'apparent_offset'}},{}).symmetry,'consolidate');
// Bilan sans mesure : pas de « capacités solides » inventées.
const empty=buildLongevityPlan({},{});
assert.equal(empty.priorities.length,0);
assert.ok(empty.headline.startsWith('Mesures incomplètes'));
// Le passeport porte le plan et les mots du protocole actuel (13 étapes), sans « six épreuves ».
const passport=buildClinicPassport({},r,{date:new Date('2026-11-24T10:00:00Z'),real:true,subject:'Client HIRO-261124-01',
 patient:{sex_at_birth:'female',birth_date:'1953-01-01'}});
assert.equal(passport.longevity.profile.age,73);
assert.equal(passport.steps.total,13);
assert.ok(!JSON.stringify(passport).includes('six épreuves'));
assert.ok(!JSON.stringify(passport).match(/âge du mouvement »? (est|vaut)|Motion Age :/));
assert.deepEqual(passport.priorities.filter(p=>p.zone).map(p=>p.id),['balance','symmetry','walk']);
assert.equal(passport.actionPlan.monitoring.length,3);
const src=await readFile(join(process.cwd(),'site/pulse-v14/motion-live-clinic-passport-pdf-v2.js'),'utf8');
assert.ok(src.includes('function capacites()')&&src.includes('function priorites()'),'pages capacités et priorités dans le PDF');
const consult=await readFile(join(process.cwd(),'site/pulse-v14/motion-live-operator-consult-v1.js'),'utf8');
assert.ok(consult.includes('sex_at_birth')&&consult.includes('moc-capacity'),'console : profil patient transmis et capacités affichées');
console.log('[pulse-longevity-plan-qa] PASS zones par repère publié, 3 priorités, programme maison dosé, objectifs S6, passeport 13 étapes');
