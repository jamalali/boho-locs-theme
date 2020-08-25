import log from 'salvo-lite/log'

class Navigation {
    constructor (theme, elem) {
        this._elem = elem
        this._items = this._elem.querySelectorAll('[data-navigation-item]')
        this._megaMenus = this._elem.querySelectorAll('[data-navigation-mega-menu]')
        this.timeout = null
    }

    onInit () {
        log.debug(this.constructor.name, 'Initiating', this)

        for (let navItem of this._items) {
            navItem.addEventListener('mouseenter', (e) => {
                if (this.timeout) {
                    this.clearRequestTimeout(this.timeout)
                    this.timeout = null
                }
                for (let megaMenu of this._megaMenus) {
                    megaMenu.classList.remove('shown')
                }
                let megaMenu = navItem.nextElementSibling
                megaMenu.classList.add('shown')
            })

            navItem.addEventListener('mouseleave', (e) => {
                this.timeout = this.requestTimeout(() => {
                    let megaMenu = navItem.nextElementSibling
                    megaMenu.classList.remove('shown')
                }, 500)
            })
        }

        for (let megaMenu of this._megaMenus) {
            let megaMenuInner = megaMenu.querySelector('[data-navigation-mega-menu-inner]')
            megaMenuInner.addEventListener('mouseenter', (e) => {
                if (this.timeout) {
                    this.clearRequestTimeout(this.timeout)
                    this.timeout = null
                }
                let navItem = megaMenu.previousElementSibling
                megaMenu.classList.add('shown')
                navItem.classList.add('mega-active')
            })

            megaMenuInner.addEventListener('mouseleave', (e) => {
                let navItem = megaMenu.previousElementSibling
                megaMenu.classList.remove('shown')
                megaMenu.isTransitioning = true
                navItem.classList.remove('mega-active')
            })
        }

        log.debug(this.constructor.name, 'Initated', this)
    }

    requestAnimFrame () {
        return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback, element) {
            window.setTimeout(callback, 1000 / 60)
        }
    }

    requestTimeout (fn, delay) {
        if (!window.requestAnimationFrame &&
      !window.webkitRequestAnimationFrame &&
      !(window.mozRequestAnimationFrame && window.mozCancelRequestAnimationFrame) &&
      !window.oRequestAnimationFrame &&
      !window.msRequestAnimationFrame) {
            return window.setTimeout(fn, delay)
        }
        let start = new Date().getTime()
        let handle = {}
        let instance = this
        function loop () {
            let current = new Date().getTime()
            let delta = current - start
            delta >= delay ? fn.call() : handle.value = instance.requestAnimFrame()(loop)
        }

        handle.value = this.requestAnimFrame()(loop)
        return handle
    }

    /**
   * Behaves the same as clearTimeout except uses cancelRequestAnimationFrame() where possible for better performance
   * @param {int|object} fn The callback function
   */
    clearRequestTimeout (handle) {
        window.cancelAnimationFrame ? window.cancelAnimationFrame(handle.value)
            : window.webkitCancelAnimationFrame ? window.webkitCancelAnimationFrame(handle.value)
                : window.webkitCancelRequestAnimationFrame ? window.webkitCancelRequestAnimationFrame(handle.value)
                    : window.mozCancelRequestAnimationFrame ? window.mozCancelRequestAnimationFrame(handle.value)
                        : window.oCancelRequestAnimationFrame ? window.oCancelRequestAnimationFrame(handle.value)
                            : window.msCancelRequestAnimationFrame ? window.msCancelRequestAnimationFrame(handle.value)
                                : clearTimeout(handle)
    }
}

export default Navigation
