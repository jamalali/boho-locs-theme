function init() {

    let parentLinks = document.querySelectorAll('.link-item.is-parent');

    for (var i=0; i<parentLinks.length; i++) {

        let parent = parentLinks[i];
        let toggle = parent.querySelector('.dropdown-toggle');

        toggle.addEventListener('click', event => {
            event.preventDefault();
            parent.classList.toggle('is-parent--active');
        });

    }
}

export { init };