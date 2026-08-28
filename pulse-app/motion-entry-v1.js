/* KŌMØ Pulse — Motion entry v2
   First-level patient access to the canonical Motion booking / preparation flow.
   The operational booking workflow remains owned by #documents / booking-layer-v1. */
(() => {
  let timer = null;

  const motionIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 18.5c3.4 0 4.2-4.1 7-4.1s3.8-7.1 7-7.1"/><circle cx="5" cy="18.5" r="2"/><circle cx="12" cy="14.4" r="2"/><circle cx="19" cy="7.3" r="2"/></svg>';

  function route() {
    return location.hash.replace(/^#/, '') || 'home';
  }

  function isMemberMode() {
    const member = document.querySelector('#modeSwitch button[data-mode="member"]');
    return !member || member.classList.contains('active');
  }

  function goMotion() {
    document.querySelector('#modeSwitch button[data-mode="member"]')?.click();
    if (location.hash !== '#motion') location.hash = 'motion';
    else schedule(0);
  }

  function startMotion() {
    document.querySelector('#modeSwitch button[data-mode="member"]')?.click();
    if (window.KomoPatientMotionBooking?.open) {
      window.KomoPatientMotionBooking.open();
      return;
    }
    location.hash = 'documents';
  }

  function ensureStyles() {
    if (document.querySelector('#komoMotionEntryStyle')) return;
    const style = document.createElement('style');
    style.id = 'komoMotionEntryStyle';
    style.textContent = `
      body.komo-motion-member .mobile-nav .nav-item[data-route="explore"]{display:none!important}
      .komo-motion-entry-top{min-height:42px;padding:0 15px;border:1px solid rgba(21,21,18,.12);border-radius:14px;background:#26342b;color:#fff;display:inline-flex;align-items:center;gap:9px;cursor:pointer;font-size:11px;font-weight:600;letter-spacing:-.01em;white-space:nowrap;box-shadow:0 8px 24px rgba(38,52,43,.10)}
      .komo-motion-entry-top:before{content:"";width:7px;height:7px;border-radius:50%;background:#b9c8b7;box-shadow:0 0 0 4px rgba(185,200,183,.13)}
      .komo-motion-entry-home{min-height:48px;padding:0 20px;border:1px solid #26342b;border-radius:14px;background:#26342b;color:#fff;display:inline-flex;align-items:center;justify-content:center;gap:14px;cursor:pointer;font:inherit;font-size:13px;font-weight:600}
      .komo-motion-entry-home span:last-child{font-size:16px}
      .nav-item[data-route="motion"]{color:#38463d}
      .nav-item[data-route="motion"].active{background:#26342b;color:#fff}
      .nav-item[data-route="motion"] svg{width:21px;height:21px;stroke-width:1.55}
      .kmotion-hub{display:grid;gap:16px;padding-bottom:20px}
      .kmotion-hero{position:relative;overflow:hidden;min-height:330px;padding:clamp(28px,4.2vw,58px);border-radius:30px;background:linear-gradient(132deg,#233129 0%,#34473a 62%,#526351 100%);color:#fff;box-shadow:0 22px 70px rgba(31,45,36,.14);display:grid;grid-template-columns:minmax(0,1.2fr) minmax(260px,.8fr);gap:34px;align-items:end}
      .kmotion-hero:before,.kmotion-hero:after{content:"";position:absolute;border-radius:50%;border:1px solid rgba(255,255,255,.10);pointer-events:none}.kmotion-hero:before{width:390px;height:390px;right:-150px;top:-210px}.kmotion-hero:after{width:220px;height:220px;right:90px;bottom:-160px}
      .kmotion-copy,.kmotion-quick{position:relative;z-index:1}.kmotion-eyebrow{margin:0 0 13px;font-size:9px;font-weight:700;letter-spacing:.17em;text-transform:uppercase;color:rgba(255,255,255,.58)}
      .kmotion-hero h2{margin:0;max-width:760px;font-size:clamp(42px,5.7vw,78px);line-height:.94;letter-spacing:-.062em;font-weight:500}.kmotion-hero h2 span{display:block;margin-top:15px;font-size:.24em;line-height:1.35;letter-spacing:-.015em;color:rgba(255,255,255,.66);font-weight:500}
      .kmotion-hero p{max-width:660px;margin:22px 0 0;font-size:13px;line-height:1.65;color:rgba(255,255,255,.70)}
      .kmotion-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:24px}.kmotion-primary,.kmotion-secondary{min-height:50px;padding:0 18px;border-radius:14px;font:inherit;font-size:12px;font-weight:700;cursor:pointer}.kmotion-primary{border:1px solid #fff;background:#fff;color:#26342b}.kmotion-secondary{border:1px solid rgba(255,255,255,.22);background:rgba(255,255,255,.07);color:#fff}
      .kmotion-quick{padding:22px;border:1px solid rgba(255,255,255,.13);border-radius:22px;background:rgba(255,255,255,.07);backdrop-filter:blur(8px)}.kmotion-quick>span{font-size:8px;letter-spacing:.13em;text-transform:uppercase;color:rgba(255,255,255,.55);font-weight:700}.kmotion-quick strong{display:block;margin-top:8px;font-size:21px;line-height:1.15;letter-spacing:-.035em}.kmotion-quick p{margin:9px 0 0;font-size:10px;line-height:1.5}.kmotion-quick button{width:100%;margin-top:17px;min-height:44px;border:0;border-radius:12px;background:#dfe8dd;color:#26342b;font:inherit;font-size:10px;font-weight:800;cursor:pointer}
      .kmotion-section{padding:24px;border:1px solid rgba(38,48,40,.09);border-radius:26px;background:#fbfaf7}.kmotion-section-head{display:flex;justify-content:space-between;gap:20px;align-items:end;margin-bottom:15px}.kmotion-section-head h3{margin:0;font-size:22px;letter-spacing:-.035em;font-weight:500}.kmotion-section-head p{margin:5px 0 0;color:#747b75;font-size:11px}.kmotion-section-head button{border:0;background:transparent;color:#59675d;font:inherit;font-size:10px;font-weight:700;cursor:pointer}
      .kmotion-steps{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px}.kmotion-step{min-height:165px;padding:18px;border-radius:18px;background:#f2efe9;border:1px solid rgba(38,48,40,.06);display:flex;flex-direction:column}.kmotion-step:first-child{background:#e8eee6}.kmotion-step-num{font-size:9px;font-weight:800;letter-spacing:.12em;color:#66736a}.kmotion-step strong{display:block;margin-top:28px;font-size:14px;letter-spacing:-.02em}.kmotion-step p{margin:7px 0 0;color:#747b75;font-size:10px;line-height:1.5}.kmotion-step small{margin-top:auto;padding-top:16px;color:#8c928d;font-size:8px;text-transform:uppercase;letter-spacing:.08em}
      .kmotion-access{display:grid;grid-template-columns:1fr auto;gap:18px;align-items:center;padding:22px 24px;border-radius:22px;background:#ece8df}.kmotion-access h3{margin:0;font-size:18px;letter-spacing:-.03em}.kmotion-access p{margin:6px 0 0;color:#727970;font-size:10px;line-height:1.5}.kmotion-access button{min-height:45px;padding:0 16px;border:0;border-radius:13px;background:#26342b;color:#fff;font:inherit;font-size:10px;font-weight:800;cursor:pointer;white-space:nowrap}
      @media(max-width:980px){.kmotion-hero{grid-template-columns:1fr}.kmotion-quick{max-width:480px}.kmotion-steps{grid-template-columns:repeat(2,1fr)}}
      @media(max-width:760px){.komo-motion-entry-top{min-height:38px;padding:0 11px;font-size:10px}.komo-motion-entry-top:before{display:none}.topbar-actions{gap:7px}.kmotion-hero{min-height:0;padding:26px 22px;border-radius:24px}.kmotion-hero h2{font-size:46px}.kmotion-section{padding:18px;border-radius:22px}.kmotion-section-head{align-items:flex-start;flex-direction:column}.kmotion-access{grid-template-columns:1fr}.kmotion-access button{width:100%}}
      @media(max-width:520px){.kmotion-steps{grid-template-columns:1fr}.kmotion-step{min-height:130px}.kmotion-step strong{margin-top:18px}.kmotion-actions{display:grid}.kmotion-primary,.kmotion-secondary{width:100%}.kmotion-quick{padding:18px}.komo-motion-entry-top{padding:0 9px}.komo-motion-entry-top .komo-motion-long{display:none}.komo-motion-entry-top .komo-motion-short{display:inline}}
      @media(min-width:521px){.komo-motion-entry-top .komo-motion-short{display:none}}
    `;
    document.head.appendChild(style);
  }

  function makeNavButton() {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'nav-item';
    button.dataset.route = 'motion';
    button.setAttribute('aria-label', 'Motion');
    button.innerHTML = `${motionIcon}<span>Motion</span>`;
    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      goMotion();
    });
    return button;
  }

  function patchNavHost(host, mobile = false) {
    if (!host || !isMemberMode()) return;
    let motion = host.querySelector('.nav-item[data-route="motion"]');
    if (!motion) {
      motion = makeNavButton();
      const home = host.querySelector('.nav-item[data-route="home"]');
      if (home?.nextSibling) host.insertBefore(motion, home.nextSibling);
      else if (home) host.appendChild(motion);
      else host.prepend(motion);
    }
    host.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', route() === 'motion' && item.dataset.route === 'motion' ? true : route() === 'motion' ? false : item.classList.contains('active')));
    if (mobile) {
      const explorer = host.querySelector('.nav-item[data-route="explore"]');
      if (explorer) explorer.hidden = true;
    }
  }

  function patchNavigation() {
    document.body.classList.toggle('komo-motion-member', isMemberMode());
    if (!isMemberMode()) return;
    patchNavHost(document.querySelector('#desktopNav'), false);
    patchNavHost(document.querySelector('#mobileNav'), true);
  }

  function patchTopbar() {
    const actions = document.querySelector('.topbar-actions');
    if (!actions) return;
    let button = actions.querySelector('[data-komo-motion-entry-top]');
    if (!button) {
      button = document.createElement('button');
      button.type = 'button';
      button.className = 'komo-motion-entry-top';
      button.dataset.komoMotionEntryTop = '1';
      button.innerHTML = '<span class="komo-motion-long">Bilan Motion</span><span class="komo-motion-short">Motion</span><span aria-hidden="true">→</span>';
      button.addEventListener('click', goMotion);
      actions.insertBefore(button, actions.firstChild);
    }
    button.hidden = !isMemberMode() || route() === 'motion';
  }

  function patchHome() {
    if (route() !== 'home' || !isMemberMode()) return;
    const actions = document.querySelector('#viewRoot .hero-actions');
    if (!actions) return;

    const legacy = actions.querySelector('a.primary-button[href*="/fr/bilan/"], a.primary-button[href*="/bilan/"]');
    if (legacy) {
      const replacement = document.createElement('button');
      replacement.type = 'button';
      replacement.className = legacy.className || 'primary-button';
      replacement.dataset.komoMotionEntryHome = '1';
      replacement.innerHTML = '<span>Débuter mon bilan Motion</span><span aria-hidden="true">→</span>';
      replacement.addEventListener('click', goMotion);
      legacy.replaceWith(replacement);
      return;
    }

    if (actions.querySelector('[data-komo-motion-entry-home]')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'komo-motion-entry-home';
    button.dataset.komoMotionEntryHome = '1';
    button.innerHTML = '<span>Débuter / reprendre mon bilan Motion</span><span aria-hidden="true">→</span>';
    button.addEventListener('click', goMotion);
    actions.prepend(button);
  }

  function renderMotionHub() {
    if (route() !== 'motion' || !isMemberMode()) return;
    const root = document.querySelector('#viewRoot');
    if (!root) return;

    const eyebrow = document.querySelector('#pageEyebrow');
    const title = document.querySelector('#pageTitle');
    if (eyebrow) eyebrow.textContent = 'KŌMØ MOTION';
    if (title) title.textContent = 'Votre bilan Motion.';

    if (root.querySelector('[data-komo-motion-hub]')) return;
    root.innerHTML = `
      <div class="kmotion-hub" data-komo-motion-hub>
        <section class="kmotion-hero">
          <div class="kmotion-copy">
            <p class="kmotion-eyebrow">KŌMØ MOTION · BILAN LOCOMOTEUR</p>
            <h2>Mesurer.<br>Comprendre.<br>Agir.<span>Votre bilan fonctionnel et instrumenté, accessible en quelques étapes.</span></h2>
            <p>Choisissez un centre, préparez votre pré-bilan puis réalisez les mesures Motion. Pulse rassemble ensuite vos données et votre Motion Score dans le même espace.</p>
            <div class="kmotion-actions">
              <button type="button" class="kmotion-primary" data-kmotion-start>Commencer / reprendre mon bilan →</button>
              <button type="button" class="kmotion-secondary" data-kmotion-results>Voir mes résultats</button>
            </div>
          </div>
          <aside class="kmotion-quick">
            <span>ACCÈS RAPIDE</span>
            <strong>Votre prochaine action est toujours ici.</strong>
            <p>Réservation, pré-bilan ou rendez-vous : Pulse vous ramène directement au bon écran.</p>
            <button type="button" data-kmotion-start>Ouvrir mon parcours Motion →</button>
          </aside>
        </section>

        <section class="kmotion-section">
          <div class="kmotion-section-head">
            <div><h3>Un parcours en 4 étapes.</h3><p>Pas de menu à chercher : tout part de cet écran.</p></div>
            <button type="button" data-kmotion-start>Accéder au bilan →</button>
          </div>
          <div class="kmotion-steps">
            <article class="kmotion-step"><span class="kmotion-step-num">01</span><strong>Réserver</strong><p>Choisissez votre centre KŌMØ et un créneau Motion disponible.</p><small>Centre · date · heure</small></article>
            <article class="kmotion-step"><span class="kmotion-step-num">02</span><strong>Préparer</strong><p>Complétez votre pré-bilan avant la consultation pour gagner du temps sur place.</p><small>Questionnaires · contexte</small></article>
            <article class="kmotion-step"><span class="kmotion-step-num">03</span><strong>Mesurer</strong><p>Acquisition fonctionnelle, posture et données musculaires avec l’équipe du centre.</p><small>Myodev · posture · tests</small></article>
            <article class="kmotion-step"><span class="kmotion-step-num">04</span><strong>Comprendre</strong><p>Retrouvez votre Motion Score, vos domaines et leur évolution dans Pulse.</p><small>Score · trajectoire · suivi</small></article>
          </div>
        </section>

        <section class="kmotion-access">
          <div><h3>Vous avez déjà un rendez-vous ou un bilan en cours ?</h3><p>Le même bouton vous ramène à votre réservation ou à la préparation correspondante.</p></div>
          <button type="button" data-kmotion-start>Reprendre là où j’en suis →</button>
        </section>
      </div>`;

    root.querySelectorAll('[data-kmotion-start]').forEach(button => button.addEventListener('click', startMotion));
    root.querySelector('[data-kmotion-results]')?.addEventListener('click', () => { location.hash = 'results'; });
  }

  function mount() {
    ensureStyles();
    patchNavigation();
    patchTopbar();
    patchHome();
    renderMotionHub();
  }

  function schedule(delay = 35) {
    clearTimeout(timer);
    timer = setTimeout(mount, delay);
  }

  document.addEventListener('DOMContentLoaded', () => schedule(160));
  ['hashchange', 'pageshow', 'komo:route-ready', 'komo:data-ready', 'komo:session-ready'].forEach(name => {
    window.addEventListener(name, () => schedule());
  });

  document.addEventListener('click', event => {
    const target = event.target.closest?.('[data-route="motion"]');
    if (!target) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    goMotion();
  }, true);

  const observer = new MutationObserver(() => schedule(30));
  observer.observe(document.body, { childList: true, subtree: true });
  setTimeout(() => schedule(), 600);

  window.KomoMotionEntry = { open: goMotion, start: startMotion, version: '2.0.0' };
})();
