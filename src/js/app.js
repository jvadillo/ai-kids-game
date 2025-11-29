// app.js: Orquestador principal. Inicializa módulos y cablea la navegación.

// PWA Install Prompt
let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  showInstallBanner();
});

function showInstallBanner() {
  // Don't show if already installed or dismissed recently
  if (window.matchMedia('(display-mode: standalone)').matches) return;
  if (localStorage.getItem('pwaInstallDismissed')) {
    const dismissedTime = parseInt(localStorage.getItem('pwaInstallDismissed'), 10);
    // Don't show again for 7 days after dismissing
    if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) return;
  }
  
  const banner = document.getElementById('pwa-install-banner');
  if (banner) {
    banner.classList.add('show');
  }
}

function installPWA() {
  const banner = document.getElementById('pwa-install-banner');
  if (banner) banner.classList.remove('show');
  
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('PWA installed');
      }
      deferredPrompt = null;
    });
  }
}

function dismissInstallBanner() {
  const banner = document.getElementById('pwa-install-banner');
  if (banner) banner.classList.remove('show');
  localStorage.setItem('pwaInstallDismissed', Date.now().toString());
}

// Expose functions globally
window.installPWA = installPWA;
window.dismissInstallBanner = dismissInstallBanner;

document.addEventListener('DOMContentLoaded', () => {
  // 1) Inicializar módulos (cacheo DOM, estado y listeners internos)
  window.App = window.App || {};
  if (App.screens && typeof App.screens.init === 'function') App.screens.init();
  if (App.options && typeof App.options.init === 'function') App.options.init();
  if (App.wordGame && typeof App.wordGame.init === 'function') App.wordGame.init();
  if (App.syllableGame && typeof App.syllableGame.init === 'function') App.syllableGame.init();
  if (App.syllableSortGame && typeof App.syllableSortGame.init === 'function') App.syllableSortGame.init();
  if (App.numberGame && typeof App.numberGame.init === 'function') App.numberGame.init();
  if (App.consonantVowelGame && typeof App.consonantVowelGame.init === 'function') App.consonantVowelGame.init();

  // 2) Cableado de navegación y botones
  const gameSelectButtons = document.querySelectorAll('.game-select-button');
  const themeButtonsContainer = document.getElementById('theme-buttons');
  const syllableThemeButtonsContainer = document.getElementById('syllable-theme-buttons');
  const themeBackButton = document.getElementById('theme-back-button');
  const syllableThemeBackButton = document.getElementById('syllable-theme-back-button');
  const wordBackButton = document.getElementById('word-back-button');
  const syllableBackButton = document.getElementById('syllable-back-button');
  const numberBackButton = document.getElementById('number-back-button');

  // Objetivo actual del selector de tema: 'words' o 'syllables'
  let currentThemeTarget = 'words';

  // Selección de juego (palabras / sílabas / números)
  gameSelectButtons.forEach(button => {
    button.addEventListener('click', () => {
      const gameType = button.dataset.game;
      console.log('[app.js] Game button clicked, gameType:', gameType);
      if (gameType === 'words') {
        currentThemeTarget = 'words';
        App.screens.showScreen('wordThemeSelection');
      } else if (gameType === 'syllables') {
        currentThemeTarget = 'syllables';
        App.screens.showScreen('wordThemeSelection');
      } else if (gameType === 'syllableSort') {
        currentThemeTarget = 'syllableSort';
        App.screens.showScreen('wordThemeSelection');
      } else if (gameType === 'emojiSyllableGame') {
        currentThemeTarget = 'emojiSyllableGame';
        App.screens.showScreen('wordThemeSelection');
      } else if (gameType === 'vowelSortGame') {
        if (App.vowelSortGame && typeof App.vowelSortGame.start === 'function') {
          App.vowelSortGame.start();
        }
      } else if (gameType === 'consonantVowelGame') {
        console.log('[app.js] consonantVowelGame button clicked');
        console.log('[app.js] App.consonantVowelGame:', App.consonantVowelGame);
        if (App.consonantVowelGame && typeof App.consonantVowelGame.start === 'function') {
          console.log('[app.js] Calling App.consonantVowelGame.start()');
          App.consonantVowelGame.start();
        } else {
          console.error('[app.js] App.consonantVowelGame.start is not available');
        }
      } else if (gameType === 'vowelGame') {
        if (App.vowelGame && typeof App.vowelGame.start === 'function') {
          App.vowelGame.start();
        }
      } else if (gameType === 'emojiVowelMatchGame') {
        if (App.emojiVowelMatchGame && typeof App.emojiVowelMatchGame.start === 'function') {
          App.emojiVowelMatchGame.start();
        }
      } else if (gameType === 'numbers') {
        App.numberGame.startNumberGame();
      }
    });
  });

  // Selección de tema para el juego de palabras
  if (themeButtonsContainer) {
    themeButtonsContainer.addEventListener('click', (event) => {
      const button = event.target.closest('.theme-button');
      if (!button) return;
      const theme = button.dataset.theme;
      if (currentThemeTarget === 'syllables') {
        App.syllableGame.startSyllableGame(theme);
      } else if (currentThemeTarget === 'syllableSort') {
        App.syllableSortGame.start(theme);
      } else if (currentThemeTarget === 'emojiSyllableGame') {
        App.emojiSyllableGame.startEmojiSyllableGame(theme);
      } else {
        App.wordGame.startWordGame(theme);
      }
    });
  }

  // Selección de tema para el juego de sílabas
  if (syllableThemeButtonsContainer) {
    syllableThemeButtonsContainer.addEventListener('click', (event) => {
      const button = event.target.closest('.theme-button');
      if (button) { App.syllableGame.startSyllableGame(button.dataset.syllableTheme); }
    });
  }

  // Botones de retroceso por pantalla
  if (themeBackButton) themeBackButton.addEventListener('click', () => App.screens.showScreen('gameSelection'));
  if (syllableThemeBackButton) syllableThemeBackButton.addEventListener('click', () => App.screens.showScreen('gameSelection'));
  if (wordBackButton) wordBackButton.addEventListener('click', () => App.screens.showScreen('wordThemeSelection'));
  if (syllableBackButton) syllableBackButton.addEventListener('click', () => App.screens.showScreen('wordThemeSelection'));
  const syllableSortBackButton = document.getElementById('syllable-sort-back-button');
  if (syllableSortBackButton) syllableSortBackButton.addEventListener('click', () => App.screens.showScreen('wordThemeSelection'));
  if (numberBackButton) numberBackButton.addEventListener('click', () => App.screens.showScreen('gameSelection'));

  // Pantalla inicial y aplicación de opciones de estilo
  App.screens.showScreen('gameSelection');
  App.options.applyOptions();
});
