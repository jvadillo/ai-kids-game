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
  els.vowelGame = document.getElementById('vowel-game-screen');
  els.numberGame = document.getElementById('number-game-screen');
  }

  // Muestra una pantalla y oculta el resto; reaplica opciones de estilo
  function showScreen(screenToShow) {
    if (!els.gameSelection) init();

    // Ocultar pantallas principales
    els.gameSelection.classList.remove('active');
    els.wordTheme.classList.remove('active');
    els.syllableTheme.classList.remove('active');

    // Ocultar UIs de juego
    els.wordGame.style.display = 'none';
    els.syllableGame.style.display = 'none';
  els.numberGame.style.display = 'none';
  if (els.syllableSortGame) els.syllableSortGame.style.display = 'none';

    // Mostrar la solicitada
    if (screenToShow === 'gameSelection') {
      els.gameSelection.classList.add('active');
    } else if (screenToShow === 'wordThemeSelection') {
      els.wordTheme.classList.add('active');
    } else if (screenToShow === 'syllableThemeSelection') {
      els.syllableTheme.classList.add('active');
    } else if (screenToShow === 'wordGame') {
      els.wordGame.style.display = 'flex';
    } else if (screenToShow === 'syllableGame') {
      els.syllableGame.style.display = 'flex';
    } else if (screenToShow === 'syllableSortGame') {
      if (els.syllableSortGame) els.syllableSortGame.style.display = 'flex';
    } else if (screenToShow === 'vowelGame') {
      if (els.vowelGame) els.vowelGame.style.display = 'flex';
    } else if (screenToShow === 'numberGame') {
      els.numberGame.style.display = 'flex';
    }
    // Ocultar pantalla de Vokalak si no está activa
    if (screenToShow !== 'vowelGame' && els.vowelGame) {
      els.vowelGame.style.display = 'none';
    }

    // Reaplicar estilo (tipo de letra, mayúsculas/minúsculas)
    if (App.options && typeof App.options.applyOptions === 'function') {
      App.options.applyOptions();
    }
  }

  // API pública del módulo
  App.screens = { init, showScreen };
})(window);
