import $ from 'jquery';

import 'slick-carousel';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

function init() {
    $(document).ready(function() {
        $('.featured-products__products').slick({
            centerMode: true,
            centerPadding: '24px',
            arrows: false
        });
    });
}

export { init };