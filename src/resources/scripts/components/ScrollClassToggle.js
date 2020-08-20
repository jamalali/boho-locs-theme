import log from 'salvo-lite/log'

import getNodeDimensions from 'get-node-dimensions'

class ScrollClassToggle {
    constructor (theme, elem) {
        this._elem = elem
        this._scrollElem = elem.querySelector('[data-scroll-class-toggle-elem]')
        this._scrollTriggers = elem.querySelectorAll('[data-scroll-class-toggle-trigger]')
        this._elemsToToggle = elem.querySelectorAll('[data-scroll-class-toggle-change]')

        log.debug(this.constructor.name, 'Constructed', this)
    }

    onInit () {
        log.debug(this.constructor.name, 'Initializing', this)
        this._getParentOffset()
        this._initElemScrollEvents()
        this._initListenForChange()
        this._initClickToScrollTo()

        log.debug(this.constructor.name, 'Initialized', this)
    }

    _getParentOffset () {
        this._parentOffset = this._elem.getBoundingClientRect().top
        this._scrollElemHeight = getNodeDimensions(this._scrollElem).height
        this._distanceFromTop = this._scrollElemHeight / 5

        window.addEventListener('resize', () => {
            this._parentOffset = this._elem.getBoundingClientRect().top
            this._scrollElemHeight = getNodeDimensions(this._scrollElem).height
            this._distanceFromTop = this._scrollElemHeight / 5

            log.debug(this.constructor.name, 'Resize - Calculating Offsets', this)
        })

        log.debug(this.constructor.name, 'Calculating Offsets', this)
    }

    _initListenForChange () {
        document.addEventListener('relativeElemScroll', e => {
            this._elemsToToggle[this._currentActive - 1].classList.add('scroll-active')

            for (const toggleElem of this._elemsToToggle) {
                if (toggleElem !== this._elemsToToggle[this._currentActive - 1]) toggleElem.classList.remove('scroll-active')
            }

            log.debug(this.constructor.name, 'New active scroll', this)
        })
    }

    _initElemScrollEvents () {
        this._scrollElem.addEventListener('scroll', e => {
            this._currentActive = 0
            for (const item of this._scrollTriggers) {
                let offset = this._getWindowRelativeOffset(item)
                // console.log(`Offset: ${offset}`)

                if (offset < this._distanceFromTop) {
                    item.classList.add('scroll-active')
                    for (const elem of this._scrollTriggers) {
                        if (item !== elem) {
                            elem.classList.remove('scroll-active')
                        }
                    }

                    this._currentActive += 1
                    document.dispatchEvent(new Event('relativeElemScroll'))
                }
            }
        }, false)
    }

    _initClickToScrollTo () {
        // let toggleIndex = 0
        for (const toggleElem of this._elemsToToggle) {
            // toggleIndex++
            toggleElem.addEventListener('click', e => {
                let toggleIndex = [...toggleElem.parentElement.children].indexOf(toggleElem)
                let scrollDistance = this._getWindowRelativeOffset(this._scrollTriggers[toggleIndex])

                console.log(`clicked on ${toggleIndex}`)

                // this._elemsToToggle[toggleIndex].classList.add('scroll-active')

                this._scrollElem.scroll({
                    top: scrollDistance,
                    behavior: 'smooth'
                })
            })
        }
    }

    _getWindowRelativeOffset (elem) {
        let elemFromTop = elem.getBoundingClientRect().top
        let childOffset = elemFromTop - this._parentOffset
        return childOffset
    };
}

export default ScrollClassToggle
