// No Acuity credentials are used by this test. Verify safe and functional integration surfaces.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import connection from '../api/acuity-connection.js';
import appointments from '../api/acuity-appointments.js';

const root=process.cwd();
const app=await readFile(join(root,'site','pulse-v14','app.js'),'utf8');
const c=await readFile(join(root,'api','acuity-connection.js'),'utf8');
const a=await readFile(join(root,'api','acuity-appointments.js'),'utf8');
const checks=[
 ['admin UI',app.includes('Tester ma connexion Acuity')&&app.includes('Voir les rendez-vous Acuity')],
 ['no direct Acuity API from browser',!app.includes("fetch('https://acuityscheduling.com/api/")],
 ['read-only frontend',app.includes("Données Acuity actualisées. Aucune modification effectuée dans Pulse")],
 ['role gate both endpoints',c.includes("roles[0]?.role !== 'admin'")&&a.includes("roles[0]?.role !== 'admin'")],
 ['both credential names',c.includes('ACUITY_API_KEY')&&a.includes('ACUITY_USER_ID')],
 ['private appointments',a.includes('excludeForms')&&a.includes('No contact emails')],
 ['no DB writes in Acuity endpoint',!a.includes('/rest/v1/patients')&&!a.includes('POST')&&!a.includes('service_role')],
 ['bounded retrieval',a.includes("url.searchParams.set('max', '100')")&&a.includes('minDate')&&a.includes('maxDate')],
 ['no patient cross-matching',a.includes('patientLinking: false')],
 ['no leaked credential response',!a.includes('apiKey:')&&!a.includes('Authorization: auth')]
];
const failures=[];
for(const [name,ok] of checks){if(!ok)failures.push(name)}
function res(){
 const response={code:200,headers:{},body:null,setHeader(k,v){this.headers[k]=v;return this},status(c){this.code=c;return this},json(p){this.body=p;return this},end(){return this}};return response;
}
for(const [name,fn] of [['acuity connection',connection],['acuity appointments',appointments]]){
 const anonymous=res();
 await fn({method:'GET',headers:{}},anonymous);
 if(anonymous.code!==401||anonymous.body?.status!=='authentication_required')failures.push(name+' anonymous access');
 const hostile=res();
 await fn({method:'GET',headers:{origin:'https://other.example'}},hostile);
 if(hostile.code!==403||hostile.body?.status!=='origin_not_allowed')failures.push(name+' hostile origin');
 const notGet=res();
 await fn({method:'POST',headers:{}},notGet);
 if(notGet.code!==405)failures.push(name+' write prevention');
}
if(failures.length){console.error('[acuity-qa] FAIL: '+failures.join(', '));process.exit(1)}
console.log('[acuity-qa] '+(checks.length+6)+' checks passed');
