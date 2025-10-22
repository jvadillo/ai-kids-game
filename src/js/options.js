(function (window) {
  // Módulo options: gestiona el estado de opciones (letra/estilo) y el modal
  const App = window.App = window.App || {};

  // Estado de opciones seleccionado por el usuario
  let state = {
    letterCaseOption: 'upper',
    fontStyleOption: 'normal'
  };

  // Referencias a elementos del DOM usados por el modal y controles
  let els = {
    body: null,
    optionsModal: null,
    modalCloseButton: null,
    fontStyleSelect: null,
    letterCaseRadios: [],
    optionsButton: null
  };

  // Inicializa el módulo y sus listeners de UI
  function init() {
    els.body = document.body;
    els.optionsModal = document.getElementById('options-modal');
    els.modalCloseButton = document.getElementById('modal-close-button');
    els.fontStyleSelect = document.getElementById('font-style-select');
    els.letterCaseRadios = Array.from(document.querySelectorAll('input[name="letterCase"]'));
    els.optionsButton = document.getElementById('options-button');

    // Abrir/cerrar modal
    if (els.optionsButton) {
      els.optionsButton.addEventListener('click', openOptionsModal);
    }
    if (els.modalCloseButton) {
      els.modalCloseButton.addEventListener('click', closeOptionsModal);
    }
    if (els.optionsModal) {
      els.optionsModal.addEventListener('click', (event) => {
        if (event.target === els.optionsModal) closeOptionsModal();
      });
    }

    // Cambios de select/radio aplican las opciones inmediatamente
    if (els.fontStyleSelect) {
      els.fontStyleSelect.addEventListener('change', (event) => {
        state.fontStyleOption = event.target.value;
        applyOptions();
      });
    }
    els.letterCaseRadios.forEach(radio => {
      radio.addEventListener('change', (event) => {
        if (event.target.checked) {
          state.letterCaseOption = event.target.value;
          applyOptions();
        }
      });
    });
  }

  // Abre el modal de opciones
  function openOptionsModal() {
    if (els.optionsModal) els.optionsModal.style.display = 'flex';
  }

  // Cierra el modal de opciones
  function closeOptionsModal() {
    if (els.optionsModal) els.optionsModal.style.display = 'none';
  }

  // Aplica el estilo seleccionado (tipo de letra y mayúsculas/minúsculas)
  function applyOptions() {
    if (!els.body) els.body = document.body;
    els.body.classList.toggle('font-child', state.fontStyleOption === 'child');
    document.querySelectorAll('.letter-tile, .word-box').forEach(el => {
      if (el.dataset.letter) {
        el.textContent = formatLetter(el.dataset.letter);
      }
    });
  }

  // Da formato a una letra según la opción activa
  function formatLetter(letter) {
    if (!letter) return '';
    return state.letterCaseOption === 'lower' ? letter.toLowerCase() : letter.toUpperCase();
  }

  // API pública del módulo
  App.options = {
    init,
    applyOptions,
    formatLetter,
    getState: () => ({ ...state })
  };
})(window);
