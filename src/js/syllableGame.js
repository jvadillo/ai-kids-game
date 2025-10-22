(function (window) {
  // Módulo syllableGame: juego de contar sílabas con emojis y aplausos
  const App = window.App = window.App || {};
  const { shuffleArray, getRandomInt } = App.utils || {};

  // Configuración: temas compartidos con wordGame (mismas palabras)
  const syllableThemes = {
    animaliak: [
      { word: 'katu', emoji: '🐱', syllables: 2, syllableParts: ['KA','TU'] },
      { word: 'txakur', emoji: '🐶', syllables: 2, syllableParts: ['TXA','KUR'] },
      { word: 'arrain', emoji: '🐠', syllables: 2, syllableParts: ['AR','RAIN'] },
      { word: 'ahate', emoji: '🦆', syllables: 3, syllableParts: ['A','HA','TE'] },
      { word: 'behi', emoji: '🐄', syllables: 2, syllableParts: ['BE','HI'] },
      { word: 'igel', emoji: '🐸', syllables: 2, syllableParts: ['I','GEL'] }
    ],
    eskola: [
      { word: 'liburu', emoji: '📖', syllables: 3, syllableParts: ['LI','BU','RU'] },
      { word: 'arkatz', emoji: '✏️', syllables: 2, syllableParts: ['AR','KATZ'] },
      { word: 'mahai', emoji: '🪵', syllables: 2, syllableParts: ['MA','HAI'] },
      { word: 'goma', emoji: '🧼', syllables: 2, syllableParts: ['GO','MA'] },
      { word: 'paper', emoji: '📄', syllables: 2, syllableParts: ['PA','PER'] }
    ],
    arropa: [
      { word: 'txano', emoji: '🧢', syllables: 2, syllableParts: ['TXA','NO'] },
      { word: 'gona', emoji: '👗', syllables: 2, syllableParts: ['GO','NA'] },
      { word: 'bota', emoji: '👢', syllables: 2, syllableParts: ['BO','TA'] },
      { word: 'blusa', emoji: '👚', syllables: 2, syllableParts: ['BLU','SA'] },
      { word: 'motz', emoji: '🩳', syllables: 1, syllableParts: ['MOTZ'] }
    ],
    koloreak: [
      { word: 'gorri', emoji: '❤️', syllables: 2, syllableParts: ['GOR','RI'] },
      { word: 'urdin', emoji: '💙', syllables: 2, syllableParts: ['UR','DIN'] },
      { word: 'berde', emoji: '💚', syllables: 2, syllableParts: ['BER','DE'] },
      { word: 'arrosa', emoji: '🩷', syllables: 3, syllableParts: ['AR','RO','SA'] },
      { word: 'lila', emoji: '💜', syllables: 2, syllableParts: ['LI','LA'] }
    ],
    parkea: [
      { word: 'zuhaitz', emoji: '🌳', syllables: 2, syllableParts: ['ZU','HAITZ'] },
      { word: 'lore', emoji: '🌸', syllables: 2, syllableParts: ['LO','RE'] },
      { word: 'banku', emoji: '🪵', syllables: 2, syllableParts: ['BAN','KU'] },
      { word: 'pilota', emoji: '⚽', syllables: 3, syllableParts: ['PI','LO','TA'] },
      { word: 'hodei', emoji: '☁️', syllables: 2, syllableParts: ['HO','DEI'] }
    ],
    janaria: [
      { word: 'madari', emoji: '🍐', syllables: 3, syllableParts: ['MA','DA','RI'] },
      { word: 'ogi', emoji: '🍞', syllables: 2, syllableParts: ['O','GI'] },
      { word: 'mahats', emoji: '🍇', syllables: 2, syllableParts: ['MA','HATS'] },
      { word: 'arrautz', emoji: '🥚', syllables: 2, syllableParts: ['AR','RAUTZ'] },
      { word: 'gazta', emoji: '🧀', syllables: 2, syllableParts: ['GAZ','TA'] },
      { word: 'tarta', emoji: '🍰', syllables: 2, syllableParts: ['TAR','TA'] }
    ]
  };

  const WORDS_PER_LEVEL = 3;
  const CORRECT_DELAY_MS = 1500;
  const LEVEL_UP_DELAY_MS = 2000;
  const THEME_COMPLETE_DELAY_MS = 2000;
    const MAX_SYLLABLES = 4; // botones del 1 al 4

  // Estado interno del juego
  let currentSyllableList = [];
  let currentSyllableIndex = 0;
  let currentSyllableWord = null;
  let currentLevel = 1;
  let wordsCorrectThisLevel = 0;
  let syllableGameActive = false;

  // Referencias a elementos del DOM
  let els = {};

  // Divide una palabra en N trozos aproximados para simular sílabas (solo ayuda visual)
  function segmentWordByCount(word, parts) {
    const clean = (word || '').toString();
    if (parts <= 1 || parts >= clean.length) return [clean];
    const base = Math.floor(clean.length / parts);
    let remainder = clean.length % parts;
    const segments = [];
    let idx = 0;
    for (let i = 0; i < parts; i++) {
      const len = base + (remainder > 0 ? 1 : 0);
      segments.push(clean.slice(idx, idx + len));
      idx += len;
      if (remainder > 0) remainder--;
    }
    return segments;
  }

  // Cachea elementos necesarios
  function init() {
    els.syllableLevelIndicator = document.getElementById('syllable-level-indicator');
    els.syllableEmojiDisplay = document.getElementById('syllable-emoji-display');
      els.syllableWordName = document.getElementById('syllable-word-name');
    els.syllableButtonsContainer = document.getElementById('syllable-buttons-container');
    els.syllableFeedbackMessage = document.getElementById('syllable-feedback-message');
    els.syllableThemeScreen = document.getElementById('syllable-theme-screen');
  }

  // Inicia el juego con un tema seleccionado
  function startSyllableGame(theme) {
    if (!syllableThemes[theme]) {
      console.error('Gai ez da aurkitu:', theme);
      return;
    }
    if (!els.syllableLevelIndicator) init();

    currentSyllableList = (App.utils || {}).shuffleArray
      ? App.utils.shuffleArray([...syllableThemes[theme]])
      : [...syllableThemes[theme]];
    currentSyllableIndex = 0;
    currentLevel = 1;
    wordsCorrectThisLevel = 0;
    els.syllableLevelIndicator.textContent = `Maila: ${currentLevel}`;
    App.screens.showScreen('syllableGame');
    loadSyllableChallenge();
  }

  // Vuelve a la selección de temas
  function showSyllableThemeScreen(showCompletionMessage = false) {
    // Reutilizar la misma pantalla de selección de temas que wordGame
    App.screens.showScreen('wordThemeSelection');
    els.syllableFeedbackMessage.textContent = showCompletionMessage
      ? 'Gaia osatu duzu! Oso ondo!'
      : 'Aukeratu gai bat';
    els.syllableFeedbackMessage.className = showCompletionMessage ? 'feedback correct' : 'feedback';
    if (showCompletionMessage) {
      setTimeout(() => {
        // Si seguimos en la pantalla de selección, limpiar el mensaje
        if (document.getElementById('word-theme-screen')?.classList.contains('active')) {
          els.syllableFeedbackMessage.textContent = 'Aukeratu gai bat';
          els.syllableFeedbackMessage.className = 'feedback';
        }
      }, THEME_COMPLETE_DELAY_MS + 1000);
    }
  }

  // Carga un reto (palabra) y construye los botones de aplausos
  function loadSyllableChallenge() {
    if (!currentSyllableList || currentSyllableList.length === 0) {
      console.error('Hitz-zerrenda baliogabea edo hutsa.');
      showSyllableThemeScreen();
      return;
    }

    // Si no quedan palabras, mostrar trofeo y volver al selector
    if (currentSyllableIndex >= currentSyllableList.length) {
      els.syllableFeedbackMessage.textContent = 'Gaia osatu duzu! Oso ondo! 🎉';
      els.syllableFeedbackMessage.className = 'feedback correct';
      els.syllableEmojiDisplay.innerHTML = '<span style="font-size: 80px;">🏆</span>';
        els.syllableWordName.textContent = '';
      els.syllableButtonsContainer.innerHTML = '';
      setTimeout(() => {
        showSyllableThemeScreen(true);
      }, THEME_COMPLETE_DELAY_MS);
      return;
    }

    syllableGameActive = true; // bloquear clics hasta que se cargue todo

    // Obtener palabra actual
    currentSyllableWord = currentSyllableList[currentSyllableIndex];

    // Mostrar emoji
    els.syllableEmojiDisplay.innerHTML = `<span style="font-size: 80px;">${currentSyllableWord.emoji}</span>`;
    els.syllableEmojiDisplay.setAttribute('aria-label', `${currentSyllableWord.word} hitzarentzako emojia`);

      // Mostrar nombre de la palabra; en nivel 1 subrayar "sílabas" (segmentos visuales)
      const displayText = currentSyllableWord.word.toUpperCase();
      if (currentLevel === 1) {
        const parts = (currentSyllableWord.syllableParts && currentSyllableWord.syllableParts.length)
          ? currentSyllableWord.syllableParts.map(p => p.toUpperCase())
          : segmentWordByCount(displayText, currentSyllableWord.syllables);
        els.syllableWordName.innerHTML = parts
          .map(s => `<span class=\"syllable-chunk\">${s}</span>`) 
          .join('');
      } else {
        els.syllableWordName.textContent = displayText;
      }

      // Limpiar y crear botones de aplausos (1 a 4 sílabas)
    els.syllableButtonsContainer.innerHTML = '';
    for (let i = 1; i <= MAX_SYLLABLES; i++) {
      const button = document.createElement('button');
      button.classList.add('syllable-button');
      button.dataset.syllables = i;
      button.setAttribute('aria-label', `${i} silaba`);
      
      // Crear aplausos visuales dentro del botón
      const clapsContainer = document.createElement('div');
      clapsContainer.classList.add('claps-container');
      for (let j = 0; j < i; j++) {
        const clap = document.createElement('span');
        clap.classList.add('clap-emoji');
        clap.textContent = '👏';
        clapsContainer.appendChild(clap);
      }
      button.appendChild(clapsContainer);

      // Número debajo de los aplausos
      const numberLabel = document.createElement('div');
      numberLabel.classList.add('syllable-number');
      numberLabel.textContent = i;
      button.appendChild(numberLabel);

      button.addEventListener('click', handleSyllableSelection);
      els.syllableButtonsContainer.appendChild(button);
    }

    els.syllableFeedbackMessage.textContent = 'Zenbat silaba ditu?';
    els.syllableFeedbackMessage.className = 'feedback';

    // Pequeño delay para evitar clics durante construcción
    setTimeout(() => {
      syllableGameActive = false;
    }, 200);

    App.options.applyOptions();
  }

  // Gestiona la selección de sílabas y proporciona feedback
  function handleSyllableSelection(event) {
    if (syllableGameActive) return;
    syllableGameActive = true;

    const selectedButton = event.target.closest('.syllable-button');
    if (!selectedButton) {
      syllableGameActive = false;
      return;
    }

    const selectedSyllables = parseInt(selectedButton.dataset.syllables, 10);
    const correctSyllables = (currentSyllableWord.syllableParts && currentSyllableWord.syllableParts.length)
      ? currentSyllableWord.syllableParts.length
      : currentSyllableWord.syllables;

    if (selectedSyllables === correctSyllables) {
      // Respuesta correcta
      wordsCorrectThisLevel++;
      selectedButton.classList.add('correct-flash');
      
      let message = '';
      let delay = CORRECT_DELAY_MS;
      let isLevelUp = false;

      // Comprobar subida de nivel
      if (
        wordsCorrectThisLevel >= WORDS_PER_LEVEL &&
        currentSyllableIndex < currentSyllableList.length - 1
      ) {
        currentLevel++;
        wordsCorrectThisLevel = 0;
        els.syllableLevelIndicator.textContent = `Maila: ${currentLevel}`;
        message = `Zorionak! Hurrengo mailara pasa zara! (${currentLevel}. Maila) 🎉`;
        els.syllableFeedbackMessage.className = 'feedback level-up';
        delay = LEVEL_UP_DELAY_MS;
        isLevelUp = true;
      } else {
        message = `Zuzen! "${currentSyllableWord.word}" ${correctSyllables} silaba ditu! ✅`;
        els.syllableFeedbackMessage.className = 'feedback correct';
      }

      els.syllableFeedbackMessage.textContent = message;

      // Deshabilitar botones
      els.syllableButtonsContainer.querySelectorAll('.syllable-button').forEach(btn => {
        btn.disabled = true;
      });

      setTimeout(() => {
        selectedButton.classList.remove('correct-flash');
        currentSyllableIndex++;
        loadSyllableChallenge();
      }, delay);
    } else {
      // Respuesta incorrecta
      els.syllableFeedbackMessage.textContent = 'Saiatu berriro! 🤔';
      els.syllableFeedbackMessage.className = 'feedback incorrect';
      selectedButton.classList.add('incorrect-flash');

      setTimeout(() => {
        selectedButton.classList.remove('incorrect-flash');
        els.syllableFeedbackMessage.textContent = 'Zenbat silaba ditu?';
        els.syllableFeedbackMessage.className = 'feedback';
        syllableGameActive = false;
      }, 800);
    }
  }

  // API pública del módulo
  App.syllableGame = {
    init,
    startSyllableGame,
    showSyllableThemeScreen,
    __getThemes: () => syllableThemes // acceso de solo lectura para otros módulos
  };
})(window);
