import log from 'salvo-lite/log'

class ToggleSearch {
    constructor (theme, elem) {
        this._elem = elem
        this._searchFormButton = this._elem.querySelector('[data-search-button]')
        this._searchFormInput = this._elem.querySelector('[data-search-input]')
        log.debug(this.constructor.name, 'Constructed', this)
    }

    onInit () {
        log.debug(this.constructor.name, 'Initializing', this)

        document.addEventListener('click', (e) => {
            if (e.target !== this._elem && e.target.parentNode && e.target.parentNode !== this._elem && this._searchFormInput.value.length === 0) {
                this._elem.classList.remove('open')
            }
        })

        this._searchFormButton.addEventListener('click', (e) => {
            if (this._searchFormInput.value.length > 0) {
                return false
            } else {
                e.preventDefault()
            }

            this._elem.classList.toggle('open')

            if (this._elem.classList.contains('open')) {
                this._searchFormButton.setAttribute('type', 'submit')

                setTimeout(() => {
                    this._searchFormInput.focus()
                }, 350)
            } else {
                this._searchFormButton.setAttribute('type', 'button')
            }
        })

        log.debug(this.constructor.name, 'Initialized', this)
    }
}

export default ToggleSearch
