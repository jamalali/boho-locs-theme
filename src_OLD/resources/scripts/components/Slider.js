import 'slick-carousel'
import jQuery from 'jquery'

import log from 'salvo-lite/log'

class Slider {
    constructor (theme, elem) {
        this._name = this.constructor.name
        this.elem = elem
        this.options = Object.assign({
            arrows: false,
            dots: false,
            autoplay: false,
            infinite: true,
            draggable: true,
            slidesToShow: 1,
            mobileOnly: false,
            swipe: true,
            dontInit: false,
            showAbove: null,
            showBelow: null,
            titleDots: false,
            overrideScroll: false
        }, JSON.parse(this.elem.dataset.options))

        if (this.options.mobileOnly) {
            this.options.showBelow = 769
        }

        if (this.options.titleDots) {
            this.options.customPaging = this.buildTitleDots
        }

        this.slick = jQuery(this.elem)
    }

    onInit () {
        if (!this.options.dontInit) {
            this.init()
        }
    }

    init () {
        if (this.options.showAbove && window.innerWidth <= this.options.showAbove) {
            return false
        }

        if (this.options.showBelow && window.innerWidth >= this.options.showBelow) {
            return false
        }

        if (this.options.overrideScroll) this._overrideScroll()

        this.slick.on('init', (e, slick) => {
            this.elem.dispatchEvent(new Event('sliderRendered'))
            let vid = slick.$slides.length ? slick.$slides[0].querySelector('video') : false
            if (vid) {
                vid.play()
                vid.removeAttribute('poster')
            }
        })

        this.slick.not('.slick-initialized').slick(this.options)

        this.slick.on('beforeChange', (e, slick, curSlide, nextSlide) => {
            let vid = slick.$slides[curSlide].querySelector('video')
            if (vid) {
                vid.pause()
            }

            let direction

            if (curSlide === 0 && nextSlide === slick.$slides.length - 1) {
                // its going from the first slide to the last slide (backwards)
                direction = 'prev'
            } else if (nextSlide > curSlide || (curSlide === (slick.$slides.length - 1) && nextSlide === 0)) {
                // its either going normally forwards or going from the last slide to the first
                direction = 'next'
            } else {
                direction = 'prev'
            }

            if (slick.$nextArrow != null) {
                slick.$nextArrow[0].classList.remove(`slick-direction-prev`, `slick-direction-next`)
                slick.$nextArrow[0].classList.add(`slick-direction-${direction}`)
            }
            if (slick.$prevArrow != null) {
                slick.$prevArrow[0].classList.remove(`slick-direction-prev`, `slick-direction-next`)
                slick.$prevArrow[0].classList.add(`slick-direction-${direction}`)
            }
        })

        this.slick.on('afterChange', (e, slick, curSlide) => {
            let vid = slick.$slides[curSlide].querySelector('video')
            if (vid) {
                vid.play()
                vid.removeAttribute('poster')
            }

            if (curSlide === 0) {
                if (slick.$nextArrow) {
                    slick.$nextArrow[0].classList.add(`slick-direction-next`)
                }
                if (slick.$prevArrow) {
                    slick.$prevArrow[0].classList.add(`slick-direction-next`)
                }
            }
            document.dispatchEvent(new Event('checkImpressions'))
        })
    }

    buildTitleDots (slider, i) {
        let title = slider.$slides[i].dataset.title
        return `<a><span>${title}</a>`
    }

    _overrideScroll () {
        log.debug(this._name, 'Override Scroll', this)
        let siteHeader = document.querySelector('.site-header')
        let headerHeight = siteHeader.getBoundingClientRect().height
        window.addEventListener('wheel', e => this._checkScroll(e, headerHeight))
        window.addEventListener('DOMMouseScroll', e => this._checkScroll(e, headerHeight))
    }

    _checkScroll (e, headerHeight) {
        let yCoor = this.elem.getBoundingClientRect().y
        if (e.deltaY > 0 && yCoor <= headerHeight) {
            log.debug(this._name, 'SCROLLING DOWN', this)
            log.debug(this._name, 'yCoor', yCoor)
            log.debug(this._name, 'headerHeight', headerHeight)
        }
    }

    _preventDefault (e) {
        e = e || window.event
        if (e.preventDefault) e.preventDefault()
        e.returnValue = false
    }
}

export default Slider
