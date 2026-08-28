import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const pulseDir=join(root,'site','pulse-v12');
const indexPath=join(pulseDir,'index.html');
let html=await readFile(indexPath,'utf8');
const release=(html.match(/<meta name="komo-pulse-release" content="([^"]+)"/)||[])[1]||'20260828-canonical-4p8';

html=html
  .replace(/\s*<script src="\.\/pulse-bottom-nav-v5\.js(?:\?[^\"]*)?"><\/script>/g,'')
  .replace(/\s*<script src="\.\/pulse-bottom-nav-v6\.js(?:\?[^\"]*)?"><\/script>/g,'')
  .replace(/\s*<script src="\.\/patient-palette-balance-v1\.js(?:\?[^\"]*)?"><\/script>/g,'')
  .replace(/\s*<script(?: type="module")? src="\.\/agenda-hub-v3\.js(?:\?[^\"]*)?"><\/script>/g,'')
  .replace(/\s*<script src="\.\/patient-route-runtime-v1\.js(?:\?[^\"]*)?"><\/script>/g,'');

html=html.replace('</body>',`  <script src="./patient-palette-balance-v1.js?v=${release}"></script>\n  <script src="./pulse-bottom-nav-v6.js?v=${release}"></script>\n</body>`);
await writeFile(indexPath,html,'utf8');

// Enforce canonical route ownership after every other Pulse post-build has finished.
await import('./pulse-route-ownership-fix-v2.mjs');

// Use a fresh bundle filename so browsers cannot keep an older immutable app.js.
const appPath=join(pulseDir,'app.js');
const cacheSafeApp='app-router-v2.js';
await copyFile(appPath,join(pulseDir,cacheSafeApp));
html=await readFile(indexPath,'utf8');
html=html.replaceAll('./app.js',`./${cacheSafeApp}`);

// Ship redesigned Agenda as the canonical patient owner of #documents.
const agendaHub='agenda-hub-v3.js';
await copyFile(join(root,'pulse-app',agendaHub),join(pulseDir,agendaHub));
html=html.replace('</body>',`  <script type="module" src="./${agendaHub}?v=20260829-agenda-v3-1"></script>\n</body>`);

// Ship the route activator explicitly and load it LAST. It is the final owner hand-off
// for Motion, Trajectoire and Agenda and removes stale route-guard visibility locks.
const routeRuntime='patient-route-runtime-v1.js';
await copyFile(join(root,'pulse-app',routeRuntime),join(pulseDir,routeRuntime));
html=html.replace('</body>',`  <script src="./${routeRuntime}?v=20260829-route-runtime-2"></script>\n</body>`);
await writeFile(indexPath,html,'utf8');

const finalHtml=await readFile(indexPath,'utf8');
const finalApp=await readFile(join(pulseDir,cacheSafeApp),'utf8');
const finalBooking=await readFile(join(pulseDir,'booking-layer-v1.js'),'utf8');
const finalDock=await readFile(join(pulseDir,'pulse-bottom-nav-v6.js'),'utf8');
const finalRuntime=await readFile(join(pulseDir,routeRuntime),'utf8');
const finalAgenda=await readFile(join(pulseDir,agendaHub),'utf8');
const checks=[
  ['dock v6 shipped',finalHtml.includes('pulse-bottom-nav-v6.js')],
  ['dock v5 removed',!finalHtml.includes('pulse-bottom-nav-v5.js')],
  ['neutral patient palette shipped',finalHtml.includes('patient-palette-balance-v1.js')],
  ['fresh router bundle shipped',finalHtml.includes(cacheSafeApp)&&!finalHtml.includes('./app.js')],
  ['Motion, My KŌMØ, Club and Trajectoire accepted by app core',finalApp.includes("'motion','mykomo','club','trajectory'")],
  ['modern routes delegated to dedicated owners',finalApp.includes("source:'app-external-owner'")],
  ['Club is a native equal dock route',finalDock.includes("['club','Club','∞','club','']")&&finalDock.includes('repeat(6,minmax(0,1fr))')],
  ['legacy Booking remains available for professional planning',finalBooking.includes('window.KomoBooking')],
  ['Agenda v3 shipped before final route runtime',finalHtml.includes(agendaHub)&&finalHtml.indexOf(agendaHub)<finalHtml.lastIndexOf(routeRuntime)],
  ['Agenda v3 keeps legacy patient-owner sentinel',finalAgenda.includes('data-kbook-patient')],
  ['Agenda v3 has multi-use cards',finalAgenda.includes('Mes rendez-vous')&&finalAgenda.includes('Trouver un lieu')&&finalAgenda.includes('Consignes & suivi')],
  ['Agenda v3 has colored service map',finalAgenda.includes('basemaps.cartocdn.com')&&finalAgenda.includes('ag3-pin motion')===false&&finalAgenda.includes('markerClass')],
  ['final patient route runtime shipped last',finalHtml.lastIndexOf(routeRuntime)>finalHtml.lastIndexOf(agendaHub)],
  ['runtime explicitly activates Motion',finalRuntime.includes('KomoMotionHubV3?.refresh')],
  ['runtime explicitly activates Trajectoire',finalRuntime.includes('KomoTrajectoryV3?.refresh')],
  ['runtime explicitly activates Agenda v3',finalRuntime.includes('KomoAgendaHubV3?.refresh')],
  ['runtime clears hidden route guards',finalRuntime.includes("classList.remove('kmotion-route-pending','komo-trajectory-pending')")]
];
for(const [label,ok] of checks) console.log(`[pulse-nav-final] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok))process.exit(1);
console.log(`[pulse-nav-final] Motion · Trajectoire · Agenda v3 explicit activation locked · cache-safe router · ${release}`);
