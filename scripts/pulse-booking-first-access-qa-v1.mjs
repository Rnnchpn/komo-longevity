import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const root=process.cwd();
const appFile=join(root,'site','pulse-v14','app.js');
const app=await readFile(appFile,'utf8');
const css=await readFile(join(root,'site','pulse-v14','premium-motion.css'),'utf8');
const html=await readFile(join(root,'site','pulse-v14','index.html'),'utf8');
const tests=[
  ['booking first information',app.includes('Pour créer votre compte, commencez par choisir votre rendez-vous.')],
  ['create-account action visible',app.includes('Créer mon compte · Prendre rendez-vous')],
  ['official Acuity owner',app.includes('owner=40696577')],
  ['create account points to Acuity',app.includes('href="${BOOKING_URL}"')],
  ['existing login available',app.includes("id=\"showExistingLogin\"") && app.includes("id=\"login\"")],
  ['reserved patient recovery',app.includes("Demander l'activation de mon compte")],
  ['Paris and Cannes distinguished',app.includes('CANNES_REQUEST_URL') && app.includes('Vous préférez Cannes ?')],
  ['no fraudulent instant activation message',app.includes("Notre équipe") || app.includes('notre équipe')],
  ['no unverified self-registration',!app.includes('sb.auth.signUp(')],
  ['mobile onboarding layout',css.includes('.pulse-entry .login-story') && css.includes('@media(max-width:540px)')],
  ['single V14 entry bundle',html.includes('./app.js') && html.includes('./premium-motion.css')]
];
try { execFileSync(process.execPath,['--check',appFile],{stdio:'pipe'}); }
catch(error){ console.error('[pulse-booking-entry] JavaScript syntax error:',String(error.stderr||error.message));process.exit(1); }
const failed=tests.filter(([,ok])=>!ok).map(([name])=>name);
if(failed.length){console.error('[pulse-booking-entry] FAILED: '+failed.join(', '));process.exit(1)}
console.log('[pulse-booking-entry] '+(tests.length+1)+' checks passed');
