import { readFile, writeFile } from 'node:fs/promises';

const path='pulse-app/index.html';
let html=await readFile(path,'utf8');
const tag='  <script type="module" src="./motion-sva-ui-v1.js"></script>';
if(!html.includes(tag)){
  const anchor='  <script type="module" src="./clinical-motion-v1.js"></script>';
  if(!html.includes(anchor))throw new Error('[motion-sva-ui-inject-v1] clinical-motion anchor missing');
  html=html.replace(anchor,`${anchor}\n${tag}`);
  await writeFile(path,html);
}
console.log('[motion-sva-ui-inject-v1] Motion workspace reduced to Context + Mobility + manual SVA; legacy calculator locked.');
