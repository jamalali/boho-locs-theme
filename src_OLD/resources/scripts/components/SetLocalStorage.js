import log from 'salvo-lite/log'

class SetLocalStorage {
    constructor (theme, elem) {
        this._name = this.constructor.name
        this._theme = theme
        this._elem = elem
        this._localStorageInfo = JSON.parse(this._elem.dataset.setLocalStorage || '{}')
    }

    onInit () {
        log.debug(this._name, 'Initiating', this)

        if (!this._localStorageInfo) return false

        if (this._elem.nodeName === 'FORM') {
            this._elem.addEventListener('submit', e => {
                localStorage.setItem(this._localStorageInfo.key, this._localStorageInfo.value)
            })
        } else {
            this._elem.addEventListener('click', e => {
                localStorage.setItem(this._localStorageInfo.key, this._localStorageInfo.value)
            })
        }

        log.debug(this._name, 'Initated', this)
    }
}
export default SetLocalStorage
