import {readFile,writeFile,copyFile} from 'node:fs/promises';
import {join} from 'node:path';

const root=process.cwd(),pulse=join(root,'site','pulse-v12');
const src=join(root,'pulse-app');
const paths={html:join(pulse,'index.html'),css:join(pulse,'pulse-ui-v1.css'),app:join(pulse,'app.js'),adaptive:join(pulse,'adaptive-shell-v4.js'),booking:join(pulse,'booking-layer-v1.js'),prep:join(pulse,'patient-preparation-hub-v2.js')};

await copyFile(join(src,'patient-score-page-v1.js'),join(pulse,'progression-v2.js'));
await copyFile(join(src,'therapy-page-v1.js'),join(pulse,'patient-v4.js'));
await copyFile(join(src,'patient-assessment-trio-v1.js'),join(pulse,'patient-assessment-trio-v1.js'));

let [html,css,app,adaptive,booking,prep,platformCss]=await Promise.all([
  readFile(paths.html,'utf8'),readFile(paths.css,'utf8'),readFile(paths.app,'utf8'),readFile(paths.adaptive,'utf8'),readFile(paths.booking,'utf8'),readFile(paths.prep,'utf8'),readFile(join(src,'patient-platform-v1.css'),'utf8')
]);

// Tests is an action surface; detailed scores now live exclusively in My KŌMØ Score.
for(const file of ['free-result-v2.js','tests-score-trilogy-v1.js','results-motion-journey-v1.js']){
  const escaped=file.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  html=html.replace(new RegExp(`\\s*<script(?: type="module")? src="\\./${escaped}(?:\\?v=[^\"']+)?"><\\/script>`,'g'),'');
}
if(!html.includes('patient-assessment-trio-v1.js')){
  html=html.replace(/(<script[^>]+src="\.\/tests-v1\.js[^>]*><\/script>)/,`$1\n  <script type="module" src="./patient-assessment-trio-v1.js"></script>`);
}

// Desktop labels keep the existing route ids. Add Therapy to desktop only because
// the prior desktop dock had no plan entry while the phone/iPad shell already did.
app=app.replace(/(\{\s*id:\s*'results',\s*label:\s*')[^']+(')/g,"$1Tests$2");
app=app.replace(/(\{\s*id:\s*'path',\s*label:\s*')[^']+(')/g,"$1My KŌMØ Score$2");
app=app.replace(/(\{\s*id:\s*'documents',\s*label:\s*')[^']+(')/g,"$1Agenda et réseau$2");
if(!/id:\s*'plan'\s*,\s*label:/.test(app)){
  const pathRoute=/(\{\s*id:\s*'path'\s*,\s*label:\s*'My KŌMØ Score'\s*,\s*icon:\s*icons\.path\s*\}\s*,?)/;
  if(!pathRoute.test(app))throw new Error('[pulse-patient-platform] path route contract changed');
  app=app.replace(pathRoute,`$1\n  { id: 'plan', label: 'KŌMØ Therapy', icon: icons.path },`);
}else{
  app=app.replace(/(\{\s*id:\s*'plan',\s*label:\s*')[^']+(')/g,"$1KŌMØ Therapy$2");
}
app=app.replace(/path:\s*\['[^']*','[^']*'\]/,"path:['MY KŌMØ SCORE','Vos résultats, clairement.']");
app=app.replace(/documents:\s*\['[^']*','[^']*'\]/,"documents:['AGENDA ET RÉSEAU','Vos consultations et le réseau KŌMØ.']");
app=app.replace(/plan:\s*\['[^']*','[^']*'\]/,"plan:['KŌMØ THERAPY','Votre plan de soins et vos rappels.']");
app=app.replace(/plan:\s*'\[data-patient-v4="plan"\]'/,"plan:'[data-therapy-page]'");
await writeFile(paths.app,app);

// Phone/iPad shell: explicit user-requested labels, unchanged routes.
adaptive=adaptive.replace("actionButton('Rendez-vous','patient:documents')","actionButton('Agenda et réseau','patient:documents')");
adaptive=adaptive.replace("navItem('patient:path','Résultats'","navItem('patient:path','My KŌMØ Score'");
adaptive=adaptive.replace("navItem('patient:plan','Suivi'","navItem('patient:plan','KŌMØ Therapy'");
await writeFile(paths.adaptive,adaptive);

// Patient appointment requests become pending until a center professional confirms them.
booking=booking.replace("scheduled:'Planifié'","scheduled:'En attente de validation'");
if(!booking.includes("sessionStorage.getItem('komo_booking_service')")){
  booking=booking.replace('async function loadPatient(){',"async function loadPatient(){const requested=sessionStorage.getItem('komo_booking_service');if(['motion','clinical'].includes(requested)){S.patientService=requested;sessionStorage.removeItem('komo_booking_service')}");
}
booking=booking.replace("document.querySelector('#pageEyebrow').textContent='PLANNING';document.querySelector('#pageTitle').textContent='Choisissez votre prochain rendez-vous.'","document.querySelector('#pageEyebrow').textContent='AGENDA ET RÉSEAU';document.querySelector('#pageTitle').textContent='Vos consultations et le réseau KŌMØ.'");
booking=booking.replace('KŌMØ PULSE · PLANNING','KŌMØ PULSE · AGENDA ET RÉSEAU');
booking=booking.replace('Réserver votre prochaine mesure.','Choisir un centre et demander un rendez-vous.');
booking=booking.replace('Choisissez un centre, le type de rendez-vous puis un créneau de 30 minutes. Le rendez-vous est immédiatement partagé avec l’équipe du centre.','Choisissez un centre, le type de bilan puis un créneau. Votre demande est ensuite validée par le professionnel avant l’ouverture des questionnaires pré-consultation.');
booking=booking.replace(/Confirmer ce créneau \?/g,'Envoyer cette demande ?');
booking=booking.replace("notify('Rendez-vous confirmé.')","notify('Demande envoyée au centre. Vous serez informé après validation.')");
booking=booking.replace("class=\"${a.appointment_type}\"><strong>${esc(patientName(a.patients))}</strong><span>${a.appointment_type==='clinical'?'Clinical':'Motion'}</span><small>${esc(apptStatus(a.status))}</small></button>","class=\"${a.appointment_type} ${a.status}\" data-kbook-appointment=\"${a.id}\" data-kbook-status=\"${a.status}\"><strong>${esc(patientName(a.patients))}</strong><span>${a.appointment_type==='clinical'?'Clinical':'Motion'}</span><small>${esc(apptStatus(a.status))}</small>${a.status==='scheduled'?`<span class=\"kbook-pending-action\" data-kbook-confirm=\"${a.id}\">Valider la consultation</span>`:''}</button>");
booking=booking.replace("function bindPro(){document.querySelector('#kbookProOrg')","async function approveProAppointment(id){const q=await sb().rpc('approve_komo_appointment',{p_appointment_id:id});if(q.error){notify('Impossible de valider cette consultation.');return}notify('Consultation validée. Les questionnaires pré-consultation sont maintenant accessibles au patient.');window.dispatchEvent(new CustomEvent('komo:appointment-updated',{detail:{appointmentId:id,status:'confirmed'}}));await loadProWeek()}\nfunction bindPro(){document.querySelectorAll('[data-kbook-confirm]').forEach(x=>x.addEventListener('click',async e=>{e.preventDefault();e.stopPropagation();await approveProAppointment(x.dataset.kbookConfirm)}));document.querySelector('#kbookProOrg')");
await writeFile(paths.booking,booking);

// Pre-consultation questionnaires are genuinely gated by professional confirmation.
prep=prep.replace(".in('status',['scheduled','confirmed','arrived','in_progress'])",".in('status',['confirmed','arrived','in_progress'])");
prep=prep.replace("wrap.querySelector('[data-kph2-next]')?.addEventListener('click',()=>d.appointments[0]?.appointment_type==='clinical'?openClinical(d.appointments[0]):openMotion())","wrap.querySelector('[data-kph2-next]')?.addEventListener('click',()=>d.appointments[0]?.appointment_type==='clinical'?openClinical(d.appointments[0]):openMotion());const requested=sessionStorage.getItem('komo_open_preparation');if(requested){sessionStorage.removeItem('komo_open_preparation');setTimeout(()=>requested==='clinical'?openClinical(d.clinical):openMotion(),120)}");
prep=prep.replace("if(top)top.textContent='KŌMØ · RENDEZ-VOUS';if(title)title.textContent='Préparez et planifiez vos consultations.'","if(top)top.textContent='AGENDA ET RÉSEAU';if(title)title.textContent='Vos consultations et le réseau KŌMØ.'");
await writeFile(paths.prep,prep);

// Bundle the new visual system once, after old stylesheet layers.
css=css.replace(/\n\/\* KŌMØ Pulse patient platform v1 \*\/[\s\S]*?(?=\n\/\* Canonical Pulse shell ownership \*\/|$)/,'');
css+=`\n${platformCss}\n`;
await writeFile(paths.css,css);

// Main-site explainer window for the three assessment cards.
const pulsePublic=join(root,'site','fr','pulse','index.html');
let publicHtml=await readFile(pulsePublic,'utf8');
publicHtml=publicHtml.replace(/\s*<!-- KŌMØ assessment explainer v1 -->[\s\S]*?<!-- \/KŌMØ assessment explainer v1 -->/g,'');
const explainer=`\n<!-- KŌMØ assessment explainer v1 -->\n<style id="komoAssessmentExplainerStyle">.kae-back{position:fixed;inset:0;z-index:99999;display:none;place-items:center;padding:24px;background:rgba(24,30,26,.55);backdrop-filter:blur(14px)}.kae-back.open{display:grid}.kae-modal{width:min(760px,96vw);max-height:88vh;overflow:auto;padding:31px;border-radius:29px;background:#f8f5ee;box-shadow:0 35px 120px rgba(0,0,0,.25);color:#26332b}.kae-top{display:flex;justify-content:space-between;gap:18px}.kae-top small{font-size:10px;letter-spacing:.13em}.kae-top button{border:0;width:40px;height:40px;border-radius:50%;background:#e8e4dc;font-size:22px;cursor:pointer}.kae-modal h2{margin:11px 0 10px;font-size:42px;letter-spacing:-.05em}.kae-modal>p{color:#6f7870;line-height:1.65}.kae-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-top:24px}.kae-grid div{padding:17px;border-radius:17px;background:#fff;border:1px solid #e7e2d9}.kae-grid b{display:block;margin-bottom:6px;font-size:13px}.kae-grid span{font-size:11px;color:#747d75;line-height:1.5}.kae-note{margin-top:18px;padding:14px;border-radius:14px;background:#e9eee8;font-size:11px}.kae-cta{display:inline-flex;margin-top:18px;padding:12px 15px;border-radius:12px;background:#26342b;color:#fff;text-decoration:none;font-size:11px;font-weight:700}@media(max-width:650px){.kae-modal{padding:23px}.kae-modal h2{font-size:32px}.kae-grid{grid-template-columns:1fr}}</style>\n<div class="kae-back" id="komoAssessmentExplainer"><section class="kae-modal" role="dialog" aria-modal="true"><div class="kae-top"><small>KŌMØ · COMPRENDRE LE BILAN</small><button type="button" aria-label="Fermer">×</button></div><div id="komoAssessmentExplainerBody"></div></section></div>\n<script>(()=>{const data={start:{title:'KŌMØ Start',lead:'Le point de départ accessible à tous, directement dans Pulse.',items:[['Questionnaire','Votre mobilité et vos difficultés actuelles.'],['Chair Stand · 30 s','Une mesure simple de force-endurance fonctionnelle.'],['Two-Step','Un repère de mobilité basé sur deux grands pas.']],note:'Résultat de dépistage non diagnostique. Il sert de première référence avant une évaluation plus complète.'},motion:{title:'KŌMØ Motion',lead:'L’évaluation instrumentée de votre mouvement et de votre fonction musculaire.',items:[['Avant la consultation','Six sections pré-consultation complétées dans Pulse après validation du rendez-vous.'],['Au centre','Acquisition avec la KŌMØ Case / Myodev et mesure de posture SVA.'],['Résultat','Motion Score, mobilité, symétrie musculaire et mesures descriptives validées avant publication.']],note:'Le Motion Score actuellement utilisé dans le POC est versionné et non diagnostique.'},clinical:{title:'KŌMØ Clinical',lead:'La lecture médicale qui met vos résultats dans leur contexte clinique.',items:[['Pré-consultation','Motif, évolution récente, traitements et documents utiles.'],['Consultation','Examen, posture et données complémentaires lorsque celles-ci sont indiquées.'],['Après','Interprétation médicale, priorités et construction de KŌMØ Therapy.']],note:'Clinical est une interprétation professionnelle : aucun score numérique artificiel n’est généré dans la version actuelle.'}};const p=new URLSearchParams(location.search).get('assessment'),d=data[p];if(!d)return;const back=document.querySelector('#komoAssessmentExplainer'),body=document.querySelector('#komoAssessmentExplainerBody');body.innerHTML='<h2>'+d.title+'</h2><p>'+d.lead+'</p><div class="kae-grid">'+d.items.map(x=>'<div><b>'+x[0]+'</b><span>'+x[1]+'</span></div>').join('')+'</div><div class="kae-note">'+d.note+'</div><a class="kae-cta" href="https://pulse.komolongevity.com/#results">Accéder à KŌMØ Pulse →</a>';back.classList.add('open');const close=()=>{back.classList.remove('open');const u=new URL(location.href);u.searchParams.delete('assessment');history.replaceState(null,'',u.pathname+u.search+u.hash)};back.querySelector('button').onclick=close;back.addEventListener('click',e=>{if(e.target===back)close()})})();</script>\n<!-- /KŌMØ assessment explainer v1 -->`;
publicHtml=publicHtml.replace('</body>',`${explainer}\n</body>`);
await writeFile(pulsePublic,publicHtml);

await writeFile(paths.html,html);
console.log('[pulse-patient-platform] Tests + My KŌMØ Score + KŌMØ Therapy + Agenda et réseau finalized');
