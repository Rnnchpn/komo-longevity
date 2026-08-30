import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const target=join(root,'site','pulse-v12');
const RELEASE='20260830-report-beige-editorial-v10';

async function patch(name,replacements){
  const path=join(target,name);
  let text=await readFile(path,'utf8');
  for(const [re,value] of replacements) text=text.replace(re,value);
  await writeFile(path,text,'utf8');
}

// Patient side: all PDF entry points resolve to the same complete Mobility Report.
await patch('index.html',[
  [/canonical-report-export-v[23]\.js\?v=[^\"]+/g,`canonical-report-export-v3.js?v=${RELEASE}`],
  [/report-bootstrap-v1\.js\?v=[^\"]+/g,`report-bootstrap-v1.js?v=${RELEASE}`]
]);
await patch('report-bootstrap-v1.js',[
  [/report-patient-ui-v1\.js(?:\?v=[^'\"]+)?/g,`report-patient-ui-v1.js?v=${RELEASE}`],
  [/mobility-report-pdf-v[123]\.js(?:\?v=[^'\"]+)?/g,`mobility-report-pdf-v3.js?v=${RELEASE}`]
]);
await patch('report-patient-ui-v1.js',[
  [/mobility-report-pdf-v[123]\.js(?:\?v=[^'\"]+)?/g,`mobility-report-pdf-v3.js?v=${RELEASE}`]
]);
await patch('canonical-report-export-v3.js',[
  [/mobility-report-pdf-v[123]\.js(?:\?v=[^'\"]+)?/g,`mobility-report-pdf-v3.js?v=${RELEASE}`]
]);

// Restore the earlier warm beige editorial language while preserving the new 10-page standalone renderer.
await patch('mobility-report-pdf-v3.js',[
  [/const VERSION='[^']+';/,`const VERSION='4.1.0';`],
  [/const VISUAL_SYSTEM='[^']+';/,`const VISUAL_SYSTEM='komo-beige-editorial-2026';`],
  [/const C=\{paper:\[[^\n]+?rosePale:\[[^\]]+\]\};/,`const C={paper:[247,244,237],paper2:[241,236,226],white:[252,249,243],ink:[35,32,28],deep:[43,46,40],muted:[108,103,95],line:[211,204,193],sage:[113,124,109],sage2:[145,152,139],sagePale:[233,229,219],sand:[231,224,212],warm:[242,233,218],amber:[151,123,78],amberPale:[246,238,222],rose:[138,98,84],rosePale:[247,235,230]};`],
  [/setFill\(C\.deep\);doc\.rect\(0,0,W,10,'F'\);/,`setFill(C.sand);doc.rect(0,0,W,10,'F');`],
  [/setFill\(C\.deep\);doc\.roundedRect\(M,76,70,57,4,4,'F'\);label\('KŌMØ SCORE',M\+7,88,C\.sage2\);serif\(38,'normal',C\.white\);doc\.text\(score===null\?'—':String\(Math\.round\(score\)\),M\+7,111\);sans\(8,'normal',C\.white\);if\(score!==null\)doc\.text\('\/100',M\+43,111\);sans\(5\.6,'normal',C\.sage2\);doc\.text\(lines\(summary\.interpretation\|\|'Profil locomoteur',55\),M\+7,122\);/,`setFill(C.sand);doc.roundedRect(M,76,70,57,4,4,'F');label('KŌMØ SCORE',M+7,88,C.muted);serif(38,'normal',C.deep);doc.text(score===null?'—':String(Math.round(score)),M+7,111);sans(8,'normal',C.deep);if(score!==null)doc.text('/100',M+43,111);sans(5.6,'normal',C.muted);doc.text(lines(summary.interpretation||'Profil locomoteur',55),M+7,122);`],
  [/setFill\(C\.deep\);doc\.roundedRect\(M,78,76,58,4,4,'F'\);label\('VITESSE DE MARCHE',M\+7,90,C\.sage2\);serif\(30,'normal',C\.white\);doc\.text\(speed,M\+7,115\);sans\(5\.5,'normal',C\.sage2\);doc\.text\(g\.speed\?\.statusLabel\|\|'Repère actuel',M\+7,126\);/,`setFill(C.sand);doc.roundedRect(M,78,76,58,4,4,'F');label('VITESSE DE MARCHE',M+7,90,C.muted);serif(30,'normal',C.deep);doc.text(speed,M+7,115);sans(5.5,'normal',C.muted);doc.text(g.speed?.statusLabel||'Repère actuel',M+7,126);`],
  [/setFill\(C\.deep\);doc\.roundedRect\(M,78,78,52,4,4,'F'\);label\('POSTURE',M\+7,90,C\.sage2\);serif\(25,'normal',C\.white\);doc\.text\(n\(post\.score\)===null\?'—':`\$\{Math\.round\(post\.score\)\}\/100`,M\+7,111\);sans\(5\.5,'normal',C\.sage2\);doc\.text\(`SVA · \$\{displayMetric\(sva\)\}`,M\+7,122\);/,`setFill(C.sand);doc.roundedRect(M,78,78,52,4,4,'F');label('POSTURE',M+7,90,C.muted);serif(25,'normal',C.deep);doc.text(n(post.score)===null?'—':\`${'${Math.round(post.score)}'}/100\`,M+7,111);sans(5.5,'normal',C.muted);doc.text(\`SVA · ${'${displayMetric(sva)}'}\`,M+7,122);`],
  [/setFill\(i===0\?C\.deep:C\.white\);setDraw\(C\.line\);doc\.roundedRect\(M,y0,CW,51,4,4,i===0\?'F':'FD'\);/,`setFill(i===0?C.sand:C.white);setDraw(C.line);doc.roundedRect(M,y0,CW,51,4,4,'FD');`],
  [/serif\(26,'normal',i===0\?C\.sage2:C\.sage\)/g,`serif(26,'normal',C.sage)`],
  [/label\('PRIORITÉ',M\+29,y0\+11,i===0\?C\.sage2:C\.muted\)/g,`label('PRIORITÉ',M+29,y0+11,C.muted)`],
  [/serif\(13,'normal',i===0\?C\.white:C\.deep\)/g,`serif(13,'normal',C.deep)`],
  [/label\('POURQUOI',M\+105,y0\+11,i===0\?C\.sage2:C\.muted\)/g,`label('POURQUOI',M+105,y0+11,C.muted)`],
  [/textBlock\(compact\(p\.why,125\),M\+105,y0\+20,80,5\.5,i===0\?C\.white:C\.muted,2\.9\)/g,`textBlock(compact(p.why,125),M+105,y0+20,80,5.5,C.muted,2.9)`],
  [/label\('PREMIÈRE ACTION',M\+29,y0\+39,i===0\?C\.sage2:C\.sage\)/g,`label('PREMIÈRE ACTION',M+29,y0+39,C.sage)`],
  [/sans\(5\.5,'bold',i===0\?C\.white:C\.deep\)/g,`sans(5.5,'bold',C.deep)`],
  [/setFill\(C\.deep\);doc\.roundedRect\(M,82,55,49,4,4,'F'\);label\('AUJOURD’HUI',M\+7,93,C\.sage2\);serif\(28,'normal',C\.white\);doc\.text\(n\(tr\.currentScore\)===null\?'—':`\$\{Math\.round\(tr\.currentScore\)\}`,M\+7,115\);sans\(6,'normal',C\.white\);if\(n\(tr\.currentScore\)!==null\)doc\.text\('\/100',M\+32,115\);/,`setFill(C.sand);doc.roundedRect(M,82,55,49,4,4,'F');label('AUJOURD’HUI',M+7,93,C.muted);serif(28,'normal',C.deep);doc.text(n(tr.currentScore)===null?'—':\`${'${Math.round(tr.currentScore)}'}\`,M+7,115);sans(6,'normal',C.deep);if(n(tr.currentScore)!==null)doc.text('/100',M+32,115);`]
]);

// Professional dossier: one owner only. Remove every historical interceptor.
await patch('dossier.html',[
  [/\s*<script[^>]+src="\.\/(?:canonical-report-export-v2|canonical-report-export|dossier-export-bridge)\.js(?:\?[^\"]*)?"[^>]*><\/script>/g,''],
  [/dossier-page\.js\?v=[^\"]+/g,`dossier-page.js?v=${RELEASE}`],
  [/dossier-pdf-export-v2\.js\?v=[^\"]+/g,`dossier-pdf-export-v2.js?v=${RELEASE}`]
]);
await patch('dossier-page.js',[
  [/\s*document\.querySelector\('#pdfBtn'\)\?\.addEventListener\('click',\(\)=>window\.print\(\)\);?/g,"\n  // PDF export is exclusively owned by KŌMØ Report Delivery v2.\n  "]
]);
await patch('dossier-pdf-export-v2.js',[
  [/report-delivery-v[12]\.js(?:\?v=[^'\"]+)?/g,`report-delivery-v2.js?v=${RELEASE}`]
]);
await patch('report-delivery-v2.js',[
  [/mobility-report-pdf-v[123]\.js(?:\?v=[^'\"]+)?/g,`mobility-report-pdf-v3.js?v=${RELEASE}`]
]);

// Build-time regression guards.
const index=await readFile(join(target,'index.html'),'utf8');
const patientUi=await readFile(join(target,'report-patient-ui-v1.js'),'utf8');
const canonical=await readFile(join(target,'canonical-report-export-v3.js'),'utf8');
const dossier=await readFile(join(target,'dossier.html'),'utf8');
const dossierPage=await readFile(join(target,'dossier-page.js'),'utf8');
const entry=await readFile(join(target,'dossier-pdf-export-v2.js'),'utf8');
const delivery=await readFile(join(target,'report-delivery-v2.js'),'utf8');
const renderer=await readFile(join(target,'mobility-report-pdf-v3.js'),'utf8');
if(index.includes('canonical-report-export-v2.js'))throw new Error('[pulse-report-visual-v2] patient legacy canonical PDF exporter still loaded');
if(!index.includes(`canonical-report-export-v3.js?v=${RELEASE}`))throw new Error('[pulse-report-visual-v2] patient v3 PDF exporter not loaded');
if(!patientUi.includes(`mobility-report-pdf-v3.js?v=${RELEASE}`))throw new Error('[pulse-report-visual-v2] official patient report card still uses old renderer');
if(!canonical.includes(`mobility-report-pdf-v3.js?v=${RELEASE}`))throw new Error('[pulse-report-visual-v2] canonical patient export still uses old renderer');
if(/dossier-export-bridge|canonical-report-export(?:-v2)?/.test(dossier))throw new Error('[pulse-report-visual-v2] legacy PDF interceptor still present in dossier.html');
if(/#pdfBtn[\s\S]{0,180}window\.print|window\.print\(\)/.test(dossierPage))throw new Error('[pulse-report-visual-v2] legacy window.print PDF fallback still present');
if(!dossierPage.includes("document.querySelector('#reviewBtn')"))throw new Error('[pulse-report-visual-v2] dossier action handlers were damaged while removing print fallback');
if(!entry.includes(`report-delivery-v2.js?v=${RELEASE}`))throw new Error('[pulse-report-visual-v2] dossier entrypoint is not wired to Report Delivery v2');
if(!delivery.includes(`mobility-report-pdf-v3.js?v=${RELEASE}`))throw new Error('[pulse-report-visual-v2] Report Delivery v2 is not wired to complete Mobility Report');
if(!renderer.includes('komo-beige-editorial-2026')||!renderer.includes('// PAGE 10 — TRAJECTORY'))throw new Error('[pulse-report-visual-v2] beige complete renderer integrity check failed');

console.log(`[pulse-report-visual-v2] PASS · warm beige editorial 10-page report · patient + professional routes unified · ${RELEASE}`);

await import('./pulse-myocare-contract-alignment-v1.mjs');
await import('./pulse-functional-rc1.mjs');
await import('./pulse-global-interaction-contract-v1.mjs');