import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const site = join(process.cwd(), 'site');

const komoBrandHeroParts = [
  'src/assets/site2026/komo-brand-home-v1/part00.b64',
  'src/assets/site2026/komo-brand-home-v1/part01.b64',
  'src/assets/site2026/komo-brand-home-v1/part02.b64',
  'src/assets/site2026/komo-brand-home-v1/part03.b64',
  'src/assets/site2026/komo-brand-home-v1/part04.b64',
  'src/assets/site2026/komo-brand-home-v1/part05.b64',
  'src/assets/site2026/komo-brand-home-v1/part06.b64',
  'src/assets/site2026/komo-brand-home-v1/part07.b64',
  'src/assets/site2026/komo-brand-home-v1/part08.b64'
];

async function writeKomoBrandHero(){
  const encoded=(await Promise.all(
    komoBrandHeroParts.map((relative)=>readFile(join(process.cwd(),relative),'utf8'))
  )).join('').replace(/\s+/g,'');
  const target=join(site,'assets','images','komo-brand-collage-v1.webp');
  await mkdir(dirname(target),{recursive:true});
  await writeFile(target,Buffer.from(encoded,'base64'));
}

const css = `
<style id="komo-commercial-trajectory-v2-style">
:root{--kt-ink:#101512;--kt-paper:#f7f5ef;--kt-warm:#eee7dc;--kt-sage:#738c7d;--kt-sage2:#dce7df;--kt-blue:#dfe9f2;--kt-line:rgba(16,21,18,.14);--kt-muted:#69716b;--kt-dark:#0d1511}
.kt-shell{width:min(1180px,calc(100% - 44px));margin:0 auto}
.kt-home{background:var(--kt-paper);color:var(--kt-ink);font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
.kt-home *{box-sizing:border-box}.kt-home a{color:inherit}
.kt-ey{margin:0 0 18px;font-size:10px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#61766a}
.kt-title{margin:0;font-family:"Iowan Old Style",Baskerville,Georgia,serif;font-weight:400;letter-spacing:-.055em;line-height:.94;font-size:clamp(46px,7vw,88px)}
.kt-title em{font-style:italic;color:#60786b}.kt-h2{margin:0;font-family:"Iowan Old Style",Baskerville,Georgia,serif;font-weight:400;letter-spacing:-.045em;line-height:.98;font-size:clamp(38px,5.3vw,68px)}
.kt-h3{margin:0;font-family:"Iowan Old Style",Baskerville,Georgia,serif;font-weight:400;letter-spacing:-.035em;font-size:clamp(28px,3vw,40px);line-height:1}
.kt-lead{margin:24px 0 0;max-width:690px;font:400 clamp(18px,1.8vw,23px)/1.55 "Iowan Old Style",Baskerville,Georgia,serif;color:#465048}
.kt-copy{margin:16px 0 0;color:#5e675f;font-size:14px;line-height:1.7}
.kt-btns{display:flex;flex-wrap:wrap;gap:10px;margin-top:30px}.kt-btn{display:inline-flex;align-items:center;justify-content:center;min-height:47px;padding:0 20px;border-radius:999px;text-decoration:none;font-size:12px;font-weight:760;letter-spacing:.02em}.kt-btn--dark{background:#111915;color:#fff}.kt-btn--light{border:1px solid var(--kt-line);background:rgba(255,255,255,.72)}.kt-btn--ghost{border:1px solid rgba(255,255,255,.2);color:#fff}
.kt-hero{padding:clamp(76px,10vw,132px) 0 64px;background:radial-gradient(circle at 86% 8%,rgba(174,205,187,.5),transparent 33%),linear-gradient(145deg,#f8f6ef 0%,#edf3ee 56%,#e9e4d8 100%)}
.kt-hero-grid{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(340px,.85fr);gap:clamp(42px,7vw,100px);align-items:center}
.kt-hero-card{padding:30px;border:1px solid rgba(16,21,18,.12);border-radius:28px;background:rgba(255,255,255,.6);box-shadow:0 34px 90px rgba(31,43,36,.11);backdrop-filter:blur(18px)}
.kt-hero-card strong{display:block;margin-bottom:22px;font-size:11px;letter-spacing:.14em;text-transform:uppercase}.kt-flow{display:grid;gap:0}.kt-flow-row{display:grid;grid-template-columns:30px 1fr auto;gap:12px;align-items:center;padding:15px 0;border-top:1px solid var(--kt-line)}.kt-flow-row:first-child{border-top:0}.kt-flow-row b{font-size:12px}.kt-flow-row span{font-size:11px;color:var(--kt-muted)}.kt-flow-row i{font-style:normal;font-size:9px;color:#60786b}
.kt-pricebar{display:flex;flex-wrap:wrap;gap:9px;margin-top:25px}.kt-pricebar span{padding:8px 11px;border-radius:999px;background:rgba(255,255,255,.58);border:1px solid rgba(16,21,18,.1);font-size:10px;color:#4e5c53}
.kt-section{padding:clamp(72px,9vw,122px) 0;border-top:1px solid var(--kt-line)}.kt-section--warm{background:var(--kt-warm)}.kt-section--sage{background:#e8efe9}.kt-section--dark{background:var(--kt-dark);color:#f7f5ef}.kt-section--dark .kt-ey{color:#9db5a6}.kt-section--dark .kt-copy,.kt-section--dark .kt-lead{color:rgba(247,245,239,.67)}
.kt-head{display:grid;grid-template-columns:minmax(0,.9fr) minmax(320px,.7fr);gap:40px;align-items:end}.kt-head .kt-copy{margin:0;max-width:590px}
.kt-doors{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;margin-top:38px}.kt-door{min-height:330px;padding:23px 20px;border:1px solid var(--kt-line);background:rgba(255,255,255,.72);border-radius:23px;display:flex;flex-direction:column}.kt-door--clinical{background:#122019;color:#f7f5ef}.kt-door--clinical .kt-copy,.kt-door--clinical .kt-kicker{color:rgba(247,245,239,.65)}.kt-kicker{font-size:9px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#68756c}.kt-door .kt-h3{margin-top:42px}.kt-door .kt-copy{max-width:34ch}.kt-door-foot{margin-top:auto;padding-top:26px;display:flex;justify-content:space-between;gap:12px;align-items:end}.kt-door-foot b{font-size:13px}.kt-door-foot a{text-decoration:none;font-size:12px;font-weight:700}.kt-account-link{font-weight:800!important;color:#283b30!important}.kt-account-panel{display:flex;align-items:center;justify-content:space-between;gap:24px;margin-top:28px;padding:21px 24px;border:1px solid var(--kt-line);border-radius:20px;background:#fff}.kt-account-panel p{margin:0;color:var(--kt-muted);font-size:13px;line-height:1.6}.kt-account-panel a{flex:none;text-decoration:none;font-size:12px;font-weight:800}
.kt-journey{display:grid;grid-template-columns:repeat(6,1fr);margin-top:50px;border-top:1px solid var(--kt-line);border-bottom:1px solid var(--kt-line)}.kt-step{min-height:220px;padding:21px 18px 24px;border-right:1px solid var(--kt-line)}.kt-step:last-child{border-right:0}.kt-step span{font-size:9px;font-weight:800;color:#718176}.kt-step h3{margin:54px 0 12px;font:400 27px/1 "Iowan Old Style",Baskerville,Georgia,serif;letter-spacing:-.04em}.kt-step p{margin:0;font-size:11px;line-height:1.55;color:#687169}
.kt-expgrid{display:grid;grid-template-columns:1.2fr .8fr .8fr;grid-template-rows:auto auto;gap:14px;margin-top:48px}.kt-exp{min-height:250px;border-radius:26px;padding:28px;background:#fff;border:1px solid var(--kt-line);display:flex;flex-direction:column}.kt-exp--yacht{grid-row:1/3;min-height:520px;background:linear-gradient(180deg,#183249,#0f2536);color:#fff}.kt-exp--yacht .kt-copy,.kt-exp--yacht .kt-kicker{color:rgba(255,255,255,.68)}.kt-exp .kt-h3{margin-top:42px}.kt-exp .kt-copy{max-width:38ch}.kt-exp a{margin-top:auto;padding-top:24px;text-decoration:none;font-size:12px;font-weight:700}
.kt-clinical-grid{display:grid;grid-template-columns:1fr 1fr;gap:clamp(38px,7vw,90px);align-items:start}.kt-clinical-panel{padding:27px;border-radius:24px;background:rgba(255,255,255,.7);border:1px solid var(--kt-line)}.kt-list{list-style:none;padding:0;margin:10px 0 0}.kt-list li{display:grid;grid-template-columns:18px 1fr;gap:10px;padding:14px 0;border-top:1px solid var(--kt-line);font-size:12px;line-height:1.5}.kt-list li:first-child{border-top:0}.kt-list li:before{content:'•';color:#6f8979}
.kt-continuity{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:45px}.kt-cont-card{padding:28px;border-radius:24px;background:#fff;border:1px solid var(--kt-line)}.kt-cont-card--world{background:#e2e9f1}.kt-cont-card strong{display:block;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#66766b}.kt-cont-card .kt-h3{margin-top:38px}
.kt-pro-grid{display:grid;grid-template-columns:.86fr 1.14fr;gap:clamp(42px,8vw,100px);align-items:start}.kt-pipeline{border-top:1px solid rgba(255,255,255,.2);margin-top:10px}.kt-pipe{display:grid;grid-template-columns:48px 1fr;gap:15px;padding:20px 0;border-bottom:1px solid rgba(255,255,255,.12)}.kt-pipe b{font-size:10px;color:#9db5a6}.kt-pipe h3{margin:0 0 7px;font:400 25px/1 "Iowan Old Style",Baskerville,Georgia,serif}.kt-pipe p{margin:0;font-size:11px;line-height:1.55;color:rgba(255,255,255,.59)}
.kt-final{padding:clamp(76px,10vw,132px) 0;background:#d8e6dd}.kt-final-grid{display:grid;grid-template-columns:1fr auto;gap:40px;align-items:end}.kt-final .kt-h2{max-width:820px}
.kt-pagehero{padding:clamp(78px,9vw,120px) 0 64px;background:linear-gradient(145deg,#f8f6ef,#e8efe9)}.kt-pagehero .kt-lead{max-width:760px}.kt-pagebody{padding:70px 0 110px;background:var(--kt-paper)}.kt-pagegrid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin-top:42px}.kt-pagecard{padding:28px;border-radius:24px;background:#fff;border:1px solid var(--kt-line)}.kt-pagecard .kt-h3{margin-top:36px}.kt-note{margin-top:20px;padding:16px 18px;border-left:2px solid #6f8979;background:#edf2ee;font-size:11px;line-height:1.6;color:#59645c}.kt-mini-flow{display:grid;grid-template-columns:repeat(5,1fr);margin-top:42px;border-top:1px solid var(--kt-line);border-bottom:1px solid var(--kt-line)}.kt-mini-flow div{padding:20px 16px;border-right:1px solid var(--kt-line)}.kt-mini-flow div:last-child{border-right:0}.kt-mini-flow b{font-size:9px;color:#6b8073}.kt-mini-flow span{display:block;margin-top:28px;font:400 22px/1 "Iowan Old Style",Baskerville,Georgia,serif}
@media(max-width:1180px){.kt-doors{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(max-width:980px){.kt-hero-grid,.kt-head,.kt-clinical-grid,.kt-pro-grid,.kt-final-grid{grid-template-columns:1fr}.kt-doors{grid-template-columns:repeat(2,minmax(0,1fr))}.kt-door{min-height:0}.kt-journey{grid-template-columns:repeat(3,1fr)}.kt-step:nth-child(3){border-right:0}.kt-expgrid{grid-template-columns:1fr 1fr}.kt-exp--yacht{grid-row:auto;grid-column:1/-1;min-height:360px}.kt-pagegrid{grid-template-columns:1fr}.kt-mini-flow{grid-template-columns:1fr}}
@media(max-width:650px){.kt-shell{width:min(100% - 28px,1180px)}.kt-hero{padding-top:58px}.kt-title{font-size:clamp(44px,14vw,64px)}.kt-hero-card{padding:21px;border-radius:20px}.kt-doors{grid-template-columns:1fr}.kt-journey{grid-template-columns:1fr}.kt-step,.kt-step:nth-child(3){min-height:0;border-right:0;border-bottom:1px solid var(--kt-line)}.kt-step:last-child{border-bottom:0}.kt-step h3{margin-top:26px}.kt-expgrid,.kt-continuity{grid-template-columns:1fr}.kt-exp--yacht{grid-column:auto;min-height:320px}.kt-exp{min-height:240px}.kt-account-panel{align-items:flex-start;flex-direction:column}.kt-final .kt-btns{margin-top:0}.kt-mini-flow div{border-right:0;border-bottom:1px solid var(--kt-line)}.kt-mini-flow div:last-child{border-bottom:0}}

/* Editorial KŌMØ public experience: photo-led, quiet, and easy to scan. */
.kt-home{--kt-paper:#faf9f6;--kt-ink:#202722;--kt-muted:#6a706a;background:#faf9f6;color:#202722}
.kt-z-hero{position:relative;isolation:isolate;min-height:min(690px,calc(100svh - 92px));display:flex;align-items:center;padding:92px 0 78px;overflow:hidden;background:#dfe5e3}
.kt-z-hero-media{position:absolute;inset:0;z-index:-2}.kt-z-hero-media img{display:block;width:100%;height:100%;object-fit:cover;object-position:center 52%}
.kt-z-hero:after{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(90deg,rgba(248,248,244,.97) 0%,rgba(248,248,244,.9) 34%,rgba(248,248,244,.32) 61%,rgba(248,248,244,0) 82%)}
.kt-z-hero .kt-shell{width:min(1320px,calc(100% - 64px))}.kt-z-hero-copy{max-width:660px}.kt-z-hero .kt-ey{color:#536a5d}.kt-z-hero .kt-title{font-size:clamp(54px,7.1vw,94px);line-height:.98;letter-spacing:-.058em}.kt-z-hero .kt-title em{color:#617a6b}.kt-z-hero .kt-lead{max-width:550px;margin-top:26px;color:#37443c;font:400 clamp(18px,1.65vw,21px)/1.55 Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
.kt-z-underhero{padding:22px 0;border-bottom:1px solid rgba(29,39,32,.13);background:#faf9f6}.kt-z-underhero-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.kt-z-proof{display:flex;gap:13px;align-items:center;padding:7px 12px}.kt-z-proof b{font-family:"Iowan Old Style",Baskerville,Georgia,serif;font-size:20px;font-weight:400}.kt-z-proof span{max-width:24ch;color:#626c65;font-size:11px;line-height:1.5}
.kt-z-section{padding:clamp(72px,9vw,116px) 0}.kt-z-section--sand{background:#f0eee7}.kt-z-section--sage{background:#e8eeea}.kt-z-section--deep{background:#1c2822;color:#f8f8f4}.kt-z-section--deep .kt-ey{color:#b7c5bb}.kt-z-section--deep .kt-copy,.kt-z-section--deep .kt-lead{color:rgba(248,248,244,.72)}
.kt-z-heading{display:flex;justify-content:space-between;align-items:end;gap:52px}.kt-z-heading>div{max-width:640px}.kt-z-heading .kt-copy{max-width:390px;margin:0}.kt-z-heading .kt-h2{font-size:clamp(38px,5vw,66px)}
.kt-z-offers{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;margin-top:42px}.kt-z-card{position:relative;overflow:hidden;border-radius:20px;background:#fff;box-shadow:0 14px 42px rgba(31,40,34,.055)}.kt-z-card-media{height:228px;overflow:hidden;background:#e7e7df}.kt-z-card-media img{display:block;width:100%;height:100%;object-fit:cover;transition:transform .55s ease}.kt-z-card:hover .kt-z-card-media img{transform:scale(1.035)}.kt-z-card-body{display:flex;min-height:278px;flex-direction:column;padding:25px 25px 23px}.kt-z-card .kt-kicker{color:#687b6d}.kt-z-card h3{margin:22px 0 0;font:400 clamp(30px,3.2vw,39px)/1 "Iowan Old Style",Baskerville,Georgia,serif;letter-spacing:-.04em}.kt-z-card .kt-copy{margin-top:14px;max-width:36ch}.kt-z-card-meta{display:flex;justify-content:space-between;align-items:end;gap:18px;margin-top:auto;padding-top:27px}.kt-z-card-meta b{font-size:12px;font-weight:650}.kt-z-card-meta a{color:#263b2e;text-decoration:none;font-size:12px;font-weight:750}.kt-z-card--clinical{background:#e8eeea}.kt-z-card--signature{background:#eee7dc}
.kt-z-method{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,.8fr);gap:clamp(42px,8vw,100px);align-items:center}.kt-z-method-image{height:490px;overflow:hidden;border-radius:22px;background:#d6ddd8}.kt-z-method-image img{width:100%;height:100%;display:block;object-fit:cover}.kt-z-pillars{display:grid;grid-template-columns:repeat(3,1fr);gap:0;margin-top:36px;border-top:1px solid var(--kt-line);border-bottom:1px solid var(--kt-line)}.kt-z-pillar{padding:18px 16px 20px 0}.kt-z-pillar b{display:block;color:#718579;font-size:10px;letter-spacing:.12em}.kt-z-pillar strong{display:block;margin-top:18px;font:400 24px/1 "Iowan Old Style",Baskerville,Georgia,serif}.kt-z-pillar p{margin:10px 0 0;color:#646d66;font-size:11px;line-height:1.55}
.kt-z-orient{display:grid;grid-template-columns:.8fr 1.2fr;gap:60px;align-items:start}.kt-z-options{display:grid;gap:10px}.kt-z-option{display:flex;justify-content:space-between;gap:20px;align-items:center;padding:20px 22px;background:#fff;border:1px solid rgba(29,39,32,.13);border-radius:14px;text-decoration:none;transition:transform .2s ease,border-color .2s ease}.kt-z-option:hover{transform:translateY(-2px);border-color:#728779}.kt-z-option span{color:#758078;font-size:10px;letter-spacing:.12em}.kt-z-option strong{display:block;margin-top:8px;font:400 25px/1 "Iowan Old Style",Baskerville,Georgia,serif}.kt-z-option i{font-style:normal;font-size:18px}
.kt-z-locations{display:grid;grid-template-columns:repeat(6,1fr);gap:14px;margin-top:40px}.kt-z-location{position:relative;grid-column:span 2;min-height:280px;overflow:hidden;border-radius:18px;background:#dce2dc;color:white}.kt-z-location:nth-child(1),.kt-z-location:nth-child(4){grid-column:span 3}.kt-z-location img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .6s ease}.kt-z-location:hover img{transform:scale(1.035)}.kt-z-location:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(12,24,17,.02) 18%,rgba(12,24,17,.72) 100%)}.kt-z-location-copy{position:absolute;z-index:1;left:23px;right:23px;bottom:22px}.kt-z-location .kt-kicker{color:rgba(255,255,255,.8)}.kt-z-location h3{margin:10px 0 0;font:400 30px/1 "Iowan Old Style",Baskerville,Georgia,serif}.kt-z-location p{margin:9px 0 0;max-width:43ch;color:rgba(255,255,255,.84);font-size:11px;line-height:1.5}
.kt-z-continuity{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:36px}.kt-z-continuity article{padding:30px;border-radius:18px;background:#fff;border:1px solid rgba(29,39,32,.1)}.kt-z-continuity article:last-child{background:#e6ebf0}.kt-z-continuity h3{margin:27px 0 0;font:400 32px/1 "Iowan Old Style",Baskerville,Georgia,serif}.kt-z-continuity .kt-btns{margin-top:20px}
.kt-z-faq{display:grid;grid-template-columns:.8fr 1.2fr;gap:60px;align-items:start}.kt-z-faq details{padding:19px 0;border-bottom:1px solid rgba(29,39,32,.16)}.kt-z-faq summary{cursor:pointer;font-size:14px;font-weight:650;list-style:none}.kt-z-faq summary::-webkit-details-marker{display:none}.kt-z-faq summary:after{content:"+";float:right;font-size:20px;font-weight:400}.kt-z-faq details[open] summary:after{content:"−"}.kt-z-faq details p{max-width:68ch;color:#606b63;font-size:13px;line-height:1.7}
.kt-z-final{padding:80px 0;background:#d9e4dc}.kt-z-final .kt-final-grid{grid-template-columns:1fr auto;align-items:center}.kt-z-final .kt-h2{max-width:820px}.kt-z-about-grid{display:grid;grid-template-columns:.85fr 1.15fr;gap:50px;align-items:start;margin-top:36px}.kt-z-about-grid>article{padding:30px;background:#fff;border-radius:18px}.kt-z-program-grid{display:grid;grid-template-columns:.8fr 1.2fr;gap:52px;align-items:start}.kt-z-program-visual{min-height:430px;overflow:hidden;border-radius:20px;background:#e5e7e1}.kt-z-program-visual img{width:100%;height:100%;min-height:430px;object-fit:cover;display:block}
@media(max-width:900px){.kt-z-heading{align-items:start;flex-direction:column;gap:18px}.kt-z-method,.kt-z-orient,.kt-z-faq,.kt-z-about-grid,.kt-z-program-grid{grid-template-columns:1fr}.kt-z-offers{grid-template-columns:1fr 1fr}.kt-z-card:last-child{grid-column:1/-1}.kt-z-method-image{height:350px}.kt-z-locations{grid-template-columns:repeat(2,1fr)}.kt-z-location,.kt-z-location:nth-child(1),.kt-z-location:nth-child(4){grid-column:span 1}.kt-z-location:last-child{grid-column:1/-1}}
@media(max-width:640px){.kt-z-hero{min-height:680px;align-items:flex-end;padding:80px 0 50px}.kt-z-hero .kt-shell{width:min(100% - 32px,1320px)}.kt-z-hero:after{background:linear-gradient(0deg,rgba(248,248,244,.98) 0%,rgba(248,248,244,.91) 42%,rgba(248,248,244,.15) 100%)}.kt-z-hero-media img{object-position:66% center}.kt-z-hero .kt-title{font-size:clamp(45px,13.5vw,64px)}.kt-z-hero .kt-lead{font-size:17px;line-height:1.5}.kt-z-underhero-grid{grid-template-columns:1fr;gap:3px}.kt-z-proof{padding:7px 0}.kt-z-offers{grid-template-columns:1fr}.kt-z-card:last-child{grid-column:auto}.kt-z-card-media{height:205px}.kt-z-card-body{min-height:245px}.kt-z-pillars{grid-template-columns:1fr}.kt-z-pillar{padding:16px 0;border-bottom:1px solid var(--kt-line)}.kt-z-pillar:last-child{border-bottom:0}.kt-z-locations{grid-template-columns:1fr}.kt-z-location,.kt-z-location:nth-child(1),.kt-z-location:nth-child(4),.kt-z-location:last-child{grid-column:auto;min-height:260px}.kt-z-continuity{grid-template-columns:1fr}.kt-z-final .kt-final-grid{grid-template-columns:1fr}}
</style>`;

const localeData = {
  fr: {
    homeFiles: ['index.html','fr/index.html'],
    assessmentFile: 'fr/motion/index.html',
    legacyAssessmentFile: 'fr/bilan/index.html',
    signatureFile: 'fr/signature/index.html',
    aboutFile: 'fr/a-propos/index.html',
    experienceFile: 'fr/experience/index.html',
    scienceFile: 'fr/science/index.html',
    clinicalFile: 'fr/clinical/index.html',
    partnersFile: 'fr/partners/index.html',
    pulseFile: 'fr/pulse/index.html',
    paths: { home:'/', assessment:'/fr/motion/', signature:'/fr/signature/', clinical:'/fr/clinical/', experience:'/fr/experience/', partners:'/fr/partners/', contact:'/fr/contact/?intent=experience', pulse:'https://pulse.komolongevity.com/', booking:'/fr/contact/?intent=experience', world:'/world/', method:'/fr/science/', science:'/fr/science/', about:'/fr/a-propos/', offers:'#komo-offers' },
    metaTitle:'KŌMØ — Santé en mouvement | Motion, Clinical & expériences sur mesure',
    metaDescription:'KŌMØ associe évaluation fonctionnelle, accompagnement médical lorsqu’il est indiqué et expériences sur mesure à domicile, en hôtel, à bord ou en retreat.',
    heroEy:'KŌMØ · LONGÉVITÉ EN MOUVEMENT',
    heroTitle:'Mesurer et suivre vos capacités fonctionnelles',
    heroLead:'Évaluer le mouvement. Comprendre ses repères. Choisir la suite avec des professionnels adaptés — dans un même parcours KŌMØ.',
    heroPrimary:'Réserver une expérience',
    heroSecondary:'Découvrir KŌMØ',
    loginLabel:'Se connecter',
    singleAccount:'Un seul compte KŌMØ vous donne accès à Pulse et, lorsque votre accompagnement le prévoit, à Clinical, Life et World. Vos données et vos étapes restent réunies dans votre parcours.',
    prices:['Motion · à partir de 300 €','Clinical · consultation à partir de 500 €','Signature · sur proposition'],
    proofs:[['Motion','Évaluation fonctionnelle du mouvement'],['Clinical','Consultation médicale quand elle est indiquée'],['Anywhere','Chez vous, en hôtel, à bord ou en retreat']],
    doors:[
      ['ÉVALUATION FONCTIONNELLE','KŌMØ Motion','Une lecture structurée de la marche, de l’équilibre, de la force et du mouvement. Résultats restitués avec des priorités compréhensibles.','À partir de 300 €','Découvrir Motion','assessment','/assets/images/real-case/komo-six-myodev-sensors.jpeg'],
      ['ACCOMPAGNEMENT MÉDICAL','KŌMØ Clinical','Un parcours médical conduit par un médecin lorsque l’histoire, les résultats ou les symptômes le justifient.','Consultation à partir de 500 €','Découvrir Clinical','clinical','/assets/images/clinical-pathway-v1.webp'],
      ['PROGRAMME SUR MESURE','KŌMØ Signature','Un accompagnement coordonné dans le lieu et au rythme qui vous conviennent, pensé autour de vos objectifs.','Sur proposition','Parler de mon projet','signature','/assets/images/hero-mediterranean-motion-v1.webp']
    ],
    offerEy:'TROIS FAÇONS DE COMMENCER',
    offerTitle:'Choisir le niveau d’accompagnement adapté',
    offerLead:'Choisissez le niveau de réponse qui correspond à votre besoin. Motion et Clinical ont des objectifs différents; Signature coordonne un format personnalisé.',
    journeyEy:'LA MÉTHODE KŌMØ',
    journeyTitle:'Une méthode structurée de l’évaluation au suivi',
    journeyLead:'Une méthode lisible, de l’évaluation au suivi. Chaque étape éclaire la suivante et laisse la place au bon professionnel lorsque c’est nécessaire.',
    journey:[['01','Mesurer','Une évaluation fonctionnelle structurée, expliquée dans son contexte.'],['02','Comprendre','Une restitution claire relie les résultats à vos objectifs.'],['03','Progresser','Un plan adapté, un suivi et une réévaluation au bon moment.']],
    choiceEy:'TROUVER LE BON PARCOURS',
    choiceTitle:'Par où souhaitez-vous commencer ?',
    choiceLead:'Choisissez votre intention. Cette orientation vous présente l’offre correspondante; elle ne remplace pas un avis médical.',
    choices:[['01 · MOUVEMENT','Je veux mieux comprendre mon mouvement','Marche, équilibre, force et capacités fonctionnelles.','assessment'],['02 · AVIS MÉDICAL','Je cherche une évaluation médicale','Une consultation est envisagée selon votre situation et l’indication clinique.','clinical'],['03 · SUR MESURE','Je souhaite un programme personnalisé','Un format privé, une expérience sur place ou une coordination dédiée.','signature']],
    expEy:'KŌMØ EXPERIENCES',
    expTitle:'KŌMØ dans votre environnement',
    expLead:'KŌMØ Anywhere s’adapte au lieu et à votre rythme : à bord, dans un hôtel, chez vous, au travail ou pendant un retreat.',
    experiences:[
      ['À BORD','En mer','Une expérience personnalisée à bord, avec évaluation, restitution et continuité après le voyage.','Découvrir Yachting','experience','/assets/images/hero-mediterranean-motion-v1.webp'],
      ['HOSPITALITÉ','À l’hôtel','Des consultations ou journées KŌMØ intégrées à l’expérience d’un hôtel ou d’un club partenaire.','Pour les professionnels','partners','/assets/images/clinical-pathway-v1.webp'],
      ['À DOMICILE','Chez vous','Une évaluation fonctionnelle dans un cadre privé, selon le format disponible dans votre région.','Demander une consultation','contact','/assets/images/hero-chair-balance-v1.webp'],
      ['AU TRAVAIL','En entreprise','Des journées de prévention et de mouvement conçues avec l’organisation et ses professionnels de santé.','Imaginer un format','partners','/assets/images/real-case/komo-motion-tablet.jpeg'],
      ['EN SÉJOUR','En retreat','Un temps collectif pour évaluer, bouger et organiser la continuité au retour.','Explorer les retreats','experience','/assets/images/hero-mediterranean-motion-v1.webp']
    ],
    experiencesCta:'Découvrir les expériences',
    clinicalEy:'KŌMØ CLINICAL',
    clinicalTitle:'KŌMØ Clinical : consultation et interprétation médicale',
    clinicalLead:'Clinical revient au premier plan : ce n’est pas un “upgrade premium”, mais la voie médicale de KŌMØ lorsqu’une situation nécessite une consultation, un examen ou une décision clinique.',
    clinicalItems:['Consultation médicale et histoire fonctionnelle','Examen clinique selon le contexte','Biologie, imagerie ou examens complémentaires uniquement si indiqués','Plan de rééducation, exercice ou orientation vers le bon professionnel','Coordination et réévaluation dans le temps'],
    clinicalNote:'Les actes médicaux restent distincts des offres wellness et ne sont proposés que dans un cadre professionnel, réglementaire et territorial approprié.',
    clinicalCta:'Voir le parcours Clinical',
    motionCta:'Découvrir Motion',
    teamTitle:'Une équipe coordonnée selon votre parcours.',
    teamCopy:'Selon le programme et l’indication, KŌMØ peut coordonner médecin, kinésithérapeute, coach, infirmier ou autres professionnels. L’objectif n’est pas d’empiler des prestations : c’est de rendre l’étape suivante évidente et exécutable.',
    pulseTitle:'Pulse centralise le suivi.',
    pulseCopy:'Résultats, priorités, programme, professionnels, progression et prochaine réévaluation : Pulse prolonge la consultation et garde toute la trajectoire dans un même espace.',
    worldTitle:'World reste une extension optionnelle.',
    worldCopy:'World est une couche optionnelle pour le mouvement guidé, les contenus et l’engagement. Votre programme reste accessible dans une interface classique; l’expérience 3D n’est jamais obligatoire.',
    continuityEy:'UN COMPTE KŌMØ',
    optionalLabel:'OPTIONNEL',
    faqEy:'QUESTIONS FRÉQUENTES',
    faqTitle:'Quelques repères avant de commencer.',
    faqLead:'Une première conversation permet de choisir le format et le lieu adaptés.',
    faq:[['Quelle différence entre Motion et Clinical ?','Motion propose une évaluation fonctionnelle et une restitution non médicale. Clinical correspond à une consultation médicale, uniquement lorsqu’elle est indiquée et délivrée dans un cadre approprié.'],['Dois-je me déplacer ?','Pas nécessairement. Selon les services disponibles, KŌMØ Anywhere peut se vivre à domicile, à bord, en hôtel, au travail ou dans un retreat.'],['Où retrouver mes informations ?','Pulse est l’espace connecté KŌMØ. Le bouton « Se connecter » ouvre directement votre espace existant.'],['World est-il obligatoire ?','Non. World est une option d’accompagnement; votre parcours peut se dérouler sans expérience 3D.']],
    proEy:'POUR LES PROFESSIONNELS',
    proTitle:'Déployer un service KŌMØ dans votre établissement',
    proLead:'KŌMØ peut intervenir sur site pour tester le service, mesurer la demande et structurer un programme récurrent. La Case devient pertinente lorsqu’un déploiement permanent est justifié.',
    pipeline:[['01','Pilote sur site','KŌMØ intervient avec son équipe et son matériel.'],['02','Sessions facturées','Le partenaire mesure la demande, le taux de réservation et la satisfaction.'],['03','Programme récurrent','Des journées ou créneaux KŌMØ sont planifiés de façon régulière.'],['04','Formation','L’équipe partenaire est formée aux opérations relevant de son périmètre.'],['05','Installation','La Case équipe le site lorsque le volume d’activité le justifie.']],
    finalTitle:'Organiser votre première consultation KŌMØ',
    finalCopy:'Particulier, hôtel, yacht, clinique ou club : nous définissons le format, le lieu et le niveau d’accompagnement avant la première intervention.',
    finalCta:'Demander une consultation',
    finalEy:'COMMENCER AVEC KŌMØ',
    scienceCta:'Voir notre approche scientifique',
    proCta:'Échanger avec KŌMØ',
    aboutTitle:'KŌMØ relie évaluation fonctionnelle et suivi dans le temps',
    aboutLead:'KŌMØ relie la mesure fonctionnelle, l’expertise clinique lorsqu’elle est requise et un accompagnement qui s’inscrit dans la vie réelle.',
    aboutSectionTitle:'Une approche coordonnée autour de la personne.',
    aboutSectionCopy:'Nos expériences réunissent des protocoles fonctionnels, des professionnels qualifiés et une restitution compréhensible. Chaque service conserve son rôle : Motion n’est pas un diagnostic médical; Clinical relève de la responsabilité du médecin.',
    aboutMethodTitle:'L’évaluation fonctionnelle au cœur de la méthode KŌMØ.',
    aboutMethodCopy:'Nous observons le mouvement, la force, l’équilibre et les capacités fonctionnelles pour ouvrir une conversation concrète sur la suite. Le cadre, les outils et l’équipe évoluent selon le lieu et le parcours.',
    nav:[['Motion','assessment'],['Clinical','clinical'],['Expériences','experience'],['Science','science'],['Professionnels','partners'],['À propos','about'],['Se connecter','pulse']]
  },
  en: {
    homeFiles: ['en/index.html'],
    homeSourceFile: 'index.html',
    assessmentFile: 'motion/index.html',
    legacyAssessmentFile: 'assessment/index.html',
    signatureFile: 'signature/index.html',
    aboutFile: 'about/index.html',
    experienceFile: 'experience/index.html',
    scienceFile: 'science/index.html',
    clinicalFile: 'clinical/index.html',
    partnersFile: 'partners/index.html',
    pulseFile: 'pulse/index.html',
    paths: { home:'/en/', assessment:'/motion/', signature:'/signature/', clinical:'/clinical/', experience:'/experience/', partners:'/partners/', contact:'/contact/?intent=experience', pulse:'https://pulse.komolongevity.com/', booking:'/contact/?intent=experience', world:'/world/', method:'/science/', science:'/science/', about:'/about/', offers:'#komo-offers' },
    metaTitle:'KŌMØ — Health in motion | Motion, Clinical & tailored experiences',
    metaDescription:'KŌMØ connects functional assessment, medical care when indicated, and tailored experiences at home, in hotels, onboard or on retreat.',
    heroEy:'KŌMØ · LONGEVITY IN MOTION',
    heroTitle:'Measure and track functional capacity',
    heroLead:'Measure movement. Make sense of the signals. Choose a next step with the right professionals — within one KŌMØ pathway.',
    heroPrimary:'Book an experience',
    heroSecondary:'Discover KŌMØ',
    loginLabel:'Sign in',
    singleAccount:'One KŌMØ account connects you to Pulse and, when your pathway calls for them, Clinical, Life and World. Your information and next steps stay together.',
    prices:['Motion · from €300','Clinical · consultation from €500','Signature · by proposal'],
    proofs:[['Motion','Functional movement assessment'],['Clinical','Medical consultation when indicated'],['Anywhere','At home, in hotels, onboard or on retreat']],
    doors:[
      ['FUNCTIONAL ASSESSMENT','KŌMØ Motion','A structured view of gait, balance, strength and movement, followed by a debrief and clear priorities.','From €300','Explore Motion','assessment','/assets/images/real-case/komo-six-myodev-sensors.jpeg'],
      ['MEDICAL CARE','KŌMØ Clinical','A physician-led pathway when your history, results or symptoms call for medical input.','Consultation from €500','Explore Clinical','clinical','/assets/images/clinical-pathway-v1.webp'],
      ['TAILORED PROGRAMME','KŌMØ Signature','A coordinated programme shaped around your goals, chosen setting and preferred pace.','By proposal','Discuss your plans','signature','/assets/images/hero-mediterranean-motion-v1.webp']
    ],
    offerEy:'THREE WAYS TO BEGIN',
    offerTitle:'Choose the right level of support',
    offerLead:'Choose the level of support that fits your needs. Motion and Clinical serve different purposes; Signature coordinates a tailored format.',
    journeyEy:'THE KŌMØ METHOD',
    journeyTitle:'A structured method from assessment to follow-up',
    journeyLead:'A clear method from assessment to follow-up. Each step informs the next and brings in the right professional when needed.',
    journey:[['01','Measure','Structured functional assessment, explained in context.'],['02','Understand','A clear debrief connects the findings to your goals.'],['03','Progress','A tailored plan, follow-up and reassessment at the right time.']],
    choiceEy:'FIND YOUR STARTING POINT',
    choiceTitle:'What brings you to KŌMØ?',
    choiceLead:'Choose what you are looking for. This helps you explore the right service; it does not replace medical advice.',
    choices:[['01 · MOVEMENT','I want to understand my movement','Gait, balance, strength and functional capacity.','assessment'],['02 · MEDICAL','I am looking for medical assessment','A consultation is considered according to your situation and clinical indication.','clinical'],['03 · TAILORED','I want a personalised programme','A private format, an on-site experience or dedicated coordination.','signature']],
    expEy:'KŌMØ EXPERIENCES',
    expTitle:'KŌMØ in your own environment',
    expLead:'KŌMØ Anywhere adapts to your setting and schedule: onboard, in a hotel, at home, at work or on retreat.',
    experiences:[
      ['ONBOARD','At sea','A private onboard experience with assessment, debrief and continuity after the voyage.','Explore Yachting','experience','/assets/images/hero-mediterranean-motion-v1.webp'],
      ['HOSPITALITY','In hotels','KŌMØ consultations and service days as part of a hotel or club experience.','For professionals','partners','/assets/images/clinical-pathway-v1.webp'],
      ['AT HOME','At home','A functional assessment in a private setting, depending on service availability in your region.','Request a consultation','contact','/assets/images/hero-chair-balance-v1.webp'],
      ['AT WORK','At work','Movement and prevention days designed with the organisation and its health professionals.','Shape a format','partners','/assets/images/real-case/komo-motion-tablet.jpeg'],
      ['ON RETREAT','On retreat','Time to assess, move and plan how to maintain progress after the stay.','Explore retreats','experience','/assets/images/hero-mediterranean-motion-v1.webp']
    ],
    experiencesCta:'Explore experiences',
    clinicalEy:'KŌMØ CLINICAL',
    clinicalTitle:'KŌMØ Clinical: medical consultation and clinical interpretation',
    clinicalLead:'Clinical returns to the foreground. It is not a premium upsell; it is the medical KŌMØ pathway when consultation, examination or clinical decision-making is required.',
    clinicalItems:['Medical consultation and functional history','Clinical examination according to context','Biology, imaging or other investigations only when indicated','Rehabilitation, exercise or referral plan','Coordination and reassessment over time'],
    clinicalNote:'Medical acts remain distinct from wellness offers and are delivered only within the appropriate professional, regulatory and territorial framework.',
    clinicalCta:'View the Clinical pathway',
    motionCta:'Explore Motion',
    teamTitle:'A coordinated team for your pathway.',
    teamCopy:'Depending on the programme and indication, KŌMØ can coordinate a physician, physiotherapist, coach, nurse or other professionals. The goal is not to stack services; it is to make the next step executable.',
    pulseTitle:'Pulse centralises follow-up.',
    pulseCopy:'Results, priorities, programme, professionals, progress and the next reassessment: Pulse extends the consultation and keeps the whole trajectory in one place.',
    worldTitle:'World remains an optional extension.',
    worldCopy:'World is an optional layer for guided movement, education and engagement. You can follow your programme through the standard interface; immersive 3D is never required.',
    continuityEy:'ONE KŌMØ ACCOUNT',
    optionalLabel:'OPTIONAL',
    faqEy:'COMMON QUESTIONS',
    faqTitle:'Frequently asked questions about Motion, Clinical and Pulse.',
    faqLead:'A first conversation helps us choose a suitable format and setting.',
    faq:[['How are Motion and Clinical different?','Motion provides functional assessment and non-medical feedback. Clinical is a medical consultation, offered when indicated and delivered in the appropriate professional setting.'],['Do I need to travel?','Not always. Depending on local availability, KŌMØ Anywhere can take place at home, onboard, in a hotel, at work or on retreat.'],['Where can I find my information?','Pulse is your connected KŌMØ space. Use “Sign in” to open your existing account.'],['Do I have to use World in 3D?','No. World is an optional support layer; your pathway can work without an immersive 3D experience.']],
    proEy:'FOR PROFESSIONALS',
    proTitle:'Deploy KŌMØ within your organisation',
    proLead:'KŌMØ can deliver the service on site, measure real demand and structure a recurring programme. The Case becomes relevant when a permanent deployment is justified.',
    pipeline:[['01','On-site pilot','KŌMØ delivers with its own team and equipment.'],['02','Paid sessions','The partner measures demand, booking rate and client satisfaction.'],['03','Recurring programme','KŌMØ days or appointment slots are scheduled regularly.'],['04','Training','The partner team is trained for the operations within its scope.'],['05','Installation','The Case equips the site when activity volume justifies it.']],
    finalTitle:'Book your first KŌMØ consultation',
    finalCopy:'Individual, hotel, yacht, clinic or club: we define the format, setting and level of support before the first delivery.',
    finalCta:'Request a consultation',
    finalEy:'START WITH KŌMØ',
    scienceCta:'Explore our scientific approach',
    proCta:'Talk with KŌMØ',
    aboutTitle:'KŌMØ connects functional assessment with longitudinal follow-up',
    aboutLead:'KŌMØ brings functional assessment, clinical expertise when required and support that fits into real life.',
    aboutSectionTitle:'A coordinated approach centred on the person.',
    aboutSectionCopy:'Our experiences bring together functional protocols, qualified professionals and clear feedback. Each service keeps its purpose: Motion is not a medical diagnosis; Clinical sits within the physician’s responsibility.',
    aboutMethodTitle:'Functional assessment is central to the KŌMØ method.',
    aboutMethodCopy:'We observe movement, strength, balance and functional capacity to open a practical conversation about what comes next. The setting, tools and team adapt to the place and pathway.',
    nav:[['Motion','assessment'],['Clinical','clinical'],['Experiences','experience'],['Science','science'],['Professionals','partners'],['About','about'],['Sign in','pulse']]
  },
  es: {
    homeFiles: ['es/index.html'],
    assessmentFile: 'es/motion/index.html',
    legacyAssessmentFile: 'es/evaluacion/index.html',
    signatureFile: 'es/signature/index.html',
    aboutFile: 'es/sobre/index.html',
    experienceFile: 'es/experience/index.html',
    scienceFile: 'es/science/index.html',
    clinicalFile: 'es/clinical/index.html',
    partnersFile: 'es/partners/index.html',
    pulseFile: 'es/pulse/index.html',
    paths: { home:'/es/', assessment:'/es/motion/', signature:'/es/signature/', clinical:'/es/clinical/', experience:'/es/experience/', partners:'/es/partners/', contact:'/es/contact/?intent=experience', pulse:'https://pulse.komolongevity.com/', booking:'/es/contact/?intent=experience', world:'/world/', method:'/es/science/', science:'/es/science/', about:'/es/sobre/', offers:'#komo-offers' },
    metaTitle:'KŌMØ — Salud en movimiento | Motion, Clinical y experiencias a medida',
    metaDescription:'KŌMØ conecta evaluación funcional, atención médica cuando está indicada y experiencias a medida en casa, hoteles, a bordo o en retiros.',
    heroEy:'KŌMØ · LONGEVIDAD EN MOVIMIENTO',
    heroTitle:'Medir y seguir la capacidad funcional',
    heroLead:'Medir el movimiento. Comprender las señales. Elegir el siguiente paso con los profesionales adecuados — en un mismo recorrido KŌMØ.',
    heroPrimary:'Reservar una experiencia',
    heroSecondary:'Descubrir KŌMØ',
    loginLabel:'Acceder',
    singleAccount:'Una sola cuenta KŌMØ te da acceso a Pulse y, cuando tu recorrido lo requiere, a Clinical, Life y World. Tus datos y próximos pasos permanecen reunidos.',
    prices:['Motion · desde 300 €','Clinical · consulta desde 500 €','Signature · propuesta personalizada'],
    proofs:[['Motion','Evaluación funcional del movimiento'],['Clinical','Consulta médica cuando está indicada'],['Anywhere','En casa, hoteles, a bordo o en retreat']],
    doors:[
      ['EVALUACIÓN FUNCIONAL','KŌMØ Motion','Una lectura estructurada de la marcha, el equilibrio, la fuerza y el movimiento, seguida de una explicación clara y prioridades.','Desde 300 €','Descubrir Motion','assessment','/assets/images/real-case/komo-six-myodev-sensors.jpeg'],
      ['ATENCIÓN MÉDICA','KŌMØ Clinical','Un recorrido dirigido por un médico cuando la historia, los resultados o los síntomas requieren una valoración médica.','Consulta desde 500 €','Descubrir Clinical','clinical','/assets/images/clinical-pathway-v1.webp'],
      ['PROGRAMA A MEDIDA','KŌMØ Signature','Un acompañamiento coordinado según tus objetivos, el lugar elegido y tu ritmo.','Propuesta personalizada','Cuéntanos tu proyecto','signature','/assets/images/hero-mediterranean-motion-v1.webp']
    ],
    offerEy:'TRES FORMAS DE EMPEZAR',
    offerTitle:'Elegir el nivel de acompañamiento adecuado',
    offerLead:'Elige el nivel de apoyo que mejor responde a tus necesidades. Motion y Clinical cumplen funciones distintas; Signature coordina un formato personalizado.',
    journeyEy:'EL MÉTODO KŌMØ',
    journeyTitle:'Un método estructurado desde la evaluación hasta el seguimiento',
    journeyLead:'Un método claro desde la evaluación hasta el seguimiento. Cada paso orienta el siguiente e incorpora al profesional adecuado cuando hace falta.',
    journey:[['01','Medir','Evaluación funcional estructurada, explicada en su contexto.'],['02','Comprender','Una restitución clara relaciona los resultados con tus objetivos.'],['03','Progresar','Un plan adaptado, seguimiento y reevaluación en el momento oportuno.']],
    choiceEy:'ENCUENTRA TU PUNTO DE PARTIDA',
    choiceTitle:'¿Qué buscas en KŌMØ?',
    choiceLead:'Elige lo que necesitas. Esta orientación ayuda a explorar el servicio adecuado; no sustituye el consejo médico.',
    choices:[['01 · MOVIMIENTO','Quiero comprender mejor mi movimiento','Marcha, equilibrio, fuerza y capacidad funcional.','assessment'],['02 · MÉDICO','Busco una evaluación médica','La consulta se valora según tu situación y la indicación clínica.','clinical'],['03 · A MEDIDA','Quiero un programa personalizado','Un formato privado, una experiencia en el lugar o coordinación dedicada.','signature']],
    expEy:'KŌMØ EXPERIENCES',
    expTitle:'KŌMØ en tu propio entorno',
    expLead:'KŌMØ Anywhere se adapta al lugar y a tu horario: a bordo, en un hotel, en casa, en el trabajo o durante un retreat.',
    experiences:[
      ['A BORDO','En el mar','Una experiencia privada con evaluación, restitución y continuidad después del viaje.','Descubrir Yachting','experience','/assets/images/hero-mediterranean-motion-v1.webp'],
      ['HOSPITALIDAD','En hoteles','Consultas o jornadas KŌMØ integradas en la experiencia de un hotel o club asociado.','Para profesionales','partners','/assets/images/clinical-pathway-v1.webp'],
      ['EN CASA','En tu hogar','Evaluación funcional en un entorno privado, según la disponibilidad en tu región.','Solicitar consulta','contact','/assets/images/hero-chair-balance-v1.webp'],
      ['EN EL TRABAJO','En la empresa','Jornadas de movimiento y prevención diseñadas junto a la organización y sus profesionales de salud.','Diseñar un formato','partners','/assets/images/real-case/komo-motion-tablet.jpeg'],
      ['EN RETREAT','En retreat','Tiempo para evaluar, moverse y organizar la continuidad después de la estancia.','Ver retreats','experience','/assets/images/hero-mediterranean-motion-v1.webp']
    ],
    experiencesCta:'Descubrir experiencias',
    clinicalEy:'KŌMØ CLINICAL',
    clinicalTitle:'KŌMØ Clinical: consulta médica e interpretación clínica',
    clinicalLead:'Clinical vuelve al primer plano. No es un upsell premium; es la vía médica de KŌMØ cuando se requiere consulta, exploración o decisión clínica.',
    clinicalItems:['Consulta médica e historia funcional','Exploración clínica según contexto','Biología, imagen u otras pruebas solo si están indicadas','Plan de rehabilitación, ejercicio o derivación','Coordinación y reevaluación'],
    clinicalNote:'Los actos médicos permanecen separados de las ofertas wellness y solo se realizan dentro del marco profesional, regulatorio y territorial apropiado.',
    clinicalCta:'Ver el recorrido Clinical',
    motionCta:'Descubrir Motion',
    teamTitle:'Un equipo coordinado según tu recorrido.',
    teamCopy:'Según programa e indicación, KŌMØ puede coordinar médico, fisioterapeuta, coach, enfermería u otros profesionales. El objetivo no es acumular servicios, sino hacer ejecutable el siguiente paso.',
    pulseTitle:'Pulse centraliza el seguimiento.',
    pulseCopy:'Resultados, prioridades, programa, profesionales, progreso y próxima reevaluación: Pulse prolonga la consulta y mantiene toda la trayectoria en un solo espacio.',
    worldTitle:'World sigue siendo una extensión opcional.',
    worldCopy:'World es una capa opcional para movimiento guiado, educación y participación. Puedes seguir tu programa con la interfaz habitual; la experiencia inmersiva 3D nunca es obligatoria.',
    continuityEy:'UNA CUENTA KŌMØ',
    optionalLabel:'OPCIONAL',
    faqEy:'PREGUNTAS FRECUENTES',
    faqTitle:'Algunas respuestas antes de empezar.',
    faqLead:'Una primera conversación nos permite elegir el formato y el lugar adecuados.',
    faq:[['¿Cuál es la diferencia entre Motion y Clinical?','Motion ofrece evaluación funcional y una restitución no médica. Clinical es una consulta médica, ofrecida cuando está indicada y dentro del marco profesional adecuado.'],['¿Tengo que desplazarme?','No siempre. Según la disponibilidad local, KŌMØ Anywhere puede realizarse en casa, a bordo, en un hotel, en el trabajo o en retreat.'],['¿Dónde encuentro mi información?','Pulse es tu espacio conectado KŌMØ. Usa «Acceder» para abrir tu cuenta existente.'],['¿Tengo que usar World en 3D?','No. World es una capa de acompañamiento opcional; tu recorrido puede continuar sin una experiencia inmersiva 3D.']],
    proEy:'PARA PROFESIONALES',
    proTitle:'Implantar KŌMØ en tu establecimiento',
    proLead:'KŌMØ puede prestar el servicio in situ, medir la demanda real y estructurar un programa recurrente. La Case cobra sentido cuando se justifica una implantación permanente.',
    pipeline:[['01','Piloto in situ','KŌMØ presta el servicio con su equipo y material.'],['02','Sesiones facturadas','El socio mide demanda, tasa de reserva y satisfacción.'],['03','Programa recurrente','Se programan jornadas o citas KŌMØ de forma regular.'],['04','Formación','El equipo del socio se forma en las operaciones de su ámbito.'],['05','Instalación','La Case equipa el centro cuando el volumen de actividad lo justifica.']],
    finalTitle:'Reservar una primera consulta KŌMØ',
    finalCopy:'Persona, hotel, yacht, clínica o club: definimos el formato, el lugar y el nivel de acompañamiento antes de la primera intervención.',
    finalCta:'Solicitar una consulta',
    finalEy:'EMPEZAR CON KŌMØ',
    scienceCta:'Conocer nuestro enfoque científico',
    proCta:'Hablar con KŌMØ',
    aboutTitle:'KŌMØ integra evaluación funcional y seguimiento longitudinal',
    aboutLead:'KŌMØ reúne evaluación funcional, experiencia clínica cuando hace falta y acompañamiento que encaja en la vida cotidiana.',
    aboutSectionTitle:'Un enfoque coordinado en torno a la persona.',
    aboutSectionCopy:'Nuestras experiencias conectan protocolos funcionales, profesionales cualificados y resultados comprensibles. Cada servicio conserva su función: Motion no es un diagnóstico médico; Clinical corresponde a la responsabilidad del médico.',
    aboutMethodTitle:'La evaluación funcional es central en el método KŌMØ.',
    aboutMethodCopy:'Observamos movimiento, fuerza, equilibrio y capacidad funcional para abrir una conversación práctica sobre el siguiente paso. El lugar, las herramientas y el equipo se adaptan al recorrido.',
    nav:[['Motion','assessment'],['Clinical','clinical'],['Experiencias','experience'],['Ciencia','science'],['Profesionales','partners'],['Quiénes somos','about'],['Acceder','pulse']]
  }
};

const localizedRoutes={
  home:{en:'/en/',fr:'/',es:'/es/'},
  assessment:{en:'/motion/',fr:'/fr/motion/',es:'/es/motion/'},
  signature:{en:'/signature/',fr:'/fr/signature/',es:'/es/signature/'},
  clinical:{en:'/clinical/',fr:'/fr/clinical/',es:'/es/clinical/'},
  experience:{en:'/experience/',fr:'/fr/experience/',es:'/es/experience/'},
  partners:{en:'/partners/',fr:'/fr/partners/',es:'/es/partners/'},
  pulse:{en:'/pulse/',fr:'/fr/pulse/',es:'/es/pulse/'},
  about:{en:'/about/',fr:'/fr/a-propos/',es:'/es/sobre/'},
  science:{en:'/science/',fr:'/fr/science/',es:'/es/science/'}
};
function pageSeo(relative,c){
  const language=c===localeData.fr?'fr':c===localeData.es?'es':'en';
  let type=null;
  if(c.homeFiles.includes(relative)) type='home';
  else if(relative===c.assessmentFile||relative===c.legacyAssessmentFile) type='assessment';
  else if(relative===c.signatureFile) type='signature';
  else if(relative===c.clinicalFile) type='clinical';
  else if(relative===c.partnersFile) type='partners';
  else if(relative===c.pulseFile) type='pulse';
  else if(relative===c.aboutFile) type='about';
  else if(relative.endsWith('/science/index.html')||relative==='science/index.html') type='science';
  else if(relative.endsWith('/experience/index.html')||relative==='experience/index.html') type='experience';
  const routes=type?localizedRoutes[type]:null;
  if(routes) return {language,path:routes[language],alternates:routes};
  const path=`/${relative.replace(/index\.html$/,'').replace(/^\/+|\/+$/g,'')}/`.replace(/^\/\/$/,'/');
  return {language,path,alternates:null};
}
function meta(html, title, description, seo){
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);
  html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${description}">`);
  html = html.replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${title}">`);
  html = html.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${description}">`);
  const canonical=`https://komolongevity.com${seo.path}`;
  html=html.replace(/<html([^>]*)>/,(_,attrs)=>`<html${attrs.replace(/\s+lang="[^"]*"/,'')} lang="${seo.language}">`);
  if(/<link rel="canonical"[^>]*>/.test(html)) html=html.replace(/<link rel="canonical"[^>]*>/,`<link rel="canonical" href="${canonical}">`);
  else html=html.replace('</head>',`<link rel="canonical" href="${canonical}">\n</head>`);
  if(/<meta property="og:url"[^>]*>/.test(html)) html=html.replace(/<meta property="og:url"[^>]*>/,`<meta property="og:url" content="${canonical}">`);
  else html=html.replace('</head>',`<meta property="og:url" content="${canonical}">\n</head>`);
  html=html.replace(/\s*<link rel="alternate" hreflang="[^"]*" href="[^"]*">/g,'');
  if(seo.alternates){
    const alternates=Object.entries(seo.alternates).map(([lang,path])=>`<link rel="alternate" hreflang="${lang}" href="https://komolongevity.com${path}">`).join('\n');
    html=html.replace('</head>',`${alternates}\n<link rel="alternate" hreflang="x-default" href="https://komolongevity.com${seo.alternates.fr}">\n</head>`);
  }
  html = html.replace(/\s*<style id="komo-commercial-trajectory-v2-style">[\s\S]*?<\/style>\s*(?=<\/head>)/,'');
  return html.replace('</head>', css+'\n</head>');
}
function url(c,key){ return c.paths[key] || key; }
function nav(c){
  const links = c.nav.map(([label,key])=>`<a${key==='pulse'?' class="kt-account-link"':''} href="${url(c,key)}">${label}</a>`).join('');
  return links;
}
function patchNav(html,c){
  html = html.replace(/<nav class="kp-nav">[\s\S]*?<\/nav>/, `<nav class="kp-nav">${nav(c)}</nav>`);
  html = html.replace(/<nav class="pv2-nav"([^>]*)>[\s\S]*?<\/nav>/, `<nav class="pv2-nav"$1>${nav(c)}</nav>`);
  html = html.replace(/<nav class="primary-nav"([^>]*)>[\s\S]*?<\/nav>/, `<nav class="primary-nav"$1>${nav(c)}</nav>`);
  html = html.replace(/<nav class="nav">[\s\S]*?<\/nav>/, `<nav class="nav">${nav(c)}</nav>`);
  html = html.replace(/<details class="kp-menu">[\s\S]*?<\/details>/, `<details class="kp-menu"><summary>Menu</summary><nav>${nav(c)}</nav></details>`);
  html = html.replace(/<details class="pv2-mobile">[\s\S]*?<\/details>/, `<details class="pv2-mobile"><summary>Menu</summary><nav>${nav(c)}</nav></details>`);
  html = html.replace(/<a class="kp-mini" href="[^"]*"[^>]*>[\s\S]*?<\/a>/, `<a class="kp-mini" href="${c.paths.contact}">${c.heroPrimary} →</a>`);
  html = html.replace(/<a class="pv2-cta"[^>]*>[\s\S]*?<\/a>/, `<a class="pv2-cta" href="${c.paths.contact}">${c.heroPrimary} <span aria-hidden="true">↗</span></a>`);
  html = html.replace(/<a class="nav-cta"[^>]*>[\s\S]*?<\/a>/, `<a class="nav-cta" href="${c.paths.contact}">${c.heroPrimary}</a>`);
  return html;
}
function mainReplace(html, body){
  const replacement = `<main id="main" class="kt-home">${body}</main>`;
  if (/<main(?:\s[^>]*)?>[\s\S]*?<\/main>/.test(html)) return html.replace(/<main(?:\s[^>]*)?>[\s\S]*?<\/main>/, replacement);
  return html.replace('</header>', `</header>${replacement}`);
}
function home(c){
  const offers = c.doors.map(([kick,title,copy,price,cta,key,image],i)=>`<article class="kt-z-card ${i===1?'kt-z-card--clinical':i===2?'kt-z-card--signature':''}"><div class="kt-z-card-media"><img src="${image}" alt="" loading="lazy"></div><div class="kt-z-card-body"><span class="kt-kicker">${kick}</span><h3>${title}</h3><p class="kt-copy">${copy}</p><div class="kt-z-card-meta"><b>${price}</b><a href="${url(c,key)}">${cta} →</a></div></div></article>`).join('');
  const steps = c.journey.map(([n,t,p])=>`<article class="kt-z-pillar"><b>${n}</b><strong>${t}</strong><p>${p}</p></article>`).join('');
  const locations = c.experiences.map(([kick,title,copy,cta,key,image])=>`<article class="kt-z-location"><img src="${image}" alt="" loading="lazy"><div class="kt-z-location-copy"><span class="kt-kicker">${kick}</span><h3>${title}</h3><p>${copy}</p></div></article>`).join('');
  const questions=c.faq.map(([q,a])=>`<details><summary>${q}</summary><p>${a}</p></details>`).join('');
  const choiceCards=c.choices.map(([n,t,p,key])=>`<a class="kt-z-option" href="${url(c,key)}"><div><span>${n}</span><strong>${t}</strong><p class="kt-copy">${p}</p></div><i aria-hidden="true">→</i></a>`).join('');
  const photos={fr:'KŌMØ accompagne votre santé en mouvement.',en:'KŌMØ supports health in motion.',es:'KŌMØ acompaña tu salud en movimiento.'};
  return `
<section class="kt-z-hero"><div class="kt-z-hero-media"><img src="/assets/images/komo-brand-collage-v1.webp" alt="${photos[c===localeData.fr?'fr':c===localeData.es?'es':'en']}" fetchpriority="high"></div><div class="kt-shell"><div class="kt-z-hero-copy"><p class="kt-ey">${c.heroEy}</p><h1 class="kt-title">${c.heroTitle}</h1><p class="kt-lead">${c.heroLead}</p><div class="kt-btns"><a class="kt-btn kt-btn--dark" href="${c.paths.contact}">${c.heroPrimary}</a><a class="kt-btn kt-btn--light" href="${c.paths.offers}">${c.heroSecondary}</a></div></div></div></section>
<section class="kt-z-underhero"><div class="kt-shell kt-z-underhero-grid">${c.proofs.map(([title,copy])=>`<div class="kt-z-proof"><b>${title}</b><span>${copy}</span></div>`).join('')}</div></section>
<section class="kt-z-section" id="komo-offers"><div class="kt-shell"><div class="kt-z-heading"><div><p class="kt-ey">${c.offerEy}</p><h2 class="kt-h2">${c.offerTitle}</h2></div><p class="kt-copy">${c.offerLead}</p></div><div class="kt-z-offers">${offers}</div></div></section>
<section class="kt-z-section kt-z-section--sand"><div class="kt-shell kt-z-method"><div><p class="kt-ey">${c.journeyEy}</p><h2 class="kt-h2">${c.journeyTitle}</h2><p class="kt-lead">${c.journeyLead}</p><div class="kt-z-pillars">${steps}</div><div class="kt-btns"><a class="kt-btn kt-btn--light" href="${url(c,'science')}">${c.scienceCta} →</a></div></div><div class="kt-z-method-image"><img src="/assets/images/komo-case-gait.jpeg" alt="" loading="lazy"></div></div></section>
<section class="kt-z-section" id="komo-orientation"><div class="kt-shell kt-z-orient"><div><p class="kt-ey">${c.choiceEy}</p><h2 class="kt-h2">${c.choiceTitle}</h2><p class="kt-copy">${c.choiceLead}</p></div><div class="kt-z-options">${choiceCards}</div></div></section>
<section class="kt-z-section kt-z-section--sage" id="komo-anywhere"><div class="kt-shell"><div class="kt-z-heading"><div><p class="kt-ey">${c.expEy}</p><h2 class="kt-h2">${c.expTitle}</h2></div><p class="kt-copy">${c.expLead}</p></div><div class="kt-z-locations">${locations}</div><div class="kt-btns"><a class="kt-btn kt-btn--light" href="${url(c,'experience')}">${c.experiencesCta} →</a></div></div></section>
<section class="kt-z-section"><div class="kt-shell kt-clinical-grid"><div><p class="kt-ey">${c.clinicalEy}</p><h2 class="kt-h2">${c.clinicalTitle}</h2><p class="kt-lead">${c.clinicalLead}</p><p class="kt-note">${c.clinicalNote}</p><div class="kt-btns"><a class="kt-btn kt-btn--dark" href="${url(c,'clinical')}">${c.clinicalCta} →</a></div></div><div class="kt-z-method-image"><img src="/assets/images/clinical-pathway-v1.webp" alt="" loading="lazy"></div></div></section>
<section class="kt-z-section kt-z-section--sand"><div class="kt-shell"><div class="kt-z-heading"><div><p class="kt-ey">${c.continuityEy}</p><h2 class="kt-h2">${c.teamTitle}</h2></div><p class="kt-copy">${c.teamCopy}</p></div><div class="kt-z-continuity"><article><strong>KŌMØ PULSE</strong><h3>${c.pulseTitle}</h3><p class="kt-copy">${c.pulseCopy}</p><div class="kt-btns"><a class="kt-btn kt-btn--light" href="${c.paths.pulse}">Pulse →</a></div></article><article><strong>KŌMØ WORLD · ${c.optionalLabel}</strong><h3>${c.worldTitle}</h3><p class="kt-copy">${c.worldCopy}</p><div class="kt-btns"><a class="kt-btn kt-btn--light" href="${c.paths.world}">World →</a></div></article></div></div></section>
<section class="kt-z-section"><div class="kt-shell kt-z-faq"><div><p class="kt-ey">${c.faqEy}</p><h2 class="kt-h2">${c.faqTitle}</h2><p class="kt-copy">${c.faqLead}</p></div><div>${questions}</div></div></section>
<section class="kt-z-section kt-z-section--deep"><div class="kt-shell kt-pro-grid"><div><p class="kt-ey">${c.proEy}</p><h2 class="kt-h2">${c.proTitle}</h2><p class="kt-lead">${c.proLead}</p><div class="kt-btns"><a class="kt-btn kt-btn--ghost" href="${c.paths.partners}">${c.proCta} →</a></div></div><div class="kt-pipeline">${c.pipeline.map(([n,t,p])=>`<div class="kt-pipe"><b>${n}</b><div><h3>${t}</h3><p>${p}</p></div></div>`).join('')}</div></div></section>
<section class="kt-z-final"><div class="kt-shell kt-final-grid"><div><p class="kt-ey">${c.finalEy}</p><h2 class="kt-h2">${c.finalTitle}</h2><p class="kt-copy">${c.finalCopy}</p></div><div class="kt-btns"><a class="kt-btn kt-btn--dark" href="${c.paths.contact}">${c.finalCta}</a></div></div></section>`;
}
function pageHero(ey,title,lead,primary,href,secondary='',href2=''){
  return `<section class="kt-pagehero"><div class="kt-shell"><p class="kt-ey">${ey}</p><h1 class="kt-title">${title}</h1><p class="kt-lead">${lead}</p><div class="kt-btns"><a class="kt-btn kt-btn--dark" href="${href}">${primary}</a>${secondary?`<a class="kt-btn kt-btn--light" href="${href2}">${secondary}</a>`:''}</div></div></section>`;
}
function assessment(c){
  const isFr=c===localeData.fr,isEs=c===localeData.es;
  const title=isFr?'Évaluation fonctionnelle du mouvement':isEs?'Evaluación funcional del movimiento':'Functional movement assessment';
  const lead=isFr?'KŌMØ Motion évalue des dimensions fonctionnelles du mouvement et les restitue dans un langage clair. Le parcours aide à comprendre ses repères et à identifier une prochaine étape adaptée.':isEs?'KŌMØ Motion evalúa aspectos funcionales del movimiento y los explica con claridad para entender tus referencias y elegir el siguiente paso.':'KŌMØ Motion assesses functional aspects of movement and explains them clearly, helping you understand your measures and identify a suitable next step.';
  const labels=isFr?[
    ['01 · PRÉPARER','Votre contexte','Vos objectifs, habitudes de mouvement et informations utiles orientent la session.'],
    ['02 · MESURER','Mouvement & muscle','Une évaluation structurée de la marche, de l’équilibre, de la force et d’autres capacités fonctionnelles.'],
    ['03 · COMPRENDRE','Restitution','Les résultats sont présentés avec leurs limites, un Motion Score et des priorités concrètes.'],
    ['04 · PROGRESSER','La suite','Un programme, un professionnel ou un contrôle ultérieur peut être proposé selon vos besoins.']
  ]:isEs?[
    ['01 · PREPARAR','Tu contexto','Tus objetivos, hábitos de movimiento e información útil orientan la sesión.'],
    ['02 · MEDIR','Movimiento y músculo','Evaluación estructurada de marcha, equilibrio, fuerza y otras capacidades funcionales.'],
    ['03 · COMPRENDER','Restitución','Los resultados se explican con sus límites, un Motion Score y prioridades concretas.'],
    ['04 · PROGRESAR','El siguiente paso','Puede proponerse un programa, un profesional o un control posterior según tus necesidades.']
  ]:[
    ['01 · PREPARE','Your context','Your goals, movement habits and useful background guide the session.'],
    ['02 · MEASURE','Movement & muscle','Structured assessment of gait, balance, strength and other functional capacities.'],
    ['03 · UNDERSTAND','Debrief','Findings are explained with their limits, a Motion Score and practical priorities.'],
    ['04 · PROGRESS','What comes next','A programme, professional or later check-in may be suggested according to your needs.']
  ];
  const note=isFr?'Motion est une évaluation fonctionnelle, pas un diagnostic médical. Si votre situation appelle une consultation médicale, le parcours Clinical peut être envisagé dans un cadre approprié.':isEs?'Motion es una evaluación funcional, no un diagnóstico médico. Si tu situación requiere consulta médica, puede considerarse el recorrido Clinical dentro del marco adecuado.':'Motion is a functional assessment, not a medical diagnosis. If your situation calls for medical consultation, the Clinical pathway may be considered within the appropriate setting.';
  return pageHero('KŌMØ MOTION',title,lead,c.heroPrimary,c.paths.contact,c.clinicalCta,c.paths.clinical)+`<section class="kt-pagebody"><div class="kt-shell kt-z-program-grid"><div><div class="kt-pagegrid">${labels.map(([e,t,p])=>`<article class="kt-pagecard"><span class="kt-kicker">${e}</span><h2 class="kt-h3">${t}</h2><p class="kt-copy">${p}</p></article>`).join('')}</div><p class="kt-note">${note}</p></div><div class="kt-z-program-visual"><img src="/assets/images/komo-case-gait.jpeg" alt="" loading="lazy"></div></div></section>`;
}
function clinicalPage(c){
  const isFr=c===localeData.fr,isEs=c===localeData.es;
  const title=isFr?'Consultation médicale et interprétation clinique':isEs?'Consulta médica e interpretación clínica':'Medical consultation and clinical interpretation';
  const lead=isFr?'KŌMØ Clinical associe l’évaluation fonctionnelle à une consultation médicale lorsque le contexte le justifie. Le médecin garde la responsabilité de l’indication, de l’interprétation et des décisions de soin.':isEs?'KŌMØ Clinical une la evaluación funcional con consulta médica cuando el contexto lo justifica. El médico mantiene la responsabilidad de indicación, interpretación y decisiones clínicas.':'KŌMØ Clinical combines functional assessment with medical consultation when the context warrants it. The physician remains responsible for indication, interpretation and care decisions.';
  const items=isFr?[
    ['01','Contexte','Histoire fonctionnelle, symptômes éventuels, objectifs et contraintes.'],
    ['02','Examen','Examen clinique ciblé selon l’indication.'],
    ['03','Mesures','Lecture du mouvement, du muscle et des tests fonctionnels dans leur contexte.'],
    ['04','Compléter','Biologie, imagerie ou autre examen uniquement s’il existe une indication indépendante.'],
    ['05','Plan','Rééducation, exercice, orientation, suivi ou autre prise en charge adaptée.']
  ]:isEs?[
    ['01','Contexto','Historia funcional, síntomas si existen, objetivos y limitaciones.'],
    ['02','Exploración','Exploración clínica dirigida según indicación.'],
    ['03','Medidas','Lectura de movimiento, músculo y pruebas funcionales en contexto.'],
    ['04','Completar','Biología, imagen u otras pruebas solo con indicación independiente.'],
    ['05','Plan','Rehabilitación, ejercicio, derivación y seguimiento apropiados.']
  ]:[
    ['01','Context','Functional history, possible symptoms, goals and constraints.'],
    ['02','Examination','Targeted clinical examination according to indication.'],
    ['03','Measurements','Movement, muscle and functional tests interpreted in context.'],
    ['04','Complete','Biology, imaging or other tests only when independently indicated.'],
    ['05','Plan','Rehabilitation, exercise, referral, follow-up or other appropriate care.']
  ];
  return pageHero('KŌMØ CLINICAL',title,lead,c.heroPrimary,c.paths.contact,c.motionCta,c.paths.assessment)+`<section class="kt-pagebody"><div class="kt-shell kt-z-program-grid"><div><div class="kt-mini-flow">${items.map(([n,t])=>`<div><b>${n}</b><span>${t}</span></div>`).join('')}</div><div class="kt-pagegrid">${items.map(([e,t,p])=>`<article class="kt-pagecard"><span class="kt-kicker">${e}</span><h2 class="kt-h3">${t}</h2><p class="kt-copy">${p}</p></article>`).join('')}</div><p class="kt-note">${c.clinicalNote}</p></div><div class="kt-z-program-visual"><img src="/assets/images/clinical-pathway-v1.webp" alt="" loading="lazy"></div></div></section>`;
}
function partnersPage(c){
  const isFr=c===localeData.fr,isEs=c===localeData.es;
  const title=isFr?'Intégrer KŌMØ à votre établissement':isEs?'Integrar KŌMØ en tu establecimiento':'Integrate KŌMØ into your organisation';
  const lead=isFr?'Notre modèle B2B commence par des consultations et des journées KŌMØ opérées sur votre site. Vous voyez la demande, vos équipes comprennent le service, puis nous construisons le modèle récurrent et seulement ensuite le déploiement permanent.':isEs?'Nuestro modelo B2B empieza con consultas y jornadas KŌMØ operadas en tu centro. Primero se demuestra la demanda y después se construye el modelo recurrente y el despliegue permanente.':'Our B2B model starts with consultations and KŌMØ days operated in your setting. Demand is demonstrated first; recurring operations and permanent deployment follow.';
  const sectors=isFr?[
    ['Yachting','Programme à bord pour owners, guests ou crew selon le format.'],
    ['Hospitality','Journées KŌMØ et intégration dans l’expérience client.'],
    ['Clinical','Centres médicaux et longévité souhaitant structurer une offre locomotrice.'],
    ['Fitness & performance','Bilans, progression et continuité avec un cadre clair.']
  ]:isEs?[
    ['Yachting','Programas a bordo para owners, guests o crew según formato.'],
    ['Hospitality','Jornadas KŌMØ e integración en la experiencia del cliente.'],
    ['Clinical','Centros médicos y de longevidad que quieren estructurar una oferta locomotora.'],
    ['Fitness & performance','Evaluaciones, progreso y continuidad con un marco claro.']
  ]:[
    ['Yachting','Onboard programmes for owners, guests or crew according to format.'],
    ['Hospitality','KŌMØ days and integration into the guest experience.'],
    ['Clinical','Medical and longevity centres building a structured locomotor offer.'],
    ['Fitness & performance','Assessment, progression and continuity with clear governance.']
  ];
  const secondary=isFr?'Découvrir l’Assessment':isEs?'Descubrir Assessment':'Discover Assessment';
  return pageHero(c.proEy,title,lead,isFr?'Organiser un pilote':isEs?'Organizar un piloto':'Run a pilot',c.paths.contact,secondary,c.paths.assessment)+`<section class="kt-pagebody"><div class="kt-shell"><div class="kt-mini-flow">${c.pipeline.map(([n,t])=>`<div><b>${n}</b><span>${t}</span></div>`).join('')}</div><div class="kt-pagegrid">${sectors.map(([t,p])=>`<article class="kt-pagecard"><span class="kt-kicker">KŌMØ</span><h2 class="kt-h3">${t}</h2><p class="kt-copy">${p}</p></article>`).join('')}</div><p class="kt-note">${isFr?'La KŌMØ Case peut équiper le partenaire lorsque le volume d’activité justifie une installation permanente.':isEs?'La KŌMØ Case puede equipar al socio cuando el volumen de actividad justifica una instalación permanente.':'The KŌMØ Case can equip the partner site when activity volume justifies a permanent installation.'}</p></div></section>`;
}
function experiencePage(c){
  const isFr=c===localeData.fr,isEs=c===localeData.es;
  const title=isFr?'KŌMØ à bord, à l’hôtel, à domicile ou en retreat':isEs?'KŌMØ a bordo, en hotel, en casa o en retreat':'KŌMØ onboard, in hotels, at home or on retreat';
  const lead=isFr?'KŌMØ se déplace avec la personne. Yachting ouvre la voie, mais la même qualité d’évaluation, de restitution et de suivi peut être délivrée à domicile, dans un hôtel ou pendant un retreat.':isEs?'KŌMØ se desplaza con la persona. Yachting abre el camino, pero la misma calidad puede vivir en casa, hotel o retreat.':'KŌMØ moves with the person. Yachting leads the launch, but the same standard of assessment, debrief and follow-up can be delivered at home, in hotels or during retreats.';
  const cards=c.experiences.map(([k,t,p,cta,key,image])=>`<article class="kt-z-location"><img src="${image}" alt="" loading="lazy"><div class="kt-z-location-copy"><span class="kt-kicker">${k}</span><h3>${t}</h3><p>${p}</p><a href="${url(c,key)}" class="kt-btn kt-btn--light">${cta}</a></div></article>`).join('');
  return pageHero('KŌMØ ANYWHERE',title,lead,c.heroPrimary,c.paths.contact,c.experiencesCta,'#komo-anywhere')+`<section class="kt-pagebody"><div class="kt-shell"><div class="kt-z-locations" id="komo-anywhere">${cards}</div><p class="kt-note">${c.clinicalNote}</p></div></section>`;
}

function signaturePage(c){
  const isFr=c===localeData.fr,isEs=c===localeData.es;
  const title=isFr?'Un programme KŌMØ conçu sur mesure':isEs?'Un programa KŌMØ diseñado a medida':'A bespoke KŌMØ programme';
  const lead=isFr?'KŌMØ Signature coordonne une expérience privée à partir de vos priorités, du lieu souhaité et des professionnels utiles. Le format et le périmètre sont établis lors d’un premier échange.':isEs?'KŌMØ Signature coordina una experiencia privada a partir de tus prioridades, el lugar elegido y los profesionales adecuados. El formato y el alcance se definen en una primera conversación.':'KŌMØ Signature coordinates a private experience around your priorities, preferred setting and appropriate professionals. The format and scope are agreed in an initial conversation.';
  const points=isFr?[
    ['01','Commencer par vos objectifs','Mouvement, autonomie, préparation physique ou continuité après une évaluation.'],
    ['02','Choisir le lieu','À domicile, à bord, dans un hôtel, au travail ou lors d’un retreat, selon les services disponibles.'],
    ['03','Réunir la bonne équipe','Les rôles et interventions de chaque professionnel sont clarifiés avant le programme.'],
    ['04','Organiser la continuité','Pulse rassemble les étapes de votre parcours; World reste une option si elle est utile.']
  ]:isEs?[
    ['01','Empezar por tus objetivos','Movimiento, autonomía, preparación física o continuidad tras una evaluación.'],
    ['02','Elegir el lugar','En casa, a bordo, en un hotel, en el trabajo o durante un retreat, según disponibilidad.'],
    ['03','Reunir al equipo adecuado','Las funciones y actuaciones de cada profesional se aclaran antes del programa.'],
    ['04','Organizar la continuidad','Pulse reúne las etapas; World sigue siendo opcional si resulta útil.']
  ]:[
    ['01','Begin with your goals','Movement, independence, physical preparation or continuity after an assessment.'],
    ['02','Choose the setting','At home, onboard, in a hotel, at work or on retreat, subject to local availability.'],
    ['03','Bring the right team together','Each professional’s role and scope are made clear before the programme begins.'],
    ['04','Plan for continuity','Pulse keeps your pathway together; World remains optional when useful.']
  ];
  return pageHero('KŌMØ SIGNATURE',title,lead,c.finalCta,c.paths.contact,c.motionCta,c.paths.assessment)+`<section class="kt-pagebody"><div class="kt-shell kt-z-program-grid"><div class="kt-pagegrid">${points.map(([n,t,p])=>`<article class="kt-pagecard"><span class="kt-kicker">${n}</span><h2 class="kt-h3">${t}</h2><p class="kt-copy">${p}</p></article>`).join('')}<p class="kt-note">${c.clinicalNote}</p></div><div class="kt-z-program-visual"><img src="/assets/images/hero-mediterranean-motion-v1.webp" alt="" loading="lazy"></div></div></section>`;
}

function aboutPage(c){
  return pageHero('KŌMØ',c.aboutTitle,c.aboutLead,c.heroPrimary,c.paths.contact,c.scienceCta,c.paths.science)+`<section class="kt-pagebody"><div class="kt-shell kt-z-about-grid"><article><p class="kt-ey">${c.offerEy}</p><h2 class="kt-h2">${c.aboutSectionTitle}</h2><p class="kt-copy">${c.aboutSectionCopy}</p></article><article><p class="kt-ey">${c.journeyEy}</p><h2 class="kt-h2">${c.aboutMethodTitle}</h2><p class="kt-copy">${c.aboutMethodCopy}</p><div class="kt-btns"><a class="kt-btn kt-btn--light" href="${url(c,'experience')}">${c.experiencesCta} →</a></div></article></div></section>`;
}

function pulsePage(c){
  const isFr=c===localeData.fr,isEs=c===localeData.es;
  const title=isFr?'Pulse centralise vos résultats et votre suivi KŌMØ':isEs?'Pulse reúne tus resultados y el seguimiento KŌMØ':'Pulse brings together your results and KŌMØ follow-up';
  const lead=isFr?'Pulse est l’espace personnel KŌMØ après votre consultation : résultats, priorités, programme, professionnels, progression et prochaine réévaluation restent réunis dans une seule trajectoire.':isEs?'Pulse es el espacio personal KŌMØ después de tu consulta: resultados, prioridades, programa, profesionales, progreso y próxima reevaluación en una sola trayectoria.':'Pulse is your personal KŌMØ space after consultation: results, priorities, programme, professionals, progress and the next reassessment stay together in one trajectory.';
  const cards=isFr?[
    ['VOS RÉSULTATS','Comprendre','Retrouvez votre restitution, vos repères fonctionnels, votre Motion Score et les éléments expliqués pendant la consultation.'],
    ['VOTRE PLAN','Agir','Les priorités et prochaines actions restent visibles, sans transformer Pulse en outil d’auto-diagnostic.'],
    ['VOTRE ÉQUIPE','Être accompagné','Retrouvez les professionnels qui interviennent dans votre trajectoire et les prochains rendez-vous utiles.'],
    ['VOTRE PROGRESSION','Réévaluer','Comparez les évaluations successives et mesurez ce qui évolue réellement dans le temps.']
  ]:isEs?[
    ['TUS RESULTADOS','Entender','Consulta tu restitución, referencias funcionales, Motion Score y los elementos explicados durante la consulta.'],
    ['TU PLAN','Actuar','Las prioridades y siguientes acciones siguen visibles sin convertir Pulse en autodiagnóstico.'],
    ['TU EQUIPO','Acompañamiento','Profesionales, próximos pasos y citas útiles reunidos en el mismo espacio.'],
    ['TU PROGRESO','Reevaluar','Compara evaluaciones sucesivas y mide lo que realmente cambia con el tiempo.']
  ]:[
    ['YOUR RESULTS','Understand','Return to your debrief, functional references, Motion Score and the elements explained during the consultation.'],
    ['YOUR PLAN','Act','Keep priorities and next actions visible without turning Pulse into a self-diagnosis tool.'],
    ['YOUR TEAM','Be supported','Find the professionals involved in your trajectory and the next useful appointments.'],
    ['YOUR PROGRESS','Reassess','Compare successive assessments and measure what actually changes over time.']
  ];
  const access=isFr?'Accéder à mon espace Pulse':isEs?'Acceder a mi espacio Pulse':'Open my Pulse space';
  const consult=isFr?'Demander une consultation':isEs?'Solicitar una consulta':'Request a consultation';
  const note=isFr?'Pulse s’inscrit dans la continuité d’une évaluation réelle, d’une restitution humaine et d’un accompagnement structuré dans le temps.':isEs?'Pulse forma parte de la continuidad de una evaluación real, una restitución humana y un acompañamiento estructurado en el tiempo.':'Pulse is designed as the continuity layer after a real assessment, a human debrief and structured follow-up over time.';
  return pageHero('KŌMØ PULSE',title,lead,access,'https://pulse.komolongevity.com/',consult,c.paths.contact)+
    `<section class="kt-pagebody"><div class="kt-shell"><div class="kt-pagegrid">${cards.map(([e,t,p])=>`<article class="kt-pagecard"><span class="kt-kicker">${e}</span><h2 class="kt-h3">${t}</h2><p class="kt-copy">${p}</p></article>`).join('')}</div><p class="kt-note">${note}</p></div></section>`;
}
function pageMeta(c,type){
  const isFr=c===localeData.fr,isEs=c===localeData.es;
  const map={
    assessment: isFr?['KŌMØ Motion — Évaluation fonctionnelle du mouvement','Évaluation fonctionnelle de la marche, de l’équilibre, de la force et du mouvement, avec restitution claire et prochaines étapes.']:isEs?['KŌMØ Motion — Evaluación funcional del movimiento','Evaluación funcional de marcha, equilibrio, fuerza y movimiento, con restitución clara y próximos pasos.']:['KŌMØ Motion — Functional movement assessment','Functional assessment of gait, balance, strength and movement, with a clear debrief and next steps.'],
    signature: isFr?['KŌMØ Signature — Programme privé sur mesure','Un accompagnement coordonné autour de vos objectifs, du lieu souhaité et des professionnels adaptés.']:isEs?['KŌMØ Signature — Programa privado a medida','Acompañamiento coordinado según tus objetivos, el lugar elegido y los profesionales adecuados.']:['KŌMØ Signature — Tailored private programme','Coordinated support shaped around your goals, preferred setting and appropriate professionals.'],
    clinical: isFr?['KŌMØ Clinical — Évaluation médicale de longévité locomotrice','KŌMØ Clinical associe évaluation fonctionnelle et consultation médicale lorsque l’indication le justifie, avec plan et suivi personnalisés.']:isEs?['KŌMØ Clinical — Evaluación médica de longevidad locomotora','KŌMØ Clinical combina evaluación funcional y consulta médica cuando está indicada, con plan y seguimiento personalizados.']:['KŌMØ Clinical — Medical locomotor longevity assessment','KŌMØ Clinical combines functional assessment with medical consultation when indicated, followed by a personalised plan and continuity.'],
    partners: isFr?['KŌMØ pour les professionnels — Pilotes, consultations et déploiement','Hôtels, yachts, cliniques et clubs : commencez par un pilote KŌMØ opéré sur site, mesurez l’usage, puis déployez le modèle adapté.']:isEs?['KŌMØ para profesionales — Pilotos, consultas y despliegue','Hoteles, yachts, clínicas y clubs: empieza con un piloto KŌMØ operado in situ y despliega después el modelo adecuado.']:['KŌMØ for Professionals — Pilots, consultations and deployment','Hotels, yachts, clinics and clubs: start with an operated KŌMØ pilot, prove usage, then deploy the right recurring model.'],
    experience: isFr?['KŌMØ Anywhere — Yachting, hôtels, domicile & retreats','Découvrez les formats KŌMØ à bord, en hôtel, chez vous, au travail ou en retreat.']:isEs?['KŌMØ Anywhere — Yachting, hoteles, hogar y retreats','Descubre KŌMØ a bordo, en hoteles, en casa, en el trabajo o en retreat.']:['KŌMØ Anywhere — Yachting, hotels, home & retreats','Explore KŌMØ at sea, in hotels, at home, at work or on retreat.'],
    about: isFr?['À propos de KŌMØ — La santé en mouvement','Notre approche relie l’évaluation fonctionnelle, l’expertise clinique et l’accompagnement dans la vie réelle.']:isEs?['Sobre KŌMØ — Salud en movimiento','Nuestro enfoque conecta evaluación funcional, experiencia clínica y acompañamiento en la vida cotidiana.']:['About KŌMØ — Health in motion','Our approach connects functional assessment, clinical expertise and support in real life.'],
    pulse: isFr?['KŌMØ Pulse — Vos résultats, votre plan, votre progression','Après votre consultation KŌMØ, Pulse réunit résultats, priorités, programme, professionnels, progression et prochaine réévaluation.']:isEs?['KŌMØ Pulse — Resultados, plan y progreso','Después de tu consulta KŌMØ, Pulse reúne resultados, prioridades, programa, profesionales, progreso y próxima reevaluación.']:['KŌMØ Pulse — Results, plan and progress','After your KŌMØ consultation, Pulse brings together results, priorities, programme, professionals, progress and your next reassessment.']
  };
  return map[type];
}
async function exists(fp){try{await access(fp);return true}catch{return false}}
async function patchExisting(relative,c,body,title,description){
  const fp=join(site,relative); if(!(await exists(fp))) return false;
  let html=await readFile(fp,'utf8'); html=meta(html,title,description,pageSeo(relative,c)); html=patchNav(html,c); html=mainReplace(html,body); await writeFile(fp,html,'utf8'); return true;
}
async function ensurePage(relative,c,body,title,description){
  const fp=join(site,relative);
  if(await patchExisting(relative,c,body,title,description)) return true;
  const source=join(site,c.homeSourceFile||c.homeFiles[0]);
  if(!(await exists(source))) return false;
  await mkdir(dirname(fp),{recursive:true});
  let html=await readFile(source,'utf8');
  html=html.replace(/<meta http-equiv="refresh"[^>]*>/ig,'').replace(/<script>\s*location\.replace\([^<]*<\/script>/ig,'');
  html=meta(html,title,description,pageSeo(relative,c)); html=patchNav(html,c); html=mainReplace(html,body); await writeFile(fp,html,'utf8'); return true;
}
async function patchPublicChrome(relative,c){
  const fp=join(site,relative); if(!(await exists(fp))) return false;
  let html=await readFile(fp,'utf8');
  const title=html.match(/<title>([\s\S]*?)<\/title>/)?.[1]||c.metaTitle;
  const description=html.match(/<meta name="description" content="([^"]*)">/)?.[1]||c.metaDescription;
  html=meta(html,title,description,pageSeo(relative,c)); html=patchNav(html,c); await writeFile(fp,html,'utf8'); return true;
}

await writeKomoBrandHero();

for(const c of Object.values(localeData)){
  for(const homeFile of c.homeFiles) await ensurePage(homeFile,c,home(c),c.metaTitle,c.metaDescription);
  const assessmentMeta=pageMeta(c,'assessment'),signatureMeta=pageMeta(c,'signature'),clinicalMeta=pageMeta(c,'clinical'),partnersMeta=pageMeta(c,'partners'),pulseMeta=pageMeta(c,'pulse'),experienceMeta=pageMeta(c,'experience'),aboutMeta=pageMeta(c,'about');
  await ensurePage(c.assessmentFile,c,assessment(c),...assessmentMeta);
  if(c.legacyAssessmentFile) await ensurePage(c.legacyAssessmentFile,c,assessment(c),...assessmentMeta);
  await ensurePage(c.signatureFile,c,signaturePage(c),...signatureMeta);
  await ensurePage(c.aboutFile,c,aboutPage(c),...aboutMeta);
  await ensurePage(c.clinicalFile,c,clinicalPage(c),...clinicalMeta);
  await ensurePage(c.partnersFile,c,partnersPage(c),...partnersMeta);
  await ensurePage(c.pulseFile,c,pulsePage(c),...pulseMeta);
  await ensurePage(c.experienceFile,c,experiencePage(c),...experienceMeta);
  await patchPublicChrome(c.scienceFile,c);
}

const sitemapPath=join(site,'sitemap.xml');
if(await exists(sitemapPath)){
  let sitemap=await readFile(sitemapPath,'utf8');
  const routes=new Set();
  for(const c of Object.values(localeData)) for(const key of ['home','assessment','signature','clinical','experience','partners','about','science','pulse']) routes.add(c.paths[key]);
  for(const route of routes){
    const canonical=`https://komolongevity.com${route}`;
    if(!sitemap.includes(`<loc>${canonical}</loc>`)) sitemap=sitemap.replace('</urlset>',`  <url><loc>${canonical}</loc><priority>0.8</priority></url>\n</urlset>`);
  }
  await writeFile(sitemapPath,sitemap,'utf8');
}

console.log('[komo-commercial-trajectory-v2] PASS · Motion, Clinical and Signature storefront; KŌMØ Anywhere; single-account Pulse entry; no free-test lead capture.');
