/* KŌMØ Motion — demande de rendez-vous. Prépare un e-mail adressé à contact@komolongevity.com.
   Aucune donnée n'est envoyée à un serveur depuis cette page. */
(function () {
  'use strict';
  var d = document, form = d.querySelector('[data-book]');
  if (!form) return;
  var I = JSON.parse(d.getElementById('k-i18n').textContent);
  var done = d.querySelector('[data-done]'), pre = d.querySelector('[data-preview]'), mailA = d.querySelector('[data-mailto]');
  var copyBtn = d.querySelector('[data-copy]'), editBtn = d.querySelector('[data-edit]');
  var S = { place: d.querySelector('[data-s="place"]'), service: d.querySelector('[data-s="service"]'), duration: d.querySelector('[data-s="duration"]'), price: d.querySelector('[data-s="price"]') };
  var prepared = '';

  function iso(dt) { return dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0'); }
  var today = iso(new Date());
  form.date1.min = today; form.date2.min = today;

  function val(name) { var el = form.querySelector('input[name="' + name + '"]:checked'); return el ? el.value : ''; }
  function pick(name, value) { var el = form.querySelector('input[name="' + name + '"][value="' + value + '"]'); if (el) el.checked = true; }

  var q = new URLSearchParams(window.location.search);
  var qp = (q.get('lieu') || q.get('place') || '').toLowerCase();
  var qs = (q.get('prestation') || q.get('service') || '').toLowerCase();
  if (I.places[qp]) pick('lieu', qp);
  pick('prestation', I.services[qs] ? qs : 'bilan');

  function summary() {
    var p = I.places[val('lieu')], s = I.services[val('prestation')];
    S.place.textContent = p ? p.label : I.toChoose;
    S.service.textContent = s ? s.label : I.toChoose;
    S.duration.textContent = s ? s.minutes + ' min' : '—';
    S.price.textContent = s ? s.price : '—';
  }
  form.addEventListener('change', function (e) {
    summary();
    if (e.target.name === 'lieu') setError('lieu', '');
    if (e.target.name === 'prestation') setError('prestation', '');
    if (e.target.name === 'consent' && e.target.checked) setError('consent', '');
  });
  summary();

  function setError(key, msg) {
    var box = d.getElementById('err-' + key); if (box) box.textContent = msg;
    var field = { date1: form.date1, date2: form.date2, first: form.first, last: form.last, email: form.email }[key];
    if (field) field.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }
  function longDate(v) {
    if (!v) return I.mail.none;
    var dt = new Date(v + 'T12:00:00');
    if (isNaN(dt.getTime())) return v;
    try { return new Intl.DateTimeFormat(I.dateLocale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(dt); } catch (e) { return v; }
  }

  function validate() {
    var errors = [], E = I.errors;
    var place = val('lieu'), service = val('prestation');
    var date1 = form.date1.value, date2 = form.date2.value;
    var first = form.first.value.trim(), last = form.last.value.trim(), email = form.email.value.trim();
    var check = function (key, ok, msg, focusEl) { setError(key, ok ? '' : msg); if (!ok) errors.push(focusEl); };
    check('lieu', !!place, E.place, form.querySelector('input[name="lieu"]'));
    check('prestation', !!service, E.service, form.querySelector('input[name="prestation"]'));
    check('date1', !!date1 && date1 >= today, E.date, form.date1);
    check('date2', !date2 || date2 >= today, E.date2, form.date2);
    check('first', first.length > 0, E.first, form.first);
    check('last', last.length > 0, E.last, form.last);
    check('email', /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email), E.email, form.email);
    check('consent', form.consent.checked, E.consent, form.consent);
    if (errors.length) { errors[0].focus(); return false; }
    return true;
  }

  function compose() {
    var M = I.mail, p = I.places[val('lieu')], s = I.services[val('prestation')];
    var first = form.first.value.trim(), last = form.last.value.trim();
    var slot = I.slots[+form.slot.value] || I.slots[0];
    var subject = M.subject.replace('{service}', s.label).replace('{place}', p.label);
    var lines = [
      M.hello, '', M.intro, '',
      M.place + ' : ' + p.label + ' (' + p.venue + ')',
      M.service + ' : ' + s.label + ' (' + s.minutes + ' min, ' + s.price + ')',
      M.date1 + ' : ' + longDate(form.date1.value),
      M.date2 + ' : ' + longDate(form.date2.value),
      M.slot + ' : ' + slot, '',
      M.name + ' : ' + first + ' ' + last,
      M.email + ' : ' + form.email.value.trim(),
      M.phone + ' : ' + (form.phone.value.trim() || M.none), '',
      M.outro, '', M.bye, first + ' ' + last
    ];
    if (I.lang !== 'fr') lines = lines.map(function (l) { return l.replace(' : ', ': '); });
    var body = lines.join('\n');
    return { subject: subject, body: body, uri: 'mailto:' + I.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body) };
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) return;
    var m = compose();
    prepared = (I.lang === 'fr' ? 'À : ' : I.lang === 'es' ? 'Para: ' : 'To: ') + I.email + '\n' + (I.lang === 'fr' ? 'Objet : ' : I.lang === 'es' ? 'Asunto: ' : 'Subject: ') + m.subject + '\n\n' + m.body;
    pre.textContent = prepared;
    mailA.href = m.uri;
    form.classList.add('is-hidden');
    done.classList.add('is-on');
    done.focus({ preventScroll: true });
    done.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.location.href = m.uri;
  });

  copyBtn.addEventListener('click', function () {
    var ok = function () { copyBtn.textContent = I.copied; setTimeout(function () { copyBtn.textContent = I.copy; }, 2600); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(prepared).then(ok, function () { selectPre(); });
    } else { selectPre(); }
  });
  function selectPre() { var r = d.createRange(); r.selectNodeContents(pre); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); }
  editBtn.addEventListener('click', function () {
    done.classList.remove('is-on');
    form.classList.remove('is-hidden');
    form.first.focus();
  });
})();
