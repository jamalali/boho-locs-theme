import getNodeDimensions from 'get-node-dimensions'

class StyleHeight {
    constructor (theme, elem) {
        this._elem = elem
        this._options = Object.assign({
            getHeightFrom: [],
            selectors: [],
            applyAbove: null,
            applyBelow: null
        }, JSON.parse(this._elem.dataset.styleHeight))
        this._notFound = []
        this._countdown = 500
        this._totalHeight = 0
    }

    onInit () {
        this.applySelectors()
    }

    refresh () {
        this.applySelectors()
    }

    applySelectors () {
        if (this._options.applyAbove && window.innerWidth <= this._options.applyAbove) {
            return false
        }

        if (this._options.applyBelow && window.innerWidth >= this._options.applyBelow) {
            return false
        }
        let totalHeight = 0
        for (let elemSelector of this._options.getHeightFrom) {
            if (document.querySelector(elemSelector)) {
                totalHeight += getNodeDimensions(document.querySelector(elemSelector)).height
            } else {
                this._notFound.push(elemSelector)
            }
        }
        this._totalHeight = totalHeight
        for (let selector of this._options.selectors) {
            if (totalHeight > 0) {
                this._elem.style[selector] = `${totalHeight}px`
            }
        }
        this.waitForNotFound()
    }
    waitForNotFound () {
        if (this._countdown > 0) {
            let newArray = []
            for (let elemSelector of this._notFound) {
                if (document.querySelector(elemSelector)) {
                    this._totalHeight += getNodeDimensions(document.querySelector(elemSelector)).height
                } else {
                    newArray.push(elemSelector)
                }
            }
            for (let selector of this._options.selectors) {
                if (this._totalHeight > 0) {
                    this._elem.style[selector] = `${this._totalHeight}px`
                }
            }
            if (newArray.length > 0) {
                this._notFound = newArray
                window.requestAnimationFrame(() => {
                    this._countdown--
                    this.waitForNotFound()
                })
            }
        }
    }
}

export default StyleHeight
