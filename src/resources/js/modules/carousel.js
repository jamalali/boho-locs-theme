import 'slick-carousel';
import { breakpoint } from './breakpoint.js';

function init() {

    let carousels = document.querySelectorAll('.esc-carousel');

    for (var i=0; i<carousels.length; i++) {

        const carousel = carousels[i];
        const config = JSON.parse(carousel.dataset.carousel);
        const destroyAt = config.destroyAt;

        config.responsive = [
            {
                "breakpoint": destroyAt - 1,
                "settings": "unslick"
            }
        ];

        let resizeTimer;

        // Initialze carousel (slick slider)
        let el = $(carousel).slick(config);

        window.addEventListener('resize', () => {

            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {

                if (!el.hasClass('slick-initialized') && window.innerWidth < destroyAt) {
                    $(carousel).slick(config);
                }
                        
            }, 500);
            
        });

        
        
    }



}

export { init };