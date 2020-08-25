import log from 'salvo-lite/log'
import axios from 'axios'
import Helpers from '../helpers/Helpers'

class AjaxForm {
    constructor (theme, elem) {
        this._theme = theme
        this._elem = elem
        this._success = this._elem.querySelector('[data-form-success]')
        this._error = this._elem.querySelector('[data-form-error]')
        this._inputsContainer = this._elem.querySelector('[data-form-inputs]')
        log.debug(this.constructor.name, 'Constructed', this)
    }

    onInit () {
        log.debug(this.constructor.name, 'Initiating')
        this._elem.addEventListener('submit', (e) => {
            e.preventDefault()
            this._submitForm()
        })
        log.debug(this.constructor.name, 'Initiated')
    }

    _submitForm () {
        let method = this._elem.getAttribute('method') || 'get'
        console.log(Helpers.formToObj(this._elem))
        return axios.request({
            method: method,
            url: this._elem.getAttribute('action'),
            data: Helpers.formToObj(this._elem)
        }).then(response => {
            console.log(response)
            if (this._success) {
                this._elem.dispatchEvent(new Event('form-success'))
                this._inputsContainer.classList.add('hide')
                this._success.classList.remove('hide')
            }
        }).catch(error => {
            console.log(error)
            if (this._error) {
                this._inputsContainer.classList.add('hide')
                this._error.classList.remove('hide')
            }
        })
    }
}

export default AjaxForm
