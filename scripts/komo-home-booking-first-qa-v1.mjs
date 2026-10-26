import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
const home=await readFile(join(process.cwd(),'site','index.html'),'utf8');
const checks=[
 ['primary booking button visible above fold',home.includes('class="kbh-primary" href="#consultations"')],
 ['header booking shortcut',home.includes('class="kbh-header-cta" href="#consultations"')],
 ['mobile bottom dock',home.includes('class="kbh-mobile-dock"')&&home.includes('env(safe-area-inset-bottom)')],
 ['Centré Paris card',home.includes('Consultation Paris')&&home.includes('Centré</h3>')],
 ['Paris Acuity correct',home.includes('href="https://app.acuityscheduling.com/schedule.php?owner=40696577"')],
 ['Cannes separate request',home.includes('Consultation Cannes')&&home.includes('subject=Demande%20de%20consultation%20KOMO%20Cannes')],
 ['Cannes does not use Paris calendar',home.includes('Demander un créneau')&&home.includes('href="mailto:contact@komolongevity.com')],
 ['Pulse login CTA',home.includes('J’ai déjà un compte Pulse')&&home.includes('https://pulse.komolongevity.com/')],
 ['clear onboarding steps',home.includes('Je réserve')&&home.includes('Je reçois ma confirmation')&&home.includes('J’accède à Pulse')],
 ['exactly two booking cards',(home.match(/class="kbh-card kbh-card--/g)||[]).length===2],
 ['no fake Planity URL',!home.includes('href="https://www.planity.com/')&&!home.includes('href="https://planity.com/')],
 ['outdated hero removed',!home.includes('Bienvenue chez KŌMØ Longevity</h1>')&&!home.includes('biomarqueurs sanguins</span></article>')],
 ['preserve HD hero',home.includes('/assets/images/komo-hero-hd-v4.webp')],
 ['accessibility',home.includes('aria-label="Consultations KŌMØ Paris et Cannes"')&&home.includes('prefers-reduced-motion')],
 ['no fictitious availability or Cannes time',!home.includes('Places disponibles aujourd’hui')&&!home.includes('Cannes · Ouvert maintenant')],
 ['keep other pages',home.includes('id="solutions"')&&home.includes('KŌMØ Motion')]
];
const failed=checks.filter(([_,ok])=>!ok).map(([name])=>name);
if(failed.length){console.error('[komo-home-booking-qa] FAIL '+failed.join(', '));process.exit(1)}
console.log('[komo-home-booking-qa] '+checks.length+' checks passed');