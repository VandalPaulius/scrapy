import React from 'react';
import PropTypes from 'prop-types';
import uuid from 'uuid/v4';

class ProcessStatus extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            messages: [],
        };

        this.actions = this.initActions();

        this.actions.handleWebsocketMessage = this.actions.handleWebsocketMessage.bind(this);
    }

    // eslint-disable-next-line react/sort-comp
    initActions() {
        return {
            handleWebsocketMessage: (message) => {
                this.setState((prevState) => {
                    const messages = [...prevState.messages];

                    if (prevState.messages.length <= 6) {
                        messages.push({
                            text: message,
                            id: uuid(),
                        });

                        return { messages };
                    }

                    const first = [];
                    const second = [];

                    messages.forEach((msg, index) => {
                        if (index < 3) {
                            first.push(msg);
                        } else if (index > messages.length - 3) {
                            second.push(msg);
                        }
                    });

                    return {
                        messages: first.concat(second),
                    };
                });
            },
        };
    }

    componentDidMount() {
        this.handleWebsocketConnection();
    }

    handleWebsocketConnection() {
        this.actions.handleWebsocketMessage('Opening Websocket connection');

        try {
            const socket = new WebSocket(`${this.props.statusUrl}?connectionId=${this.props.connectionId}`);

            socket.onerror = () => {
                this.props.onError('Websocket connection encountered an error.');
                socket.close();
            };

            socket.onopen = () => this.actions.handleWebsocketMessage('Connection opened');

            socket.onmessage = (event) => {
                if (event.data && typeof event.data === 'string') {
                    this.actions.handleWebsocketMessage(event.data);
                }
            };

            socket.onclose = () => {
                socket.onmessage = null;
                socket.onopen = null;
                socket.onerror = null;
                socket.onclose = null;
            };
        } catch (err) {
            this.props.onError(err);
        }
    }

    render() {
        return (
            <div>
                {this.state.messages.map((msg, index) => {
                    const renderMessage = (id, text) => (
                        <div key={id}>
                            {text}
                        </div>
                    );

                    if (index === 3) {
                        return (
                            <React.Fragment key={uuid()}>
                                {renderMessage(uuid(), '...')}
                                {renderMessage(msg.id, msg.text)}
                            </React.Fragment>
                        );
                    }

                    return renderMessage(msg.id, msg.text);
                })}
            </div>
        );
    }
}

ProcessStatus.propTypes = {
    statusUrl: PropTypes.string.isRequired,
    onError: PropTypes.func,
    connectionId: PropTypes.string.isRequired,
};

ProcessStatus.defaultProps = {
    onError: () => {},
};

export default ProcessStatus;
