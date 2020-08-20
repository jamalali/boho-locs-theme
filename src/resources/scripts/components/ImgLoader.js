import log from 'salvo-lite/log'
import Helpers from '../helpers/Helpers'

class ImgLoader {
    constructor (theme, elem) {
        this._theme = theme
        this._elem = elem
        this._options = Object.assign({
            url: null,
            when: 'instantly'
        }, JSON.parse(this._elem.dataset.imgLoader ? this._elem.dataset.imgLoader : '{}'))
        this._loaded = false

        this._backup = {
            'url': this._options.url,
            'url2x': this._options.url2x
        }

        if (this._options.responsive) {
            for (let responsiveObj of this._options.responsive) {
                console.log(responsiveObj.maxWidth + window.innerWidth)
                if (responsiveObj.maxWidth >= window.innerWidth) {
                    this._options.url = responsiveObj.settings.url
                    this._options.url2x = responsiveObj.settings.url2x
                    break
                }
            }
        }
        if (Helpers.hasParent(this._elem, '[data-slider]')) {
            this._options.when = 'instantly'
        }
        log.debug(this.constructor.name, 'Constructed', this)
    }

    onInit () {
        log.debug(this.constructor.name, 'Initiating 2')

        if (this._options.when === 'inview') {
            window.addEventListener('scroll', e => {
                if (this._loaded) return false
                if (this.isAnyPartOfElementInViewport()) {
                    this.loadImage()
                }
            }, { passive: true })

            if (this.isAnyPartOfElementInViewport()) {
                this.loadImage()
            }
            document.addEventListener('DOMContentLoaded', () => {
                if (this.isAnyPartOfElementInViewport()) {
                    this.loadImage()
                }
            })
        } else {
            this.loadImage()
        }

        log.debug(this.constructor.name, 'Initiated')
    }

    loadImage () {
        let img = new Image()
        let imageUrl = (this.isRetina() && this._options.url2x) ? this._options.url2x : this._options.url
        if (imageUrl.includes('cdn.shopify.com/s/assets/no-image')) {
            this._elem.classList.add('img-loaded')
            this._loaded = true
            return
        }
        img.onload = () => {
            if (this._elem.nodeName === 'IMG') {
                this._elem.setAttribute('src', imageUrl)
            } else {
                this._elem.style.backgroundImage = `url("${imageUrl}")`
            }
            this._elem.classList.add('img-loaded')
            this._loaded = true
            document.dispatchEvent(new Event('updateScrollReveal'))

            // Update slick cloned
            if (Helpers.hasParent(this._elem, '[data-slider]')) {
                let clonedBgs = Helpers.getParent(this._elem, '[data-slider]').querySelectorAll('.slick-cloned [data-img-loader]')
                for (let clonedElem of clonedBgs) {
                    if (clonedElem.dataset.imgLoader === this._elem.dataset.imgLoader) {
                        if (this._elem.nodeName === 'IMG') {
                            clonedElem.setAttribute('src', imageUrl)
                        } else {
                            clonedElem.style.backgroundImage = `url("${imageUrl}")`
                        }
                        clonedElem.classList.add('img-loaded')
                    }
                }
            }
        }
        img.src = imageUrl
    }

    isAnyPartOfElementInViewport () {
        const rect = this._elem.getBoundingClientRect()
        const windowHeight = (window.innerHeight || document.documentElement.clientHeight)
        const windowWidth = (window.innerWidth || document.documentElement.clientWidth)

        const vertInView = (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0)
        const horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0)

        return (vertInView && horInView)
    }

    isRetina () {
        let mediaQuery = `(-webkit-min-device-pixel-ratio: 1.5),
                (min--moz-device-pixel-ratio: 1.5),
                (-o-min-device-pixel-ratio: 3/2),
                (min-resolution: 1.5dppx)`
        if (window.devicePixelRatio > 1) {
            return true
        }
        if (window.matchMedia && window.matchMedia(mediaQuery).matches) {
            return true
        }
        return false
    }
}

export default ImgLoader
