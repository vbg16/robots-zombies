(function (global) {
  'use strict';

  if (!global || !global.document) return;

  const mounted = new WeakMap();
  const DEAD_ZONE = 0.14;
  const DEFAULT_AIM = Object.freeze({ x: 1, y: 0 });

  function clamp01(value) {
    return Math.max(0, Math.min(1, value));
  }

  function pointerVector(event, pad, radius, deadZone, unitDirection) {
    const rect = pad.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    const distance = Math.hypot(dx, dy);
    const radial = radius > 0 ? clamp01(distance / radius) : 0;
    const knobDistance = Math.min(distance, radius);

    if (distance === 0 || radial <= deadZone) {
      return { vector: null, knobX: 0, knobY: 0 };
    }

    const magnitude = unitDirection
      ? 1
      : clamp01((radial - deadZone) / (1 - deadZone));
    const directionX = dx / distance;
    const directionY = dy / distance;

    return {
      vector: { x: directionX * magnitude, y: directionY * magnitude },
      knobX: (distance ? dx / distance : 0) * knobDistance,
      knobY: (distance ? dy / distance : 0) * knobDistance
    };
  }

  function mount(container, options) {
    if (!container || typeof container.appendChild !== 'function' || !container.classList) {
      throw new TypeError('ScrewTouchControls.mount precisa receber um elemento container.');
    }

    const callbacks = options || {};
    const previous = mounted.get(container);
    if (previous) previous.destroy();

    const hadHostClass = container.classList.contains('touch-controls-host');
    const wasHidden = container.hidden;
    container.classList.add('touch-controls-host');

    const layer = global.document.createElement('div');
    layer.className = 'touch-controls-layer';
    layer.setAttribute('data-touch-controls', '');
    layer.setAttribute('aria-label', 'Controles por toque');
    layer.hidden = true;

    const movePad = makePad('move', 'MOVER', 'Mover o robô. Arraste para indicar a direção.');
    const aimPad = makePad('aim', 'MIRAR · ATIRAR', 'Mire e mantenha pressionado para atirar. Arraste para mudar a direção.');
    const actionStack = global.document.createElement('div');
    actionStack.className = 'touch-action-stack';
    actionStack.setAttribute('data-touch-action-stack', '');

    const reloadButton = makeAction('reload', '↻', 'RECARGA', 'Recarregar todas as armas');
    const dashButton = makeAction('dash', '⇧', 'PROPULSOR', 'Ativar propulsor');
    dashButton.hidden = true;
    actionStack.append(reloadButton, dashButton);
    layer.append(movePad.root, aimPad.root, actionStack);
    container.appendChild(layer);

    const pads = { move: movePad, aim: aimPad };
    const pointers = new Map();
    const padPointers = { move: null, aim: null };
    const buttonPointers = new Set();
    let enabled = false;
    let dashAvailable = false;
    let destroyed = false;
    let destroying = false;
    let trackingInstalled = false;
    let moveActive = false;
    let moveVector = { x: 0, y: 0 };
    let aimActive = false;
    let aimVector = { ...DEFAULT_AIM };

    function safeCall(name, value) {
      const callback = callbacks[name];
      if (typeof callback !== 'function') return;
      try {
        if (name === 'onAim') callback({ x: value.x, y: value.y, active: !!value.active });
        else if (name === 'onMove') callback({ x: value.x, y: value.y });
        else callback();
      } catch (error) {
        if (global.console && typeof global.console.error === 'function') {
          global.console.error('[ScrewTouchControls] callback ' + name + ' falhou.', error);
        }
      }
    }

    function setKnob(pad, x, y) {
      pad.knob.style.setProperty('--touch-knob-x', x + 'px');
      pad.knob.style.setProperty('--touch-knob-y', y + 'px');
    }

    function setMove(vector, active) {
      const next = vector || { x: 0, y: 0 };
      const changed = next.x !== moveVector.x || next.y !== moveVector.y || !!active !== moveActive;
      moveVector = { x: next.x, y: next.y };
      moveActive = !!active;
      if (changed) safeCall('onMove', moveVector);
    }

    function setAim(vector, active) {
      const changedVector = !!vector && (vector.x !== aimVector.x || vector.y !== aimVector.y);
      if (vector) aimVector = { x: vector.x, y: vector.y };
      const nextActive = !!active;
      const changed = nextActive !== aimActive || changedVector;
      aimActive = nextActive;
      if (changed || nextActive) safeCall('onAim', { x: aimVector.x, y: aimVector.y, active: aimActive });
    }

    function installTracking() {
      if (trackingInstalled) return;
      trackingInstalled = true;
      global.addEventListener('pointermove', onWindowPointerMove, { passive: false });
      global.addEventListener('pointerup', onWindowPointerUp);
      global.addEventListener('pointercancel', onWindowPointerCancel);
      global.addEventListener('blur', cancelAll);
      global.document.addEventListener('visibilitychange', onVisibilityChange);
    }

    function uninstallTracking() {
      if (!trackingInstalled) return;
      trackingInstalled = false;
      global.removeEventListener('pointermove', onWindowPointerMove);
      global.removeEventListener('pointerup', onWindowPointerUp);
      global.removeEventListener('pointercancel', onWindowPointerCancel);
      global.removeEventListener('blur', cancelAll);
      global.document.removeEventListener('visibilitychange', onVisibilityChange);
    }

    function capture(target, pointerId) {
      if (!target || typeof target.setPointerCapture !== 'function') return;
      try { target.setPointerCapture(pointerId); } catch (_) { /* Window listeners remain as a fallback. */ }
    }

    function releaseCapture(target, pointerId) {
      if (!target || typeof target.releasePointerCapture !== 'function') return;
      try {
        if (!target.hasPointerCapture || target.hasPointerCapture(pointerId)) {
          target.releasePointerCapture(pointerId);
        }
      } catch (_) { /* A browser can release capture before pointerup is delivered. */ }
    }

    function pointerDown(event, kind, target) {
      if (!enabled || destroyed || event.pointerType === 'mouse' || event.button !== 0) return;
      if (pointers.has(event.pointerId) || padPointers[kind] !== null) {
        event.preventDefault();
        return;
      }

      event.preventDefault();
      const entry = { kind, target, action: null };
      pointers.set(event.pointerId, entry);
      padPointers[kind] = event.pointerId;
      target.classList.add('is-active');
      installTracking();
      capture(target, event.pointerId);

      if (kind === 'move') updateMove(event);
      else {
        aimPad.root.classList.add('is-active');
        const reading = readPad(event, aimPad, true);
        if (reading.vector) aimVector = reading.vector;
        setKnob(aimPad, reading.knobX, reading.knobY);
        setAim(reading.vector, !!reading.vector);
      }
    }

    function readPad(event, pad, unitDirection) {
      const rect = pad.root.getBoundingClientRect();
      const radius = Math.max(1, Math.min(rect.width, rect.height) / 2 - 20);
      return pointerVector(event, pad.root, radius, DEAD_ZONE, unitDirection);
    }

    function updateMove(event) {
      const reading = readPad(event, movePad, false);
      setKnob(movePad, reading.knobX, reading.knobY);
      setMove(reading.vector || { x: 0, y: 0 }, true);
    }

    function updateAim(event) {
      const reading = readPad(event, aimPad, true);
      if (reading.vector) aimVector = reading.vector;
      setKnob(aimPad, reading.knobX, reading.knobY);
      setAim(reading.vector, !!reading.vector);
    }

    function clearPad(kind) {
      padPointers[kind] = null;
      pads[kind].root.classList.remove('is-active');
      setKnob(pads[kind], 0, 0);
      if (kind === 'move') setMove({ x: 0, y: 0 }, false);
      else setAim(aimVector, false);
    }

    function finishPointer(pointerId) {
      const entry = pointers.get(pointerId);
      if (!entry) return;
      pointers.delete(pointerId);
      if (entry.kind === 'move' || entry.kind === 'aim') clearPad(entry.kind);
      else {
        buttonPointers.delete(pointerId);
        entry.target.classList.remove('is-pressed');
      }
      releaseCapture(entry.target, pointerId);
      if (pointers.size === 0) uninstallTracking();
    }

    function cancelAll() {
      if (pointers.size === 0 && !moveActive && !aimActive && moveVector.x === 0 && moveVector.y === 0) return;
      const entries = Array.from(pointers.entries());
      pointers.clear();
      buttonPointers.clear();
      padPointers.move = null;
      padPointers.aim = null;
      movePad.root.classList.remove('is-active');
      aimPad.root.classList.remove('is-active');
      setKnob(movePad, 0, 0);
      setKnob(aimPad, 0, 0);
      reloadButton.classList.remove('is-pressed');
      dashButton.classList.remove('is-pressed');
      const stopMove = moveActive || moveVector.x !== 0 || moveVector.y !== 0;
      const stopAim = aimActive;
      moveActive = false;
      moveVector = { x: 0, y: 0 };
      aimActive = false;
      uninstallTracking();
      for (const [pointerId, entry] of entries) releaseCapture(entry.target, pointerId);
      if (stopMove) safeCall('onMove', moveVector);
      if (stopAim) safeCall('onAim', { x: aimVector.x, y: aimVector.y, active: false });
    }

    function onWindowPointerMove(event) {
      if (!enabled) return;
      const entry = pointers.get(event.pointerId);
      if (!entry) return;
      if (entry.kind === 'move') updateMove(event);
      else if (entry.kind === 'aim') updateAim(event);
    }

    function onWindowPointerUp(event) {
      finishPointer(event.pointerId);
    }

    function onWindowPointerCancel(event) {
      if (pointers.has(event.pointerId)) cancelAll();
    }

    function onVisibilityChange() {
      if (global.document.hidden) cancelAll();
    }

    function onLostPointerCapture(event) {
      if (pointers.has(event.pointerId)) cancelAll();
    }

    function trackButton(button, action) {
      button.addEventListener('pointerdown', event => {
        if (!enabled || event.button !== 0 || pointers.has(event.pointerId)) return;
        const entry = { kind: 'button', target: button, action };
        pointers.set(event.pointerId, entry);
        buttonPointers.add(event.pointerId);
        button.classList.add('is-pressed');
        installTracking();
        capture(button, event.pointerId);
      });

      button.addEventListener('click', event => {
        if (!enabled || destroyed || (action === 'dash' && !dashAvailable)) return;
        event.preventDefault();
        safeCall(action === 'reload' ? 'onReload' : 'onDash');
      });
    }

    movePad.root.addEventListener('pointerdown', event => pointerDown(event, 'move', movePad.root));
    aimPad.root.addEventListener('pointerdown', event => pointerDown(event, 'aim', aimPad.root));
    layer.addEventListener('lostpointercapture', onLostPointerCapture);
    trackButton(reloadButton, 'reload');
    trackButton(dashButton, 'dash');

    function makePad(kind, label, description) {
      const root = global.document.createElement('div');
      root.className = 'touch-pad touch-pad--' + kind;
      root.id = kind === 'move' ? 'touch-move' : 'touch-aim';
      root.setAttribute('data-touch-pad', kind);
      root.setAttribute('role', 'group');
      root.setAttribute('aria-label', description);

      const ring = global.document.createElement('span');
      ring.className = 'touch-pad-ring';
      ring.setAttribute('aria-hidden', 'true');
      const axis = global.document.createElement('span');
      axis.className = 'touch-pad-axis';
      axis.setAttribute('aria-hidden', 'true');
      const knob = global.document.createElement('span');
      knob.className = 'touch-pad-knob';
      knob.setAttribute('data-touch-knob', '');
      knob.setAttribute('aria-hidden', 'true');
      const caption = global.document.createElement('span');
      caption.className = 'touch-pad-caption';
      caption.textContent = label;
      caption.setAttribute('aria-hidden', 'true');
      root.append(ring, axis, knob, caption);
      return { root, knob };
    }

    function makeAction(action, iconText, labelText, ariaLabel) {
      const button = global.document.createElement('button');
      button.type = 'button';
      button.className = 'touch-action-button touch-action-button--' + action;
      button.id = action === 'reload' ? 'touch-reload' : 'touch-dash';
      button.setAttribute('data-touch-action', action);
      button.setAttribute('aria-label', ariaLabel);
      const icon = global.document.createElement('span');
      icon.className = 'touch-action-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = iconText;
      const label = global.document.createElement('span');
      label.className = 'touch-action-label';
      label.setAttribute('aria-hidden', 'true');
      label.textContent = labelText;
      button.append(icon, label);
      return button;
    }

    function setEnabled(value) {
      if (destroyed) return;
      const next = !!value;
      if (next === enabled) return;
      enabled = next;
      if (enabled) {
        container.hidden = false;
        layer.hidden = false;
      } else {
        cancelAll();
        layer.hidden = true;
        container.hidden = true;
      }
    }

    function setDashAvailable(value) {
      if (destroyed) return;
      const next = !!value;
      if (next === dashAvailable) return;
      if (!next && Array.from(pointers.values()).some(entry => entry.action === 'dash')) cancelAll();
      dashAvailable = next;
      dashButton.hidden = !dashAvailable;
    }

    function reset() {
      if (destroyed) return;
      cancelAll();
    }

    function destroy() {
      if (destroyed || destroying) return;
      destroying = true;
      cancelAll();
      enabled = false;
      layer.remove();
      container.hidden = wasHidden;
      if (!hadHostClass) container.classList.remove('touch-controls-host');
      mounted.delete(container);
      destroyed = true;
      destroying = false;
    }

    const api = { setEnabled, setDashAvailable, reset, destroy };
    mounted.set(container, api);
    return api;
  }

  global.ScrewTouchControls = Object.freeze({
    mount,
    deadZone: DEAD_ZONE,
    api: Object.freeze({
      onMove: 'onMove({x,y}) emits a radial movement vector in [-1,1]; y is positive down.',
      onAim: 'onAim({x,y,active}) emits a unit aim direction in [-1,1]; active holds fire.',
      selectors: '#touch-move, #touch-aim, #touch-reload, #touch-dash; also [data-touch-controls], [data-touch-pad], [data-touch-action]'
    })
  });
})(window);
