import log from 'salvo-lite/log'
import axios from 'axios'

class LoadMore {
    constructor (theme, elem) {
        log.debug('LoadMore', 'Constructing', this)
        this._theme = theme
        this._elem = elem
        this._loadMoreContainer = this._elem.querySelector('[data-load-more-container]')
        this._loadMoreButton = this._elem.querySelector('[data-load-more-button]')
        this._loadMoreGrid = this._elem.querySelector('[data-load-more-items]')
        this.events = this.createEvents()
        this._isLoading = false
    }

    createEvents () {
        return {
            loaded: new Event('dataLoaded'),
            impressions: new Event('refreshImpressionElems')
        }
    }

    onInit () {
        log.debug('LoadMore', 'Initiating')
        if (!this._loadMoreContainer) return false
        this._loadMoreButton.addEventListener('click', e => this.loadMore(e))
        // this._infiniteLoad()
        log.debug('LoadMore', 'Initiated')
    }

    _infiniteLoad () {
        const self = this
        let triggered
        window.addEventListener('scroll', () => {
            const scrollDistance = window.pageYOffset || document.documentElement.scrollTop
            if (self._elem.offsetTop <= scrollDistance + window.innerHeight && this._loadMoreButton) {
                if (triggered !== this._loadMoreButton.getAttribute('data-next-page')) {
                    triggered = this._loadMoreButton.getAttribute('data-next-page')
                    this._loadMoreButton.click()
                }
            }
        })
    }

    loadMore (e) {
        e.preventDefault()
        if (this.stop) return false
        log.debug('LoadMore', 'Load More Trigger Clicked!')
        let url = this._loadMoreButton.dataset.loadMoreUrl
        this._isLoading = true
        this._loadMoreButton.setAttribute('disabled', 'disabled')
        axios.get(url)
            .then((response) => {
                console.log(response)

                let resp = response.data
                let parser = new DOMParser()
                let html = parser.parseFromString(resp, 'text/html')

                let data = html.querySelectorAll('[data-load-more-items] > *')
                let fragment = document.createDocumentFragment()

                for (let dataItem of data) {
                    fragment.appendChild(dataItem)
                    dataItem.setAttribute('data-unitialized-item', true)
                }

                this._loadMoreGrid.appendChild(fragment.cloneNode(true))

                let newItems = this._loadMoreGrid.querySelectorAll('[data-unitialized-item]')

                for (let newItem of newItems) {
                    this._theme.registerComponents(newItem)
                    newItem.removeAttribute('data-unitialized-item')
                }

                let loadMoreButton = html.querySelector('[data-load-more-container] [data-load-more-button]')

                if (loadMoreButton) {
                    this._loadMoreButton.dataset.loadMoreUrl = loadMoreButton.dataset.loadMoreUrl
                } else {
                    this._loadMoreContainer.parentNode.removeChild(this._loadMoreContainer)
                }
                if (window.LineItems) {
                    window.LineItems.createInputFields()
                }
                this._elem.dispatchEvent(this.events.loaded)
                document.dispatchEvent(this.events.impressions)
                this._loadMoreButton.removeAttribute('disabled')
                this._isLoading = false
            })
            .catch((error) => {
                console.log(error)
                this._loadMoreButton.removeAttribute('disabled')
                this._isLoading = false
            })
    }
}

export default LoadMore
