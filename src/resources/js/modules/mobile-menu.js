import {body, disableScroll, enableScroll} from './body.js';

function init() {

    let toggles = document.getElementsByClassName('mobile-menu-toggle');

    for (var i=0; i<toggles.length; i++) {
        toggles[i].addEventListener('click', event => {
            event.preventDefault();
            body.classList.toggle('mobile-menu-open');

            if (body.classList.contains('mobile-menu-open')) {
                disableScroll();
            } else {
                enableScroll();
            }
        });
    }
}

export { init };