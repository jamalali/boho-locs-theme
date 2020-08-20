import log from 'salvo-lite/log'
import axios from 'axios'
import Queue from '../helpers/Queue.js'

class AjaxCart {
    constructor (theme, elem) {
        this.theme = theme
        this._elem = elem
        this._queue = new Queue()
        this._events = this.createEvents()
        if (this._elem.nodeName === 'FORM') {
            this._button = this._elem.querySelector('button[type="submit"]')
        } else {
            this._button = this._elem
        }
        this.addingText = this.theme.locale.global.products.product.adding
        this.addedText = this.theme.locale.global.products.product.added
        this._options = Object.assign({
            gtm: null,
            nosto: null
        }, JSON.parse(this._elem.dataset.ajaxCart || '{}'))
        this._nosto = window.Nosto || null
        this._nostojs = window.nostojs || null
        this._nostoApi = null
        log.debug(this.constructor.name, 'Constructed', this)
    }

    onInit () {
        log.debug(this.constructor.name, 'Initiating')

        if (this._nostojs) {
            this._nostojs(api => {
                this._nostoApi = api
            })
        }

        if (this._elem.nodeName === 'FORM') {
            this._elem.addEventListener('submit', (e) => {
                e.preventDefault()
                if (this._options.nosto && this._nosto) {
                    this.nostoAddToCart()
                } else {
                    this.addToCart()
                }
            })
            if (this._button) {
                this._button.addEventListener('click', e => {
                    e.stopPropagation()
                })
            }
        } else {
            this._elem.addEventListener('click', (e) => {
                e.preventDefault()
                e.stopPropagation()
                if (this._options.nosto && this._nosto) {
                    this.nostoAddToCart()
                } else {
                    this.addToCart()
                }
            })
        }
        this._elem.setAttribute('ajax-cart-initiated', true)
        log.debug(this.constructor.name, 'Initiated')
    }

    addToCart () {
        this._queue.enqueue(() => {
            let originalText = this._button.innerHTML
            this._button.innerHTML = `${this.addingText}...`
            let variantId = this._elem.dataset.variantId || this._elem.querySelector("[name='id']").value
            let quantity = parseInt(this._elem.dataset.quantity) || this._elem.querySelector("[name='quantity']").value
            let properties = {}
            let propElems = this._elem.querySelectorAll('input[name^="properties"], select[name^="properties"]')

            for (let propElem of propElems) {
                // Just accept it
                let name = propElem.getAttribute('name').split('[')[1].split(']')[0]
                properties[name] = propElem.value
            }

            return axios.post('/cart/add.js', {
                id: variantId,
                quantity: quantity,
                properties: properties
            }).then(response => {
                log.debug(this.constructor.name, 'Added item')
                this._button.innerHTML = `${this.addedText}`
                setTimeout(() => {
                    this._button.innerHTML = originalText
                }, 2500)
                if (this._options.gtm) {
                    this._options.gtm.ecommerce.add.products[0].quantity = quantity
                    window.dataLayer.push(this._options.gtm)
                }
                if (this._options.nosto) {
                    this._nostoApi.recommendedProductAddedToCart(this._options.nosto.handle, this._options.nosto.feed)
                }
                document.dispatchEvent(this._events.addedItem)
            })
        })
    }

    async nostoAddToCart () {
        let handle = this._options.nosto.handle
        try {
            let originalText = this._button.innerHTML
            this._button.innerHTML = `${this.addingText}...`
            let resp = await axios.get(`/products/${handle}.json`)
            this._button.innerHTML = originalText
            this._elem.querySelector("[name='id']").value = resp.data.product.variants[0].id
            this.addToCart()
        } catch (er) {
            console.log(er)
        }
    }

    createEvents () {
        return {
            addedItem: new Event('added-item')
        }
    }
}

export default AjaxCart
