import './resources/scss/main.scss';

import $ from 'jquery';
window.jQuery = $;
window.$ = $;

import { Marquee } from './resources/js/modules/marquee';
import * as MobileMenu from './resources/js/modules/mobile-menu';
import * as Carousel from './resources/js/modules/carousel';
import * as MenuDropdown from './resources/js/modules/menu-dropdown';

MobileMenu.init();
Carousel.init();
MenuDropdown.init();

// Setup marquees
let marquees = document.querySelectorAll('.esc-marquee');

for (var i=0; i<marquees.length; i++) {
    let marquee = new Marquee(marquees[i]);
    marquee.init();
}