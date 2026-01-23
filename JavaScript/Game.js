let gameSize;
let gameSeed;
let gameWord;
let fullWordList = []

/*-----------------*/

let currentRow = 0;
let currentTile = 0;
let guessedLetters = [];
let gameIsOver = false;

function cyrb128(str) {
    let h1 = 1779033703, h2 = 2557971541, h3 = 3574430938, h4 = 3926077512;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0];
}

async function loadWord(gameSize, gameSeed) {
    try {
        const filePath = `WordLists/test_${gameSize}_letters.json`;
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`Could not find file: ${filePath}`);

        const wordList = await response.json();
        fullWordList = wordList.map(w => w.toUpperCase());

        const numericSeed = cyrb128(gameSeed)[0];
        const wordIndex = numericSeed % fullWordList.length;

        gameWord = fullWordList[wordIndex];

        console.log(`Secret word selected: ${gameWord} (Index: ${wordIndex})`);
        return gameWord;
    } catch (error) {
        console.error("Today is dark day, today is a sad day, because:", error);
        return null;
    }
}

function createKeyboard() {
    const keyboardContainer = document.getElementById('keyboard');
    if (!keyboardContainer) return;

    const rows = [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK']
    ];

    keyboardContainer.innerHTML = '';

    rows.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.className = "flex justify-center mb-1 gap-1 w-full";

        row.forEach(key => {
            const btn = document.createElement('button');
            btn.textContent = key;
            btn.setAttribute('data-key', key);

            const isSpecial = key === 'ENTER' || key === 'BACK';
            const widthClass = isSpecial ? 'px-2 sm:px-4 text-xs' : 'w-9 sm:w-12';

            btn.className = `${widthClass} h-14 border-2 gms-border-dark gms-content-bg gms-dark-text font-bold rounded uppercase transition-colors`;

            btn.addEventListener('click', () => handleInput(key));
            rowDiv.appendChild(btn);
        });

        keyboardContainer.appendChild(rowDiv);
    });
}

async function initializeGame() {
    const params = new URLSearchParams(window.location.search);

    let requestedSize = parseInt(params.get('size')) || 5;
    gameSize = Math.max(4, Math.min(requestedSize, 7));

    let seedParam = params.get('seed');

    const seedInput = document.getElementById('seed-input');

    if (!seedParam || seedParam === 'now') {
        gameSeed = await getDailySeed();
    } else if (seedParam === 'quick' || seedParam === 'random') {
        gameSeed = Math.random().toString(36).substring(2, 9).toUpperCase();
    } else {
        gameSeed = seedParam;
    }

    seedInput.value = gameSeed;

    await loadWord(gameSize, gameSeed);

    const numericSeed = cyrb128(gameSeed)[0];
    console.log(`Playing ${gameSize} letters with seed: ${gameSeed} (Numeric: ${numericSeed})`);

    createGrid();
    createKeyboard();
}

function createGrid() {
    const wordArea = document.querySelector('.WordArea');
    if (!wordArea) return;
    wordArea.innerHTML = '';

    const attempts = (gameSize === 4) ? 6 : (gameSize + 1);

    for (let i = 0; i < attempts; i++) {
        const row = document.createElement('div');
        row.className = "flex justify-center gap-1 mb-1";
        for (let j = 0; j < gameSize; j++) {
            row.innerHTML += `<div class="w-12 h-12 border-2 gms-border-dark flex items-center justify-center text-2xl font-bold uppercase gms-dark-text"></div>`;
        }
        wordArea.appendChild(row);
    }
}

function handleInput(key) {
    if (gameIsOver) return;

    const upperKey = key.toUpperCase();

    if (upperKey === 'BACK' || upperKey === 'BACKSPACE') {
        removeLetter();
    } else if (upperKey === 'ENTER') {
        submitGuess();
    } else if (/^[A-Z]$/.test(upperKey)) {
        addLetter(upperKey);
    }
}

function addLetter(letter) {
    if (currentTile < gameSize) {
        const rows = document.querySelector('.WordArea').children;
        const tile = rows[currentRow].children[currentTile];
        tile.textContent = letter;
        tile.classList.add('ns-tile-input');
        currentTile++;
    }
}

function removeLetter() {
    if (currentTile > 0) {
        currentTile--;
        const rows = document.querySelector('.WordArea').children;
        const tile = rows[currentRow].children[currentTile];
        tile.textContent = '';
        tile.classList.remove('ns-tile-input');
    }
}

function updateKeyStatus(letter, status) {
    const existing = guessedLetters.find(item => item.letter === letter);
    if (!existing) {
        guessedLetters.push({ letter, status });
    } else {
        if (status === 'correct') existing.status = 'correct';
        if (status === 'present' && existing.status === 'absent') existing.status = 'present';
    }
}

function showEndScreen(isWin) {
    const modal = document.getElementById('game-modal');
    const title = document.getElementById('modal-title');
    const message = document.getElementById('modal-message');

    title.textContent = isWin ? "Wintory!" : "Disgraceful!";
    message.textContent = isWin
        ? `The word was ${gameWord}. You found it in ${currentRow + 1} tries!`
        : `KEK! The word was ${gameWord}. Better luck next time!`;

    modal.classList.remove('hidden');

    document.getElementById('share-button').onclick = () => shareResults();
    document.getElementById('close-modal').onclick = () => modal.classList.add('hidden');
}

function submitGuess() {
    if (currentTile !== gameSize) {
        console.log("Word too short!");
        return;
    }

    const rows = document.querySelector('.WordArea').children;
    const currentRowElement = rows[currentRow];

    let guess = "";
    for (let tile of currentRowElement.children) {
        guess += tile.textContent;
    }

    if (!fullWordList.includes(guess)) {
        console.log("Not in word list!");

        currentRowElement.classList.add('ns-animate-shake');

        setTimeout(() => {
            currentRowElement.classList.remove('ns-animate-shake');
        }, 1500);

        return;
    }
    // ----------------------------

    checkGuess(guess, currentRowElement);
    updateKeyboardUI();

    const totalAttempts = (gameSize === 4) ? 6 : (gameSize + 1);

    if (guess === gameWord) {
        gameIsOver = true;
        setTimeout(() => showEndScreen(true), 100);
    } else if (currentRow === totalAttempts - 1) {
        gameIsOver = true;
        setTimeout(() => showEndScreen(false), 100);
    } else {
        currentRow++;
        currentTile = 0;
    }
}

function checkGuess(guess, rowElement) {
    const wordArr = gameWord.split('');
    const guessArr = guess.split('');
    const status = new Array(gameSize).fill('absent');

    guessArr.forEach((letter, i) => {
        if (letter === wordArr[i]) {
            status[i] = 'correct';
            wordArr[i] = null;
        }
    });

    guessArr.forEach((letter, i) => {
        if (status[i] !== 'correct' && wordArr.includes(letter)) {
            status[i] = 'present';
            wordArr[wordArr.indexOf(letter)] = null;
        }
    });

    Array.from(rowElement.children).forEach((tile, i) => {
        const letter = guessArr[i];

        tile.classList.remove('gms-dark-text', 'gms-border-dark');

        if (status[i] === 'correct') {
            tile.classList.add('ns-matched-letter');
        } else if (status[i] === 'present') {
            tile.classList.add('ns-existing-letter');
        } else {
            tile.classList.add('ns-disabled-letter', 'ns-text-white'); // Replaced 'text-white'
        }

        updateKeyStatus(letter, status[i]);
    });
}

function updateKeyboardUI() {
    guessedLetters.forEach(item => {
        const keyBtn = document.querySelector(`button[data-key="${item.letter}"]`);
        if (!keyBtn) return;

        keyBtn.classList.remove('gms-content-bg', 'gms-dark-text');

        if (item.status === 'correct') {
            keyBtn.classList.add('ns-matched-letter');
            keyBtn.classList.remove('ns-existing-letter', 'ns-disabled-letter', 'ns-text-white');
        } else if (item.status === 'present') {
            if (!keyBtn.classList.contains('ns-matched-letter')) {
                keyBtn.classList.add('ns-existing-letter');
                keyBtn.classList.remove('ns-disabled-letter', 'ns-text-white');
            }
        } else if (item.status === 'absent') {
            if (!keyBtn.classList.contains('ns-matched-letter') && !keyBtn.classList.contains('ns-existing-letter')) {
                keyBtn.classList.add('ns-disabled-letter', 'ns-text-white');
            }
        }
    });
}

function shareResults() {
    const rows = document.querySelector('.WordArea').children;
    const totalAttempts = (gameSize === 4) ? 6 : (gameSize + 1);
    // Format: TTOGWLAW [Seed] [Tries]/[Max Tries]
    let emojiGrid = `TTOGWLAW - Seed: ${gameSeed} (${currentRow + 1}/${totalAttempts})\n\n`;

    for (let i = 0; i <= currentRow; i++) {
        const tiles = rows[i].children;
        let rowEmojis = "";

        for (let tile of tiles) {
            if (tile.classList.contains('ns-matched-letter')) {
                rowEmojis += "🟩";
            } else if (tile.classList.contains('ns-existing-letter')) {
                rowEmojis += "🟨";
            } else {
                rowEmojis += "⬛";
            }
        }
        emojiGrid += rowEmojis + "\n";
    }

    // Attempt to copy
    if (navigator.share) {
        navigator.share({
            text: emojiGrid
        }).catch(err => console.log("Share cancelled"));
    } else {
        navigator.clipboard.writeText(emojiGrid).then(() => {
            const btn = document.getElementById('share-button');
            const originalText = btn.textContent;
            btn.textContent = "COPIED! ✅";
            btn.classList.replace('gms-primary-bg', 'ns-matched-letter');

            setTimeout(() => {
                btn.textContent = originalText;
                btn.classList.replace('ns-matched-letter', 'gms-primary-bg');
            }, 2000);
        });
    }
}

document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    let key = e.key.toUpperCase();

    if (key === 'BACKSPACE') key = 'BACK';


    handleInput(key);

    const visualKey = document.querySelector(`button[data-key="${key}"]`);
    if (visualKey) {
        visualKey.classList.add('opacity-50', 'scale-95');
        setTimeout(() => {
            visualKey.classList.remove('opacity-50', 'scale-95');
        }, 100);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    initializeGame();

    const startBtn = document.getElementById('start-game');
    const randomBtn = document.getElementById('random-game');
    const seedInput = document.getElementById('seed-input');

    if (startBtn) {
        startBtn.addEventListener('click', () => {
            const newSeed = seedInput.value.trim() || 'now';
            window.location.href = `Game.html?size=${gameSize}&seed=${encodeURIComponent(newSeed)}`;
        });
    }

    if (randomBtn) {
        randomBtn.addEventListener('click', () => {
            window.location.href = `Game.html?size=${gameSize}&seed=random`;
        });
    }
});