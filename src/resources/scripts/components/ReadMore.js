class ReadMore {
    constructor (theme, elem) {
        this.elem = elem
        this.contentElem = this.elem.querySelector('[data-read-more-content]')
        this.triggerElem = this.elem.querySelector('[data-read-more-trigger]')
        this.open = false
        this.options = Object.assign({
            maxHeight: '100px',
            moreLabel: '+ More',
            lessLabel: '- Less',
            maxElems: null,
            mobileOnly: false
        }, JSON.parse(this.elem.dataset.options))
    }

    onInit () {
        if (this.options.mobileOnly && window.innerWidth > 768) {
            return false
        }

        if (this.options.maxElems) {
            let maxHeight = 0
            let maxElems = this.options.maxElems
            let elemsToShow = this.elem.querySelectorAll('[data-read-more-content] p')
            for (let elemToShow of elemsToShow) {
                if (maxElems === 0) break
                maxHeight += elemToShow.scrollHeight
                maxElems--
            }
            this.options.maxHeight = `${maxHeight}px`
        }

        if (this.contentElem.scrollHeight <= parseFloat(this.options.maxHeight)) {
            this.triggerElem.style.display = 'none'
        }
        this.contentElem.style.maxHeight = this.options.maxHeight
        this.triggerElem.addEventListener('click', (e) => {
            e.preventDefault()
            console.log(this.open)
            this.elem.classList.toggle('read-more-open')
            if (this.open) {
                this.contentElem.style.maxHeight = this.options.maxHeight
                this.triggerElem.textContent = this.options.moreLabel
            } else {
                console.log(this.contentElem.scrollHeight)
                this.contentElem.style.maxHeight = `${this.contentElem.scrollHeight}px`
                this.triggerElem.textContent = this.options.lessLabel
            }
            this.open = !this.open
        })

        this.elem.classList.add('read-more-init')
    }
}

export default ReadMore
