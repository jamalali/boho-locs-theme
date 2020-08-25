import log from 'salvo-lite/log'

class SlidingMenu {
    constructor (theme, elem) {
        this._elem = elem
        this._slidingArea = elem.querySelector('[data-moving-container]')
        this._navItems = elem.querySelectorAll('[data-nav-item]')
        log.debug(this.constructor.name, 'Constructed', this)
    }

    onInit () {
        log.debug(this.constructor.name, 'Initializing', this)

        for (let navItem of this._navItems) {
            let navLinks = navItem.querySelectorAll('[data-level]')

            for (let link of navLinks) {
                let linkLevel = parseInt(link.dataset.level)
                let menuArea = link.dataset.menuArea
                link.addEventListener('click', (e) => {
                    e.preventDefault()
                    if (menuArea) {
                        this.showMenu(linkLevel, menuArea)
                    }
                    this.goToLevel(linkLevel)
                })
            }
        }

        log.debug(this.constructor.name, 'Initialized', this)
    }

    showMenu (level, menuHandle) {
        let toHide = this._elem.querySelectorAll(`[data-nav-item='${level}'] > nav`)
        let toShow = this._elem.querySelector(`[data-nav-item='${level}'] [data-menu-area='${menuHandle}']`)
        for (let navItem of toHide) {
            navItem.classList.add('hide')
        }
        toShow.classList.remove('hide')
    }

    goToLevel (level) {
        this._slidingArea.style.transform = `translateX(-${level - 1}00vw)`
    }
}

export default SlidingMenu
