import log from 'salvo-lite/log'
import axios from 'axios'

class GEOIP {
    constructor (theme, elem) {
        this.elem = elem
        this.location = {}
        this.options = Object.assign({
            shopCountry: 'GB',
            endpoint: 'https://ssl.geoplugin.net/json.gp?k=2268dc2e1da1ede9',
            redirections: {},
            countryKey: 'geoplugin_countryCode',
            regionKey: 'geoplugin_continentCode',
            cacheTimeout: 1000 * 60 * 10,
            overrideTime: 1000 * 60 * 60 * 24 * 7
        }, JSON.parse(this.elem.innerHTML))
        log.debug(this.constructor.name, 'Constructed', this)
    }

    async onInit () {
        log.debug(this.constructor.name, 'Initiating')
        log.debug(this.constructor.name, 'Log', this.options)
        this.checkOverride()

        if (localStorage.getItem('ESC-GEOIP-OVERRIDE')) {
            return false
        }

        await this.getLocation()
        this.doRedirects()
        log.debug(this.constructor.name, 'Initiated')
    }

    checkOverride () {
        if (this.getParameterByName('override')) {
            localStorage.setItem('ESC-GEOIP-OVERRIDE', new Date().getTime())
        }

        if (localStorage.getItem('ESC-GEOIP-OVERRIDE')) {
            let epoch = new Date().getTime()
            let overrideTime = parseInt(localStorage.getItem('ESC-GEOIP-OVERRIDE'))
            if ((epoch - overrideTime) >= this.options.overrideTime) {
                localStorage.removeItem('ESC-GEOIP-OVERRIDE')
            }
        }
    }

    doRedirects () {
        console.log(this.location)
        console.log(this.options.redirections)
        if (this.location.country === this.options.shopCountry) {
            return false
        }

        let redirections = this.options.redirections
        for (let redirect in redirections) {
            if (redirections.hasOwnProperty(redirect)) {
                let currentCountry = this.location[this.options.countryKey]
                if (currentCountry === redirect) {
                    window.top.location.href = `${redirections[redirect]}?redirected=true`
                    return false
                }

                if (redirect === '*') {
                    window.top.location.href = `${redirections[redirect]}?redirected=true`
                    return false
                }
            }
        }
    }

    getLocation () {
        if (this.getParameterByName('redirected')) {
            localStorage.removeItem('ESC-GEOIP')
        }

        if (localStorage.getItem('ESC-GEOIP')) {
            let epoch = new Date().getTime()
            this.location = JSON.parse(localStorage.getItem('ESC-GEOIP'))
            if ((epoch - this.location.epoch) >= this.options.cacheTimeout) {
                localStorage.removeItem('ESC-GEOIP')
            }
        }

        if (!localStorage.getItem('ESC-GEOIP')) {
            return axios.get(this.options.endpoint).then((response) => {
                this.location = response.data
                this.location.epoch = new Date().getTime()
                localStorage.setItem('ESC-GEOIP', JSON.stringify(this.location))
            }).catch(() => {
                log.debug(this.constructor.name, 'Network Error (Adblock)')
                this.location = { country: this.options.shopCountry }
            })
        }
    }

    getParameterByName (name, url) {
        if (!url) url = window.location.href
        name = name.replace(/[[]]/g, '\\$&')
        let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)')
        let results = regex.exec(url)
        if (!results) return null
        if (!results[2]) return ''
        return decodeURIComponent(results[2].replace(/\+/g, ' '))
    }
}

export default GEOIP
