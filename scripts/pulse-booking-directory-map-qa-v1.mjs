import { readFile } from 'node:fs/promises';
import { dirname,join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=dirname(dirname(fileURLToPath(import.meta.url))),pulse=join(root,'site','pulse-v12');
const [html,booking,map,css]=await Promise.all([
  readFile(join(pulse,'index.html'),'utf8'),readFile(join(pulse,'booking-layer-v1.js'),'utf8'),readFile(join(pulse,'booking-directory-map-v1.js'),'utf8'),readFile(join(pulse,'pulse-ui-v1.css'),'utf8')
]);
const checks=[
 ['booking map module loaded',html.includes('./booking-directory-map-v1.js')],
 ['booking route reserves map shell',booking.includes('data-kbd-shell')],
 ['directory rpc used',map.includes("rpc('komo_booking_directory')")],
 ['published directory supports centers and professionals',map.includes('centers')&&map.includes('professionals')],
 ['map uses OpenStreetMap tiles',map.includes('tile.openstreetmap.org')],
 ['geocoding is cached',map.includes('komo_booking_geocodes_v1')],
 ['around me is opt-in geolocation',map.includes('navigator.geolocation.getCurrentPosition')),
 ['map selection drives existing center selector',map.includes("#kbookPatientOrg")&&map.includes("dispatchEvent(new Event('change'")),
 ['booking map styles bundled',css.includes('.kbd-shell')&&css.includes('.kbd-layout')),
 ['booking ownership remains stable',booking.includes('data-kbook-patient')]
];
const failed=checks.filter(([,ok])=>!ok).map(([n])=>n);if(failed.length){console.error('[pulse-booking-map-qa] failed: '+failed.join(', '));process.exit(1)}
for(const [n] of checks)console.log('[pulse-booking-map-qa] OK · '+n);console.log(`[pulse-booking-map-qa] ${checks.length} checks passed.`);
