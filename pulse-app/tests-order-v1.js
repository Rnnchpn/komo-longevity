const PHYSICAL_TESTS = new Set(['chair_stand','two_step','gait_4m','balance']);

function baselineCompleted() {
  const root = document.querySelector('.tests-v1-root');
  if (!root) return false;
  const baselineButton = root.querySelector('[data-open-test="baseline"]');
  const baselineCard = baselineButton?.closest('.test-v1-card');
  return Boolean(baselineCard?.classList.contains('is-done'));
}

function applyOrderGate() {
  if (location.hash.replace(/^#/,'') !== 'results') return;
  const root = document.querySelector('.tests-v1-root');
  if (!root) return;
  const ready = baselineCompleted();
  root.querySelectorAll('[data-open-test]').forEach(button => {
    const key = button.dataset.openTest;
    if (!PHYSICAL_TESTS.has(key)) return;
    const card = button.closest('.test-v1-card');
    if (!ready && !card?.classList.contains('is-done')) {
      button.disabled = true;
      button.textContent = 'Après le KŌMØ Check →';
      card?.classList.add('is-restricted');
      const status = card?.querySelector('.test-v1-status');
      if (status) status.textContent = 'Après le KŌMØ Check';
    }
  });
}

document.addEventListener('click', event => {
  const button = event.target.closest('[data-open-test]');
  if (!button || !PHYSICAL_TESTS.has(button.dataset.openTest)) return;
  if (baselineCompleted()) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  const baseline = document.querySelector('[data-open-test="baseline"]');
  baseline?.focus();
}, true);

const testsHost=document.querySelector('#viewRoot');
if(testsHost){const observer = new MutationObserver(() => requestAnimationFrame(applyOrderGate));observer.observe(testsHost,{subtree:true,childList:true})}
window.addEventListener('hashchange',()=>setTimeout(applyOrderGate,240));
document.addEventListener('DOMContentLoaded',()=>setTimeout(applyOrderGate,650));
