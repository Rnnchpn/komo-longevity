import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

await import('./pulse-admin-professional-runtime-stability-v1.mjs');
await import('./pulse-admin-pro-single-owner-v2.mjs');

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const manifest={
  version:'2026-09-01-admin-pro-single-owner-v2',
  principles:[
    'one render owner per declared surface',
    'controllers may orchestrate data, navigation, and bounded subflows',
    'extensions are presentation-only and must not write routes or mutate #viewRoot',
    'all reachable structural route/view writers must be classified before release',
    'desktop, tablet and mobile share the same canonical content contract'
  ],
  surfaces:{
    home:{owner:'patient-home-command-v1.js',controllers:[],extensions:[]},
    results:{owner:'patient-canonical-results.js',controllers:['tests-v1.js'],extensions:[]},
    motion:{owner:'motion-hub-v3.js',controllers:['motion-workflow.js','motion-route-guard-v4.js','motion-access-fix-v1.js'],extensions:[]},
    key:{owner:'key-hub-v1.js',controllers:[],extensions:[]},
    trajectory:{owner:'trajectory-v3.js',controllers:[],extensions:[]},
    documents:{owner:'agenda-hub-v4.js',controllers:['booking-layer-v1.js','patient-intake-v1.js','pulse-free-continuity-v2.js','questionnaire-engine-v1.js'],extensions:['agenda-premium-map-v1.js']},
    mykomo:{owner:'my-komo-stable-v5.js',controllers:[],extensions:[]},
    club:{owner:'club-hub-v1.js',controllers:[],extensions:[]},
    profile:{owner:'profile-v2.js',controllers:[],extensions:['account-hub-v2.js','account-privacy-v1.js']},
    messages:{owner:'care-messaging-v2.js',controllers:[],extensions:[]},
    clinical:{owner:'clinical-cockpit-v1.js',controllers:['clinical-motion-v1.js','patient-assessment-trio-v1.js','pro-agenda-dossier-v1.js','pro-followup-v1.js','tests-status-cockpit-v1.js','booking-layer-v1.js'],extensions:[]},
    admin:{owner:'admin-console-v2.js',controllers:['admin-motion-validation-v1.js','admin-patient-manager-v1.js','admin-professionals-v1.js','admin-centers-v1.js','admin-privacy-queue-v1.js','admin-shortcut-v1.js'],extensions:[]},
    auth:{owner:'auth-login-canonical.js',controllers:['auth-gateway-v2.js'],extensions:[]},
    navigation:{owner:'patient-navigation-core-v1.js',controllers:['adaptive-shell-v4.js','pulse-bottom-nav-v6.js'],extensions:['mobile-runtime-v3.js']}
  },
  global_controllers:['app-router-v2.js','first-test-entry-v1.js','patient-onboarding-v1.js','pro-architecture-v2.js']
};
await writeFile(join(root,'scripts','pulse-runtime-architecture-v37.json'),JSON.stringify(manifest,null,2)+'\n','utf8');
console.log(`[pulse-freeze-final-manifest-v1] ${Object.keys(manifest.surfaces).length} final surfaces · Admin first paint stable · single professional surface`);
