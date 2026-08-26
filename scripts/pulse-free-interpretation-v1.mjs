import { readFile } from 'node:fs/promises';

const path='pulse-app/pulse-free-continuity-v2.js';
const src=await readFile(path,'utf8');
if(!src.includes('kfree-v2')) throw new Error('[pulse-free-interpretation-v1] Pulse Free continuity asset missing');

// The detailed interpretation is intentionally rendered by results-polish-v1.
// Keeping a single interpretation layer avoids duplicate health-data summaries
// across Home / Tests while preserving the underlying Free score calculation.
console.log('[pulse-free-interpretation-v1] interpretation delegated to the single premium result view');
