//Function for palette swapping, palettes mainly differ in fonts, font sizes, colours and padding (not margin)
//Main palette meant for "real" design, alt one is for stripped colours, all the keys and buttons operate on the rule:
//Outside of border, only black and white are allowed.
//Theme/palette pick is saved on local cache
//And then it picks the "correct" one, based on the saved key
const defaultCSS = document.getElementById('themeCSS');
const altCSS = document.getElementById('themeCSSAlt');
const themeKey = 'MTheme';

//The part, which checks bool and applies the theme, if they even exist in the first place and switches the bool
function applyTheme(isAlt) {
    if (!defaultCSS || !altCSS) return;
    
    defaultCSS.disabled = isAlt;
    altCSS.disabled = !isAlt;
    //Save the preference to the cache
    localStorage.setItem(themeKey, isAlt ? 'alt' : 'default');
}


//Initializes the theme, based on the previous choice or, if it doesn't exist, default
//Also, hooks the swap to "MColour" (Palette Swap) button, disabiing it's default non-function, just in case
function initTheme() {
    //Loads up the cached stuff
    const cachedTheme = localStorage.getItem(themeKey);
    if (cachedTheme === 'alt') {
        applyTheme(true);
    }

    const paletteMenuLink = document.getElementById('MColour');
    if (paletteMenuLink) {
        paletteMenuLink.addEventListener('click', (e) => {
            e.preventDefault();
            const isCurrentlyDefault = altCSS.disabled; 
            applyTheme(isCurrentlyDefault);
        });
    }
}

//Minor security measure
//If document has already loaded, it fires us, if not, it waits and then fires up
//Tho, I really don't imagine anyone placing script in the "head" part...
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
} else {
    initTheme();
}

//Truth be told, this thing is taken from my previous project...