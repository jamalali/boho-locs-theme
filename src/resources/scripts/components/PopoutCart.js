class PopoutCart {
    constructor (theme, elem) {
        this._elem = elem
    }

    onInit () {
        document.addEventListener('is-stuck', (e) => {
            if (e.detail.elem.hasAttribute('data-is-header')) {
                this._elem.classList.add('header-is-stuck')
            }
        })

        document.addEventListener('is-unstuck', (e) => {
            if (e.detail.elem.hasAttribute('data-is-header')) {
                this._elem.classList.remove('header-is-stuck')
            }
        })

        document.addEventListener('added-item', () => {
            this._elem.classList.add('shown')
        })

        this._elem.addEventListener('esc-added-class', () => {
            if (this._elem.classList.contains('shown')) {
                document.dispatchEvent(new Event('esc-cart-view'))
            }
        })
    }
}

export default PopoutCart
