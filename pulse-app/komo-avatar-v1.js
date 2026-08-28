(()=>{
  const SAFE={
    skin:['porcelain','sand','amber','bronze','deep'],hair:['none','buzz','short','wave','long'],hair_color:['dark','brown','blonde','silver'],outfit:['tee','sweat','varsity','motion'],accessory:['none','cap','glasses']
  };
  const C={
    skin:{porcelain:'#f0d4c2',sand:'#d9b191',amber:'#bc8764',bronze:'#8d6047',deep:'#5b392e'},
    hair_color:{dark:'#2d2a27',brown:'#594237',blonde:'#bfa676',silver:'#9da19d'},
    outfit:{tee:'#e9e2d6',sweat:'#7f9382',varsity:'#294234',motion:'#d8e2d7'}
  };
  const norm=(cfg={})=>({
    mode:['avatar','photo','initials'].includes(cfg.mode)?cfg.mode:'avatar',
    skin:SAFE.skin.includes(cfg.skin)?cfg.skin:'sand',
    hair:SAFE.hair.includes(cfg.hair)?cfg.hair:'short',
    hair_color:SAFE.hair_color.includes(cfg.hair_color)?cfg.hair_color:'dark',
    outfit:SAFE.outfit.includes(cfg.outfit)?cfg.outfit:'tee',
    accessory:SAFE.accessory.includes(cfg.accessory)?cfg.accessory:'none'
  });
  function hair(c,h){
    if(c.hair==='none')return'';
    if(c.hair==='buzz')return`<path d="M35 38c2-13 12-21 25-21s23 8 25 21c-8-7-16-10-25-10s-17 3-25 10Z" fill="${h}"/>`;
    if(c.hair==='wave')return`<path d="M32 42c0-17 11-28 28-28 18 0 29 12 28 30-6-8-12-11-18-12-8-1-11 5-18 4-7-1-11-4-20 6Z" fill="${h}"/><path d="M34 38c-3 8-2 21 2 28l7-3c-3-10-3-18 0-25Z" fill="${h}"/>`;
    if(c.hair==='long')return`<path d="M31 43c0-18 11-30 29-30 19 0 30 13 29 32l-2 31-12-3 2-31c-7-8-13-11-21-10-7 1-12 5-17 12l3 31-12 2Z" fill="${h}"/>`;
    return`<path d="M33 40c2-17 12-27 28-27 15 0 25 9 27 25-6-4-11-6-17-6-9 0-13 4-20 3-6 0-11 1-18 5Z" fill="${h}"/>`;
  }
  function accessory(c){
    if(c.accessory==='cap')return'<path d="M31 31c4-12 15-18 29-18 15 0 25 6 29 18H31Z" fill="#21362a"/><path d="M57 29h37c-3 6-13 8-25 7Z" fill="#21362a"/>';
    if(c.accessory==='glasses')return'<g fill="none" stroke="#25352d" stroke-width="2.2"><rect x="40" y="43" width="16" height="10" rx="4"/><rect x="64" y="43" width="16" height="10" rx="4"/><path d="M56 47h8"/></g>';
    return'';
  }
  function outfit(c,o){
    if(c.outfit==='varsity')return`<path d="M27 112c2-28 13-42 33-42 21 0 32 14 34 42Z" fill="${o}"/><path d="M41 73h38l-8 17H49Z" fill="#f1e8d9"/><text x="60" y="102" text-anchor="middle" font-family="Arial,sans-serif" font-size="16" font-weight="700" fill="#f4efe5">K</text>`;
    if(c.outfit==='motion')return`<path d="M27 112c2-28 13-42 33-42 21 0 32 14 34 42Z" fill="${o}"/><path d="M45 75h30v6H45Z" fill="#294234"/><circle cx="60" cy="96" r="10" fill="none" stroke="#294234" stroke-width="2"/>`;
    if(c.outfit==='sweat')return`<path d="M27 112c2-28 13-42 33-42 21 0 32 14 34 42Z" fill="${o}"/><path d="M44 76c4 9 8 13 16 13s12-4 16-13" fill="none" stroke="#f5f0e7" stroke-width="3"/>`;
    return`<path d="M28 112c2-27 13-41 32-41 20 0 31 14 33 41Z" fill="${o}"/><path d="M48 73c2 8 6 12 12 12s10-4 12-12" fill="#fbfaf6"/>`;
  }
  function render(config={},opts={}){
    const c=norm(config),skin=C.skin[c.skin],h=C.hair_color[c.hair_color],o=C.outfit[c.outfit],label=opts.label||'Avatar KŌMØ';
    return`<svg class="komo-avatar-svg" viewBox="0 0 120 120" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" rx="28" fill="#f2ede3"/><circle cx="60" cy="48" r="24" fill="${skin}"/>${hair(c,h)}<circle cx="51" cy="49" r="1.7" fill="#28362f"/><circle cx="69" cy="49" r="1.7" fill="#28362f"/><path d="M54 60c4 3 8 3 12 0" fill="none" stroke="#6d4d40" stroke-width="1.6" stroke-linecap="round"/>${outfit(c,o)}${accessory(c)}<path d="M18 111h84" stroke="rgba(40,54,47,.08)"/></svg>`;
  }
  window.KomoAvatar={render,normalize:norm,options:SAFE,version:'1.0.0'};
})();