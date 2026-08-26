import { readFile, writeFile } from 'node:fs/promises';
const path='pulse-app/index.html';
let html=await readFile(path,'utf8');
if(!html.includes('./auth-gateway-v2.css'))html=html.replace('</head>','  <link rel="stylesheet" href="./auth-gateway-v2.css" />\n</head>');
if(!html.includes('./auth-gateway-v2.js'))html=html.replace('</body>','  <script type="module" src="./auth-gateway-v2.js"></script>\n</body>');
if(!html.includes('./logout-hardening-v1.js'))html=html.replace('</body>','  <script src="./logout-hardening-v1.js"></script>\n</body>');
await writeFile(path,html);
console.log('[auth-gateway-inject-v2] patient/pro gateway and fail-safe logout assets loaded');