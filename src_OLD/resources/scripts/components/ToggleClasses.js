import log from 'salvo-lite/log'

class ToggleClasses {
    constructor (theme, elem) {
        this._elem = elem
        this._removeClass = elem.dataset.removeClass
        this._addClass = elem.dataset.addClass
        this._toggleClass = elem.dataset.toggleClass
        this._onlyThisElem = elem.hasAttribute('data-only-this-elem')
        log.debug(this.constructor.name, 'Constructed', this)
    }

    onInit () {
        log.debug(this.constructor.name, 'Initializing', this)
        if (this._elem.dataset[`ESC${this.constructor.name}`]) {
            return false
        }
        this._elem.addEventListener('click', (e) => {
            let isValid = this._onlyThisElem ? e.target === this._elem : true

            if (isValid) {
                e.preventDefault()

                if (this._removeClass) {
                    let splits = this._removeClass.split(',')
                    for (let splitItem of splits) {
                        let theSplit = splitItem.split('|')
                        let selector = theSplit[0]
                        let theClass = theSplit[1]
                        let modifiers = theSplit.length > 2 ? theSplit[2] : ''
                        if (document.querySelector(selector)) {
                            for (let elemToModify of document.querySelectorAll(selector)) {
                                elemToModify.classList.remove(theClass)

                                if (elemToModify.querySelectorAll('video') && modifiers.includes('pause-videos')) {
                                    for (let video of elemToModify.querySelectorAll('video')) {
                                        video.pause()
                                    }
                                }

                                document.querySelector(selector).dispatchEvent(new Event('esc-removed-class'))
                            }
                        }
                    }
                }

                if (this._addClass) {
                    let splits = this._addClass.split(',')
                    for (let splitItem of splits) {
                        let theSplit = splitItem.split('|')
                        let selector = theSplit[0]
                        let theClass = theSplit[1]
                        let modifiers = theSplit.length > 2 ? theSplit[2] : ''
                        if (document.querySelector(selector)) {
                            for (let elemToModify of document.querySelectorAll(selector)) {
                                elemToModify.classList.add(theClass)

                                if (elemToModify.querySelectorAll('video') && modifiers.includes('play-videos')) {
                                    for (let video of elemToModify.querySelectorAll('video')) {
                                        video.play()
                                    }
                                }

                                document.querySelector(selector).dispatchEvent(new Event('esc-added-class'))
                            }
                        }
                    }
                }

                if (this._toggleClass) {
                    let splits = this._toggleClass.split(',')
                    for (let splitItem of splits) {
                        let theSplit = splitItem.split('|')
                        let selector = theSplit[0]
                        let theClass = theSplit[1]
                        if (document.querySelector(selector)) {
                            for (let elemToModify of document.querySelectorAll(selector)) {
                                elemToModify.classList.toggle(theClass)
                                document.querySelector(selector).dispatchEvent(new Event('esc-toggled-class'))
                            }
                        }
                    }
                }
            }
        })
        this._elem.dataset[`ESC${this.constructor.name}`] = true
        log.debug(this.constructor.name, 'Initialized', this)
    }
}

export default ToggleClasses
