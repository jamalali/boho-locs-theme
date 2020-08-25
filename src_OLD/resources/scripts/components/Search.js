class Search {
    constructor (theme, elem) {
        this.elem = elem
    }

    onInit () {
        this.elem.addEventListener('submit', (e) => {
            let input = this.elem.querySelector('[name="q"]')
            let fakeInput = this.elem.querySelector('[data-search-input]')
            input.value = `${fakeInput.value}*`
            return true
        })
    }
}

export default Search
