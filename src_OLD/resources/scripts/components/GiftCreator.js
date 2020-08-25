import rivets from 'rivets'
import axios from 'axios'
import Helpers from '../helpers/Helpers'
import Queue from '../helpers/Queue'
import Slider from '../components/Slider'

class GiftCreator {
    constructor (theme, elem) {
        this._theme = theme
        this._elem = elem
        this._jsonElem = this._elem.querySelector('[data-gift-creator-json]')
        this._model = Object.assign(this.getModel(), JSON.parse(this._jsonElem.innerHTML))
        this._stage1Elem = this._elem.querySelector('[data-stage-1]')
        this._stage2Elem = this._elem.querySelector('[data-stage-2]')
        this._stepContainer = this._elem.querySelector('[data-steps-wrapper]')
        this._stepsElems = null
        this._queue = new Queue()
        this._binder = null
    }

    async onInit () {
        await this.prepareData()
        this._rivetsBinders()
        console.log(this._model.data.steps)
        this._binder = rivets.bind(this._elem, this._model)
        this.doSliders()
        this.doYotpo()
        this._stepsElems = this._stepContainer.querySelectorAll('[data-step]')
        this.doStepHeight()
        this._elem.style.maxHeight = `${this._stage1Elem.scrollHeight}px`
        this._elem.classList.add('gift-creator--ready')
    }

    _rivetsBinders () {
        rivets.formatters.json = (obj) => {
            return JSON.stringify(obj)
        }
        rivets.formatters.eq = (arg1, arg2) => {
            return arg1 === arg2
        }
        rivets.formatters.eqInt = (arg1, arg2) => {
            return parseInt(arg1) === parseInt(arg2)
        }
        rivets.formatters.money = (price) => {
            return Helpers.formatMoney(price)
        }
        rivets.binders['background'] = (el, value) => {
            el.style.setProperty('background-image', `url('${value}')`)
        }
        rivets.binders['custom-background'] = (el, value) => {
            if (value) {
                el.style.setProperty('background-image', `url('${value}')`)
            }
        }
        rivets.binders['width'] = (el, value) => {
            let width = (value / this._model.data.steps.length) * el.parentElement.clientWidth
            el.style.setProperty('width', `${width}px`)
        }
        rivets.binders['transform'] = (el, value) => {
            let toTransform = (value - 1) * 100
            el.style.setProperty('transform', `translateX(-${toTransform}%`)
        }
        rivets.formatters.getSizedImage = (src, size) => {
            return Helpers.getSizedImageUrl(src, size)
        }
        rivets.formatters.atEnd = (currentStep) => {
            return currentStep === this._model.data.steps.length
        }
        rivets.formatters.notAtEnd = (currentStep) => {
            return currentStep !== this._model.data.steps.length
        }
        rivets.formatters.getFirstId = (variants) => {
            return variants[0].id
        }
        rivets.formatters.get = (arr, index) => {
            if (arr && index) {
                return arr[index]
            }
        }
        rivets.formatters.getId = (arr, index) => {
            if (arr && index) {
                if (arr[index]) {
                    return arr[index].id
                }
            }
        }
        rivets.formatters.gt = (arr, amount) => {
            return arr > amount
        }
        rivets.formatters.contains = (string, query) => {
            return string.indexOf(query) !== -1
        }
        rivets.formatters.notcontain = (string, query) => {
            return string.indexOf(query) === -1
        }
        rivets.formatters.length = (arr) => {
            return arr.length
        }
        rivets.formatters.getVariantTitle = (variant) => {
            return variant.title === 'Default Title' ? '' : variant.title.replace(new RegExp(/\(save £1\)/, 'gi'), res => `<br>${res}`)
        }
        rivets.formatters.notDefined = (toTest) => {
            return toTest === undefined
        }
        rivets.formatters.flip = (arg) => {
            return !arg
        }
        rivets.formatters.getDescription = (arg) => {
            return arg.split('.')[0]
        }
    }

    async prepareData () {
        this._model.data.loading = true
        let promiseArray = []
        for (let step of this._model.data.steps) {
            step.products = []
            for (let handle of step.product_handles) {
                promiseArray.push(new Promise(async (resolve, reject) => {
                    try {
                        let request = await axios.get(`/products/${handle}?view=json`)
                        let productOuter = request.data
                        productOuter.product.metafields = productOuter.extra.metafields
                        step.products.push(this.prepareProduct(productOuter.product))
                        resolve('done')
                    } catch (err) {
                    }
                }))
            }
        }
        this._model.data.startPrice = this._model.data.totalPrice
        this._model.data.startSavingPrice = this._model.data.savingPrice
        this._model.data.currentStepObj = this._getCurrentStep()
        await Promise.all(promiseArray)
        this.stepValidityCheck()
        this._model.data.loading = false
    }

    getModel () {
        return {
            data: {
                loading: true,
                steps: [],
                currentStep: 1,
                currentStepObj: {}
            },
            controller: {
                goToStage2: (e, model) => {
                    e.preventDefault()
                    this.goToElem(this._stage1Elem, this._stage2Elem)
                    // if (model.step) {
                    //     model.controller.changeStep(e, model)
                    // }
                },
                changeStep: (e, model) => {
                    e.preventDefault()
                    window.scrollTo(0, 0)
                    this._model.data.currentStep = model.step.index
                    this._model.data.currentStepObj = model.step
                    this._model.data.isValid = false
                },
                previousStep: (e, model) => {
                    if (this._model.data.currentStep > 1) {
                        window.scrollTo(0, 0)
                        this._model.data.currentStep--
                        this._model.data.currentStepObj = this._getCurrentStep()
                    }
                },
                nextStep: (e, model) => {
                    if (this._model.data.currentStep < this._model.data.steps.length) {
                        window.scrollTo(0, 0)
                        this._model.data.currentStep++
                        this._model.data.currentStepObj = this._getCurrentStep()
                    }
                },
                selectProduct: (e, model) => {
                    e.preventDefault()
                    for (let prod of model.step.products) {
                        prod.selectedVariant = null
                    }
                    model.product.selectedVariant = model.product.first_variant
                    model.step.lastSelectedProduct = model.product
                    this._goToNextStep()
                    this.priceCheck()
                    this.stepValidityCheck()
                    this.totalValidityCheck()
                    console.log(this._model.data.steps)
                },
                removeProduct: (e, model) => {
                    e.preventDefault()
                    model.step.lastSelectedProduct.selectedVariant = null
                    model.step.lastSelectedProduct = null
                    model.controller.changeStep(e, model)
                    this.priceCheck()
                    this.stepValidityCheck()
                    this.totalValidityCheck()
                },
                completeCollection: (e, model) => {
                    this._model.data.addingToCart = true
                    for (let step of this._model.data.steps) {
                        for (let product of step.products) {
                            if (product.selectedVariant) {
                                this.addItem(product.selectedVariant.id, 1, {
                                    'type': 'gift-set-product',
                                    'Gift Set': 'Yes'
                                })
                            }
                        }
                    }
                    this._queue.enqueue(() => {
                        this._model.data.addingToCart = false
                        model.controller.cancelSet(e, model)
                        document.dispatchEvent(new Event('added-item'))
                    })
                },
                cancelSet: (e, model) => {
                    e.preventDefault()
                    this._model.data.currentStep = 1
                    this._model.data.currentStepObj = this._getCurrentStep()
                    for (let step of this._model.data.steps) {
                        step.lastSelectedProduct.selectedVariant = null
                        step.lastSelectedProduct = null
                    }
                    this.priceCheck()
                    this.stepValidityCheck()
                    this.totalValidityCheck()
                    this.goToElem(this._stage2Elem, this._stage1Elem)
                }
            }
        }
    }

    goToElem (elem1, elem2) {
        let closeEvent = e => {
            if (e.propertyName === 'opacity') {
                elem1.classList.add('hide')
                elem2.classList.remove('hide')
                this._elem.style.maxHeight = `${elem2.scrollHeight}px`
                Helpers.nextFrame(() => {
                    elem2.classList.remove('faded')
                })
                elem1.removeEventListener('transitionend', closeEvent, false)
            }
        }
        elem1.addEventListener('transitionend', closeEvent, false)
        elem1.classList.add('faded')
        window.scrollTo(0, 0)
    }

    totalValidityCheck () {
        this._model.data.isValid = this._model.data.steps.filter(item => item.isValid).length === this._model.data.steps.length
        if (this._model.data.isValid) {
            document.body.classList.add('no-scroll')
        } else {
            document.body.classList.remove('no-scroll')
        }
    }

    stepValidityCheck () {
        for (let step of this._model.data.steps) {
            step.isValid = this._getSelectedProducts(step).length === step.needs_to_select
            console.log(step)
        }
    }

    _getCurrentStep () {
        return this._model.data.steps[this._model.data.currentStep - 1]
    }

    _getSelectedProducts (step) {
        return step.products.filter(product => product.selectedVariant)
    }

    _selectVariant (variantId, toEdit, obj) {
        toEdit.selectedVariant = obj.variants.filter(variant => variant.id === variantId)[0]
        this._model.data.editingProduct = null
        this.priceCheck()
        this.stepValidityCheck()
    }

    doSliders () {
        let sliderElems = this._elem.querySelectorAll('[data-slider]')
        for (let elem of sliderElems) {
            new Slider(this._theme, elem).init()
        }
    }

    prepareProduct (product) {
        product.url = `/products/${product.handle}`
        product.first_variant = product.variants[0]
        product.selectedVariant = null
        return product
    }

    priceCheck () {
        this._model.data.totalPrice = 0
        for (let step of this._model.data.steps) {
            for (let product of step.products) {
                if (product.selectedVariant) {
                    this._model.data.totalPrice += product.selectedVariant.price
                }
            }
        }
    }

    _goToNextStep () {
        window.scrollTo(0, 0)
        if (this._model.data.currentStep < this._model.data.steps.length && this._model.data.steps[this._model.data.currentStep].lastSelectedProduct === null) {
            this._model.data.currentStep++
            this._model.data.currentStepObj = this._getCurrentStep()
        } else {
            let nextUndoneStep = null
            for (let step of this._model.data.steps) {
                if (!step.lastSelectedProduct) {
                    nextUndoneStep = step
                    break
                }
            }
            if (nextUndoneStep) {
                this._model.data.currentStep = nextUndoneStep.index
                this._model.data.currentStepObj = nextUndoneStep
                this._model.data.isValid = false
            }
        }
        this.doStepHeight()
    }

    stepCheck () {
        let currentStep = this._model.data.steps[this._model.data.currentStep - 1]
        let productsSelected = currentStep.products.filter(product => !!product.selectedVariant)
        if (productsSelected.length === currentStep.needs_to_select && (this._model.data.currentStep !== this._model.data.steps.length)) {
            this._model.data.currentStep++
        }
    }

    doStepHeight () {
        this._stepContainer.style.maxHeight = `${this._stepsElems[this._model.data.currentStep - 1].scrollHeight}px`
    }

    doYotpo () {
        let yotpoElems = this._elem.querySelectorAll('[data-yotpo-elem]')
        for (let elem of yotpoElems) {
            elem.innerHTML = ''
            elem.removeAttribute('data-yotpo-element-id')
        }
        window.yotpo.initWidgets()
    }

    addItem (variantId, quantity, props, callback) {
        this._queue.enqueue(() => {
            return axios.post(Helpers.getEndpoint('/cart/add.js'), {
                id: variantId,
                quantity: parseInt(quantity),
                properties: props || {}
            }).then((response) => {
                if (callback && typeof callback === 'function') {
                    callback(response.data)
                }
            }).catch((error) => {
                console.log(error)
            })
        })
    }
}

export default GiftCreator
