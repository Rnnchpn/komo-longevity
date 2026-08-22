const meta = {
  title: 'Components/Button',
  parameters: { layout: 'centered' }
};

export default meta;

export const Primary = {
  render: () => `<a class="komo-button" href="#">Faire le KŌMØ Check →</a>`
};

export const Secondary = {
  render: () => `<a class="komo-button komo-button--secondary" href="#">Explorer la Library</a>`
};

export const Quiet = {
  render: () => `<a class="komo-button komo-button--quiet" href="#">Lire les références</a>`
};

export const Comparison = {
  render: () => `
    <div class="komo-story komo-stack" style="max-width:760px">
      <div>
        <p class="komo-eyebrow">BUTTON HIERARCHY</p>
        <h1 class="komo-title">One action should win.</h1>
        <p class="komo-body">Une page KŌMØ ne doit presque jamais mettre trois actions au même niveau visuel.</p>
      </div>
      <div class="komo-row">
        <a class="komo-button" href="#">Action principale →</a>
        <a class="komo-button komo-button--secondary" href="#">Action secondaire</a>
        <a class="komo-button komo-button--quiet" href="#">Lien discret</a>
      </div>
    </div>`
};
