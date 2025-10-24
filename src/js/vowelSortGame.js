(function (window) {
  // Juego de clasificar palabras por vocal inicial
  const App = window.App = window.App || {};
  const VOWELS = ['A', 'E', 'I', 'O', 'U'];
  const ITEMS_PER_ROUND = 5;
  const DROP_FEEDBACK_MS = 700;

  let themeWords = [];
  let pool = [];
  let placedCount = 0;
  let els = {};

  function init() {
    els.screen = document.getElementById('vowel-sort-game-screen');
    els.items = document.getElementById('vs-items');
    els.dropzones = document.getElementById('vs-dropzones');
    els.feedback = document.getElementById('vs-feedback');
    els.backBtn = document.getElementById('vowel-sort-back-button');
    if (els.backBtn) els.backBtn.addEventListener('click', () => {
      App.screens.showScreen('gameSelection');
      if (els.screen) els.screen.style.display = 'none';
    });
  }

  function start() {
    if (!els.screen) init();
    // Obtener palabras de todos los temas
    themeWords = getAllWords();
    if (App.utils && App.utils.shuffleArray) themeWords = App.utils.shuffleArray(themeWords);
    nextRound();
    App.screens.showScreen('vowelSortGame');
  }

  function getAllWords() {
    let words = [];
    try {
      const themes = eval('wordThemes');
      Object.values(themes).forEach(arr => {
        arr.forEach(entry => words.push({ word: entry.word, emoji: entry.emoji }));
      });
    } catch {
      words = [
        { word: 'ahate', emoji: '🦆' }, { word: 'arkatz', emoji: '✏️' }, { word: 'arrain', emoji: '🐠' },
        { word: 'eskola', emoji: '🏫' }, { word: 'elur', emoji: '❄️' },
        { word: 'igel', emoji: '🐸' }, { word: 'ilargi', emoji: '🌙' },
        { word: 'ogi', emoji: '🍞' }, { word: 'otso', emoji: '🐺' },
        { word: 'untxia', emoji: '🐇' }, { word: 'urdin', emoji: '💙' }
      ];
    }
    return words;
  }

  function nextRound() {
    placedCount = 0;
    els.items.innerHTML = '';
    pool = themeWords.slice(0, ITEMS_PER_ROUND);
    if (pool.length < ITEMS_PER_ROUND) pool = themeWords.slice(0, pool.length);

    pool.forEach((entry, idx) => {
      const correct = entry.word[0].toUpperCase();
      const tile = document.createElement('div');
      tile.className = 'vs-item';
      tile.draggable = true;
      tile.dataset.index = idx;
      tile.dataset.correct = correct;
      tile.setAttribute('aria-label', `${entry.word}`);
      tile.innerHTML = `<div class="vs-emoji">${entry.emoji}</div><div class="vs-word">${entry.word.toUpperCase()}</div>`;
      tile.addEventListener('dragstart', onDragStart);
      tile.addEventListener('dragend', onDragEnd);
      els.items.appendChild(tile);
    });

    els.dropzones.innerHTML = '';
    VOWELS.forEach(vowel => {
      const zone = document.createElement('div');
      zone.className = 'vs-zone';
      zone.dataset.vowel = vowel;
      zone.innerHTML = `<div class="vs-zone-label">${vowel}</div>`;
      zone.addEventListener('dragover', onDragOver);
      zone.addEventListener('dragleave', onDragLeave);
      zone.addEventListener('drop', onDrop);
      els.dropzones.appendChild(zone);
    });

    els.feedback.textContent = 'Arrastatu hitzak vokal egokira.';
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
    document.querySelectorAll('.vs-zone.over').forEach(z => z.classList.remove('over'));
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
    const item = els.items.querySelector(`.vs-item[data-index="${idxStr}"]`);
    if (!item) return;
    performDrop(item, zone);
  }

  function performDrop(item, zone) {
    if (!item || !zone) return;
    const correct = item.dataset.correct;
    const expected = zone.dataset.vowel;
    if (correct === expected) {
      item.classList.add('vs-correct');
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
      item.classList.add('vs-incorrect');
      flash(zone, false);
      updateFeedback('Saiatu berriro! 🤔', 'incorrect');
      setTimeout(() => item.classList.remove('vs-incorrect'), DROP_FEEDBACK_MS);
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
    themeWords = themeWords.slice(ITEMS_PER_ROUND).concat(themeWords.slice(0, ITEMS_PER_ROUND));
    setTimeout(() => nextRound(), 1200);
  }

  App.vowelSortGame = { init, start };
})(window);
