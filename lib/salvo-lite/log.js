import {utils} from '@eastsideco/escshopify'

const TAG = 'LogBootstrap'

const log = new utils.Log()

log.setLogPrefix('Theme')

const logger = new utils.Log.loggers.ConsoleLogger()

log.addLogger(logger)
log.send(log.DEBUG, TAG, 'Initialized logging.')

export default log
