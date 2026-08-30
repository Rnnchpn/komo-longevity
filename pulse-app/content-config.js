(() => {
  const PUBLIC_LINKS = Object.freeze({
    'Méthode KŌMØ': 'https://komolongevity.com/fr/methode/',
    'Votre bilan': 'https://komolongevity.com/fr/bilan/',
    'KŌMØ Case': 'https://komolongevity.com/fr/case/',
    'Motion': 'https://komolongevity.com/fr/partners/motion/',
    'Clinical': 'https://komolongevity.com/fr/partners/clinical/',
    'Network': 'https://komolongevity.com/fr/network/',
    'Library': 'https://komolongevity.com/media',
    'Professionnels': 'https://komolongevity.com/fr/partners/',
    'Science': 'https://komolongevity.com/fr/science/',
    'Contact': 'https://komolongevity.com/fr/contact/'
  });

  const TEXT_REPLACEMENTS = Object.freeze([
    ['Parcours', 'Programme'],
    ['ÉTAT DU PARCOURS', 'ÉTAT DU PROGRAMME'],
    ['suite du parcours', 'suite du programme'],
    ['Documents liés à votre parcours', 'Documents liés à votre suivi'],
    ['prochaine étape de votre parcours KŌMØ', 'prochaine étape de votre programme KŌMØ'],
    ['Le mouvement devient un parcours clinique.', 'Le mouvement devient un suivi clinique.'],
    ['fil de votre parcours', 'fil de votre suivi'],
    ['Poursuivre le parcours', 'Poursuivre le programme'],
    ['Étape du parcours', 'Étape du programme']
  ]);

  window.KOMO_PULSE_CONTENT = Object.freeze({ PUBLIC_LINKS, TEXT_REPLACEMENTS });

  function loadEcosystemLayer() {
    if (!document.querySelector('link[data-komo-ecosystem]')) {
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = './ecosystem-v1.css';
      css.dataset.komoEcosystem = '1';
      document.head.appendChild(css);
    }
    if (!document.querySelector('script[data-komo-ecosystem]')) {
      const js = document.createElement('script');
      js.type = 'module';
      js.src = './ecosystem-v1.js';
      js.dataset.komoEcosystem = '1';
      document.body.appendChild(js);
    }
  }

  function replaceTextInNode(node) {
    if (!node || node.nodeType !== Node.TEXT_NODE || !node.nodeValue) return;
    let next = node.nodeValue;
    for (const [from, to] of TEXT_REPLACEMENTS) next = next.replaceAll(from, to);
    if (next !== node.nodeValue) node.nodeValue = next;
  }

  function applyCopy(root = document.body) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT),nodes=[];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(replaceTextInNode);
  }

  function applyExplorerLinks(root = document) {
    root.querySelectorAll?.('.explorer-card').forEach((card) => {
      const title = card.querySelector('h3')?.textContent?.trim(),href = PUBLIC_LINKS[title];
      if (!href) return;
      card.setAttribute('href', href);
      card.setAttribute('target', '_blank');
      card.setAttribute('rel', 'noopener noreferrer');
    });
  }

  function applyAll(root = document) {
    applyCopy(root === document ? document.body : root);
    applyExplorerLinks(root === document ? document : root);
  }

  const observer = new MutationObserver((mutations) => {
    let refresh = false;
    for (const mutation of mutations) {
      if (mutation.type === 'characterData') replaceTextInNode(mutation.target);
      for (const node of mutation.addedNodes) {
        if (node.nodeType === Node.TEXT_NODE) replaceTextInNode(node);
        if (node.nodeType === Node.ELEMENT_NODE) {
          applyCopy(node);
          if (node.matches?.('.explorer-card') || node.querySelector?.('.explorer-card')) refresh = true;
        }
      }
    }
    if (refresh) applyExplorerLinks(document);
  });

  document.addEventListener('DOMContentLoaded', () => {
    loadEcosystemLayer();applyAll(document);
    const host=document.querySelector('#appShell');if(host)observer.observe(host,{subtree:true,childList:true,characterData:true});
    requestAnimationFrame(() => applyAll(document));
  });
})();
