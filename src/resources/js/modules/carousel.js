import 'slick-carousel';

function init() {
    $(document).ready(function() {

        $('.slick-slider').slick();

        $('.featured-products__products').slick({
            centerMode: true,
            centerPadding: '24px',
            arrows: false,
            infinite: false,
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