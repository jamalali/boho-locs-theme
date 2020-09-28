import { breakpoint } from '../breakpoint';

function init() {

    const topBar = document.querySelector('.filter-sort-bar-area');
    const sideBar = document.querySelector('.filter-sort-column-area');
    const sort = document.querySelector('#bc-sf-filter-top-sorting');

    positionSort(topBar, sideBar, sort);

    // Setup window resize event to re-position sort if needs be
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        const resizeTimer = setTimeout(() =>  {
            positionSort(topBar, sideBar, sort);
        }, 500);
    });
}

function positionSort(topBar, sideBar, sort) {

    const productSortBreakpoint = 1199;

    if (breakpoint.minWidth > productSortBreakpoint) {

        // Sort needs to be in the side bar
        sideBar.prepend(sort);

    } else {

        // Sort needs to be in the top bar
        topBar.append(sort);

    }
}

export { init };