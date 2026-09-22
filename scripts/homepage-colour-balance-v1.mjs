import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const files = [
  join(root, 'site', 'index.html'),
  join(root, 'site', 'fr', 'index.html'),
  join(root, 'site', 'es', 'index.html')
];

// A final, home-only colour pass: the structure stays the same, while the
// patient-facing entry point gets a more optimistic Mediterranean palette.
// Keeping this as the last build layer means later product/page generators do
// not accidentally pull the home back toward the older beige/forest balance.
const style = `<style id="komo-homepage-colour-balance-v1-style">
  :root{--komo-sun:#f6c85f;--komo-coral:#ee8e70;--komo-aqua:#69c9bf;--komo-teal:#0e7478;--komo-sky:#5b9bd5;--komo-cream:#fffaf1;--komo-ink:#102a35}
  .kp-top{background:rgba(255,250,241,.92)!important;color:var(--komo-ink)!important;border-bottom-color:rgba(16,42,53,.14)!important}
  .kp-top .kp-brand{color:var(--komo-ink)!important}
  .kp-top .kp-brand span{color:var(--komo-teal)!important}
  .kp-top .kp-nav a{color:rgba(16,42,53,.62)!important}
  .kp-top .kp-nav a:hover,.kp-top .kp-nav a[aria-current=page]{color:var(--komo-ink)!important}
  .kp-top .kp-langs a{color:rgba(16,42,53,.58)!important}
  .kp-top .kp-langs a[aria-current=page]{background:var(--komo-teal)!important;color:#fff!important}
  .kp-top .kp-mini{background:var(--komo-coral)!important;color:#2d2830!important;border:0!important}
  .kp-top .kp-menu summary{color:var(--komo-ink)!important;border-color:rgba(16,42,53,.22)!important;background:rgba(255,255,255,.42)!important}
  .kp-menu nav{border-color:rgba(16,42,53,.14)!important;background:rgba(255,250,241,.98)!important}
  .kp-menu nav a{border-bottom-color:rgba(16,42,53,.12)!important;color:var(--komo-ink)!important}
  .rvc-home{background:var(--komo-cream);color:var(--komo-ink)}
  .rvc-home a:focus-visible{outline:3px solid var(--komo-coral);outline-offset:4px}
  .rvc-home-hero.komo-patient-hero{background:radial-gradient(circle at 16% 8%,rgba(238,142,112,.38),transparent 28%),radial-gradient(circle at 88% 8%,rgba(105,201,191,.38),transparent 31%),linear-gradient(140deg,#123c59 0%,#126d75 55%,#0b3b54 100%)}
  .rvc-home-hero .rvc-ey{color:#ffe19a}
  .rvc-home-hero .rvc-title em{color:#9be2d7}
  .rvc-home-hero .rvc-copy{color:rgba(255,255,255,.84)}
  .rvc-home-hero .rvc-btn--light{border-color:var(--komo-sun);background:var(--komo-sun);color:#173b4a!important}
  .rvc-home-hero .rvc-btn--light:hover{border-color:#ffda7c;background:#ffda7c}
  .rvc-home-hero .rvc-link{color:#fff}
  .rvc-home-hero .rvc-hero-facts{border-color:rgba(255,255,255,.34)}
  .rvc-home-hero .rvc-hero-facts li{border-right-color:rgba(255,255,255,.24)}
  .rvc-home-hero .rvc-hero-facts span{color:rgba(255,255,255,.72)}
  .rvc-home-hero .komo-hero-note{border-left-color:rgba(255,225,154,.7);color:rgba(255,255,255,.68)}
  .komo-patient-clarity{background:linear-gradient(135deg,#fffaf1 0%,#f3fbf7 100%)}
  .komo-patient-clarity .rvc-ey{color:var(--komo-teal)}
  .komo-patient-clarity .rvc-title em{color:var(--komo-teal)}
  .komo-patient-clarity-lead{color:#405c61}
  .komo-patient-clarity-cards{border-top-color:#173e4b;border-bottom-color:#173e4b}
  .komo-patient-clarity-card{background:rgba(255,255,255,.26)}
  .komo-patient-clarity-card:nth-child(1){border-top:3px solid var(--komo-coral)}
  .komo-patient-clarity-card:nth-child(2){border-top:3px solid var(--komo-aqua)}
  .komo-patient-clarity-card:nth-child(3){border-top:3px solid var(--komo-sky)}
  .komo-patient-clarity-card>span,.komo-patient-clarity-card a:after{color:var(--komo-teal)}
  .komo-patient-clarity-card p{color:#53676a}
  .komo-patient-clarity-note{color:#657b7c}
  .komo-experience-home{background:radial-gradient(circle at 86% 11%,rgba(246,200,95,.38),transparent 27%),radial-gradient(circle at 8% 90%,rgba(238,142,112,.35),transparent 29%),linear-gradient(135deg,#0c596a 0%,#117a79 56%,#154f70 100%)}
  .komo-experience-home:before{border-color:rgba(160,233,222,.34)}
  .komo-experience-home:after{border-color:rgba(255,221,132,.35)}
  .komo-experience-home .rvc-ey{color:#ffe39a}
  .komo-experience-home .rvc-title em{color:#a7e4d9}
  .komo-experience-home-lead{color:rgba(255,255,255,.82)}
  .komo-experience-home-cards{border-top-color:rgba(255,255,255,.54);border-bottom-color:rgba(255,255,255,.34)}
  .komo-experience-home-card{border-right-color:rgba(255,255,255,.25)}
  .komo-experience-home-card:nth-child(1){border-top:3px solid var(--komo-coral)}
  .komo-experience-home-card:nth-child(2){border-top:3px solid var(--komo-sun)}
  .komo-experience-home-card:nth-child(3){border-top:3px solid var(--komo-aqua)}
  .komo-experience-home-card:nth-child(4){border-top:3px solid var(--komo-sky)}
  .komo-experience-home-card>span,.komo-experience-home-card h3 a:after{color:#ffe19a}
  .komo-experience-home-card p{color:rgba(255,255,255,.78)}
  .komo-experience-home-card p strong{color:#fff}
  .komo-experience-home-foot .rvc-btn{border-color:var(--komo-sun);background:var(--komo-sun);color:#173b4a!important}
  .komo-experience-home-foot .rvc-btn:hover{border-color:#ffda7c;background:#ffda7c;color:#173b4a!important}
  .komo-experience-home-rail{border-top-color:rgba(255,255,255,.26);color:rgba(255,255,255,.62)}
  .komo-patient-founder{background:linear-gradient(128deg,#ffe5d8 0%,#fff4cf 52%,#e3f4f0 100%)}
  .komo-patient-founder .rvc-ey{color:#b35c4f}
  .komo-patient-founder .rvc-title em{color:#087276}
  .komo-patient-founder-role{color:#087276}
  .komo-patient-founder-body{color:#3b4e52}
  .rvc-home-path{background:#fffdf8}
  .rvc-home-path .rvc-ey,.rvc-path-step span{color:var(--komo-teal)}
  .rvc-path-grid{border-top-color:#173e4b;border-bottom-color:#173e4b}
  .rvc-path-step:nth-child(1){border-top:3px solid var(--komo-coral)}
  .rvc-path-step:nth-child(2){border-top:3px solid var(--komo-sun)}
  .rvc-path-step:nth-child(3){border-top:3px solid var(--komo-aqua)}
  .rvc-path-step:nth-child(4){border-top:3px solid var(--komo-sky)}
  .rvc-path-step:nth-child(5){border-top:3px solid #9a83d8}
  .rvc-kit{background:linear-gradient(135deg,#e6f6f2 0%,#edf4fb 100%)}
  .rvc-kit .rvc-ey,.rvc-kit .rvc-title em{color:var(--komo-teal)}
  .rvc-kit-contents strong{color:#173e4b}
  .rvc-powered{border-left-color:var(--komo-coral);background:rgba(255,255,255,.55)}
  .rvc-session{background:radial-gradient(circle at 82% 18%,rgba(105,201,191,.25),transparent 30%),linear-gradient(135deg,#173b5d 0%,#155c70 68%,#263e6f 100%)}
  .rvc-session .rvc-ey{color:#ffe19a}
  .rvc-session .rvc-title em{color:#a9e3d8}
  .rvc-session .rvc-copy{color:rgba(255,255,255,.8)}
  .rvc-boundary{background:linear-gradient(135deg,#fff8e5 0%,#fffaf1 62%,#f5efff 100%)}
  .rvc-boundary .rvc-ey,.rvc-boundary-card small{color:#b35c4f}
  .rvc-boundary .rvc-title em{color:var(--komo-teal)}
  .komo-world-home{background:radial-gradient(circle at 86% 10%,rgba(246,200,95,.38),transparent 25%),linear-gradient(135deg,#0d6972 0%,#167f7c 56%,#185372 100%)}
  .komo-world-home:before{border-color:rgba(172,237,225,.36)}
  .komo-world-home:after{border-color:rgba(255,221,132,.42);box-shadow:0 0 0 42px rgba(255,221,132,.08),0 0 0 86px rgba(255,221,132,.045)}
  .komo-world-home .rvc-ey{color:#ffe19a}
  .komo-world-home h2 em,.komo-world-home .rvc-title em{color:#a9e3d8}
  .komo-world-home .rvc-btn{border-color:var(--komo-sun);background:var(--komo-sun);color:#173b4a!important}
  .komo-world-home .rvc-btn:hover{border-color:#ffda7c;background:#ffda7c;color:#173b4a!important}
  .komo-world-home-orbit-card{border-color:rgba(255,255,255,.42);background:linear-gradient(145deg,rgba(22,108,110,.9),rgba(12,56,78,.95))}
  .komo-world-home-orbit-card strong em,.komo-world-home-signal span{color:#ffe19a}
  .rvc-final{background:radial-gradient(circle at 84% 16%,rgba(238,142,112,.34),transparent 28%),linear-gradient(135deg,#173b5d 0%,#185d70 60%,#5b426f 125%)}
  .rvc-final .rvc-ey{color:#ffe19a}
  .rvc-final .rvc-title em{color:#a9e3d8}
  .rvc-final .rvc-btn--light{border-color:#ffd278;background:#ffd278;color:#173b4a!important}
  @media(max-width:980px){
    .komo-patient-clarity-card:nth-child(2),.komo-experience-home-card:nth-child(2),.rvc-path-step:nth-child(2){border-right-color:transparent}
  }
  @media(max-width:620px){
    .komo-patient-clarity-card,.komo-patient-clarity-card+li,.komo-experience-home-card,.komo-experience-home-card+li,.rvc-path-step,.rvc-path-step+li{border-top-width:3px}
  }
</style>`;

for (const file of files) {
  let html = await readFile(file, 'utf8');
  html = html.replace(/\s*<style id="komo-homepage-colour-balance-v1-style">[\s\S]*?<\/style>\s*(?=<\/head>)/, '');
  html = html.replace('</head>', `\n${style}\n</head>`);
  await writeFile(file, html);
}

console.log('[homepage-colour-balance-v1] PASS · joyful Mediterranean palette applied to EN/FR/ES home pages');
