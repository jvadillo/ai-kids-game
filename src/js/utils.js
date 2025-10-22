(function (window) {
  // Módulo utils: funciones auxiliares sin dependencias del DOM
  const App = window.App = window.App || {};

  // Mezcla aleatoriamente los elementos de un array (Fisher-Yates)
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // Devuelve un entero aleatorio entre min y max (incluidos)
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // API pública del módulo
  App.utils = { shuffleArray, getRandomInt };
})(window);
