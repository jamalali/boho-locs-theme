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