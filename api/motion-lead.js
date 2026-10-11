import {randomUUID} from "node:crypto";
const DEST=process.env.KOMO_CONTACT_TO_EMAIL || "contact@komolongevity.com";
const FROM=process.env.KOMO_CONTACT_FROM_EMAIL || "contact@komolongevity.com";
const clean=(s,n=140)=>String(s??"").trim().slice(0,n).replace(/[\r\n]+/g," ");
const emailOk=x=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x)&&x.length<=180;
const allowed={b2c:{mode:["mobile","center"],venue:["private","yacht","hotel","club","center","event","other"],assessment:["initial","performance","followup","unsure"]},b2b:{sector:["health","hospitality","fitness","wellness","other"],system:["case","bench","lab"],request:["demo","quote"]}};
const encode=s=>String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
export default async function handler(req,res){
 res.setHeader("Cache-Control","no-store");res.setHeader("Content-Type","application/json; charset=utf-8");
 if(req.method!=="POST"){res.setHeader("Allow","POST");return res.status(405).json({ok:false,error:"method"});}
 const origin=clean(req.headers.origin,255);
 const validOrigin=!origin||["https://komolongevity.com","https://www.komolongevity.com"].includes(origin)||/^https:\/\/komo-longevity-[a-z0-9-]+\.vercel\.app$/.test(origin);
 if(!validOrigin)return res.status(403).json({ok:false,error:"origin"});
 if(Number(req.headers["content-length"]||0)>12000)return res.status(413).json({ok:false,error:"too_large"});
 let p=req.body||{};
 if(typeof p==="string"){try{p=JSON.parse(p)}catch{return res.status(400).json({ok:false,error:"json"});}}
 if(!p||typeof p!=="object"||Array.isArray(p))return res.status(400).json({ok:false,error:"payload"});
 // Honeypot form field is never offered to genuine customers.
 if(clean(p.companyUrl,200))return res.status(200).json({ok:true,reference:"REQUEST_RECEIVED"});
 const kind=clean(p.kind,8),locale=clean(p.locale,3),name=clean(p.name,120),email=clean(p.email,180).toLowerCase(),phone=clean(p.phone,50),city=clean(p.city,120);
 if(!allowed[kind]||!["fr","en","es"].includes(locale)||name.length<2||!emailOk(email)||city.length<2||p.consent!==true)return res.status(400).json({ok:false,error:"required"});
 const data={kind,locale,name,email,phone,city};
 for(const [k,vals] of Object.entries(allowed[kind])){
  const v=clean(p[k],50);
  if(!vals.includes(v))return res.status(400).json({ok:false,error:"invalid_"+k});
  data[k]=v;
 }
 if(kind==="b2c")data.period=clean(p.period,100);
 if(kind==="b2b"){
  data.company=clean(p.company,140);data.country=clean(p.country,100);
  if(data.company.length<2||data.country.length<2)return res.status(400).json({ok:false,error:"company"});
 }
 const reference="KM-"+new Date().toISOString().slice(0,10).replaceAll("-","")+"-"+randomUUID().slice(0,8).toUpperCase();
 const subject="[KŌMØ]["+(kind==="b2c"?"B2C MOTION":"B2B MOTION")+"] "+reference+" — "+name;
 const fields={reference,received_at:new Date().toISOString(),...data};
 const rows=Object.entries(fields).map(([k,v])=>"<tr><th align='left' style='padding:9px;border-bottom:1px solid #dce2da'>"+encode(k)+"</th><td style='padding:9px;border-bottom:1px solid #dce2da'>"+encode(v)+"</td></tr>").join("");
 const html="<div style='font-family:Arial,sans-serif;padding:25px;color:#19291f'><h2>KŌMØ · Motion enquiry</h2><p>Source: website · Type: "+encode(kind)+"</p><table style='border-collapse:collapse'>"+rows+"</table><p>Lead reference: "+encode(reference)+". No health information requested. Follow up via this contact email; import into approved CRM when available.</p></div>";
 const plain=Object.entries(fields).map(([k,v])=>k+": "+v).join("\n");
 try{
  if(process.env.BREVO_API_KEY){
   const response=await fetch("https://api.brevo.com/v3/smtp/email",{method:"POST",headers:{"api-key":process.env.BREVO_API_KEY,"accept":"application/json","content-type":"application/json"},body:JSON.stringify({sender:{name:"KŌMØ Motion",email:FROM},to:[{email:DEST,name:"KŌMØ"}],replyTo:{name,email},subject,htmlContent:html,textContent:plain,tags:["motion",kind,"website"]})});
   if(!response.ok)throw Error("provider_"+response.status);
  }else if(process.env.RESEND_API_KEY){
   const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{authorization:"Bearer "+process.env.RESEND_API_KEY,"content-type":"application/json"},body:JSON.stringify({from:"KŌMØ Motion <"+FROM+">",to:[DEST],reply_to:email,subject,html,text:plain})});
   if(!response.ok)throw Error("provider_"+response.status);
  }else return res.status(503).json({ok:false,error:"email_not_configured"});
  return res.status(200).json({ok:true,reference});
 }catch(err){console.error("[motion-lead] delivery failure",err.message);return res.status(502).json({ok:false,error:"delivery_failed"});}
}