import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
const pulse=join(process.cwd(),'site','pulse-v12');
const [html,booking,map,bundle,profile,pro]=await Promise.all([
  readFile(join(pulse,'index.html'),'utf8'),
  readFile(join(pulse,'booking-layer-v1.js'),'utf8'),
  readFile(join(pulse,'booking-directory-map-v1.js'),'utf8'),
  readFile(join(pulse,'pulse-ui-v1.css'),'utf8'),
  readFile(join(pulse,'center-profile-v1.js'),'utf8'),
  readFile(join(pulse,'pro-architecture-v2.js'),'utf8')
]);
const checks=[
 ['center profile module is loaded',html.includes('center-profile-v1.js?v=20260827-center-directory-1')],
 ['critical directory assets are cache busted',html.includes('booking-directory-map-v1.js?v=20260827-center-directory-1')&&html.includes('booking-layer-v1.js?v=20260827-center-directory-1')&&html.includes('pulse-ui-v1.css?v=20260827-center-directory-1')],
 ['map is monochrome grey-white',bundle.includes('.kbd-map .leaflet-tile-pane')&&bundle.includes('grayscale(1)')&&bundle.includes('brightness(1.09)')],
 ['map distinguishes Motion and Clinical',map.includes("data-kbd-filter=\"motion\"")&&map.includes("data-kbd-filter=\"clinical\"")&&map.includes('kbd-service motion')&&map.includes('kbd-service clinical')],
 ['directory cards expose contact channels',map.includes('contact_phone')&&map.includes('contact_email')&&map.includes('website_url')&&map.includes('kbd-contacts')],
 ['center interface edits public contact information',profile.includes('contact_phone')&&profile.includes('contact_email')&&profile.includes('website_url')&&profile.includes('public_description')],
 ['center interface controls Motion Clinical and publication',profile.includes('motion_enabled')&&profile.includes('clinical_enabled')&&profile.includes('booking_published')],
 ['center interface saves through protected rpc',profile.includes("rpc('update_komo_center_directory_profile'")],
 ['RDV and Agenda share live appointment channel',booking.includes('bookingRealtimeChannel')&&booking.includes("table:'organization_appointments'")&&booking.includes("route==='documents'")&&booking.includes('S.proActive')],
 ['map remains nonblocking and persistent',map.includes('Promise.allSettled(tasks)')&&booking.includes('komo:booking-map-restored')],
 ['patient label remains RDV and pro label remains Agenda',pro.includes("navItem('planning','Agenda'")&&pro.includes("s.textContent='RDV'")],
 ['main menu structure stays frozen',pro.includes("navItem('dashboard','Centre'")&&pro.includes("navItem('patients','Patients'")&&pro.includes("navItem('messages','Messages'")]
];
const failed=checks.filter(([,ok])=>!ok).map(([name])=>name);
if(failed.length){console.error('[pulse-center-directory-qa] failed: '+failed.join(', '));process.exit(1)}
for(const [name] of checks)console.log('[pulse-center-directory-qa] OK · '+name);
console.log(`[pulse-center-directory-qa] ${checks.length} checks passed.`);
