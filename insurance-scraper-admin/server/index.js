require("dotenv").config();
const WebSocketStore = require("./lib/webSocketStore");

const initDb = async () => {
  const mongoClient = require("mongodb").MongoClient;
  let client;
  let db;

  try {
    console.log("connecting to db");
    client = await mongoClient.connect(process.env.APPLICATION_MONGODB_URL);

    db = client.db(process.env.MONGODB_NAME);
  } catch (err) {
    console.log("db connect err");
    console.error(err);
  }

  await db.createCollection("FEED_FILE_UPLOADS");
  await db.createCollection("RAW_POSTCODES");

  return db;
};

// WSStore = WebSocketStore({ messageDelay: 50 });

const initHttpListener = async database => {
  const express = require("express");
  const app = express();
  const apiRouter = express.Router();
  const bodyParser = require("body-parser");
  const router = require("./router");
  const path = require("path");

  if (!database) {
    console.log("Cannot run without database");
    return;
  }

  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
  });

  app.use(
    bodyParser.urlencoded({
      extended: false
    })
  );
  app.use(bodyParser.json());

  router.configureApi({ router: apiRouter, database });

  app.use("/", express.static(path.join(__dirname, "client", "build")));

  app.use("/api", apiRouter);

  const server = app.listen(parseInt(process.env.PORT), "localhost", () =>
    console.log(
      `App is listening at http://${server.address().address}:${
        server.address().port
      }`
    )
  );
  const WSStore = WebSocketStore({ messageDelay: 50 });

  await WSStore.proto.initWebSocketServer({
    server,
    path: process.env.WEBSOCKET_API_URL_SUFFIX,
    debug: console.log,
    socketInactivityTimeout: process.env.WEBSOCKET_INACTIVE_TIMEOUT
  });

  app.set("WSStore", WSStore);
};

console.log("Starting Admin service");

try {
  initDb().then(async database => {
    await initHttpListener(database);
    console.log("Admin service started successfully");
  });
} catch (err) {
  if (err) {
    console.log("Admin service startup failed: ", err);
    process.exit(1);
  }
}
