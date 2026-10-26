// Synthetic-only smoke test of KŌMØ commercial directory. No database writes and no PII.
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
const root=process.cwd();
const app=await readFile(join(root,'site','pulse-v14','app.js'),'utf8');
const css=await readFile(join(root,'site','pulse-v14','premium-motion.css'),'utf8');
const sql=await readFile(join(root,'supabase','migrations','20261026122000_komo_commercial_intake_v1.sql'),'utf8');
const tests=[
 ['commercial tab for admin',app.includes("['clients','Clients']")],
 ['exactly two locations',sql.includes("'paris_centre','cannes'")],
 ['all health data excluded',!sql.includes('medical_notes')&&!sql.includes('diagnosis')&&!sql.includes('birth_date')&&!sql.includes('questionnaire')],
 ['RLS enabled',sql.includes('enable row level security')],
 ['admin write restriction',sql.includes('private.user_is_global_admin()')],
 ['client delete disabled',!sql.includes('for delete')],
 ['synthetic cases isolated',app.includes('Dossiers Motion · démonstration')],
 ['no automatic Acuity writing',app.includes("booking_source:'manual'")&&!app.includes("booking_source:'acuity',created_by")],
 ['privacy warning',app.includes("N'enregistrez ici que les coordonnées nécessaires")],
 ['status progression',app.includes("['confirme','Confirmé']")&&app.includes("['accueilli','Accueilli']")],
 ['responsive UI',css.includes('.cc-stats')&&css.includes('@media(max-width:640px)')],
 ['content uses RLS collection',app.includes("from('komo_commercial_contacts')")]
];
const base=app.replace(/^import .*?;\n/gm,'');
const bootAt=base.indexOf("window.addEventListener('hashchange'");
if(bootAt<0)throw new Error('Pulse app boot anchor missing');
const source=base.slice(0,bootAt)+'\nreturn {S,clients,clientRecords,filterClientRecords,openClientProfile,saveCommercialContact,loadCommercialContacts,admin,render}';
const elements=new Map();
function el(k){
 if(!elements.has(k))elements.set(k,{innerHTML:'',textContent:'',hidden:true,value:'',dataset:{},disabled:false,
    addEventListener(){},onclick:null,oninput:null,focus(){},scrollIntoView(){},
    querySelector(){return el('inner '+k)},append(){},remove(){}});
 return elements.get(k);
}
const document={querySelector:el,querySelectorAll:()=>[],createElement:()=>el('created')};
const createClient=()=>({auth:{getSession:async()=>({data:{session:null}})}});
const loc={hash:'#clients'};
const user={id:'00000000-0000-4000-8000-000000000001',email:'test@example.invalid'};
const api=new Function('createClient','document','window','localStorage','location',source)(
  createClient,document,{addEventListener(){}},{getItem(){return null},setItem(){}},loc);
const contacts=[
 {id:'sample-1',center_code:'paris_centre',first_name:'Alex',last_name:'Exemple',email:'a@example.invalid',phone:null,journey_status:'nouveau',service_code:'initial',appointment_at:null,created_at:'2026-10-26T11:00:00Z',booking_source:'manual'},
 {id:'sample-2',center_code:'cannes',first_name:'Camille',last_name:'Exemple',email:'b@example.invalid',phone:null,journey_status:'confirme',service_code:'advanced',appointment_at:'2026-10-28T11:00:00Z',created_at:'2026-10-26T11:00:00Z',booking_source:'manual'}
];
Object.assign(api.S,{role:'admin',mode:'admin',clients:contacts,user,org:null,orgAppointments:[],patients:[],clientFilter:'all',clientQuery:''});
api.clients();
const rendered=el('#view').innerHTML;
tests.push(
 ['can render dashboard',rendered.includes('Vos futurs clients')&&rendered.includes('Alex')&&rendered.includes('Camille')],
 ['two city buttons',rendered.includes('data-client-center="paris_centre"')&&rendered.includes('data-client-center="cannes"')],
 ['new client is admin-only',rendered.includes('id="ccNewClient"')],
 ['contact profile no health data',rendered.includes('Aucune donnée de santé ici.')],
 ['contact rows separated',rendered.includes('data-client-id="sample-1"')&&rendered.includes('data-client-id="sample-2"')]
);
Object.assign(api.S,{role:'professional'});
api.clients();
tests.push(['pro cannot create',!el('#view').innerHTML.includes('id="ccNewClient"')]);
const fails=tests.filter(([,ok])=>!ok).map(x=>x[0]);
if(fails.length){console.error('[commercial-crm-qa] FAILED: '+fails.join(', '));process.exit(1)}
console.log('[commercial-crm-qa] '+tests.length+' checks passed');
