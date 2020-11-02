const log4js = require('log4js')
const constant = require('@/constant')

log4js.configure({
  appenders: {
    cheese: {
      type: 'dateFile',
      filename: constant.path.log,
      maxLogSize: 1048576
    },
    console: {
      type: 'console'
    }
  },
  categories: {
    default: {
      appenders: ['cheese', 'console'],
      level: 'info'
    }
  }
})

const logger = log4js.getLogger('cheese')
module.exports = logger
