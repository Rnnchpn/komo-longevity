import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const site=join(process.cwd(),'site');

const routes={
  'fr/methode/marche/index.html':'/fr/motion/',
  'fr/methode/equilibre/index.html':'/fr/motion/',
  'fr/methode/posture/index.html':'/fr/motion/',
  'fr/methode/controle-musculaire/index.html':'/fr/motion/',
  'fr/methode/tests-fonctionnels/index.html':'/fr/motion/',
  'fr/methode/pre-bilan-pulse/index.html':'/fr/motion/',
  'fr/locomotor/index.html':'/fr/science/',
  'fr/network/index.html':'/fr/partners/',
  'fr/network/france/index.html':'/fr/partners/',
  'fr/riviera/index.html':'/fr/yachting/',
  'fr/case/equipment/index.html':'/fr/partners/',
  'fr/case/workflow/index.html':'/fr/partners/',
  'fr/case/pulse/index.html':'https://pulse.komolongevity.com/',
  'fr/partners/clinical/index.html':'/fr/clinical/',
  'fr/partners/motion/index.html':'/fr/motion/',
  'fr/partners/deployment/index.html':'/fr/partners/',
  'method/gait/index.html':'/motion/',
  'method/balance/index.html':'/motion/',
  'method/posture/index.html':'/motion/',
  'method/muscle-control/index.html':'/motion/',
  'method/functional-tests/index.html':'/motion/',
  'method/pulse-baseline/index.html':'/motion/',
  'network/france/index.html':'/partners/',
  'riviera/index.html':'/en/yachting/',
  'partners/clinical/index.html':'/clinical/',
  'partners/motion/index.html':'/motion/',
  'partners/deployment/index.html':'/partners/',
  'es/metodo/marcha/index.html':'/es/motion/',
  'es/metodo/equilibrio/index.html':'/es/motion/',
  'es/metodo/postura/index.html':'/es/motion/',
  'es/metodo/control-muscular/index.html':'/es/motion/',
  'es/metodo/tests-funcionales/index.html':'/es/motion/',
  'es/metodo/pre-balance-pulse/index.html':'/es/motion/',
  'es/locomotor/index.html':'/es/science/',
  'es/network/france/index.html':'/es/partners/',
  'es/partners/clinical/index.html':'/es/clinical/',
  'es/partners/motion/index.html':'/es/motion/',
  'es/partners/deployment/index.html':'/es/partners/'
};

function page(to){
  const safe=to.replaceAll('&','&amp;').replaceAll('"','&quot;');
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=${safe}"><link rel="canonical" href="${safe}"><meta name="robots" content="noindex,follow"><title>KŌMØ Longevity</title><script>location.replace(${JSON.stringify(to)});<\/script></head><body><p><a href="${safe}">Continuer vers KŌMØ Longevity</a></p></body></html>`;
}

for(const [rel,to] of Object.entries(routes)){
  const fp=join(site,rel);
  await mkdir(dirname(fp),{recursive:true});
  await writeFile(fp,page(to),'utf8');
}

console.log('[komo-legacy-route-prune-v1] PASS · legacy visual pages replaced by canonical route hand-offs.');
