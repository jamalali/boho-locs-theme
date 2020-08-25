import log from 'salvo-lite/log'

class Queue {
    constructor () {
        this.queue = []
        this.processing = false
        log.debug(this.constructor.name, 'Constructed', this)
    }

    onInit () {
        log.debug(this.constructor.name, 'Initiating')
        log.debug(this.constructor.name, 'Initiated')
    }

    enqueue (job) {
        this.queue.push(job)

        if (!this.processing) {
            this.process()
        }
    }

    async process () {
        this.processing = true
        if (this.queue.length === 0) {
            log.debug(this.constructor.name, 'Queue empty')
            this.processing = false
            return false
        } else {
            let job = this.queue.shift()
            log.debug(this.constructor.name, 'Doing job')
            await job()
            log.debug(this.constructor.name, 'Done job')
            this.process()
        }
    }
}

export default Queue
