function init() {

    var toggles = document.getElementsByClassName('mobile-menu-toggle');

    // var toggle = document.querySelector('.mobile-menu-toggle');
    var header = document.querySelector('.site-header');

    for (var i=0; i<toggles.length; i++) {
        toggles[i].addEventListener('click', event => {
            event.preventDefault();
            header.classList.toggle('mobile-menu-open');
        });
    }
}

export { init };  