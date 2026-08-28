/* KŌMØ Pulse — patient palette balance v1.0.0
   Reduces green dominance across patient surfaces while preserving clinical status colors. */
(() => {
'use strict';
if(document.querySelector('#kpPaletteBalanceV1'))return;
const s=document.createElement('style');s.id='kpPaletteBalanceV1';s.textContent=`
html[data-kp-nav-mode="patient"] body{background:#f3eee6!important;color:#2d2b28}
html[data-kp-nav-mode="patient"] .main-shell{background:radial-gradient(circle at 10% 0%,rgba(145,126,106,.06),transparent 28%),linear-gradient(180deg,#f8f4ed,#eee8df)!important}
html[data-kp-nav-mode="patient"] #pageEyebrow{color:#93887d!important}
html[data-kp-nav-mode="patient"] #pageTitle{color:#2e2b27!important}
html[data-kp-nav-mode="patient"] .topbar{border-color:rgba(63,56,49,.07)!important}

/* My KŌMØ */
.mkv3{--ink:#302d29!important;--deep:#262522!important;--forest:#585047!important;--sage:#e8e3da!important;--cream:#f7f3ec!important;--sand:#eadfce!important;--line:rgba(60,53,46,.10)!important}
.mkv3-hero{background:radial-gradient(circle at 82% 18%,rgba(210,190,166,.18),transparent 29%),linear-gradient(135deg,#252522,#3a3733 64%,#62584e)!important}
.mkv3-stats{background:linear-gradient(145deg,#ece7df,#faf8f4)!important}
.mkv3-stat.main{background:#37332f!important}
.mkv3-count{background:#ebe4da!important;color:#6b5d50!important}
.mkv3-qaction button,.mkv3-btn.primary,.mkv3-step button{background:#3a3733!important;color:#fff!important}
.mkv3-btn{color:#443f39!important;border-color:#d8d0c5!important}
.mkv3-next .dark{background:linear-gradient(145deg,#393631,#544c45)!important}
.mkv3-xp-track i{background:linear-gradient(90deg,#f3e8d8,#d7c7b3)!important}
.mkv3-step-track i{background:#8b7765!important}
.mkv3-badge.on{background:linear-gradient(145deg,#eee7dd,#fff)!important}
.mkv3-badge.on i{background:#e2d4c4!important}

/* Motion */
.kmv3{--ink:#302d29!important;--deep:#252522!important;--forest:#544c44!important;--sage:#e8e2d8!important;--cream:#f8f4ed!important;--sand:#eadfce!important;--line:rgba(59,52,46,.10)!important}
body.kmotion-v3 .main-shell{background:radial-gradient(circle at 10% 0%,rgba(145,126,106,.06),transparent 28%),linear-gradient(180deg,#f8f4ed,#efe9e0)!important}
.kmv3-hero{background:radial-gradient(circle at 88% 12%,rgba(210,189,163,.16),transparent 27%),linear-gradient(135deg,#232320,#373430 55%,#5d544b)!important}
.kmv3-btn.primary{background:#3b3733!important;border-color:#3b3733!important;color:#fff!important}
.kmv3-hero .kmv3-btn.primary{background:#f4eee4!important;color:#302d29!important;border-color:#f4eee4!important}
.kmv3-qcard.dark,.kmv3-qcard.dark2{background:linear-gradient(145deg,#292824,#47413a)!important}
.kmv3-qcard.sage{background:linear-gradient(145deg,#e9e3da,#f8f6f1)!important}
.kmv3-mini-track i{background:#8a7868!important}
.kmv3-qcard.dark .kmv3-mini-track i,.kmv3-qcard.dark2 .kmv3-mini-track i{background:#ddcdb8!important}
.kmv3-onsite-item i{background:#e7ddd0!important}
.kmv3-modal-side{background:linear-gradient(155deg,#292824,#49413a)!important}
.kmv3-choice input:checked+span{border-color:#86715f!important;background:#eee4d8!important;color:#433a32!important}

/* Trajectoire */
.trv3{--ink:#302d29!important;--deep:#262522!important;--forest:#575048!important;--sage:#e9e3da!important;--cream:#f7f3ec!important;--sand:#eee1cf!important;--line:rgba(60,53,46,.10)!important}
body.trajectory-v3 .main-shell{background:radial-gradient(circle at 8% 0%,rgba(145,126,106,.06),transparent 28%),linear-gradient(180deg,#f8f4ed,#eee8df)!important}
.trv3-hero{background:radial-gradient(circle at 86% 10%,rgba(205,184,158,.16),transparent 27%),linear-gradient(135deg,#242320,#37332f 53%,#5e544a)!important}
.trv3-evolution{background:linear-gradient(145deg,#ebe6de,#faf8f4)!important}
.trv3-chart .line{stroke:#7a6858!important}.trv3-chart .dot{stroke:#7a6858!important}
.trv3-domain.dark{background:radial-gradient(circle at 100% 0%,rgba(190,166,140,.12),transparent 30%),linear-gradient(145deg,#292824,#48413a)!important}
.trv3-domain.sage{background:linear-gradient(145deg,#e9e3da,#f8f6f1)!important}
.trv3-btn.primary{background:#3a3733!important;border-color:#3a3733!important}
.trv3-protocol{background:radial-gradient(circle at 88% 4%,rgba(192,166,138,.15),transparent 28%),linear-gradient(135deg,#242320,#38332f 54%,#594f46)!important}

/* Keep success / medical status greens as small semantic accents only. */
`;
document.head.appendChild(s);
window.KomoPatientPalette={version:'1.0.0'};
})();