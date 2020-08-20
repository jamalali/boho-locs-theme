import getNodeDimensions from 'get-node-dimensions'

class SlideToggle {
    constructor (theme, elem) {
        this._name = this.constructor.name
        this._elem = elem
        this._settings = this._elem.dataset.slideToggle ? JSON.parse(this._elem.dataset.slideToggle) : {}
        this._items = document.querySelectorAll(this._settings.selector)
        this._transitioning = false
    }

    onInit () {
        if (this._settings.lessThan && window.innerWidth >= this._settings.lessThan) {
            return false
        }

        this._elem.addEventListener('click', (e) => {
            e.preventDefault()
            if (this._transitioning) return false
            this._transitioning = true
            for (let elem of this._items) {
                this.toggleElem(elem)
            }
        })
    }

    closeElem (elem) {
        let instance = this
        let dimensions = getNodeDimensions(elem)
        elem.style.maxHeight = `${dimensions.height}px`
        this._elem.classList.remove('open')

        let closeEvent = e => {
            if (e.propertyName === 'max-height') {
                instance._transitioning = false
                elem.removeEventListener('transitionend', closeEvent, false)
            }
        }
        elem.addEventListener('transitionend', closeEvent, false)
        this.nextFrame(() => {
            elem.style.maxHeight = `0px`
            elem.classList.remove('open')
        })
    }

    openElem (elem) {
        let instance = this
        elem.style.maxHeight = 'none'
        let dimensions = getNodeDimensions(elem)
        elem.style.maxHeight = '0px'
        this._elem.classList.add('open')

        let openEvent = e => {
            if (e.propertyName === 'max-height') {
                instance._transitioning = false
                elem.style.maxHeight = 'none'
                elem.classList.add('open')
                elem.removeEventListener('transitionend', openEvent, false)
            }
        }
        elem.addEventListener('transitionend', openEvent, false)
        this.nextFrame(() => {
            elem.style.maxHeight = `${dimensions.height}px`
        })
    }

    toggleElem (elem) {
        if (elem.classList.contains('open')) {
            this.closeElem(elem)
        } else {
            this.openElem(elem)
        }
    }

    nextFrame (callback) {
        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(callback)
        })
    }
}
export default SlideToggle
