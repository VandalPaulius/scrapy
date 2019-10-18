// @ts-nocheck

const mongoClient = require('mongodb').MongoClient

const initDb = async () => {
  let db

  try {
    const client = await mongoClient.connect(process.env.APPLICATION_MONGODB_URL)

    db = client.db(process.env.MONGODB_NAME)
  } catch (err) {
    throw new Error('Error while connecting to databse: ', err)
  }

  return db
}

module.exports = { initDb }
