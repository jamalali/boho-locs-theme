class ProductVideo {
    constructor (theme, elem) {
        this._elem = elem
        this._theme = theme
    }

    onInit () {
        const parent = this._elem.parentElement.parentElement
        if (parent) {
            if (parent.classList.contains('slick-slide')) {
                const clone = parent.cloneNode(true)
                if (clone) {
                    const track = parent.parentElement
                    if (track) {
                        track.insertBefore(clone, parent)
                        parent.remove()
                        this._elem = clone.querySelector('[data-product-video]')

                        const modal = document.querySelector('[data-product-video-modal]')
                        if (modal) {
                            const closes = modal.querySelectorAll('[data-product-video-modal-close]')
                            if (closes.length > 0) {
                                for (let close of closes) {
                                    close.addEventListener('click', () => { this.closeModal() })
                                }
                            }
                            this._elem.addEventListener('click', () => { this.openModal() })
                        }
                        this.shiftSlickIndex(clone, track)
                    }
                }
            } else {
                const modal = document.querySelector('[data-product-video-modal]')
                if (modal) {
                    const closes = modal.querySelectorAll('[data-product-video-modal-close]')
                    if (closes.length > 0) {
                        for (let close of closes) {
                            close.addEventListener('click', () => { this.closeModal() })
                        }
                    }
                    this._elem.addEventListener('click', () => { this.openModal() })
                }
            }
        }
    }
    closeModal () {
        const modal = document.querySelector('[data-product-video-modal]')
        if (modal) {
            modal.classList.remove('active')
            const content = modal.querySelector('[data-product-video-modal-content]')
            if (content) {
                content.innerHTML = ''
            }
        }
    }
    openModal () {
        const modal = document.querySelector('[data-product-video-modal]')
        if (modal) {
            modal.classList.add('active')
            const content = modal.querySelector('[data-product-video-modal-content]')
            if (content) {
                content.innerHTML = this._elem.dataset.productVideo
            }
        }
    }
    shiftSlickIndex (clone, track) {
        let startingIndex = parseInt(clone.dataset.slickIndex)
        const slides = track.querySelectorAll('.slick-slide')
        if (slides.length > 0) {
            for (let slide of slides) {
                if (parseInt(slide.dataset.slickIndex) > startingIndex) {
                    slide.dataset.slickIndex = parseInt(slide.dataset.slickIndex) - 1
                }
            }
        }
    }
}

export default ProductVideo
