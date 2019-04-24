const mongoClient = require('mongodb').MongoClient;

function DatabaseHandler(props = {}) {
    const dbHandler = {
        localDb: null,
        initDb: async ({ id, dbInfo }) => {
            if (id) {

            }

            let db;

            try {
                const client = await mongoClient.connect(process.env.APPLICATION_MONGODB_URL);

                db = client.db(process.env.MONGODB_NAME);
            } catch (err) {
                console.error(err);
            }

            return db;
        },
        initLocalDb: () => {
            const dbInfo = {
                url: process.env.APPLICATION_MONGODB_URL,
                name: process.env.MONGODB_NAME,
            };

            const localDb = dbHandler.initDb({ dbInfo });
            dbHandler.localDb;

            return localDb;
        },
        getActiveDatabase: () => {

        },
    }

    return dbHandler;
}

module.exports = DatabaseHandler;
