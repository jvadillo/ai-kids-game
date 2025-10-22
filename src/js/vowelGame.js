(function (window) {
  // Juego de las vocales: selecciona palabras que empiezan por la vocal de la pantalla
  const App = window.App = window.App || {};
  const VOWELS = ['A', 'E', 'I', 'O', 'U'];
  let currentVowelIndex = 0;
  let els = {};
  let allWords = [];

  // Extrae todas las palabras de los temas existentes
  function getAllWords() {
    let words = [];
    try {
      // Accede a los temas de wordGame
      const themes = eval('wordThemes');
      Object.values(themes).forEach(arr => {
        arr.forEach(entry => words.push({ word: entry.word, emoji: entry.emoji }));
      });
    } catch {
      // Si no se puede, usar una lista fija
      words = [
        { word: 'ahate', emoji: '🦆' }, { word: 'arkatz', emoji: '✏️' }, { word: 'arrain', emoji: '🐠' },
        { word: 'eskola', emoji: '🏫' }, { word: 'elur', emoji: '❄️' },
        { word: 'igel', emoji: '🐸' }, { word: 'ilargi', emoji: '🌙' },
        { word: 'ogi', emoji: '🍞' }, { word: 'orratz', emoji: '🪡' },
        { word: 'ugaztun', emoji: '🦣' }, { word: 'urdin', emoji: '💙' }
      ];
    }
    return words;
  }

  function init() {
    els.screen = document.getElementById('vowel-game-screen');
    els.vowelLabel = document.getElementById('vowel-label');
    els.wordList = document.getElementById('vowel-word-list');
    els.feedback = document.getElementById('vowel-feedback');
    els.nextBtn = document.getElementById('vowel-next-button');
    els.backBtn = document.getElementById('vowel-back-button');
    allWords = getAllWords();
    if (els.nextBtn) els.nextBtn.addEventListener('click', nextVowel);
    if (els.backBtn) els.backBtn.addEventListener('click', () => App.screens.showScreen('gameSelection'));
  }

  function start() {
    init(); // Siempre cachea y conecta listeners
    currentVowelIndex = 0;
    App.screens.showScreen('vowelGame');
    showVowelScreen();
  }

  function showVowelScreen() {
    const vowel = VOWELS[currentVowelIndex];
    els.vowelLabel.textContent = `Aukeratu hitzak: ${vowel}`;
    els.feedback.textContent = '';
    els.wordList.innerHTML = '';
    // Filtrar palabras que empiezan por la vocal actual y otras para despistar
    const matching = allWords.filter(w => w.word[0].toUpperCase() === vowel);
    const distractors = allWords.filter(w => w.word[0].toUpperCase() !== vowel);
    // Selecciona hasta 5 matching y 5 distractores
    const pool = [...matching.slice(0, 5), ...distractors.slice(0, 5)];
    // Mezclar
    const shuffled = App.utils && App.utils.shuffleArray ? App.utils.shuffleArray(pool) : pool;
    shuffled.forEach((entry, idx) => {
      const btn = document.createElement('button');
      btn.className = 'vowel-word-btn';
      btn.innerHTML = `<span class=\"vowel-emoji\">${entry.emoji}</span> <span class=\"vowel-word\">${entry.word}</span>`;
      btn.dataset.correct = entry.word[0].toUpperCase() === vowel ? '1' : '0';
      btn.addEventListener('click', () => handleSelect(btn));
      els.wordList.appendChild(btn);
    });
    els.nextBtn.style.display = 'none';
  }

  function handleSelect(btn) {
    if (btn.dataset.correct === '1') {
      btn.classList.add('vowel-correct');
      els.feedback.textContent = 'Zuzen!';
      els.feedback.className = 'feedback correct';
    } else {
      btn.classList.add('vowel-incorrect');
      els.feedback.textContent = 'Ez da zuzena.';
      els.feedback.className = 'feedback incorrect';
    }
    btn.disabled = true;
    // Mostrar botón siguiente si todas las correctas han sido seleccionadas
    const remaining = Array.from(els.wordList.querySelectorAll('.vowel-word-btn[data-correct="1"]:not([disabled])'));
    if (remaining.length === 0) {
      els.nextBtn.style.display = currentVowelIndex < VOWELS.length - 1 ? '' : 'none';
      if (currentVowelIndex === VOWELS.length - 1) {
        els.feedback.textContent = 'Joko amaituta!';
        els.feedback.className = 'feedback correct';
      }
    }
  }

  function nextVowel() {
    if (currentVowelIndex < VOWELS.length - 1) {
      currentVowelIndex++;
      showVowelScreen();
    }
  }

  App.vowelGame = { init, start };
})(window);
