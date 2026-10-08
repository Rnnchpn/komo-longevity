const CONTACT_TO = process.env.KOMO_CONTACT_TO_EMAIL || 'contact@komolongevity.com';
const CONTACT_FROM = process.env.KOMO_CONTACT_FROM_EMAIL || 'contact@komolongevity.com';
const text = (value, max = 180) => String(value ?? '').trim().slice(0, max);
const validEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 180;
const allowedServices = new Set(['complete','motion','phenotype','private','hotel','yacht','partner','other']);
const allowedProfiles = new Set(['individual','professional']);
const escapeHtml = (s) => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');

export default async function handler(req, res) {
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','no-store');
  if (req.method !== 'POST') { res.setHeader('Allow','POST'); return res.status(405).json({ok:false,error:'method'}); }
  const origin = text(req.headers.origin, 250);
  if (origin && !['https://komolongevity.com','https://www.komolongevity.com'].includes(origin) && !/^https:\/\/komo-longevity-[\w-]+\.vercel\.app$/.test(origin)) {
    return res.status(403).json({ok:false,error:'origin'});
  }
  let p = req.body || {};
  if (typeof p === 'string') { try { p=JSON.parse(p); } catch { p={}; } }
  if (!p || typeof p !== 'object' || Array.isArray(p)) return res.status(400).json({ok:false,error:'payload'});
  if (text(p.companyUrl, 200)) return res.status(200).json({ok:true});
  const name = text(p.name,120), email=text(p.email,180).toLowerCase(), phone=text(p.phone,50), city=text(p.city,120);
  const service=text(p.service,30), profile=text(p.profile,30), locale=text(p.locale,5);
  const consent=p.consent === true;
  if (name.length < 2 || !validEmail(email) || !allowedServices.has(service) || !allowedProfiles.has(profile) || !consent || !['fr','en','es'].includes(locale)) {
    return res.status(400).json({ok:false,error:'validation'});
  }
  const data = {name,email,phone,city,service,profile,locale};
  const subject='[KŌMØ] '+(profile==='professional'?'Partner':'Private')+' enquiry · '+service;
  const message=Object.entries(data).map(([k,v])=>k+': '+v).join('\n');
  const html='<div style="font-family:Arial,sans-serif;color:#18221c;padding:28px"><h1>KŌMØ · New enquiry</h1><table style="border-collapse:collapse">'+Object.entries(data).map(([k,v])=>'<tr><th align="left" style="padding:9px;border-bottom:1px solid #ddd">'+escapeHtml(k)+'</th><td style="padding:9px;border-bottom:1px solid #ddd">'+escapeHtml(v)+'</td></tr>').join('')+'</table><p>No clinical details requested or collected by this form.</p></div>';
  try {
    if (process.env.BREVO_API_KEY) {
      const r=await fetch('https://api.brevo.com/v3/smtp/email',{method:'POST',headers:{accept:'application/json','api-key':process.env.BREVO_API_KEY,'content-type':'application/json'},body:JSON.stringify({sender:{name:'KŌMØ Website',email:CONTACT_FROM},to:[{email:CONTACT_TO,name:'KŌMØ'}],replyTo:{email,name},subject,htmlContent:html,textContent:message,tags:['website','longevity-enquiry']})});
      if (!r.ok) throw new Error('provider error '+r.status);
    } else if (process.env.RESEND_API_KEY) {
      const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{authorization:'Bearer '+process.env.RESEND_API_KEY,'content-type':'application/json'},body:JSON.stringify({from:'KŌMØ Website <'+CONTACT_FROM+'>',to:[CONTACT_TO],reply_to:email,subject,html,text:message})});
      if (!r.ok) throw new Error('provider error '+r.status);
    } else return res.status(503).json({ok:false,error:'email_not_configured'});
    return res.status(200).json({ok:true});
  } catch(e) {
    console.error('[KŌMØ enquiry]',e.message);
    return res.status(502).json({ok:false,error:'send_failed'});
  }
}
