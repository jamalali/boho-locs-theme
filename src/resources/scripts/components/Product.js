import log from 'salvo-lite/log'
import { format } from 'money-formatter'

class Product {
    constructor (theme, elem) {
        this.theme = theme
        this._name = this.constructor.name
        this._elem = elem
        this.options = Object.assign({
            enableHistoryState: true
        }, JSON.parse(this._elem.dataset.options || '{}'))
        this.product = this._elem.querySelector('[data-product-json]') ? JSON.parse(this._elem.querySelector('[data-product-json]').innerHTML) : null
        this.singleOptionSelectors = this._elem.querySelectorAll('[data-single-option-selector]')
        this.currentVariant = this.getVariantFromOptions()
        this.originalSelector = this._elem.querySelector('[data-product-select]')
        this.priceWrappers = this._elem.querySelectorAll('[data-price-wrapper]')
        this.productPrices = this._elem.querySelectorAll('[data-product-price]')
        this.productComparePrices = this._elem.querySelectorAll('[data-compare-price]')
        this.addToCart = this._elem.querySelector('[data-add-to-cart]')
        this.addToCartText = this.addToCart ? this.addToCart.querySelector('[data-add-to-cart-text]') : null
    }

    triggerEvent (elem = this._elem, name = 'event', data = {}) {
        elem.dispatchEvent(new CustomEvent(name, { detail: data }))
    }

    onInit () {
        log.debug(this._name, 'Initiating', this)

        if (this.product === null) {
            return false
        }

        for (let optionSelector of this.singleOptionSelectors) {
            optionSelector.addEventListener('change', (e) => {
                this.onSelectChange()
            })
        }

        log.debug(this._name, 'Initated', this)
    }

    /**
   * Event handler for when a variant input changes.
   */
    onSelectChange () {
        let variant = this.getVariantFromOptions()

        if (!variant) {
            return
        }

        this.updateMasterSelect(variant)
        this.updateProductPrices(variant)
        this.updateAddToCartState(variant)
        this.updateKlarnaPlacements(variant)
        this.currentVariant = variant
        this.triggerEvent(this.elem, 'variantChange', variant)

        if (this.options.enableHistoryState) {
            this.updateHistoryState(variant)
        }
    }

    updateKlarnaPlacements (variant) {
        let klarnaElems = document.getElementsByTagName('klarna-placement')
        for (let elem of klarnaElems) {
            elem.setAttribute('data-purchase_amount', variant.price)
        }
        window.KlarnaOnsiteService = window.KlarnaOnsiteService || []
        window.KlarnaOnsiteService.push({ eventName: 'refresh-placements' })
    }

    /**
   * Update history state for product deeplinking
   *
   * @param {object} variant - Currently selected variant
   */
    updateHistoryState (variant) {
        if (!history.replaceState || !variant) {
            return
        }

        let newurl = window.location.protocol + '//' + window.location.host + window.location.pathname + '?variant=' + variant.id
        window.history.replaceState({path: newurl}, '', newurl)
    }

    /**
   * Updates the DOM state of the add to cart button
   *
   * @param {boolean} enabled - Decides whether cart is enabled or disabled
   * @param {string} text - Updates the text notification content of the cart
   */
    updateAddToCartState (variant) {
        if (variant) {
            for (let elem of this.priceWrappers) {
                elem.classList.remove('hide')
            }
        } else {
            this.addToCart.setAttribute('disabled', 'disabled')
            this.addToCartText.innerHTML = this.theme.locale.global.products.product.unavailable
            for (let elem of this.priceWrappers) {
                elem.classList.add('hide')
            }
            return
        }

        if (variant.available) {
            this.addToCart.removeAttribute('disabled')
            this.addToCartText.innerHTML = this.theme.locale.global.products.product.add_to_cart
        } else {
            this.addToCart.setAttribute('disabled', 'disabled')
            this.addToCartText.innerHTML = this.theme.locale.global.products.product.sold_out
        }
    }

    /**
   * Updates the DOM with specified prices
   *
   * @param {string} productPrice - The current price of the product
   * @param {string} comparePrice - The original price of the product
   */
    updateProductPrices (variant) {
        for (let elem of this.productPrices) {
            elem.innerHTML = this.formatMoney(variant.price)
        }

        if (variant.compare_at_price > variant.price) {
            for (let elem of this.productComparePrices) {
                elem.innerHTML = this.formatMoney(variant.compare_at_price)
            }
        } else {
            for (let elem of this.productComparePrices) {
                elem.innerHTML = ''
                elem.classList.add('hide')
            }
        }
    }

    /**
   * Update hidden master select of variant change
   *
   * @param {object} variant - Currently selected variant
   */
    updateMasterSelect (variant) {
        this.originalSelector.value = variant.id
    }

    getCurrentOptions () {
        let currentOptions = []
        for (let optionSelector of this.singleOptionSelectors) {
            let type = optionSelector.getAttribute('type')
            let currentOption = {}
            if (type === 'radio' || type === 'checkbox') {
                if (optionSelector.checked) {
                    currentOption.value = optionSelector.value
                    currentOption.index = optionSelector.dataset.index
                    currentOptions.push(currentOption)
                } else {
                    currentOptions.push(false)
                }
            } else {
                currentOption.value = optionSelector.value
                currentOption.index = optionSelector.dataset.index
                currentOptions.push(currentOption)
            }
        }

        // remove any unchecked input values if using radio buttons or checkboxes
        currentOptions = this.compact(currentOptions)
        return currentOptions
    }

    /**
   * Find variant based on selected values.
   *
   * @param  {array} selectedValues - Values of variant inputs
   * @return {object || undefined} found - Variant object from product.variants
   */
    getVariantFromOptions () {
        if (!this.product) return null
        let selectedValues = this.getCurrentOptions()
        let variants = this.product.variants
        let found = false

        for (let variant of variants) {
            var satisfied = true

            for (let option of selectedValues) {
                if (satisfied) {
                    satisfied = (option.value === variant[option.index])
                }
            }

            if (satisfied) {
                found = variant
            }
        }

        return found || null
    }

    compact (array) {
        var index = -1
        var length = array == null ? 0 : array.length
        var resIndex = 0
        var result = []

        while (++index < length) {
            var value = array[index]
            if (value) {
                result[resIndex++] = value
            }
        }
        return result
    }

    formatMoney (amount) {
        return format(this.theme.shopInfo.currency, parseFloat(amount / 100.00))
    }
}

export default Product
