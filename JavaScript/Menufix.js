function fixMenuNavigation() {
    const params = new URLSearchParams(window.location.search);
    const currentSize = params.get('size');

    const isHome = !currentSize;

    const navLinks = {
        "4": document.getElementById('NSGame4'),
        "5": document.getElementById('NSGame5'),
        "6": document.getElementById('NSGame6'),
        "7": document.getElementById('NSGame7'),
        "home": document.getElementById('MHome')
    };

    Object.values(navLinks).forEach(link => {
        if (!link) return;
        link.classList.remove('gms-primary-bg', 'gms-light-text', 'cursor-default', 'pointer-events-none');
        link.classList.add('gms-content-bg', 'gms-menu-text', 'gms-hover-bg-light');
        link.removeAttribute('aria-current');
        link.style.pointerEvents = 'auto';
    });

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

document.addEventListener('DOMContentLoaded', fixMenuNavigation);