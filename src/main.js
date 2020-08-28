import './resources/scss/main.scss';

import $ from 'jquery';
window.jQuery = $;
window.$ = $;

import * as MobileMenu from './resources/js/modules/mobile-menu';
import * as Carousel from './resources/js/modules/carousel';

MobileMenu.init();
Carousel.init();