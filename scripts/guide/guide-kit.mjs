// Outils communs aux documents imprimés KŌMØ Motion (HTML → PDF A4 avec Chrome sans écran).
// Une seule feuille de style pour le déroulé, le protocole et le rappel exercices et longévité.
import {writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
// puppeteer-core est installé dans l'outillage local (hors dépendances du site).
const puppeteer=createRequire(process.env.PUPPETEER_HOME||'/home/claude/tools/')('puppeteer-core');

export const e=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
export const steps=(items,cls='steps')=>'<ol class="'+cls+'">'+items.map(x=>'<li>'+x+'</li>').join('')+'</ol>';
export const checks=items=>'<ul class="checks">'+items.map(x=>'<li><span class="box"></span><span>'+x+'</span></li>').join('')+'</ul>';
export const table=(head,rows,cls='')=>'<table'+(cls?' class="'+cls+'"':'')+'><thead><tr>'+head.map(h=>'<th>'+h+'</th>').join('')+'</tr></thead><tbody>'+
 rows.map(r=>'<tr>'+r.map(c=>'<td>'+c+'</td>').join('')+'</tr>').join('')+'</tbody></table>';

export const CSS=`
@page{size:A4;margin:17mm 16mm 18mm 16mm}
:root{--ink:#1c342a;--ink2:#3f4a42;--muted:#6b6f66;--gold:#8a6d3f;--goldl:#b4925e;--sand:#f5f1ea;--line:#e2d9ca;--sage:#e3ebe2;--red:#963f2f}
*{box-sizing:border-box}
html{font-family:Inter,sans-serif;font-size:9.6pt;line-height:1.48;color:var(--ink2);-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{margin:0}
h1,h2,h3{font-family:"Crimson Text",Georgia,serif;color:var(--ink);font-weight:600;margin:0}
h1{font-size:34pt;line-height:1.05;letter-spacing:-.01em}
h2{font-size:19pt;line-height:1.15;margin-bottom:2mm}
h3{font-size:13.5pt;line-height:1.2}
h4{font-size:10.2pt;color:var(--ink);margin:5mm 0 2mm;font-weight:600;break-after:avoid}
p{margin:0 0 2.2mm}
b{color:var(--ink);font-weight:600}
.kicker{font-size:8.6pt;font-weight:600;color:var(--gold);margin:0 0 1mm}
.muted{color:var(--muted)}
.small{font-size:8.4pt}
.cover{height:257mm;display:flex;flex-direction:column;page-break-after:always}
.cover .brand{font-family:"Crimson Text",serif;font-size:15pt;color:var(--ink);letter-spacing:.06em}
.cover .title{margin-top:40mm}
.cover .lead{font-size:12pt;line-height:1.5;color:var(--ink2);max-width:132mm;margin-top:6mm}
.cover .facts{margin-top:10mm;display:grid;grid-template-columns:repeat(3,1fr);gap:4mm;max-width:150mm}
.cover .facts div{border-top:2px solid var(--ink);padding-top:2.5mm}
.cover .facts strong{display:block;font-family:"Crimson Text",serif;font-size:20pt;color:var(--ink);line-height:1}
.cover .facts span{font-size:8.8pt;color:var(--muted)}
.cover .flow{margin-top:auto;border-top:1px solid var(--line);padding-top:5mm}
.flow ol{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,1fr);gap:3mm 5mm;counter-reset:f}
.flow li{counter-increment:f;font-size:9pt;line-height:1.35}
.flow li::before{content:counter(f);display:block;font-family:"Crimson Text",serif;font-size:16pt;color:var(--goldl);line-height:1;margin-bottom:1mm}
.cover .version{margin-top:5mm;font-size:8.4pt;color:var(--muted)}
section.part{page-break-before:always}
.cover+section.part{page-break-before:auto}
.block{margin-top:7mm;break-inside:avoid-page}
.intro{font-size:10.4pt;color:var(--ink2);max-width:156mm;margin-bottom:4mm}
ol.steps{margin:0 0 3mm;padding:0;list-style:none;counter-reset:s}
ol.steps li{counter-increment:s;position:relative;padding:0 0 2.2mm 8.5mm;break-inside:avoid}
ol.steps li::before{content:counter(s);position:absolute;left:0;top:-.2mm;width:5.6mm;height:5.6mm;border-radius:50%;background:var(--ink);color:#fff;font-size:8pt;font-weight:600;display:grid;place-items:center}
ul{margin:0;padding-left:4.5mm}
ul li{margin-bottom:1mm}
.checks{list-style:none;padding:0;columns:2;column-gap:8mm}
.checks li{display:flex;gap:2.5mm;break-inside:avoid;margin-bottom:2mm}
.checks .box{flex:none;width:3.6mm;height:3.6mm;border:1.2px solid var(--ink);border-radius:.8mm;margin-top:.5mm}
.checks.one{columns:1}
blockquote{margin:2mm 0 4mm;padding:3mm 4mm;border-left:3px solid var(--goldl);background:var(--sand);font-family:"Crimson Text",serif;font-size:11.6pt;line-height:1.42;color:var(--ink);break-inside:avoid}
.note{border:1px solid var(--line);border-radius:2mm;padding:3mm 4mm;margin:0 0 4mm;font-size:9.2pt;break-inside:avoid}
.note.warn{border-color:#c9b48d;background:#fbf7ef}
.note.ok{border-color:#b9cdbb;background:#f1f6f0}
.station{margin-top:7mm}
.station:first-of-type{margin-top:0}
.station-head{border-bottom:2px solid var(--ink);padding-bottom:2.5mm;margin-bottom:4mm;break-after:avoid;page-break-after:avoid}
.station-lead{break-inside:avoid;page-break-inside:avoid}
.station-head .place{margin:1.5mm 0 0;font-size:9.4pt}
article.test{border:1px solid var(--line);border-radius:2.4mm;padding:3.6mm 4.2mm 2.4mm;margin-bottom:4mm;break-inside:avoid;page-break-inside:avoid}
article.test.breakable{break-inside:auto;page-break-inside:auto}
article.test header{display:flex;gap:3.4mm;align-items:flex-start;margin-bottom:2.6mm}
.num{flex:none;width:9mm;height:9mm;border-radius:50%;background:var(--ink);color:#fff;font-weight:600;font-size:9.6pt;display:grid;place-items:center}
.num.alt{background:var(--goldl)}
.meta{margin:.6mm 0 0;font-size:8.6pt;color:var(--muted)}
dl{display:grid;grid-template-columns:17mm 1fr;gap:1.8mm 3mm;margin:0}
dt{font-size:8.6pt;font-weight:600;color:var(--gold);padding-top:.3mm}
dd{margin:0}
dd p:last-child,dd ul:last-child{margin-bottom:0}
dd.say{font-family:"Crimson Text",serif;font-size:11.2pt;line-height:1.38;color:var(--ink)}
.vald-box{background:var(--sand);border-radius:1.6mm;padding:2mm 3mm;font-size:8.9pt;margin-top:1.5mm}
.vald{color:var(--muted);font-size:8.5pt}
.opt{color:var(--gold);font-size:8.3pt}
.corridor{width:100%;height:auto;margin:0 0 2.8mm}
table{width:100%;border-collapse:collapse;font-size:8.9pt;margin:2mm 0 4mm}
th{text-align:left;font-weight:600;color:var(--ink);border-bottom:1.5px solid var(--ink);padding:1.6mm 2mm;vertical-align:bottom}
td{border-bottom:1px solid var(--line);padding:1.8mm 2mm;vertical-align:top}
tr{break-inside:avoid}
td:first-child{font-weight:600;color:var(--ink)}
td:first-child,th:first-child{width:24%}
.two{display:grid;grid-template-columns:1fr 1fr;gap:7mm}
.longevity{margin-top:2.4mm;border-top:1px dashed var(--line);padding-top:2.2mm}
.longevity .lk{font-size:8.2pt;font-weight:600;color:var(--ink);margin:0 0 1.2mm;letter-spacing:.02em}
.ldl{display:grid;grid-template-columns:17mm 1fr;gap:1.2mm 3mm;margin:0;font-size:9pt}
.ldl dt{font-size:8.2pt;font-weight:600;color:#4f6b5a}
table.norms{font-size:7.8pt;margin:2mm 0 0}
table.norms td,table.norms th{padding:1mm 1.2mm;text-align:center}
table.norms td:first-child,table.norms th:first-child{text-align:left;width:34%}
table.summary td:first-child{width:20%}
table.timeline td:first-child,table.timeline th:first-child{width:17mm;font-variant-numeric:tabular-nums;white-space:nowrap}
table.timeline td:nth-child(2){font-weight:600;color:var(--ink);width:44mm}
table.timeline tr.stage td{background:var(--sand)}
table.stations td:last-child{white-space:nowrap}
.phone{display:grid;grid-template-columns:repeat(3,1fr);gap:4mm;margin:2mm 0 5mm}
.phone div{border:1px solid var(--line);border-radius:3mm;padding:3mm 3.4mm;font-size:8.8pt;break-inside:avoid}
.phone strong{display:block;font-family:"Crimson Text",serif;font-size:12pt;color:var(--ink);margin-bottom:1mm;line-height:1.15}
.phone .when{display:block;font-size:7.8pt;font-weight:600;color:var(--gold);margin-bottom:1mm}
.consent-items{list-style:none;padding:0;margin:1mm 0 0}
.consent-items li{display:flex;gap:2.5mm;margin-bottom:1.6mm}
.consent-items .box{flex:none;width:3.4mm;height:3.4mm;border:1.2px solid var(--ink);border-radius:.8mm;margin-top:.6mm}
.req{font-size:7.8pt;font-weight:600;color:var(--gold)}
`;

// Rend une page HTML en PDF A4, avec pied de page (titre du document et numéro de page).
export async function renderPdf(html,out,footer){
 const browser=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--font-render-hinting=none']});
 try{
  const page=await browser.newPage();
  await page.setContent(html,{waitUntil:'load'});
  await page.evaluateHandle('document.fonts.ready');
  await writeFile(out.replace(/\.pdf$/,'.html'),html);
  await page.pdf({path:out,format:'A4',printBackground:true,displayHeaderFooter:true,preferCSSPageSize:true,
   headerTemplate:'<div></div>',
   footerTemplate:'<div style="width:100%;font-family:Inter,sans-serif;font-size:7.5pt;color:#6b6f66;padding:0 16mm;display:flex;justify-content:space-between"><span>'+e(footer)+'</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>'});
 }finally{await browser.close()}
 console.log('[documents] '+out);
}
export const doc=(title,body)=>'<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>'+e(title)+'</title><style>'+CSS+'</style></head><body>'+body+'</body></html>';
