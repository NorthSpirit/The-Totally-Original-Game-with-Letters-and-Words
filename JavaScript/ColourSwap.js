const defaultCSS = document.getElementById('themeCSS');
const altCSS = document.getElementById('themeCSSAlt');
const themeKey = 'MTheme';

function applyTheme(isAlt) {
    if (!defaultCSS || !altCSS) return;
    
    defaultCSS.disabled = isAlt;
    altCSS.disabled = !isAlt;
    localStorage.setItem(themeKey, isAlt ? 'alt' : 'default');
}

function initTheme() {
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

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
} else {
    initTheme();
}