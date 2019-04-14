import React from 'react';
import propTypes from 'prop-types';
import styles from './styles.scss';

function Menu(props) {
    const renderItem = (name, value) => (
        <div
            className={`${styles.menuItem} ${props.activePage === value ? styles.active : ''}`}
            onClick={() => props.setActivePage(value)}
            role="button"
            tabIndex={0}
        >
            {name}
        </div>
    );

    return (
        <div className={props.className}>
            {renderItem('Feed Uploader', 'feedUploader')}
            {renderItem('Option Scraper', 'optionScraper')}
            {renderItem('Database Handler', 'databaseHandler')}
        </div>
    );
}

Menu.propTypes = {
    setActivePage: propTypes.func.isRequired,
    activePage: propTypes.string,
    className: propTypes.string,
};

Menu.defaultProps = {
    activePage: '',
    className: '',
};

export default Menu;
