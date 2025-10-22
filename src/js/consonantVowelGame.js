(function(window) {
  // Juego de combinación consonante + vocal
  const App = window.App = window.App || {};
  const VOWELS = ['A', 'E', 'I', 'O', 'U'];
  const CONSONANTS = ['P', 'M', 'K', 'L', 'D', 'B', 'S', 'G', 'T'];
  const ITEMS_PER_ROUND = 6;

  let currentConsonant = null;
  let currentVowelIndex = 0;
  let comboWords = [];
  let els = {};

  function init() {
    els.selectScreen = document.getElementById('consonant-vowel-select-screen');
    els.gameScreen = document.getElementById('consonant-vowel-game-screen');
    els.consonantButtons = document.getElementById('cv-consonant-buttons');
    els.backBtn = document.getElementById('cv-back-button');
    els.gameBackBtn = document.getElementById('cv-game-back-button');
    els.comboTitle = document.getElementById('cv-combo-title');
    els.wordList = document.getElementById('cv-word-list');
    els.feedback = document.getElementById('cv-feedback');
    els.nextBtn = document.getElementById('cv-next-button');

    if (els.backBtn) els.backBtn.addEventListener('click', () => App.screens.showScreen('gameSelection'));
    if (els.gameBackBtn) els.gameBackBtn.addEventListener('click', () => {
      App.screens.showScreen('consonantVowelSelect');
      els.gameScreen.style.display = 'none';
    });
    if (els.consonantButtons) {
      els.consonantButtons.addEventListener('click', (e) => {
        const btn = e.target.closest('.cv-consonant-button');
        if (!btn) return;
        startGame(btn.dataset.consonant);
      });
    }
    if (els.nextBtn) {
      els.nextBtn.addEventListener('click', () => {
        currentVowelIndex++;
        if (currentVowelIndex < VOWELS.length) {
          showRound();
        } else {
          App.screens.showScreen('consonantVowelSelect');
          els.gameScreen.style.display = 'none';
        }
      });
    }
  }

  function start() {
    if (!els.selectScreen) init();
    App.screens.showScreen('consonantVowelSelect');
  }

  function startGame(consonant) {
    currentConsonant = consonant;
    currentVowelIndex = 0;
    comboWords = getComboWords(consonant);
    showRound();
    App.screens.showScreen('consonantVowelGame');
  }

  function getComboWords(consonant) {
    // Recoge palabras de wordThemes que empiezan por consonante+vocal
    let words = [];
    try {
      const themes = eval('wordThemes');
      Object.values(themes).forEach(arr => {
        arr.forEach(entry => words.push({ word: entry.word, emoji: entry.emoji }));
      });
    } catch {
      words = [
        // P
           { word: 'pailazo', emoji: '🤡' }, { word: 'pasta', emoji: '🍝' }, { word: 'panpina', emoji: '🧸' },
        { word: 'pelikula', emoji: '📽️' },
        { word: 'piano', emoji: '🎹' }, { word: 'pilota', emoji: '⚽' }, { word: 'pirata', emoji: '🏴‍☠️' },
        { word: 'poltsa', emoji: '👜' }, { word: 'pottoka', emoji: '🐴' }, { word: 'pozik', emoji: '😃' },
        { word: 'puzle', emoji: '🧩' }, { word: 'puntu', emoji: '🔵' }, { word: 'puma', emoji: '😃' },
        // M
        { word: 'mama', emoji: '👩' }, { word: 'manta', emoji: '🧣' }, { word: 'mapa', emoji: '🗺️' },
        { word: 'merkatari', emoji: '🛒' }, { word: 'merke', emoji: '💸' }, { word: 'mendi', emoji: '⛰️' },
        { word: 'minutu', emoji: '⏱️' }, { word: 'miru', emoji: '🦅' }, { word: 'mila', emoji: '1️⃣' },
        { word: 'moko', emoji: '🦤' }, { word: 'motxila', emoji: '🎒' }, { word: 'mota', emoji: '🏍️' },
        { word: 'mutil', emoji: '👦' }, { word: 'mundu', emoji: '🌍' }, { word: 'museo', emoji: '🏛️' },
        // K
        { word: 'katu', emoji: '🐱' }, { word: 'kaxa', emoji: '📦' }, { word: 'kaleko', emoji: '🚶' },
        { word: 'keru', emoji: '💨' }, { word: 'keta', emoji: '🧀' }, { word: 'keinu', emoji: '�' },
        { word: 'kilogramo', emoji: '⚖️' }, { word: 'kimika', emoji: '🧪' }, { word: 'kirikiño', emoji: '🐭' },
        { word: 'kolore', emoji: '🎨' }, { word: 'koko', emoji: '🥥' }, { word: 'korrika', emoji: '🏃' },
        { word: 'kuku', emoji: '🐦' }, { word: 'kultura', emoji: '🎭' }, { word: 'kutsadura', emoji: '☣️' },
        // L
        { word: 'lapa', emoji: '🐚' }, { word: 'lantegi', emoji: '🏭' }, { word: 'larru', emoji: '👞' },
        { word: 'lehoi', emoji: '🦁' }, { word: 'leku', emoji: '📍' }, { word: 'lehen', emoji: '⏳' },
        { word: 'liburu', emoji: '📚' }, { word: 'lilura', emoji: '🌸' }, { word: 'limoi', emoji: '🍋' },
        { word: 'loro', emoji: '🦜' }, { word: 'loti', emoji: '😴' }, { word: 'lotsa', emoji: '😳' },
        { word: 'lupa', emoji: '🔍' }, { word: 'lurra', emoji: '🌎' }, { word: 'lusitu', emoji: '✨' },
        // D
        { word: 'dama', emoji: '👸' }, { word: 'danbor', emoji: '🥁' }, { word: 'denda', emoji: '🏪' },
        { word: 'dena', emoji: '🧺' }, { word: 'denboraldi', emoji: '�️' }, { word: 'dentista', emoji: '🦷' },
        { word: 'diru', emoji: '💰' }, { word: 'disko', emoji: '💿' }, { word: 'distantzia', emoji: '📏' },
        { word: 'doble', emoji: '2️⃣' }, { word: 'dogu', emoji: '🐶' }, { word: 'dozena', emoji: '🥚' },
        { word: 'duela', emoji: '⏰' }, { word: 'duen', emoji: '🧑‍🤝‍🧑' }, { word: 'duro', emoji: '🪙' },
        // B
        { word: 'baba', emoji: '🫘' }, { word: 'baita', emoji: '⛵' }, { word: 'bala', emoji: '�' },
        { word: 'beroa', emoji: '🔥' }, { word: 'berde', emoji: '💚' }, { word: 'berri', emoji: '📰' },
        { word: 'bidea', emoji: '🛣️' }, { word: 'bihotz', emoji: '❤️' }, { word: 'biltegi', emoji: '🏚️' },
        { word: 'boka', emoji: '👄' }, { word: 'bolu', emoji: '🎳' }, { word: 'borda', emoji: '🏡' },
        { word: 'bulego', emoji: '🏢' }, { word: 'burua', emoji: '🧠' }, { word: 'buztina', emoji: '🪨' },
        // S
        { word: 'sagar', emoji: '🍎' }, { word: 'sail', emoji: '🌾' }, { word: 'salda', emoji: '🍲' },
        { word: 'segi', emoji: '➡️' }, { word: 'sekretu', emoji: '�' }, { word: 'seme', emoji: '👦' },
        { word: 'sigilu', emoji: '🔏' }, { word: 'silaba', emoji: '🗣️' }, { word: 'sima', emoji: '🕳️' },
        { word: 'soldata', emoji: '💵' }, { word: 'sorgin', emoji: '🧙' }, { word: 'soto', emoji: '🏚️' },
        { word: 'su', emoji: '🔥' }, { word: 'sukalde', emoji: '🍳' }, { word: 'sustraia', emoji: '🌱' },
        // G
        { word: 'gaba', emoji: '🌃' }, { word: 'gailu', emoji: '🔧' }, { word: 'galdu', emoji: '❌' },
        { word: 'gel', emoji: '🧴' }, { word: 'gelditu', emoji: '🛑' }, { word: 'gela', emoji: '🏫' },
        { word: 'giltza', emoji: '�' }, { word: 'giro', emoji: '🌡️' }, { word: 'gitarra', emoji: '🎸' },
        { word: 'gogo', emoji: '🧠' }, { word: 'gorputz', emoji: '💪' }, { word: 'gosari', emoji: '🥐' },
        { word: 'gurpil', emoji: '🛞' }, { word: 'gurutze', emoji: '➕' }, { word: 'gutun', emoji: '✉️' },
        // T
        { word: 'tanta', emoji: '💧' }, { word: 'tarta', emoji: '🍰' }, { word: 'talde', emoji: '👥' },
        { word: 'teila', emoji: '🧱' }, { word: 'telebista', emoji: '📺' }, { word: 'tema', emoji: '🧑‍🎤' },
        { word: 'tinta', emoji: '🖋️' }, { word: 'tiradera', emoji: '🗄️' }, { word: 'tigre', emoji: '🐯' },
        { word: 'tokiko', emoji: '🏠' }, { word: 'tontor', emoji: '⛰️' }, { word: 'torloju', emoji: '🔩' },
        { word: 'tresna', emoji: '🛠️' }, { word: 'triku', emoji: '🦔' }, { word: 'tximino', emoji: '🐒' }
      ];
    }
    return words;
  }

  function showRound() {
    const vowel = VOWELS[currentVowelIndex];
    const combo = currentConsonant + vowel;
    els.comboTitle.textContent = combo;
    els.feedback.textContent = `Aukeratu hitzak: ${combo}`;
    els.nextBtn.style.display = 'none';
    els.wordList.innerHTML = '';
    // Filtrar palabras que empiezan por la combinación
    const candidates = comboWords.filter(entry => entry.word.toUpperCase().startsWith(combo));
    // Mostrar candidatos y algunos distractores
    let displayWords = candidates.slice(0, ITEMS_PER_ROUND);
    if (displayWords.length < ITEMS_PER_ROUND) {
      // Añadir distractores
      const others = comboWords.filter(entry => !entry.word.toUpperCase().startsWith(combo));
      displayWords = displayWords.concat(others.slice(0, ITEMS_PER_ROUND - displayWords.length));
    }
    // Mezclar
    if (App.utils && App.utils.shuffleArray) displayWords = App.utils.shuffleArray(displayWords);
    displayWords.forEach(entry => {
      const btn = document.createElement('button');
      btn.className = 'cv-word-button';
      btn.textContent = `${entry.emoji ? entry.emoji + ' ' : ''}${entry.word}`;
      btn.dataset.word = entry.word;
      btn.onclick = () => handleWordClick(btn, entry, combo);
      els.wordList.appendChild(btn);
    });
  }

  function handleWordClick(btn, entry, combo) {
    if (entry.word.toUpperCase().startsWith(combo)) {
      btn.classList.add('correct');
      els.feedback.textContent = 'Ona!';
    } else {
      btn.classList.add('incorrect');
      els.feedback.textContent = 'Saiatu berriro!';
    }
    btn.disabled = true;
    // Si todas las correctas están seleccionadas, mostrar botón siguiente
    const correctBtns = Array.from(els.wordList.children).filter(b => b.dataset.word.toUpperCase().startsWith(combo));
    const allSelected = correctBtns.every(b => b.classList.contains('correct'));
    if (allSelected) {
      els.nextBtn.style.display = 'inline-block';
      els.feedback.textContent = 'Zorionak! Hurrengoa.';
    }
  }

  App.consonantVowelGame = { init, start };
})(window);
