class CheckoutDeliveryMessage {
    constructor (theme, elem) {
        this._elem = elem
        this._theme = theme
        this.data = JSON.parse(elem.innerHTML)
    }

    onInit () {
        if (this.data) {
            const methodData = this.data.methods
            if (methodData) {
                const methods = document.querySelectorAll('[data-shipping-method-label-title]')
                if (methods.length > 0) {
                    for (let method of methods) {
                        for (let data of methodData) {
                            if (method.dataset.shippingMethodLabelTitle === data.title) {
                                let span = document.createElement('span')
                                span.innerText = data.content
                                method.appendChild(span)
                            }
                        }
                    }
                }
            }
        }
    }
}

export default CheckoutDeliveryMessage
