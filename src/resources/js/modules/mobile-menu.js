function init() {

    let toggles = document.getElementsByClassName('mobile-menu-toggle');
    let header = document.querySelector('.site-header');

    for (var i=0; i<toggles.length; i++) {
        toggles[i].addEventListener('click', event => {
            event.preventDefault();
            header.classList.toggle('mobile-menu-open');
        });
    }
}

export { init };