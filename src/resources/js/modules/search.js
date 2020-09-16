import {body, disableScroll, enableScroll} from './body.js';

function init() {

    let toggles = document.getElementsByClassName('search-overlay-toggle');

    for (var i=0; i<toggles.length; i++) {
        toggles[i].addEventListener('click', event => {
            event.preventDefault();
            body.classList.toggle('search-overlay-open');
            
            $('.search-overlay .slick-slider').slick('refresh');

            if (body.classList.contains('search-overlay-open')) {
                disableScroll();
            } else {
                enableScroll();
            }
        });
    }    
}

export { init };