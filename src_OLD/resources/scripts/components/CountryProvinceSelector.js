import log from 'salvo-lite/log'

class CountryProvinceSelector {
    constructor (theme, elem) {
        this.elem = elem
        this.countryEl = this.elem.querySelector('[data-country-selector]')
        this.provinceEl = this.elem.querySelector('[data-province-selector]')
        this.provinceContainer = this.elem.querySelector('[data-province-container]')
        log.debug(this.constructor.name, 'Constructed', this)
    }

    onInit () {
        this.countryEl.addEventListener('change', (e) => {
            this.countryHandler()
        })
        this.initCountry()
        this.initProvince()
    }

    initCountry () {
        var t = this.countryEl.getAttribute('data-default')
        this.setSelectorByValue(this.countryEl, t)
        this.countryHandler()
    }

    initProvince () {
        var t = this.provinceEl.getAttribute('data-default')
        t && this.provinceEl.options.length > 0 && this.setSelectorByValue(this.provinceEl, t)
    }

    countryHandler () {
        var t = this.countryEl.options[this.countryEl.selectedIndex]
        var e = t.getAttribute('data-provinces')
        var n = JSON.parse(e)

        this.clearOptions(this.provinceEl)
        if (n && n.length === 0) {
            this.provinceContainer.style.display = 'none'
        } else {
            for (var i = 0; i < n.length; i++) {
                t = document.createElement('option')
                t.value = n[i][0]
                t.innerHTML = n[i][1]
                this.provinceEl.appendChild(t)
            }
            this.provinceContainer.style.display = ''
        }
    }

    setSelectorByValue (t, e) {
        for (var n = 0, i = t.options.length; n < i; n++) {
            var o = t.options[n]
            if (e === o.value || e === o.innerHTML) {
                t.selectedIndex = n
                return n
            }
        }
    }

    clearOptions (t) {
        for (; t.firstChild;) t.removeChild(t.firstChild)
    }

    setOptions (t, e) {
        var n = 0
        for (e.length; n < e.length; n++) {
            var i = document.createElement('option')
            i.value = e[n]
            i.innerHTML = e[n]
            t.appendChild(i)
        }
    }
}

export default CountryProvinceSelector
