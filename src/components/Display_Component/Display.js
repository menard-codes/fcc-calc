import React from 'react';
import './display.scss';

function Display(props) {
    return (
        <div id="screen-container">
            <div id="formula">{props.formula}</div>
            <div id="display">{props.display}</div>
        </div>
    );
}

export default Display;
