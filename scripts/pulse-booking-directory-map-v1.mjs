import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd(),pulse=path.join(root,'site','pulse-v12');
const indexPath=path.join(pulse,'index.html'),bookingPath=path.join(pulse,'booking-layer-v1.js');
const cssAsset=path.join(pulse,'booking-directory-map-v1.css'),jsAsset=path.join(pulse,'booking-directory-map-v1.js');
for(const f of [indexPath,bookingPath,cssAsset,jsAsset])if(!fs.existsSync(f))throw new Error(`[pulse-booking-map] missing ${f}`);
let html=fs.readFileSync(indexPath,'utf8');
if(!html.includes('./booking-directory-map-v1.css'))html=html.replace('<link rel="stylesheet" href="./booking-layer-v1.css" />','<link rel="stylesheet" href="./booking-layer-v1.css" />\n  <link rel="stylesheet" href="./booking-directory-map-v1.css" />');
if(!html.includes('./booking-directory-map-v1.js'))html=html.replace('<script type="module" src="./booking-layer-v1.js"></script>','<script type="module" src="./booking-layer-v1.js"></script>\n  <script type="module" src="./booking-directory-map-v1.js"></script>');
fs.writeFileSync(indexPath,html);
let booking=fs.readFileSync(bookingPath,'utf8');
if(!booking.includes('data-kbd-shell')){
  const marker='</section><section class="kbook-controls">';
  if(!booking.includes(marker))throw new Error('[pulse-booking-map] booking controls marker missing');
  booking=booking.replace(marker,'</section><section class="kbd-shell" data-kbd-shell aria-label="Carte des centres et professionnels KŌMØ"><div class="kbd-loading">Chargement du réseau KŌMØ…</div></section><section class="kbook-controls">');
  fs.writeFileSync(bookingPath,booking);
}
console.log('[pulse-booking-map] directory map reserved in RDV and assets wired');
