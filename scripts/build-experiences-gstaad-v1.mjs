import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const output = join(root, 'site');

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#f4f3f0">
  <meta name="robots" content="index,follow">
  <meta name="description" content="KŌMØ Experience — Gstaad. A curated alpine map of luxury hospitality, wellness and private access.">
  <link rel="canonical" href="https://komolongevity.com/Experiences">
  <title>KŌMØ Experience — Gstaad</title>
  <style>
    :root{--ink:#171817;--muted:#72736f;--line:rgba(23,24,23,.11);--paper:#f6f5f2;--white:#fff;--soft:#ecebe7;--core:#d8d6d0;--gold:#a98855;--blue:#2878ff;--shadow:0 24px 70px rgba(27,29,28,.14)}
    *{box-sizing:border-box}html,body{margin:0;min-height:100%;background:var(--paper);color:var(--ink)}body{font-family:-apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden}.serif{font-family:"Iowan Old Style","Baskerville",Georgia,serif}
    a{color:inherit;text-decoration:none}button{font:inherit}.experience-shell{min-height:100vh;padding:16px}.experience{position:relative;min-height:calc(100vh - 32px);overflow:hidden;border:1px solid rgba(23,24,23,.08);border-radius:26px;background:#fbfaf8;box-shadow:0 12px 40px rgba(0,0,0,.06)}
    .topbar{height:74px;display:grid;grid-template-columns:220px 1fr 240px;align-items:center;padding:0 28px;border-bottom:1px solid var(--line);background:rgba(255,255,255,.88);backdrop-filter:blur(18px);position:relative;z-index:20}.brand{font-size:27px;letter-spacing:.22em;font-weight:500}.topnav{display:flex;justify-content:center;gap:34px;color:#5f605c;font-size:14px}.topnav a{padding:27px 0 24px}.topnav a.active{color:var(--ink);border-bottom:1px solid var(--ink)}.topmeta{text-align:right;font-size:10px;letter-spacing:.3em;text-transform:uppercase;color:#7a7b77}
    .workspace{display:grid;grid-template-columns:minmax(0,1fr) 400px;min-height:calc(100vh - 108px)}.map-stage{position:relative;min-height:760px;overflow:hidden;background:linear-gradient(180deg,#faf9f7 0%,#f2f1ee 48%,#f7f6f3 100%)}
    .map-head{position:absolute;z-index:8;top:42px;left:48px;right:48px;display:flex;justify-content:space-between;align-items:flex-start;pointer-events:none}.map-title h1{margin:0;font:500 clamp(38px,4.2vw,66px)/.98 "Iowan Old Style","Baskerville",Georgia,serif;letter-spacing:-.045em}.map-title p{margin:12px 0 0;font-size:10px;letter-spacing:.32em;text-transform:uppercase;color:#73746f}.launch-chip{pointer-events:auto;border:1px solid rgba(23,24,23,.12);background:rgba(255,255,255,.72);backdrop-filter:blur(14px);padding:10px 14px;border-radius:999px;font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#5d5e5a}
    .filter-card{position:absolute;z-index:9;left:32px;top:150px;width:212px;padding:10px;border-radius:20px;background:rgba(255,255,255,.82);border:1px solid rgba(23,24,23,.09);box-shadow:0 18px 50px rgba(29,31,30,.09);backdrop-filter:blur(18px)}.filter{width:100%;border:0;background:transparent;display:flex;align-items:center;gap:10px;text-align:left;padding:11px 10px;border-radius:12px;color:#575853;cursor:pointer}.filter .icon{width:22px;height:22px;border:1px solid rgba(23,24,23,.12);border-radius:7px;display:grid;place-items:center;font-size:11px}.filter b{font-weight:500;font-size:13px}.filter small{margin-left:auto;color:#8b8c87;font-size:11px}.filter.active{background:#efeeea;color:#171817}.filter:disabled{opacity:.4;cursor:default}.filter-divider{height:1px;background:var(--line);margin:8px 6px}.phase-note{padding:5px 10px 8px;font-size:10px;line-height:1.45;color:#959690}
    .locate{position:absolute;z-index:10;left:32px;bottom:28px;display:flex;align-items:center;gap:9px;border:1px solid rgba(23,24,23,.12);background:rgba(255,255,255,.9);padding:11px 14px;border-radius:999px;box-shadow:0 12px 30px rgba(29,31,30,.09);cursor:pointer}.locate-dot{width:10px;height:10px;border-radius:50%;background:var(--blue);box-shadow:0 0 0 5px rgba(40,120,255,.12)}.locate span{font-size:12px}.location-status{position:absolute;z-index:10;left:32px;bottom:78px;max-width:255px;padding:9px 12px;border-radius:12px;background:rgba(255,255,255,.88);border:1px solid var(--line);font-size:11px;color:#70716d;opacity:0;transform:translateY(6px);transition:.25s}.location-status.visible{opacity:1;transform:none}
    .map-canvas{position:absolute;inset:0}.map-svg{position:absolute;inset:0;width:100%;height:100%}.mountain-name{position:absolute;z-index:3;font:500 14px/1.15 "Iowan Old Style","Baskerville",Georgia,serif;color:#6f706b;letter-spacing:.02em}.mountain-name small{display:block;font:9px/1.3 -apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#a3a49f;margin-top:3px}.m-wispile{left:29%;top:17%}.m-eggli{right:24%;top:15%}.m-wasser{left:9%;bottom:23%}.m-vid{right:10%;bottom:17%}.core-label{position:absolute;z-index:2;left:49%;top:58%;transform:translate(-50%,-50%);font:500 17px/1 "Iowan Old Style","Baskerville",Georgia,serif;letter-spacing:.32em;color:rgba(23,24,23,.55);text-transform:uppercase}.core-label small{display:block;text-align:center;font:9px/1.4 -apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif;letter-spacing:.22em;margin-top:9px;color:rgba(23,24,23,.38)}
    .poi-layer{position:absolute;inset:0;z-index:6}.poi{position:absolute;transform:translate(-50%,-78%);border:0;background:transparent;padding:0;cursor:pointer;outline:none;transition:opacity .22s}.poi.hidden{opacity:.12;pointer-events:none}.poi-card{display:flex;flex-direction:column;align-items:center;gap:7px;filter:drop-shadow(0 9px 12px rgba(44,45,42,.16));transition:transform .25s ease,filter .25s ease}.poi:hover .poi-card,.poi:focus-visible .poi-card,.poi.active .poi-card{transform:translateY(-5px) scale(1.035);filter:drop-shadow(0 14px 18px rgba(44,45,42,.22))}.hotel-3d{position:relative;width:66px;height:50px;transform:perspective(180px) rotateX(8deg)}.hotel-3d .body{position:absolute;left:9px;right:8px;bottom:0;height:34px;border:1px solid rgba(57,53,45,.24);background:linear-gradient(135deg,#f6f2e8,#c9c4b7);clip-path:polygon(0 17%,100% 0,100% 100%,0 100%);box-shadow:inset -10px -10px 20px rgba(69,64,54,.08)}.hotel-3d .roof{position:absolute;left:4px;right:5px;top:6px;height:19px;background:linear-gradient(135deg,#3b3d3a,#77766f);clip-path:polygon(10% 100%,28% 12%,54% 58%,72% 8%,100% 100%)}.hotel-3d .win{position:absolute;width:4px;height:5px;background:#d9b46d;bottom:10px;left:18px;box-shadow:12px 0 #d9b46d,24px 0 #d9b46d,0 -10px #d9b46d,12px -10px #d9b46d,24px -10px #d9b46d}.poi.active .hotel-3d:after{content:"";position:absolute;inset:-7px;border-radius:50%;border:1px solid rgba(169,136,85,.65);box-shadow:0 0 0 7px rgba(169,136,85,.08),0 0 28px rgba(169,136,85,.28)}.poi-label{display:flex;align-items:center;gap:7px;white-space:nowrap;padding:7px 10px;border:1px solid rgba(23,24,23,.1);border-radius:999px;background:rgba(255,255,255,.92);box-shadow:0 7px 20px rgba(36,37,35,.08);font:500 12px/1 "Iowan Old Style","Baskerville",Georgia,serif}.poi-label .type{width:19px;height:19px;border-radius:50%;display:grid;place-items:center;background:#ece9e2;font:9px/1 -apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif}.poi.active .poi-label{border-color:rgba(169,136,85,.45);background:#fffaf1}.user-pin{position:absolute;z-index:8;transform:translate(-50%,-50%);display:none}.user-pin.visible{display:block}.user-pin span{display:block;width:17px;height:17px;border:3px solid #fff;border-radius:50%;background:var(--blue);box-shadow:0 0 0 7px rgba(40,120,255,.14),0 5px 18px rgba(40,120,255,.35)}.user-pin b{position:absolute;left:50%;top:25px;transform:translateX(-50%);white-space:nowrap;background:#fff;border:1px solid var(--line);border-radius:999px;padding:6px 9px;font-size:10px;font-weight:500;box-shadow:0 7px 20px rgba(0,0,0,.08)}
    .panel{position:relative;z-index:12;margin:18px 18px 18px 0;align-self:stretch;border:1px solid rgba(23,24,23,.09);border-radius:24px;background:rgba(255,255,255,.94);box-shadow:var(--shadow);overflow:hidden;display:flex;flex-direction:column}.visual{height:245px;position:relative;overflow:hidden;background:linear-gradient(180deg,#dfe5e7 0%,#eef0ef 46%,#d8d4ca 100%)}.visual svg{width:100%;height:100%;display:block}.visual-top{position:absolute;left:18px;right:18px;top:16px;display:flex;justify-content:space-between;align-items:center}.visual-tag{padding:7px 10px;border-radius:999px;background:rgba(255,255,255,.76);backdrop-filter:blur(10px);font-size:9px;letter-spacing:.17em;text-transform:uppercase}.visual-counter{font-size:10px;color:#4d4f4b;background:rgba(255,255,255,.75);padding:7px 9px;border-radius:999px}.panel-body{padding:28px 28px 26px;display:flex;flex-direction:column;min-height:0;overflow:auto}.property-kicker{font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:#898a85;margin-bottom:8px}.property-title{margin:0;font:500 39px/.98 "Iowan Old Style","Baskerville",Georgia,serif;letter-spacing:-.035em}.group{margin:8px 0 0;color:#5f605d;font:16px/1.3 "Iowan Old Style","Baskerville",Georgia,serif}.meta{display:grid;gap:9px;margin:19px 0 18px;padding:14px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}.meta-row{display:flex;gap:10px;align-items:flex-start;font-size:12px;color:#5e5f5b}.meta-row .mi{width:19px;color:#92938e}.actions{display:grid;grid-template-columns:1fr 48px;gap:8px}.call{border:0;border-radius:13px;background:#1f201f;color:#fff;padding:15px 18px;font-size:14px;cursor:pointer;display:flex;justify-content:center;gap:9px;align-items:center}.route{border:1px solid rgba(23,24,23,.12);border-radius:13px;background:#f4f3ef;display:grid;place-items:center;font-size:17px}.contacts{margin-top:24px}.contacts h3{margin:0 0 10px;font:500 22px/1.1 "Iowan Old Style","Baskerville",Georgia,serif}.contact-row{display:grid;grid-template-columns:32px 1fr auto;align-items:center;gap:9px;padding:12px 0;border-bottom:1px solid var(--line);font-size:12px}.avatar{width:28px;height:28px;border-radius:50%;background:#f0efeb;display:grid;place-items:center;color:#777873}.contact-row small{color:#9b9c97}.panel-foot{margin-top:22px;padding-top:17px;border-top:1px solid var(--line);display:flex;justify-content:space-between;gap:12px;font-size:9px;line-height:1.4;letter-spacing:.12em;text-transform:uppercase;color:#999a95}.panel-foot b{color:#5e5f5b;font-weight:500}
    .north{position:absolute;right:22px;bottom:24px;z-index:4;width:48px;height:48px;border:1px solid rgba(23,24,23,.12);border-radius:50%;background:rgba(255,255,255,.6);display:grid;place-items:center;font:12px/1 Georgia,serif;color:#5c5d59}.north:after{content:"";position:absolute;top:11px;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:13px solid #333;transform:translateY(7px)}.north span{position:absolute;top:7px}
    @media (max-width:1100px){.workspace{grid-template-columns:1fr}.panel{position:absolute;right:0;top:84px;bottom:0;width:min(390px,42vw);margin:14px;min-height:auto}.topbar{grid-template-columns:190px 1fr}.topmeta{display:none}.map-stage{min-height:820px}.filter-card{top:160px}.map-head{right:440px}}
    @media (max-width:760px){.experience-shell{padding:0}.experience{border:0;border-radius:0;min-height:100vh}.topbar{height:62px;padding:0 18px;grid-template-columns:1fr auto}.brand{font-size:22px}.topnav{display:none}.workspace{display:block}.map-stage{min-height:64vh}.map-head{top:28px;left:22px;right:22px}.map-title h1{font-size:38px}.map-title p{font-size:8px}.launch-chip{display:none}.filter-card{left:16px;top:auto;bottom:18px;width:auto;right:16px;display:flex;gap:3px;overflow:auto;padding:7px}.filter{width:auto;min-width:max-content}.filter .icon,.filter small,.phase-note,.filter-divider{display:none}.locate{left:auto;right:18px;bottom:84px}.location-status{left:auto;right:18px;bottom:132px}.mountain-name{display:none}.panel{position:relative;width:auto;margin:0;border-radius:24px 24px 0 0;min-height:0;box-shadow:0 -14px 40px rgba(25,27,25,.1)}.visual{height:190px}.panel-body{padding:22px}.property-title{font-size:34px}.core-label{top:55%}.poi-label{font-size:10px;padding:6px 8px}.hotel-3d{width:54px;height:43px}.hotel-3d .body{height:29px}.north{display:none}}
    @media (prefers-reduced-motion:reduce){*{scroll-behavior:auto!important;transition:none!important}}
  </style>
</head>
<body>
  <main class="experience-shell">
    <section class="experience" aria-label="KŌMØ Experience Gstaad">
      <header class="topbar">
        <a class="brand" href="/" aria-label="KŌMØ home">KŌMØ</a>
        <nav class="topnav" aria-label="Experience navigation"><a href="/">Home</a><a class="active" href="/Experiences">Experiences</a><a href="#map">Gstaad</a><a href="/contact/">Contact</a></nav>
        <div class="topmeta">A higher way to experience</div>
      </header>

      <div class="workspace">
        <section class="map-stage" id="map" aria-label="Interactive map of Gstaad luxury destinations">
          <div class="map-head">
            <div class="map-title"><h1>KŌMØ Experience — Gstaad</h1><p>Iconic places · extraordinary access</p></div>
            <div class="launch-chip">Oyster · Gstaad opening map</div>
          </div>

          <aside class="filter-card" aria-label="Map filters">
            <button class="filter active" data-filter="all"><span class="icon">◇</span><b>All experiences</b><small>6</small></button>
            <button class="filter" data-filter="hotel"><span class="icon">H</span><b>Hotels</b><small>6</small></button>
            <button class="filter" data-filter="wellness"><span class="icon">✦</span><b>Wellness & Spa</b><small>6</small></button>
            <div class="filter-divider"></div>
            <button class="filter" disabled><span class="icon">D</span><b>Dining</b><small>next</small></button>
            <button class="filter" disabled><span class="icon">S</span><b>Shopping</b><small>next</small></button>
            <button class="filter" disabled><span class="icon">P</span><b>Places</b><small>next</small></button>
            <div class="phase-note">Phase 01 prioritises five-star hospitality, spas and clinic-oriented destinations.</div>
          </aside>

          <button class="locate" id="locateButton" type="button"><span class="locate-dot"></span><span>Locate me</span></button>
          <div class="location-status" id="locationStatus" role="status" aria-live="polite"></div>

          <div class="map-canvas">
            <svg class="map-svg" viewBox="0 0 1200 820" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="mountain" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e4e4e0"/><stop offset="1" stop-color="#f5f4f1"/></linearGradient>
                <pattern id="grid" width="70" height="70" patternUnits="userSpaceOnUse"><path d="M70 0H0V70" fill="none" stroke="#d7d6d1" stroke-width=".5" opacity=".34"/></pattern>
                <filter id="soft"><feGaussianBlur stdDeviation="12"/></filter>
              </defs>
              <rect width="1200" height="820" fill="#f6f5f2"/>
              <path d="M0 205L85 132l52 46 76-112 77 86 95-125 94 137 82-74 74 73 85-128 77 92 72-57 65 72 94-89 92 123v-206H0z" fill="url(#mountain)"/>
              <path d="M0 694l100-112 66 57 84-118 75 105 97-74 76 97 73-64 91 69 88-99 88 83 95-132 96 120 131-94v288H0z" fill="#ebeae6" opacity=".72"/>
              <rect x="0" y="0" width="1200" height="820" fill="url(#grid)" opacity=".5"/>
              <path d="M300 204C444 130 757 145 894 254c86 68 111 221 16 337-98 120-348 157-507 69-165-91-213-305-103-456Z" fill="#e7e6e2" stroke="#d0cfca" stroke-width="2" stroke-dasharray="7 8"/>
              <path d="M382 283c101-80 327-82 448 0 98 67 107 191 31 281-79 94-281 119-411 55-138-67-168-239-68-336Z" fill="#d7d5d0" opacity=".72"/>
              <path d="M510 135c-18 85-39 167-22 255 24 120 85 228 103 374" fill="none" stroke="#d1e0e4" stroke-width="16" opacity=".78"/>
              <path d="M510 135c-18 85-39 167-22 255 24 120 85 228 103 374" fill="none" stroke="#f8fbfb" stroke-width="3" opacity=".9"/>
              <g fill="none" stroke="#fbfaf8" stroke-width="7" stroke-linecap="round" opacity=".96">
                <path d="M256 433C404 402 556 401 934 465"/>
                <path d="M324 555C520 471 695 399 893 314"/>
                <path d="M394 250C516 352 669 515 816 636"/>
                <path d="M345 630C463 541 577 438 726 265"/>
                <path d="M548 229C572 363 589 504 623 646"/>
              </g>
              <g fill="none" stroke="#c2c0ba" stroke-width="1.2" opacity=".75">
                <path d="M257 454C406 427 620 436 911 491"/><path d="M343 577C499 506 680 425 871 336"/><path d="M417 270C526 368 663 515 793 617"/><path d="M365 607C494 509 611 404 703 284"/>
              </g>
              <g fill="#cac8c2" opacity=".72">
                <rect x="460" y="398" width="43" height="23" rx="3"/><rect x="516" y="421" width="52" height="28" rx="3"/><rect x="579" y="376" width="38" height="26" rx="3"/><rect x="636" y="419" width="58" height="31" rx="3"/><rect x="714" y="456" width="43" height="28" rx="3"/><rect x="407" y="486" width="54" height="29" rx="3"/><rect x="487" y="524" width="47" height="25" rx="3"/><rect x="605" y="500" width="42" height="28" rx="3"/><rect x="684" y="532" width="51" height="26" rx="3"/>
              </g>
              <ellipse cx="615" cy="481" rx="285" ry="183" fill="none" stroke="#bdbbb4" stroke-width="40" opacity=".07" filter="url(#soft)"/>
            </svg>
            <div class="mountain-name m-wispile">Wispile<small>Alpine ridge</small></div>
            <div class="mountain-name m-eggli">Eggli<small>Mountain sector</small></div>
            <div class="mountain-name m-wasser">Wasserngrat<small>Alpine ridge</small></div>
            <div class="mountain-name m-vid">La Videmanette<small>Mountain sector</small></div>
            <div class="core-label">Gstaad<small>hospitality · dining · retail · wellness</small></div>
            <div class="poi-layer" id="poiLayer"></div>
            <div class="user-pin" id="userPin"><span></span><b>You are here</b></div>
            <div class="north"><span>N</span></div>
          </div>
        </section>

        <aside class="panel" aria-live="polite">
          <div class="visual" id="visual">
            <svg viewBox="0 0 600 340" preserveAspectRatio="none" aria-hidden="true">
              <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#cbd4d9"/><stop offset=".58" stop-color="#eef0ef"/><stop offset="1" stop-color="#d9d4c9"/></linearGradient><linearGradient id="facade" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e9e0d0"/><stop offset="1" stop-color="#b9ad9b"/></linearGradient></defs>
              <rect width="600" height="340" fill="url(#sky)"/><path d="M0 182L88 83l62 57 82-110 77 103 70-72 81 81 69-91 91 131v158H0z" fill="#eef0ef"/><path d="M0 221l88-62 58 32 85-52 75 53 79-35 81 52 69-37 65 50v118H0z" fill="#c9c8c2"/>
              <g transform="translate(150 98)"><rect x="40" y="76" width="260" height="128" rx="5" fill="url(#facade)"/><path d="M20 82l61-57 61 50 50-63 60 64 68 6H20z" fill="#343936"/><rect x="143" y="38" width="48" height="166" fill="#d7cbb8"/><path d="M135 42l31-42 34 42z" fill="#313633"/><g fill="#f0ca75"><rect x="65" y="105" width="12" height="15"/><rect x="99" y="105" width="12" height="15"/><rect x="224" y="105" width="12" height="15"/><rect x="258" y="105" width="12" height="15"/><rect x="65" y="144" width="12" height="15"/><rect x="99" y="144" width="12" height="15"/><rect x="224" y="144" width="12" height="15"/><rect x="258" y="144" width="12" height="15"/><rect x="158" y="84" width="16" height="18"/><rect x="158" y="125" width="16" height="18"/></g></g>
            </svg>
            <div class="visual-top"><div class="visual-tag">Selected destination</div><div class="visual-counter" id="counter">01 / 06</div></div>
          </div>
          <div class="panel-body">
            <div class="property-kicker" id="kicker">Five-star hotel · Palace Spa</div>
            <h2 class="property-title" id="propertyTitle">Gstaad Palace</h2>
            <p class="group" id="group">Group · Gstaad Palace</p>
            <div class="meta">
              <div class="meta-row"><span class="mi">☎</span><span id="phone">+41 33 748 50 00</span></div>
              <div class="meta-row"><span class="mi">⌖</span><span id="address">Palacestrasse 28, 3780 Gstaad</span></div>
            </div>
            <div class="actions"><a class="call" id="callLink" href="tel:+41337485000"><span>☎</span><span>Call concierge</span></a><a class="route" id="routeLink" target="_blank" rel="noreferrer" aria-label="Open route in maps">↗</a></div>
            <div class="contacts">
              <h3>Key Contacts</h3>
              <div class="contact-row"><span class="avatar">○</span><span>Contact 1</span><small>to be added</small></div>
              <div class="contact-row"><span class="avatar">○</span><span>Contact 2</span><small>to be added</small></div>
            </div>
            <div class="panel-foot"><span>Live hospitality map<br><b>Gstaad · Switzerland</b></span><span>Oyster / KŌMØ<br><b>Opening intelligence</b></span></div>
          </div>
        </aside>
      </div>
    </section>
  </main>

  <script>
    (function(){
      var places = [
        {id:'palace',name:'Gstaad Palace',group:'Gstaad Palace',category:'Five-star hotel · Palace Spa',phone:'+41 33 748 50 00',tel:'+41337485000',address:'Palacestrasse 28, 3780 Gstaad',lat:46.4731399,lng:7.2894408,tags:['hotel','wellness']},
        {id:'alpina',name:'The Alpina Gstaad',group:'The Alpina Gstaad',category:'Five-star hotel · Six Senses Spa',phone:'+41 33 888 98 88',tel:'+41338889888',address:'Alpinastrasse 23, 3780 Gstaad',lat:46.47507,lng:7.28885,tags:['hotel','wellness']},
        {id:'bellevue',name:'Le Grand Bellevue',group:'Le Grand Bellevue',category:'Luxury hotel · Le Grand Spa',phone:'+41 33 748 00 00',tel:'+41337480000',address:'Untergstaadstrasse 17, 3780 Gstaad',lat:46.478,lng:7.2833,tags:['hotel','wellness']},
        {id:'park',name:'Park Gstaad',group:'Grand Hôtel Park SA',category:'Five-star hotel · Spa',phone:'+41 33 748 98 00',tel:'+41337489800',address:'Wispilenstrasse 29, 3780 Gstaad',lat:46.470932,lng:7.2890185,tags:['hotel','wellness']},
        {id:'ultima',name:'Ultima Gstaad',group:'Ultima Collection',category:'Luxury hotel · Spa & Clinic',phone:'+41 33 748 05 50',tel:'+41337480550',address:'Gsteigstrasse 70, 3780 Gstaad',lat:46.4655055,lng:7.2853993,tags:['hotel','wellness']},
        {id:'ermitage',name:'ERMITAGE Wellness & Spa Hotel',group:'LUVITA Hotels & Spa AG',category:'Five-star hotel · Wellness & Spa',phone:'+41 33 748 04 30',tel:'+41337480430',address:'Dorfstrasse 46, 3778 Schönried',lat:46.5036,lng:7.288,tags:['hotel','wellness']}
      ];
      var bounds={north:46.507,south:46.462,west:7.279,east:7.295};
      var layer=document.getElementById('poiLayer');
      var title=document.getElementById('propertyTitle');
      var group=document.getElementById('group');
      var kicker=document.getElementById('kicker');
      var phone=document.getElementById('phone');
      var address=document.getElementById('address');
      var callLink=document.getElementById('callLink');
      var routeLink=document.getElementById('routeLink');
      var counter=document.getElementById('counter');
      var userPin=document.getElementById('userPin');
      var status=document.getElementById('locationStatus');
      var active='palace';

      function xy(lat,lng){return {x:((lng-bounds.west)/(bounds.east-bounds.west))*100,y:((bounds.north-lat)/(bounds.north-bounds.south))*100};}
      function render(){
        places.forEach(function(p,index){
          var pos=xy(p.lat,p.lng); var b=document.createElement('button');
          b.className='poi'+(p.id===active?' active':''); b.type='button'; b.dataset.id=p.id; b.dataset.tags=p.tags.join(' '); b.style.left=pos.x+'%'; b.style.top=pos.y+'%'; b.setAttribute('aria-label','Open '+p.name);
          b.innerHTML='<span class="poi-card"><span class="hotel-3d"><i class="roof"></i><i class="body"></i><i class="win"></i></span><span class="poi-label"><span class="type">'+(p.id==='ultima'?'✦':'H')+'</span>'+p.name+'</span></span>';
          b.addEventListener('click',function(){selectPlace(p.id);}); layer.appendChild(b);
        });
      }
      function selectPlace(id){
        active=id; var p=places.find(function(item){return item.id===id;}); if(!p)return;
        Array.prototype.forEach.call(document.querySelectorAll('.poi'),function(el){el.classList.toggle('active',el.dataset.id===id);});
        title.textContent=p.name; group.textContent='Group · '+p.group; kicker.textContent=p.category; phone.textContent=p.phone; address.textContent=p.address; callLink.href='tel:'+p.tel; routeLink.href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(p.lat+','+p.lng); counter.textContent=String(places.indexOf(p)+1).padStart(2,'0')+' / '+String(places.length).padStart(2,'0');
      }
      function filter(type){Array.prototype.forEach.call(document.querySelectorAll('.poi'),function(el){var show=type==='all'||el.dataset.tags.indexOf(type)!==-1; el.classList.toggle('hidden',!show);});}
      Array.prototype.forEach.call(document.querySelectorAll('.filter[data-filter]'),function(btn){btn.addEventListener('click',function(){Array.prototype.forEach.call(document.querySelectorAll('.filter[data-filter]'),function(x){x.classList.remove('active');});btn.classList.add('active');filter(btn.dataset.filter);});});

      function haversine(a,b,c,d){var R=6371,rad=Math.PI/180,da=(c-a)*rad,db=(d-b)*rad;var q=Math.sin(da/2)*Math.sin(da/2)+Math.cos(a*rad)*Math.cos(c*rad)*Math.sin(db/2)*Math.sin(db/2);return 2*R*Math.atan2(Math.sqrt(q),Math.sqrt(1-q));}
      document.getElementById('locateButton').addEventListener('click',function(){
        status.textContent='Locating…';status.classList.add('visible');
        if(!navigator.geolocation){status.textContent='Location is not available in this browser.';return;}
        navigator.geolocation.getCurrentPosition(function(pos){
          var lat=pos.coords.latitude,lng=pos.coords.longitude,inBounds=lat<=bounds.north&&lat>=bounds.south&&lng>=bounds.west&&lng<=bounds.east;
          if(inBounds){var p=xy(lat,lng);userPin.style.left=p.x+'%';userPin.style.top=p.y+'%';userPin.classList.add('visible');status.textContent='Your live position is shown on the Gstaad map.';}
          else{var km=haversine(lat,lng,46.4733,7.2866);userPin.classList.remove('visible');status.textContent='You are '+km.toFixed(km<10?1:0)+' km from central Gstaad. Your exact GPS position is outside this map view.';}
        },function(){status.textContent='Location permission was not granted.';},{enableHighAccuracy:true,timeout:8000,maximumAge:30000});
      });
      render();selectPlace(active);
    })();
  </script>
</body>
</html>`;

for (const folder of ['Experiences', 'experiences']) {
  const dir = join(output, folder);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, 'index.html'), html, 'utf8');
}

console.log('[experiences] built /Experiences and /experiences — Gstaad phase 01');
