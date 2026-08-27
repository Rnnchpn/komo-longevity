import { readFile, writeFile } from 'node:fs/promises';

let html=await readFile('pulse-app/index.html','utf8');
for(const file of ['my-komo-v1.css','pulse-final-design-v1.css'])html=html.replace(new RegExp(`\\s*<link rel="stylesheet" href="\\./${file.replaceAll('.','\\.')}(?:\\?[^\"]*)?" \\/>`,'g'),'');
for(const file of ['my-komo-home-v1.js','profile-avatar-v1.js','adaptive-plus-v1.js','pulse-final-design-v1.js'])html=html.replace(new RegExp(`\\s*<script(?: type="module")? src="\\./${file.replaceAll('.','\\.')}(?:\\?[^\"]*)?"><\\/script>`,'g'),'');
const release='20260827-design-lock-2';
html=html.replace('</head>',`  <link rel="stylesheet" href="./my-komo-v1.css" />\n  <link rel="stylesheet" href="./pulse-final-design-v1.css?v=${release}" />\n</head>`);
html=html.replace('</body>',`  <script type="module" src="./my-komo-home-v1.js"></script>\n  <script type="module" src="./profile-avatar-v1.js"></script>\n  <script src="./adaptive-plus-v1.js"></script>\n  <script type="module" src="./pulse-final-design-v1.js?v=${release}"></script>\n</body>`);
await writeFile('pulse-app/index.html',html);
console.log('[pulse-my-komo-v1] My KŌMØ home, secure avatar, Komo Age and final locked visual layer wired');
