import getNodeDimensions from 'get-node-dimensions'
import Helpers from '../helpers/Helpers'

class NewsletterBar {
    constructor (theme, elem) {
        this._elem = elem
        this._theme = theme
        this._closeElem = this._elem.querySelector('[data-close]')
        this._formElem = this._elem.querySelector('[data-ajax-form]')
        this._headerComp = this._theme.getComponentsById('headerStyleHeight')
        this._mainComp = this._theme.getComponentsById('mainStyleHeight')
        this._openElem = this._elem.querySelector('[data-newsletter-bar-maximize]')
        this._headerCompElem = this._headerComp._elem
        this._transitioning = false
    }

    onInit () {
        if (!localStorage.getItem('newsletter-bar-hidden')) {
            this.openElem(this._elem)
        }

        this._closeElem.addEventListener('click', e => {
            e.preventDefault()
            localStorage.setItem('newsletter-bar-hidden', true)
            this.closeElem(this._elem)
        })

        this._openElem.addEventListener('click', e => {
            e.preventDefault()
            this._elem.classList.add('open')
            this.openElem(this._elem)
        })

        this._formElem.addEventListener('form-success', e => {
            localStorage.setItem('newsletter-bar-hidden', true)
        })
    }

    closeElem (elem) {
        let instance = this
        let dimensions = getNodeDimensions(elem)
        elem.style.maxHeight = `${dimensions.height}px`

        let closeEvent = e => {
            if (e.propertyName === 'max-height') {
                instance._transitioning = false
                document.dispatchEvent(new Event('update-sticky'))
                instance._headerComp.refresh()
                instance._mainComp.refresh()
                elem.removeEventListener('transitionend', closeEvent, false)
            }
        }
        elem.addEventListener('transitionend', closeEvent, false)
        Helpers.nextFrame(() => {
            elem.style.maxHeight = `0px`
            this._headerCompElem.style.paddingTop = `1px`
        })
    }

    openElem (elem) {
        let instance = this
        elem.style.maxHeight = 'none'
        let dimensions = getNodeDimensions(elem)
        elem.style.maxHeight = '0px'

        let openEvent = e => {
            if (e.propertyName === 'max-height') {
                instance._transitioning = false
                elem.style.maxHeight = 'none'
                document.dispatchEvent(new Event('update-sticky'))
                instance._headerComp.refresh()
                instance._mainComp.refresh()
                elem.removeEventListener('transitionend', openEvent, false)
            }
        }
        elem.addEventListener('transitionend', openEvent, false)
        Helpers.nextFrame(() => {
            elem.style.maxHeight = `${dimensions.height}px`
            this._headerCompElem.style.paddingTop = `${dimensions.height}px`
        })
    }
}

export default NewsletterBar
