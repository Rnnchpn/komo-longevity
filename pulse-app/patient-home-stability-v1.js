(() => {
  'use strict';

  const VERSION = '1.1.0';
  const route = () => location.hash.replace(/^#/, '') || 'home';

  function ensureStyle() {
    if (document.querySelector('#patientHomeStabilityV1Style')) return;
    const style = document.createElement('style');
    style.id = 'patientHomeStabilityV1Style';
    style.textContent = `
      body.khf-shell,
      body.khf-active,
      body.khf-shell #appShell,
      body.khf-active #appShell,
      body.khf-shell .main-shell,
      body.khf-active .main-shell {
        background-color:#f3f1eb!important;
      }
      body.khf-shell #appShell,
      body.khf-active #appShell,
      body.khf-shell .main-shell,
      body.khf-active .main-shell {
        background:
          radial-gradient(850px 520px at 94% -8%,rgba(139,158,141,.12),transparent 63%),
          linear-gradient(180deg,#f7f4ee 0%,#f3f1eb 100%)!important;
      }
      body.khf-shell .main-shell:before,
      body.khf-shell .main-shell:after,
      body.khf-active .main-shell:before,
      body.khf-active .main-shell:after {
        display:none!important;
      }
      body.khf-active .topbar {
        background:linear-gradient(180deg,rgba(247,244,238,.98) 0%,rgba(247,244,238,.90) 74%,rgba(247,244,238,0) 100%)!important;
        border-bottom:0!important;
        box-shadow:none!important;
      }
      body.khf-active .topbar h1 { color:#323a33!important; }
      body.khf-active .topbar .eyebrow { color:#7c857c!important; }
      body.khf-active .view-root[data-khf-home-final="1"] {
        color:#1e241f!important;
        background:transparent!important;
      }
      body.khf-active .view-root[data-khf-home-final="1"] > [data-my-komo-home],
      body.khf-active .view-root[data-khf-home-final="1"] > [data-khome-datawall],
      body.khf-active .view-root[data-khf-home-final="1"] > [data-khc-home] {
        display:none!important;
      }

      /* The previous iPhone owner forces a black canvas with !important. The final
         Home deliberately owns its own light material system on every viewport. */
      @media(max-width:767px){
        html[data-kp-nav-mode="patient"] body.khf-shell,
        html[data-kp-nav-mode="patient"] body.khf-active,
        html[data-adaptive-shell="phone"] body.khf-shell,
        html[data-adaptive-shell="phone"] body.khf-active,
        html.kamo-phone-app body.khf-shell,
        html.kamo-phone-app body.khf-active {
          background:#f3f1eb!important;
          color:#1e241f!important;
        }
        html[data-adaptive-shell="phone"] body.khf-shell #appShell,
        html[data-adaptive-shell="phone"] body.khf-active #appShell,
        html[data-adaptive-shell="phone"] body.khf-shell .main-shell,
        html[data-adaptive-shell="phone"] body.khf-active .main-shell,
        html.kamo-phone-app body.khf-shell #appShell,
        html.kamo-phone-app body.khf-active #appShell,
        html.kamo-phone-app body.khf-shell .main-shell,
        html.kamo-phone-app body.khf-active .main-shell {
          background:
            radial-gradient(520px 360px at 100% -4%,rgba(139,158,141,.11),transparent 62%),
            linear-gradient(180deg,#f7f4ee 0%,#f3f1eb 100%)!important;
        }
        html[data-adaptive-shell="phone"] body.khf-active #viewRoot[data-khf-home-final="1"],
        html.kamo-phone-app body.khf-active #viewRoot[data-khf-home-final="1"] {
          width:100%!important;
          max-width:100%!important;
          padding:8px 12px 94px!important;
          overflow-x:hidden!important;
          overflow-y:visible!important;
          background:transparent!important;
          color:#1e241f!important;
        }
        html[data-adaptive-shell="phone"] body.khf-active #viewRoot[data-khf-home-final="1"] .khf,
        html.kamo-phone-app body.khf-active #viewRoot[data-khf-home-final="1"] .khf {
          width:100%!important;
          max-width:none!important;
          min-width:0!important;
          margin:0!important;
          color:#1e241f!important;
        }
        html[data-adaptive-shell="phone"] body.khf-active #viewRoot[data-khf-home-final="1"] .khf-age,
        html[data-adaptive-shell="phone"] body.khf-active #viewRoot[data-khf-home-final="1"] .khf-panel,
        html.kamo-phone-app body.khf-active #viewRoot[data-khf-home-final="1"] .khf-age,
        html.kamo-phone-app body.khf-active #viewRoot[data-khf-home-final="1"] .khf-panel {
          color:#1e241f!important;
        }
        body.khf-active .topbar{background:transparent!important}
      }
    `;
    document.head.appendChild(style);
  }

  function cleanLegacyState() {
    const home = route() === 'home';
    document.body.classList.toggle('khf-shell', home);
    if (!home) {
      document.body.classList.remove('khf-active');
      return;
    }
    document.body.classList.remove('khome-v2', 'khome-v3', 'khome-final-v1');
    const root = document.querySelector('#viewRoot');
    if (!root) return;
    root.querySelectorAll(':scope > [data-my-komo-home], :scope > [data-khome-datawall], :scope > [data-khc-home]').forEach((node) => node.remove());
  }

  function go(target) {
    if (!target) return;
    if (window.KomoPatientNavigation?.go) window.KomoPatientNavigation.go(target);
    else location.hash = target;
  }

  document.addEventListener('click', (event) => {
    const trigger = event.target?.closest?.('[data-khf] [data-route]');
    if (!trigger) return;
    const target = trigger.dataset.route;
    if (!target) return;
    event.preventDefault();
    event.stopPropagation();
    go(target);
  }, true);

  function refresh() {
    ensureStyle();
    cleanLegacyState();
  }

  ['hashchange','pageshow','komo:route-ready','komo:canonical-route','komo:data-ready','komo:canonical-result-ready','komo:session-ready']
    .forEach((name) => window.addEventListener(name, () => setTimeout(refresh, 20)));

  ensureStyle();
  cleanLegacyState();
  document.addEventListener('DOMContentLoaded', () => setTimeout(refresh, 20));
  setTimeout(refresh, 350);
  setTimeout(refresh, 1200);

  window.KomoPatientHomeStability = { version: VERSION, refresh };
})();
