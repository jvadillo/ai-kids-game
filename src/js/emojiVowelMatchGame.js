(function(window) {
    // Juego: Asociar emojis con la vocal con la que empiezan (drag and drop)
    const App = window.App = window.App || {};
    const VOWELS = ['A', 'E', 'I', 'O', 'U'];
    
    // Variables globales para drag & drop
    let draggedElement = null, ghostElement = null, offsetX = 0, offsetY = 0;
    
    let currentRound = 0;
    let els = {};
    let allWords = [];
    let currentMatches = {};
    let correctMatches = {};

    // Extrae todas las palabras de los temas existentes
    function getAllWords() {
        let words = [];
        try {
            const themes = eval('wordThemes');
            Object.values(themes).forEach(arr => {
                arr.forEach(entry => words.push({ word: entry.word, emoji: entry.emoji }));
            });
        } catch {
            words = [
                { word: 'ahate', emoji: '🦆' }, { word: 'arkatz', emoji: '✏️' }, { word: 'arrain', emoji: '🐠' },
                { word: 'arrosa', emoji: '🩷' }, { word: 'aulki', emoji: '🪑' },
                { word: 'eskola', emoji: '🏫' }, { word: 'elur', emoji: '❄️' }, { word: 'eguraldi', emoji: '⛅' },
                { word: 'igel', emoji: '🐸' }, { word: 'ilargi', emoji: '🌙' }, { word: 'izotz', emoji: '🧊' },
                { word: 'ogi', emoji: '🍞' }, { word: 'otso', emoji: '🐺' }, { word: 'oilo', emoji: '🐔' },
                { word: 'untxia', emoji: '🐇' }, { word: 'urdin', emoji: '💙' }, { word: 'ura', emoji: '💧' }
            ];
        }
        return words;
    }

    function init() {
        els.screen = document.getElementById('emoji-vowel-match-screen');
        els.roundLabel = document.getElementById('evm-round-label');
        els.emojiContainer = document.getElementById('evm-emoji-container');
        els.vowelContainer = document.getElementById('evm-vowel-container');
        els.feedback = document.getElementById('evm-feedback');
        els.nextBtn = document.getElementById('evm-next-button');
        els.backBtn = document.getElementById('evm-back-button');
        
        allWords = getAllWords();
        
        if (els.nextBtn) els.nextBtn.addEventListener('click', nextRound);
        if (els.backBtn) els.backBtn.addEventListener('click', () => {
            App.screens.showScreen('gameSelection');
            removeTouchListeners();
        });
    }

    function start() {
        if (!els.screen) init();
        currentRound = 0;
        App.screens.showScreen('emojiVowelMatch');
        loadRound();
        addTouchListeners();
    }

    function loadRound() {
        currentMatches = {};
        correctMatches = {};
        els.roundLabel.textContent = `Maila: ${currentRound + 1}`;
        els.feedback.textContent = 'Lotu emoji bakoitza dagokion bokalarekin!';
        els.feedback.className = 'feedback';
        els.nextBtn.style.display = 'none';
        els.emojiContainer.innerHTML = '';
        els.vowelContainer.innerHTML = '';

        // Seleccionar una palabra por cada vocal
        const selectedWords = [];
        VOWELS.forEach(vowel => {
            const matching = allWords.filter(w => w.word[0].toUpperCase() === vowel);
            if (matching.length > 0) {
                const randomIndex = Math.floor(Math.random() * matching.length);
                selectedWords.push({ ...matching[randomIndex], vowel });
            }
        });

        // Guardar las asociaciones correctas
        selectedWords.forEach(item => {
            correctMatches[item.emoji] = item.vowel;
        });

        // Mezclar los emojis
        const shuffledEmojis = App.utils && App.utils.shuffleArray 
            ? App.utils.shuffleArray([...selectedWords]) 
            : [...selectedWords];

        // Crear contenedores de emojis (draggables)
        shuffledEmojis.forEach(item => {
            const emojiBox = document.createElement('div');
            emojiBox.classList.add('evm-emoji-tile');
            emojiBox.textContent = item.emoji;
            emojiBox.dataset.emoji = item.emoji;
            emojiBox.draggable = true;
            emojiBox.addEventListener('dragstart', handleDragStart);
            emojiBox.addEventListener('dragend', handleDragEnd);
            emojiBox.addEventListener('touchstart', handleTouchStart, { passive: false });
            els.emojiContainer.appendChild(emojiBox);
        });

        // Crear contenedores de vocales (drop zones)
        VOWELS.forEach(vowel => {
            const vowelZone = document.createElement('div');
            vowelZone.classList.add('evm-vowel-zone');
            vowelZone.dataset.vowel = vowel;
            
            const vowelLabel = document.createElement('div');
            vowelLabel.classList.add('evm-vowel-label');
            vowelLabel.textContent = vowel;
            
            const dropArea = document.createElement('div');
            dropArea.classList.add('evm-drop-area');
            dropArea.dataset.vowel = vowel;
            dropArea.addEventListener('dragover', handleDragOver);
            dropArea.addEventListener('dragleave', handleDragLeave);
            dropArea.addEventListener('drop', handleDrop);
            
            vowelZone.appendChild(vowelLabel);
            vowelZone.appendChild(dropArea);
            els.vowelContainer.appendChild(vowelZone);
        });

        App.options.applyOptions();
    }

    // Touch listeners
    function addTouchListeners() {
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd);
    }

    function removeTouchListeners() {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
    }

    function handleTouchStart(event) {
        if (event.target.classList.contains('evm-emoji-tile')) {
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
        if (elementBelow && elementBelow.classList.contains('evm-drop-area')) {
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
        if (dropTarget && dropTarget.classList.contains('evm-drop-area')) {
            const emoji = draggedElement.dataset.emoji;
            const vowel = dropTarget.dataset.vowel;
            processDrop(emoji, vowel, dropTarget);
        } else {
            if (draggedElement) draggedElement.classList.remove('dragging');
        }
        draggedElement = null;
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
        event.dataTransfer.setData('text/plain', event.target.dataset.emoji);
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
        if (event.target.classList.contains('evm-drop-area')) {
            event.target.classList.add('drag-over');
        }
    }

    function handleDragLeave(event) {
        if (event.target.classList.contains('evm-drop-area')) {
            event.target.classList.remove('drag-over');
        }
    }

    function handleDrop(event) {
        event.preventDefault();
        if (event.target.classList.contains('drag-over')) {
            event.target.classList.remove('drag-over');
        }
        const targetZone = event.target;
        if (!targetZone.classList.contains('evm-drop-area')) {
            return;
        }
        const droppedEmoji = event.dataTransfer.getData('text/plain');
        const vowel = targetZone.dataset.vowel;
        processDrop(droppedEmoji, vowel, targetZone);
    }

    function processDrop(emoji, vowel, dropZone) {
        // Verificar si la zona ya tiene un emoji
        if (currentMatches[vowel]) {
            // Ya hay un emoji en esta zona, rechazar
            if (draggedElement) draggedElement.classList.remove('dragging');
            draggedElement = null;
            return;
        }

        // Verificar si el emoji ya está asignado a otra vocal
        const previousVowel = Object.keys(currentMatches).find(v => currentMatches[v] === emoji);
        if (previousVowel) {
            // Eliminar el emoji de la zona anterior
            const previousZone = document.querySelector(`.evm-drop-area[data-vowel="${previousVowel}"]`);
            if (previousZone) {
                previousZone.innerHTML = '';
            }
            delete currentMatches[previousVowel];
        }

        // Colocar el emoji en la zona
        currentMatches[vowel] = emoji;
        dropZone.innerHTML = '';
        const emojiDisplay = document.createElement('div');
        emojiDisplay.classList.add('evm-dropped-emoji');
        emojiDisplay.textContent = emoji;
        dropZone.appendChild(emojiDisplay);

        // Eliminar el tile original del contenedor de emojis
        if (draggedElement && els.emojiContainer.contains(draggedElement)) {
            els.emojiContainer.removeChild(draggedElement);
        }
        draggedElement = null;

        // Verificar si se completaron todas las asociaciones
        checkCompletion();
    }

    function checkCompletion() {
        const matchedCount = Object.keys(currentMatches).length;
        if (matchedCount === VOWELS.length) {
            // Verificar si todas las asociaciones son correctas
            let allCorrect = true;
            let correctCount = 0;
            Object.keys(currentMatches).forEach(vowel => {
                const emoji = currentMatches[vowel];
                const dropZone = document.querySelector(`.evm-drop-area[data-vowel="${vowel}"]`);
                if (correctMatches[emoji] === vowel) {
                    correctCount++;
                    if (dropZone) dropZone.classList.add('evm-correct');
                } else {
                    allCorrect = false;
                    if (dropZone) dropZone.classList.add('evm-incorrect');
                }
            });

            if (allCorrect) {
                els.feedback.textContent = 'Bikain! Guztiak zuzen! ✅';
                els.feedback.className = 'feedback correct';
                els.nextBtn.style.display = 'inline-block';
            } else {
                els.feedback.textContent = `${correctCount}/5 zuzen. Saiatu berriro!`;
                els.feedback.className = 'feedback incorrect';
                // Permitir reintentar después de un delay
                setTimeout(() => {
                    resetIncorrect();
                }, 1500);
            }
        }
    }

    function resetIncorrect() {
        // Eliminar solo las asociaciones incorrectas
        Object.keys(currentMatches).forEach(vowel => {
            const emoji = currentMatches[vowel];
            if (correctMatches[emoji] !== vowel) {
                const dropZone = document.querySelector(`.evm-drop-area[data-vowel="${vowel}"]`);
                if (dropZone) {
                    dropZone.classList.remove('evm-incorrect');
                    dropZone.innerHTML = '';
                    
                    // Devolver el emoji al contenedor
                    const emojiBox = document.createElement('div');
                    emojiBox.classList.add('evm-emoji-tile');
                    emojiBox.textContent = emoji;
                    emojiBox.dataset.emoji = emoji;
                    emojiBox.draggable = true;
                    emojiBox.addEventListener('dragstart', handleDragStart);
                    emojiBox.addEventListener('dragend', handleDragEnd);
                    emojiBox.addEventListener('touchstart', handleTouchStart, { passive: false });
                    els.emojiContainer.appendChild(emojiBox);
                }
                delete currentMatches[vowel];
            }
        });
        els.feedback.textContent = 'Lotu emoji bakoitza dagokion bokalarekin!';
        els.feedback.className = 'feedback';
    }

    function nextRound() {
        currentRound++;
        if (currentRound >= 5) {
            els.feedback.textContent = 'Joko amaituta! Zorionak! 🎉';
            els.feedback.className = 'feedback correct';
            els.nextBtn.style.display = 'none';
            setTimeout(() => {
                App.screens.showScreen('gameSelection');
                removeTouchListeners();
            }, 2000);
        } else {
            loadRound();
        }
    }

    App.emojiVowelMatchGame = { init, start };
})(window);
