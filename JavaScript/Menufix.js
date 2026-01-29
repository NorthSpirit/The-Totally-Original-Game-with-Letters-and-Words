//A helper function to fix the menu button cosmetics and deactivate "you are here" button
//This exists, to prevent one having 6 Game.html's with only difference being the menu buttons
function fixMenuNavigation() {
    //Parses the params from the url and gets size.
    const params = new URLSearchParams(window.location.search);
    const currentSize = params.get('size');

    //Assuming, if size param is here, you're at home, even if manually removing it, will highlight "home", even if you're in game.html
    const isHome = !currentSize;

    //A dictionary of sorts of game sizes corresponding to DOM classes + one for home
    const navLinks = {
        "4": document.getElementById('NSGame4'),
        "5": document.getElementById('NSGame5'),
        "6": document.getElementById('NSGame6'),
        "7": document.getElementById('NSGame7'),
        "8": document.getElementById('NSGame8'),
        "home": document.getElementById('MHome')
    };

    //Resets everything to the base button, removing some classes, adding others
    Object.values(navLinks).forEach(link => {
        if (!link) return;
        link.classList.remove('gms-primary-bg', 'gms-light-text', 'cursor-default', 'pointer-events-none');
        link.classList.add('gms-content-bg', 'gms-menu-text', 'gms-hover-bg-light');
        link.removeAttribute('aria-current');
        link.style.pointerEvents = 'auto';
    });

    //Checks which button is currently the active one and adds the corresponding classes based on that
    let activeLink = null;
    if (isHome) {
        activeLink = navLinks["home"];
    } else if (currentSize && navLinks[currentSize]) {
        activeLink = navLinks[currentSize];
    }

    if (activeLink) {
        activeLink.classList.add('gms-primary-bg', 'gms-light-text', 'cursor-default', 'pointer-events-none');
        activeLink.classList.remove('gms-content-bg', 'gms-menu-text', 'gms-hover-bg-light');
        activeLink.setAttribute('aria-current', 'page');
        activeLink.style.pointerEvents = 'none';
    }
}

//This fires up once the document is fully loaded
document.addEventListener('DOMContentLoaded', fixMenuNavigation);