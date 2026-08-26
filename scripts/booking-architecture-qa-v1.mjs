import {readFile} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const root=dirname(dirname(fileURLToPath(import.meta.url)));
const [html,booking,bookingCss,pro,proCss,follow,mig,rpc]=await Promise.all([
 readFile(join(root,'pulse-app','index.html'),'utf8'),readFile(join(root,'pulse-app','booking-layer-v1.js'),'utf8'),readFile(join(root,'pulse-app','booking-layer-v1.css'),'utf8'),readFile(join(root,'pulse-app','pro-architecture-v2.js'),'utf8'),readFile(join(root,'pulse-app','pro-architecture-v2.css'),'utf8'),readFile(join(root,'pulse-app','pro-followup-v1.js'),'utf8'),readFile(join(root,'supabase','migrations','202608261100_booking_architecture_v1.sql'),'utf8'),readFile(join(root,'supabase','migrations','202608261101_booking_rpc_v1.sql'),'utf8')
]);
const parseFiles=['booking-layer-v1.js','pro-architecture-v2.js','pro-followup-v1.js'];
const syntax=parseFiles.map(f=>[f,spawnSync(process.execPath,['--check',join(root,'pulse-app',f)],{encoding:'utf8'})]);
const checks=[
 ['all new JavaScript parses',syntax.every(([,r])=>r.status===0)],
 ['planning assets loaded',html.includes('./booking-layer-v1.js')&&html.includes('./booking-layer-v1.css')],
 ['pro architecture assets loaded',html.includes('./pro-architecture-v2.js')&&html.includes('./pro-architecture-v2.css')],
 ['professional mode named Clinical Accès PRO',pro.includes('Clinical Accès PRO')&&pro.includes('CLINICAL ACCÈS PRO')],
 ['Pro navigation has patient management',pro.includes("navItem('patients','Gestion patients'")],
 ['Pro navigation has Planning',pro.includes("navItem('planning','Planning'")],
 ['patient navigation becomes Planning',pro.includes("textContent='Planning'")&&pro.includes('data-route=\\"documents\\"')],
 ['patient navigation hidden in Pro mode',pro.includes('patientD.hidden=pro')&&proCss.includes('.komo-pro-mode .mobile-nav#mobileNav')],
 ['legacy patient tabs absent from Pro navigation',!pro.includes("navItem('tests'")&&!pro.includes("navItem('plan'")&&!pro.includes("navItem('appointments'")],
 ['patient selects center and service',booking.includes('kbookPatientOrg')&&booking.includes('data-kbook-service="motion"')&&booking.includes('data-kbook-service="clinical"')],
 ['patient availability uses canonical slots RPC',booking.includes("rpc('komo_booking_slots'")],
 ['patient booking is transactional RPC',booking.includes("rpc('book_komo_appointment'")],
 ['patient cancellation uses canonical RPC',booking.includes("rpc('cancel_my_komo_appointment'")],
 ['30 minute UX explicit',booking.includes('DISPONIBILITÉS · 30 MIN')&&booking.includes('créneaux de 30 minutes')],
 ['professional weekly planning renders five workdays',booking.includes('Array.from({length:5}')&&bookingCss.includes('repeat(5')],
 ['professional Planning selects center',booking.includes('kbookProOrg')&&booking.includes("localStorage.setItem(ORG_KEY")],
 ['patient management selects center',follow.includes('kfollowOrg')&&follow.includes('Mes patients')],
 ['patient management includes requests',follow.includes('kfollowRequests')&&follow.includes('[data-pir-tab]')],
 ['booking schema defines center services and hours',mig.includes('organization_booking_services')&&mig.includes('organization_booking_hours')],
 ['provider and patient double booking prevented',mig.includes('organization_appointments_provider_slot_active_uq')&&mig.includes('organization_appointments_patient_slot_active_uq')],
 ['Clinical eligibility limited to Clinical scope',mig.includes("p_service='clinical'")&&mig.includes("m.access_scope='clinical'")],
 ['booking RPC links service request to center and professional',rpc.includes("status='scheduled'")&&rpc.includes('assigned_professional_user_id=prof')&&rpc.includes('assigned_organization_id=p_organization_id')],
 ['booking RPC uses advisory transaction lock',rpc.includes('pg_advisory_xact_lock')],
 ['booking styling responsive',bookingCss.includes('@media(max-width:900px)')],
 ['Pro internal tabs visually removed',proCss.includes('.komo-pro-mode .kcp-tabs{display:none!important}')]
];
const failed=checks.filter(([,ok])=>!ok).map(([n])=>n);
if(failed.length){for(const [f,r] of syntax)if(r.status!==0)console.error(`[${f}] ${r.stderr||r.stdout}`);console.error('[booking-architecture-qa-v1] failed: '+failed.join(', '));process.exit(1)}
console.log(`[booking-architecture-qa-v1] ${checks.length} checks passed.`);
