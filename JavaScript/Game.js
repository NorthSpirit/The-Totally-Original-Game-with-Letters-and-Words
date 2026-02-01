//Pratarmė/Preface
//Broliai seserys, imkit mane ir skaitykit
//Ir tatai skaitydami permanykit
//Cha, most of you won't get the 2nd and 3rd lines...
//Truth be told, this is my first "REAL" JS project and also, I am not sure, for whom I write the comments.
//This git is publically available for everyone, but at the same time, I adress myself, even tho, it's not in Lithuanian.
//I guess, if you'll stumble upon this, you might enjoy the explanations, even if it's probably 1/3rd of the document.
//I would say, main lesson learned from all of this is Cyrb128 if talking about technical stuff, and the "bitter" lesson if not
//Bitter lesson being - Don't make something you won't personally enjoy or get paid for making.
//But even then, a few friends of mine, even if small handful, do enjoy this once in a blue moon.
//Also, tip for the next time USE THE FUCKING ENUMS!

//Game size is the size of the game, gotten from url size=5
let gameSize;

//Seed is seed, gotten from &seed=now part of the url, which goes after size, with a few of them being hardcoded
//Those being quick and random for random seed and now for seed based on a date, check initializeGame.
let gameSeed;

//Word gotten from the list of words, which will be referenced until the game ends, like 'Banana' or 'Larksome'
let gameWord;

//One of the word lists, loaded based on game size, held once, so it wouldn't have to be loaded each time it is needed
let fullWordList = []

//Special game mode, because I didn't want to have 8 letter words to begin with, so decided to make it more special, vowels are needed for the said mode
let isNovomod = false;
const VOWELS = ['A', 'E', 'I', 'O', 'U'];

/*-----------------*/

//Variabls needed for the game logic itself, row is obviously row, tile is tile in siad row
let currentRow = 0;
let currentTile = 0;

//Guessed letters is an array to hold letters and their status, for example Letter A, with status of "present"
let guessedLetters = [];

//A helper bool to check if the game is done and done
let gameIsOver = false;

//A single source of truth for attempts, to prevent me from derping.
//On 4 letter words, 5 attempts were too little.
//On Novomod, couldn't decide how many it should be and swapped it a few times, for now it's 9.
function getMaxAttempts(size) {
    if (size === 4) return 6;
    if (size === 8) return 9;
    return size + 1;
}

//Semi-randomization function for seeds, Hs are random constants/magic numbers.
//Function itterates through every char of from the string, parsed from seed input from the game screen
//And returns them as a 32 bit integer >>> 0 helps avoid shenanigans, by keeping number positive, by keeping last bit for number, rather than sign
//Since you will forget, imul is an integer multiplication in JS and ^ is an XOR operator (one or another, 1 + 0 = 1, 0 + 1 = 1, 0 + 0 = 0, 1 + 1 = 0)
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

//Loads the word list, based on seed by cyrb128, based on leftover number
//Since seeds are stupid long, unlike word list, it wraps around with modulo (%) until it falls inside the word list and then picks a word
//Function is async, since it should allow other stuff to happen (keyboard and tile drawing), while word is getting gotten
//Eventually checks if we got the word, if person wants to cheat with console, so be it...
//Also, all of the lists have lower case words in them, but gods know if some version me didn't muck it up, so it's all to-upper...
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

//Keyboard creation function, you made after obvious realization, doing this by hand is stupid...
//Lists all the possible keys first, with final line being adapted between mobile devices and desktop,
//Because 3rd line gotten too crowded on phone, BACK and ENTER should have been swapped, but by the time you realized, muscle memory was a thing.
//Other stuff is just your CSS and tailwind classes and event handler injection.
//Data-key, for example data-key="W", saves private info about the button, preventing need for itterating each time you want to reference a specifi key.
function createKeyboard() {
    const keyboardContainer = document.getElementById('keyboard');
    if (!keyboardContainer) return;
    keyboardContainer.innerHTML = '';

    const topRows = [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L']
    ];

    const desktopRow3 = ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK'];

    const mobileRow3 = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];
    const mobileRow4 = ['ENTER', 'BACK'];

    const buildRow = (keys, extraClasses = "") => {
        const rowDiv = document.createElement('div');
        rowDiv.className = `flex justify-center mb-1 gap-1 w-full ${extraClasses}`;
        keys.forEach(key => {
            const btn = document.createElement('button');
            const isSpecial = key === 'ENTER' || key === 'BACK';

            btn.setAttribute('data-key', key);
            btn.textContent = key;

            const widthClass = isSpecial ? 'px-2 sm:px-6 flex-1 max-w-[120px]' : 'w-10 h-12 sm:w-12 sm:h-14';
            btn.className = `${widthClass} ns-button h-14 border-2 gms-border-dark gms-content-bg gms-dark-text font-bold rounded uppercase transition-colors`;

            btn.addEventListener('click', () => handleInput(key));
            rowDiv.appendChild(btn);
        });
        return rowDiv;
    };

    topRows.forEach(keys => keyboardContainer.appendChild(buildRow(keys)));

    keyboardContainer.appendChild(buildRow(desktopRow3, "hidden md:flex"));

    keyboardContainer.appendChild(buildRow(mobileRow3, "flex md:hidden"));

    keyboardContainer.appendChild(buildRow(mobileRow4, "flex md:hidden"));
}

//Sets up the game, by getting params from url, mainly game size and seed,
//Size is capped to prevent someone being a smartarse and doing Game.html?size=9001&seed=now
//Novomod = no no vowels mode, which obscufates information about vowels, unless they are in the correct space
//It is mainly because novowels pestered you to make an 8 letter mode.
//Seed is either now, a current date, random or a specific input
//Afterwards it just gets the seed, creates grid and keyboard
//If size parsing fails, it just defaults to 5, because your first word list was 5.
async function initializeGame() {
    const params = new URLSearchParams(window.location.search);

    let requestedSize = parseInt(params.get('size')) || 5;
    gameSize = Math.max(4, Math.min(requestedSize, 8));

    isNovomod = (gameSize === 8);

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

//Just a function to draw the grid
//Originally attempts had to be word lenght + 1, but 4 letter word version ended up being impossible,
//It's still hard, but doable with some luck
//If WordArea doesn't exist, it just quits, instead of crashing, even if it makes little difference
//Cause the game is unplayable anyhow.
function createGrid() {
    const wordArea = document.querySelector('.WordArea');
    if (!wordArea) return;
    wordArea.innerHTML = '';

    const attempts = getMaxAttempts(gameSize);

    for (let i = 0; i < attempts; i++) {
        const row = document.createElement('div');
        row.className = "flex justify-center gap-1 mb-1";
        for (let j = 0; j < gameSize; j++) {
            row.innerHTML += `<div class="w-12 h-12 ns-key gms-border-dark flex items-center justify-center text-2xl font-bold uppercase gms-dark-text"></div>`;
        }
        wordArea.appendChild(row);
    }
}

//Little function to check, what was inputed, 
//For safety, it turns all the inputs to upper
//No real safety check for other inputs, but it was never drawn anyhow, so we're good.
//Backspace check exists for keyboard, even if it's not a drawn key.
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

//Adds a letter to the square and pushes current tile (to be interacted with) by 1
//If prevents going overboard.
//Row is picked from DOM, by getting it word area, specific tile is further gotten as a child from row
function addLetter(letter) {
    if (currentTile < gameSize) {
        const rows = document.querySelector('.WordArea').children;
        const tile = rows[currentRow].children[currentTile];
        tile.textContent = letter;
        tile.classList.add('ns-tile-input');
        currentTile++;
    }
}

//Removes the letter from the square and pushed current tile back by 1
//If prevents it going back to the start of time
//Text is "replaced" with nothingness and custom class is removed too.
function removeLetter() {
    if (currentTile > 0) {
        currentTile--;
        const rows = document.querySelector('.WordArea').children;
        const tile = rows[currentRow].children[currentTile];
        tile.textContent = '';
        tile.classList.remove('ns-tile-input');
    }
}

//Function to prevent the game from forgetting the correct letters/keys,
//by setting their status
//If letter already "correct" is it above all else and doesn't get changed
//If letter is "present" is can become correct, but can't become non-present
//No need for absent check, cause absent either keeps being absert or gets changed
function updateKeyStatus(letter, status) {
    const existing = guessedLetters.find(item => item.letter === letter);
    if (!existing) {
        guessedLetters.push({ letter, status });
    } else {
        if (status === 'correct') existing.status = 'correct';
        if (status === 'present' && existing.status === 'absent') existing.status = 'present';
    }
}

//Makes the window of end of the game to pop up and adjusts the text based if it is a victory or defeat.
//Close button just hides the thing, share gives a discord-able string
//Hiding again is good enough, cause changing seed reloads the page anyhow
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

//A function to submit a guess (after enter)
//First checks if the input was long enough in the first place and shakes a no-no shake if it's not
//Then creates an empty guess string and adds letters from the tiles onto it
//After that, checks if the word guessed exists in the word lists (since you went mental, they probably do)
//No-no shake if they don't
//Small delay exists for person to look at the correct squares
function submitGuess() {
    const rows = document.querySelector('.WordArea').children;
    const currentRowElement = rows[currentRow];

    if (currentTile !== gameSize) {
        console.log("Word too short!");
        currentRowElement.classList.add('ns-animate-shake');
        setTimeout(() => {
            currentRowElement.classList.remove('ns-animate-shake');
        }, 1500);
        return;
    }

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

    //If word is a match, shows the good version of end screen, if it's not, bad and if it's not a game over, row gets moved down and game continues
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

//Logic to check the guess by matching letters first and then words against list and picked word
//First goes around the word, checks if the letters are matching to mark them as correct.
//After that checks for letters, which at least exists (with different logic for novomod)
//After statuses are matched, it applies/removes/adds classes, with once again, some logic differences for novomod
function checkGuess(guess, rowElement) {
    const wordArr = gameWord.split('');
    const guessArr = guess.split('');
    const status = new Array(gameSize).fill('absent');

    // 1. Pass: Identify Exact Matches (Green logic)
    guessArr.forEach((letter, i) => {
        if (letter === wordArr[i]) {
            status[i] = 'correct';
            wordArr[i] = null;
        }
    });

    // 2. Pass: Identify Present Letters (Yellow logic)
    guessArr.forEach((letter, i) => {
        if (status[i] !== 'correct') {
            //In Novomod, we skip vowels for the 'yellow' status.
            // In standard mode, we process all letters normally.
            const isVowel = VOWELS.includes(letter);
            if (!(isNovomod && isVowel) && wordArr.includes(letter)) {
                status[i] = 'present';
                wordArr[wordArr.indexOf(letter)] = null;
            }
        }
    });

    // 3. UI Application
    Array.from(rowElement.children).forEach((tile, i) => {
        const letter = guessArr[i];
        tile.classList.remove('gms-dark-text', 'gms-border-dark');

        if (isNovomod && VOWELS.includes(letter)) {
            // NOVOMOD VOWEL HANDLING for less information
            if (status[i] === 'correct') {
                tile.classList.add('ns-novo-correct-letter');
                updateKeyStatus(letter, 'correct');
            } else {
                tile.classList.add('ns-novo-letter');
                updateKeyStatus(letter, 'novo');
            }
        } else {
            // STANDARD HANDLING (and Consonants in Novomod)
            if (status[i] === 'correct') {
                tile.classList.add('ns-matched-letter');
            } else if (status[i] === 'present') {
                tile.classList.add('ns-existing-letter');
            } else {
                tile.classList.add('ns-disabled-letter', 'ns-text-white');
            }
            updateKeyStatus(letter, status[i]);
        }
    });
}


/*
//As it says, function to update the keybaord UI
//First scrapes all the classes, related to letters
//Then applies them according the the conditions, checking if it's novomod or normal
function updateKeyboardUI() {
    guessedLetters.forEach(item => {
        const keyBtn = document.querySelector(`button[data-key="${item.letter}"]`);
        if (!keyBtn) return;

        // 1. Scrub ALL possible status classes to prevent "class soup"
        keyBtn.classList.remove(
            'gms-content-bg',
            'gms-dark-text',
            'ns-matched-letter',
            'ns-existing-letter',
            'ns-disabled-letter',
            'ns-text-white',
            'ns-novo-letter',
            'ns-novo-correct-letter'
        );

        const isVowel = VOWELS.includes(item.letter);

        // 2. Handle Novomod Special Vowel Logic
        if (isNovomod && isVowel) {
            if (item.status === 'correct') {
                keyBtn.classList.add('ns-novo-correct-letter');
            } else {
                // In Novomod, once a vowel is guessed, it stays in 'blue' status 
                // unless it hits the 'correct' status... tho, it's still blue, just different blue...
                keyBtn.classList.add('ns-novo-letter');
            }
            return; // Exit for vowels in Novomod
        }

        // 3. Handle Standard Mode & Consonants
        if (item.status === 'correct') {
            keyBtn.classList.add('ns-matched-letter');
        }
        else if (item.status === 'present') {
            // Only apply 'present' if it hasn't already been marked 'correct' 
            // (Standard logic for keys like the 'E' in 'TREES')
            keyBtn.classList.add('ns-existing-letter');
        }
        else if (item.status === 'absent') {
            keyBtn.classList.add('ns-disabled-letter', 'ns-text-white');
        }
    });
}
*/

//As it says, function to update the keybaord UI
//First scrapes all the classes, related to letters
//Then applies them according the the conditions, checking if it's novomod or normal
function updateKeyboardUI() {
    guessedLetters.forEach(item => {

        //querySelectorAll to catch both Desktop and Mobile versions of the keys, one of the last bugs of the project...
        const keyBtns = document.querySelectorAll(`button[data-key="${item.letter}"]`);
        if (keyBtns.length === 0) return;

        // 1. Scrub ALL possible status classes to prevent "class soup"
        keyBtns.forEach(keyBtn => {
            keyBtn.classList.remove(
                'gms-content-bg',
                'gms-dark-text',
                'ns-matched-letter',
                'ns-existing-letter',
                'ns-disabled-letter',
                'ns-text-white',
                'ns-novo-letter',
                'ns-novo-correct-letter'
            );

            const isVowel = VOWELS.includes(item.letter);

            // 2. Handle Novomod Special Vowel Logic
            if (isNovomod && isVowel) {
                if (item.status === 'correct') {
                    keyBtn.classList.add('ns-novo-correct-letter');
                } else {
                    // In Novomod, once a vowel is guessed, it stays in 'blue' status 
                    // unless it hits the 'correct' status... tho, it's still blue, just different blue...
                    keyBtn.classList.add('ns-novo-letter');
                }
                return; // Exit for vowels in Novomod
            }

            // 3. Handle Standard Mode & Consonants
            if (item.status === 'correct') {
                keyBtn.classList.add('ns-matched-letter');
            }
            else if (item.status === 'present') {
                // Only apply 'present' if it hasn't already been marked 'correct' 
                // (Standard logic for keys like the 'E' in 'TREES')
                keyBtn.classList.add('ns-existing-letter');
            }
            else if (item.status === 'absent') {
                keyBtn.classList.add('ns-disabled-letter', 'ns-text-white');
            }
        });
    });
}

//Function, which primary function is... bragging... obviously...
//Like, if you fail, I'm sure as hell, you ain't sharing that...
//Anyhow, gets all the rows from wordarea div and the attempts and forms a string
//Applying a square, based on status from all the rows of the game.
//Logic on phones/mobile devices differ, because TNP complained about windows also doing the navigator thing on his windows and it's annoying...
//I wonder if in the future, there will be something different, other than android/Istuff.
//Share = the fancy stuff with social networks and all that jazz, clipboard is copy-paste.
function shareResults() {
    const rows = document.querySelector('.WordArea').children;
    const totalAttempts = getMaxAttempts(gameSize);
    //String logic example: TTOGWLAW - Seed: 7L53NVJ (1/9)
    //Or in words TTOGWLAW = Game name, seed is obviously seed, then speicific seed (attempts it too you/total attempts)
    let emojiGrid = `TTOGWLAW - Seed: ${gameSeed} (${currentRow + 1}/${totalAttempts})\n\n`;

    for (let i = 0; i <= currentRow; i++) {
        const tiles = rows[i].children;
        let rowEmojis = "";

        for (let tile of tiles) {
            // Priority 1: Correct Vowel (Purple)
            if (tile.classList.contains('ns-novo-correct-letter')) {
                rowEmojis += "🟪";
            }
            // Priority 2: Generic Vowel (Blue)
            else if (tile.classList.contains('ns-novo-letter')) {
                rowEmojis += "🟦";
            }
            // Priority 3: Correct Consonant (Green)
            else if (tile.classList.contains('ns-matched-letter')) {
                rowEmojis += "🟩";
            }
            // Priority 4: Existing Consonant (Yellow)
            else if (tile.classList.contains('ns-existing-letter')) {
                rowEmojis += "🟨";
            }
            // Priority 5: Absent / Wrong (Black)
            else {
                rowEmojis += "⬛";
            }
        }
        emojiGrid += rowEmojis + "\n";
    }

    //If anything will need updating, I kinda suspect, it's this...
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile && navigator.share) {
        navigator.share({
            text: emojiGrid
        }).catch(err => console.log("Share cancelled"));
    } else {
        navigator.clipboard.writeText(emojiGrid).then(() => {
            const btn = document.getElementById('share-button');
            const originalText = btn.textContent;
            btn.textContent = "COPIED! ✅";
            const feedbackClass = isNovomod ? 'ns-novo-correct-letter' : 'ns-matched-letter';
            btn.classList.replace('gms-primary-bg', feedbackClass);

            //Reverts button back from copied after 2 seconds
            setTimeout(() => {
                btn.textContent = originalText;
                btn.classList.replace(feedbackClass, 'gms-primary-bg');
            }, 2000);
        }).catch(err => {
            console.error("Clipboard failed", err);
        });
    }
}

//For the sake of TNP, I also added the keyboard support, even if I suspect, this might not be optimal, it was a handful of minutes implementation
//Checks, what was pushed, if it was was letter, it is treated as a letter, if it's back or backspace, it's back.
//After doing the logic, is also adds a "pushed in" button feeling for a blink of a second.
document.addEventListener('keydown', (e) => {
    //This checks, if the person actually tries to put stuff into designated input area, for example, seed field.
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    let key = e.key.toUpperCase();

    //This is to fix the annoyign thing, where you would click on a letter or backspace via mouse and then click enter
    //Before this, clicking enter would try to send the answer and then apply the last thing clicked with mouse
    //Tho, it feels like it was more of an issue on local copy, rather than GIT IO one, for some reason.
    if (key === 'ENTER') {
        e.preventDefault();
    }

    //This stays as it is, because BACK is a magic string, so don't do this, but let's call this a sunken cost...
    if (key === 'BACKSPACE') key = 'BACK';


    handleInput(key);

    const visualKeys = document.querySelectorAll(`button[data-key="${key}"]`);
    visualKeys.forEach(visualKey => {
        visualKey.classList.add('opacity-50', 'scale-95');
        setTimeout(() => {
            visualKey.classList.remove('opacity-50', 'scale-95');
        }, 100);
    })
});

//Loads up the game, gets the buttons, the seed field and handles the buttons themselves
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();

    const startBtn = document.getElementById('start-game');
    const randomBtn = document.getElementById('random-game');
    const seedInput = document.getElementById('seed-input');

    //Handles the Seed 'n Go! button (applies the seed from t)
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            const newSeed = seedInput.value.trim() || 'now';
            //Handles the URL, parses the size and seed, size shenanigans are handled way way above in initializeGame
            window.location.href = `Game.html?size=${gameSize}&seed=${encodeURIComponent(newSeed)}`;
        });
    }

    //Handles the randomization button (I think, it is currently named Randomly!, but I might have renamed it again...)
    //Renaming things every 4 days is a sign of a great developer, kids!
    if (randomBtn) {
        randomBtn.addEventListener('click', () => {
            window.location.href = `Game.html?size=${gameSize}&seed=random`;
        });
    }
});