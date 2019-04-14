const multer = require('multer');
const uploadMiddleware = multer({ dest: '/tmp/uploads' });
const feedProcessors = require('./feedProcessors');
const uuid = require('uuid/v4');
const moment = require('moment');

const handleUpload = async ({ database, req, res, next }) => {
    const errorHandler = (err) => {
        res.status(400);
        res.write(err);
        res.end();
    };

    if (!req.files || !req.files.length) {
        errorHandler('Error: No files found');
        return;
    }

    if (!req.body || !req.body.processAs) {
        errorHandler('Error: No processing directions found');
        return;
    }

    const fileProcessId = uuid();
    const uploadedFileId = uuid();

    try {
        const file = req.files[0];
        await database.collection('FEED_FILE_UPLOADS')
            .insert({
                _id: uploadedFileId,
                dateUploaded: moment().toDate(),
                dateProcessingStarted: moment().toDate(),
                dateProcessingFinished: null,
                internalFileName: file.filename,
                mimeType: file.mimetype,
                originalFileName: file.originalname,
                uploadPath: file.path,
                size: file.size,
                processDirective: req.body.processAs,
                uploadDestination: file.destination,
                uploadHandler: {
                    host: req.host,
                    hostName: req.hostname,
                    uploaderIp: req.ip,
                    uploadHandlerUrl: req.originalUrl,
                    uploadProtocol: req.protocol,
                },
                fileProcessId,
            });
    } catch (err) {
        errorHandler(err);
        return;
    }

    const WSStore = req.app.get('WSStore');

    if (req.body.processAs === 'doogal.co.uk') {
        const connectionId = uuid();

        const onDone = (error, message) => {
            const afterUpdate = (dbErr) => {
                if (error) {
                    message = message + ` Error: ${error}`;
                }

                const dbResponse = dbErr.toJSON();
                if (!dbResponse.ok) {
                    message = message + ` Database Error: ${dbErr}`;
                }

                WSStore.proto.send(connectionId, message, true);
                WSStore.proto.setDone(connectionId);
            };

            database.collection('FEED_FILE_UPLOADS')
                .updateOne({
                    _id: uploadedFileId
                }, {
                    $set: {
                        dateProcessingFinished: moment().toDate(),
                        processingFinishedSuccessfully: !error || false,
                    },
                }).
                then(afterUpdate)
                .catch(afterUpdate);
        };

        const onStep = (message) => {
            WSStore.proto.send(connectionId, message);
        };

        feedProcessors.processFeedDoogalCoUk(database, req.files[0], fileProcessId)
            .then(({ message, onContinue }) => {
                WSStore.proto.createNew(connectionId, 10);
                WSStore.proto.send(connectionId, message);

                res.status(200);
                res.setHeader('Content-Type', 'application/json');
                res.json({
                    openWebsocket: true,
                    url: `${process.env.WEBSOCKET_API_URL_BASE}${process.env.WEBSOCKET_API_URL_SUFFIX}`,
                    connectionId,
                });
                res.end();

                onContinue(onStep, onDone);
            })
            .catch(err => errorHandler(err));

    } else {
        errorHandler('Error: No viable processing directions found');
        return;
    }
};

const getFeedHistory = async ({ database, req, res, next }) => {
    const scrapes = await database
        .collection('FEED_FILE_UPLOADS')
        .find({})
        .sort({ start: 1 })
        .toArray();

    res.writeHead(200, {'Content-Type': 'application/json'});
    res.write(JSON.stringify(scrapes));
    res.end();
};

exports.configure = ({ router, database }) => {
    router
        .route('/data-feeds')
        .post(uploadMiddleware.any(), async (req, res, next) => await handleUpload({ database, req, res, next }))

    router
        .route('/data-feeds')
        .get(async (req, res, next) => await getFeedHistory({ database, req, res, next }))
};
