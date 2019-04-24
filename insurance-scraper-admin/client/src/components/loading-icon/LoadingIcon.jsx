import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.scss';

function LoadingIcon(props) {
    return (
        <svg
            className={`${styles.loadingIcon} ${props.className}`}
            style={{
                fill: props.style.color,
                stroke: props.style.color,
                enableBackground: 'new 0 0 50 50',
                ...props.style,
            }}
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            viewBox="0 0 50 50"
            xmlSpace="preserve"
        >
            <path
                d="M25.251,6.461c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615V6.461z"
            >
                <animateTransform
                    attributeType="xml"
                    attributeName="transform"
                    type="rotate"
                    from="0 25 25"
                    to="360 25 25"
                    dur="0.6s"
                    repeatCount="indefinite"
                />
            </path>
        </svg>
    );
}

LoadingIcon.propTypes = {
    className: PropTypes.string,
    style: PropTypes.shape({
        color: PropTypes.string,
    }),
};

LoadingIcon.defaultProps = {
    className: '',
    style: {
        color: '#000000',
    },
};

export default LoadingIcon;
