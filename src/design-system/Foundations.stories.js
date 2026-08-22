const meta = {
  title: 'Foundations/KŌMØ',
  parameters: { layout: 'centered' }
};

export default meta;

const swatch = (name, token) => `
  <div style="display:grid;gap:9px">
    <div style="height:110px;border-radius:14px;background:var(${token});border:1px solid var(--komo-line)"></div>
    <strong style="font-size:12px">${name}</strong>
    <code style="font-size:10px;color:var(--komo-muted)">${token}</code>
  </div>`;

export const Palette = {
  render: () => `
    <div class="komo-story komo-stack">
      <div>
        <p class="komo-eyebrow">KŌMØ DESIGN SYSTEM · FOUNDATIONS</p>
        <h1 class="komo-title">Colour should feel quiet.</h1>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:18px">
        ${swatch('Ink','--komo-ink')}
        ${swatch('Paper','--komo-paper')}
        ${swatch('White','--komo-white')}
        ${swatch('Stone','--komo-stone')}
        ${swatch('Sage','--komo-sage')}
      </div>
    </div>`
};

export const Typography = {
  render: () => `
    <div class="komo-story komo-stack" style="max-width:900px">
      <p class="komo-eyebrow">TYPOGRAPHY</p>
      <h1 class="komo-display">Longevity<br>in motion.</h1>
      <div class="komo-divider"></div>
      <h2 class="komo-title">Understand movement.<br>Preserve mobility.</h2>
      <p class="komo-body">KŌMØ turns complex locomotor science into an experience that feels simple, calm and immediately understandable.</p>
      <p class="komo-caption">Caption · Scientific references · Metadata · 12 px maximum</p>
    </div>`
};

export const Spacing = {
  render: () => `
    <div class="komo-story">
      <p class="komo-eyebrow">SPACING RHYTHM</p>
      <div style="display:grid;gap:14px">
        ${[['04','--komo-space-1'],['08','--komo-space-2'],['12','--komo-space-3'],['16','--komo-space-4'],['24','--komo-space-5'],['32','--komo-space-6'],['48','--komo-space-7'],['72','--komo-space-8'],['96','--komo-space-9']].map(([label,token])=>`<div style="display:grid;grid-template-columns:42px 1fr;align-items:center;gap:12px"><code style="font-size:10px">${label}</code><div style="height:10px;width:var(${token});max-width:100%;background:var(--komo-sage);border-radius:99px"></div></div>`).join('')}
      </div>
    </div>`
};
