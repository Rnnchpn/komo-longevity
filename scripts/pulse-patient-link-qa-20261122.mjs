// QR patient (22/11/2026) : la liste des réponses acceptées par le serveur est exactement celle du modèle,
// la page « Mon bilan » est publiée, la console propose le QR et le lien ne contient ni nom ni e-mail.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import vm from 'node:vm';
import {INTAKE_GROUPS,QUESTION_COUNT} from '../pulse-v14-src/motion-engine/intake-model.mjs';
const root=process.cwd();
const read=p=>readFile(join(root,p),'utf8');
const [edge,page,js,consult,release]=await Promise.all([
 read('supabase/functions/motion-live-test/index.ts'),read('site/pulse-v14/mon-bilan/index.html'),
 read('site/pulse-v14/mon-bilan/mon-bilan.js'),read('site/pulse-v14/motion-live-operator-consult-v1.js'),
 read('scripts/pulse-v14-release.mjs')]);
// 1. Réponses : serveur = modèle (clés, valeurs, nombre maximal).
const choices=Function('return '+edge.match(/const ANSWER_CHOICES:Record<string,string\[\]>=(\{[\s\S]*?\n\});/)[1])();
const ratings=Function('return '+edge.match(/const RATING_KEYS=new Set\((\[[\s\S]*?\])\);/)[1])();
for(const g of INTAKE_GROUPS)for(const q of g.questions){
 if(Array.isArray(q.options[0]))assert.deepEqual(choices[q.id],q.options.map(([k])=>k),'valeurs serveur de '+q.id);
 else{assert.ok(ratings.includes(q.id),'échelle 0–4 acceptée pour '+q.id);assert.equal(q.options.length,5)}
}
const modelIds=INTAKE_GROUPS.flatMap(g=>g.questions.map(q=>q.id));
assert.deepEqual([...Object.keys(choices),...ratings].sort(),[...modelIds].sort(),'aucune clé serveur hors modèle');
assert.equal(QUESTION_COUNT,22);
// 2. Lien patient côté serveur : jeton haché, 30 jours, actions sans compte limitées au lien.
for(const s of ['operator_patient_link','patient_link_status','patient_questionnaire_save','PATIENT_LINK_DAYS=30',
 'contains("progress",{patient_link:{token_hash:tokenHash}})','entered_by:"patient"','results:room.status==="completed"?results:null'])
 assert.ok(edge.includes(s),'serveur : '+s);
assert.ok(edge.indexOf('action==="patient_link_status"')<edge.indexOf('const actor=await operator(req)'),'actions patient avant l’authentification praticien');
// 3. Page « Mon bilan » : publiée, sans référent ni indexation, jeton retiré de l'adresse.
assert.ok(page.includes('name="referrer" content="no-referrer"')&&page.includes('noindex'));
assert.ok(js.includes('history.replaceState(null,"",location.pathname)'),'jeton retiré de la barre d’adresse');
assert.ok(!/email|e-mail|prénom/i.test(js.replace(/\/\/.*$/gm,'')),'aucune demande d’identité');

assert.ok(release.includes("'mon-bilan/index.html'"));
// 4. Console : bouton « QR patient », lien conservé pendant la consultation.
assert.ok(consult.includes('id="mocPatientQrBtn"')&&consult.includes('operator_patient_link')&&consult.includes('komo_patient_qr_'));
console.log('[pulse-patient-link-qa] PASS questionnaire serveur = modèle ('+modelIds.length+' questions dont '+(modelIds.length-QUESTION_COUNT)+' facultatives), lien patient 30 jours sans compte, page Mon bilan, QR dans la console');
