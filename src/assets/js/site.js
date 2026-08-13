(() => {
  const body = document.body;
  const header = document.querySelector('.site-header');
  const menuButton = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-primary-nav]');
  const language = document.querySelector('[data-language]');
  const languageButton = language?.querySelector('button');

  const closeMenu = () => {
    nav?.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
    body.classList.remove('menu-open');
  };

  menuButton?.addEventListener('click', () => {
    const open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    body.classList.toggle('menu-open', open);
  });
  nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

  languageButton?.addEventListener('click', (event) => {
    event.stopPropagation();
    const isOpen = language.classList.toggle('is-open');
    languageButton.setAttribute('aria-expanded', String(isOpen));
  });
  document.addEventListener('click', (event) => {
    if (language && !language.contains(event.target)) {
      language.classList.remove('is-open');
      languageButton?.setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      language?.classList.remove('is-open');
      languageButton?.setAttribute('aria-expanded', 'false');
      closeMenu();
    }
  });

  document.querySelectorAll('[data-locale]').forEach((link) => {
    link.addEventListener('click', () => {
      try { localStorage.setItem('komo-locale', link.dataset.locale); } catch (_) { /* non-essential */ }
    });
  });

  const onScroll = () => header?.classList.toggle('is-scrolled', window.scrollY > 5);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .14 });
    document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
  } else {
    document.querySelectorAll('.reveal').forEach((element) => element.classList.add('is-visible'));
  }

  document.querySelectorAll('[data-carousel-controls]').forEach((controls) => {
    const carousel = document.querySelector(controls.dataset.carouselControls);
    controls.querySelectorAll('button').forEach((button) => {
      button.addEventListener('click', () => {
        const amount = carousel?.clientWidth ? carousel.clientWidth * .75 : 300;
        carousel?.scrollBy({ left: button.dataset.direction === 'next' ? amount : -amount, behavior: 'smooth' });
      });
    });
  });

  // The international site can be served from Vercel or Netlify without a
  // server-side form handler. This keeps the contact route honest: it opens a
  // pre-filled email to the official address rather than silently collecting
  // personal data through an unconfigured endpoint.
  document.querySelectorAll('[data-contact-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const values = new FormData(form);
      const subject = values.get('subject') || 'KŌMØ enquiry';
      const body = [
        `Name: ${values.get('name') || ''}`,
        `Email: ${values.get('email') || ''}`,
        '',
        values.get('message') || ''
      ].join('\n');
      window.location.href = `mailto:contact@komolongevity.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  });
})();
