/* KŌMØ Premium Storefront V2
 * Enhancement only. No analytics, network requests, cookies, webcam,
 * authentication, form manipulation or appointment interception. */
(() => {
  'use strict';
  const home = document.querySelector('main.ko-premium-v2');
  if (!home) return;
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const photo = home.querySelector('.kpv-hero-media');
  const header = document.querySelector('.ko-premium-header');
  let rafScroll = 0;

  // Animate the shell very gently, without hijacking native scrolling.
  const updateScroll = () => {
    rafScroll = 0;
    if (header) header.classList.toggle('ko-scrolled', window.scrollY > 18);
    if (!photo || media.matches || !finePointer.matches || window.innerWidth < 981) {
      if (photo) photo.style.setProperty('--ko-hero-shift', '0px');
      return;
    }
    const rect = photo.getBoundingClientRect();
    if (rect.bottom < -100 || rect.top > window.innerHeight + 100) return;
    const shift = Math.max(-10, Math.min(10, (rect.top - window.innerHeight * .36) * -.027));
    photo.style.setProperty('--ko-hero-shift', shift.toFixed(1) + 'px');
  };
  const onScroll = () => {
    if (!rafScroll) rafScroll = requestAnimationFrame(updateScroll);
  };
  updateScroll();
  window.addEventListener('scroll', onScroll, { passive:true });
  window.addEventListener('resize', onScroll, { passive:true });

  // Graceful progressive enhancement: the page stays fully visible without JS,
  // observer support, or when reduced motion is preferred.
  if ('IntersectionObserver' in window && !media.matches) {
    const blocks = [
      '.ko-heading', '.ko-grid .ko-card', '.ko-flow',
      '.ko-extra-head', '.ko-extra-grid .ko-extra-item',
      '.khe-eco .kt-z-heading', '.khe-eco-line',
      '.kt-z-faq', '.kt-pro-grid'
    ];
    const elements = Array.from(home.querySelectorAll(blocks.join(',')));
    elements.forEach((el, index) => {
      el.setAttribute('data-ko-reveal','');
      // Price cards and service tiles appear in a natural cascading rhythm.
      if (el.matches('.ko-card, .ko-extra-item')) {
        const group = Array.from(el.parentElement.children).indexOf(el);
        el.style.setProperty('--ko-stagger', String(Math.min(group,2) * 90) + 'ms');
      }
    });
    let observerFired = false;
    const io = new IntersectionObserver(entries => {
      observerFired = true;
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('ko-in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold:0.08, rootMargin:'0px 0px -28px 0px' });
    elements.forEach(el => io.observe(el));
    requestAnimationFrame(() => home.classList.add('ko-motion-ready'));
    // A fail-open safety net for uncommon observer/webview failures.
    window.setTimeout(() => {
      if (!observerFired) {
        elements.forEach(el => el.classList.add('ko-in-view'));
        io.disconnect();
      }
    }, 3500);
  }

  // 1.4° maximum desktop tilt and soft radial light; cosmetic only.
  if (finePointer.matches && !media.matches) {
    const cards = home.querySelectorAll('.ko-card');
    cards.forEach(card => {
      let frame = 0;
      let last = null;
      const update = () => {
        frame = 0;
        if (!last) return;
        const rect = card.getBoundingClientRect();
        const x = Math.max(0,Math.min(1,(last.clientX - rect.left)/rect.width));
        const y = Math.max(0,Math.min(1,(last.clientY - rect.top)/rect.height));
        card.style.setProperty('--ko-x',(x*100).toFixed(1)+'%');
        card.style.setProperty('--ko-y',(y*100).toFixed(1)+'%');
        card.style.setProperty('--ko-rx',((.5-y)*1.8).toFixed(2)+'deg');
        card.style.setProperty('--ko-ry',((x-.5)*1.8).toFixed(2)+'deg');
      };
      card.addEventListener('pointermove', event => {
        if (event.pointerType !== 'mouse') return;
        last = {clientX:event.clientX,clientY:event.clientY};
        if (!frame) frame = requestAnimationFrame(update);
      }, {passive:true});
      card.addEventListener('pointerleave', () => {
        if (frame) cancelAnimationFrame(frame);
        frame = 0; last = null;
        card.style.setProperty('--ko-rx','0deg');
        card.style.setProperty('--ko-ry','0deg');
      }, {passive:true});
    });
  }
})();
