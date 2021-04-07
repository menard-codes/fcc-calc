import React, { Component } from 'react';
import Display from './components/Display_Component/Display';
import Keypad from './components/Keypad_Component/Keypad';
import './scss/App.scss';

export class App extends Component {

    constructor(props) {
        super(props);

        this.state = {
            formula: '',
            display: 0
        };

        this.handleState = this.handleState.bind(this);
    }

    handleState(for_formula, for_display) {
        this.setState({
            formula: for_formula,
            display: for_display
        });
    }

    render() {
        const {formula, display} = this.state;
        return (
            <div id="app">
                <div id="app__calculator">
                    <Display formula={formula} display={display}  />
                    <Keypad formula={formula} display={display} handleState={this.handleState} />
                </div>
            </div>
        );
    }
}

export default App;
