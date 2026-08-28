const root = document.documentElement;
const header = document.getElementById('site-header');
const mobileMenu = document.querySelector('[data-mobile-menu]');

document.querySelectorAll('[data-asset]').forEach((image) => {
  const markLoaded = () => image.classList.add('is-loaded');
  if (image.complete && image.naturalWidth) markLoaded();
  else image.addEventListener('load', markLoaded, { once: true });
});

function resolveInitialLanguage() {
  const stored = localStorage.getItem('komo-life-language');
  if (stored === 'en' || stored === 'fr') return stored;
  return navigator.language?.toLowerCase().startsWith('fr') ? 'fr' : 'en';
}

function setLanguage(language) {
  const lang = language === 'fr' ? 'fr' : 'en';
  root.dataset.lang = lang;
  root.lang = lang;
  localStorage.setItem('komo-life-language', lang);

  document.querySelectorAll('[data-en][data-fr]').forEach((element) => {
    const value = lang === 'fr' ? element.dataset.fr : element.dataset.en;
    if (value !== undefined) element.textContent = value;
  });

  document.querySelectorAll('[data-en-html][data-fr-html]').forEach((element) => {
    const value = lang === 'fr' ? element.dataset.frHtml : element.dataset.enHtml;
    if (value !== undefined) element.innerHTML = value;
  });

  document.title = lang === 'fr'
    ? 'KŌMØ Life — La longévité en mouvement'
    : 'KŌMØ Life — Longevity in Motion';
}

setLanguage(resolveInitialLanguage());

document.querySelectorAll('[data-language-toggle]').forEach((toggle) => {
  toggle.addEventListener('click', () => setLanguage(root.dataset.lang === 'fr' ? 'en' : 'fr'));
});

function closeMenu() {
  mobileMenu?.classList.remove('is-open');
  mobileMenu?.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('menu-open');
}

function openMenu() {
  mobileMenu?.classList.add('is-open');
  mobileMenu?.setAttribute('aria-hidden', 'false');
  document.body.classList.add('menu-open');
}

document.querySelector('[data-menu-toggle]')?.addEventListener('click', openMenu);
document.querySelector('[data-menu-close]')?.addEventListener('click', closeMenu);

document.querySelectorAll('[data-scroll]').forEach((control) => {
  control.addEventListener('click', () => {
    const target = document.getElementById(control.dataset.scroll);
    closeMenu();
    if (!target) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  });
});

function syncHeader() {
  header?.classList.toggle('is-scrolled', window.scrollY > 28);
}

syncHeader();
window.addEventListener('scroll', syncHeader, { passive: true });

const revealObserver = 'IntersectionObserver' in window
  ? new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' })
  : null;

document.querySelectorAll('.reveal').forEach((element) => {
  if (revealObserver) revealObserver.observe(element);
  else element.classList.add('is-visible');
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});
