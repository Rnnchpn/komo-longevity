(() => {
  'use strict';

  try {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  } catch (_) {}

  let timer = null;

  function resetScroll() {
    try { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }); } catch (_) { window.scrollTo(0, 0); }
    document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;

    [
      '.main-shell',
      '.view-root',
      '.shell',
      '[data-scroll-container]',
      '.modal-body',
      '.drawer-body'
    ].forEach((selector) => {
      document.querySelectorAll(selector).forEach((node) => {
        try { node.scrollTop = 0; node.scrollLeft = 0; } catch (_) {}
      });
    });
  }

  function scheduleReset() {
    clearTimeout(timer);
    resetScroll();
    requestAnimationFrame(() => {
      resetScroll();
      requestAnimationFrame(resetScroll);
    });
    timer = setTimeout(resetScroll, 120);
  }

  // Initial native page load / browser history restoration.
  scheduleReset();
  document.addEventListener('DOMContentLoaded', scheduleReset, { once: true });
  window.addEventListener('pageshow', scheduleReset);
  window.addEventListener('popstate', scheduleReset);

  // Pulse SPA navigation.
  window.addEventListener('hashchange', scheduleReset);
  window.addEventListener('komo:route-ready', scheduleReset);

  // Reset as soon as a navigation intent is detected; the route events above
  // repeat it after the destination has rendered.
  document.addEventListener('click', (event) => {
    const target = event.target.closest('a[href],button[data-route],[data-k2tw-open],.k2native-dossier-link');
    if (!target) return;

    const href = target.getAttribute?.('href') || '';
    const isRouteButton = target.matches?.('button[data-route]');
    const isInternalLink = href.startsWith('#') || href.startsWith('./') || href.startsWith('/') || href.includes('dossier.html');

    if (isRouteButton || isInternalLink) setTimeout(scheduleReset, 0);
  }, true);

  window.KomoNavigationScroll = {
    version: 'canonical-1',
    reset: scheduleReset
  };
})();
