(() => {
  const messages = {
    fr: {
      sending: 'Envoi de votre demande…',
      successTitle: 'Votre demande a bien été transmise.',
      successText: 'L’équipe KŌMØ reviendra vers vous pour qualifier le format le plus adapté à votre structure.',
      invalid: 'Merci de compléter les informations requises avant de continuer.',
      error: 'L’envoi direct est momentanément indisponible.',
      fallback: 'Vous pouvez envoyer la demande par e-mail à contact@komolongevity.com.',
      button: 'Envoyer ma demande professionnelle'
    },
    en: {
      sending: 'Sending your enquiry…',
      successTitle: 'Your enquiry has been sent.',
      successText: 'The KŌMØ team will come back to you to qualify the most relevant deployment model for your organisation.',
      invalid: 'Please complete the required information before continuing.',
      error: 'Direct submission is temporarily unavailable.',
      fallback: 'You can send the enquiry by email to contact@komolongevity.com.',
      button: 'Send my professional enquiry'
    },
    es: {
      sending: 'Enviando tu solicitud…',
      successTitle: 'Tu solicitud ha sido enviada.',
      successText: 'El equipo KŌMØ se pondrá en contacto contigo para definir el modelo de despliegue más adecuado para tu organización.',
      invalid: 'Completa la información obligatoria antes de continuar.',
      error: 'El envío directo no está disponible temporalmente.',
      fallback: 'Puedes enviar la solicitud por correo a contact@komolongevity.com.',
      button: 'Enviar mi solicitud profesional'
    }
  };

  const buildFallbackMail = (payload) => {
    const name = `${payload.firstName || ''} ${payload.lastName || ''}`.trim();
    const subject = `KŌMØ professional enquiry — ${payload.organisation || name || payload.email || ''}`;
    const body = [
      `Name: ${name}`,
      `Email: ${payload.email || ''}`,
      `Phone: ${payload.phone || ''}`,
      `Role: ${payload.role || ''}`,
      `Organisation: ${payload.organisation || ''}`,
      `Organisation type: ${payload.organisationType || ''}`,
      `Location: ${[payload.city, payload.country].filter(Boolean).join(', ')}`,
      `Website: ${payload.website || ''}`,
      `Number of sites: ${payload.sites || ''}`,
      `Expected assessments: ${payload.assessments || ''}`,
      `Timeline: ${payload.timeline || ''}`,
      `Preferred contact: ${payload.preferredContact || ''}`,
      `Interests: ${(payload.interests || []).join(', ')}`,
      '',
      payload.message || ''
    ].join('\n');
    return `mailto:contact@komolongevity.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  document.querySelectorAll('[data-professional-contact]').forEach((form) => {
    const locale = form.dataset.locale || 'en';
    const copy = messages[locale] || messages.en;
    const button = form.querySelector('button[type="submit"]');
    const status = form.querySelector('[data-professional-status]');
    const panel = form.closest('.professional-form-panel');
    const success = panel?.querySelector('[data-professional-success]');
    const steps = [...form.querySelectorAll('[data-pro-step]')];
    const progress = [...panel?.querySelectorAll('[data-pro-progress]') || []];
    let currentStep = 0;

    const query = new URLSearchParams(window.location.search);
    const setHidden = (name, value) => {
      const input = form.querySelector(`[name="${name}"]`);
      if (input) input.value = value || '';
    };
    setHidden('source', window.location.href);
    setHidden('utmSource', query.get('utm_source'));
    setHidden('utmMedium', query.get('utm_medium'));
    setHidden('utmCampaign', query.get('utm_campaign'));

    const focusStep = () => {
      const target = steps[currentStep]?.querySelector('input:not([type="hidden"]), textarea, button');
      target?.focus({ preventScroll: true });
    };

    const renderStep = ({ focus = false, scroll = false } = {}) => {
      steps.forEach((step, index) => {
        step.hidden = index !== currentStep;
        step.setAttribute('aria-hidden', String(index !== currentStep));
      });
      progress.forEach((item, index) => {
        item.classList.toggle('is-active', index === currentStep);
        item.classList.toggle('is-complete', index < currentStep);
        item.setAttribute('aria-current', index === currentStep ? 'step' : 'false');
      });
      if (scroll) panel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (focus) requestAnimationFrame(focusStep);
    };

    const validateStep = (index) => {
      const step = steps[index];
      if (!step) return true;
      const controls = [...step.querySelectorAll('input, textarea, select')].filter((control) => !control.disabled && control.type !== 'hidden');
      const invalid = controls.find((control) => !control.checkValidity());
      if (invalid) {
        invalid.reportValidity();
        invalid.focus({ preventScroll: true });
        if (status) {
          status.textContent = copy.invalid;
          status.classList.add('is-error');
        }
        return false;
      }
      if (status) {
        status.textContent = '';
        status.classList.remove('is-error');
      }
      return true;
    };

    panel?.querySelectorAll('[data-pro-next]').forEach((control) => {
      control.addEventListener('click', () => {
        if (!validateStep(currentStep)) return;
        currentStep = Math.min(steps.length - 1, currentStep + 1);
        renderStep({ focus: true, scroll: true });
      });
    });

    panel?.querySelectorAll('[data-pro-back]').forEach((control) => {
      control.addEventListener('click', () => {
        currentStep = Math.max(0, currentStep - 1);
        if (status) {
          status.textContent = '';
          status.classList.remove('is-error');
        }
        renderStep({ focus: true, scroll: true });
      });
    });

    progress.forEach((control, index) => {
      control.addEventListener('click', () => {
        if (index > currentStep) return;
        currentStep = index;
        renderStep({ focus: true, scroll: true });
      });
    });

    const intent = query.get('intent');
    if (intent === 'demo') {
      const demo = form.querySelector('input[name="interest"][value="demo"]');
      if (demo) demo.checked = true;
    }

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      status?.classList.remove('is-error', 'is-success');

      for (let index = 0; index < steps.length; index += 1) {
        if (!validateStep(index)) {
          currentStep = index;
          renderStep({ focus: true, scroll: true });
          return;
        }
      }

      const data = new FormData(form);
      const payload = {
        firstName: data.get('firstName'),
        lastName: data.get('lastName'),
        email: data.get('email'),
        phone: data.get('phone'),
        role: data.get('role'),
        organisation: data.get('organisation'),
        website: data.get('website'),
        city: data.get('city'),
        country: data.get('country'),
        organisationType: data.get('organisationType'),
        sites: data.get('sites'),
        assessments: data.get('assessments'),
        timeline: data.get('timeline'),
        preferredContact: data.get('preferredContact'),
        interests: data.getAll('interest'),
        message: data.get('message'),
        companyUrl: data.get('companyUrl'),
        consent: data.get('consent') === 'on',
        locale,
        source: data.get('source'),
        utmSource: data.get('utmSource'),
        utmMedium: data.get('utmMedium'),
        utmCampaign: data.get('utmCampaign')
      };

      if (button) {
        button.disabled = true;
        button.dataset.originalLabel = button.textContent;
        button.textContent = copy.sending;
      }
      if (status) status.textContent = copy.sending;

      try {
        const response = await fetch('/api/professional-contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok || !result.ok) throw new Error(result.error || `http_${response.status}`);

        form.reset();
        if (status) {
          status.textContent = '';
          status.classList.add('is-success');
        }
        form.hidden = true;
        panel?.querySelector('.professional-progress')?.setAttribute('hidden', '');
        if (success) {
          success.hidden = false;
          success.querySelector('h3').textContent = copy.successTitle;
          success.querySelector('p').textContent = copy.successText;
          success.focus({ preventScroll: true });
        }
        panel?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch (error) {
        const fallback = buildFallbackMail(payload);
        if (status) {
          status.innerHTML = `${copy.error} <a href="${fallback}">${copy.fallback}</a>`;
          status.classList.add('is-error');
        }
      } finally {
        if (button) {
          button.disabled = false;
          button.textContent = button.dataset.originalLabel || copy.button;
        }
      }
    });

    renderStep();
  });
})();
