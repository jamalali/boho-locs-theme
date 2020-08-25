class MainEvents {
    constructor () {
        this._name = this.constructor.name
        this._events = {}
    }

    addEvent (key, func) {
        this._events[key] = this._events[key] || []
        this._events[key].attached = this._events[key].attached || this.attachEvent(key)
        this._events[key].push(func)
    }

    attachEvent (idx) {
        window.addEventListener(idx, () => {
            for (let func of this._events[idx]) {
                func()
            }
        })
        return true
    }
}

const mainEvents = new MainEvents()

export function addEvent (idx, func) {
    mainEvents.addEvent(idx, func)
}
