(()=>{
  const H=document.getElementById('case-atelier'); if(!H)return;
  const T=(fr,en)=>document.documentElement.lang==='fr'?fr:en;
  const E=n=>new Intl.NumberFormat(document.documentElement.lang==='fr'?'fr-FR':'en-GB',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n);
  const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const RETAIL={
    clinical:[
      {name:'RIMOWA Classic Cabin',maker:'RIMOWA',price:'1 280 €',dims:'55 × 40 × 23 cm',url:'https://www.rimowa.com/fr/fr/luggage/colour/titanium/cabin/97353044.html',noteFr:'Coque aluminium compacte pour cabinet et démonstration clinique.',noteEn:'Compact aluminium shell for practice and clinical demonstrations.'},
      {name:'RIMOWA Original Cabin Plus',maker:'RIMOWA',price:'1 300 €',dims:'57 × 44 × 25 cm',url:'https://www.rimowa.com/fr/fr/luggage/colour/titanium/cabin-plus/92656044.html',noteFr:'Un peu plus de volume pour l’insert, les docks et les accessoires.',noteEn:'A little more volume for the insert, docks and accessories.'}
    ],
    travel:[
      {name:'RIMOWA Essential Check-In M',maker:'RIMOWA',price:'880 €',dims:'67 × 43 × 24 cm',url:'https://www.rimowa.com/fr/fr/luggage/colour/black/check-in-m/83263631.html',noteFr:'Polycarbonate léger, adapté au transport fréquent.',noteEn:'Lightweight polycarbonate, suited to frequent travel.'},
      {name:'RIMOWA Original Cabin Plus',maker:'RIMOWA',price:'1 300 €',dims:'57 × 44 × 25 cm',url:'https://www.rimowa.com/fr/fr/luggage/colour/titanium/cabin-plus/92656044.html',noteFr:'Version aluminium plus statutaire pour les déplacements premium.',noteEn:'More premium aluminium option for travel.'}
    ],
    hotel:[
      {name:'RIMOWA Original Trunk',maker:'RIMOWA',price:'1 850 €',dims:'73 × 44 × 36,5 cm',url:'https://www.rimowa.com/be/fr/luggage/colour/silver/trunk/92575004.html',noteFr:'Grand volume, intéressant pour un déploiement hôtel / spa.',noteEn:'Large volume, well suited to hotel / spa deployment.'},
      {name:'Globe-Trotter Centenary Medium Check-In',maker:'Globe-Trotter',price:'£2,195',dims:'71 × 44 × 24 cm',url:'https://www.globe-trotter.com/products/centenary-2-wheels-medium-check-in-olive-black-gold',noteFr:'Expression plus lifestyle et hospitality.',noteEn:'A more lifestyle-led hospitality expression.'}
    ],
    yacht:[
      {name:'Globe-Trotter Centenary Large Check-In',maker:'Globe-Trotter',price:'£2,495',dims:'82 × 48 × 25 cm',url:'https://www.globe-trotter.com/products/centenary-2-wheels-large-check-in-olive-black-gold',noteFr:'Base mobile premium pour usage privé / yacht.',noteEn:'Premium mobile base for private / yacht use.'},
      {name:'RIMOWA Classic Trunk',maker:'RIMOWA',price:'1 900 €',dims:'75 × 47 × 36 cm',url:'https://www.rimowa.com/be/fr/luggage/colour/black/trunk/97375014.html',noteFr:'Volume généreux et présence très statutaire.',noteEn:'Generous volume with a strong premium presence.'}
    ]
  };

  const USES={
    clinical:{name:'Clinical',fr:'Cabinet & clinique',en:'Practice & clinic',base:16500},
    travel:{name:'Travel',fr:'Mobile',en:'Mobile',base:15000},
    hotel:{name:'Hotel & Wellness',fr:'Hôtel · spa · club',en:'Hotel · spa · club',base:17500},
    yacht:{name:'Yacht',fr:'Marine & privé',en:'Marine & private',base:18500}
  };

  const WOOD={
    walnut:{fr:'Noyer verni',en:'Gloss walnut',sw:'#6b4631',tint:'transparent',opacity:0,delta:0},
    oak:{fr:'Chêne ciré',en:'Waxed oak',sw:'#c9a879',tint:'#d2b486',opacity:.32,delta:900},
    teak:{fr:'Teck miel',en:'Honey teak',sw:'#a7612d',tint:'#c97931',opacity:.22,delta:1200},
    navy:{fr:'Laque marine',en:'Marine lacquer',sw:'#24384c',tint:'#17334f',opacity:.48,delta:1600}
  };

  const STRAPS={
    graphite:{fr:'Graphite',en:'Graphite',sw:'#303432',delta:0},
    sage:{fr:'Sauge',en:'Sage',sw:'#788676',delta:180},
    ivory:{fr:'Ivoire',en:'Ivory',sw:'#d8d0be',delta:220},
    navy:{fr:'Marine',en:'Navy',sw:'#223947',delta:220}
  };

  const A={family:'bespoke',use:'hotel',wood:'walnut',strap:'graphite',retailIndex:0,engraving:''};
  const R={case:'',sensor:''};
  const selectedRetail=()=>RETAIL[A.use][A.retailIndex]||RETAIL[A.use][0];
  const total=()=>USES[A.use].base + WOOD[A.wood].delta + STRAPS[A.strap].delta;

  function specLine(){return `6 ${T('capteurs réels','real sensors')} · 6 straps · 2 iPads · 1 ${T('trépied','tripod')} · 6 ${T('docks de charge','charging docks')}`}
  function summary(){
    const u=USES[A.use], w=WOOD[A.wood], s=STRAPS[A.strap], r=selectedRetail();
    return `KŌMØ Case Atelier V4 — ${u.name}\n${T('Famille','Family')}: ${A.family==='bespoke'?T('Wood Edition sur mesure','Bespoke Wood Edition'):T('Coque achetable','Retail shell')}\n${A.family==='bespoke'?`${T('Finition','Finish')}: ${T(w.fr,w.en)}`:`${T('Référence','Reference')}: ${r.name} · ${r.price}`}\nMicro-straps KŌMØ: ${T(s.fr,s.en)}\n${specLine()}\n${T('Gravure','Engraving')}: ${A.engraving||'—'}\n${T('Budget indicatif KŌMØ','Indicative KŌMØ budget')}: ${E(total())} ${T('HT','excl. VAT')}`;
  }
  function mail(){const a=H.querySelector('[data-mail]'); if(a)a.href='mailto:contact@komolongevity.com?subject='+encodeURIComponent('KŌMØ Life — Case Atelier V4 — '+USES[A.use].name)+'&body='+encodeURIComponent(summary())}

  function loadAsset(path,key){if(R[key])return;fetch(path).then(r=>r.text()).then(x=>{R[key]='data:image/webp;base64,'+x.trim();fillAssets()}).catch(()=>{})}
  function fillAssets(){H.querySelectorAll('[data-case-photo]').forEach(x=>R.case&&(x.src=R.case));H.querySelectorAll('[data-sensor-photo]').forEach(x=>R.sensor&&(x.src=R.sensor))}

  function photo(){
    const w=WOOD[A.wood];
    const woods={walnut:['#3d2418','#8b5a37'],oak:['#cbb38c','#e8d8bb'],teak:['#7d3f18','#c77b38'],navy:['#152b3d','#294c68']};
    const wc=woods[A.wood];
    return `<div class="v4-photo-frame" style="--woodA:${wc[0]};--woodB:${wc[1]}">
      <div class="v4-material-label"><span>${T('Finition extérieure','Exterior finish')}</span><b>${T(w.fr,w.en)}</b></div>
      <div class="v4-photo"><img data-case-photo alt="KŌMØ Case real product architecture"></div>
      <div class="v4-badge"><b>06</b><span>${T('capteurs réels','real sensors')}</span></div>
      <small>${T('Architecture intérieure réelle KŌMØ. La Wood Edition concerne la coque extérieure sur mesure.','Real KŌMØ interior architecture. The Wood Edition applies to the bespoke outer shell.')}</small>
    </div>`;
  }

  function retailCards(){return RETAIL[A.use].map((x,i)=>`<label class="retail-card"><input type="radio" name="retail" value="${i}" ${i===A.retailIndex?'checked':''}><span><em>${x.maker}</em><b>${x.name}</b><small>${x.dims} · ${x.price}</small><p>${T(x.noteFr,x.noteEn)}</p><a href="${x.url}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">${T('Voir chez le fabricant ↗','View manufacturer ↗')}</a></span></label>`).join('')}

  function render(){
    if(A.retailIndex>=RETAIL[A.use].length)A.retailIndex=0;
    const u=USES[A.use], r=selectedRetail();
    H.innerHTML=`
      <div class="v4-head">
        <p class="eyebrow">KŌMØ LIFE · CASE ATELIER V4</p>
        <h2>${T('Des coques réelles. Des éditions bois sur mesure.','Real shells. Bespoke wood editions.')}</h2>
        <p>${T('Deux offres clairement séparées : des valises réellement commercialisées à sourcer chez le fabricant, et des Wood Editions KŌMØ fabriquées sur mesure pour les hôtels, spas, yachts et lieux privés.','Two clearly separated offers: genuine retail cases sourced from the manufacturer, and bespoke KŌMØ Wood Editions for hotels, spas, yachts and private settings.')}</p>
        <div class="family-tabs"><button type="button" data-family="bespoke" class="${A.family==='bespoke'?'on':''}">${T('Wood Editions sur mesure','Bespoke Wood Editions')}</button><button type="button" data-family="retail" class="${A.family==='retail'?'on':''}">${T('Coques achetables','Retail shells')}</button></div>
      </div>
      <div class="v4-layout">
        <div class="v4-visual">
          ${A.family==='bespoke'?photo():`<div class="retail-hero"><p>${r.maker}</p><h3>${r.name}</h3><div><span>${r.dims}</span><strong>${r.price}</strong></div><p>${T(r.noteFr,r.noteEn)}</p><a href="${r.url}" target="_blank" rel="noopener noreferrer">${T('Ouvrir la fiche fabricant ↗','Open manufacturer product ↗')}</a><small>${T('Cette carte utilise la référence commerciale exacte ; aucun rendu KŌMØ ne prétend être une photographie fabricant.','This card uses the exact commercial reference; no KŌMØ rendering is presented as manufacturer photography.')}</small></div>`}
          <div class="spec-strip"><span><b>06</b>${T('capteurs','sensors')}</span><span><b>06</b>straps</span><span><b>02</b>iPads</span><span><b>01</b>${T('trépied','tripod')}</span><span><b>06</b>${T('docks','docks')}</span></div>
          <div class="sensor-proof"><img data-sensor-photo alt="Real Myodev sensor reference"><div><span>${T('Référence capteur réel','Real sensor reference')}</span><b>${T('Plaque latérale + module central','Side plate + central module')}</b><p>${T('Le standard d’intégration V4 reprend cette géométrie : 6 capteurs identiques dans chaque Case.','V4 integration standard uses this geometry: 6 identical sensors in every Case.')}</p></div></div>
        </div>
        <form class="v4-controls" onsubmit="return false">
          <fieldset><legend>01 — ${T('Usage','Setting')}</legend><div class="use-grid">${Object.keys(USES).map(k=>{const x=USES[k];return `<label><input type="radio" name="use" value="${k}" ${k===A.use?'checked':''}><span><b>${x.name}</b><small>${T(x.fr,x.en)}</small></span></label>`}).join('')}</div></fieldset>
          ${A.family==='bespoke'?`<fieldset><legend>02 — ${T('Finition bois','Wood finish')}</legend><div class="finish-grid">${Object.keys(WOOD).map(k=>{const x=WOOD[k];return `<label><input type="radio" name="wood" value="${k}" ${k===A.wood?'checked':''}><i style="--sw:${x.sw}"></i><span>${T(x.fr,x.en)}<small>${x.delta?`+ ${E(x.delta)}`:T('Inclus','Included')}</small></span></label>`}).join('')}</div><p class="micro-note">${T('Échantillon de matière autour de l’architecture intérieure réelle : la finition bois concerne la coque extérieure fabriquée sur mesure.','Material sample shown around the real interior architecture; the wood finish applies to the bespoke outer shell.')}</p></fieldset>`:`<fieldset><legend>02 — ${T('Référence achetable','Retail reference')}</legend><div class="retail-list">${retailCards()}</div></fieldset>`}
          <fieldset><legend>03 — KŌMØ MICRO-STRAPS</legend><div class="strap-grid">${Object.keys(STRAPS).map(k=>{const x=STRAPS[k];return `<label><input type="radio" name="strap" value="${k}" ${k===A.strap?'checked':''}><span style="--strap:${x.sw}"><b>KŌMØ</b><small>${T(x.fr,x.en)}${x.delta?` · +${E(x.delta)}`:''}</small></span></label>`}).join('')}</div></fieldset>
          <fieldset><legend>04 — ${T('Architecture fixe','Fixed architecture')}</legend><div class="arch-card"><b>6 × ${T('capteurs','sensors')}</b><span>6 × KŌMØ straps</span><span>2 × iPads</span><span>1 × ${T('trépied','tripod')}</span><span>6 × ${T('docks de charge','charging docks')}</span><small>${T('Aucun rendu ou devis ne doit être validé s’il ne respecte pas ce contenu.', 'No rendering or quotation should be validated unless it respects this content.')}</small></div></fieldset>
          <label class="engrave">05 — ${T('Signature / établissement','Signature / venue')}<input name="engraving" maxlength="32" value="${esc(A.engraving)}" placeholder="${T('Cabinet, hôtel, yacht ou initiales','Practice, hotel, yacht or initials')}"></label>
          <div class="quote-box"><span>${T('Projet KŌMØ indicatif','Indicative KŌMØ project')}</span><strong>${E(total())} ${T('HT','excl. VAT')}</strong><small>${A.family==='retail'?T('Hors achat de la coque fabricant affichée ci-dessus.','Manufacturer shell purchase excluded.') : T('Wood Edition sur mesure ; prix final après étude, matériaux et fabrication.','Bespoke Wood Edition; final price after engineering, materials and fabrication.')}</small><pre data-summary>${summary()}</pre><a data-mail>${T('Demander l’étude & le devis','Request engineering & quotation')}</a></div>
          <p class="legal-note">${T('RIMOWA et Globe-Trotter sont cités uniquement comme références de coques réellement commercialisées. Aucun partenariat n’est sous-entendu. Toute modification de coque doit être validée avant production.','RIMOWA and Globe-Trotter are cited only as genuine retail shell references. No partnership is implied. Any shell modification requires validation before production.')}</p>
        </form>
      </div>`;
    mail(); fillAssets(); loadAsset('assets/case-real.webp.b64','case'); loadAsset('assets/sensors-real.webp.b64','sensor');
  }

  H.addEventListener('click',e=>{const b=e.target.closest('[data-family]');if(b){A.family=b.dataset.family;render();}});
  H.addEventListener('change',e=>{const n=e.target.name,v=e.target.value;if(n==='use'){A.use=v;A.retailIndex=0}else if(n==='wood')A.wood=v;else if(n==='strap')A.strap=v;else if(n==='retail')A.retailIndex=Number(v);render();});
  H.addEventListener('input',e=>{if(e.target.name==='engraving'){A.engraving=e.target.value;const p=H.querySelector('[data-summary]');if(p)p.textContent=summary();mail();}});
  new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  render();
})();