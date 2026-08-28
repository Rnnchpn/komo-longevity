import {readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';

const pulse=join(process.cwd(),'site','pulse-v12');
const homePath=join(pulse,'my-komo-home-v1.js');
const profilePath=join(pulse,'profile-v2.js');
const cssPath=join(pulse,'pulse-ui-v1.css');

let home=await readFile(homePath,'utf8');
let profile=await readFile(profilePath,'utf8');
let css=await readFile(cssPath,'utf8');

// Enrich the existing engagement surface only. Health scores remain separate from XP/KP.
const panelStart=home.indexOf('function engagementPanel(){');
const panelEnd=home.indexOf('\n\nfunction render(){',panelStart);
if(panelStart<0||panelEnd<0)throw new Error('[pulse-daily-engagement] engagement panel contract changed');
const panel=[
"function engagementPanel(){",
"  const e=engagement(),steps=Math.max(0,Number(e.steps)||0),goalPct=Math.min(100,Math.round(steps/10000*100)),pointPct=Math.min(100,(Number(e.xp_total)||0)%1000/10),ch=Array.isArray(e.challenges)?e.challenges:[];",
"  const completed=ch.filter(x=>x.completed).length,challengePct=ch.length?completed/ch.length:0,dailyPct=Math.round(Math.min(1,goalPct/100*.35+challengePct*.65)*100);",
"  const xpRemaining=Math.max(0,120-(Number(e.step_xp)||0))+ch.filter(x=>!x.completed).reduce((sum,x)=>sum+(Number(x.xp_reward)||0),0);",
"  const xpBlock=(Number(e.xp_total)||0)%1000,kpRemaining=xpBlock===0&&Number(e.xp_total)>0?1000:1000-xpBlock;",
"  return`<article class=\"mykomo-engagement\" id=\"komoEngagement\"><section class=\"mykomo-daybar\"><div class=\"mykomo-day-copy\"><small>MY KŌMØ · AUJOURD’HUI</small><h3>Votre journée en mouvement.</h3><p>${completed}/${ch.length||3} défis · ${steps.toLocaleString('fr-FR')} pas · encore ${xpRemaining} XP accessibles aujourd’hui</p></div><div class=\"mykomo-day-metrics\"><div><strong>${dailyPct}<small>%</small></strong><span>Progression du jour</span></div><div><strong>+${Number(e.xp_today)||0}</strong><span>XP aujourd’hui</span></div><div><strong>${Number(e.points)||0}<small> KP</small></strong><span>Solde KŌMØ</span></div><div><strong>${Number(e.streak_days)||0}</strong><span>Jours de série</span></div></div></section><div class=\"mykomo-engagement-head\"><div><small>OBJECTIFS ACTIFS</small><h3>Un peu chaque jour.</h3><p>XP et KŌMØ Points récompensent la régularité. Ils restent volontairement séparés de vos scores Motion et Clinical.</p></div><div class=\"mykomo-today-xp\"><strong>Niv. ${Number(e.level)||1}</strong><span>${Number(e.xp_to_next_level)||500} XP avant le suivant</span></div></div><div class=\"mykomo-engagement-grid\"><section class=\"mykomo-steps\"><div class=\"mykomo-mini-head\"><span>MES PAS</span><b>+${Number(e.step_xp)||0} XP</b></div><div class=\"mykomo-step-number\"><strong>${steps.toLocaleString('fr-FR')}</strong><span>/ 10 000</span></div><div class=\"mykomo-step-track\" style=\"--steps:${goalPct}%\"><i></i></div><small>Prochain palier : ${esc(nextStepMilestone(steps))}</small><div class=\"mykomo-step-input\"><input id=\"myKomoSteps\" inputmode=\"numeric\" type=\"number\" min=\"0\" max=\"100000\" step=\"100\" value=\"${steps}\" aria-label=\"Nombre de pas aujourd'hui\"><button type=\"button\" data-keng-save ${S.busy?'disabled':''}>Enregistrer</button></div><p>Saisie manuelle pour le POC. Une source santé connectée pourra ensuite l’alimenter automatiquement.</p></section><section class=\"mykomo-daily\"><div class=\"mykomo-mini-head\"><span>DÉFIS DU JOUR</span><b>${completed}/${ch.length}</b></div><div class=\"mykomo-challenges\">${ch.length?ch.map(challengeCard).join(''):'<div class=\"mykomo-challenge-empty\">Les défis du jour se chargent…</div>'}</div></section><aside class=\"mykomo-points\"><div class=\"mykomo-mini-head\"><span>KŌMØ POINTS</span><b>FIDÉLITÉ</b></div><strong>${Number(e.points)||0}<small> KP</small></strong><p>Votre prochain palier débloque <b>+50 KP</b>. Les accomplissements du jour font progresser ce compteur via l’XP.</p><div class=\"mykomo-point-track\" style=\"--points:${pointPct}%\"><i></i></div><small>${xpBlock} / 1 000 XP · encore ${kpRemaining} XP avant +50 KP</small><div class=\"mykomo-streak\"><span>🔥 ${Number(e.streak_days)||0} jour${Number(e.streak_days)===1?'':'s'} de série</span><span>Niveau ${Number(e.level)||1}</span></div><p class=\"mykomo-points-note\">Les KP restent pour l’instant un indicateur de fidélité non échangeable. Aucun avantage clinique n’est lié au nombre de points.</p></aside></div></article>`",
"}"
].join('\n');
home=home.slice(0,panelStart)+panel+home.slice(panelEnd);

const topOld='<button type="button" class="mykomo-profile-btn" data-route="profile">Personnaliser mon profil →</button>';
const topNew='<div class="mykomo-top-actions"><span class="mykomo-wallet"><b>${Number(e.points)||0}</b> KP</span><button type="button" class="mykomo-profile-btn" data-route="profile">Mon profil →</button></div>';
if(!home.includes(topOld)&&!home.includes('mykomo-top-actions'))throw new Error('[pulse-daily-engagement] home top action contract changed');
home=home.replace(topOld,topNew);
await writeFile(homePath,home);

// Make Profile a light identity/progression card using the existing engagement RPC.
const loadStart=profile.indexOf('async function load(){');
const loadEnd=profile.indexOf('function completeness',loadStart);
if(loadStart<0||loadEnd<0)throw new Error('[pulse-daily-engagement] profile load contract changed');
const profileLoad="async function load(){const c=sb(),runtime=window.KomoRuntime?.getContext?.(),session=runtime?.session||(await c.auth.getSession()).data?.session;if(!session?.user)return null;const [p,e]=await Promise.all([c.from('profiles').select('*').eq('id',session.user.id).maybeSingle(),c.rpc('komo_engagement_summary')]);return{session,profile:p.data||{id:session.user.id,display_name:'',first_name:'',last_name:'',phone:'',birth_date:null,sex_at_birth:null,city:'',country:'',locale:'fr-FR',newsletter_opt_in:false},engagement:e.error?null:e.data}}\n";
profile=profile.slice(0,loadStart)+profileLoad+profile.slice(loadEnd);
profile=profile.replace("function sb(){if(!client)client=createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});return client}","function sb(){return window.KomoRuntime?.client||(client||(client=createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})))}");
profile=profile.replace('const p=d.profile,c=completeness(p);','const p=d.profile,c=completeness(p),eg=d.engagement||{xp_total:0,xp_today:0,level:1,streak_days:0,points:0};');
const heroEnd='</section><form id="kpvForm" class="kpv-card">';
const heroEnriched='</section><section class="kpv-profile-stats" aria-label="Progression KŌMØ"><div><small>NIVEAU</small><strong>${Number(eg.level)||1}</strong><span>${Number(eg.xp_total)||0} XP cumulés</span></div><div><small>AUJOURD’HUI</small><strong>+${Number(eg.xp_today)||0}<b> XP</b></strong><span>activité & défis</span></div><div><small>KŌMØ POINTS</small><strong>${Number(eg.points)||0}<b> KP</b></strong><span>fidélité</span></div><div><small>SÉRIE</small><strong>${Number(eg.streak_days)||0}<b> j</b></strong><span>régularité</span></div></section><form id="kpvForm" class="kpv-card">';
if(!profile.includes(heroEnd)&&!profile.includes('kpv-profile-stats'))throw new Error('[pulse-daily-engagement] profile hero contract changed');
profile=profile.replace(heroEnd,heroEnriched);
profile=profile.replace("document.querySelector('#pageTitle').textContent='Mes informations';","document.querySelector('#pageTitle').textContent='Mon profil KŌMØ';");
profile=profile.replace(/const obs=new MutationObserver\([\s\S]*?obs\.observe\(document\.body,\{childList:true,subtree:true\}\);/,'window.addEventListener(\'komo:route-ready\',()=>{if(location.hash===\'#profile\')schedule()});window.addEventListener(\'komo:session-ready\',()=>{if(location.hash===\'#profile\')schedule()});');
await writeFile(profilePath,profile);

const polish=`
/* My KŌMØ daily cockpit · canonical-4p2 */
.mykomo-top-actions{display:flex;align-items:center;gap:8px}.mykomo-wallet{display:inline-flex;align-items:baseline;gap:4px;min-height:42px;padding:0 12px;border:1px solid rgba(31,42,34,.10);border-radius:13px;background:rgba(255,255,255,.58);color:#6d756e;font-size:8px;font-weight:700;letter-spacing:.08em}.mykomo-wallet b{color:#263229;font:700 14px/1 Manrope,sans-serif;letter-spacing:-.03em}.mykomo-daybar{display:grid;grid-template-columns:minmax(0,.78fr) minmax(0,1.22fr);gap:20px;align-items:end;margin:-4px -4px 18px;padding:22px;border-radius:22px;background:linear-gradient(135deg,#222b25,#303b33);color:#fff;box-shadow:0 18px 50px rgba(25,34,28,.12)}.mykomo-day-copy small{display:block;margin-bottom:8px;color:rgba(255,255,255,.54);font-size:8px;font-weight:700;letter-spacing:.15em}.mykomo-day-copy h3{margin:0;font:600 clamp(24px,3vw,34px)/1.02 Manrope,sans-serif;letter-spacing:-.045em}.mykomo-day-copy p{margin:9px 0 0;color:rgba(255,255,255,.62);font-size:9px;line-height:1.5}.mykomo-day-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border:1px solid rgba(255,255,255,.10);border-radius:17px;overflow:hidden;background:rgba(255,255,255,.035)}.mykomo-day-metrics>div{min-width:0;padding:14px 13px;border-right:1px solid rgba(255,255,255,.09)}.mykomo-day-metrics>div:last-child{border-right:0}.mykomo-day-metrics strong{display:block;color:#fff;font:600 23px/1 Manrope,sans-serif;letter-spacing:-.055em}.mykomo-day-metrics strong small{font-size:9px;letter-spacing:0;color:rgba(255,255,255,.55)}.mykomo-day-metrics span{display:block;margin-top:6px;color:rgba(255,255,255,.48);font-size:7px;line-height:1.3}.mykomo-points>p b{color:#4c5e51}.mykomo-points{background:linear-gradient(150deg,#f5f1e8,#ebe7dc)}.mykomo-profile-btn{background:#fff}.kpv-profile-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));margin:0 0 16px;border:1px solid rgba(31,42,34,.09);border-radius:20px;overflow:hidden;background:#f8f6f0}.kpv-profile-stats>div{min-width:0;padding:16px 17px;border-right:1px solid rgba(31,42,34,.08)}.kpv-profile-stats>div:last-child{border-right:0}.kpv-profile-stats small{display:block;color:#818781;font-size:7.5px;font-weight:700;letter-spacing:.12em}.kpv-profile-stats strong{display:block;margin-top:9px;color:#263229;font:600 25px/1 Manrope,sans-serif;letter-spacing:-.05em}.kpv-profile-stats strong b{font-size:9px;letter-spacing:0;color:#6e786f}.kpv-profile-stats span{display:block;margin-top:5px;color:#858b85;font-size:7.5px;line-height:1.35}
@media(max-width:900px){.mykomo-daybar{grid-template-columns:1fr}.mykomo-day-metrics{grid-template-columns:repeat(4,1fr)}}
@media(max-width:640px){.mykomo-top-actions{gap:6px}.mykomo-wallet{min-height:38px;padding:0 9px}.mykomo-profile-btn{min-height:38px}.mykomo-daybar{margin:-2px -2px 14px;padding:17px;border-radius:19px;gap:15px}.mykomo-day-copy h3{font-size:25px}.mykomo-day-metrics{grid-template-columns:1fr 1fr}.mykomo-day-metrics>div{padding:12px;border-bottom:1px solid rgba(255,255,255,.08)}.mykomo-day-metrics>div:nth-child(2){border-right:0}.mykomo-day-metrics>div:nth-child(n+3){border-bottom:0}.mykomo-day-metrics strong{font-size:21px}.kpv-profile-stats{grid-template-columns:1fr 1fr;border-radius:17px}.kpv-profile-stats>div{padding:14px}.kpv-profile-stats>div:nth-child(2){border-right:0}.kpv-profile-stats>div:nth-child(-n+2){border-bottom:1px solid rgba(31,42,34,.08)}.kpv-profile-stats strong{font-size:22px}}
`;
if(!css.includes('/* My KŌMØ daily cockpit · canonical-4p2 */'))css+=polish;
await writeFile(cssPath,css);

console.log('[pulse-daily-engagement] daily cockpit + profile progression polish applied');
