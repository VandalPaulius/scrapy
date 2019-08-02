import React from 'react';
import styles from './styles.scss';
import propTypes from 'prop-types';

class FeedHistory extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            feedHistory: [],
            error: null,
            loading: false,
        };

        this.actions = this.initActions();

        this.loadFeeds = this.loadFeeds.bind(this);
    }

    // eslint-disable-next-line react/sort-comp
    initActions() {
        return {
            loadFeedHistory: () => {
                this.setState({ loading: true });

                fetch(`${process.env.ADMIN_API_URL}/data-feeds`, {
                    method: 'GET',
                    mode: 'cors',
                }).then((res) => {
                    if (res.ok) {
                        res
                            .json()
                            .then((body) => {
                                let feedHistory = [];

                                if (Array.isArray(body)) {
                                    feedHistory = body.map(data => ({
                                        dateUploaded: data.dateUploaded,
                                        fileName: data.originalFileName,
                                        success: data.processingFinishedSuccessfully,
                                        id: data._id,
                                    })).reverse();
                                }

                                this.setState({
                                    feedHistory,
                                    loading: false,
                                    error: null,
                                });
                            });
                    } else {
                        res
                            .text()
                            .then(text => this.setState({
                                error: `Error: ${text}`,
                                loading: false,
                            }));
                    }
                }).catch(error => this.setState({
                    error: `Error: ${error}`,
                    loading: false,
                }));
            },
        };
    }

    componentDidMount() {
        this.loadFeeds();
    }

    comonentWillUnmount() {
        clearTimeout(this.loadFeedTimeout);
    }

    loadFeeds() {
        this.actions.loadFeedHistory();
        this.loadFeedTimeout = setTimeout(this.loadFeeds, 1000 * 10);
    }

    render() {
        return (
            <div className={`${styles.mainContainer} ${this.props.className}`}>
                <h3>Upload history:</h3>
                <div className={styles.errorMessage}>
                    {this.state.error}
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Success</th>
                            <th>Filename</th>
                            <th>Upload Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.feedHistory.map(feed => (
                            <tr key={feed.id}>
                                <td>{feed.success ? 'true' : 'false'}</td>
                                <td>{feed.fileName}</td>
                                <td>{feed.dateUploaded}</td>
                            </tr>
                        ))}
                        {!this.state.feedHistory.length && (
                            <tr>
                                <td>Empty</td>
                            </tr>
                        )}
                        {this.state.loading && (
                            <tr>
                                <td>Loading</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        );
    }
}

FeedHistory.propTypes = {
    className: propTypes.string,
};

FeedHistory.defaultProps = {
    className: '',
};

export default FeedHistory;
