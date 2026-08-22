const meta = {
  title: 'Patterns/Article Reading',
  parameters: { layout: 'fullscreen' }
};

export default meta;

export const ArticleHeader = {
  render: () => `
    <div style="background:var(--komo-paper);padding:72px 24px">
      <div style="width:min(100%,920px);margin:auto">
        <p class="komo-eyebrow">MARCHE · MOBILITÉ · 6 MIN</p>
        <h1 class="komo-display" style="font-size:clamp(48px,7vw,78px);max-width:900px">Pourquoi je marche plus lentement qu’avant ?</h1>
        <p class="komo-body" style="font-family:var(--komo-font-sans);font-size:19px;max-width:760px;margin-top:22px">La vitesse de marche dépend de plusieurs systèmes à la fois : puissance musculaire, équilibre, amplitude, coordination et coût énergétique.</p>
      </div>
    </div>`
};

export const ThreeThingsToKnow = {
  render: () => `
    <div class="komo-story" style="max-width:690px">
      <p class="komo-eyebrow">3 CHOSES À RETENIR</p>
      <div style="border-top:1px solid var(--komo-ink)">
        ${[
          'La vitesse de marche est une mesure fonctionnelle simple, mais son interprétation dépend du contexte.',
          'La longueur du pas, la cadence et l’équilibre aident à comprendre comment cette vitesse est produite.',
          'Une trajectoire individuelle répétée est souvent plus utile qu’une valeur isolée.'
        ].map((text,i)=>`<div style="display:grid;grid-template-columns:30px 1fr;gap:12px;padding:14px 0;border-bottom:1px solid var(--komo-line);font-size:14px;line-height:1.55"><b style="font-size:9px;color:var(--komo-sage)">0${i+1}</b><span>${text}</span></div>`).join('')}
      </div>
    </div>`
};

export const Evidence = {
  render: () => `
    <div class="komo-story" style="max-width:690px">
      <p class="komo-eyebrow">EVIDENCE LANGUAGE</p>
      <div class="komo-evidence">
        <div class="komo-evidence__row"><div class="komo-evidence__label">Établi</div><div class="komo-evidence__text">Ce que les publications citées permettent réellement d’affirmer.</div></div>
        <div class="komo-evidence__row"><div class="komo-evidence__label">KŌMØ</div><div class="komo-evidence__text">Les choix méthodologiques propres à KŌMØ sont identifiés comme tels.</div></div>
        <div class="komo-evidence__row"><div class="komo-evidence__label">À démontrer</div><div class="komo-evidence__text">Les hypothèses et perspectives restent explicitement séparées des données établies.</div></div>
      </div>
    </div>`
};

export const References = {
  render: () => `
    <div class="komo-story" style="max-width:690px">
      <p class="komo-eyebrow">BIBLIOGRAPHIE</p>
      <h2 class="komo-title" style="font-size:36px;margin-bottom:20px">Références bibliographiques</h2>
      <ol class="komo-reference-list">
        <li>Studenski S, et al. Gait Speed and Survival in Older Adults. JAMA. 2011;305(1):50–58.</li>
        <li>Cruz-Jentoft AJ, et al. Sarcopenia: revised European consensus on definition and diagnosis. Age Ageing. 2019.</li>
        <li>Japanese Orthopaedic Association. Locomotive Syndrome clinical framework and assessment.</li>
      </ol>
    </div>`
};

export const FullReadingRhythm = {
  render: () => `
    <main style="background:var(--komo-paper);padding:64px 24px">
      <article style="width:min(100%,690px);margin:auto">
        <p class="komo-eyebrow">KŌMØ LIBRARY · READING TEMPLATE</p>
        <h1 class="komo-title" style="font-size:clamp(44px,6vw,68px)">La vitesse est un résultat. La biomécanique aide à comprendre pourquoi.</h1>
        <p class="komo-body" style="margin-top:26px">Un article KŌMØ privilégie une colonne étroite, des paragraphes courts et une hiérarchie scientifique lisible en quelques secondes.</p>
        <h2 class="komo-title" style="font-size:34px;margin-top:54px">Une idée par section</h2>
        <p class="komo-body">Le lecteur ne doit pas avoir à décoder la mise en page. L’espace, la typographie et les séparateurs servent uniquement à guider l’attention.</p>
        <p class="komo-body" style="font-size:30px;line-height:1.18;color:var(--komo-ink);border-top:1px solid var(--komo-ink);border-bottom:1px solid var(--komo-ink);padding:24px 0;margin:38px 0">La sophistication scientifique doit être invisible. La lecture, elle, doit être évidente.</p>
        <div class="komo-evidence">
          <div class="komo-evidence__row"><div class="komo-evidence__label">Établi</div><div class="komo-evidence__text">Les données publiées.</div></div>
          <div class="komo-evidence__row"><div class="komo-evidence__label">KŌMØ</div><div class="komo-evidence__text">La méthode et l’interprétation KŌMØ.</div></div>
          <div class="komo-evidence__row"><div class="komo-evidence__label">Recherche</div><div class="komo-evidence__text">Ce qu’il reste à valider.</div></div>
        </div>
      </article>
    </main>`
};
