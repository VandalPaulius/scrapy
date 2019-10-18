const express = require('express')
const bodyParser = require('body-parser');
const apiRouter = express.Router();
const router = require('./router')

const initHttpListener = db => {
  const app = express()

  if (!db) {
    throw new Error('Cannot run without database')
  }

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  })

  app.use(bodyParser.urlencoded({
      extended: false
  }));

  app.use(bodyParser.json());

  router(apiRouter);
  app.use('/', apiRouter);

  const server = app.listen(parseInt(process.env.PORT), 'localhost', () =>
    console.log(
      `Auth service is listening is listening at http://${
        server.address().address
      }:${server.address().port}`
    )
  )

  return app
}

module.exports = initHttpListener;
