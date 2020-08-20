class Helpers {
    static formatMoney (cents, format = '£{{amount}}') {
        if (typeof cents === 'string') {
            cents = cents.replace('.', '')
        }
        let value = ''
        let placeholderRegex = /\{\{\s*(\w+)\s*\}\}/

        switch (format.match(placeholderRegex)[1]) {
        case 'amount':
            value = Helpers.formatWithDelimiters(cents, 2)
            break
        case 'amount_no_decimals':
            value = Helpers.formatWithDelimiters(cents, 0)
            break
        case 'amount_with_comma_separator':
            value = Helpers.formatWithDelimiters(cents, 2, '.', ',')
            break
        case 'amount_no_decimals_with_comma_separator':
            value = Helpers.formatWithDelimiters(cents, 0, '.', ',')
            break
        }

        return format.replace(placeholderRegex, value).replace('.00', '')
    }

    static defaultOption (opt, def) {
        return (typeof opt === 'undefined' ? def : opt)
    }

    static formatWithDelimiters (number, precision, thousands, decimal) {
        precision = Helpers.defaultOption(precision, 2)
        thousands = Helpers.defaultOption(thousands, ',')
        decimal = Helpers.defaultOption(decimal, '.')

        if (isNaN(number) || number == null) {
            return 0
        }

        number = (number / 100.0).toFixed(precision)

        let parts = number.split('.')
        let dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands)
        let cents = parts[1] ? (decimal + parts[1]) : ''

        return dollars + cents
    }

    static camelize (str) {
        return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) => {
            return index === 0 ? letter.toLowerCase() : letter.toUpperCase()
        }).replace(/\s+/g, '')
    }

    static capitalizeFirstLetter (string) {
        return string.charAt(0).toUpperCase() + string.slice(1)
    }

    static getParent (elem, selector) {
        return elem.matches(selector) ? elem : (elem.parentElement ? Helpers.getParent(elem.parentElement, selector) : false)
    }

    static hasParent (elem, selector) {
        return elem.matches(selector) ? true : (elem.parentElement ? Helpers.hasParent(elem.parentElement, selector) : false)
    }

    static hasParentElem (elem, parentOfElem) {
        return elem === parentOfElem ? true : (elem.parentElement ? Helpers.hasParentElem(elem.parentElement, parentOfElem) : false)
    }

    static isElementInViewport (el) {
        let rect = el.getBoundingClientRect()
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        )
    }

    static formToObj (form) {
        let elems = form.querySelectorAll('input, textarea, select')
        let data = {}
        for (let element of elems) {
            let isValidElement = element.name && element.value
            let isValidValue = (!['checkbox', 'radio'].includes(element.type) || element.checked)

            if (isValidElement && isValidValue) {
                data[element.name] = element.value
            }
        }
        return data
    }

    static getSizedImageUrl (src, size) {
        if (size === null) {
            return src
        }

        if (src === null) {
            return ''
        }

        if (size === 'master') {
            return this.removeProtocol(src)
        }

        var match = src.match(/\.(jpg|jpeg|gif|png|bmp|bitmap|tiff|tif)(\?v=\d+)?$/i)

        if (match) {
            var prefix = src.split(match[0])
            var suffix = match[0]

            return this.removeProtocol(prefix[0] + '_' + size + suffix)
        } else {
            return null
        }
    }

    static removeProtocol (path) {
        return path.replace(/http(s)?:/, '')
    }

    static nextFrame (callback) {
        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(callback)
        })
    }

    static getEndpoint (type) {
        return `${type}?v=${(Math.floor(Math.random() * 10000000))}`
    }
}

export default Helpers
