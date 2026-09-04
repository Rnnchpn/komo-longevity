(() => {
  const isCoarse = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
  if (!isCoarse) return;

  document.documentElement.classList.add('komo-mobile');
  const app = document.querySelector('#app');
  const canvas = document.querySelector('#world-canvas');
  if (!app || !canvas) return;

  const controls = document.createElement('div');
  controls.className = 'mobile-game-controls';
  controls.innerHTML = `
    <div class="mobile-joystick" id="mobile-joystick" aria-label="Movement joystick">
      <div class="joystick-ring"></div>
      <div class="joystick-knob" id="joystick-knob"></div>
      <span class="joystick-label">MOVE</span>
    </div>
    <div class="camera-look-zone" id="camera-look-zone" aria-label="Camera look area">
      <div class="camera-look-hint"><span>LOOK</span><i>↔</i></div>
    </div>
    <div class="mobile-world-tabs glass" aria-label="World mobile panels">
      <button type="button" data-mobile-panel="world" class="active">World</button>
      <button type="button" data-mobile-panel="data">Data</button>
      <button type="button" data-mobile-panel="ai">AI</button>
      <button type="button" data-mobile-panel="time">Time</button>
    </div>`;
  app.appendChild(controls);

  const joystick = document.querySelector('#mobile-joystick');
  const knob = document.querySelector('#joystick-knob');
  const lookZone = document.querySelector('#camera-look-zone');

  const heldKeys = new Set();
  const keyMap = { forward: 'w', back: 's', left: 'a', right: 'd' };
  const activeDirs = new Set();
  let movePointerId = null;
  let joystickRect = null;

  const dispatchKey = (key, down) => {
    if (down && heldKeys.has(key)) return;
    if (!down && !heldKeys.has(key)) return;
    heldKeys[down ? 'add' : 'delete'](key);
    window.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { key, bubbles: true }));
  };

  const syncDirections = (nextDirs) => {
    Object.entries(keyMap).forEach(([dir, key]) => dispatchKey(key, nextDirs.has(dir)));
    activeDirs.clear();
    nextDirs.forEach((d) => activeDirs.add(d));
  };

  const updateJoystick = (clientX, clientY) => {
    joystickRect ||= joystick.getBoundingClientRect();
    const cx = joystickRect.left + joystickRect.width / 2;
    const cy = joystickRect.top + joystickRect.height / 2;
    const max = joystickRect.width * 0.31;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const mag = Math.hypot(dx, dy);
    if (mag > max) {
      dx = dx / mag * max;
      dy = dy / mag * max;
    }
    knob.style.transform = `translate(${dx}px, ${dy}px)`;

    const nx = dx / max;
    const ny = dy / max;
    const dead = 0.24;
    const dirs = new Set();
    if (ny < -dead) dirs.add('forward');
    if (ny > dead) dirs.add('back');
    if (nx < -dead) dirs.add('left');
    if (nx > dead) dirs.add('right');
    syncDirections(dirs);
    joystick.classList.toggle('active', dirs.size > 0);
  };

  const resetJoystick = () => {
    movePointerId = null;
    joystickRect = null;
    knob.style.transform = 'translate(0px, 0px)';
    syncDirections(new Set());
    joystick.classList.remove('active');
  };

  joystick.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    movePointerId = e.pointerId;
    joystick.setPointerCapture?.(e.pointerId);
    joystickRect = joystick.getBoundingClientRect();
    updateJoystick(e.clientX, e.clientY);
  });
  joystick.addEventListener('pointermove', (e) => {
    if (e.pointerId !== movePointerId) return;
    e.preventDefault();
    updateJoystick(e.clientX, e.clientY);
  });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((type) => {
    joystick.addEventListener(type, (e) => {
      if (movePointerId !== null && e.pointerId !== undefined && e.pointerId !== movePointerId) return;
      resetJoystick();
    });
  });

  let lookPointerId = null;
  let lastLook = null;

  const relayPointer = (type, e) => {
    const init = {
      pointerId: e.pointerId,
      pointerType: e.pointerType || 'touch',
      clientX: e.clientX,
      clientY: e.clientY,
      bubbles: true,
      cancelable: true,
      buttons: type === 'pointerup' || type === 'pointercancel' ? 0 : 1,
      button: 0,
      pressure: e.pressure || (type === 'pointerup' ? 0 : 0.5),
    };
    canvas.dispatchEvent(new PointerEvent(type, init));
  };

  lookZone.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    lookPointerId = e.pointerId;
    lastLook = { x: e.clientX, y: e.clientY };
    lookZone.setPointerCapture?.(e.pointerId);
    relayPointer('pointerdown', e);
    lookZone.classList.add('active');
  });
  lookZone.addEventListener('pointermove', (e) => {
    if (e.pointerId !== lookPointerId) return;
    e.preventDefault();
    if (!lastLook) lastLook = { x: e.clientX, y: e.clientY };
    relayPointer('pointermove', e);
    lastLook = { x: e.clientX, y: e.clientY };
  });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((type) => {
    lookZone.addEventListener(type, (e) => {
      if (lookPointerId !== null && e.pointerId !== undefined && e.pointerId !== lookPointerId) return;
      e.preventDefault();
      relayPointer(type === 'lostpointercapture' ? 'pointerup' : type, e);
      lookPointerId = null;
      lastLook = null;
      lookZone.classList.remove('active');
    });
  });

  const panelMap = {
    world: '.hero',
    data: '.sources',
    ai: '.agent',
    time: '.timeline',
  };
  const tabs = [...document.querySelectorAll('[data-mobile-panel]')];

  function setPanel(name) {
    document.documentElement.dataset.mobilePanel = name;
    tabs.forEach((b) => b.classList.toggle('active', b.dataset.mobilePanel === name));
    Object.entries(panelMap).forEach(([key, selector]) => {
      const el = document.querySelector(selector);
      if (el) el.classList.toggle('mobile-open', key === name && name !== 'world');
    });
  }
  tabs.forEach((button) => button.addEventListener('click', () => setPanel(button.dataset.mobilePanel)));
  setPanel('world');

  document.addEventListener('visibilitychange', () => { if (document.hidden) resetJoystick(); });
  window.addEventListener('blur', resetJoystick);
})();
