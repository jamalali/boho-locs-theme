import log from 'salvo-lite/log'
import 'url-search-params-polyfill'

class SortURL {
    constructor (theme, elem) {
        this._elem = elem
    }

    onInit () {
        this._elem.addEventListener('click', (e) => {
            log.debug(this.constructor.name, 'Click event', this)
            const urlSearchParams = new URLSearchParams(window.location.search)
            urlSearchParams.set('sort_by', this._elem.dataset.sortUrl)
            window.location = `?${urlSearchParams}`
        })
    }
}

export default SortURL
