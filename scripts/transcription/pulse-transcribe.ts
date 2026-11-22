// Transcription de la feuille de mesures KŌMØ Motion dans PULSE (22/11/2026).
//
// Le praticien fait les tests avec la feuille papier, l'envoie en photo, et Claude enregistre les valeurs
// dans la consultation PULSE (circuit validé par l'avocat du cabinet le 22/11/2026).
//
// Ce script applique EXACTEMENT les règles du serveur : il exécute le code de l'edge function
// motion-live-test (action operator_results_bulk) sur une copie locale de la consultation. Il produit :
//   1) un récapitulatif à faire relire au praticien AVANT toute écriture (valeurs, calculs, alertes) ;
//   2) la requête SQL qui ajoute seulement les résultats transcrits. Le reste de la consultation
//      (questionnaire, lien patient, autres tests) n'est pas réécrit, et la requête est refusée si la
//      consultation a changé depuis sa lecture (garde sur updated_at).
//
// Usage : deno run -A scripts/transcription/pulse-transcribe.ts saisie.json [sortie.sql]
// Format de saisie.json et procédure complète : scripts/transcription/README.md
import {DB,USERS} from "./fake-supabase.ts";
import {STEPS as PROTOCOL_STEPS,toNewton,plausibilityWarnings,stsRelativePower} from "../../pulse-v14-src/motion-protocol.mjs";

const here=new URL(".",import.meta.url).pathname;
const EDGE=here+"../../supabase/functions/motion-live-test/";
const [inputPath,outPath]=Deno.args;
if(!inputPath){console.error("Usage : deno run -A pulse-transcribe.ts saisie.json [sortie.sql]");Deno.exit(2);}
const input=JSON.parse(await Deno.readTextFile(inputPath));
const session=input.session,patient=input.patient||{},center=input.center||{};
if(!session?.id||!session?.organization_id||!session?.operator_user_id||!session?.updated_at)
 throw Error("session incomplète : coller le résultat de row_to_json(s) (voir README)");

// ---- 1. Valeurs de la feuille → format du serveur (unités, meilleur essai, décimales) ----
const STEP=Object.fromEntries((PROTOCOL_STEPS as any[]).map(s=>[s.id,s]));
const fmt=(v:number,d=1)=>Number.isFinite(v)?String(Math.round(v*10**d)/10**d).replace(".",","):"—";
const entries:Record<string,any>={};
const warnings:Record<string,string[]>={};
for(const [id,raw] of Object.entries(input.values||{}) as [string,any][]){
 const st=STEP[id];if(!st)throw Error("test inconnu dans la saisie : "+id);
 const w:string[]=[];
 if(raw.skip_reason){entries[id]={skip_reason:raw.skip_reason,...(raw.note!==undefined?{note:raw.note}:{})};warnings[id]=w;continue;}
 if(st.kind==="count"){entries[id]={value:raw.value,...(raw.note!==undefined?{note:raw.note}:{})};warnings[id]=w;continue;}
 const fields:Record<string,any>={...(raw.fields||{})};
 // Appui unipodal : deux essais notés sur la feuille, le meilleur est retenu (comme le chrono PULSE).
 if(st.value_field&&Array.isArray(raw.trials)){
  const t=raw.trials.filter((x:unknown)=>typeof x==="number"&&Number.isFinite(x));
  if(t.length)fields[st.value_field]=Math.max(...t);
 }
 for(const f of st.fields||[]){
  if(typeof fields[f.key]!=="number")continue;
  let v=fields[f.key];
  // DynaMo : la feuille indique N ou kg ; le protocole enregistre des newtons.
  if(st.dynamo&&f.unit==="N"&&raw.unit==="kg"){
   if(v>150)w.push("Valeur très haute pour des kilos ("+fmt(v)+") : l’écran DynaMo était-il en N ?");
   v=toNewton(v,"kg");
  }
  fields[f.key]=Math.round(v*10**f.decimals)/10**f.decimals;
 }
 w.push(...plausibilityWarnings(id,fields));
 entries[id]={fields,...(raw.note!==undefined?{note:raw.note}:{})};
 warnings[id]=w;
}
if(!Object.keys(entries).length)throw Error("aucune valeur à transcrire");

// ---- 2. Exécution du code serveur sur une copie de la consultation ----
let src=await Deno.readTextFile(EDGE+"index.ts");
src=src.replace(/^import "jsr:.*$/m,"").replace("https://esm.sh/@supabase/supabase-js@2.57.4",here+"fake-supabase.ts")
 .replace('"./protocol.ts"','"'+EDGE+'protocol.ts"')
 .replace("Deno.serve(async(req:Request)=>{","(globalThis as any).__handler=(async(req:Request)=>{");
const tmp=await Deno.makeTempFile({suffix:".ts"});
await Deno.writeTextFile(tmp,src);
await import("file://"+tmp);
const handler=(globalThis as any).__handler as (r:Request)=>Promise<Response>;
const copy=JSON.parse(JSON.stringify(session));
// Contraintes du faux stockage seulement (non réécrites dans PULSE).
if(!/^[0-9a-f]{64}$/.test(copy.guest_token_hash||""))copy.guest_token_hash="0".repeat(64);
if(!/^[0-9]{6}$/.test(copy.display_code||""))copy.display_code="000000";
DB.organizations.push({id:session.organization_id,status:"active",clinical_data_status:center.clinical_data_status||"production_enabled"});
DB.organization_members.push({organization_id:session.organization_id,user_id:session.operator_user_id,role:"owner",status:"active"});
DB.account_roles.push({user_id:session.operator_user_id,role:"admin"});
DB.patients.push({id:session.patient_id,organization_id:session.organization_id,status:patient.status||"active",
 data_classification:patient.data_classification||"health_data"});
DB.pulse_motion_live_sessions.push(copy);
USERS["jwt-transcription"]={id:session.operator_user_id,email:"transcription@local"};
const res=await handler(new Request("https://edge.local/motion-live-test",{method:"POST",
 headers:{"content-type":"application/json",origin:"https://pulse.komolongevity.com",apikey:"pk",authorization:"Bearer jwt-transcription"},
 body:JSON.stringify({action:"operator_results_bulk",organization_id:session.organization_id,session_id:session.id,
  safety_confirmed:input.safety_confirmed===true,transcribed_by:"assistant",entries})}));
const out=await res.json();
await Deno.remove(tmp);
if(!res.ok||out.error){
 console.error("REFUSÉ par les règles PULSE : "+out.error+(out.step?" · test "+out.step:"")+(out.detail?" · "+out.detail:""));
 Deno.exit(1);
}
const row=DB.pulse_motion_live_sessions.find(x=>x.id===session.id)!;
const R=row.progress.results;

// ---- 3. Récapitulatif à faire relire ----
const lines:string[]=[];
const code=input.code||"(code PULSE)";
lines.push("Transcription · "+code+" · "+Object.keys(entries).length+" test(s) · consultation "+
 (row.status==="completed"?"terminée après écriture":"encore "+out.remaining+" test(s) à faire"));
const height=R.anthropometry?.fields?.height_cm;
for(const st of PROTOCOL_STEPS as any[]){
 const r=R[st.id];
 if(!entries[st.id]){lines.push("  · "+st.title+" : "+(r?(r.status==="skipped"?"déjà noté non réalisé":"déjà enregistré, inchangé"):"à faire"));continue;}
 if(r.status==="skipped"){lines.push("  ✓ "+st.title+" : non réalisé ("+r.reason+")"+(r.note?" · "+r.note:""));continue;}
 const parts:string[]=[];
 if(st.kind==="count")parts.push(r.value+" levers");
 else for(const f of st.fields){const v=r.fields?.[f.key];if(typeof v==="number")parts.push(f.label.replace(" · meilleur essai","")+" "+fmt(v,f.decimals)+" "+f.unit);}
 for(const c of st.choices||[]){const v=r.fields?.[c.key];if(v)parts.push(c.label.replace(/ \(.*\)/,"")+" : "+(c.options.find((o:any)=>o[0]===v)?.[1]||v));}
 const d=r.derived||{};
 if(typeof d.gait_speed_ms==="number")parts.push("→ vitesse "+fmt(d.gait_speed_ms,2)+" m/s");
 if(typeof d.lsi_pct==="number")parts.push("→ symétrie "+fmt(d.lsi_pct)+" %"+(d.weaker_side&&d.weaker_side!=="balanced"?" (plus faible : "+(d.weaker_side==="left"?"gauche":"droite")+")":""));
 if(st.kind==="count"&&typeof height==="number"){const p=stsRelativePower(height,r.value);if(p)parts.push("→ puissance estimée "+fmt(p,2)+" W/kg");}
 lines.push("  ✓ "+st.title+" : "+parts.join(" · ")+(r.note?" · note : "+r.note:""));
 for(const w of warnings[st.id]||[])lines.push("      ⚠ "+w);
}
console.log(lines.join("\n"));

// ---- 4. Requête SQL : n'ajoute que les résultats transcrits ----
const dollar=(tag:string,s:string)=>{if(s.includes("$"+tag+"$"))throw Error("délimiteur SQL présent dans les données");return "$"+tag+"$"+s+"$"+tag+"$";};
const lit=(s:string)=>"'"+String(s).replace(/'/g,"''")+"'";
const written=Object.fromEntries(Object.keys(entries).map(id=>[id,R[id]]));
const sql=`-- Transcription feuille de mesures · ${code} · ${new Date().toISOString()}
update public.pulse_motion_live_sessions s set
 progress = s.progress || jsonb_build_object(
  'results', coalesce(s.progress->'results','{}'::jsonb) || ${dollar("r",JSON.stringify(written))}::jsonb,
  'safety_confirmed', true,
  'step_status', 'pending',
  'test_started_at', null,
  'protocol', coalesce(s.progress->'protocol', ${dollar("p",JSON.stringify(row.progress.protocol))}::jsonb),
  'paper_transcription', ${dollar("t",JSON.stringify(row.progress.paper_transcription))}::jsonb),
 status = ${lit(row.status)}, stage_code = ${lit(row.stage_code)}, step_index = ${Number(row.step_index)},
 completed_at = ${row.completed_at?lit(row.completed_at)+"::timestamptz":"null"},
 updated_at = ${lit(row.updated_at)}::timestamptz
where s.id = ${lit(session.id)} and s.updated_at = ${lit(session.updated_at)}::timestamptz
returning s.id, s.status, s.step_index, s.updated_at,
 (select count(*) from jsonb_object_keys(s.progress->'results')) as tests_enregistres;
`;
// ---- 5. Contrôle après écriture : relit PULSE et compare chaque valeur à ce qui devait être écrit ----
// Empreinte identique des deux côtés : tests triés, puis statut | champs triés | valeur | motif | note.
const canon=Object.keys(written).sort().map(k=>{const v=written[k];
 const f=Object.keys(v.fields||{}).sort().map(x=>x+"="+String(v.fields[x])).join(",");
 return k+"|"+v.status+"|"+f+"|"+(v.value??"")+"|"+(v.reason??"")+"|"+(v.note??"");}).join(";");
const {createHash}=await import("node:crypto");
const digest=createHash("md5").update(canon,"utf8").digest("hex");
const ids=Object.keys(written).map(lit).join(",");
const verify=`-- Contrôle de la transcription · ${code}
select s.status, s.step_index, md5(string_agg(r.k||'|'||(r.v->>'status')||'|'||
  coalesce((select string_agg(f.fk||'='||f.fv, ',' order by f.fk collate "C") from jsonb_each_text(coalesce(r.v->'fields','{}'::jsonb)) as f(fk,fv)),'')||'|'||
  coalesce(r.v->>'value','')||'|'||coalesce(r.v->>'reason','')||'|'||coalesce(r.v->>'note',''), ';' order by r.k collate "C")) = ${lit(digest)} as conforme,
 count(*) as tests_controles
from public.pulse_motion_live_sessions s, jsonb_each(s.progress->'results') as r(k,v)
where s.id = ${lit(session.id)} and r.k in (${ids})
group by s.status, s.step_index;
`;
if(outPath){
 await Deno.writeTextFile(outPath,sql);
 await Deno.writeTextFile(outPath.replace(/\.sql$/,"")+".controle.sql",verify);
 console.log("\nRequête écrite : "+outPath+" (à exécuter seulement après accord du praticien)");
 console.log("Contrôle après écriture : "+outPath.replace(/\.sql$/,"")+".controle.sql (attendu : conforme = true, "+
  Object.keys(written).length+" tests, statut "+row.status+")");
}else console.log("\n"+sql+"\n"+verify);
