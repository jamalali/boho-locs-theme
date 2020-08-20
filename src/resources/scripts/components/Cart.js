import log from 'salvo-lite/log'
import rivets from 'rivets'
import axios from 'axios'
import Queue from '../helpers/Queue'
import Helpers from '../helpers/Helpers'
import getNodeDimensions from 'get-node-dimensions'
import { format } from 'money-formatter'

class Cart {
    constructor (theme, elem) {
        this._theme = theme
        this._elem = elem
        this._sampleInformation = this._elem.querySelector('[data-sample-information]') ? JSON.parse(this._elem.querySelector('[data-sample-information]').innerHTML) : { amount: 0, sampleIds: [], items: [] }
        this._freeGiftInformation = this._elem.querySelector('[data-free-gift-information]') ? JSON.parse(this._elem.querySelector('[data-free-gift-information]').innerHTML) : { chooseEvery: 50, prodIds: [], items: [], limit: 0 }
        this._freeProductInformation = this._elem.querySelector('[data-free-product-information]') ? JSON.parse(this._elem.querySelector('[data-free-product-information]').innerHTML) : { enabled: false, amount: 0, freeProdIds: [], message: '' }
        this._recommendedProductInformation = this._elem.querySelector('[data-recommended-products]') ? JSON.parse(this._elem.querySelector('[data-recommended-products]').innerHTML) : { items: [] }
        this._shippingInformation = this._elem.querySelector('[data-shipping-info]') ? JSON.parse(this._elem.querySelector('[data-shipping-info]').innerHTML) : { threshold: null }
        this._data = {
            cart: JSON.parse(this._elem.dataset.cartData),
            sampleChoices: this._sampleInformation.items,
            recommendedProducts: this._recommendedProductInformation.items,
            sampleLimit: this._sampleInformation.limit,
            viewingSamples: false,
            viewingGifts: false,
            maxSamples: false,
            shippingThreshold: this._shippingInformation.threshold,
            freeGiftInformation: this._freeGiftInformation
        }
        this._renderElems = this._elem.querySelectorAll('[data-cart-render]')
        this._sampleListElems = this._elem.querySelectorAll('[data-sample-items]')
        this._giftListElems = this._elem.querySelectorAll('[data-gift-items]')
        this._data.cart = this.prepareData(this._data.cart)
        this.queue = new Queue()
        this._loadingContainers = this._elem.querySelectorAll('[data-cart-loading-container]')
        log.debug(this.constructor.name, 'Constructed', this)
    }

    getCartEndpoint (type) {
        return `${type}?v=${(Math.floor(Math.random() * 10000000))}`
    }

    rivetsBinders () {
        rivets.binders.ignore = {
            block: true,
            routine: function () {}
        }

        rivets.formatters.getSizedImage = (src, size) => {
            return this.getSizedImageUrl(src, size)
        }

        rivets.formatters.moneyNoSymbol = (value) => {
            return value / 100.0
        }

        rivets.formatters.moneyNoZeros = (value) => {
            return format(this._theme.shopInfo.currency, parseFloat(value / 100.0)).replace('.00', '')
        }

        rivets.formatters.money = (value) => {
            return format(this._theme.shopInfo.currency, parseFloat(value / 100.0))
        }

        rivets.formatters.moneyHTML = (value) => {
            let moneyVal = rivets.formatters.money(value)
            return moneyVal.replace(moneyVal.charAt(0), `<span>${moneyVal.charAt(0)}</span>`)
        }

        rivets.formatters.length = (arr) => {
            return arr.length
        }

        rivets.formatters.getItem = (arr, index) => {
            return (arr && arr.length) ? arr[parseInt(index)] : ''
        }

        rivets.formatters.awayFromFreeShipping = (cart) => {
            return this._data.shippingThreshold - cart.total_price
        }

        rivets.formatters.amountToFreeGiftMessage = (cart) => {
            let difference = (this._freeProductInformation.amount * 100.00) - this._data.cart.total_price
            return (difference > 0 && this._data.cart.total_price > 0) ? this._freeProductInformation.message.replace('|amount|', rivets.formatters.money(difference)) : false
        }

        rivets.formatters.quantityOptions = (cartItem) => {
            let max = 20
            if (cartItem.quantity > max) {
                max = cartItem.quantity + 20
            }
            return Array.from(Array(max).keys()).map((v, i) => i + 1)
        }

        rivets.formatters.plural = (count, single) => {
            return count === 1 ? single : `${single}s`
        }

        rivets.formatters.isFreeItem = (item) => {
            return this.isFreeItem(item)
        }

        rivets.formatters.propertyArray = (item) => {
            let props = item.properties
            let results = []
            for (let name in props) {
                if (name === 'type') continue
                let value = props[name]
                results.push({
                    name: name,
                    value: value
                })
            }
            return results
        }

        rivets.formatters.sampleCount = (cart) => {
            let count = 0
            for (let cartItem of cart.items) {
                if (this.isSampleItem(cartItem)) {
                    count++
                }
            }
            return count
        }

        rivets.formatters.hasSample = (cart, variantId) => {
            return this.hasItem(variantId)
        }

        rivets.formatters.numberOfGifts = (value) => {
            let totalFreeGifts = Math.floor((value / 100.00) / this._data.freeGiftInformation.chooseEvery)
            return totalFreeGifts > this._data.freeGiftInformation.limit ? this._data.freeGiftInformation.limit : totalFreeGifts
        }

        rivets.formatters.giftCount = (total) => {
            return this.getGiftCount()
        }

        rivets.formatters.showSamples = (cart) => {
            return cart.item_count > 0 && this._sampleInformation.limit > 0 && (cart.total_price / 100.00) >= parseInt(this._sampleInformation.amount)
        }

        rivets.formatters.showGifts = (cart) => {
            return cart.item_count > 0 && this._data.freeGiftInformation.limit > 0 && rivets.formatters.numberOfGifts(cart.total_price) > 0
        }

        rivets.formatters.giftDisabled = (cart, item) => {
            return !item.selected && (this.getGiftCount() >= rivets.formatters.numberOfGifts(cart.total_price))
        }

        rivets.formatters.sampleDisabled = (cart, item) => {
            return !item.selected && this._data.maxSamples
        }

        rivets.formatters['='] = (value, arg) => {
            return value === arg
        }

        rivets.formatters['>'] = (value, arg) => {
            return value > arg
        }

        rivets.formatters['>='] = (value, arg) => {
            return value >= arg
        }

        rivets.formatters['<'] = (value, arg) => {
            return value < arg
        }

        rivets.formatters['<='] = (value, arg) => {
            return value <= arg
        }

        rivets.formatters['!='] = (value, arg) => {
            return value !== arg
        }

        rivets.binders['background'] = (el, value) => {
            el.style.setProperty('background-image', `url('${value}')`)
        }
    }

    onInit () {
        log.debug(this.constructor.name, 'Initiating')

        this.rivetsBinders()
        this.renderCart()

        document.dispatchEvent(new Event('update-sticky'))
        document.addEventListener('added-item', () => {
            this.getCart()
        })

        document.addEventListener('esc-cart-view', () => {
            this.trackCart()
        })

        this.getCart()

        log.debug(this.constructor.name, 'Initiated')
    }

    trackCart () {
        window._rsq = window._rsq || []
        for (let item of this._data.cart.items) {
            window._rsq.push(['_addItem',
                {
                    'id': item.variant_id.toString(),
                    'name': item.title.toString(),
                    'price': (item.price / 100.00).toFixed(2).toString()
                }
            ])
        }
        window._rsq.push(['_setAction', 'shopping_cart'])
        window._rsq.push(['_track'])
    }

    prepareData (cart) {
        let normalItems = []
        let sampleItems = []
        for (const [index, cartItem] of cart.items.entries()) {
            cartItem.index = (index + 1)
            cartItem.isRemoving = false
            if (this.isSampleItem(cartItem)) {
                sampleItems.push(cartItem)
            } else if (!this.isGiftItem(cartItem)) {
                normalItems.push(cartItem)
            }
        }
        cart.sampleItems = sampleItems
        cart.normalItems = normalItems

        let recommendedProducts = []
        for (let item of this._data.recommendedProducts) {
            let inCart = false
            for (let cartItem of cart.items) {
                if (cartItem.variant_id === item.variant_id) {
                    inCart = true
                    break
                }
            }
            if (!inCart) {
                recommendedProducts.push(item)
            }
        }
        this._data.recommendedProducts = recommendedProducts

        for (let item of this._data.freeGiftInformation.items) {
            item.selected = false
            item.isRemoving = false
            for (let cartItem of cart.items) {
                if (cartItem.variant_id === item.variant_id) {
                    item.selected = true
                    break
                }
            }
        }

        for (let item of this._data.sampleChoices) {
            item.selected = false
            item.isRemoving = false
            for (let cartItem of cart.items) {
                if (cartItem.variant_id === item.variant_id) {
                    item.selected = true
                    break
                }
            }
        }
        this._data.maxSamples = false
        if (cart.sampleItems.length >= this._sampleInformation.limit) {
            this._data.maxSamples = true
        }
        return cart
    }

    renderCart () {
        for (let elem of this._renderElems) {
            rivets.bind(elem, this.getModel())
        }
        for (let loadingContainer of this._loadingContainers) {
            loadingContainer.classList.add('rendered')
        }
        this.validateSamples()
    }

    gtmRemoveCartItem (item) {
        window.dataLayer = window.dataLayer || []
        window.dataLayer.push({
            'event': 'removeFromCart',
            'ecommerce': {
                'remove': {
                    'products': [{
                        'name': item.product_title,
                        'id': item.product_id,
                        'price': (item.price / 100.00).toLocaleString('en', { maximumSignificantDigits: 21 }),
                        'category': Helpers.capitalizeFirstLetter(item.product_type),
                        'quantity': item.quantity
                    }]
                }
            },
            'eeEventAction': 'cart',
            'eeEventLabel': 'remove from cart'
        })
    }

    getModel () {
        return {
            data: this._data,
            controller: {
                emptyCart: (e, model) => {
                    e.preventDefault()
                    this.emptyCart()
                    this.getCart()
                },
                removeCartItem: (e, model) => {
                    e.preventDefault()
                    var item = model.item

                    if (!item.isRemoving) {
                        item.isRemoving = true
                        this.queue.enqueue(() => {
                            return axios.post(this.getCartEndpoint('/cart/change.js'), {
                                line: item.index,
                                quantity: 0
                            }).then(() => {
                                log.debug(this.constructor.name, 'Removed item')
                                this.gtmRemoveCartItem(item)
                            })
                        })

                        this.getCart()
                    }
                },
                changeQuantity: (e, model) => {
                    e.preventDefault()
                    var item = model.item
                    log.debug(this.constructor.name, 'Quantity change', item.quantity)

                    if (!item.isLoading) {
                        item.isLoading = true
                        this.queue.enqueue(() => {
                            return axios.post(this.getCartEndpoint('/cart/change.js'), {
                                line: item.index,
                                quantity: parseInt(item.quantity)
                            }).then(() => {
                                item.isLoading = false
                                log.debug(this.constructor.name, 'Edited item')
                            })
                        })

                        this.getCart()
                    }
                },
                addItem: (e, model) => {
                    e.preventDefault()
                    let item = model.item
                    this.queue.enqueue(() => {
                        return axios.post(this.getCartEndpoint('/cart/add.js'), {
                            id: item.variant_id,
                            quantity: 1
                        }).then(() => {
                            log.debug(this.constructor.name, 'Added recommended item')
                        })
                    })
                    this.getCart()
                },
                toggleSample: (e, model) => {
                    e.preventDefault()
                    let item = model.item
                    if (this.hasItem(item.variant_id)) {
                        // Remove it
                        if (!item.isRemoving) {
                            item.isRemoving = true
                            this.queue.enqueue(() => {
                                return axios.post(this.getCartEndpoint('/cart/change.js'), {
                                    id: `${item.variant_id}`,
                                    quantity: 0
                                }).then(() => {
                                    log.debug(this.constructor.name, 'Removed sample')
                                })
                            })
                            this.getCart()
                            this._data.viewingSamples = true
                        }
                    } else {
                        // Add it
                        this.queue.enqueue(() => {
                            return axios.post(this.getCartEndpoint('/cart/add.js'), {
                                id: item.variant_id,
                                quantity: 1
                            }).then(() => {
                                log.debug(this.constructor.name, 'Added sample')
                            })
                        })
                        this.getCart()
                        this._data.viewingSamples = true
                    }
                },
                toggleGift: (e, model) => {
                    e.preventDefault()
                    let item = model.item
                    if (this.hasItem(item.variant_id)) {
                        // Remove it
                        if (!item.isRemoving) {
                            item.isRemoving = true
                            this.queue.enqueue(() => {
                                return axios.post(this.getCartEndpoint('/cart/change.js'), {
                                    id: `${item.variant_id}`,
                                    quantity: 0
                                }).then(() => {
                                    log.debug(this.constructor.name, 'Removed gift')
                                })
                            })
                            this.getCart()
                            this._data.viewingGifts = true
                        }
                    } else {
                        // Add it
                        this.queue.enqueue(() => {
                            return axios.post(this.getCartEndpoint('/cart/add.js'), {
                                id: item.variant_id,
                                properties: {
                                    'type': 'gift-item'
                                },
                                quantity: 1
                            }).then(() => {
                                log.debug(this.constructor.name, 'Added gift')
                            })
                        })
                        this.getCart()
                        this._data.viewingGifts = true
                    }
                },
                openSamplesList: (e, model) => {
                    e.preventDefault()
                    this._data.viewingSamples = !this._data.viewingSamples
                    for (let elem of this._sampleListElems) {
                        this.toggleElem(elem)
                    }
                },
                openGiftList: (e, model) => {
                    e.preventDefault()
                    this._data.viewingGifts = !this._data.viewingGifts
                    for (let elem of this._giftListElems) {
                        this.toggleElem(elem)
                    }
                }
            }
        }
    }

    toggleElem (elem) {
        if (elem.classList.contains('open')) {
            let dimensions = getNodeDimensions(elem)
            elem.style.maxHeight = `${dimensions.height}px`
            Helpers.nextFrame(() => {
                elem.style.maxHeight = `0px`
                elem.classList.remove('open')
            })
        } else {
            elem.style.maxHeight = 'none'
            let dimensions = getNodeDimensions(elem)
            elem.style.maxHeight = '0px'
            let openEvent = e => {
                if (e.propertyName === 'max-height') {
                    elem.style.maxHeight = 'none'
                    elem.removeEventListener('transitionend', openEvent, false)
                }
            }
            elem.addEventListener('transitionend', openEvent, false)
            Helpers.nextFrame(() => {
                elem.style.maxHeight = `${dimensions.height}px`
                elem.classList.add('open')
            })
        }
    }

    getCart () {
        for (let loadingContainer of this._loadingContainers) {
            loadingContainer.classList.add('faded')
        }

        this.queue.enqueue(() => {
            return axios.get(this.getCartEndpoint('/cart.js')).then((response) => {
                log.debug(this.constructor.name, 'Got cart')
                this._data.cart = this.prepareData(response.data)
                for (let loadingContainer of this._loadingContainers) {
                    loadingContainer.classList.remove('faded')
                }
            })
        })

        this.queue.enqueue(() => {
            this.validateSamples()
        })

        this.queue.enqueue(() => {
            this.validateGifts()
        })

        if (this._freeProductInformation.freeProdIds.length) {
            this.queue.enqueue(() => {
                this.validateFreeItems()
            })

            if (this._freeProductInformation.enabled) {
                this.queue.enqueue(() => {
                    this.doFreeItems()
                })
            }
        }
    }

    getQuantityArr () {
        return this._data.cart.items.map(x => x.quantity)
    }

    validateFreeItems () {
        if ((this._data.cart.item_count > 0 && (this._data.cart.total_price / 100.00) < parseInt(this._freeProductInformation.amount))) {
            log.debug(this.constructor.name, 'Validate free triggered')

            let needsToRemove = false
            for (let freeItem of this._freeProductInformation.freeProdIds) {
                for (let cartItem of this._data.cart.items) {
                    if (this.isFreeItem(cartItem) && cartItem.variant_id === freeItem) {
                        needsToRemove = true
                    }
                }
            }

            if (needsToRemove) {
                this.queue.enqueue(() => {
                    let quanArr = this.getQuantityArr()
                    for (let freeItem of this._freeProductInformation.freeProdIds) {
                        for (let [index, cartItem] of this._data.cart.items.entries()) {
                            if (this.isFreeItem(cartItem) && cartItem.variant_id === freeItem) {
                                quanArr[index] = 0
                            }
                        }
                    }
                    log.debug(this.constructor.name, 'Removing free items')
                    return axios.post(this.getCartEndpoint('/cart/update.js'), {
                        updates: quanArr
                    }).then(() => {
                        log.debug(this.constructor.name, 'Removed free items')
                    })
                })
                this.getCart()
            }
        }

        for (let cartItem of this._data.cart.items) {
            if (this.isFreeItem(cartItem) && !this._freeProductInformation.freeProdIds.includes(cartItem.variant_id)) {
                // If this free item should not be in the cart, remove all samples and re-add

                this.queue.enqueue(() => {
                    let quanArr = this.getQuantityArr()
                    for (let _cartItem of this._data.cart.items) {
                        if (this.isFreeItem(_cartItem)) {
                            quanArr[_cartItem.index - 1] = 0
                        }
                    }
                    return axios.post(this.getCartEndpoint('/cart/update.js'), {
                        updates: quanArr
                    }).then(() => {
                        log.debug(this.constructor.name, 'Reset Free Items')
                    })
                })
                this.getCart()
                return false
            }
        }

        if (!this._freeProductInformation.enabled) {
            let areFreeItems = false
            for (let cartItem of this._data.cart.items) {
                if (this.isFreeItem(cartItem)) {
                    areFreeItems = true
                }
            }

            if (areFreeItems) {
                this.queue.enqueue(() => {
                    let quanArr = this.getQuantityArr()
                    for (let cartItem of this._data.cart.items) {
                        if (this.isFreeItem(cartItem)) {
                            areFreeItems = true
                            quanArr[cartItem.index - 1] = 0
                        }
                    }
                    return axios.post(this.getCartEndpoint('/cart/update.js'), {
                        updates: quanArr
                    }).then(() => {
                        log.debug(this.constructor.name, 'Reset Free Items')
                    })
                })
                this.getCart()
                return false
            }
        }
    }

    doFreeItems () {
        if (this._data.cart.item_count === 0 || (this._data.cart.total_price / 100.00) < parseInt(this._freeProductInformation.amount)) return false
        let freeProductsNeedAdding = false

        for (let freeItem of this._freeProductInformation.freeProdIds) {
            let inCartAlready = false
            for (let cartItem of this._data.cart.items) {
                if (this.isFreeItem(cartItem) && cartItem.variant_id === freeItem) {
                    inCartAlready = true
                    if (cartItem.quantity !== 1) {
                        this.queue.enqueue(() => {
                            return axios.post(this.getCartEndpoint('/cart/change.js'), {
                                line: cartItem.index,
                                quantity: 1,
                                properties: {
                                    'type': 'free-product'
                                }
                            }).then(() => {
                                log.debug(this.constructor.name, 'Changed item')
                            })
                        })
                    }
                }
            }

            if (!inCartAlready) {
                freeProductsNeedAdding = true
                this.queue.enqueue(() => {
                    return axios.post(this.getCartEndpoint('/cart/add.js'), {
                        id: freeItem,
                        quantity: 1,
                        properties: {
                            'type': 'free-product'
                        }
                    }).then(() => {
                        log.debug(this.constructor.name, 'Added item')
                    })
                })
            }
            if (freeProductsNeedAdding) {
                this.queue.enqueue(() => {
                    // window.location.reload()
                    this.queue.enqueue(() => {
                        return axios.post(this.getCartEndpoint('/cart/add.js'), {
                            id: freeItem,
                            quantity: 1,
                            properties: {
                                'type': 'free-product'
                            }
                        }).then(() => {
                            log.debug(this.constructor.name, 'Added item')
                        })
                    })
                })
                this.getCart()
            }
        }
        // if (freeProductsNeedAdding) {
        //     this.queue.enqueue(() => {
        //         window.location.reload()
        //     })
        // }
    }

    removeSamples () {
        this.queue.enqueue(() => {
            let quanArr = this.getQuantityArr()
            for (let sampleItem of this._data.cart.sampleItems) {
                quanArr[sampleItem.index - 1] = 0
            }
            return axios.post(this.getCartEndpoint('/cart/update.js'), {
                updates: quanArr
            }).then(() => {
                log.debug(this.constructor.name, 'Reset Samples')
            })
        })
        this.getCart()
    }

    validateGifts () {
        if (this.getGiftCount() === 0) {
            return false
        }
        let numberOfGiftsAllowed = rivets.formatters.numberOfGifts(this._data.cart.total_price)
        if (this.getGiftCount() > numberOfGiftsAllowed) {
            let amountToRemove = this.getGiftCount() - numberOfGiftsAllowed
            if (amountToRemove > 0) {
                this.queue.enqueue(() => {
                    let giftItems = this.getGiftItems()
                    let quanArr = this.getQuantityArr()
                    for (let item of giftItems) {
                        if (amountToRemove === 0) {
                            break
                        }
                        quanArr[item.index - 1] = 0
                        amountToRemove--
                    }
                    log.debug(this.constructor.name, 'Removing gifts')
                    return axios.post(this.getCartEndpoint('/cart/update.js'), {
                        updates: quanArr
                    }).then(() => {
                        log.debug(this.constructor.name, 'Removed some gifts')
                    })
                })
                this.getCart()
            }
        }
    }

    validateSamples () {
        if (this.getSampleCount() === 0) {
            return false
        }
        if ((this._data.cart.item_count > 0 && (this._data.cart.total_price / 100.00) < parseInt(this._sampleInformation.amount)) || (this._data.cart.item_count === this.getSampleCount() || this._data.cart.total_price === 0)) {
            log.debug(this.constructor.name, 'Validate sample triggered')
            this.removeSamples()
            return false
        }

        if (this._data.cart.sampleItems.length > this._sampleInformation.limit) {
            this.removeSamples()
            return false
        }

        for (let sampleItem of this._data.cart.sampleItems) {
            if (!this._sampleInformation.sampleIds.includes(sampleItem.variant_id)) {
                // If this sample should not be in the cart, remove all samples and re-add

                this.queue.enqueue(() => {
                    let quanArr = this.getQuantityArr()

                    for (let _sampleItem of this._data.cart.sampleItems) {
                        quanArr[_sampleItem.index - 1] = 0
                    }
                    return axios.post(this.getCartEndpoint('/cart/update.js'), {
                        updates: quanArr
                    }).then(() => {
                        log.debug(this.constructor.name, 'Reset Samples')
                    })
                })
                this.getCart()
                return false
            }
        }
    }

    isSampleItem (item) {
        let hasProps = item.properties && item.properties['type'] !== 'free-product' && item.properties['type'] !== 'mystery-item' && item.properties['type'] !== 'gift-item' && item.properties['type'] !== 'gift-set-product'
        return item.line_price === 0 && item.original_line_price === 0 && (hasProps || !item.properties)
    }

    isGiftItem (item) {
        return item.properties && item.properties['type'] === 'gift-item'
    }

    isFreeItem (item) {
        return item.properties && item.properties['type'] === 'free-product'
    }

    getGiftCount () {
        return this.getGiftItems().length
    }

    getGiftItems () {
        return this._data.cart.items.filter(item => this.isGiftItem(item))
    }

    getSampleCount () {
        let count = 0
        for (let sampleItem of this._data.cart.sampleItems) {
            count += sampleItem.quantity
        }
        return count
    }

    emptyCart () {
        this.queue.enqueue(() => {
            return axios.post('/cart/clear.js').then(() => {
                log.debug(this.constructor.name, 'Cleared cart')
            })
        })
    }

    hasItem (variantId) {
        for (let cartItem of this._data.cart.items) {
            if (cartItem.variant_id === variantId) {
                return true
            }
        }
        return false
    }

    getSizedImageUrl (src, size) {
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

    removeProtocol (path) {
        return path.replace(/http(s)?:/, '')
    }
}

export default Cart
