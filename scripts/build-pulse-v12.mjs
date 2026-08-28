import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = join(root, 'pulse-app');
const target = join(root, 'site', 'pulse-v12');
const RELEASE='20260828-myocare-real-contract-3';

await mkdir(target, { recursive: true });
await cp(source, target, { recursive: true });

const indexPath=join(target,'index.html');
let html=await readFile(indexPath,'utf8');
const remove=[
  /\s*<script src="\.\/auth-login-canonical\.js(?:\?[^\"]*)?"><\/script>/g,
  /\s*<script src="\.\/center-patient-links\.js(?:\?[^\"]*)?"><\/script>/g,
  /\s*<script type="module" src="\.\/myocare-import-v1\.js(?:\?[^\"]*)?"><\/script>/g,
  /\s*<script type="module" src="\.\/myocare-import\.js(?:\?[^\"]*)?"><\/script>/g,
  /\s*<script type="module" src="\.\/myocare-fallback-v1\.js(?:\?[^\"]*)?"><\/script>/g,
  /\s*<script type="module" src="\.\/motion-v05-workflow-v1\.js(?:\?[^\"]*)?"><\/script>/g,
  /\s*<script type="module" src="\.\/motion-workflow\.js(?:\?[^\"]*)?"><\/script>/g,
  /\s*<script type="module" src="\.\/first-test-entry-v1\.js(?:\?[^\"]*)?"><\/script>/g,
  /\s*<script type="module" src="\.\/myocare-import-entry-v2\.js(?:\?[^\"]*)?"><\/script>/g,
  /\s*<script type="module" src="\.\/center-two-tab-workspace-v1\.js(?:\?[^\"]*)?"><\/script>/g,
  /\s*<script type="module" src="\.\/myocare-dossier-import-fix-v1\.js(?:\?[^\"]*)?"><\/script>/g,
  /\s*<script type="module" src="\.\/center-patient-polish\.js(?:\?[^\"]*)?"><\/script>/g
];
for(const re of remove) html=html.replace(re,'');
html=html.replace(/(<script src="\.\/runtime\.js[^>]*><\/script>)/,`  <script src="./auth-login-canonical.js?v=${RELEASE}"></script>\n  <script src="./center-patient-links.js?v=${RELEASE}"></script>\n  $1`);
html=html.replace('</body>',`  <script type="module" src="./myocare-import.js?v=${RELEASE}"></script>\n  <script type="module" src="./motion-workflow.js?v=${RELEASE}"></script>\n  <script type="module" src="./first-test-entry-v1.js?v=${RELEASE}"></script>\n  <script type="module" src="./myocare-import-entry-v2.js?v=${RELEASE}"></script>\n  <script type="module" src="./center-two-tab-workspace-v1.js?v=${RELEASE}"></script>\n  <script type="module" src="./myocare-dossier-import-fix-v1.js?v=${RELEASE}"></script>\n  <script type="module" src="./center-patient-polish.js?v=${RELEASE}"></script>\n</body>`);
await writeFile(indexPath,html,'utf8');

console.log('[pulse-v12] canonical MyoCare + Motion stack: real MyoLab adapter v0.2, no legacy parser/fallback/workflow, Motion v0.5.1');