
const getDatabases = async ({ req, res, next }) => {
    debugger
    const databases = await req.app.get('dbHandler').getAllDatabases();

    debugger
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.write(JSON.stringify(databases));
    res.end();
};



exports.configure = ({ router }) => {
    router
        .route('./databases')
        .get(getDatabases)

    router
        .route('./databases2')
    .get(() => {
        debugger
    })

    // router
    //     .route('./databases/init')
    //     .post(initDatabase)
};
