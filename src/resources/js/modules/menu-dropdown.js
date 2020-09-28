function init() {

    // let parentLinks = document.querySelectorAll('.link-item.is-parent');

    const toggles = document.querySelectorAll('.link-item.is-parent .dropdown-toggle');

    for (var i=0; i<toggles.length; i++) {

        let toggle = toggles[i];
        let parent = toggle.parentNode;
        // let toggle = parent.querySelector('.dropdown-toggle');

        toggle.addEventListener('click', event => {
            event.preventDefault();
            parent.classList.toggle('is-parent--active');
        });

    }
}

export { init };