(function (window) {
  // Módulo screens: gestiona qué pantalla se muestra
  const App = window.App = window.App || {};

  let els = {};

  // Cachea referencias a contenedores de pantallas
  function init() {
    els.gameSelection = document.getElementById('game-selection-screen');
    els.wordTheme = document.getElementById('word-theme-screen');
    els.syllableTheme = document.getElementById('syllable-theme-screen');
    els.wordGame = document.getElementById('word-game-screen');
    els.syllableGame = document.getElementById('syllable-game-screen');
    els.syllableSortGame = document.getElementById('syllable-sort-game-screen');
    els.vowelSortGame = document.getElementById('vowel-sort-game-screen');
    els.vowelGame = document.getElementById('vowel-game-screen');
    els.numberGame = document.getElementById('number-game-screen');
    els.consonantVowelSelect = document.getElementById('consonant-vowel-select-screen');
    els.consonantVowelGame = document.getElementById('consonant-vowel-game-screen');
    els.emojiVowelMatchGame = document.getElementById('emoji-vowel-match-screen');
  }

  // Muestra una pantalla y oculta el resto; reaplica opciones de estilo
  function showScreen(screenToShow) {
    if (!els.gameSelection) init();

    // Ocultar todas las pantallas con clase 'screen'
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
    });

    // Ocultar UIs de juego que no usan clase 'screen'
    if (els.wordGame) els.wordGame.style.display = 'none';
    if (els.syllableGame) els.syllableGame.style.display = 'none';
    if (els.numberGame) els.numberGame.style.display = 'none';
    if (els.syllableSortGame) els.syllableSortGame.style.display = 'none';

    // Mostrar la solicitada
    if (screenToShow === 'gameSelection') {
      els.gameSelection.classList.add('active');
    } else if (screenToShow === 'wordThemeSelection') {
      els.wordTheme.classList.add('active');
    } else if (screenToShow === 'syllableThemeSelection') {
      els.syllableTheme.classList.add('active');
    } else if (screenToShow === 'wordGame') {
      if (els.wordGame) els.wordGame.style.display = 'flex';
    } else if (screenToShow === 'syllableGame') {
      if (els.syllableGame) els.syllableGame.style.display = 'flex';
    } else if (screenToShow === 'syllableSortGame') {
      if (els.syllableSortGame) els.syllableSortGame.style.display = 'flex';
    } else if (screenToShow === 'vowelSortGame') {
      if (els.vowelSortGame) els.vowelSortGame.classList.add('active');
    } else if (screenToShow === 'vowelGame') {
      if (els.vowelGame) els.vowelGame.classList.add('active');
    } else if (screenToShow === 'numberGame') {
      if (els.numberGame) els.numberGame.style.display = 'flex';
    } else if (screenToShow === 'consonantVowelSelect') {
      console.log('[screens] Showing consonantVowelSelect, element:', els.consonantVowelSelect);
      if (els.consonantVowelSelect) els.consonantVowelSelect.classList.add('active');
    } else if (screenToShow === 'consonantVowelGame') {
      console.log('[screens] Showing consonantVowelGame, element:', els.consonantVowelGame);
      if (els.consonantVowelGame) els.consonantVowelGame.classList.add('active');
    } else if (screenToShow === 'emojiVowelMatch') {
      if (els.emojiVowelMatchGame) els.emojiVowelMatchGame.classList.add('active');
    }

    // Reaplicar estilo (tipo de letra, mayúsculas/minúsculas)
    if (App.options && typeof App.options.applyOptions === 'function') {
      App.options.applyOptions();
    }
  }

  // API pública del módulo
  App.screens = { init, showScreen };
})(window);
