let gameSize;
let gameSeed;
let gameWord;

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
        const filePath = `WordLists/common_${gameSize}_letters.json`;
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`Could not find file: ${filePath}`);

        const wordList = await response.json();
        const numericSeed = cyrb128(gameSeed)[0];
        const wordIndex = numericSeed % wordList.length;

        gameWord = wordList[wordIndex].toUpperCase();

        console.log(`Secret word selected: ${gameWord} (Index: ${wordIndex})`);
        return gameWord;


    } catch (error) {
        console.error("Today is dark day, today is a sad day, because:", error)
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

            // Special styling for bigger buttons
            const isSpecial = key === 'ENTER' || key === 'BACK';
            const widthClass = isSpecial ? 'px-2 sm:px-4 text-xs' : 'w-9 sm:w-12';

            btn.className = `${widthClass} h-14 border-2 gms-border-dark gms-content-bg gms-dark-text font-bold rounded uppercase active:bg-gray-400 transition-colors`;

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

    const attempts = gameSize + 1;

    for (let i = 0; i < attempts; i++) {
        const row = document.createElement('div');
        row.className = "flex justify-center gap-1 mb-1";
        for (let j = 0; j < gameSize; j++) {
            row.innerHTML += `<div class="w-12 h-12 border-2 gms-border-dark flex items-center justify-center text-2xl font-bold uppercase gms-dark-text"></div>`;
        }
        wordArea.appendChild(row);
    }
}



document.addEventListener('DOMContentLoaded', () => {
    initializeGame();

    const startBtn = document.getElementById('start-game');
    const seedInput = document.getElementById('seed-input');

    if (startBtn) {
        startBtn.addEventListener('click', () => {
            const newSeed = seedInput.value.trim() || 'now';
            window.location.href = `Game.html?size=${gameSize}&seed=${encodeURIComponent(newSeed)}`;
        });
    }
});