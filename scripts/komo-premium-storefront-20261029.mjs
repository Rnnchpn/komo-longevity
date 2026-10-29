import { readFile, writeFile, access } from 'node:fs/promises';
import { join } from 'node:path';

// LAST public-home presentation pass. Never alters booking or Pulse behavior.
const root = process.cwd();
const files = ['index.html','fr/index.html','en/index.html','es/index.html'];
const css = '/assets/komo-premium-storefront-v2.css?v=20261029-2';
const js = '/assets/komo-premium-storefront-v2.js?v=20261029-2';
await access(join(root,'site/assets/komo-premium-storefront-v2.css'));
await access(join(root,'site/assets/komo-premium-storefront-v2.js'));
for (const file of files) {
 const fp = join(root,'site',file);
 let html = await readFile(fp,'utf8');
 if (html.includes('data-komo-premium-storefront-v2')) continue;
 const required = ['<main id="main" class="kt-home">','<header class="kp-top">','<footer class="kp-footer">','<section class="ko-services"'];
 for (const marker of required) if (!html.includes(marker)) throw Error('Premium home: missing '+marker+' in '+file);
 html = html.replace('<main id="main" class="kt-home">','<main id="main" class="kt-home ko-premium-v2">');
 html = html.replace('<header class="kp-top">','<header class="kp-top ko-premium-header">');
 html = html.replace('<footer class="kp-footer">','<footer class="kp-footer ko-premium-footer">');
 html = html.replace('</head>','<link rel="stylesheet" data-komo-premium-storefront-v2 href="'+css+'">\n</head>');
 html = html.replace('</body>','<script defer src="'+js+'"></script>\n</body>');
 await writeFile(fp,html,'utf8');
 console.log('[premium-storefront-v2] '+file+' PASS');
}
