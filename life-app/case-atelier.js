(() => {
  const host = document.getElementById('case-atelier');
  if (!host) return;

  const t = (fr, en) => document.documentElement.lang === 'fr' ? fr : en;
  const esc = value => String(value || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money = value => new Intl.NumberFormat(document.documentElement.lang === 'fr' ? 'fr-FR' : 'en-GB', {style:'currency', currency:'EUR', maximumFractionDigits:0}).format(value);

  const finishes = {
    walnut:{fr:'Noyer verni',en:'Gloss walnut',color:'#6b4631',delta:2400},
    oak:{fr:'Chêne ciré',en:'Waxed oak',color:'#b99a73',delta:1900},
    ivory:{fr:'Laque ivoire',en:'Ivory lacquer',color:'#ddd9ce',delta:1600},
    aluminium:{fr:'Aluminium satiné',en:'Satin aluminium',color:'#a8adb0',delta:0},
    graphite:{fr:'Graphite mat',en:'Matte graphite',color:'#36383a',delta:0},
    leather:{fr:'Cuir sellier',en:'Saddle leather',color:'#735340',delta:2200},
    navy:{fr:'Fibre & cuir marine',en:'Navy fibre & leather',color:'#1f2d3a',delta:1800}
  };

  const platforms = {
    pinel:{name:'Pinel & Pinel — Bespoke Case',maker:'Pinel & Pinel · Paris',priceFr:'Sur devis fabricant',priceEn:'Manufacturer quote',dimsFr:'Dimensions sur mesure',dimsEn:'Bespoke dimensions',url:'https://www.pineletpinel.com/fr/contenu/35-mallettes-et-coffrets-sur-mesure',fin:['walnut','oak','ivory','leather'],quote:true,fr:'Malletier parisien spécialisé dans les malles et coffrets sur mesure, avec structures bois, gainage cuir et aménagements dédiés.',en:'Paris trunkmaker specialising in bespoke trunks and cases, including wood structures, leather covering and dedicated interiors.'},
    globeLarge:{name:'Globe-Trotter Custom Large Check-In',maker:'Globe-Trotter · England',priceFr:'£2,895 prix public',priceEn:'£2,895 public price',dimsFr:'82 × 48 × 25 cm',dimsEn:'82 × 48 × 25 cm',url:'https://www.globe-trotter.com/products/custom-2-wheels-large-check-in',fin:['leather','navy'],quote:true,fr:'Plateforme check-in personnalisable en fibre vulcanisée et cuir tanné végétal. Référence intéressante pour une édition Yacht ou Hospitality.',en:'Customisable check-in platform in vulcanised fibreboard and vegetable-tanned leather. A strong reference for Yacht or Hospitality editions.'},
    rimowaClassic:{name:'RIMOWA Classic Check-In M',maker:'RIMOWA · Germany',priceFr:'1 450 € prix public',priceEn:'€1,450 public price',dimsFr:'71 × 47,5 × 26 cm',dimsEn:'71 × 47.5 × 26 cm',url:'https://www.rimowa.com/fr/fr/luggage/colour/silver/check-in-m/97363004.html',fin:['aluminium','graphite'],quote:false,fr:'Aluminium anodisé, poignées cuir et format suffisamment généreux pour étudier un plateau clinique complet.',en:'Anodised aluminium, leather handles and enough volume to engineer a complete clinical insert.'},
    rimowaOriginal:{name:'RIMOWA Original Check-In M',maker:'RIMOWA · Germany',priceFr:'1 400 € prix public',priceEn:'€1,400 public price',dimsFr:'69 × 44 × 27,5 cm',dimsEn:'69 × 44 × 27.5 cm',url:'https://www.rimowa.com/fr/fr/luggage/colour/silver/check-in-m/92563004.html',fin:['aluminium','graphite'],quote:false,fr:'Coque aluminium à roulettes, robuste et mobile, adaptée à une étude d’intégration cabinet / visites.',en:'Wheeled aluminium shell, robust and mobile, suited to a practice / house-call integration study.'},
    rimowaCabin:{name:'RIMOWA Original Cabin Plus',maker:'RIMOWA · Germany',priceFr:'1 300 € prix public',priceEn:'€1,300 public price',dimsFr:'57 × 44 × 25 cm',dimsEn:'57 × 44 × 25 cm',url:'https://www.rimowa.com/fr/fr/luggage/colour/black/cabin-plus/92656014.html',fin:['aluminium','graphite'],quote:false,fr:'Le compromis le plus compact de la sélection pour conserver les 6 capteurs, 2 iPads et le trépied dans une architecture voyage.',en:'The most compact reference in the selection for keeping 6 sensors, 2 iPads and the tripod in a travel architecture.'},
    rimowaEssential:{name:'RIMOWA Essential Check-In M',maker:'RIMOWA · Germany',priceFr:'880 € prix public',priceEn:'€880 public price',dimsFr:'67 × 43 × 24 cm',dimsEn:'67 × 43 × 24 cm',url:'https://www.rimowa.com/fr/fr/luggage/colour/black/check-in-m/83263631.html',fin:['graphite','ivory'],quote:false,fr:'Polycarbonate léger, option intéressante pour réduire le poids total du KŌMØ Case.',en:'Lightweight polycarbonate, an interesting option to reduce total KŌMØ Case weight.'},
    globeMedium:{name:'Globe-Trotter Custom Medium Check-In',maker:'Globe-Trotter · England',priceFr:'£2,595 prix public',priceEn:'£2,595 public price',dimsFr:'42 × 68 × 26 cm',dimsEn:'42 × 68 × 26 cm',url:'https://www.globe-trotter.com/products/custom-4-wheels-medium-check-in',fin:['leather','navy'],quote:true,fr:'Format moyen personnalisable, plus lifestyle, destiné aux éditions premium Travel / Hospitality.',en:'Customisable medium format with a more lifestyle expression for premium Travel / Hospitality editions.'}
  };

  const models = [
    {id:'yacht',name:'Yacht',base:18500,target:'58 × 38 × 18 cm',platforms:['pinel','globeLarge'],fr:'Un coffret bas, pensé comme un objet de bord : matériaux nobles, maintien sécurisé et intégration électrique discrète.',en:'A low chest conceived as an onboard object: noble materials, secured retention and discreet power integration.'},
    {id:'clinical',name:'Clinical',base:16500,target:'48 × 38 × 22 cm',platforms:['rimowaClassic','rimowaOriginal'],fr:'Une mallette premium pour cabinet, clinique ou visites, avec surfaces intérieures nettoyables et module technique démontable.',en:'A premium case for practices, clinics or house calls, with cleanable interior surfaces and a removable technical module.'},
    {id:'travel',name:'Travel',base:15000,target:'45 × 36 × 25 cm',platforms:['rimowaCabin','rimowaEssential','globeMedium'],fr:'Le format le plus mobile, conçu pour voyager avec l’ensemble KŌMØ sans multiplier les sacs.',en:'The most mobile format, designed to travel with the complete KŌMØ set without multiplying bags.'}
  ];

  const charging = {
    integrated:{fr:'Integrated',en:'Integrated',delta:0,frText:'6 docks capteurs d’origine + 2 USB-C PD, alimentation GaN et câblage dissimulé.',enText:'6 original sensor docks + 2 USB-C PD, GaN power supply and concealed wiring.'},
    clinical:{fr:'Clinical Dock',en:'Clinical Dock',delta:650,frText:'Cassette technique extractible, entrée secteur unique et surfaces internes simplifiées pour le nettoyage.',enText:'Removable service cassette, single mains inlet and simplified internal surfaces for cleaning.'},
    marine:{fr:'Marine Dock',en:'Marine Dock',delta:1200,frText:'Pré-équipement 12/24 V vers USB-C PD, maintien renforcé et module technique protégé. Validation navale requise.',enText:'12/24 V to USB-C PD pre-engineering, reinforced retention and protected service module. Marine validation required.'}
  };

  const state = {model:'yacht',platform:'pinel',finish:'walnut',interior:'pearl',charging:'integrated',engraving:''};
  const model = () => models.find(x => x.id === state.model);
  const platform = () => platforms[state.platform];

  function normalise(){
    const m = model();
    if (!m.platforms.includes(state.platform)) state.platform = m.platforms[0];
    const p = platform();
    if (!p.fin.includes(state.finish)) state.finish = p.fin[0];
    if (state.model !== 'yacht' && state.charging === 'marine') state.charging = state.model === 'clinical' ? 'clinical' : 'integrated';
  }

  function estimate(){
    const p = platform();
    if (p.quote) return null;
    return model().base + finishes[state.finish].delta + charging[state.charging].delta;
  }

  function summary(){
    const m = model(), p = platform(), total = estimate();
    return `KŌMØ Case Atelier — ${m.name}\n${t('Plateforme','Platform')}: ${p.name}\n${t('Finition','Finish')}: ${t(finishes[state.finish].fr,finishes[state.finish].en)}\n${t('Intérieur','Interior')}: ${state.interior === 'pearl' ? t('Perle','Pearl') : t('Graphite','Graphite')}\n${t('Recharge','Charging')}: ${t(charging[state.charging].fr,charging[state.charging].en)}\n${t('Gravure','Engraving')}: ${state.engraving || '—'}\n6 ${t('capteurs','sensors')} · 2 iPads · 1 ${t('trépied','tripod')}\n${t('Budget indicatif KŌMØ','Indicative KŌMØ budget')}: ${total ? money(total) + ' HT' : t('sur devis après étude de la plateforme','quotation after platform engineering')}\n${t('Dimensions, intégration électrique et compatibilité fabricant à valider avant production.','Dimensions, electrical integration and manufacturer compatibility must be validated before production.')}`;
  }

  function updateSummary(){
    const total = estimate();
    host.querySelector('[data-live-price]').textContent = total ? money(total) + ' ' + t('HT','excl. VAT') : t('Sur devis','On request');
    host.querySelector('[data-summary]').textContent = summary();
    host.querySelector('[data-enquire]').href = 'mailto:contact@komolongevity.com?subject=' + encodeURIComponent('KŌMØ Life — Case Atelier ' + state.model) + '&body=' + encodeURIComponent(summary() + '\n\n' + t('Établissement / yacht :\nVille :\nTéléphone :','Practice / yacht:\nCity:\nPhone:'));
  }

  function render(){
    normalise();
    const m = model(), p = platform(), idx = models.indexOf(m);
    const chargingKeys = state.model === 'yacht' ? ['integrated','marine'] : state.model === 'clinical' ? ['integrated','clinical'] : ['integrated'];
    host.innerHTML = `<div class="atelier-heading"><p class="eyebrow">KŌMØ LIFE · CASE ATELIER</p><h2>${t('Configurez la Case comme un objet de collection.','Configure the Case like a collectible object.')}</h2><p>${t('Trois formats, des plateformes réelles à étudier et un aménagement KŌMØ constant : 6 capteurs, 2 iPads, 1 trépied, rangés et rechargeables dans un seul objet.','Three formats, real-world case platforms to engineer and one constant KŌMØ layout: 6 sensors, 2 iPads and 1 tripod, stored and rechargeable in one object.')}</p></div><div class="atelier-grid"><div class="atelier-visual"><div class="atelier-crop"><img src="assets/case-atelier-concepts.webp" width="2048" height="683" alt="${t('Rendu de concept du format','Concept rendering of the')} ${m.name}" style="transform:translateX(-${idx*100/3}%)" /></div><div class="atelier-caption"><span>CASE ${m.name.toUpperCase()}</span><span>${t('Rendu KŌMØ · configuration illustrative','KŌMØ rendering · illustrative configuration')}</span></div><div class="atelier-pricebar"><div><span>${t('Budget de travail','Working budget')}</span><strong data-live-price></strong></div><small>${t('Prix indicatif de développement, hors validation finale fabricant.','Indicative development price, before final manufacturer validation.')}</small></div><p class="atelier-description">${t(m.fr,m.en)}</p><div class="atelier-included"><span><b>06</b>${t('capteurs','sensors')}</span><span><b>02</b>iPads</span><span><b>01</b>${t('trépied','tripod')}</span></div><div class="atelier-engineering"><span>${t('Volume cible KŌMØ','KŌMØ target envelope')}</span><b>${m.target}</b><small>${t('Le volume final dépend de la coque sélectionnée et du scan CAD des composants.','Final envelope depends on the selected shell and CAD scan of all components.')}</small></div></div><form class="atelier-controls" onsubmit="return false"><fieldset><legend>01 — ${t('Format','Format')}</legend><div class="atelier-models">${models.map(x => `<label class="atelier-choice"><input type="radio" name="case-model" value="${x.id}" ${x.id === m.id ? 'checked' : ''}><span><b>${x.name}</b><small>${x.id === 'travel' ? t('Mobile','Mobile') : x.id === 'clinical' ? t('Cabinet','Practice') : t('Yacht / Hospitality','Yacht / Hospitality')}</small></span></label>`).join('')}</div></fieldset><fieldset><legend>02 — ${t('Plateforme réelle à étudier','Real-world platform to engineer')}</legend><div class="atelier-platforms">${m.platforms.map(key => {const x = platforms[key]; return `<label class="atelier-platform"><input type="radio" name="case-platform" value="${key}" ${key === state.platform ? 'checked' : ''}><span><em>${x.maker}</em><b>${x.name}</b><small>${t(x.dimsFr,x.dimsEn)} · ${t(x.priceFr,x.priceEn)}</small></span></label>`;}).join('')}</div><div class="atelier-platform-detail"><p>${t(p.fr,p.en)}</p><a href="${p.url}" target="_blank" rel="noopener noreferrer">${t('Voir la référence fabricant ↗','View manufacturer reference ↗')}</a></div></fieldset><fieldset><legend>03 — ${t('Matière & finition','Material & finish')}</legend><div class="atelier-finishes">${p.fin.map(key => {const f = finishes[key]; return `<label class="atelier-finish"><input type="radio" name="case-finish" value="${key}" ${key === state.finish ? 'checked' : ''}><span class="atelier-swatch" style="background:${f.color}"></span><span>${t(f.fr,f.en)}${f.delta ? `<small>+ ${money(f.delta)}</small>` : '<small>Included</small>'}</span></label>`;}).join('')}</div></fieldset><fieldset><legend>04 — ${t('Intérieur','Interior')}</legend><div class="atelier-models">${['pearl','graphite'].map(x => `<label class="atelier-choice"><input type="radio" name="case-interior" value="${x}" ${x === state.interior ? 'checked' : ''}><span><b>${x === 'pearl' ? t('Perle','Pearl') : 'Graphite'}</b><small>${t('Insert technique sur mesure','Bespoke technical insert')}</small></span></label>`).join('')}</div></fieldset><fieldset><legend>05 — ${t('Architecture de recharge','Charging architecture')}</legend><div class="atelier-platforms">${chargingKeys.map(key => {const c=charging[key];return `<label class="atelier-platform"><input type="radio" name="case-charging" value="${key}" ${key === state.charging ? 'checked' : ''}><span><em>${key === 'integrated' ? t('Standard','Standard') : t('Option','Option')}</em><b>${t(c.fr,c.en)}</b><small>${t(c.frText,c.enText)}${c.delta ? ` · + ${money(c.delta)}` : ''}</small></span></label>`;}).join('')}</div></fieldset><label class="atelier-engraving">06 — ${t('Votre signature','Your signature')}<input name="case-engraving" maxlength="32" value="${esc(state.engraving)}" placeholder="${t('Nom du yacht, cabinet ou initiales','Yacht name, practice or initials')}"></label><div class="atelier-summary"><p>${t('Votre configuration','Your configuration')}</p><pre data-summary aria-live="polite"></pre><a class="atelier-cta" data-enquire>${t('Demander l’étude & le devis','Request engineering & quotation')}</a><button type="button" class="atelier-copy">${t('Copier la configuration','Copy configuration')}</button><span data-copy-status role="status"></span><p class="atelier-small">${t('Les plateformes citées sont des références de conception indépendantes. KŌMØ n’indique aucune affiliation avec les fabricants. Toute modification de coque, intégration électrique, étanchéité, désinfection ou usage en navigation doit être validé avant production. Prix fabricants relevés en septembre 2026 et susceptibles d’évoluer.','Named platforms are independent design references. KŌMØ does not imply affiliation with their manufacturers. Any shell modification, electrical integration, waterproofing, disinfection or use underway must be validated before production. Manufacturer prices observed in September 2026 and subject to change.')}</p></div></form></div>`;
    updateSummary();
  }

  host.addEventListener('change', e => {
    const n = e.target.name;
    if (n === 'case-model') {
      state.model = e.target.value;
      state.platform = model().platforms[0];
      state.finish = platforms[state.platform].fin[0];
      state.charging = state.model === 'clinical' ? 'clinical' : 'integrated';
      render();
      host.querySelector(`input[name="case-model"][value="${state.model}"]`)?.focus();
    } else if (n === 'case-platform') {
      state.platform = e.target.value;
      state.finish = platform().fin[0];
      render();
      host.querySelector(`input[name="case-platform"][value="${state.platform}"]`)?.focus();
    } else if (n === 'case-finish') {
      state.finish = e.target.value;
      updateSummary();
    } else if (n === 'case-interior') {
      state.interior = e.target.value;
      updateSummary();
    } else if (n === 'case-charging') {
      state.charging = e.target.value;
      updateSummary();
    }
  });

  host.addEventListener('input', e => {
    if (e.target.name === 'case-engraving') {
      state.engraving = e.target.value;
      updateSummary();
    }
  });

  host.addEventListener('click', async e => {
    if (e.target.closest('.atelier-copy')) {
      try {
        await navigator.clipboard.writeText(summary());
        host.querySelector('[data-copy-status]').textContent = t('Configuration copiée.','Configuration copied.');
      } catch {
        host.querySelector('[data-copy-status]').textContent = t('Sélectionnez et copiez le récapitulatif ci-dessus.','Select and copy the summary above.');
      }
    }
  });

  new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  render();
})();
