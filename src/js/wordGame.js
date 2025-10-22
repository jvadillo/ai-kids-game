(function (window) {
  // Módulo wordGame: lógica y estado del juego de palabras (arrastrar y soltar)
  const App = window.App = window.App || {};
  const { shuffleArray } = App.utils || {};

  // Configuración: temas y parámetros del juego
  const wordThemes = {
    animaliak: [ { word: 'katu', emoji: '🐱' }, { word: 'txakur', emoji: '🐶' }, { word: 'arrain', emoji: '🐠' }, { word: 'ahate', emoji: '🦆' }, { word: 'behi', emoji: '🐄' }, { word: 'igel', emoji: '🐸' }, ],
    eskola: [ { word: 'liburu', emoji: '📖' }, { word: 'arkatz', emoji: '✏️' }, { word: 'mahai', emoji: '🪵' }, { word: 'goma', emoji: '🧼' }, { word: 'paper', emoji: '📄' }, ],
    arropa: [ { word: 'txano', emoji: '🧢' }, { word: 'gona', emoji: '👗' }, { word: 'bota', emoji: '👢' }, { word: 'blusa', emoji: '👚' }, { word: 'motz', emoji: '🩳' }, ],
    koloreak: [ { word: 'gorri', emoji: '❤️' }, { word: 'urdin', emoji: '💙' }, { word: 'berde', emoji: '💚' }, { word: 'arrosa', emoji: '🩷' }, { word: 'lila', emoji: '💜' }, ],
    parkea: [ { word: 'zuhaitz', emoji: '🌳' },{ word: 'lore', emoji: '🌸' }, { word: 'banku', emoji: '🪵' }, { word: 'pilota', emoji: '⚽' }, { word: 'hodei', emoji: '☁️' }, ],
    janaria: [ { word: 'madari', emoji: '🍐' }, { word: 'ogi', emoji: '🍞' }, { word: 'mahats', emoji: '🍇' }, { word: 'arrautz', emoji: '🥚' },{ word: 'gazta', emoji: '🧀' }, { word: 'tarta', emoji: '🍰' }, ]
  };

  const WORDS_PER_LEVEL = 3;
  const MAX_DISTRACTORS_CAP = 3;
  const COMPLETION_DELAY_MS = 1200;
  const LEVEL_UP_DELAY_MS = 2000;
  const THEME_COMPLETE_DELAY_MS = 2000;

  // Estado interno del juego de palabras
  let currentWordList = [], currentWordIndex = 0, currentWord = '', currentWordEmoji = '';
  let lettersInBoxes = [], draggedElement = null, ghostElement = null, offsetX = 0, offsetY = 0;
  let currentLevel = 1, wordsCorrectThisLevel = 0;

  // Referencias a elementos del DOM
  let els = {};

  // Cachea elementos necesarios
  function init() {
    els.levelIndicator = document.getElementById('level-indicator');
    els.wordEmojiContainer = document.getElementById('emoji-container');
    els.wordBoxesContainer = document.getElementById('word-boxes-container');
    els.letterPoolContainer = document.getElementById('letter-pool-container');
    els.wordFeedbackMessage = document.getElementById('word-feedback-message');
    els.wordThemeScreen = document.getElementById('word-theme-screen');
  }

  // Genera el pool de letras (incluye distractores según el nivel)
  function generateLetterPool(word, level) {
    const wordLetters = word.toUpperCase().split('');
    let finalPoolLetters = [...wordLetters];
    const numDistractors = Math.min(Math.max(0, level - 1), MAX_DISTRACTORS_CAP);
    if (numDistractors > 0) {
      const alphabet = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';
      let distractors = [];
      let attempts = 0;
      while (distractors.length < numDistractors && attempts < 100) {
        const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
        if (!wordLetters.includes(randomLetter) && !distractors.includes(randomLetter)) {
          distractors.push(randomLetter);
        }
        attempts++;
      }
      finalPoolLetters = finalPoolLetters.concat(distractors);
    }
    return (App.utils || {}).shuffleArray ? App.utils.shuffleArray(finalPoolLetters) : finalPoolLetters;
  }

  // Inicia el juego con un tema seleccionado
  function startWordGame(theme) {
    if (!wordThemes[theme]) {
      console.error('Gai ez da aurkitu:', theme);
      return;
    }
    if (!els.levelIndicator) init();
    currentWordList = (App.utils || {}).shuffleArray ? App.utils.shuffleArray([...wordThemes[theme]]) : [...wordThemes[theme]];
    currentWordIndex = 0;
    currentLevel = 1;
    wordsCorrectThisLevel = 0;
    els.levelIndicator.textContent = `Maila: ${currentLevel}`;
    App.screens.showScreen('wordGame');
    loadWordChallenge();
    addTouchListeners();
  }

  // Vuelve a la selección de temas (opcionalmente mostrando mensaje de fin)
  function showWordThemeScreen(showCompletionMessage = false) {
    App.screens.showScreen('wordThemeSelection');
    els.wordFeedbackMessage.textContent = showCompletionMessage ? 'Gaia osatu duzu! Oso ondo!' : 'Aukeratu gai bat';
    els.wordFeedbackMessage.className = showCompletionMessage ? 'feedback correct' : 'feedback';
    removeTouchListeners();
    if (showCompletionMessage) {
      setTimeout(() => {
        if (els.wordThemeScreen && els.wordThemeScreen.classList.contains('active')) {
          els.wordFeedbackMessage.textContent = 'Aukeratu gai bat';
          els.wordFeedbackMessage.className = 'feedback';
        }
      }, THEME_COMPLETE_DELAY_MS + 1000);
    }
  }

  // Carga un reto (palabra) y construye el tablero
  function loadWordChallenge() {
    if (!currentWordList || currentWordList.length === 0) {
      console.error('Hitz-zerrenda baliogabea edo hutsa.');
      showWordThemeScreen();
      return;
    }

    // Si no quedan palabras, mostrar trofeo y volver al selector
    if (currentWordIndex >= currentWordList.length) {
      els.wordFeedbackMessage.textContent = 'Gaia osatu duzu! Oso ondo! 🎉';
      els.wordFeedbackMessage.className = 'feedback correct';
      els.wordBoxesContainer.innerHTML = '<span style="font-size: 40px;">🏆</span>';
      els.letterPoolContainer.innerHTML = '';
      els.wordEmojiContainer.innerHTML = '';
      els.wordEmojiContainer.style.display = 'none';
      setTimeout(() => { showWordThemeScreen(true); }, THEME_COMPLETE_DELAY_MS);
      return;
    }

    // Preparar estado y UI para la nueva palabra
    const wordData = currentWordList[currentWordIndex];
    currentWord = wordData.word.toUpperCase();
    currentWordEmoji = wordData.emoji;
    lettersInBoxes = Array(currentWord.length).fill(null);

    els.wordEmojiContainer.textContent = currentWordEmoji;
    els.wordEmojiContainer.setAttribute('aria-label', `${wordData.word} hitzarentzako emojia`);
    els.wordEmojiContainer.style.display = 'flex';

    els.wordBoxesContainer.innerHTML = '';
    els.letterPoolContainer.innerHTML = '';
    els.wordFeedbackMessage.textContent = 'Osatu hitza!';
    els.wordFeedbackMessage.className = 'feedback';

    // Crear casillas de destino para cada letra
    for (let i = 0; i < currentWord.length; i++) {
      const box = document.createElement('div');
      box.classList.add('word-box');
      box.dataset.index = i;
      box.addEventListener('dragover', handleDragOver);
      box.addEventListener('dragleave', handleDragLeave);
      box.addEventListener('drop', handleDrop);
      els.wordBoxesContainer.appendChild(box);
    }

    // Crear fichas de letras (con distractores si aplica)
    const pool = generateLetterPool(currentWord, currentLevel);
    pool.forEach(letter => {
      const tile = document.createElement('div');
      tile.classList.add('letter-tile');
      tile.textContent = App.options.formatLetter(letter);
      tile.dataset.letter = letter;
      tile.draggable = true;
      tile.addEventListener('dragstart', handleDragStart);
      tile.addEventListener('dragend', handleDragEnd);
      tile.addEventListener('touchstart', handleTouchStart, { passive: false });
      els.letterPoolContainer.appendChild(tile);
    });

    App.options.applyOptions();
  }

  // Comprueba si la palabra está completa y gestiona subida de nivel
  function checkWordCompletion() {
    if (lettersInBoxes.every(letter => letter !== null)) {
      wordsCorrectThisLevel++;
      els.wordBoxesContainer.childNodes.forEach(box => box.classList.add('filled'));
      let message = '';
      let delay = COMPLETION_DELAY_MS;
      let isLevelUp = false;

      if (wordsCorrectThisLevel >= WORDS_PER_LEVEL && currentWordIndex < currentWordList.length - 1) {
        currentLevel++;
        wordsCorrectThisLevel = 0;
        els.levelIndicator.textContent = `Maila: ${currentLevel}`;
        message = `Zorionak! Hurrengo mailara pasa zara! (${currentLevel}. Maila) 🎉`;
        els.wordFeedbackMessage.className = 'feedback level-up';
        els.wordBoxesContainer.childNodes.forEach(box => box.classList.add('level-up-flash'));
        delay = LEVEL_UP_DELAY_MS;
        isLevelUp = true;
      } else {
        message = `Zuzen! "${currentWord.toLowerCase()}" da! ✅`;
        els.wordFeedbackMessage.className = 'feedback correct';
      }

      els.wordFeedbackMessage.textContent = message;

      setTimeout(() => {
        if (isLevelUp) {
          els.wordBoxesContainer.childNodes.forEach(box => box.classList.remove('level-up-flash'));
        }
        currentWordIndex++;
        loadWordChallenge();
      }, delay);
    }
  }

  // Listeners para soporte táctil (arrastre manual con "fantasma")
  function addTouchListeners() {
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  }

  function removeTouchListeners() {
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  }

  function handleTouchStart(event) {
    if (event.target.classList.contains('letter-tile')) {
      event.preventDefault();
      draggedElement = event.target;
      const touch = event.changedTouches[0];
      const rect = draggedElement.getBoundingClientRect();
      offsetX = touch.clientX - rect.left;
      offsetY = touch.clientY - rect.top;
      createGhostElement(touch);
      draggedElement.classList.add('dragging');
    }
  }

  function handleTouchMove(event) {
    if (!draggedElement || !ghostElement) return;
    event.preventDefault();
    const touch = event.changedTouches[0];
    ghostElement.style.left = `${touch.clientX - offsetX}px`;
    ghostElement.style.top = `${touch.clientY - offsetY}px`;
    ghostElement.style.display = 'none';
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    ghostElement.style.display = '';
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    if (elementBelow && elementBelow.classList.contains('word-box') && !elementBelow.textContent) {
      elementBelow.classList.add('drag-over');
    }
  }

  function handleTouchEnd(event) {
    if (!draggedElement) return;
    const touch = event.changedTouches[0];
    let dropTarget = null;
    if (ghostElement) {
      ghostElement.style.display = 'none';
      dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
      if (document.body.contains(ghostElement)) {
        document.body.removeChild(ghostElement);
      }
      ghostElement = null;
    } else {
      dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
    }
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    if (dropTarget && dropTarget.classList.contains('word-box') && !dropTarget.textContent) {
      const droppedLetter = draggedElement.dataset.letter;
      const boxIndex = parseInt(dropTarget.dataset.index, 10);
      processDrop(droppedLetter, boxIndex, dropTarget);
    } else {
      if (draggedElement) draggedElement.classList.remove('dragging');
    }
    if (ghostElement === null && !(dropTarget && dropTarget.classList.contains('word-box') && !dropTarget.textContent)) {
      draggedElement = null;
    }
  }

  // Crea el "fantasma" de la ficha para arrastre táctil
  function createGhostElement(touch) {
    if (ghostElement && document.body.contains(ghostElement)) {
      document.body.removeChild(ghostElement);
    }
    ghostElement = draggedElement.cloneNode(true);
    ghostElement.classList.add('touch-ghost');
    ghostElement.style.position = 'absolute';
    ghostElement.style.width = `${draggedElement.offsetWidth}px`;
    ghostElement.style.height = `${draggedElement.offsetHeight}px`;
    ghostElement.style.left = `${touch.clientX - offsetX}px`;
    ghostElement.style.top = `${touch.clientY - offsetY}px`;
    document.body.appendChild(ghostElement);
  }

  // Handlers de drag and drop nativo
  function handleDragStart(event) {
    draggedElement = event.target;
    event.dataTransfer.setData('text/plain', event.target.dataset.letter);
    event.dataTransfer.effectAllowed = 'move';
    setTimeout(() => { if (draggedElement) draggedElement.classList.add('dragging'); }, 0);
  }

  function handleDragEnd() {
    if (draggedElement) { draggedElement.classList.remove('dragging'); }
    draggedElement = null;
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
  }

  function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    if (event.target.classList.contains('word-box') && !event.target.textContent) {
      event.target.classList.add('drag-over');
    }
  }

  function handleDragLeave(event) {
    if (event.target.classList.contains('word-box')) {
      event.target.classList.remove('drag-over');
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    if (event.target.classList.contains('drag-over')) {
      event.target.classList.remove('drag-over');
    }
    const targetBox = event.target;
    if (!targetBox.classList.contains('word-box') || targetBox.textContent !== '') {
      return;
    }
    const droppedLetter = event.dataTransfer.getData('text/plain');
    const boxIndex = parseInt(targetBox.dataset.index, 10);
    processDrop(droppedLetter, boxIndex, targetBox);
  }

  // Intenta colocar la letra en la casilla; gestiona feedback y avance
  function processDrop(droppedLetter, boxIndex, targetBox) {
    const originalDraggedElement = draggedElement;
    if (currentWord[boxIndex] === droppedLetter) {
      targetBox.textContent = App.options.formatLetter(droppedLetter);
      lettersInBoxes[boxIndex] = droppedLetter;
      targetBox.classList.add('correct-flash');
      setTimeout(() => targetBox.classList.remove('correct-flash'), 500);
      if (originalDraggedElement && els.letterPoolContainer.contains(originalDraggedElement)) {
        els.letterPoolContainer.removeChild(originalDraggedElement);
      }
      if (draggedElement === originalDraggedElement) {
        draggedElement = null;
      }
      checkWordCompletion();
    } else {
      targetBox.classList.add('incorrect-flash');
      setTimeout(() => targetBox.classList.remove('incorrect-flash'), 500);
      if (originalDraggedElement) originalDraggedElement.classList.remove('dragging');
      if (draggedElement === originalDraggedElement) {
        draggedElement = null;
      }
    }
  }

  // API pública del módulo
  App.wordGame = {
    init,
    startWordGame,
    showWordThemeScreen
  };
})(window);
