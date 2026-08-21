(() => {
  const body = document.body;
  const header = document.querySelector('.site-header');
  const menuButton = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-primary-nav]');
  const language = document.querySelector('[data-language]');
  const languageButton = language?.querySelector('button');

  const closeMenu = () => {
    nav?.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
    body.classList.remove('menu-open');
  };

  menuButton?.addEventListener('click', () => {
    const open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    body.classList.toggle('menu-open', open);
  });
  nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

  languageButton?.addEventListener('click', (event) => {
    event.stopPropagation();
    const isOpen = language.classList.toggle('is-open');
    languageButton.setAttribute('aria-expanded', String(isOpen));
  });
  document.addEventListener('click', (event) => {
    if (language && !language.contains(event.target)) {
      language.classList.remove('is-open');
      languageButton?.setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      language?.classList.remove('is-open');
      languageButton?.setAttribute('aria-expanded', 'false');
      closeMenu();
    }
  });

  document.querySelectorAll('[data-locale]').forEach((link) => {
    link.addEventListener('click', () => {
      try { localStorage.setItem('komo-locale', link.dataset.locale); } catch (_) { /* non-essential */ }
    });
  });

  const onScroll = () => header?.classList.toggle('is-scrolled', window.scrollY > 5);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .14 });
    document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
  } else {
    document.querySelectorAll('.reveal').forEach((element) => element.classList.add('is-visible'));
  }

  document.querySelectorAll('[data-carousel-controls]').forEach((controls) => {
    const carousel = document.querySelector(controls.dataset.carouselControls);
    controls.querySelectorAll('button').forEach((button) => {
      button.addEventListener('click', () => {
        const amount = carousel?.clientWidth ? carousel.clientWidth * .75 : 300;
        carousel?.scrollBy({ left: button.dataset.direction === 'next' ? amount : -amount, behavior: 'smooth' });
      });
    });
  });

  // The international site can be served from Vercel or Netlify without a
  // server-side form handler. This keeps the contact route honest: it opens a
  // pre-filled email to the official address rather than silently collecting
  // personal data through an unconfigured endpoint.
  document.querySelectorAll('[data-contact-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const values = new FormData(form);
      const subject = values.get('subject') || 'KŌMØ enquiry';
      const body = [
        `Name: ${values.get('name') || ''}`,
        `Email: ${values.get('email') || ''}`,
        '',
        values.get('message') || ''
      ].join('\n');
      window.location.href = `mailto:contact@komolongevity.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  });


  // KŌMØ Check is deliberately local-only: the form has no endpoint, no
  // account flow and no storage. Calculations never leave the visitor's device.
  const checkMessages = {
    fr: {
      invalid: "Vérifiez les conditions de sécurité, votre réponse au lever de chaise, votre taille et votre distance sur deux pas.",
      preview: "Score deux pas : ",
      previewSuffix: " (distance ÷ taille)",
      stand: ["Réussi à 40 cm sur chaque jambe", "Seuil de prévention — une jambe à 40 cm non réussi", "Seuil renforcé — deux jambes à 20 cm non réussi", "Seuil prioritaire — deux jambes à 30 cm non réussi"],
      context: ["Aucun point de contexte coché", "1 élément de contexte à prendre en compte", " éléments de contexte à prendre en compte"],
      levels: [
        {title: "Aucun seuil atteint sur les tests renseignés.", lead: "Conservez des habitudes régulières de force, équilibre et marche. Ce résultat auto-réalisé ne remplace pas un suivi médical.", next: "Si une douleur, une chute, une faiblesse ou une limitation vous inquiète, demandez un avis professionnel même si ce repère paraît rassurant."},
        {title: "Un seuil de prévention est atteint.", lead: "Le cadre JOA associe ce niveau à un début de déclin de mobilité. Une activité adaptée mêlant force, équilibre et mobilité mérite d’être discutée.", next: "Prenez ce résultat comme un signal pour agir tôt. Une évaluation professionnelle est pertinente si des symptômes, douleurs ou chutes sont présents."},
        {title: "Des seuils fonctionnels plus marqués sont atteints.", lead: "Une évaluation par un professionnel de santé est recommandée, en particulier en présence de douleur, de chute ou de limitation dans les activités quotidiennes.", next: "N’attendez pas qu’une difficulté s’installe : organisez un bilan adapté et apportez ce résultat comme point de départ."},
        {title: "Un seuil de vigilance prioritaire est atteint.", lead: "Le cadre JOA relie ce niveau à une réduction plus avancée de la mobilité. Une évaluation clinique est recommandée afin de comprendre les causes et d’orienter la prise en charge.", next: "Organisez rapidement une évaluation avec un professionnel de santé. En cas de symptômes nouveaux, sévères ou soudains, utilisez les services médicaux appropriés."}
      ],
      partial: "Lecture partielle : le lever de chaise n’a pas été renseigné ou n’était pas sûr à réaliser. Le résultat se fonde uniquement sur le test des deux pas.",
      extra: "Le contexte fonctionnel suggère également d’échanger avec un professionnel, surtout si les limitations sont nouvelles, progressives ou liées à une chute."
    },
    en: {
      invalid: "Please confirm the safety conditions, select a stand-up response, and enter your height plus two-step distance.",
      preview: "Two-step score: ",
      previewSuffix: " (distance ÷ height)",
      stand: ["40 cm one-leg rise achieved on both sides", "Prevention threshold — 40 cm one-leg rise not achieved", "Higher threshold — 20 cm two-leg rise not achieved", "Priority threshold — 30 cm two-leg rise not achieved"],
      context: ["No functional-context point selected", "1 functional-context point to consider", " functional-context points to consider"],
      levels: [
        {title: "No threshold reached on the completed tests.", lead: "Maintain regular strength, balance and walking habits. This self-performed result does not replace medical follow-up.", next: "If pain, falls, weakness or a limitation concerns you, seek professional advice even if this reference appears reassuring."},
        {title: "A prevention threshold is reached.", lead: "The JOA framework relates this level to early mobility decline. Discussing an appropriate mix of strength, balance and mobility work can be useful.", next: "Treat this as a prompt to act early. Professional assessment is appropriate when symptoms, pain or falls are present."},
        {title: "More marked functional thresholds are reached.", lead: "Assessment by a health professional is recommended, especially with pain, falls or limitation in daily activities.", next: "Do not wait for a difficulty to become established: arrange an appropriate assessment and bring this result as a starting point."},
        {title: "A priority vigilance threshold is reached.", lead: "The JOA framework links this level with more advanced mobility decline. Clinical assessment is recommended to understand causes and guide next steps.", next: "Arrange a prompt assessment with a health professional. For new, severe or sudden symptoms, use appropriate medical services."}
      ],
      partial: "Partial reading: the stand-up result was not entered or was not safe to perform. This result is based on the two-step test alone.",
      extra: "The functional context also suggests speaking with a professional, especially when limitations are new, progressive or related to a fall."
    },
    es: {
      invalid: "Confirma las condiciones de seguridad, elige una respuesta de levantarse e indica altura y distancia de dos pasos.",
      preview: "Puntuación de dos pasos: ",
      previewSuffix: " (distancia ÷ altura)",
      stand: ["Levantarse a una pierna desde 40 cm conseguido en ambos lados", "Umbral preventivo — no se consigue a una pierna desde 40 cm", "Umbral mayor — no se consigue con dos piernas desde 20 cm", "Umbral prioritario — no se consigue con dos piernas desde 30 cm"],
      context: ["Sin punto de contexto funcional seleccionado", "1 punto de contexto funcional a considerar", " puntos de contexto funcional a considerar"],
      levels: [
        {title: "No se alcanza ningún umbral en las pruebas completadas.", lead: "Mantén hábitos regulares de fuerza, equilibrio y marcha. Este resultado auto-realizado no sustituye el seguimiento médico.", next: "Si te preocupa dolor, caída, debilidad o limitación, busca consejo profesional aunque esta referencia parezca tranquilizadora."},
        {title: "Se alcanza un umbral preventivo.", lead: "El marco JOA relaciona este nivel con el inicio del descenso de movilidad. Puede ser útil hablar de fuerza, equilibrio y movilidad adaptados.", next: "Tómalo como una señal para actuar pronto. Una valoración profesional es apropiada si hay síntomas, dolor o caídas."},
        {title: "Se alcanzan umbrales funcionales más marcados.", lead: "Se recomienda valoración por un profesional de salud, especialmente con dolor, caídas o limitación en actividades diarias.", next: "No esperes a que la dificultad se establezca: organiza una valoración adecuada y lleva este resultado como punto de partida."},
        {title: "Se alcanza un umbral de vigilancia prioritario.", lead: "El marco JOA relaciona este nivel con un descenso más avanzado de movilidad. Se recomienda una valoración clínica para comprender causas y orientar los siguientes pasos.", next: "Organiza pronto una valoración con un profesional. Ante síntomas nuevos, graves o súbitos, utiliza los servicios médicos adecuados."}
      ],
      partial: "Lectura parcial: el resultado de levantarse no se indicó o no era seguro realizarlo. Este resultado se basa solo en la prueba de dos pasos.",
      extra: "El contexto funcional también sugiere hablar con un profesional, sobre todo si las limitaciones son nuevas, progresivas o se relacionan con una caída."
    }
  };

  document.querySelectorAll('[data-komo-check]').forEach((form) => {
    const locale = form.dataset.locale || 'en';
    const copy = checkMessages[locale] || checkMessages.en;
    const preview = form.querySelector('[data-two-step-preview]');
    const previewEmpty = preview.textContent;
    const error = form.querySelector('[data-check-error]');
    const result = document.querySelector('[data-check-result]');
    const heightInput = form.elements.height;
    const distanceInput = form.elements.distance;

    const twoStepRatio = () => {
      const height = Number(heightInput.value);
      const distance = Number(distanceInput.value);
      if (!Number.isFinite(height) || !Number.isFinite(distance) || height <= 0 || distance <= 0) return null;
      return distance / height;
    };
    const displayRatio = (ratio) => new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : locale === 'es' ? 'es-ES' : 'en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2}).format(ratio);
    const stageForRatio = (ratio) => ratio >= 1.3 ? 0 : ratio >= 1.1 ? 1 : ratio >= .9 ? 2 : 3;
    const updatePreview = () => {
      const ratio = twoStepRatio();
      preview.textContent = ratio === null ? previewEmpty : copy.preview + displayRatio(ratio) + copy.previewSuffix;
    };
    heightInput.addEventListener('input', updatePreview);
    distanceInput.addEventListener('input', updatePreview);

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      error.textContent = '';
      const readiness = form.elements.ready;
      const selectedStand = new FormData(form).get('standUp');
      const ratio = twoStepRatio();
      if (!readiness.checked || !selectedStand || ratio === null || !heightInput.validity.valid || !distanceInput.validity.valid) {
        error.textContent = copy.invalid;
        if (!readiness.checked) readiness.focus();
        else if (!selectedStand) form.querySelector('input[name="standUp"]')?.focus();
        else if (!heightInput.validity.valid) heightInput.focus();
        else distanceInput.focus();
        return;
      }

      const twoStage = stageForRatio(ratio);
      const standStage = selectedStand === 'na' ? null : Number(selectedStand);
      const stage = standStage === null ? twoStage : Math.max(twoStage, standStage);
      const contextCount = new FormData(form).getAll('context').length;
      const level = copy.levels[stage];
      const title = result.querySelector('[data-check-result-title]');
      const lead = result.querySelector('[data-check-result-lead]');
      const twoOutput = result.querySelector('[data-check-two-step]');
      const twoNote = result.querySelector('[data-check-two-step-note]');
      const standOutput = result.querySelector('[data-check-stand]');
      const standNote = result.querySelector('[data-check-stand-note]');
      const contextOutput = result.querySelector('[data-check-context]');
      const contextNote = result.querySelector('[data-check-context-note]');
      const next = result.querySelector('[data-check-next]');

      title.textContent = level.title;
      lead.textContent = level.lead;
      twoOutput.textContent = displayRatio(ratio);
      twoNote.textContent = 'JOA: ' + (twoStage === 0 ? '≥ 1.30' : twoStage === 1 ? '1.10–1.29' : twoStage === 2 ? '0.90–1.09' : '< 0.90');
      standOutput.textContent = standStage === null ? '—' : String(standStage);
      standNote.textContent = standStage === null ? copy.partial : copy.stand[standStage];
      contextOutput.textContent = String(contextCount);
      contextNote.textContent = contextCount === 0 ? copy.context[0] : contextCount === 1 ? copy.context[1] : String(contextCount) + copy.context[2];
      next.textContent = (standStage === null ? copy.partial + ' ' : '') + level.next + (contextCount >= 2 ? ' ' + copy.extra : '');
      result.hidden = false;
      result.focus({preventScroll: true});
      result.scrollIntoView({behavior: 'smooth', block: 'start'});
    });

    result?.querySelector('[data-check-reset]')?.addEventListener('click', () => {
      form.reset();
      error.textContent = '';
      result.hidden = true;
      preview.textContent = previewEmpty;
      form.querySelector('input[name="ready"]')?.focus();
    });
  });

})();
