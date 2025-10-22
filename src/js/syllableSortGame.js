(function (window) {
  // Módulo syllableSortGame: clasifica varias palabras por número de sílabas con arrastrar y soltar
  const App = window.App = window.App || {};

  const ITEMS_PER_ROUND = 4; // emojis por pantalla
  const MAX_SYLLABLES = 4;   // zonas 1..4
  const DROP_FEEDBACK_MS = 700;

  // Estado
  let themeWords = [];
  let pool = [];
  let placedCount = 0;
  let els = {};

  function init() {
    els.screen = document.getElementById('syllable-sort-game-screen');
    els.items = document.getElementById('ss-items');
    els.dropzones = document.getElementById('ss-dropzones');
    els.feedback = document.getElementById('ss-feedback');
    els.backBtn = document.getElementById('syllable-sort-back-button');
  }

  function start(theme) {
    if (!App.syllableGame) {
      console.error('syllableGame no disponible.');
      return;
    }
    if (!els.screen) init();

    // Obtener lista desde syllableThemes del módulo syllableGame
    const allThemes = App.syllableGame && App.syllableGame.__getThemes ? App.syllableGame.__getThemes() : null;
    const source = allThemes && allThemes[theme];
    if (!source || !Array.isArray(source)) {
      console.error('Gai ez da aurkitu edo hutsa:', theme);
      return;
    }

    // Mezclar y preparar ronda
    themeWords = [...source];
    if (App.utils && App.utils.shuffleArray) themeWords = App.utils.shuffleArray(themeWords);
    nextRound();
    App.screens.showScreen('syllableSortGame');
  }

  function nextRound() {
    placedCount = 0;
    els.items.innerHTML = '';
    // Elegir N palabras únicas para la ronda
    pool = themeWords.slice(0, ITEMS_PER_ROUND);
    // Si hay menos de N, tomar las que haya
    if (pool.length < ITEMS_PER_ROUND) pool = themeWords.slice(0, pool.length);

    // Renderizar items arrastrables
    pool.forEach((entry, idx) => {
      const correct = (entry.syllableParts && entry.syllableParts.length) ? entry.syllableParts.length : entry.syllables;
      const tile = document.createElement('div');
      tile.className = 'ss-item';
      tile.draggable = true;
      tile.dataset.index = idx;
      tile.dataset.correct = String(correct);
      tile.setAttribute('aria-label', `${entry.word}`);
      tile.innerHTML = `<div class="ss-emoji">${entry.emoji}</div><div class="ss-word">${entry.word.toUpperCase()}</div>`;
      tile.addEventListener('dragstart', onDragStart);
      tile.addEventListener('dragend', onDragEnd);
      els.items.appendChild(tile);
    });

    // Preparar zonas (1..4)
    els.dropzones.innerHTML = '';
    for (let s = 1; s <= MAX_SYLLABLES; s++) {
      const zone = document.createElement('div');
      zone.className = 'ss-zone';
      zone.dataset.syllables = String(s);
      zone.innerHTML = `<div class="ss-zone-label">${s} silaba</div>`;
      zone.addEventListener('dragover', onDragOver);
      zone.addEventListener('dragleave', onDragLeave);
      zone.addEventListener('drop', onDrop);
      els.dropzones.appendChild(zone);
    }

    els.feedback.textContent = 'Arrastatu eta askatu tokian.';
    els.feedback.className = 'feedback';
    if (App.options && App.options.applyOptions) App.options.applyOptions();
  }

  function onDragStart(e) {
    const el = e.currentTarget;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', el.dataset.index);
    setTimeout(() => el.classList.add('dragging'), 0);
  }

  function onDragEnd(e) {
    e.currentTarget.classList.remove('dragging');
    document.querySelectorAll('.ss-zone.over').forEach(z => z.classList.remove('over'));
  }

  function onDragOver(e) {
    e.preventDefault();
    const zone = e.currentTarget;
    zone.classList.add('over');
    e.dataTransfer.dropEffect = 'move';
  }

  function onDragLeave(e) {
    e.currentTarget.classList.remove('over');
  }

  function onDrop(e) {
    e.preventDefault();
    const zone = e.currentTarget;
    zone.classList.remove('over');
    const idxStr = e.dataTransfer.getData('text/plain');
    if (!idxStr) return;
    const item = els.items.querySelector(`.ss-item[data-index="${idxStr}"]`);
    if (!item) return;

    const correct = item.dataset.correct;
    const expected = zone.dataset.syllables;
    if (correct === expected) {
      // Correcto: fijar dentro de la zona y desactivar
      item.classList.add('ss-correct');
      zone.appendChild(item);
      item.setAttribute('draggable', 'false');
      item.classList.remove('dragging');
      placedCount++;
      flash(zone, true);
      updateFeedback('Zuzen! ✅', 'correct');
      if (placedCount >= pool.length) {
        setTimeout(() => finishRound(), 600);
      }
    } else {
      // Incorrecto: animación y feedback
      item.classList.add('ss-incorrect');
      flash(zone, false);
      updateFeedback('Saiatu berriro! 🤔', 'incorrect');
      setTimeout(() => item.classList.remove('ss-incorrect'), DROP_FEEDBACK_MS);
    }
  }

  function flash(zone, ok) {
    zone.classList.add(ok ? 'zone-correct' : 'zone-incorrect');
    setTimeout(() => zone.classList.remove(ok ? 'zone-correct' : 'zone-incorrect'), 400);
  }

  function updateFeedback(text, cls) {
    els.feedback.textContent = text;
    els.feedback.className = `feedback ${cls || ''}`.trim();
  }

  function finishRound() {
    updateFeedback('Ronda osatuta! 🎉', 'correct');
    // Rotar las usadas al final y continuar
    themeWords = themeWords.slice(ITEMS_PER_ROUND).concat(themeWords.slice(0, ITEMS_PER_ROUND));
    setTimeout(() => nextRound(), 1200);
  }

  // API pública
  App.syllableSortGame = {
    init,
    start
  };

  // Exponer acceso de solo lectura a temas desde syllableGame
  if (App.syllableGame && !App.syllableGame.__getThemes) {
    App.syllableGame.__getThemes = function () {
      // Extraer referencia interna a syllableThemes a través de cierre del módulo syllableGame
      // Como no es accesible directamente, añadimos un método que devuelve la tabla
      try { return eval('syllableThemes'); } catch { return null; }
    };
  }
})(window);
