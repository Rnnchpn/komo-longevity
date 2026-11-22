// In-memory Supabase mock for running the REAL motion-live-test edge function locally.
// Mirrors the DB constraints that matter (status/step_index checks, binding check, unique token hash).
type Row=Record<string,any>;
export const DB:Record<string,Row[]>={organizations:[],organization_members:[],account_roles:[],patients:[],
 pulse_operator_sessions:[],pulse_motion_live_sessions:[],pulse_motion_live_signals:[]};
export const USERS:Record<string,{id:string,email:string}>={};
let signalSeq=0;
export let CLOCK_OFFSET_MS=0;
const nowIso=()=>new Date(Date.now()).toISOString();
function constraint(table:string,r:Row){
 if(table==="pulse_motion_live_sessions"){
  if(!["waiting","ready","active","completed","closed"].includes(r.status))return "status_check";
  if(!(r.step_index>=0&&r.step_index<=20))return "pulse_motion_live_sessions_step_index_check";
  if((r.operator_session_id==null)!==(r.patient_id==null))return "pulse_motion_live_operator_binding_check";
  if(!/^[0-9]{6}$/.test(r.display_code))return "display_code_check";
  if(!/^[0-9a-f]{64}$/.test(r.guest_token_hash))return "guest_token_hash_check";
  if(DB[table].some(x=>x!==r&&x.guest_token_hash===r.guest_token_hash))return "guest_token_hash_key";
  if(!r.organization_id)return "organization_id_not_null";
 }
 return null;
}
function defaults(table:string,r:Row){
 const n=nowIso();
 if(table==="pulse_motion_live_sessions")return {id:crypto.randomUUID(),status:"waiting",stage_code:"preflight",step_index:0,progress:{},
  patient_id:null,operator_user_id:null,operator_session_id:null,patient_last_seen_at:null,operator_last_seen_at:null,
  created_at:n,updated_at:n,expires_at:new Date(Date.now()+2*3600000).toISOString(),completed_at:null,...r};
 if(table==="pulse_motion_live_signals")return {id:++signalSeq,payload:{},created_at:n,...r};
 return {id:crypto.randomUUID(),created_at:n,...r};
}
function contains(a:any,b:any):boolean{
 if(b===null||typeof b!=="object")return a===b;
 if(a===null||typeof a!=="object")return false;
 return Object.keys(b).every(k=>contains(a[k],b[k]));
}
const clone=(x:any)=>JSON.parse(JSON.stringify(x));
class Q{
 table:string;op="select";filters:((r:Row)=>boolean)[]=[];payload:any=null;wantRows=false;
 head=false;count:string|null=null;ord:[string,boolean]|null=null;lim:number|null=null;
 constructor(t:string){this.table=t}
 select(_c?:string,o?:any){if(this.op!=="select")this.wantRows=true;if(o?.head)this.head=true;if(o?.count)this.count=o.count;return this}
 insert(p:any){this.op="insert";this.payload=p;return this}
 update(p:any){this.op="update";this.payload=p;return this}
 delete(){this.op="delete";return this}
 eq(c:string,v:any){this.filters.push(r=>r[c]===v);return this}
 neq(c:string,v:any){this.filters.push(r=>r[c]!==v);return this}
 gt(c:string,v:any){this.filters.push(r=>r[c]!=null&&r[c]>v);return this}
 gte(c:string,v:any){this.filters.push(r=>r[c]!=null&&r[c]>=v);return this}
 lt(c:string,v:any){this.filters.push(r=>r[c]!=null&&r[c]<v);return this}
 lte(c:string,v:any){this.filters.push(r=>r[c]!=null&&r[c]<=v);return this}
 ilike(c:string,v:string){const re=new RegExp("^"+String(v).replace(/[.*+?^${}()|[\]\\]/g,"\\$&").replace(/%/g,".*")+"$","i");this.filters.push(r=>re.test(String(r[c]??"")));return this}
 or(_x:any){return this} not(..._x:any[]){return this} match(o:any){for(const k of Object.keys(o))this.eq(k,o[k]);return this}
 range(a:number,b:number){this.lim=b-a+1;return this}
 upsert(p:any){this.op="insert";this.payload=p;return this}
 in(c:string,v:any[]){this.filters.push(r=>v.includes(r[c]));return this}
 is(c:string,v:any){this.filters.push(r=>v===null?r[c]==null:r[c]===v);return this}
 contains(c:string,v:any){this.filters.push(r=>contains(r[c],v));return this}
 order(c:string,o?:any){this.ord=[c,o?.ascending!==false];return this}
 limit(n:number){this.lim=n;return this}
 run():{data:any,error:any,count?:number}{
  const rows=DB[this.table]||(DB[this.table]=[]);
  const match=()=>rows.filter(r=>this.filters.every(f=>f(r)));
  if(this.op==="insert"){
   const list=(Array.isArray(this.payload)?this.payload:[this.payload]).map(p=>defaults(this.table,clone(p)));
   for(const r of list){rows.push(r);const bad=constraint(this.table,r);if(bad){rows.splice(rows.indexOf(r),1);return {data:null,error:{message:bad}}}}
   return {data:this.wantRows?clone(list):null,error:null};
  }
  if(this.op==="update"){
   const hit=match();const before=hit.map(r=>clone(r));
   for(const r of hit){Object.assign(r,clone(this.payload));const bad=constraint(this.table,r);
    if(bad){hit.forEach((x,i)=>{for(const k of Object.keys(x))delete x[k];Object.assign(x,before[i])});return {data:null,error:{message:bad}}}}
   return {data:this.wantRows?clone(hit):null,error:null};
  }
  if(this.op==="delete"){
   const hit=match();for(const r of hit)rows.splice(rows.indexOf(r),1);
   return {data:this.wantRows?clone(hit):null,error:null};
  }
  let out=match();
  if(this.ord){const [c,asc]=this.ord;out=[...out].sort((a,b)=>(a[c]>b[c]?1:a[c]<b[c]?-1:0)*(asc?1:-1));}
  if(this.lim!=null)out=out.slice(0,this.lim);
  return {data:this.head?null:clone(out),error:null,count:this.count?out.length:undefined};
 }
 maybeSingle(){const r=this.run();if(r.error)return Promise.resolve(r);const d=Array.isArray(r.data)?r.data:[];
  if(d.length>1)return Promise.resolve({data:null,error:{message:"multiple rows"}});return Promise.resolve({data:d[0]??null,error:null})}
 single(){const r=this.run();if(r.error)return Promise.resolve(r);const d=Array.isArray(r.data)?r.data:[];
  if(d.length!==1)return Promise.resolve({data:null,error:{message:"not single"}});return Promise.resolve({data:d[0],error:null})}
 then(res:any,rej:any){try{return Promise.resolve(this.run()).then(res,rej)}catch(e){return Promise.reject(e).then(res,rej)}}
}
export function createClient(..._a:any[]):any{
 return {from:(t:string)=>new Q(t),
  auth:{getUser:async(jwt:string)=>USERS[jwt]?{data:{user:USERS[jwt]},error:null}:{data:{user:null},error:{message:"invalid jwt"}}}};
}
