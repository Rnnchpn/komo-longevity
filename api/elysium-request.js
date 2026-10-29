const TO = process.env.KOMO_CONTACT_TO_EMAIL || 'contact@komolongevity.com';
const FROM = process.env.KOMO_CONTACT_FROM_EMAIL || 'contact@komolongevity.com';
const allowedServices=[
'KŌMØ Longevity','KŌMØ Aesthetic','KŌMØ IV Drip',
'KŌMØ Cosmetic & Supplements','KŌMØ Life','KŌMØ Gastronomy',
'KŌMØ High Luxury','KŌMØ Service','KŌMØ Team','General concierge'
];
const clean=(v,n)=>String(v??'').trim().slice(0,n);
const escapeHtml=(s)=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function readBody(req){
  if(!req.body)return {};
  if(typeof req.body==='object')return req.body;
  try{return JSON.parse(req.body)}catch{return {}}
}
function safeObject(raw){
  return {
    name:clean(raw.name,140),email:clean(raw.email,180).toLowerCase(),
    role:clean(raw.role,80),location:clean(raw.location,130),
    service:clean(raw.service,190),desiredDate:clean(raw.desiredDate,20),
    message:clean(raw.message,1800),locale:clean(raw.locale,4),
    source:clean(raw.source,50),honeypot:clean(raw.companyUrl,200),
    consent:raw.consent===true
  };
}
function emailData(p){
  const subject='[KŌMØ ELYSIUM] '+p.service+' — '+p.name;
  const rows=[['Name',p.name],['Email',p.email],['Context',p.role],
    ['Location',p.location],['Service',p.service],['Preferred date',p.desiredDate],
    ['Language',p.locale],['Source',p.source],['Request',p.message]].map(([a,b])=>'<tr><td style="padding:11px 14px;color:#ab9877;border-bottom:1px solid #ddd2c0">'+escapeHtml(a)+'</td><td style="padding:11px 14px;color:#1d221c;border-bottom:1px solid #ddd2c0;white-space:pre-wrap">'+escapeHtml(b)+'</td></tr>').join('');
  const html='<div style="max-width:680px;margin:auto;background:#f6f1e8;padding:35px;font:14px Arial"><h1 style="color:#3a3427">KŌMØ ELYSIUM — PRIVATE ENQUIRY</h1><table style="width:100%;border-collapse:collapse">'+rows+'</table><p style="font-size:11px;color:#777">Private request received '+new Date().toISOString()+'</p></div>';
  const text=['KŌMØ ELYSIUM — PRIVATE ENQUIRY',...Object.entries(p).filter(([k])=>k!=='honeypot'&&k!=='consent').map(([k,v])=>k+': '+v)].join('\n');
  return {html,text,subject};
}
async function sendBrevo(p,e){
  const r=await fetch('https://api.brevo.com/v3/smtp/email',{
    method:'POST',headers:{'api-key':process.env.BREVO_API_KEY,accept:'application/json','content-type':'application/json'},
    body:JSON.stringify({sender:{email:FROM,name:'KŌMØ ELYSIUM'},to:[{email:TO,name:'KŌMØ ELYSIUM'}],
    replyTo:{email:p.email,name:p.name},subject:e.subject,htmlContent:e.html,textContent:e.text,tags:['elysium','private-concierge']})
  });
  if(!r.ok)throw new Error('brevo_status_'+r.status);
}
async function sendResend(p,e){
  const r=await fetch('https://api.resend.com/emails',{
    method:'POST',headers:{authorization:'Bearer '+process.env.RESEND_API_KEY,'content-type':'application/json'},
    body:JSON.stringify({from:'KŌMØ ELYSIUM <'+FROM+'>',to:[TO],reply_to:p.email,subject:e.subject,html:e.html,text:e.text})
  });
  if(!r.ok)throw new Error('resend_status_'+r.status);
}
export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store, max-age=0');
  res.setHeader('Content-Type','application/json; charset=utf-8');
  if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({ok:false,error:'method_not_allowed'});}
  const length=Number(req.headers['content-length']||0);
  if(length>11000)return res.status(413).json({ok:false,error:'payload_too_large'});
  const p=safeObject(readBody(req));
  if(p.honeypot)return res.status(200).json({ok:true});
  const domain=p.service.split(' — ')[0];
  if(!p.consent||p.name.length<2||!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email))||
      !allowedServices.includes(domain)||!['fr','en'].includes(p.locale)||p.source!=='/elysium/'){
    return res.status(400).json({ok:false,error:'invalid_payload'});
  }
  if(!process.env.BREVO_API_KEY&&!process.env.RESEND_API_KEY){
    return res.status(503).json({ok:false,error:'mail_not_configured'});
  }
  const e=emailData(p);
  try{
    if(process.env.BREVO_API_KEY)await sendBrevo(p,e);
    else await sendResend(p,e);
    return res.status(200).json({ok:true});
  }catch(err){
    console.error('[elysium-request] provider failure',err.message);
    return res.status(502).json({ok:false,error:'delivery_failed'});
  }
}
