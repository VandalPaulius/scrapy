import React from 'react';
import {
    FeedHistory,
    FeedUploader,
    Menu,
    DatabaseHandler,
} from './components';
import styles from './styles.scss';

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            activePage: 'feedUploader',
        };

        this.actions = this.initActions();
    }

    initActions() {
        return {
            setActivePage: (pageName) => {
                if (this.state.activePage !== pageName) {
                    this.setState({ activePage: pageName });
                }
            },
        };
    }

    render() {
        return (
            <div>
                <h2>Insurance scraper Admin panel</h2>
                <div className={styles.mainLayout}>
                    <Menu
                        setActivePage={this.actions.setActivePage}
                        activePage={this.state.activePage}
                    />
                    <div className={styles.content}>
                        {this.state.activePage === 'feedUploader' && (
                            <div>
                                <FeedUploader />
                                <FeedHistory className={styles.marginTop} />
                            </div>
                        )}
                        {this.state.activePage === 'optionScraper' && (
                            <div>
                                optionScraper
                            </div>
                        )}
                        {this.state.activePage === 'databaseHandler' && (
                            <DatabaseHandler />
                        )}
                    </div>
                </div>

            </div>
        );
    }
}

export default App;
