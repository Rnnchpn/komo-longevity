import fs from 'node:fs';
const path='pulse-app/index.html';
let html=fs.readFileSync(path,'utf8');
for(const src of ['./myocare-fallback-v1.js','./score-report-pdf-v1.js','./patient-score-details-v1.js']){
  if(!html.includes(`src="${src}"`)) html=html.replace('</body>',`  <script type="module" src="${src}"></script>\n</body>`);
}
fs.writeFileSync(path,html);
console.log('[motion-poc-finalize-v1] MyoCare fallback + score PDF report + multicenter score history wired');