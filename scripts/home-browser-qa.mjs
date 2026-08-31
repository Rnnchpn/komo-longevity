import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const base = process.env.HOME_QA_BASE || 'http://127.0.0.1:4173';
const outDir = join(process.cwd(), 'artifacts', 'home-visual');
await mkdir(outDir, { recursive: true });

const required = ['case', 'measure', 'score', 'pulse'];
const viewports = [
  { name: 'desktop', width: 1440, height: 1000, mobile: false, touch: false },
  { name: 'ipad', width: 1024, height: 1366, mobile: false, touch: true },
  { name: 'mobile', width: 390, height: 844, mobile: true, touch: true }
];

const browser = await chromium.launch({ headless: true });
let failed = 0;

async function testViewport(vp) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: vp.mobile,
    hasTouch: vp.touch,
    deviceScaleFactor: 1
  });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', (err) => pageErrors.push(String(err)));

  await page.goto(`${base}/fr/`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.kwo-hero');

  const result = await page.evaluate(({ required, viewportName }) => {
    const visible = (el) => {
      if (!el) return false;
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return s.display !== 'none' && s.visibility !== 'hidden' && r.width > 0 && r.height > 0;
    };
    const root = document.documentElement;
    const hero = document.querySelector('.kwo-hero');
    const title = document.querySelector('.kwo-title');
    const primary = document.querySelector('.kwo-btn');
    const header = document.querySelector('.kp-top');
    const nav = document.querySelector('.kp-nav');
    const menu = document.querySelector('.kp-menu');
    const key = document.querySelector('.home-key');
    const markerState = Object.fromEntries(required.map((id) => [id, Boolean(document.getElementById(id))]));
    const sections = [...document.querySelectorAll('section')];
    const overflowSections = sections
      .map((section) => ({
        cls: section.className || section.id || 'section',
        rect: section.getBoundingClientRect()
      }))
      .filter(({ rect }) => rect.left < -2 || rect.right > innerWidth + 2)
      .map(({ cls, rect }) => ({ cls, left: Math.round(rect.left), right: Math.round(rect.right) }));
    return {
      viewportName,
      title: document.title,
      width: innerWidth,
      scrollWidth: root.scrollWidth,
      noHorizontalOverflow: root.scrollWidth <= innerWidth + 1,
      overflowSections,
      heroVisible: visible(hero),
      titleVisible: visible(title),
      primaryVisible: visible(primary),
      headerVisible: visible(header),
      keyVisible: visible(key),
      markerState,
      primaryHeight: primary ? Math.round(primary.getBoundingClientRect().height) : 0,
      navDisplay: nav ? getComputedStyle(nav).display : 'missing',
      menuDisplay: menu ? getComputedStyle(menu).display : 'missing',
      sectionCount: sections.length
    };
  }, { required, viewportName: vp.name });

  const errors = [];
  if (!result.noHorizontalOverflow) errors.push(`horizontal overflow ${result.scrollWidth}px > ${result.width}px`);
  if (result.overflowSections.length) errors.push(`overflowing sections: ${JSON.stringify(result.overflowSections)}`);
  for (const field of ['heroVisible', 'titleVisible', 'primaryVisible', 'headerVisible', 'keyVisible']) {
    if (!result[field]) errors.push(`${field}=false`);
  }
  for (const [id, ok] of Object.entries(result.markerState)) if (!ok) errors.push(`missing #${id}`);
  if (vp.name === 'mobile' && result.primaryHeight < 48) errors.push(`mobile primary CTA is ${result.primaryHeight}px high`);
  if (vp.name === 'mobile' && result.navDisplay !== 'none') errors.push(`mobile desktop nav display=${result.navDisplay}`);
  if (vp.name === 'mobile' && result.menuDisplay === 'none') errors.push('mobile menu is hidden');
  if (vp.name === 'desktop' && result.navDisplay === 'none') errors.push('desktop nav is hidden');
  if (consoleErrors.length) errors.push(`console errors: ${consoleErrors.join(' | ')}`);
  if (pageErrors.length) errors.push(`page errors: ${pageErrors.join(' | ')}`);

  await page.screenshot({ path: join(outDir, `home-fr-${vp.name}.png`), fullPage: true });
  console.log(`[home-browser-qa] ${errors.length ? 'FAIL' : 'PASS'} · ${vp.name} ${vp.width}x${vp.height} · sections=${result.sectionCount} · scroll=${result.scrollWidth}/${result.width} · CTA=${result.primaryHeight}px`);
  for (const error of errors) console.error(`[home-browser-qa] ${vp.name} · ${error}`);
  if (errors.length) failed += errors.length;
  await context.close();
}

for (const viewport of viewports) await testViewport(viewport);

// Structural parity across localized public Home routes at desktop size.
const parityContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const parityPage = await parityContext.newPage();
let expectedSections = null;
for (const [locale, path] of [['en', '/'], ['fr', '/fr/'], ['es', '/es/']]) {
  const pageErrors = [];
  parityPage.removeAllListeners('pageerror');
  parityPage.on('pageerror', (err) => pageErrors.push(String(err)));
  await parityPage.goto(`${base}${path}`, { waitUntil: 'networkidle' });
  const state = await parityPage.evaluate((requiredIds) => ({
    markers: requiredIds.every((id) => Boolean(document.getElementById(id))),
    sections: document.querySelectorAll('section').length,
    overflow: document.documentElement.scrollWidth > innerWidth + 1
  }), required);
  if (expectedSections === null) expectedSections = state.sections;
  const localeErrors = [];
  if (!state.markers) localeErrors.push('required markers missing');
  if (state.sections !== expectedSections) localeErrors.push(`section parity ${state.sections} != ${expectedSections}`);
  if (state.overflow) localeErrors.push('horizontal overflow');
  if (pageErrors.length) localeErrors.push(`page errors: ${pageErrors.join(' | ')}`);
  console.log(`[home-browser-qa] ${localeErrors.length ? 'FAIL' : 'PASS'} · locale ${locale} · sections=${state.sections}`);
  if (localeErrors.length) {
    failed += localeErrors.length;
    for (const error of localeErrors) console.error(`[home-browser-qa] ${locale} · ${error}`);
  }
}
await parityContext.close();
await browser.close();

if (failed) {
  console.error(`[home-browser-qa] FAIL · ${failed} browser assertion(s)`);
  process.exit(1);
}
console.log('[home-browser-qa] PASS · desktop, iPad, mobile and EN/FR/ES parity validated');
