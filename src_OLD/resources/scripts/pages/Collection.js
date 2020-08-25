import log from 'salvo-lite/log'
import AjaxCart from '../components/AjaxCart'

class Collection {
    constructor (theme) {
        log.debug(this.constructor.name, 'Constructing', theme)
        this.theme = theme
    }

    onInit () {
        let mainLoadMore = this.theme.getComponentsById('collectionLoadMore')

        mainLoadMore._elem.addEventListener('dataLoaded', () => {
            let newAjaxCarts = mainLoadMore._elem.querySelectorAll('[data-ajax-cart]:not([ajax-cart-initiated])')
            for (let ajaxCart of newAjaxCarts) {
                let instance = new AjaxCart(this.theme, ajaxCart)
                this.theme._components.push(instance)
                let id = ajaxCart.dataset.componentId
                if (id) {
                    this.theme._componentsById[id] = instance
                }
                instance.onInit()
            }
        })
    }
}

export default Collection
