// @ts-nocheck

const mongoClient = require('mongodb').MongoClient;
const uuidv4 = require('uuid/v4');

function DatabaseHandler(props = {}) {
    const dbHandler = {
        localDb: null,
        databases: [],
        initDb: async ({ id, dbUrl, dbName, localName }) => {
            if (!id) {
                id = uuidv4();
            }

            if (dbHandler.databases.find(db => db.id === id)) {
                return;
            }

            let db;

            try {
                const client = await mongoClient.connect(dbUrl);

                db = client.db(dbName);
            } catch (err) {
                console.error('Error while connecting to databse: ', err)
            }

            if (!db) {
                return;
            }

            dbHandler.databases.push({
                name: localName,
                id,
                dbUrl,
                dbName,
                db,
            });

            return { db, id };
        },
        initLocalDb: async ({ setActive } = {}) => {
            console.log('Connecting to local db');

            setActive = setActive === undefined && true;

            const localDb = await dbHandler.initDb({
                dbUrl: process.env.APPLICATION_MONGODB_URL,
                dbName: process.env.MONGODB_NAME,
                localName: 'localDb',
            });
            dbHandler.localDb = localDb.db;

            if (setActive) {
                dbHandler.setActiveDb(localDb.id);
            }

            return { localDb };
        },
        getActiveDatabase: () => {
            return dbHandler.databases.find((db) => db.active === true)
        },
        setActiveDb(id) {
            if (!id) {
                throw new Error('No id passed for active db');
            }

            const existingDb = dbHandler.databases.find(({ id: dbId }) => dbId === id);

            if (existingDb) {
                dbHandler.databases = dbHandler.databases.map((db) => {
                    if (db.id === id) {
                        db.active = true;
                        return db;
                    }

                    db.active = false;
                    return db;
                })
            }
        }
    }

    return dbHandler;
}

module.exports = DatabaseHandler;
