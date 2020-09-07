function init() {

    let toggles = document.getElementsByClassName('mobile-menu-toggle');
    let header = document.querySelector('.site-header');

    for (var i=0; i<toggles.length; i++) {
        toggles[i].addEventListener('click', event => {
            event.preventDefault();
            header.classList.toggle('mobile-menu-open');
        });
    }

    // Setup events
    let parentLinks = document.querySelectorAll('.child-links .link-item.is-parent');

    for (var i=0; i<parentLinks.length; i++) {

        let parent = parentLinks[i];
        let toggle = parent.querySelector('.dropdown-toggle');
        let grandChildLinks = parent.querySelector('.grand-child-links');

        toggle.addEventListener('click', event => {
            event.preventDefault();
            parent.classList.toggle('is-parent--active');
        });

    }
}

export { init };