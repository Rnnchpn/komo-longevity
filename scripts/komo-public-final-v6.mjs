import { spawnSync } from "node:child_process";
const scripts=[
"scripts/komo-renewal-motion-phenotype-v1.mjs",
"scripts/komo-editorial-polish-v2.mjs",
"scripts/komo-site-art-direction-v3.mjs",
"scripts/komo-site-redesign-qa-v1.mjs",
"scripts/komo-luxury-hd-v5.mjs",
"scripts/komo-editorial-light-v6.mjs"
];
for (const script of scripts) {
 const r=spawnSync(process.execPath,[script],{stdio:"inherit"});
 if(r.error)throw r.error;
 if(r.status!==0)process.exit(r.status || 1);
}
console.log("[KŌMØ public V6] finished");
