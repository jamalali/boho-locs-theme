import log from 'salvo-lite/log'
import GoogleMapsLoader from 'google-maps'
import L from 'leaflet'
import 'leaflet.gridlayer.googlemutant'

class StoreLocator {
    constructor (theme, elem) {
        this.elem = elem
        this.mapElem = this.elem.querySelector('[data-map]')
        this.storeElems = this.elem.querySelectorAll('[data-store]')
        this.mapSearchElem = this.elem.querySelector('[data-map-search]')
        this.mapSearchInput = this.mapSearchElem.querySelector('[data-search-field]')
        this.clearSearchButton = this.mapSearchElem.querySelector('[data-clear]')
        this.map = L.map(this.mapElem).setView([51.505, -0.09], 13)
        this.standardIcon = L.divIcon({className: 'cicon'})
        this.userMarker = false
        this.geocoder = false
        this.markers = []
        this.googleLayer = false
        this.stores = this.elem.querySelector('[data-stores-json]') ? JSON.parse(this.elem.querySelector('[data-stores-json]').innerHTML).stores : []
        log.debug(this.constructor.name, 'Constructed', this)
    }

    onInit () {
        log.debug(this.constructor.name, 'Initializing', this)

        GoogleMapsLoader.KEY = 'AIzaSyCGCvJDl0EjirOVIneyksqkBu0lTyEpvGE'
        GoogleMapsLoader.load((google) => {
            this.google = google
            this.googleLayer = new L.GridLayer.GoogleMutant({
                type: 'roadmap'
            })
            this.geocoder = new this.google.maps.Geocoder()
            this.googleLayer.addTo(this.map)
            this.mapReady()
        })

        log.debug(this.constructor.name, 'Initialized', this)
    }

    mapReady () {
        for (let [index, store] of this.stores.entries()) {
            let marker = L.marker([store.lat, store.lon], {icon: this.standardIcon})
            marker.bindPopup(`<b>${store.title}</b><br>${store.address}`)
            marker.addTo(this.map)
            this.markers.push({lat: store.lat, lon: store.lon, marker: marker})
            if (index === 0) {
                this.map.setView([store.lat, store.lon], 14)
            }
        }

        for (let storeElem of this.storeElems) {
            storeElem.addEventListener('click', (e) => {
                e.preventDefault()
                let lat = parseFloat(storeElem.dataset.lat)
                let lon = parseFloat(storeElem.dataset.lon)
                this.map.setView([lat, lon], 14)
            })
        }

        this.mapSearchInput.addEventListener('input', (e) => {
            if (this.mapSearchInput.value.length > 0) {
                this.clearSearchButton.classList.add('shown')
            } else {
                this.clearSearchButton.classList.remove('shown')
            }
        })

        this.clearSearchButton.addEventListener('click', (e) => {
            e.preventDefault()
            this.mapSearchInput.value = ''
            this.clearSearchButton.classList.remove('shown')
            let firstMarker = this.markers[0]
            this.map.setView([firstMarker.lat, firstMarker.lon], 14)
        })

        this.mapSearchElem.addEventListener('submit', (e) => {
            e.preventDefault()
            let postcode = this.mapSearchInput.value.trim()
            if (postcode === '') {
                let firstMarker = this.markers[0]
                this.map.setView([firstMarker.lat, firstMarker.lon], 14)
                return
            }
            this.geocoder.geocode({
                address: postcode
            }, (data) => {
                let lat = data[0].geometry.location.lat()
                let lon = data[0].geometry.location.lng()
                if (this.userMarker) {
                    this.map.removeLayer(this.userMarker)
                }
                this.userMarker = L.marker([lat, lon], {icon: this.standardIcon}).addTo(this.map)
                this.map.setView([lat, lon], 14)
            })
        })
    }
}

export default StoreLocator
