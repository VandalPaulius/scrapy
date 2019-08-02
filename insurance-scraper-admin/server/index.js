// @ts-nocheck

require('dotenv').config();
const express = require('express');
const app = express();
const apiRouter = express.Router();
const bodyParser = require('body-parser');
const router = require('./router');
const path = require('path');
const { WebSocketStore, DatabaseHandler } = require('./lib');

const initHttpListener = async (dbHandler) => {
    if (!dbHandler.localDb) {
        throw 'Cannot run without database';
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

    router.configureApi({ router: apiRouter });

    app.use('/', express.static(path.join(__dirname, 'client', 'build')))

    app.use('/api', apiRouter);

    const server = app.listen(parseInt(process.env.PORT), 'localhost', () =>
        console.log(`App is listening at http://${server.address().address}:${server.address().port}`)
    );

    // WebSocket init
    const WSStore = WebSocketStore({ messageDelay: 50 });

    await WSStore.proto.initWebSocketServer({
        server,
        path: process.env.WEBSOCKET_API_URL_SUFFIX,
        debug: console.log,
        socketInactivityTimeout: process.env.WEBSOCKET_INACTIVE_TIMEOUT,
    });

    app.set('WSStore', WSStore);
    app.set('dbHandler', dbHandler);
}

async function init() {
    console.log('Starting Admin service');

    try {
        const dbHandler = DatabaseHandler();
        await dbHandler.initLocalDb();
        // init app settings from local db
        await initHttpListener(dbHandler);
        console.log('Admin service started successfully');
    } catch (err) {
        debugger
        console.log('Admin service startup failed: ', err);
        process.exit(1);
    }
};

// required to wait for debugger to initialize
if (process.env.NODE_ENV === 'DEBUG') {
    debugger
    setTimeout(() => {
        init();
    }, 6000)
} else {
    init();
}
