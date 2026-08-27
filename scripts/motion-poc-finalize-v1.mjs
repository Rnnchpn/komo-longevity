import fs from 'node:fs';
const path='pulse-app/index.html';
let html=fs.readFileSync(path,'utf8');

for(const legacy of ['./patient-preparation-hub-v1.js','./patient-appointment-reminder-v1.js']){
  html=html.replace(new RegExp(`\\s*<script[^>]+src=["']${legacy.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')}["'][^>]*><\\/script>\\s*`,'g'),'\n');
}

for(const src of ['./myocare-fallback-v1.js','./score-report-pdf-v1.js','./patient-score-details-v1.js','./admin-motion-validation-v1.js','./patient-preparation-hub-v2.js']){
  if(!html.includes(`src="${src}"`)) html=html.replace('</body>',`  <script type="module" src="${src}"></script>\n</body>`);
}

fs.writeFileSync(path,html);
console.log('[motion-poc-finalize-v1] MyoCare fallback + PDF + Admin validation + unified patient preparation hub wired');