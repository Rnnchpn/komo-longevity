import { readFile, writeFile } from 'node:fs/promises';

let html=await readFile('pulse-app/index.html','utf8');
html=html.replace(/\s*<link rel="stylesheet" href="\.\/tablet-patient-v1\.css" \/>/g,'');
html=html.replace(/\s*<script src="\.\/tablet-patient-v1\.js"><\/script>/g,'');
html=html.replace('</head>','  <link rel="stylesheet" href="./tablet-patient-v1.css" />\n</head>');
html=html.replace('</body>','  <script src="./tablet-patient-v1.js"></script>\n</body>');
await writeFile('pulse-app/index.html',html);

console.log('[pulse-tablet-patient-v1] bottom account plaque removed on phones and iPad patient navigation optimized');
