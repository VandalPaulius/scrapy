function WebSocketStore(props = {}) {
    const store = {
        proto: {
            messageDelay: props.messageDelay || 100,
            socketInactivityTimeout: 1000 * 60 * 5,
            inactiveClearTimeout: 1000 * 60 * 1,
            debug: (...args) => {},
            clearInactive: () => {
                Object.keys(store).forEach((key) => {
                    if (key === 'proto') {
                        return;
                    }

                    if (store[key].lastActive && store[key].lastActive + store.proto.socketInactivityTimeout <= Date.now()) {
                        if (store[key].socket) {
                            store[key].socket.close();
                        }
                        delete store[key];
                    }
                });
            },
            clearInactiveService: (callback) => {
                store.proto.clearInactive();

                this.setTimeout(() => {
                    callback(store.proto.clearInactiveService);
                }, store.proto.inactiveClearTimeout);
            },
            updateActivity: (connectionId) => {
                if (store[connectionId]) {
                    store[connectionId].lastActive = Date.now();
                } else {
                    const err = `Connection ${connectionId} not found`;
                    store.proto.debug(err);
                    return err;
                }
            },
            updateLastSentTime: (connectionId) => {
                if (store[connectionId]) {
                    store[connectionId].lastSentTime = Date.now();
                } else {
                    const err = `Connection ${connectionId} not found`;
                    store.proto.debug(err)
                    return err;
                }
            },
            canSendDueDelay: (connectionId) => {
                const conn = store[connectionId];

                if (conn) {
                    if (!conn.lastSentTime) {
                        return true;
                    }

                    if (
                        conn.messageDelayOverride
                        && conn.lastSentTime + conn.messageDelayOverride <= Date.now()
                    ) {
                        return true;
                    }

                    if (conn.lastSentTime + store.proto.messageDelay <= Date.now()) {
                        return true;
                    }
                }
            },
            createNew: (connectionId, messageDelayOverride) => {
                store[connectionId] = {
                    fresh: true,
                    messageDelayOverride,
                };
                store.proto.updateActivity(connectionId);
            },
            setDone: function (connectionId) {
                const conn = store[connectionId];

                if (connectionId && conn) {
                    conn.done = true;
                } else {
                    const err = `Connection ${connectionId} not found`;
                    store.proto.debug(err)
                    return err;
                }
            },
            send: (connectionId, message, ignoreDelay) => {
                const conn = store[connectionId];

                if (connectionId && conn) {
                    conn.lastMessage = message;
                    store.proto.updateActivity(connectionId);

                    if (conn.socket) {
                        if (ignoreDelay || store.proto.canSendDueDelay(connectionId)) {
                            conn.socket.send(message);
                            store.proto.updateLastSentTime(connectionId);
                        }
                    }
                } else {
                    const err = `Connection ${connectionId} not found`;
                    store.proto.debug(err)
                    return err;
                }
            },
            initWebSocketServer: ({
                server,
                path,
                debug,
                socketInactivityTimeout,
            }) => {
                if (socketInactivityTimeout && typeof socketInactivityTimeout === 'number') {
                    store.proto.socketInactivityTimeout = socketInactivityTimeout;
                }
                if (debug && typeof debug === 'function') {
                    store.proto.debug = debug;
                }

                return new Promise((resolve, reject) => {
                    const WebSocket = require('ws');

                    const connectionHandler = (socket, req) => {
                        store.proto.debug('onWebSocket connection')
                        let query = {};
                        req.url.split('?').forEach(keyValue => {
                            const kvp = keyValue.split('=');
                            query[kvp[0]] = kvp[1];
                        });

                        if (!query.connectionId) {
                            socket.close();
                            return;
                        }

                        const storedConnection = store[query.connectionId];

                        if (!storedConnection) {
                            socket.send("Unauthorized");
                            socket.close();
                            return;
                        }

                        socket.on('error', (error) => {
                            socket.close();
                            if (storedConnection.onError) {
                                storedConnection.onError(error);
                            }
                        });

                        socket.onclose = () => {
                            if (storedConnection.onClose) {
                                storedConnection.onClose();
                            }

                            delete store[query.connectionId];
                        }

                        if (storedConnection.fresh) {
                            storedConnection.socket = socket;
                            storedConnection.fresh = false;
                            store.proto.updateActivity(query.connectionId);
                        }

                        if (storedConnection.done) {
                            if (storedConnection.lastMessage) {
                                socket.send(storedConnection.lastMessage);
                            }

                            socket.close();
                        }
                    };

                    try {
                        const wsServer = new WebSocket.Server({
                            server,
                            path,
                        });

                        wsServer.on('error', (error) => {
                            store.proto.debug('WebSocket server error: ', error);
                        });

                        wsServer.on('listening', () => {
                            store.proto.debug('WebSocket server is listening: ', wsServer.address());
                            resolve(wsServer);
                        });

                        wsServer.on('connection', connectionHandler);
                    } catch (err) {
                        reject(err);
                    }
                });
            }
        },
    }

    store.proto.clearInactiveService(store.proto.clearInactiveService)

    return store;
}

module.exports = WebSocketStore;
