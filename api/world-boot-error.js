export default async function handler(req,res){
  if(req.method!=='POST'){
    res.statusCode=405;
    res.setHeader('content-type','application/json; charset=utf-8');
    res.end(JSON.stringify({ok:false,error:'method_not_allowed'}));
    return;
  }
  const body=typeof req.body==='string'?req.body:JSON.stringify(req.body||{});
  console.error('[KOMO_WORLD_BOOT_ERROR]',body,'ua=',req.headers['user-agent']||'','referer=',req.headers.referer||'');
  res.statusCode=204;
  res.end();
}
