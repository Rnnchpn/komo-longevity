import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const pulse=path.join(root,'site','pulse-v12');
const read=name=>fs.readFileSync(path.join(pulse,name),'utf8');
const app=read('app.js');
const patient=read('patient-v4.js');
const progression=read('progression-v2.js');
const results=read('results-motion-journey-v1.js');
const cockpit=read('clinical-cockpit-v1.js');
const motion=read('clinical-motion-v1.js');
const css=read('pulse-ui-v1.css');

const checks=[
  ['startup has no partial-data double render',!app.includes('Promise.race([fullLoad,identityReady])')&&app.includes("await loadAppData();document.body.classList.remove('komo-hydrating')")],
  ['dedicated routes use quiet mounts',app.includes("['path','documents','plan','messages','clinical'].includes(route)")&&app.includes('data-route-loading')],
  ['Progression has one owner',patient.includes("const TARGETS=new Set(['plan','documents']);")&&!patient.includes("const TARGETS=new Set(['path','plan','documents']);")],
  ['patient v4 prevents duplicate fallback renders',patient.includes('root?.querySelector(`[data-patient-v4="${r}"]`)')],
  ['Progression prevents duplicate fallback renders',progression.includes("key===lastKey&&root.querySelector('[data-ktrajectory-v1]')")&&progression.includes("!document.querySelector('[data-ktrajectory-v1]')")],
  ['Results journey prevents duplicate prepend',results.includes("!force&&document.querySelector('[data-krmj]')")],
  ['Clinical cockpit owns the visible clinical shell',cockpit.includes("new CustomEvent('komo:clinical-cockpit-ready')")&&!cockpit.includes("if(!motion)return")],
  ['Clinical Motion renders inside cockpit host',motion.includes("const cockpitHost=document.querySelector('#kcpMotionHost')")&&motion.includes('const root=cockpitHost||document.querySelector(\'#viewRoot\')')],
  ['Clinical Motion avoids duplicate host rerender',motion.includes("!force&&document.querySelector('#kcpMotionHost [data-clinical-motion-v1]')")],
  ['stable route loading style exists',css.includes('/* Route stability */')&&css.includes('.komo-route-loading')]
];
for(const [label,ok] of checks){console.log(`[pulse-flicker-qa] ${ok?'OK':'FAIL'} · ${label}`);if(!ok)process.exit(1)}
console.log(`[pulse-flicker-qa] ${checks.length} checks passed.`);
