import log from 'salvo-lite/log'
import Helpers from '../helpers/Helpers'
import { setTimeout, clearTimeout } from 'requestanimationframe-timer'

class GTMImpressions {
    constructor (theme, elem) {
        this._name = this.constructor.name
        this._theme = theme
        this._elem = elem
        this._eventInfo = JSON.parse(this._elem.dataset.gtmImpressions)
        this._impressionElems = this._elem.querySelectorAll('[data-gtm-impression-item]')
        this._currentQueue = []
        this._allTimeQueue = []
        this._dataLayer = window.dataLayer || []
        this._resetTimer = false
        this._delay = 100
        this._timeout = null
    }

    onInit () {
        log.debug(this._name, 'Initiating', this)

        if (!this._dataLayer) return false

        document.addEventListener('refreshImpressionElems', e => {
            this._impressionElems = this._elem.querySelectorAll('[data-gtm-impression-item]')
        })

        document.addEventListener('checkImpressions', e => {
            this.checkImpressions()
        })

        this.resetTimer()

        window.addEventListener('scroll', e => {
            this.checkImpressions()
        }, { passive: true })
        log.debug(this._name, 'Initated', this)
    }

    checkImpressions () {
        clearTimeout(this._timeout)
        this.resetTimer()
        this.mainVisibilityLoop()
    }

    resetTimer () {
        this._timeout = setTimeout(() => { this.sendGTMEvent() }, this._delay)
    }

    sendGTMEvent () {
        if (this._currentQueue.length) {
            this._eventInfo.ecommerce.impressions = this._currentQueue
            this._dataLayer.push(this._eventInfo)
            this._currentQueue = []
        }
        this.resetTimer()
    }

    mainVisibilityLoop () {
        for (let elem of this._impressionElems) {
            if (!Helpers.isElementInViewport(elem)) continue
            let gtmEvent = JSON.parse(elem.dataset.gtmImpressionItem)
            if (this._currentQueue.filter(gtm => gtm.id === gtmEvent.id).length > 0 || this._allTimeQueue.filter(gtm => gtm.id === gtmEvent.id).length > 0) {
                continue
            }
            if (elem.hasAttribute('data-slick-index') && !elem.classList.contains('slick-active')) {
                continue
            }
            this._currentQueue.push(gtmEvent)
            this._allTimeQueue.push(gtmEvent)
        }
    }
}
export default GTMImpressions
