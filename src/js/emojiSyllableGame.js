// emojiSyllableGame.js
// Juego: Completa la palabra arrastrando sílabas según el emoji mostrado
// Estructura similar a consonantVowelGame.js


 (function(window) {
    // Juego de sílabas con emojis: arrastrar sílabas para formar la palabra
    const App = window.App = window.App || {};
    const { shuffleArray } = App.utils || {};

    // Variables globales para drag & drop táctil
    let draggedElement = null, ghostElement = null, offsetX = 0, offsetY = 0;

    // Temas y palabras (ejemplo, se puede ampliar)
    const emojiSyllableThemes = {
        animaliak: [
            { word: 'katu', emoji: '🐱', syllables: ['KA','TU'] },
            { word: 'txakur', emoji: '🐶', syllables: ['TXA','KUR'] },
            { word: 'arrain', emoji: '🐠', syllables: ['AR','RAIN'] },
            { word: 'ahate', emoji: '🦆', syllables: ['A','HA','TE'] },
            { word: 'behi', emoji: '🐄', syllables: ['BE','HI'] },
            { word: 'igel', emoji: '🐸', syllables: ['I','GEL'] }
        ],
        eskola: [
            { word: 'liburu', emoji: '📖', syllables: ['LI','BU','RU'] },
            { word: 'arkatz', emoji: '✏️', syllables: ['AR','KATZ'] },
            { word: 'mahai', emoji: '🪵', syllables: ['MA','HAI'] },
            { word: 'goma', emoji: '🧼', syllables: ['GO','MA'] },
            { word: 'paper', emoji: '📄', syllables: ['PA','PER'] }
        ],
        arropa: [
            { word: 'txano', emoji: '🧢', syllables: ['TXA','NO'] },
            { word: 'gona', emoji: '👗', syllables: ['GO','NA'] },
            { word: 'bota', emoji: '👢', syllables: ['BO','TA'] },
            { word: 'blusa', emoji: '👚', syllables: ['BLU','SA'] },
            { word: 'motz', emoji: '🩳', syllables: ['MOTZ'] }
        ],
        koloreak: [
            { word: 'gorri', emoji: '❤️', syllables: ['GOR','RI'] },
            { word: 'urdin', emoji: '💙', syllables: ['UR','DIN'] },
            { word: 'berde', emoji: '💚', syllables: ['BER','DE'] },
            { word: 'arrosa', emoji: '🩷', syllables: ['AR','RO','SA'] },
            { word: 'lila', emoji: '💜', syllables: ['LI','LA'] }
        ],
        parkea: [
            { word: 'zuhaitz', emoji: '🌳', syllables: ['ZU','HAITZ'] },
            { word: 'lore', emoji: '🌸', syllables: ['LO','RE'] },
            { word: 'banku', emoji: '🪵', syllables: ['BAN','KU'] },
            { word: 'pilota', emoji: '⚽', syllables: ['PI','LO','TA'] },
            { word: 'hodei', emoji: '☁️', syllables: ['HO','DEI'] }
        ],
        janaria: [
            { word: 'madari', emoji: '🍐', syllables: ['MA','DA','RI'] },
            { word: 'ogi', emoji: '🍞', syllables: ['O','GI'] },
            { word: 'mahats', emoji: '🍇', syllables: ['MA','HATS'] },
            { word: 'arrautz', emoji: '🥚', syllables: ['AR','RAUTZ'] },
            { word: 'gazta', emoji: '🧀', syllables: ['GAZ','TA'] },
            { word: 'tarta', emoji: '🍰', syllables: ['TAR','TA'] }
        ]
    };

    const WORDS_PER_LEVEL = 3;
    const LEVEL_UP_DELAY_MS = 2000;
    const THEME_COMPLETE_DELAY_MS = 2000;

    let currentWordList = [], currentWordIndex = 0, currentLevel = 1, wordsCorrectThisLevel = 0;
    let els = {};

    function init() {
        els.emojiContainer = document.getElementById('emoji-container');
        els.wordBoxesContainer = document.getElementById('word-boxes-container');
        els.letterPoolContainer = document.getElementById('letter-pool-container');
        els.wordFeedbackMessage = document.getElementById('word-feedback-message');
        els.wordThemeScreen = document.getElementById('word-theme-screen');
        els.levelIndicator = document.getElementById('level-indicator');
    }

    function startEmojiSyllableGame(theme) {
        init(); // Siempre cachear elementos antes de usar
        if (!emojiSyllableThemes[theme]) {
            console.error('Gai ez da aurkitu:', theme);
            return;
        }
        currentWordList = shuffleArray ? shuffleArray([...emojiSyllableThemes[theme]]) : [...emojiSyllableThemes[theme]];
        currentWordIndex = 0;
        currentLevel = 1;
        wordsCorrectThisLevel = 0;
        els.levelIndicator.textContent = `Maila: ${currentLevel}`;
        App.screens.showScreen('wordGame');
        loadEmojiSyllableChallenge();
        addTouchListeners();
    }

    function showEmojiSyllableThemeScreen(showCompletionMessage = false) {
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

    function loadEmojiSyllableChallenge() {
        if (!currentWordList || currentWordList.length === 0) {
            console.error('Hitz-zerrenda baliogabea edo hutsa.');
            showEmojiSyllableThemeScreen();
            return;
        }
        if (currentWordIndex >= currentWordList.length) {
            els.wordFeedbackMessage.textContent = 'Gaia osatu duzu! Oso ondo! 🎉';
            els.wordFeedbackMessage.className = 'feedback correct';
            els.wordBoxesContainer.innerHTML = '<span style="font-size: 40px;">🏆</span>';
            els.letterPoolContainer.innerHTML = '';
            els.emojiContainer.innerHTML = '';
            els.emojiContainer.style.display = 'none';
            setTimeout(() => { showEmojiSyllableThemeScreen(true); }, THEME_COMPLETE_DELAY_MS);
            return;
        }

        const wordData = currentWordList[currentWordIndex];
        const syllables = shuffleArray ? shuffleArray([...wordData.syllables]) : [...wordData.syllables];
        els.emojiContainer.textContent = wordData.emoji;
        els.emojiContainer.setAttribute('aria-label', `${wordData.word} hitzarentzako emojia`);
        els.emojiContainer.style.display = 'flex';

        els.wordBoxesContainer.innerHTML = '';
        els.letterPoolContainer.innerHTML = '';
        els.wordFeedbackMessage.textContent = 'Osatu hitza silabekin!';
        els.wordFeedbackMessage.className = 'feedback';

        // Reiniciar el array de sílabas en cajas
        syllablesInBoxes = Array(wordData.syllables.length).fill(null);

        // Crear casillas de destino para cada sílaba
        for (let i = 0; i < wordData.syllables.length; i++) {
            const box = document.createElement('div');
            box.classList.add('word-box');
            box.dataset.index = i;
            box.addEventListener('dragover', handleDragOver);
            box.addEventListener('dragleave', handleDragLeave);
            box.addEventListener('drop', handleDrop);
            els.wordBoxesContainer.appendChild(box);
        }

        // Crear fichas de sílabas desordenadas
        syllables.forEach(syllable => {
            const tile = document.createElement('div');
            tile.classList.add('letter-tile');
            tile.textContent = syllable;
            tile.dataset.syllable = syllable;
            tile.draggable = true;
            tile.addEventListener('dragstart', handleDragStart);
            tile.addEventListener('dragend', handleDragEnd);
            tile.addEventListener('touchstart', handleTouchStart, { passive: false });
            els.letterPoolContainer.appendChild(tile);
        });

        App.options.applyOptions();
    }

    // Listeners para soporte táctil (igual que wordGame)
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
            const droppedSyllable = draggedElement.dataset.syllable;
            const boxIndex = parseInt(dropTarget.dataset.index, 10);
            processDrop(droppedSyllable, boxIndex, dropTarget);
        } else {
            if (draggedElement) draggedElement.classList.remove('dragging');
        }
        if (ghostElement === null && !(dropTarget && dropTarget.classList.contains('word-box') && !dropTarget.textContent)) {
            draggedElement = null;
        }
    }

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

    // Drag and drop handlers
    function handleDragStart(event) {
        draggedElement = event.target;
        event.dataTransfer.setData('text/plain', event.target.dataset.syllable);
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
        const droppedSyllable = event.dataTransfer.getData('text/plain');
        const boxIndex = parseInt(targetBox.dataset.index, 10);
        processDrop(droppedSyllable, boxIndex, targetBox);
    }

    // Lógica para comprobar si la palabra está completa
    let syllablesInBoxes = [];
    function processDrop(droppedSyllable, boxIndex, targetBox) {
        const wordData = currentWordList[currentWordIndex];
        if (!syllablesInBoxes.length) syllablesInBoxes = Array(wordData.syllables.length).fill(null);
        if (wordData.syllables[boxIndex] === droppedSyllable) {
            targetBox.textContent = droppedSyllable;
            syllablesInBoxes[boxIndex] = droppedSyllable;
            targetBox.classList.add('correct-flash');
            setTimeout(() => targetBox.classList.remove('correct-flash'), 500);
            if (draggedElement && els.letterPoolContainer.contains(draggedElement)) {
                els.letterPoolContainer.removeChild(draggedElement);
            }
            draggedElement = null;
            checkWordCompletion();
        } else {
            targetBox.classList.add('incorrect-flash');
            setTimeout(() => targetBox.classList.remove('incorrect-flash'), 500);
            if (draggedElement) draggedElement.classList.remove('dragging');
            draggedElement = null;
        }
    }

    function checkWordCompletion() {
        const wordData = currentWordList[currentWordIndex];
        if (!syllablesInBoxes.length) return;
        if (syllablesInBoxes.every(s => s !== null)) {
            wordsCorrectThisLevel++;
            els.wordBoxesContainer.childNodes.forEach(box => box.classList.add('filled'));
            let message = '';
            let delay = 1200;
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
                message = `Zuzen! "${wordData.word}" da! ✅`;
                els.wordFeedbackMessage.className = 'feedback correct';
            }
            els.wordFeedbackMessage.textContent = message;
            setTimeout(() => {
                if (isLevelUp) {
                    els.wordBoxesContainer.childNodes.forEach(box => box.classList.remove('level-up-flash'));
                }
                currentWordIndex++;
                syllablesInBoxes = [];
                loadEmojiSyllableChallenge();
            }, delay);
        }
    }

    // API pública
    App.emojiSyllableGame = {
        init,
        startEmojiSyllableGame,
        showEmojiSyllableThemeScreen
    };
})(window);
