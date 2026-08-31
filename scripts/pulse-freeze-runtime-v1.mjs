import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const pulse=join(root,'site','pulse-v12');
const read=name=>readFile(join(pulse,name),'utf8');
const write=(name,src)=>writeFile(join(pulse,name),src,'utf8');

async function patch(name,fn){
  const before=await read(name);
  const after=fn(before);
  if(after===before)console.warn(`[pulse-freeze-v1] no change · ${name}`);
  await write(name,after);
}

// 1. Final runtime surface list: legacy Therapy and the obsolete My KŌMØ v3 Club injector are not shipped.
await patch('index.html',html=>html
  .replace(/\s*<script[^>]+src="\.\/patient-v4\.js(?:\?[^\"]*)?"[^>]*><\/script>/g,'')
  .replace(/\s*<script[^>]+src="\.\/my-komo-club-entry-v1\.js(?:\?[^\"]*)?"[^>]*><\/script>/g,''));

// 2. Results: canonical terminology and canonical destinations only. Results no longer injects a duplicate block into Mon compte.
await patch('patient-canonical-results.js',src=>src
  .replaceAll('data-route="path"','data-route="trajectory"')
  .replaceAll('MY KŌMØ SCORE · INTERPRÉTATION UNIQUE','KŌMØ MOTION · INTERPRÉTATION')
  .replaceAll('Pulse Free','KŌMØ Check')
  .replaceAll('Niveau Free','repère KŌMØ Check')
  .replace("if(hash==='#profile')renderAccount(result);",'')
  .replace("if(h==='#profile'&&!document.querySelector('[data-kcanon-account]'))schedule(false);",''));

// 3. Trajectory + My KŌMØ: one product vocabulary and no emitted legacy aliases.
await patch('trajectory-v3.js',src=>src
  .replaceAll('KŌMØ Age','Motion Age')
  .replaceAll('estimation fonctionnelle v0.1','estimation fonctionnelle de l’âge locomoteur'));
await patch('my-komo-stable-v5.js',src=>src
  .replaceAll('data-mkv5-route="path"','data-mkv5-route="trajectory"')
  .replaceAll('Âge locomoteur','Motion Age'));

// 4. Feature modules cannot own global navigation. Club and Messages keep their pages but stop rewriting shared chrome.
await patch('club-hub-v1.js',src=>src.replace(/function nav\(\)\{[\s\S]*?\}\nasync function hydrate/,'function nav(){styles()}\nasync function hydrate'));
await patch('care-messaging-v2.js',src=>src.replace(/function ensureNav\(\)\{[\s\S]*?\}\nasync function loadRecords/,'function ensureNav(){}\nasync function loadRecords'));

// 5. Patient account: remove infrastructure jargon while preserving the same data/rights functions.
await patch('profile-v2.js',src=>src
  .replaceAll('Sexe de référence *','Sexe à la naissance *')
  .replaceAll('Votre adresse de connexion reste gérée par Supabase Auth.','Votre adresse e-mail est utilisée pour sécuriser l’accès à votre compte Pulse.'));
await patch('account-privacy-v1.js',src=>src
  .replaceAll('Obtenez une copie structurée des données personnelles rattachées à votre compte Pulse. Le fichier est stocké dans un espace privé et le lien de téléchargement n’est créé qu’à votre demande.','Obtenez une copie des données personnelles rattachées à votre compte Pulse. Le fichier est préparé dans un espace privé et le lien de téléchargement n’est créé qu’à votre demande.')
  .replaceAll('Le paquet self-service contient les données structurées et les restitutions libérées. Les fichiers binaires sources sont listés par métadonnées mais ne sont pas intégrés automatiquement au JSON.','La copie contient les données de votre compte et les restitutions disponibles. Certains fichiers sources peuvent nécessiter une demande complémentaire.')
  .replaceAll('Demander une nouvelle copie structurée de vos données Pulse ?','Demander une nouvelle copie de vos données Pulse ?'));

// 6. Centre: professional language only; implementation details stay out of the operator UI.
await patch('clinical-cockpit-v1.js',src=>src
  .replaceAll('+ Patient test','Nouveau patient')
  .replaceAll('Contrat canonique','Données MyoCare')
  .replaceAll('Excel / CSV / JSON restent des transports.','Chaque acquisition conserve sa provenance, sa version et son statut de contrôle qualité.')
  .replaceAll('<strong>SHA-256</strong><span>idempotence</span>','<strong>Traçabilité</strong><span>provenance conservée</span>')
  .replaceAll('<strong>Supabase</strong><span>source de vérité</span>','<strong>Contrôle qualité</strong><span>statut explicite</span>')
  .replaceAll('<strong>Références Myodev</strong><span>non verrouillées</span>','<strong>Références Myodev</strong><span>selon la version du dispositif</span>')
  .replaceAll('Fail closed','Validation requise')
  .replaceAll('KŌMØ Start','KŌMØ Check')
  .replaceAll("<option value=\"follow_up\">Follow-up</option>","<option value=\"follow_up\">Suivi</option>")
  .replaceAll("<option value=\"discovery\">Discovery</option>","<option value=\"discovery\">Découverte</option>"));

// 7. Admin: consistent French role vocabulary and no regulatory shorthand in UI copy.
await patch('admin-console-v2.js',src=>src
  .replace("function scopeLabel(v){return v==='motion'?'Motion Operator':'Clinical Practitioner'}","function scopeLabel(v){return v==='motion'?'Opérateur Motion':'Professionnel Clinical'}")
  .replaceAll('Motion intake','Demandes Motion')
  .replaceAll('Motion sans RPPS ou Clinical avec identifiant professionnel vérifiable.','Vérifiez le périmètre d’accès et, pour Clinical, l’identifiant professionnel requis avant activation.')
  .replaceAll('Rôle Operator par défaut. Accès Motion + MyoCare, sans validation Clinical.','Rôle opérateur par défaut. Accès Motion + MyoCare, sans validation Clinical.'));

// 8. Authentication: one editorial contract on every viewport. Remove the desktop-only copy enhancer.
await patch('auth-login-canonical.js',src=>{
  const marker='/* KŌMØ Pulse — desktop authentication enhancer v1';
  const i=src.indexOf(marker);
  return i>=0?src.slice(0,i).trimEnd()+'\n':src;
});

// 9. Assertions: fail the build if an old visible surface or viewport-specific editorial fork survives.
const index=await read('index.html');
const results=await read('patient-canonical-results.js');
const trajectory=await read('trajectory-v3.js');
const mykomo=await read('my-komo-stable-v5.js');
const key=await read('key-hub-v1.js');
const adaptive=await read('adaptive-shell-v4.js');
const mobile=await read('mobile-runtime-v3.js');
const messages=await read('care-messaging-v2.js');
const club=await read('club-hub-v1.js');
const profile=await read('profile-v2.js');
const privacy=await read('account-privacy-v1.js');
const clinical=await read('clinical-cockpit-v1.js');
const admin=await read('admin-console-v2.js');
const auth=await read('auth-login-canonical.js');

const checks=[
  ['Therapy runtime removed',!index.includes('patient-v4.js')],
  ['obsolete My KŌMØ Club injector removed',!index.includes('my-komo-club-entry-v1.js')],
  ['Results emits no path alias',!results.includes('data-route="path"')],
  ['Results no longer injects profile result duplicate',!results.includes("if(hash==='#profile')renderAccount(result)")],
  ['Motion Age naming is canonical',trajectory.includes('Motion Age')&&mykomo.includes('Motion Age')&&!trajectory.includes('KŌMØ Age')&&!mykomo.includes('Âge locomoteur')],
  ['My KŌMØ emits trajectory directly',!mykomo.includes('data-mkv5-route="path"')&&mykomo.includes('data-mkv5-route="trajectory"')],
  ['KEY does not mutate Home',!key.includes('homeTabs(')],
  ['adaptive patient navigation emits no path/plan',!adaptive.includes("patient:path")&&!adaptive.includes("patient:plan")&&!adaptive.includes('KŌMØ Therapy')],
  ['mobile Results has no editorial rewrite',!mobile.includes('mobileGuided')&&!mobile.includes('Trois étapes.<br><em>Votre première référence.</em>')],
  ['Messages no longer writes shared nav',messages.includes('function ensureNav(){}')],
  ['Club no longer writes shared nav',club.includes('function nav(){styles()}')],
  ['Profile hides auth provider detail',!profile.includes('Supabase Auth')],
  ['Privacy copy hides transport format jargon',!privacy.includes('paquet self-service')&&!privacy.includes('automatiquement au JSON')],
  ['Clinical hides implementation jargon',!clinical.includes('Fail closed')&&!clinical.includes('Supabase</strong><span>source de vérité')&&!clinical.includes('SHA-256</strong><span>idempotence')],
  ['Admin uses final role vocabulary',admin.includes('Opérateur Motion')&&admin.includes('Professionnel Clinical')],
  ['Auth content is viewport-neutral',!auth.includes('MEMBER ACCESS')&&!auth.includes('WEB · 2026.08')&&!auth.includes('desktop authentication enhancer v1')]
];
for(const [label,ok] of checks)console.log(`[pulse-freeze-v1] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok))process.exit(1);
console.log(`[pulse-freeze-v1] PASS · ${checks.length}/${checks.length} freeze assertions`);
