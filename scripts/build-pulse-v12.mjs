import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = join(root, 'pulse-app');
const target = join(root, 'site', 'pulse-v12');

await mkdir(target, { recursive: true });
await cp(source, target, { recursive: true });

const indexPath=join(target,'index.html');
let html=await readFile(indexPath,'utf8');
html=html.replace(/\s*<script src="\.\/center-patient-click-gate-v5\.js(?:\?[^\"]*)?"><\/script>/g,'');
html=html.replace(/\s*<script src="\.\/center-patient-native-links-v6\.js(?:\?[^\"]*)?"><\/script>/g,'');
html=html.replace(/\s*<script type="module" src="\.\/first-test-entry-v1\.js(?:\?[^\"]*)?"><\/script>/g,'');
html=html.replace(/\s*<script type="module" src="\.\/myocare-import-entry-v2\.js(?:\?[^\"]*)?"><\/script>/g,'');
html=html.replace(/\s*<script type="module" src="\.\/center-two-tab-workspace-v1\.js(?:\?[^\"]*)?"><\/script>/g,'');
html=html.replace(/\s*<script type="module" src="\.\/myocare-dossier-import-fix-v1\.js(?:\?[^\"]*)?"><\/script>/g,'');
html=html.replace(/\s*<script type="module" src="\.\/center-patient-polish-v2\.js(?:\?[^\"]*)?"><\/script>/g,'');
html=html.replace(/\s*<script type="module" src="\.\/center-patient-polish-v3\.js(?:\?[^\"]*)?"><\/script>/g,'');
html=html.replace(/\s*<script type="module" src="\.\/center-patient-open-v4\.js(?:\?[^\"]*)?"><\/script>/g,'');
html=html.replace(/(<script src="\.\/runtime\.js[^>]*><\/script>)/,'  <script src="./center-patient-native-links-v6.js?v=20260828-native-dossier-6"></script>\n  $1');
html=html.replace('</body>','  <script type="module" src="./first-test-entry-v1.js?v=20260828-first-test-1"></script>\n  <script type="module" src="./myocare-import-entry-v2.js?v=20260828-myocare-entry-1"></script>\n  <script type="module" src="./center-two-tab-workspace-v1.js?v=20260828-center-two-tab-1"></script>\n  <script type="module" src="./myocare-dossier-import-fix-v1.js?v=20260828-myocare-dossier-fix-1"></script>\n  <script type="module" src="./center-patient-polish-v3.js?v=20260828-center-patient-polish-3"></script>\n  <script type="module" src="./center-patient-open-v4.js?v=20260828-center-open-4"></script>\n</body>');
await writeFile(indexPath,html,'utf8');

console.log('[pulse-v12] standalone app copied to /pulse-v12/ with native patient dossier navigation, standalone dossier page, MyoCare import and two-tab center workspace');
