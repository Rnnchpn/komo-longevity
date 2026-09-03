import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
// Restore the canonical Club owner before the final QA chain. The final manifest
// below is the only architecture contract allowed to survive the build.
const canonicalClub=await readFile(join(root,'pulse-app','club-hub-v1.js'),'utf8');
await writeFile(join(root,'site','pulse-v12','club-hub-v1.js'),canonicalClub,'utf8');

await import('./pulse-club-community-v2-qa.mjs');
await import('./pulse-admin-professional-runtime-stability-v1.mjs');
await import('./pulse-admin-pro-single-owner-v3.mjs');
await import('./pulse-admin-pro-route-v4.mjs');
await import('./pulse-pro-event-driven-v5.mjs');
await import('./pulse-workspace-clickability-v6.mjs');
await import('./pulse-admin-myocare-loop-guard-v7.mjs');
await import('./pulse-motion-result-integrity-v9.mjs');
await import('./pulse-information-architecture-v11.mjs');
await import('./pulse-connected-consultations-single-layer-v12.mjs');
await import('./pulse-canonical-theme-v14.mjs');

const manifest={
  version:'2026-09-03-motion-sensor-v06-final-freeze',
  principles:[
    'one render owner per declared surface',
    'controllers may orchestrate data, navigation, and bounded subflows',
    'extensions are presentation-only and must not write routes or mutate #viewRoot',
    'all reachable structural route/view writers must be classified before release',
    'desktop, tablet and mobile share the same canonical content contract',
    'Motion Score is sensor-only; questionnaires are contextual and legacy manual Motion tests are retired',
    'Home and Club define the canonical Pulse color system across patient, professional, admin and auth surfaces',
    'canonical contrast, authentication card geometry and motion timing are frozen across Pulse'
  ],
  surfaces:{
    home:{owner:'patient-home-command-v1.js',controllers:[],extensions:[]},
    results:{owner:'patient-canonical-results.js',controllers:['tests-v1.js','patient-tests-scope-v2.js'],extensions:[]},
    motion:{owner:'motion-hub-v4.js',controllers:['motion-workflow.js','motion-route-guard-v4.js','motion-access-fix-v1.js'],extensions:[]},
    key:{owner:'key-hub-v1.js',controllers:[],extensions:[]},
    trajectory:{owner:'trajectory-v3.js',controllers:[],extensions:[]},
    documents:{owner:'agenda-hub-v4.js',controllers:['booking-layer-v1.js','patient-intake-v1.js','pulse-free-continuity-v2.js','questionnaire-engine-v1.js'],extensions:['agenda-premium-map-v1.js']},
    mykomo:{owner:'my-komo-stable-v5.js',controllers:[],extensions:[]},
    club:{owner:'club-hub-v1.js',controllers:[],extensions:[]},
    profile:{owner:'profile-v2.js',controllers:[],extensions:['account-hub-v2.js','account-privacy-v1.js']},
    messages:{owner:'care-messaging-v2.js',controllers:[],extensions:[]},
    clinical:{owner:'clinical-cockpit-v1.js',controllers:['clinical-motion-v1.js','myocare-import.js','patient-assessment-trio-v1.js','pro-agenda-dossier-v1.js','pro-followup-v1.js','tests-status-cockpit-v1.js','booking-layer-v1.js'],extensions:[]},
    admin:{owner:'admin-console-v2.js',controllers:['admin-motion-validation-v1.js','admin-patient-manager-v1.js','admin-professionals-v1.js','admin-centers-v1.js','admin-privacy-queue-v1.js','admin-shortcut-v1.js'],extensions:[]},
    auth:{owner:'auth-login-canonical.js',controllers:['auth-gateway-v2.js'],extensions:[]},
    navigation:{owner:'patient-navigation-core-v1.js',controllers:['adaptive-shell-v4.js','pulse-bottom-nav-v6.js'],extensions:['mobile-runtime-v3.js']}
  },
  global_controllers:['app-router-v2.js','patient-onboarding-v1.js','pro-architecture-v2.js']
};
await writeFile(join(root,'scripts','pulse-runtime-architecture-v37.json'),JSON.stringify(manifest,null,2)+'\n','utf8');
console.log(`[pulse-freeze-final-manifest-v1] ${Object.keys(manifest.surfaces).length} final surfaces · Motion sensor v0.6 frozen · legacy first-test controller retired · final architecture manifest locked`);
