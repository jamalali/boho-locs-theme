import pageContext from 'salvo-lite/context'

import WOW from 'wowjs'

import ChoicesSelect from './components/ChoicesSelect'
import StickyElem from './components/StickyElem'
import LoadMore from './components/LoadMore'
import SelectURL from './components/SelectURL'
import Cart from './components/Cart'
import AjaxCart from './components/AjaxCart'
import ToggleClasses from './components/ToggleClasses'
import PopoutCart from './components/PopoutCart'
import Slider from './components/Slider'
import ReadMore from './components/ReadMore'
import Accordion from './components/Accordion'
import ProductComponent from './components/Product'
import Tabs from './components/Tabs'
import Navigation from './components/Navigation'
import SlidingMenu from './components/SlidingMenu'
import CountryProvinceSelector from './components/CountryProvinceSelector'
import Search from './components/Search'
import StoreLocator from './components/StoreLocator'
import YoutubeVideo from './components/YoutubeVideo'
import StyleHeight from './components/StyleHeight'
import CountdownTimer from './components/Countdown'
import SetLocalStorage from './components/SetLocalStorage'
import ScrollClassToggle from './components/ScrollClassToggle'
import ScrollSlider from './components/ScrollSlider'
import ToggleSearch from './components/ToggleSearch'
import ImgLoader from './components/ImgLoader'
import AjaxForm from './components/AjaxForm'
import SlideToggle from './components/SlideToggle'
import SortURL from './components/SortUrl'
import Nosto from './components/Nosto'
import NewsletterBar from './components/NewsletterBar'
import GiftCreator from './components/GiftCreator'
import Calendly from './components/Calendly'

import GTMClickEvent from './google-tag-manager/GTMClickEvent'
import GTMImpressions from './google-tag-manager/GTMImpressions'

import Product from './pages/Product'
import Collection from './pages/Collection'
import ProductVideo from './components/ProductVideo'
import CheckoutDeliveryMessage from './components/CheckoutDeliveryMessage'

const components = {
    'choices-select': ChoicesSelect,
    'load-more': LoadMore,
    'cart': Cart,
    'select-url': SelectURL,
    'ajax-cart': AjaxCart,
    'remove-class': ToggleClasses,
    'add-class': ToggleClasses,
    'toggle-class': ToggleClasses,
    'popout-cart': PopoutCart,
    'slider': Slider,
    'style-height': StyleHeight,
    'sticky': StickyElem,
    'read-more': ReadMore,
    'accordion': Accordion,
    'product': ProductComponent,
    'tabs': Tabs,
    'navigation': Navigation,
    'sliding-menu': SlidingMenu,
    'country-province-selector': CountryProvinceSelector,
    'search': Search,
    'store-locator': StoreLocator,
    'youtube-video': YoutubeVideo,
    'countdown': CountdownTimer,
    'gtm-click-event': GTMClickEvent,
    'set-local-storage': SetLocalStorage,
    'gtm-impressions': GTMImpressions,
    'scroll-class-toggle': ScrollClassToggle,
    'scroll-slider': ScrollSlider,
    'toggle-search': ToggleSearch,
    'img-loader': ImgLoader,
    'ajax-form': AjaxForm,
    'slide-toggle': SlideToggle,
    'sort-url': SortURL,
    'nosto': Nosto,
    'newsletter-bar': NewsletterBar,
    'gift-creator': GiftCreator,
    'product-video': ProductVideo,
    'checkout-delivery-message': CheckoutDeliveryMessage,
    'calendly': Calendly
}

const pages = {
    'product': Product,
    'collection': Collection,
    'search': Collection
}

class Theme {
    constructor () {
        this._components = []
        this._componentsById = {}
        this._firstRun = true

        if (document.querySelector('[data-theme-locale]')) {
            this.locale = JSON.parse(document.querySelector('[data-theme-locale]').innerHTML)
        } else {
            this.locale = {}
        }

        if (document.querySelector('[data-shop-info]')) {
            this.shopInfo = JSON.parse(document.querySelector('[data-shop-info]').innerHTML)
        } else {
            this.shopInfo = {
                currency: 'GBP'
            }
        }

        console.log(this)
    }

    registerComponents (registerContainer = document) {
        for (let key in components) {
            var ComponentConstructor = components[key]
            var elements = Array.prototype.slice.call(registerContainer.querySelectorAll(`.js-component__${key}, [data-${key}]`))
            if (registerContainer !== document && (registerContainer.hasAttribute(`data-${key}`) || registerContainer.classList.contains(`.js-component__${key}`))) {
                elements.push(registerContainer)
            }
            for (let elem of elements) {
                var instance = new ComponentConstructor(this, elem)
                this._components.push(instance)
                var id = elem.dataset.componentId
                if (id) {
                    this._componentsById[id] = instance
                }
                instance.onInit()
                elem.removeAttribute('data-unitialized-item')
            }
        }
        window.ThemeComponents = this._components
        window.ThemeComponentsId = this._componentsById
        window.__Theme = this

        if (this._firstRun) {
            let afterReveal = (el) => {
                console.log('CALLBACK')
                el.addEventListener('animationstart', () => {
                    if (el.classList.contains('image-grey-block')) {
                        el.classList.add('transition-in')
                        setTimeout(() => {
                            el.classList.add('transition-image-in')
                        }, 900)
                    } else if (el.classList.contains('about-intro__text')) {
                        setTimeout(() => {
                            el.classList.add('active')
                        }, 300)
                    }
                    if (el.classList.contains('block-reveal')) {
                        setTimeout(() => {
                            el.classList.add('transition-in')
                        }, 500)
                    }
                })
            }

            const _wow = new WOW.WOW({
                callback: afterReveal,
                offset: -100,
                mobile: true
            })

            if (_wow) {
                _wow.init()
            }
        }
        this._firstRun = false
    }

    registerPages () {
        var context = pageContext.getTemplate()
        for (let page in pages) {
            if (page === context) {
                var instance = new pages[page](this)
                instance.onInit()
            }
        }
    }

    getComponents () {
        return this._components
    }

    getComponentsById (id) {
        return this._componentsById[id]
    }

    getComponentsByType (componentConst, includeSubclasses = true) {
        var r = []
        for (let c of this._components) {
            if (includeSubclasses && c instanceof componentConst) {
                r.push(c)
            } else if (c.constructor === componentConst) {
                r.push(c)
            }
        }
        return r
    }
}

export default Theme
