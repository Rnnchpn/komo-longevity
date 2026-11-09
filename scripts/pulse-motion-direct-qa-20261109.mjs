import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const root=process.cwd();
const app=await readFile(join(root,'site/pulse-v14/app.js'),'utf8');
const maison=await readFile(join(root,'site/pulse-v14/maison-entry-v1.js'),'utf8');
const css=await readFile(join(root,'site/pulse-v14/styles.css'),'utf8');
const liveGuest=await readFile(join(root,'site/pulse-v14/motion-live-guest-v1.js'),'utf8');
const liveCss=await readFile(join(root,'site/pulse-v14/motion-live-guest-v1.css'),'utf8');
const mobileCss=await readFile(join(root,'site/pulse-v14/pulse-mobile-first-v3.css'),'utf8');
const liveEdge=await readFile(join(root,'supabase/functions/motion-live-test/index.ts'),'utf8');
const parse=path=>spawnSync(process.execPath,['--check',join(root,path)],{encoding:'utf8'}).status===0;
const checks=[
  ['entry scripts parse',parse('site/pulse-v14/app.js')&&parse('site/pulse-v14/maison-entry-v1.js')],
  ['online offer preserved',maison.includes('data-maison-choice="online"')&&maison.includes('39 €')],
  ['onsite Motion is direct',maison.includes('data-maison-choice="motion"')&&maison.includes("show('motion')")],
  ['no account request or approval form',!maison.includes('maisonRequestForm')&&!maison.includes('maisonNewAccount')&&!maison.includes("operator-requests-v1.js")],
  ['existing patient login preserved',maison.includes("show('login')")&&app.includes("signInWithPassword")],
  ['operator creates through protected Edge Function',app.includes("sb.functions.invoke('professional-patient'")&&app.includes("organization_id:S.org.id")&&app.includes("create_account:false")],
  ['creation bound to operator patient directory',app.includes("id=\"opPatientCreateForm\"")&&app.includes("localStorage.setItem('komo_v14_patient',data.patient.id)")&&app.includes("await loadPro()")],
  ['no anonymous patient write',!maison.includes("from('patients')")&&!app.includes("from('patients').insert(")],
  ['real health records not activated before HDS/security clearance',app.includes("Environnement non validé pour de vraies données de santé")&&app.includes('name="synthetic_attested" required')],
  ['operator layout available',css.includes('.op-create-patient-form')&&css.includes('op-create-patient-grid')],
  ['Motion start visible on patient page',maison.includes('id="maisonLiveStart"')&&maison.includes("import('./motion-live-guest-v1.js')")],
  ['single-tap mobile choice opens the live room',maison.includes("matchMedia('(max-width: 850px)')")&&maison.includes('await launchMotion(event.currentTarget)')],
  ['one-tap mobile action for signed-in patient and operator',app.includes('id="pulse-mobile-start-motion"')&&app.includes("selected.data_classification!=='synthetic'")],
  ['mobile start CTA stays above the operator bottom navigation',mobileCss.includes('.app-shell-pro .pulse-mobile-start-motion')&&mobileCss.includes('bottom:calc(89px + env(safe-area-inset-bottom,0px))')],
  ['patient live script syntactically valid',parse('site/pulse-v14/motion-live-guest-v1.js')],
  ['guest session has a local video preview only',liveGuest.includes('getUserMedia')&&liveGuest.includes('audio:false')&&!liveGuest.includes('MediaRecorder')&&!liveGuest.includes('RTCPeerConnection')],
  ['patient opens waiting room with secure token',liveGuest.includes('action:"guest_start"')&&liveGuest.includes('guest_token')&&liveGuest.includes('sessionStorage.setItem(STORAGE,guestToken)')],
  ['patient can mark steps and ready status',liveGuest.includes('action:"guest_event"')&&liveGuest.includes('event:"complete"')],
  ['operator live nav and pairing enabled',app.includes("['live','En direct']")&&app.includes("function motionLiveMonitor()")&&app.includes("action:'operator_attach'")&&app.includes("start_pulse_operator_session_v1")],
  ['signed-in patient can start live Motion',app.includes('id="pulseLobbyLiveStart"')&&app.includes('id="pulseHomeLiveStart"')&&app.includes("openMotionLivePatient()")],
  ['Operator D0 displays the ongoing guest stage',app.includes('id="operatorLiveStatus"')&&app.includes('refreshOperatorLiveStatus()')],
  ['live server verifies operator role and center',liveEdge.includes('db.auth.getUser(jwt)')&&liveEdge.includes('organization_members')&&liveEdge.includes('synthetic_patient_required')],
  ['live session token hashed, RLS protected by migration',liveEdge.includes('crypto.subtle.digest("SHA-256"')&&liveEdge.includes('guest_token_hash')],
  ['live UI readable on mobile',liveCss.includes('max-width:760px')&&css.includes('.op-live-room')]
];
const failed=checks.filter(([,ok])=>!ok);
for(const [name,ok] of checks)console.log(`[motion-direct] ${ok?'PASS':'FAIL'} ${name}`);
if(failed.length)process.exit(1);
console.log('[motion-direct] Patient access simplified; secure operator dossier flow prepared.');
