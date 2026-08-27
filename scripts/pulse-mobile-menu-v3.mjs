import { readFile, writeFile } from 'node:fs/promises';

let html=await readFile('pulse-app/index.html','utf8');
html=html.replace(/\s*<link rel="stylesheet" href="\.\/mobile-menu-v3\.css" \/>/g,'');
html=html.replace(/\s*<script src="\.\/mobile-menu-v3\.js"><\/script>/g,'');
html=html.replace(/\s*<script src="\.\/session-shell-guard-v1\.js"><\/script>/g,'');
html=html.replace('</head>','  <link rel="stylesheet" href="./mobile-menu-v3.css" />\n</head>');
html=html.replace('</body>','  <script src="./mobile-menu-v3.js"></script>\n  <script src="./session-shell-guard-v1.js"></script>\n</body>');
await writeFile('pulse-app/index.html',html);

console.log('[pulse-mobile-menu-v3] safe in-app mobile navigation + authenticated shell guard wired');
