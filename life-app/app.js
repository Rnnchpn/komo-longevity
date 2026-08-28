import { LIFE_PRODUCTS, formatLifePrice } from './products.js';

const STORAGE_KEY = 'komo-life-cart-v1';
const POINTS_KEY = 'komo-life-points-preview-v1';
const DEFAULT_POINTS = 2480;

const state = {
  cart: loadJSON(STORAGE_KEY, []),
  points: Number(localStorage.getItem(POINTS_KEY) || DEFAULT_POINTS),
  activeFilter: 'All',
  menuOpen: false,
  cartOpen: false,
  pointsOpen: false
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function loadJSON(key, fallback) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key));
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function saveCart() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.cart));
}

function productBySku(sku) {
  return LIFE_PRODUCTS.find((product) => product.sku === sku);
}

function renderProducts() {
  const grid = $('#product-grid');
  if (!grid) return;
  const products = state.activeFilter === 'All'
    ? LIFE_PRODUCTS
    : LIFE_PRODUCTS.filter((product) => product.category === state.activeFilter);

  grid.innerHTML = products.map((product, index) => `
    <article class="product-card reveal" style="--delay:${Math.min(index * 50, 250)}ms" data-product="${product.sku}">
      <button class="product-visual" type="button" data-quick-view="${product.sku}" aria-label="View ${product.name}">
        <img src="${product.image}" alt="${product.name}" loading="lazy" width="720" height="900">
        <span class="product-badge">${product.badge}</span>
        <span class="product-quick">Quick view</span>
      </button>
      <div class="product-meta">
        <div>
          <p class="eyebrow">${product.collection} · ${product.tone}</p>
          <h3>${product.name}</h3>
        </div>
        <span class="price">${formatLifePrice(product.price, product.currency)}</span>
      </div>
    </article>
  `).join('');

  observeReveals();
}

function renderCart() {
  const list = $('#cart-items');
  const count = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = state.cart.reduce((sum, item) => {
    const product = productBySku(item.sku);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  $$('.cart-count').forEach((el) => {
    el.textContent = String(count);
    el.hidden = count === 0;
  });

  if (!list) return;
  if (!state.cart.length) {
    list.innerHTML = `
      <div class="empty-state">
        <p class="eyebrow">Your bag is quiet.</p>
        <h3>Collection 001 is waiting.</h3>
        <button class="text-link" type="button" data-close-cart data-scroll="collection">Explore the collection</button>
      </div>`;
  } else {
    list.innerHTML = state.cart.map((item) => {
      const product = productBySku(item.sku);
      if (!product) return '';
      return `
        <div class="cart-line" data-cart-line="${item.sku}-${item.size}">
          <img src="${product.image}" alt="" width="96" height="120">
          <div class="cart-line-copy">
            <p class="eyebrow">${product.collection}</p>
            <h4>${product.name}</h4>
            <p>${item.size} · ${product.tone}</p>
            <div class="quantity-row">
              <button type="button" aria-label="Decrease quantity" data-qty="-1" data-sku="${item.sku}" data-size="${item.size}">−</button>
              <span>${item.quantity}</span>
              <button type="button" aria-label="Increase quantity" data-qty="1" data-sku="${item.sku}" data-size="${item.size}">+</button>
              <button type="button" class="remove-line" data-remove="${item.sku}" data-size="${item.size}">Remove</button>
            </div>
          </div>
          <strong>${formatLifePrice(product.price * item.quantity, product.currency)}</strong>
        </div>`;
    }).join('');
  }

  const totalEl = $('#cart-total');
  if (totalEl) totalEl.textContent = formatLifePrice(total);
  const checkout = $('#checkout-button');
  if (checkout) checkout.disabled = state.cart.length === 0;
}

function addToCart(sku, size) {
  const product = productBySku(sku);
  if (!product) return;
  const chosenSize = size || product.sizes[0];
  const existing = state.cart.find((item) => item.sku === sku && item.size === chosenSize);
  if (existing) existing.quantity += 1;
  else state.cart.push({ sku, size: chosenSize, quantity: 1 });
  saveCart();
  renderCart();
  closeQuickView();
  openCart();
}

function changeQuantity(sku, size, delta) {
  const item = state.cart.find((entry) => entry.sku === sku && entry.size === size);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) {
    state.cart = state.cart.filter((entry) => !(entry.sku === sku && entry.size === size));
  }
  saveCart();
  renderCart();
}

function removeFromCart(sku, size) {
  state.cart = state.cart.filter((entry) => !(entry.sku === sku && entry.size === size));
  saveCart();
  renderCart();
}

function openQuickView(sku) {
  const product = productBySku(sku);
  const modal = $('#quick-view');
  if (!product || !modal) return;
  $('#quick-image').src = product.image;
  $('#quick-image').alt = product.name;
  $('#quick-eyebrow').textContent = `${product.collection} · ${product.badge}`;
  $('#quick-title').textContent = product.name;
  $('#quick-price').textContent = formatLifePrice(product.price, product.currency);
  $('#quick-description').textContent = product.description;
  $('#quick-detail').textContent = product.detail;
  $('#quick-tone').textContent = product.tone;
  const sizes = $('#quick-sizes');
  sizes.innerHTML = product.sizes.map((size, index) => `
    <label class="size-chip">
      <input type="radio" name="quick-size" value="${size}" ${index === 0 ? 'checked' : ''}>
      <span>${size}</span>
    </label>`).join('');
  $('#quick-add').dataset.sku = product.sku;
  modal.hidden = false;
  requestAnimationFrame(() => modal.classList.add('is-open'));
  document.body.classList.add('locked');
  $('#quick-close').focus();
}

function closeQuickView() {
  const modal = $('#quick-view');
  if (!modal || modal.hidden) return;
  modal.classList.remove('is-open');
  setTimeout(() => { modal.hidden = true; }, 180);
  if (!state.cartOpen && !state.pointsOpen && !state.menuOpen) document.body.classList.remove('locked');
}

function setPanel(panel, open) {
  const element = $(`#${panel}`);
  if (!element) return;
  element.classList.toggle('is-open', open);
  element.setAttribute('aria-hidden', String(!open));
  if (panel === 'cart-drawer') state.cartOpen = open;
  if (panel === 'points-drawer') state.pointsOpen = open;
  if (panel === 'mobile-menu') state.menuOpen = open;
  const anyOpen = state.cartOpen || state.pointsOpen || state.menuOpen || !$('#quick-view')?.hidden;
  document.body.classList.toggle('locked', anyOpen);
}

function openCart() {
  setPanel('points-drawer', false);
  setPanel('mobile-menu', false);
  setPanel('cart-drawer', true);
}

function closeCart() { setPanel('cart-drawer', false); }
function openPoints() {
  setPanel('cart-drawer', false);
  setPanel('mobile-menu', false);
  setPanel('points-drawer', true);
}
function closePoints() { setPanel('points-drawer', false); }
function toggleMenu() { setPanel('mobile-menu', !state.menuOpen); }

async function checkout() {
  const button = $('#checkout-button');
  if (!button || !state.cart.length) return;
  const previous = button.textContent;
  button.disabled = true;
  button.textContent = 'Preparing secure checkout…';
  try {
    const response = await fetch('/api/life-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: state.cart.map(({ sku, size, quantity }) => ({ sku, size, quantity }))
      })
    });
    const payload = await response.json();
    if (!response.ok || !payload.url) throw new Error(payload.error || 'checkout_unavailable');
    window.location.assign(payload.url);
  } catch (error) {
    const message = $('#checkout-message');
    if (message) {
      message.hidden = false;
      message.textContent = 'Secure checkout is staged but not activated yet. Stripe product IDs and the production secret key must be connected before the founding drop opens.';
    }
    button.disabled = false;
    button.textContent = previous;
  }
}

function applyFilter(filter) {
  state.activeFilter = filter;
  $$('.filter-button').forEach((button) => {
    const active = button.dataset.filter === filter;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  renderProducts();
}

function observeReveals() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });
  $$('.reveal:not(.revealed)').forEach((element) => observer.observe(element));
}

function scrollToSection(id) {
  const target = document.getElementById(id);
  if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  setPanel('mobile-menu', false);
  closeCart();
}

function syncHeader() {
  const header = $('#site-header');
  if (!header) return;
  header.classList.toggle('is-scrolled', window.scrollY > 24);
}

function bindEvents() {
  document.addEventListener('click', (event) => {
    const quick = event.target.closest('[data-quick-view]');
    if (quick) return openQuickView(quick.dataset.quickView);

    const filter = event.target.closest('[data-filter]');
    if (filter) return applyFilter(filter.dataset.filter);

    if (event.target.closest('[data-open-cart]')) return openCart();
    if (event.target.closest('[data-close-cart]')) return closeCart();
    if (event.target.closest('[data-open-points]')) return openPoints();
    if (event.target.closest('[data-close-points]')) return closePoints();
    if (event.target.closest('[data-menu-toggle]')) return toggleMenu();
    if (event.target.closest('[data-menu-close]')) return setPanel('mobile-menu', false);

    const quantity = event.target.closest('[data-qty]');
    if (quantity) return changeQuantity(quantity.dataset.sku, quantity.dataset.size, Number(quantity.dataset.qty));

    const remove = event.target.closest('[data-remove]');
    if (remove) return removeFromCart(remove.dataset.remove, remove.dataset.size);

    const scroll = event.target.closest('[data-scroll]');
    if (scroll) return scrollToSection(scroll.dataset.scroll);
  });

  $('#quick-close')?.addEventListener('click', closeQuickView);
  $('#quick-view')?.addEventListener('click', (event) => {
    if (event.target.id === 'quick-view') closeQuickView();
  });
  $('#quick-add')?.addEventListener('click', (event) => {
    const selected = $('input[name="quick-size"]:checked');
    addToCart(event.currentTarget.dataset.sku, selected?.value);
  });
  $('#checkout-button')?.addEventListener('click', checkout);

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    closeQuickView();
    closeCart();
    closePoints();
    setPanel('mobile-menu', false);
  });

  window.addEventListener('scroll', syncHeader, { passive: true });
}

function init() {
  renderProducts();
  renderCart();
  const pointsValue = $('#points-value');
  if (pointsValue) pointsValue.textContent = state.points.toLocaleString('en-GB');
  const accountPoints = $('#account-points');
  if (accountPoints) accountPoints.textContent = state.points.toLocaleString('en-GB');
  bindEvents();
  observeReveals();
  syncHeader();
  document.documentElement.classList.add('life-ready');
}

init();
