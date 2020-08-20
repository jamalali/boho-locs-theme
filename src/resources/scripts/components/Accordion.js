import log from 'salvo-lite/log'
import imagesLoaded from 'imagesloaded'

class Accordion {
    constructor (theme, elem) {
        this._name = this.constructor.name
        this._elem = elem
        this._items = this._elem.querySelectorAll('[data-accordion-item]')
    }

    onInit () {
        log.debug(this._name, 'Initiating', this)

        for (let accordionItem of this._items) {
            let header = accordionItem.querySelector('[data-accordion-header]')

            if (accordionItem.hasAttribute('data-close-mobile') && window.innerWidth <= 768) {
                accordionItem.classList.remove('open')
                accordionItem.classList.remove('initial')
                let content = accordionItem.querySelector('[data-accordion-content]')
                content.style.height = '0px'
            }

            header.addEventListener('click', (e) => {
                e.preventDefault()
                for (let otherAccordion of this._items) {
                    if (otherAccordion === accordionItem) continue
                    this.closeAccordion(otherAccordion)
                }
                this.toggleAccordion(accordionItem)
            })
        }

        imagesLoaded(this._elem, () => {
            this.updateAccordions()
        })
        log.debug(this._name, 'Initated accordion', this)
    }

    updateAccordions () {
        for (let accordionItem of this._items) {
            if (accordionItem.classList.contains('open')) {
                let content = accordionItem.querySelector('[data-accordion-content]')
                content.style.height = content.scrollHeight + 'px'
            }
        }
    }

    closeAccordion (accordion) {
        let content = accordion.querySelector('[data-accordion-content]')
        content.style.overflow = 'hidden'
        content.style.height = '0px'
        accordion.classList.remove('open')
    }

    openAccordion (accordion) {
        let content = accordion.querySelector('[data-accordion-content]')
        content.style.height = content.scrollHeight + 'px'
        accordion.classList.add('open')
    }

    toggleAccordion (accordion) {
        if (accordion.classList.contains('open')) {
            this.closeAccordion(accordion)
        } else {
            this.openAccordion(accordion)
        }
    }
}
export default Accordion
