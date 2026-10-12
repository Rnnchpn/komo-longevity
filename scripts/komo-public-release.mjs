import {spawnSync} from "node:child_process";
const pipeline=[
 "scripts/komo-public-final-v6.mjs",
 "scripts/komo-offers-zoi-2026.mjs",
 "scripts/komo-motion-first-2026.mjs",
 "scripts/komo-motion-kinetic-world-2026.mjs",
 "scripts/komo-motion-experience-v3-2026.mjs",
 "scripts/komo-motion-design-polish-v4.mjs",
 "scripts/build-pilotage-v1.mjs",
 "scripts/build-network-private-v1.mjs"
];
for(const script of pipeline){
 console.log("[komo-public-release] "+script);
 const r=spawnSync(process.execPath,[script],{stdio:"inherit",cwd:process.cwd(),env:process.env});
 if(r.error)throw r.error;
 if(r.status!==0)throw Error("Public release failed at "+script+" with exit "+r.status);
}
console.log("[komo-public-release] PASS · Motion V4 complete.");
