import { readFile, writeFile } from 'node:fs/promises';
const path='pulse-app/index.html';
let html=await readFile(path,'utf8');
for(const css of ['./auth-gateway-v2.css','./patient-onboarding-v1.css','./signup-identity-v1.css']){
  if(!html.includes(css))html=html.replace('</head>',`  <link rel="stylesheet" href="${css}" />\n</head>`);
}
if(!html.includes('./auth-gateway-v2.js'))html=html.replace('</body>','  <script type="module" src="./auth-gateway-v2.js"></script>\n</body>');
if(!html.includes('./patient-onboarding-v1.js'))html=html.replace('</body>','  <script type="module" src="./patient-onboarding-v1.js"></script>\n</body>');
if(!html.includes('./pro-signup-identity-v1.js'))html=html.replace('</body>','  <script type="module" src="./pro-signup-identity-v1.js"></script>\n</body>');
if(!html.includes('./logout-hardening-v1.js'))html=html.replace('</body>','  <script src="./logout-hardening-v1.js"></script>\n</body>');
if(!html.includes('./patient-tests-scope-v2.js'))html=html.replace('</body>','  <script src="./patient-tests-scope-v2.js"></script>\n</body>');
await writeFile(path,html);
console.log('[auth-gateway-inject-v2] patient/pro gateway, complete identity onboarding, patient test scope and fail-safe logout assets loaded');
