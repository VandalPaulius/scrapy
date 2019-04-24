import React from 'react';
import { Expandable, LoadingIcon } from 'components';
import styles from './styles.scss';
import { ProcessStatus } from './components';

class FeedUploader extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedFile: null,
            error: null,
            fileUploadExpanded: false,
            processAs: null,
            isProcessStatusOpen: false,
            processStatusUrl: null,
            isUploading: false,
        };

        this.actions = this.initActions();
    }

    // eslint-disable-next-line react/sort-comp
    initActions() {
        return {
            handleFileSelect: (event) => {
                this.setState({ selectedFile: event.target.files[0] });
            },
            toggleFileUploadExpand: (fileUploadExpanded) => {
                this.setState({ fileUploadExpanded });
            },
            clearUserData: (partial) => {
                const fields = {
                    selectedFile: null,
                    processAs: null,
                    error: null,
                    isProcessStatusOpen: false,
                    initialProcessStatusMessage: null,
                    processStatusUrl: null,
                };

                if (partial) {
                    delete fields.selectedFile;
                    delete fields.processAs;
                }

                this.setState(fields);
            },
            handleProcessAsChange: (event) => {
                this.setState({ processAs: event.target.value });
            },
            setError: error => this.setState({ error }),
            setUploading: isUploading => this.setState({ isUploading }),
            handleUpload: () => {
                const terminate = (err) => {
                    if (err) {
                        this.actions.setError(err);
                    }

                    this.actions.setUploading(false);
                };

                this.actions.clearUserData(true);
                this.actions.setUploading(true);

                const data = new FormData();
                data.append('processAs', this.state.processAs);
                data.append('file', this.state.selectedFile);

                if (!data.get('processAs') || typeof data.get('processAs') !== 'string') {
                    terminate('Please specify file processing type');
                    return;
                }
                if (!data.get('file') || data.get('file') === 'null') {
                    terminate('Please select feed file');
                    return;
                }

                fetch(`${process.env.ADMIN_API_URL}/data-feeds`, {
                    method: 'POST',
                    mode: 'cors',
                    body: data,
                }).then((res) => {
                    if (res.ok) {
                        res.json().then((resData) => {
                            terminate();

                            if (resData.openWebsocket) {
                                this.setState({
                                    isProcessStatusOpen: true,
                                    processStatusUrl: resData.url,
                                    statusConnectionId: resData.connectionId,
                                });
                            }
                        }).catch(terminate);
                    } else {
                        res
                            .text()
                            .then(terminate);
                    }
                }).catch(terminate);
            },
        };
    }

    render() {
        return (
            <div className={styles.mainContainer}>
                <button
                    type="button"
                    onClick={() => {
                        this.actions.toggleFileUploadExpand(!this.state.fileUploadExpanded);
                        this.actions.clearUserData();
                    }}
                >
                    Upload new feed file
                </button>
                <Expandable expanded={this.state.fileUploadExpanded}>
                    {this.state.fileUploadExpanded && (
                        <div className={styles.uploadContainer}>
                            <div className={styles.sectionStart}>Select file:</div>
                            <input type="file" onChange={this.actions.handleFileSelect} />
                            <div className={styles.sectionStart}>Process as:</div>
                            <div>
                                <input
                                    type="radio"
                                    value="doogal.co.uk"
                                    onChange={this.actions.handleProcessAsChange}
                                />
                                <span>doogal.co.uk file</span>
                            </div>
                            <div className={`${styles.sectionStart} ${styles.buttonContainer}`}>
                                <button
                                    type="submit"
                                    onClick={this.actions.handleUpload}
                                >
                                    Upload feed
                                </button>
                                <button
                                    type="button"
                                    onClick={this.actions.clearUserData}
                                >
                                    Clear
                                </button>
                            </div>
                            <div className={styles.errorMessage}>
                                {this.state.error}
                            </div>
                        </div>
                    )}
                </Expandable>
                {this.state.isUploading && (
                    <LoadingIcon className={styles.loadingIcon} />
                )}
                {this.state.isProcessStatusOpen && (
                    <div className={styles.sectionStart}>
                        <ProcessStatus
                            statusUrl={this.state.processStatusUrl}
                            onError={this.actions.setError}
                            connectionId={this.state.statusConnectionId}
                        />
                    </div>
                )}
            </div>
        );
    }
}

export default FeedUploader;
