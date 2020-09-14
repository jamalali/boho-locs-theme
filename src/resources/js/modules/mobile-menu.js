let scrollY;

function init() {

    let toggles = document.getElementsByClassName('mobile-menu-toggle');
    let body = document.querySelector('body');

    for (var i=0; i<toggles.length; i++) {
        toggles[i].addEventListener('click', event => {
            event.preventDefault();
            body.classList.toggle('mobile-menu-open');

            if (body.classList.contains('mobile-menu-open')) {
                disableScroll(body);
            } else {
                enableScroll(body);
            }
        });
    }
}

function disableScroll(body) {

    scrollY = window.scrollY;

    // There are also some styles added to <body> in mobile-menu.js
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
}

function enableScroll(body) {
    body.style.position = '';
    body.style.top = '';

    window.scrollTo(0, scrollY);
}

export { init };