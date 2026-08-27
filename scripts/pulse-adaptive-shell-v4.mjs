import { readFile, writeFile } from 'node:fs/promises';

let html=await readFile('pulse-app/index.html','utf8');
html=html.replace(/\s*<link rel="stylesheet" href="\.\/adaptive-shell-v4\.css" \/>/g,'');
html=html.replace(/\s*<script src="\.\/adaptive-shell-v4\.js"><\/script>/g,'');
html=html.replace('</head>','  <link rel="stylesheet" href="./adaptive-shell-v4.css" />\n</head>');
html=html.replace('</body>','  <script src="./adaptive-shell-v4.js"></script>\n</body>');
await writeFile('pulse-app/index.html',html);
console.log('[pulse-adaptive-shell-v4] role-aware phone + iPad patient/pro/admin navigation wired');
