import log from 'salvo-lite/log'
// import { addEvent } from './components/MainEvents'
import 'slick-carousel'
import jQuery from 'jquery'

class Tabs {
    constructor (theme, elem) {
        this._theme = theme
        this._elem = elem
        this._tabs = this._elem.querySelectorAll('[data-tabs-tab]')
        this._collectionsWrapper = this._elem.querySelectorAll('[data-tabs-collections]')
        this._collections = this._elem.querySelectorAll('[data-tabs-collection]')
        this._activeCollection = this._elem.querySelectorAll('[data-tabs-collection].active')
        this._activeTab = elem.querySelectorAll('button.active')
        log.debug(this.constructor.name, 'Constructed', this)
    }

    onInit () {
        log.debug(this.constructor.name, 'Initiating')
        log.debug(this.constructor.name, 'Initiated')

        this.changeTab()
        this.hide()
        this.heights()
    }

    hide () {
        setTimeout(() => {
            for (let collection of this._collections) {
                if (!collection.classList.contains('active')) {
                    collection.classList.add('initial-hide')
                }
            }
        }, 200)
    }

    heights () {
        const activeHeight = this._activeCollection[0].offsetHeight
        this._collectionsWrapper[0].style.height = `${activeHeight}px`
    }

    changeTab () {
        const self = this

        for (let tab of this._tabs) {
            tab.addEventListener('click', function (e) {
                e.preventDefault()

                if (!tab.classList.contains('active')) {
                    const handle = tab.id
                    let newCollection, oldCollection

                    tab.classList.add('active')

                    for (let siblingTab of self._tabs) {
                        if (siblingTab !== tab) {
                            siblingTab.classList.remove('active')
                        }
                    }

                    for (let collection of self._collections) {
                        if (collection.id === `products-${handle}`) {
                            newCollection = collection
                        } else if (collection.classList.contains('active')) {
                            oldCollection = collection
                        }
                    }

                    oldCollection.classList.add('transition-out')
                    newCollection.classList.add('transition-prepare')
                    jQuery(newCollection).find('[data-slider]').slick('setPosition')

                    setTimeout(function () {
                        oldCollection.classList.remove('transition-out')
                        oldCollection.classList.remove('active')
                        if (!oldCollection.classList.contains('initial-hide')) {
                            oldCollection.classList.add('initial-hide')
                        }
                        newCollection.classList.remove('transition-in')
                        newCollection.classList.remove('transition-prepare')
                        newCollection.classList.add('active')
                    }, 300)
                }
            })
        }
    }
}

export default Tabs
