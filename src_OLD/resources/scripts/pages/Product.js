import log from 'salvo-lite/log'

class Product {
    constructor (components) {
        log.debug(this.constructor.name, 'Constructing', components)
        this.components = components
    }

    onInit () {
        let mainSlider = this.components.getComponentsById('mainSlider')
        let mainSticky = this.components.getComponentsById('mainSticky')

        mainSlider.elem.addEventListener('sliderRendered', () => {
            mainSticky.init()
        })

        mainSlider.init()
    }
}

export default Product
