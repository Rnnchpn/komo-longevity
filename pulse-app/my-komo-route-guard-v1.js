/* KŌMØ Pulse — My KŌMØ dedicated route guard v1.1 */
(() => {
  const route=()=>location.hash.replace(/^#/,'')||'home';
  const style=document.createElement('style');
  style.id='myKomoRouteGuardStyle';
  style.textContent=`
body.mykomo-route-pending #viewRoot{visibility:hidden!important;min-height:620px!important}
body.mykomo-route-pending #pageEyebrow,body.mykomo-route-pending #pageTitle{visibility:hidden!important}

/* My KŌMØ lobby — premium contrast layer */
body.mykomo-v3 .main-shell{background:radial-gradient(circle at 12% 2%,rgba(70,103,79,.055),transparent 28%),linear-gradient(180deg,#f7f4ec 0%,#f2eee5 100%)!important}
body.mykomo-v3 .mkv3{gap:16px!important}
body.mykomo-v3 .mkv3-card{border-color:rgba(28,48,35,.11)!important;box-shadow:0 22px 58px rgba(28,43,33,.075)!important}

body.mykomo-v3 .mkv3-hero{background:radial-gradient(circle at 80% 20%,rgba(154,205,166,.16),transparent 28%),radial-gradient(circle at 10% 110%,rgba(205,219,195,.10),transparent 34%),linear-gradient(138deg,#111c16 0%,#1a2b21 48%,#284735 100%)!important;border-color:rgba(255,255,255,.07)!important;box-shadow:0 34px 88px rgba(17,28,22,.23)!important}
body.mykomo-v3 .mkv3-hero:before{content:'';position:absolute;inset:0;pointer-events:none;background:linear-gradient(115deg,transparent 22%,rgba(255,255,255,.035) 48%,transparent 72%);transform:translateX(-110%);animation:mkThemeSweep 8s ease-in-out infinite}
body.mykomo-v3 .mkv3-rank{background:rgba(231,240,229,.11)!important;border-color:rgba(221,238,220,.17)!important;backdrop-filter:blur(10px)}
body.mykomo-v3 .mkv3-xp-track{height:13px!important;background:rgba(255,255,255,.10)!important;box-shadow:inset 0 1px 5px rgba(0,0,0,.18)}
body.mykomo-v3 .mkv3-xp-track i{background:linear-gradient(90deg,#eee6d4 0%,#c9ddc7 55%,#9fc9a8 100%)!important;box-shadow:0 0 18px rgba(180,221,189,.28)}
body.mykomo-v3 .mkv3-kp strong{color:#edf3df!important;text-shadow:0 0 24px rgba(207,233,181,.18)}

/* Quest board = dark gameplay panel */
body.mykomo-v3 .mkv3-quests{color:#f8f7f2!important;background:radial-gradient(circle at 88% 0%,rgba(94,145,105,.16),transparent 28%),linear-gradient(145deg,#17251c 0%,#203328 100%)!important;border-color:rgba(255,255,255,.065)!important;box-shadow:0 24px 62px rgba(21,35,27,.16)!important}
body.mykomo-v3 .mkv3-quests .mkv3-kicker,body.mykomo-v3 .mkv3-quests p{color:rgba(244,248,242,.58)!important}
body.mykomo-v3 .mkv3-quests .mkv3-count{background:rgba(214,230,211,.11)!important;color:#e8f0e5!important;border:1px solid rgba(233,241,231,.08)}
body.mykomo-v3 .mkv3-quests .mkv3-quest{background:rgba(255,255,255,.055)!important;border-color:rgba(255,255,255,.07)!important;color:#f8f7f2!important;backdrop-filter:blur(8px);transition:transform .2s ease,background .2s ease,border-color .2s ease}
body.mykomo-v3 .mkv3-quests .mkv3-quest:hover{transform:translateY(-2px);background:rgba(255,255,255,.085)!important;border-color:rgba(195,221,197,.17)!important}
body.mykomo-v3 .mkv3-quests .mkv3-quest.done{background:rgba(122,169,129,.13)!important}
body.mykomo-v3 .mkv3-quests .mkv3-qicon{background:rgba(232,239,226,.10)!important;color:#e9f1e4!important}
body.mykomo-v3 .mkv3-quests .mkv3-qcopy span{color:rgba(245,247,242,.52)!important}
body.mykomo-v3 .mkv3-quests .mkv3-qaction b{color:#cfe1c9!important}

/* Core stats remain light but more sculpted */
body.mykomo-v3 .mkv3-stats{background:radial-gradient(circle at 95% 2%,rgba(92,133,101,.10),transparent 26%),linear-gradient(145deg,#e2ece2,#f6f7f2)!important}
body.mykomo-v3 .mkv3-stat{background:rgba(255,255,255,.78)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.9)}
body.mykomo-v3 .mkv3-stat.main{background:linear-gradient(145deg,#22372a,#2d4a38)!important;box-shadow:0 12px 30px rgba(28,49,36,.14)!important}

/* Daily = warm mineral */
body.mykomo-v3 .mkv3-daily{background:radial-gradient(circle at 100% 0%,rgba(132,111,73,.08),transparent 28%),linear-gradient(145deg,#e9ddca,#f6efe4)!important}
body.mykomo-v3 .mkv3-mini{background:rgba(255,255,255,.60)!important;border:1px solid rgba(88,70,45,.055)}
body.mykomo-v3 .mkv3-step-track{background:rgba(103,89,66,.14)!important}
body.mykomo-v3 .mkv3-step-track i{background:linear-gradient(90deg,#405d49,#6d8a72)!important}

/* Build du moment = second dark anchor */
body.mykomo-v3 .mkv3-lower>.mkv3-card:nth-child(2){color:#f6f7f3!important;background:radial-gradient(circle at 100% 0%,rgba(113,167,123,.15),transparent 30%),linear-gradient(145deg,#1d3025,#263d2f)!important;border-color:rgba(255,255,255,.06)!important;box-shadow:0 25px 64px rgba(26,43,32,.17)!important}
body.mykomo-v3 .mkv3-lower>.mkv3-card:nth-child(2) .mkv3-kicker,body.mykomo-v3 .mkv3-lower>.mkv3-card:nth-child(2) p{color:rgba(245,248,243,.58)!important}
body.mykomo-v3 .mkv3-lower>.mkv3-card:nth-child(2) .mkv3-count{background:rgba(255,255,255,.08)!important;color:#e3eee0!important;border:1px solid rgba(255,255,255,.07)}
body.mykomo-v3 .mkv3-lower>.mkv3-card:nth-child(2) .mkv3-build-box{background:rgba(255,255,255,.065)!important;border:1px solid rgba(255,255,255,.06)}
body.mykomo-v3 .mkv3-lower>.mkv3-card:nth-child(2) .mkv3-build-box.priority{background:rgba(176,105,82,.15)!important}
body.mykomo-v3 .mkv3-lower>.mkv3-card:nth-child(2) .mkv3-build-box small{color:rgba(238,244,237,.52)!important}
body.mykomo-v3 .mkv3-lower>.mkv3-card:nth-child(2) .mkv3-btn.primary{background:#f2eee4!important;color:#203329!important;border-color:#f2eee4!important}
body.mykomo-v3 .mkv3-lower>.mkv3-card:nth-child(2) .mkv3-btn:not(.primary){background:rgba(255,255,255,.07)!important;color:#eef3ea!important;border-color:rgba(255,255,255,.11)!important}

/* Collection = editorial, unlocked badges glow softly */
body.mykomo-v3 .mkv3-badges{gap:10px!important}
body.mykomo-v3 .mkv3-badge{background:linear-gradient(145deg,#ebe7de,#f6f3ec)!important;border-color:rgba(42,61,48,.065)!important}
body.mykomo-v3 .mkv3-badge.on{background:linear-gradient(145deg,#dfeadf,#f9faf6)!important;box-shadow:0 12px 28px rgba(72,111,80,.09)!important;border-color:rgba(92,130,98,.13)!important}
body.mykomo-v3 .mkv3-badge.on i{background:linear-gradient(145deg,#294535,#3d6148)!important;color:#f4f6ef!important;box-shadow:0 0 0 6px rgba(62,96,70,.055),0 8px 20px rgba(51,81,59,.14)}

/* Bottom pair: both high-contrast, but different tones */
body.mykomo-v3 .mkv3-next>.mkv3-card:first-child{background:linear-gradient(145deg,#17281e,#254231)!important;box-shadow:0 24px 58px rgba(22,39,29,.16)!important}
body.mykomo-v3 .mkv3-next>.mkv3-card:nth-child(2){color:#f7f6f0!important;background:radial-gradient(circle at 100% 0%,rgba(190,166,119,.13),transparent 32%),linear-gradient(145deg,#2c2a23,#3d392e)!important;border-color:rgba(255,255,255,.06)!important;box-shadow:0 24px 58px rgba(45,41,33,.14)!important}
body.mykomo-v3 .mkv3-next>.mkv3-card:nth-child(2) .mkv3-kicker,body.mykomo-v3 .mkv3-next>.mkv3-card:nth-child(2) p{color:rgba(248,245,237,.57)!important}
body.mykomo-v3 .mkv3-next>.mkv3-card:nth-child(2) .mkv3-btn.primary{background:#f2ede1!important;color:#2f3129!important;border-color:#f2ede1!important}

@keyframes mkThemeSweep{0%,65%{transform:translateX(-110%)}82%,100%{transform:translateX(120%)}}
@media(max-width:680px){body.mykomo-v3 .mkv3{gap:11px!important}body.mykomo-v3 .mkv3-card{box-shadow:0 14px 34px rgba(29,42,33,.07)!important}}
@media(prefers-reduced-motion:reduce){body.mykomo-v3 .mkv3-hero:before{animation:none!important}}
`;
  document.head.appendChild(style);
  const hold=()=>{if(route()==='mykomo')document.body.classList.add('mykomo-route-pending');else document.body.classList.remove('mykomo-route-pending')};
  hold();
  window.addEventListener('hashchange',hold,true);
  window.KomoMyKomoRouteGuard={release(){document.body.classList.remove('mykomo-route-pending')},hold};
})();