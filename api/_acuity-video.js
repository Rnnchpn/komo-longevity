// Restrict meeting links to trusted video conferencing hosts; never turn Acuity
// free-text appointment locations into arbitrary clickable URLs or inline HTML.
const hosts=['zoom.us','zoom.com','meet.google.com','teams.microsoft.com','teams.live.com','gotomeeting.com','meet.goto.com','global.gotomeeting.com','meet.jit.si'];
export function extractVideoUrl(raw){
 if(typeof raw!=='string'||raw.length>2000)return null;
 const cleaned=raw.replace(/&amp;/gi,'&').replace(/&#38;/gi,'&');
 const candidates=[...cleaned.matchAll(/https:\/\/[^\s"'<>]+/gi)].map(x=>x[0]);
 for(const candidate of candidates){
  try{
   const url=new URL(candidate.replace(/[),;]+$/,''));
   if(url.protocol!=='https:'||url.username||url.password)return null;
   const hostname=url.hostname.toLowerCase();
   if(hosts.some(host=>hostname===host||hostname.endsWith('.'+host))){
    if(url.href.length>1500)return null;
    return url.href;
   }
  }catch{}
 }
 return null;
}
export function safeAcuityDate(raw){
 if(typeof raw!=='string'||raw.length>65)return null;
 if(!/(?:Z|[+-][0-9]{2}:?[0-9]{2})$/i.test(raw))return null;
 return Number.isFinite(Date.parse(raw))?raw:null;
}
