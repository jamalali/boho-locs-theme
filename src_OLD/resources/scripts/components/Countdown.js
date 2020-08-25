import Countdown from 'countdown-js'

class CountdownTimer {
    constructor (theme, elem) {
        this._elem = elem
        this._options = Object.assign({
            epoch: 0,
            seperator: ':'
        }, JSON.parse(this._elem.dataset.countdown))
        this._timer = null
        this._timeElems = this._elem.querySelectorAll('[data-time]')
    }

    onInit () {
        this._timer = Countdown.timer(new Date(this._options.epoch * 1000), (timeLeft) => {
            this.updateTimeElems(timeLeft)
        }, () => {
            this.updateTimeElems({
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0
            }, false)
        })
    }

    updateTimeElems (timeLeft, comeAcrossZero = true) {
        for (let [index, timeElem] of this._timeElems.entries()) {
            let time = timeLeft[timeElem.dataset.time]
            if (time === 0 && comeAcrossZero) {
                timeElem.classList.add('hide')
            } else {
                comeAcrossZero = false
                timeElem.textContent = this.pad(time, 2)
                if ((index + 1) !== this._timeElems.length) {
                    timeElem.textContent += this._options.seperator
                }
            }
        }
    }

    pad (n, width, z) {
        z = z || '0'
        n = n + ''
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n
    }
}

export default CountdownTimer
