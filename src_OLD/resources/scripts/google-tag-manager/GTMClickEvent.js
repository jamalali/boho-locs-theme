import log from 'salvo-lite/log'

class GTMClickEvent {
    constructor (theme, elem) {
        this._name = this.constructor.name
        this._theme = theme
        this._elem = elem
        this._eventInfo = JSON.parse(this._elem.dataset.gtmClickEvent)
        this._dataLayer = window.dataLayer || []
    }

    onInit () {
        log.debug(this._name, 'Initiating', this)

        if (!this._dataLayer) return false

        this._elem.addEventListener('click', e => {
            console.log(e)
            e.preventDefault()
            this._eventInfo.eventCallback = () => {
                document.location = this._elem.getAttribute('href')
            }
            if (typeof window.google_tag_manager === 'undefined') {
                document.location = this._elem.getAttribute('href')
            }
            this._dataLayer.push(this._eventInfo)
        })

        log.debug(this._name, 'Initated', this)
    }
}
export default GTMClickEvent
