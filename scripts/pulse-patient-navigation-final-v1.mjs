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
  .replace(/\s*<script(?: type="module")? src="\.\/agenda-hub-v4\.js(?:\?[^\"]*)?"><\/script>/g,'')
  .replace(/\s*<script(?: type="module")? src="\.\/agenda-hub-v5\.js(?:\?[^\"]*)?"><\/script>/g,'')
  .replace(/\s*<script src="\.\/agenda-clean-room-v1\.js(?:\?[^\"]*)?"><\/script>/g,'')
  .replace(/\s*<script src="\.\/patient-route-runtime-v1\.js(?:\?[^\"]*)?"><\/script>/g,'')
  .replace(/\s*<script src="\.\/patient-route-runtime-v2\.js(?:\?[^\"]*)?"><\/script>/g,'');

html=html.replace('</body>',`  <script src="./patient-palette-balance-v1.js?v=${release}"></script>\n  <script src="./pulse-bottom-nav-v6.js?v=${release}"></script>\n</body>`);
await writeFile(indexPath,html,'utf8');

await import('./pulse-route-ownership-fix-v2.mjs');

const appPath=join(pulseDir,'app.js');
const cacheSafeApp='app-router-v2.js';
await copyFile(appPath,join(pulseDir,cacheSafeApp));
html=await readFile(indexPath,'utf8');
html=html.replaceAll('./app.js',`./${cacheSafeApp}`);

// Full patient Agenda: compact calendar on the left, colored CARTO map on the right.
const agendaHub='agenda-hub-v4.js';
await copyFile(join(root,'pulse-app',agendaHub),join(pulseDir,agendaHub));
html=html.replace('</body>',`  <script type="module" src="./${agendaHub}?v=20260829-agenda-v4-final"></script>\n</body>`);

// Hide legacy Motion journey/report cards only on Agenda, without disabling them elsewhere.
const cleanRoom='agenda-clean-room-v1.js';
await copyFile(join(root,'pulse-app',cleanRoom),join(pulseDir,cleanRoom));
html=html.replace('</body>',`  <script src="./${cleanRoom}?v=20260829-agenda-clean-1"></script>\n</body>`);

// Final deterministic route activator.
const routeRuntime='patient-route-runtime-v2.js';
await copyFile(join(root,'pulse-app',routeRuntime),join(pulseDir,routeRuntime));
html=html.replace('</body>',`  <script src="./${routeRuntime}?v=20260829-route-runtime-v2"></script>\n</body>`);
await writeFile(indexPath,html,'utf8');

const finalHtml=await readFile(indexPath,'utf8');
const finalApp=await readFile(join(pulseDir,cacheSafeApp),'utf8');
const finalBooking=await readFile(join(pulseDir,'booking-layer-v1.js'),'utf8');
const finalDock=await readFile(join(pulseDir,'pulse-bottom-nav-v6.js'),'utf8');
const finalRuntime=await readFile(join(pulseDir,routeRuntime),'utf8');
const finalAgenda=await readFile(join(pulseDir,agendaHub),'utf8');
const finalClean=await readFile(join(pulseDir,cleanRoom),'utf8');
const checks=[
  ['dock v6 shipped',finalHtml.includes('pulse-bottom-nav-v6.js')],
  ['dock v5 removed',!finalHtml.includes('pulse-bottom-nav-v5.js')],
  ['neutral patient palette shipped',finalHtml.includes('patient-palette-balance-v1.js')],
  ['fresh router bundle shipped',finalHtml.includes(cacheSafeApp)&&!finalHtml.includes('./app.js')],
  ['Motion, My KŌMØ, Club and Trajectoire accepted by app core',finalApp.includes("'motion','mykomo','club','trajectory'")],
  ['modern routes delegated to dedicated owners',finalApp.includes("source:'app-external-owner'")],
  ['Club is a native equal dock route',finalDock.includes("['club','Club','∞','club','']")&&finalDock.includes('repeat(6,minmax(0,1fr))')],
  ['legacy Booking remains available for professional planning',finalBooking.includes('window.KomoBooking')],
  ['hero-only Agenda v5 removed',!finalHtml.includes('agenda-hub-v5.js')],
  ['full Agenda v4 shipped',finalHtml.includes(agendaHub)&&finalAgenda.includes('ag4-workspace')&&finalAgenda.includes('ag4-map')],
  ['Agenda keeps calendar and colored map',finalAgenda.includes('ag4-days')&&finalAgenda.includes('basemaps.cartocdn.com')],
  ['Agenda clean-room shipped after Agenda',finalHtml.indexOf(cleanRoom)>finalHtml.indexOf(agendaHub)],
  ['legacy Motion journey hidden on Agenda',finalClean.includes('[data-kmj1]')],
  ['legacy canonical report hidden on Agenda',finalClean.includes('[data-kcanon-doc]')],
  ['final runtime shipped last',finalHtml.lastIndexOf(routeRuntime)>finalHtml.lastIndexOf(cleanRoom)],
  ['runtime activates Motion',finalRuntime.includes('KomoMotionHubV3?.refresh')],
  ['runtime activates Trajectoire',finalRuntime.includes('KomoTrajectoryV3?.refresh')],
  ['runtime activates Agenda v4',finalRuntime.includes('KomoAgendaHubV4?.refresh')]
];
for(const [label,ok] of checks) console.log(`[pulse-nav-final] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok))process.exit(1);
console.log(`[pulse-nav-final] Agenda restored · hero + calendar + map · legacy Motion cards suppressed · ${release}`);
