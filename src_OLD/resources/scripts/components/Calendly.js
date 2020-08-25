import log from 'salvo-lite/log'
import getNodeDimensions from 'get-node-dimensions'

class Calendly {
    constructor (theme, elem) {
        this._theme = theme
        this._elem = elem
        this._header = document.querySelector('.site-header')
        this._close = document.querySelector('.calendly-close')
        log.debug(this.constructor.name, 'Constructed', this)
    }
    onInit () {
        let cookieClosed = this._getCookie('calendlyClose')
        this._close.addEventListener('click', e => {
            this._setCookie()
            this._hide()
        })
        let height = getNodeDimensions(this._header).height
        let closeHeight = getNodeDimensions(this._header).height
        let observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (!mutation.addedNodes) return

                for (var i = 0; i < mutation.addedNodes.length; i++) {
                    let node = mutation.addedNodes[i]
                    if (node.classList) {
                        if (node.classList.contains('calendly-badge-widget')) {
                            if (window.innerWidth > 480) {
                                height += 15
                            } else {
                                height += 10
                            }
                            if (window.innerWidth > 480) {
                                closeHeight += 20
                            } else {
                                closeHeight += 15
                            }
                            if (!cookieClosed) {
                                const close = document.querySelector('.calendly-close')
                                node.style.top = height + 'px'
                                close.classList.add('show')
                                close.style.top = closeHeight + 'px'
                            } else {
                                node.style.display = 'none'
                            }
                            observer.disconnect()
                        }
                    }
                }
            })
        })

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: false,
            characterData: false
        })
    }
    _getCookie (cname) {
        const name = cname + '='
        const decodedCookie = decodeURIComponent(document.cookie)
        const ca = decodedCookie.split(';')
        for (var i = 0; i < ca.length; i++) {
            let c = ca[i]
            while (c.charAt(0) === ' ') {
                c = c.substring(1)
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length)
            }
        }
        return ''
    }
    _setCookie () {
        const daysInSeconds = 60 * 60 * 24 * 7
        document.cookie = 'calendlyClose = true ;path=/ ;max-age=' + daysInSeconds
    }
    _hide () {
        document.querySelector('.calendly-badge-widget').style.display = 'none'
        document.querySelector('.calendly-close').style.display = 'none'
    }
}

export default Calendly
