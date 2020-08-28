import 'slick-carousel';

function init() {
    $(document).ready(function() {
        $('.featured-products__products').slick({
            centerMode: true,
            centerPadding: '24px',
            arrows: false,
            mobileFirst: true,
            responsive: [
                {
                    breakpoint: 767,
                    settings: "unslick"
                }
            ]
        });
    });
}

export { init };