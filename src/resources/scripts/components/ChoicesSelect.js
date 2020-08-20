import log from 'salvo-lite/log'
import Choices from 'choices.js'

class ChoicesSelect {
    constructor (theme, elem) {
        this._theme = theme
        this._elem = elem
        this._choices = null
        log.debug(this.constructor.name, 'Constructed', this)
    }

    onInit () {
        log.debug(this.constructor.name, 'Initiating')

        this._choices = new Choices(this._elem, {
            searchEnabled: false,
            removeItems: false,
            paste: false,
            itemSelectText: '',
            shouldSort: false
        })

        log.debug(this.constructor.name, 'Initiated')
    }
}

export default ChoicesSelect
