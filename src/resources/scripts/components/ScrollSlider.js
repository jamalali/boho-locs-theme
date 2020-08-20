import log from 'salvo-lite/log'

class ScrollSlider {
    constructor (theme, elem) {
        this._elem = elem
        this._locked = false
        this._sliding = false
        this._slider = this._elem.querySelector('[data-info-slider]')
        this._sliderTrack = this._slider.querySelector('.slick-track')
        this._slideWidth = this._slider.querySelector('.slick-slide').getBoundingClientRect().width
        this._imageOverlapSlider = this._elem.querySelector('[data-image-slider]')
        this._imageOverlapSliderTrack = this._imageOverlapSlider.querySelector('.slick-track')
        this._imageOverlapHeight = this._imageOverlapSlider.querySelector('.slick-slide').getBoundingClientRect().height
        this._sliderObj = theme.getComponentsById('infoSlider')
        this._overlapSliderObj = theme.getComponentsById('imageSlider')
        this._lastScrollTop = 0
        this._completed = false
        log.debug(this.constructor.name, 'Constructed', this)
    }

    onInit () {
        log.debug(this.constructor.name, 'Initializing', this)

        if (window.innerWidth <= 768) {
            return false
        }

        window.addEventListener('scroll', e => {
            let st = window.pageYOffset || document.documentElement.scrollTop
            if (this._sliding) return false

            if (st > this._lastScrollTop) {
                // downscroll code
                console.log(this._elem.getBoundingClientRect().top)
                if (this._elem.getBoundingClientRect().top <= 160 && !this._completed) {
                    document.body.classList.add('no-scroll')
                    this._locked = true
                    console.log('LOCKED')
                } else {
                    document.body.classList.remove('no-scroll')
                    this._locked = false
                    console.log('UNLOCKED 1')
                }
            } else {
                // upscroll code
                if (this._elem.getBoundingClientRect().top <= 230 && this._elem.getBoundingClientRect().top >= 180) {
                    document.body.classList.add('no-scroll')
                    this._locked = true
                    console.log('LOCKED')
                }
            }
            this._lastScrollTop = st <= 0 ? 0 : st
        }, { passive: true })

        window.addEventListener('wheel', e => {
            if (!this._locked) return false
            // console.log(e)
            // console.log(this._sliderObj)
            this.sliderScroll(e)
            this.imageScroll(e)
        }, { passive: true })

        this._sliderObj.slick.on('beforeChange', (e, slick, curSlide, nextSlide) => {
            console.log('beforeChange')
            this._locked = false
            this._sliding = true
        })

        this._sliderObj.slick.on('afterChange', (e, slick, curSlide) => {
            console.log('afterChange')
            console.log(curSlide)
            if ((curSlide + 1) === slick.$slides.length) {
                console.log('COMPLETEd')
                document.body.classList.remove('no-scroll')
                this._completed = true
                this._locked = false
                this._sliding = false
            } else {
                this._completed = false
                setTimeout(() => {
                    this._locked = true
                    this._sliding = false
                }, 500)
            }
        })
        log.debug(this.constructor.name, 'Initialized', this)
    }

    imageScroll (e) {
        let currentTransformY = this._imageOverlapSliderTrack.style.transform ? parseFloat(this._imageOverlapSliderTrack.style.transform.match(/(-?\d+)px/g)[1]) : 0
        let newTransform = currentTransformY - e.deltaY

        console.log(currentTransformY)
        if (newTransform >= 0) newTransform = 0
        if (Math.abs(newTransform) > (this._overlapSliderObj.slick.slick('getSlick').slideCount - 1) * this._imageOverlapHeight) {
            newTransform = 0 - ((this._overlapSliderObj.slick.slick('getSlick').slideCount - 1) * this._imageOverlapHeight)
        }

        if (Math.abs(newTransform) > 0) {
            this._imageOverlapSliderTrack.style.transform = `translate3d(0px, ${newTransform}px, 0px)`
        }
    }

    sliderScroll (e) {
        let currentTransformX = this._sliderTrack.style.transform ? parseFloat(this._sliderTrack.style.transform.match(/(-?\d+)px/g)[0]) : 0
        let newTransform = currentTransformX - e.deltaY
        let currentSlide = this._sliderObj.slick.slick('slickCurrentSlide')

        if (Math.abs(newTransform) >= (this._sliderObj.slick.slick('getSlick').slideCount - 1) * this._slideWidth) {
            newTransform = 0 - ((this._sliderObj.slick.slick('getSlick').slideCount - 1) * this._slideWidth)
        }
        if (newTransform >= 0) newTransform = 0

        if (Math.abs(newTransform) > 0) {
            this._sliderTrack.style.transform = `translate3d(${newTransform}px, 0px, 0px)`
        }

        let goingRight = e.deltaY > 0

        if (goingRight && (currentSlide + 1) === this._sliderObj.slick.slick('getSlick').slideCount && (Math.abs(newTransform) >= (this._sliderObj.slick.slick('getSlick').slideCount - 1) * this._slideWidth)) {
            console.log('UNLOCK 2')
            this._locked = false
            document.body.classList.remove('no-scroll')
            return false
        }

        if (!goingRight && currentSlide === 0 && Math.abs(newTransform) === 0) {
            console.log('UNLOCK 3')
            this._locked = false
            document.body.classList.remove('no-scroll')
            return false
        }

        if (goingRight) {
            let nextWidthToChange = (currentSlide + 1) * this._slideWidth
            let percent = Math.abs(currentTransformX) / nextWidthToChange
            if (percent >= 0.75) {
                this._sliderObj.slick.slick('slickNext')
            }
        } else {
            let nextWidthToChange = (currentSlide - 1) * this._slideWidth
            let nextWidthDivider = nextWidthToChange
            if (nextWidthToChange === 0) nextWidthDivider = this._slideWidth
            console.log('currentTransform' + currentTransformX)
            console.log('nextWidth' + nextWidthToChange)
            console.log('percent' + (Math.abs(currentTransformX) - nextWidthToChange) / nextWidthToChange)
            let percent = (Math.abs(currentTransformX) - nextWidthToChange) / nextWidthDivider
            if (percent <= 0.25) {
                this._sliderObj.slick.slick('slickPrev')
            }
        }
    }
}

export default ScrollSlider
