export let body = document.querySelector('body');

let scrollY;
let scrollDisabledClass = 'scrolling-off';

export function disableScroll() {

    scrollY = window.scrollY;

    // There are also some styles added to <body> in mobile-menu.js
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    
    body.classList.add(scrollDisabledClass);
}

export function enableScroll() {
    body.style.position = '';
    body.style.top = '';

    window.scrollTo(0, scrollY);

    body.classList.remove(scrollDisabledClass);
}