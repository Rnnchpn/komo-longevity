import fs from 'node:fs';
import path from 'node:path';

const file=path.join(process.cwd(),'site','pulse-v12','patient-v4.js');
if(!fs.existsSync(file)){console.error('[pulse-flicker-normalize] patient-v4 missing');process.exit(1)}
let src=fs.readFileSync(file,'utf8');
const target=/const TARGETS\s*=\s*new Set\(\[[^\]]*\]\);/;
if(!target.test(src)){console.error('[pulse-flicker-normalize] TARGETS contract missing');process.exit(1)}
src=src.replace(target,"const TARGETS=new Set(['plan','documents']);");
fs.writeFileSync(file,src);
console.log('[pulse-flicker-normalize] patient route ownership normalized');
