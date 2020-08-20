class Nosto {
    constructor (theme, elem) {
        this._elem = elem
        this._theme = theme
        this._nostoElems = document.querySelectorAll('.nosto_element')
        this._nostoInjectElems = document.querySelectorAll('.nosto_inject')
        this._nostojs = window.nostojs || null
        this._firstRun = true
    }

    onInit () {
        if (this._nostojs) {
            this._nostojs(api => {
                api.listen('postrender', (nostoPostRenderEvent) => {
                    for (let elem of this._nostoInjectElems) {
                        if (elem.children.length === 0) continue
                        if (elem.dataset.registeredComponents) continue
                        elem.dataset.registeredComponents = true
                        this._theme.registerComponents(elem)
                    }
                    if (this._firstRun) {
                        for (let elem of this._nostoElems) {
                            this._theme.registerComponents(elem)
                        }
                    }
                    this._firstRun = false
                })
            })
        }
    }
}

export default Nosto
