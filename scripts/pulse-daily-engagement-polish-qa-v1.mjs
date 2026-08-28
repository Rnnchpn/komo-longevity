import {readFile} from 'node:fs/promises';
import {join} from 'node:path';

const pulse=join(process.cwd(),'site','pulse-v12');
const [home,profile,css]=await Promise.all([
  readFile(join(pulse,'my-komo-home-v1.js'),'utf8'),
  readFile(join(pulse,'profile-v2.js'),'utf8'),
  readFile(join(pulse,'pulse-ui-v1.css'),'utf8')
]);

const checks=[
 ['daily cockpit exists',home.includes('mykomo-daybar')&&home.includes('Votre journée en mouvement.')],
 ['daily progress separates health and engagement',home.includes('Ils restent volontairement séparés de vos scores Motion et Clinical.')],
 ['daily XP potential shown',home.includes('encore ${xpRemaining} XP accessibles aujourd’hui')],
 ['KOMO Points next reward shown',home.includes('encore ${kpRemaining} XP avant +50 KP')],
 ['wallet visible in My KOMO header',home.includes('mykomo-wallet')&&home.includes('${Number(e.points)||0}</b> KP')],
 ['profile uses shared runtime client',profile.includes('window.KomoRuntime?.client')],
 ['profile reads engagement summary',profile.includes("c.rpc('komo_engagement_summary')")],
 ['profile progression summary exists',profile.includes('kpv-profile-stats')&&profile.includes('KŌMØ POINTS')],
 ['profile no longer watches whole body',!profile.includes('obs.observe(document.body')],
 ['daily cockpit styles included',css.includes('/* My KŌMØ daily cockpit · canonical-4p2 */')&&css.includes('.mykomo-day-metrics')],
 ['mobile daily cockpit layout included',css.includes('@media(max-width:640px)')&&css.includes('.kpv-profile-stats{grid-template-columns:1fr 1fr')]
];
let failed=0;for(const [label,ok] of checks){console.log(`[pulse-daily-engagement-qa] ${ok?'OK':'FAIL'} · ${label}`);if(!ok)failed++}if(failed)process.exit(1);console.log(`[pulse-daily-engagement-qa] ${checks.length} checks passed.`);
