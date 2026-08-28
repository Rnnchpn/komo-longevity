import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = join(root, 'pulse-app');
const target = join(root, 'site', 'pulse-v12');
const RELEASE='20260828-center-canonical-1';

await mkdir(target, { recursive: true });
await cp(source, target, { recursive: true });

const indexPath=join(target,'index.html');
let html=await readFile(indexPath,'utf8');
const remove=[
  /\s*<script src="\.\/center-patient-links\.js(?:\?[^\"]*)?"><\/script>/g,
  /\s*<script type="module" src="\.\/first-test-entry-v1\.js(?:\?[^\"]*)?"><\/script>/g,
  /\s*<script type="module" src="\.\/myocare-import-entry-v2\.js(?:\?[^\"]*)?"><\/script>/g,
  /\s*<script type="module" src="\.\/center-two-tab-workspace-v1\.js(?:\?[^\"]*)?"><\/script>/g,
  /\s*<script type="module" src="\.\/myocare-dossier-import-fix-v1\.js(?:\?[^\"]*)?"><\/script>/g,
  /\s*<script type="module" src="\.\/center-patient-polish\.js(?:\?[^\"]*)?"><\/script>/g
];
for(const re of remove) html=html.replace(re,'');
html=html.replace(/(<script src="\.\/runtime\.js[^>]*><\/script>)/,`  <script src="./center-patient-links.js?v=${RELEASE}"></script>\n  $1`);
html=html.replace('</body>',`  <script type="module" src="./first-test-entry-v1.js?v=${RELEASE}"></script>\n  <script type="module" src="./myocare-import-entry-v2.js?v=${RELEASE}"></script>\n  <script type="module" src="./center-two-tab-workspace-v1.js?v=${RELEASE}"></script>\n  <script type="module" src="./myocare-dossier-import-fix-v1.js?v=${RELEASE}"></script>\n  <script type="module" src="./center-patient-polish.js?v=${RELEASE}"></script>\n</body>`);
await writeFile(indexPath,html,'utf8');

console.log('[pulse-v12] canonical center stack: patient links, two-tab workspace, dossier page, MyoCare import and patient polish');
