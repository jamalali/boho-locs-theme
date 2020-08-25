import log from 'salvo-lite/log'
import Sticky from '../vendor/Sticky'

class StickyElem {
    constructor (theme, elem) {
        this._theme = theme
        this._elem = elem
        this._sticky = null
        this._options = Object.assign({
            wrap: false,
            marginTop: 0,
            marginTopTablet: 0,
            marginTopMobile: 0,
            stickyFor: 0,
            stickyClass: null,
            bottomClass: null,
            bottomOffset: 0,
            dontInit: false
        }, JSON.parse(this._elem.dataset.options || '{}'))
        log.debug(this.constructor.name, 'Constructed', this)

        if (!this._options.dontInit) {
            this.init()
        }
    }

    onInit () {
    }

    init () {
        log.debug(this.constructor.name, 'Initiating')
        this._sticky = new Sticky(this._elem, this._options)

        document.addEventListener('update-sticky', (e) => {
            this._sticky.update()
        })
        log.debug(this.constructor.name, 'Initiated')
    }
}

export default StickyElem
