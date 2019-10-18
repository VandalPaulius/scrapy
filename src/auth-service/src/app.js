const { dbHandler } = require('lib/server')
const initHttpListener = require('./init-http-listener')

const app = async () => {
  try {
    const db = await dbHandler.initDb()
    await initHttpListener(db)

    console.log('Auth service started successfully')
  } catch (err) {
    console.log('Auth service startup failed: ', err)
    process.exit(1)
  }
}

module.exports = app
