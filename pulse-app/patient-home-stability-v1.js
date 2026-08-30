(() => {
  'use strict';

  const VERSION = '1.0.0';
  const route = () => location.hash.replace(/^#/, '') || 'home';

  function ensureStyle() {
    if (document.querySelector('#patientHomeStabilityV1Style')) return;
    const style = document.createElement('style');
    style.id = 'patientHomeStabilityV1Style';
    style.textContent = `
      body.khf-active,
      body.khf-active #appShell,
      body.khf-active .main-shell {
        background-color:#f3f1eb!important;
      }
      body.khf-active #appShell,
      body.khf-active .main-shell {
        background:
          radial-gradient(850px 520px at 94% -8%,rgba(139,158,141,.12),transparent 63%),
          linear-gradient(180deg,#f7f4ee 0%,#f3f1eb 100%)!important;
      }
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
      body.khf-active .view-root[data-khf-home-final="1"] { color:#1e241f!important; }
      body.khf-active .view-root[data-khf-home-final="1"] > [data-my-komo-home],
      body.khf-active .view-root[data-khf-home-final="1"] > [data-khome-datawall],
      body.khf-active .view-root[data-khf-home-final="1"] > [data-khc-home] {
        display:none!important;
      }
      @media(max-width:760px){
        body.khf-active .topbar{background:transparent!important}
      }
    `;
    document.head.appendChild(style);
  }

  function cleanLegacyState() {
    if (route() !== 'home') return;
    document.body.classList.remove('khome-v3', 'khome-final-v1');
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

  document.addEventListener('DOMContentLoaded', () => setTimeout(refresh, 80));
  setTimeout(refresh, 600);
  setTimeout(refresh, 1800);

  window.KomoPatientHomeStability = { version: VERSION, refresh };
})();
