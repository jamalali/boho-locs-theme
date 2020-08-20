import log from 'salvo-lite/log'

class SelectURL {
    constructor (theme, elem) {
        this._select = elem
    }

    onInit () {
        this._select.addEventListener('change', (e) => {
            log.debug('SelectURL', 'Change event', this)

            if (this._select.dataset.selectUrl === 'sort') {
                const urlSearchParams = new URLSearchParams(window.location.search)
                urlSearchParams.set(this._select.name, this._select.value)
                window.location = `?${urlSearchParams}`
            } else {
                window.location.href = this._select.value
            }
        })
    }
}

export default SelectURL
