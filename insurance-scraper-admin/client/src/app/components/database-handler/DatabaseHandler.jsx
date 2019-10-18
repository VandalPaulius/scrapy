import React from 'react';
import propTypes from 'prop-types';
import uuid from 'uuid/v4';
import styles from './styles.scss';

class DatabaseHandler extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            databases: [],
            loading: false,
            error: null,
            copyTo: null,
            copyFrom: null,
        };

        this.actions = this.initActions();
    }

    // eslint-disable-next-line react/sort-comp
    initActions() {
        return {
            setLoading: loading => this.setState({ loading }),
            setError: error => this.setState({ error }),
            loadDatabases: () => {
                this.actions.setLoading(true);

                fetch(`${process.env.ADMIN_API_URL}/databases`, {
                    method: 'GET',
                    mode: 'cors',
                }).then((res) => {
                    if (!res.ok) {
                        res
                            .text()
                            .then((text) => {
                                throw new Error(text);
                            });
                    }

                    res
                        .json()
                        .then((body) => {
                            debugger
                            if (!Array.isArray(body)) {
                                throw new Error('Returned list is not array');
                            }

                            const databases = body.map(db => ({
                                name: db.name,
                                url: db.dbUrl,
                                main: db.active,
                                id: db.id,
                            }));

                            this.setState({ databases });
                            this.actions.setLoading(false);
                            this.actions.setError(false);
                        });
                })
                    .catch((err) => {
                        this.actions.setLoading(false);
                        this.actions.setError(`Error: ${err}`);
                    });

                // setTimeout(() => {
                //     const dbs = [
                //         {
                //             name: 'local',
                //             url: 'mongodb://adsad.local',
                //             main: false,
                //             id: uuid(),
                //         },
                //         {
                //             name: 'remote',
                //             url: 'mongodb://adsad.remote',
                //             main: true,
                //             id: uuid(),
                //         },
                //     ];

                //     this.setState({ databases: dbs });
                //     this.actions.setLoading(false);
                // }, 1000);
            },
            setMainDb: (id) => {
                this.actions.setLoading(true);

                setTimeout(() => {
                    // on ok response else set to null
                    this.setState(prevState => ({
                        databases: prevState.databases.map(db => ({
                            ...db,
                            main: db.id === id && true,
                        })),
                    }));
                    this.actions.setLoading(false);
                }, 500);
            },
            setCopyTo: (id) => {
                this.actions.setError();

                if (this.state.copyFrom === id) {
                    this.actions.setError('Error: Cannot move copy data in same database');
                    return;
                }

                this.setState({ copyTo: id });
            },
            setCopyFrom: (id) => {
                this.actions.setError();

                if (this.state.copyTo === id) {
                    this.actions.setError('Error: Cannot move copy data in same database');
                    return;
                }

                this.setState({ copyFrom: id });
            },
            connectToNewDb: (event) => {
                event.preventDefault();

                const formData = new FormData(event.target);

                event.target.reset();

                // on success call this.actions.loadDatabases();
                setTimeout(() => {
                    const db = {
                        name: formData.get('name'),
                        url: formData.get('url'),
                        id: uuid(),
                    };

                    this.setState(prevState => ({
                        databases: [
                            ...prevState.databases,
                            db,
                        ],
                    }));
                    this.actions.setLoading(false);
                }, 500);
            },
            removeDb: (id) => {
                this.actions.setLoading(true);

                setTimeout(() => {
                    // on ok response else set to null
                    this.setState(prevState => ({
                        databases: prevState.databases.filter(db => db.id !== id),
                    }));
                    this.actions.setLoading(false);
                }, 500);
            },
            copyData: (fromId, toId) => {
                this.actions.setError();

                const fromDb = this.state.databases.find(db => db.id === fromId);
                const toDb = this.state.databases.find(db => db.id === toId);

                if (!fromDb || !toDb) {
                    return this.actions.setError('Error: One or more databases are invalid');
                }

                console.log('copying... Need to set up Websockets to track progress');
            },
        };
    }

    componentDidMount() {
        this.actions.loadDatabases();
    }

    renderDbTable() {
        return (
            <div>
                <h3>Available databases:</h3>
                <div className={styles.errorMessage}>
                    {this.state.error}
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Main</th>
                            <th>Database name</th>
                            <th>URL</th>
                            <th />
                            <th />
                            <th />
                            <th>(dbl click)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.databases.map(db => (
                            <tr key={db.id}>
                                <td>{db.main ? 'true' : ''}</td>
                                <td>{db.name}</td>
                                <td>{db.url}</td>
                                <td>
                                    <button
                                        type="button"
                                        onClick={() => this.actions.setMainDb(db.id)}
                                    >
                                        Set Main
                                    </button>
                                </td>
                                <td>
                                    <button
                                        type="button"
                                        onClick={() => this.actions.setCopyFrom(db.id)}
                                    >
                                        From
                                    </button>
                                </td>
                                <td>
                                    <button
                                        type="button"
                                        onClick={() => this.actions.setCopyTo(db.id)}
                                    >
                                        To
                                    </button>
                                </td>
                                <td>
                                    <button
                                        type="button"
                                        onDoubleClick={() => this.actions.removeDb(db.id)}
                                    >
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {!this.state.databases.length && (
                            <tr>
                                <td>Empty</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        );
    }

    renderDataManipulationPanel() {
        const from = this.state.databases.find(db => db.id === this.state.copyFrom) || {};
        const to = this.state.databases.find(db => db.id === this.state.copyTo) || {};

        return (
            <div>
                <h3>Copy data</h3>
                <div>
                    <span>from:</span>
                    <span className={styles.item}>{from.name}</span>
                    <span className={styles.item}>{from.url}</span>
                </div>
                <div>
                    <span>to:</span>
                    <span className={styles.item}>{to.name}</span>
                    <span className={styles.item}>{to.url}</span>
                </div>
                {/* requires websocket connection for feedback */}
                <button
                    type="button"
                    onClick={() => this.actions.copyData(from.id, to.id)}
                >
                    Copy
                </button>
            </div>
        );
    }

    renderNewDbForm() {
        return (
            <form onSubmit={this.actions.connectToNewDb}>
                <h3>Add new database</h3>
                <div>
                    <span>Database name:</span>
                    <input name="name" />
                </div>
                <div>
                    <span>URL:</span>
                    <input name="url" />
                </div>
                <button type="submit">
                    Add
                </button>
            </form>
        );
    }

    render() {
        return (
            <div className={`${styles.mainContainer} ${this.props.className}`}>
                {this.state.loading && (
                    <div className={styles.loadingOverlay}>
                        <h2>Loading</h2>
                    </div>
                )}
                <div>
                    <button type="button" onClick={this.actions.loadDatabases}>
                        Refresh db list
                    </button>
                </div>
                {this.renderDbTable()}
                {this.renderDataManipulationPanel()}
                {this.renderNewDbForm()}
            </div>
        );
    }
}

DatabaseHandler.propTypes = {
    className: propTypes.string,
};

DatabaseHandler.defaultProps = {
    className: '',
};

export default DatabaseHandler;
