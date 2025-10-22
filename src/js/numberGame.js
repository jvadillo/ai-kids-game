(function (window) {
  // Módulo numberGame: juego de contar emojis y seleccionar el número correcto
  const App = window.App = window.App || {};

  // Configuración
  const NUMBER_CORRECT_DELAY_MS = 1000;
  const numberGameEmojis = ['🍎', '⚽', '🧸', '⭐', '🚗', '🎈', '🎁', '🐶', '🐱', '🚀', '🍓', '🦋', '🌻', '🍦', '🎸'];

  // Estado
  let currentNumberCorrect = 0, currentNumberEmoji = '';
  let numberGameActive = false;

  // Referencias a elementos del DOM
  let els = {};

  // Cachea elementos del DOM necesarios para el juego
  function init() {
    els.numberGameScreen = document.getElementById('number-game-screen');
    els.numberEmojiDisplay = document.getElementById('number-emoji-display');
    els.numberButtonsContainer = document.getElementById('number-buttons-container');
    els.numberFeedbackMessage = document.getElementById('number-feedback-message');
  }

  // Muestra la pantalla del juego y arranca un nuevo reto
  function startNumberGame() {
    App.screens.showScreen('numberGame');
    loadNumberChallenge();
  }

  // Genera un desafío: cantidad aleatoria de emojis y botones del 1 al 10
  function loadNumberChallenge() {
    numberGameActive = true; // bloquear entradas hasta que se configure todo
    currentNumberCorrect = App.utils.getRandomInt(1, 10);
    currentNumberEmoji = numberGameEmojis[App.utils.getRandomInt(0, numberGameEmojis.length - 1)];

    // Pinta los emojis que el niño debe contar
    els.numberEmojiDisplay.innerHTML = '';
    for (let i = 0; i < currentNumberCorrect; i++) {
      const emojiSpan = document.createElement('span');
      emojiSpan.textContent = currentNumberEmoji;
      els.numberEmojiDisplay.appendChild(emojiSpan);
    }

    // Crea los botones de elección del 1 al 10
    els.numberButtonsContainer.innerHTML = '';
    for (let i = 1; i <= 10; i++) {
      const button = document.createElement('button');
      button.classList.add('number-button');
      button.textContent = i;
      button.dataset.number = i;
      button.addEventListener('click', handleNumberSelection);
      els.numberButtonsContainer.appendChild(button);
    }

    // Mensaje inicial y estilos por defecto
    els.numberFeedbackMessage.textContent = 'Aukeratu zenbaki zuzena!';
    els.numberFeedbackMessage.className = 'feedback';

    // Pequeño retardo para evitar clics durante la construcción del reto
    setTimeout(() => { numberGameActive = false; }, 200);
    App.options.applyOptions();
  }

  // Gestiona la selección del número y proporciona feedback visual
  function handleNumberSelection(event) {
    if (numberGameActive) return; // evita múltiples clics mientras se resuelve feedback
    numberGameActive = true;
    const selectedButton = event.target.closest('.number-button');
    if (!selectedButton) { numberGameActive = false; return; }
    const selectedNumber = parseInt(selectedButton.dataset.number, 10);

    if (selectedNumber === currentNumberCorrect) {
      // Respuesta correcta: feedback positivo y siguiente reto tras un breve delay
      els.numberFeedbackMessage.textContent = 'Zuzen! ✅';
      els.numberFeedbackMessage.className = 'feedback correct';
      selectedButton.classList.add('correct-flash');
      els.numberButtonsContainer.querySelectorAll('.number-button').forEach(btn => btn.disabled = true);
      setTimeout(() => {
        selectedButton.classList.remove('correct-flash');
        loadNumberChallenge();
      }, NUMBER_CORRECT_DELAY_MS);
    } else {
      // Respuesta incorrecta: vibración de pantalla y reintento
      els.numberFeedbackMessage.textContent = 'Saiatu berriro! 🤔';
      els.numberFeedbackMessage.className = 'feedback incorrect';
      selectedButton.classList.add('incorrect-flash');
      els.numberGameScreen.style.animation = 'shake 0.3s ease-in-out';
      setTimeout(() => {
        selectedButton.classList.remove('incorrect-flash');
        els.numberGameScreen.style.animation = '';
        els.numberFeedbackMessage.textContent = 'Aukeratu zenbaki zuzena!';
        els.numberFeedbackMessage.className = 'feedback';
        numberGameActive = false;
      }, 800);
    }
  }

  // API pública del módulo
  App.numberGame = { init, startNumberGame };
})(window);
