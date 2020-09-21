export const breakpoint = {

    get current() {
        return window.getComputedStyle(document.querySelector('body'), ':before').getPropertyValue('content').replace(/\"/g, '');
    },

    get minWidth() {
        let minWidth = window.getComputedStyle(document.querySelector('body'), ':after').getPropertyValue('content').replace(/\"/g, '');
        return parseInt(minWidth);
    }
};