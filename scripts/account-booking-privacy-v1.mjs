import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const pulse=path.join(root,'site','pulse-v12');
const indexPath=path.join(pulse,'index.html');
const bookingPath=path.join(pulse,'booking-layer-v1.js');
const bookingCssPath=path.join(pulse,'booking-layer-v1.css');
const menuSrc=path.join(root,'pulse-app','account-menu-polish-v1.js');
const menuDst=path.join(pulse,'account-menu-polish-v1.js');

for(const p of [indexPath,bookingPath,bookingCssPath,menuSrc]){if(!fs.existsSync(p)){console.error('[account-booking-privacy] missing '+p);process.exit(1)}}
fs.copyFileSync(menuSrc,menuDst);

let html=fs.readFileSync(indexPath,'utf8');
if(!html.includes('account-menu-polish-v1.js')) html=html.replace('</body>','  <script src="./account-menu-polish-v1.js"></script>\n</body>');
fs.writeFileSync(indexPath,html);

let booking=fs.readFileSync(bookingPath,'utf8');
const old=`d.slots.map(s=>\`<button type="button" data-kbook-slot="\${s.slot_start}"><strong>\${timeKey(s.slot_start,tz)}</strong><small>\${s.available_capacity>1?\`\${s.available_capacity} disponibilités\`:'Disponible'}</small></button>\`).join('')`;
const replacement=`d.slots.map(s=>Number(s.available_capacity)>0?\`<button type="button" data-kbook-slot="\${s.slot_start}"><strong>\${timeKey(s.slot_start,tz)}</strong><small>\${s.available_capacity>1?\`\${s.available_capacity} disponibilités\`:'Disponible'}</small></button>\`:\`<button type="button" class="reserved" disabled aria-disabled="true" title="Créneau réservé"><strong>\${timeKey(s.slot_start,tz)}</strong><small>Réservé</small></button>\`).join('')`;
if(!booking.includes('class="reserved"')){
  if(!booking.includes(old)){console.error('[account-booking-privacy] patient slot renderer not found');process.exit(1)}
  booking=booking.replace(old,replacement);
}
fs.writeFileSync(bookingPath,booking);

let css=fs.readFileSync(bookingCssPath,'utf8');
if(!css.includes('KOMO_BOOKING_PRIVACY_V1')) css+=`\n/* KOMO_BOOKING_PRIVACY_V1 */\n.kbook.patient .kbook-day button.reserved,.kbook.patient .kbook-day button.reserved:hover{background:#f1efe9!important;color:#9a9f99!important;border-color:#e5e1d9!important;cursor:not-allowed!important;transform:none!important;box-shadow:none!important;opacity:.72}.kbook.patient .kbook-day button.reserved strong{color:#777f79}.kbook.patient .kbook-day button.reserved small{color:#969c97;opacity:1}.kbook.patient .kbook-day button.reserved:after{content:'Occupé';display:inline-flex;width:max-content;margin-top:4px;padding:3px 6px;border-radius:999px;background:#e5e2db;color:#808681;font-size:7px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}\n`;
fs.writeFileSync(bookingCssPath,css);

const checks=[['menu asset',fs.existsSync(menuDst)],['menu tag',html.includes('account-menu-polish-v1.js')],['reserved renderer',booking.includes('class="reserved"')],['privacy css',css.includes('KOMO_BOOKING_PRIVACY_V1')]];
for(const [n,ok] of checks){if(!ok){console.error('[account-booking-privacy] failed '+n);process.exit(1)}}
console.log('[account-booking-privacy] account menu polished + reserved slots anonymized');
