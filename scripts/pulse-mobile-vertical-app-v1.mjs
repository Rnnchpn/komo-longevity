import {readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';

const pulse=join(process.cwd(),'site','pulse-v12');
const htmlPath=join(pulse,'index.html');
let html=await readFile(htmlPath,'utf8');
const release='20260829-mobile-vertical-1';

html=html.replace(
  /<meta name="viewport" content="[^"]*"\s*\/>/,
  '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content" />'
);

html=html.replace(/\s*<link rel="stylesheet" href="\.\/mobile-vertical-app-v1\.css(?:\?v=[^"]+)?"\s*\/>/g,'');
html=html.replace(/\s*<script src="\.\/mobile-vertical-app-v1\.js(?:\?v=[^"]+)?"><\/script>/g,'');
html=html.replace('</head>',`  <link rel="stylesheet" href="./mobile-vertical-app-v1.css?v=${release}" />\n</head>`);
html=html.replace('</body>',`  <script src="./mobile-vertical-app-v1.js?v=${release}"></script>\n</body>`);

await writeFile(htmlPath,html);
console.log('[pulse-mobile-vertical-app-v1] phone navigation converted to centered vertical app menu');
