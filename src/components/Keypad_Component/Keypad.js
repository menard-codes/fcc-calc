import React, { Component } from 'react';
import './scss/keypad.scss';

class Keypad extends Component {

    constructor(props) {
        super(props);

        this.state = {
            del: 'AC',
            operators: {
                'add': '+',
                'subtract': '-',
                'multiply': '*',
                'divide': '/'
            },
            numbers: {
                'one': 1,
                'two': 2,
                'three': 3,
                'four': 4,
                'five': 5,
                'six': 6,
                'seven': 7,
                'eight': 8,
                'nine': 9,
                'zero': 0
            },
            decimal: '.',
            equal: '='
        };

        this.handleDelete = this.handleDelete.bind(this);
        this.handleOperator = this.handleOperator.bind(this);
        this.handleNumber = this.handleNumber.bind(this);
        this.handleDecimal = this.handleDecimal.bind(this);
        this.handleEqual = this.handleEqual.bind(this);
    }

    // util method: for laying out the buttons
    buttons_layout(del, operators, numbers, decimal, equal) {
        // layout: [delete, +, -, 1, 2, 3, *, 4, 5, 6, /, 7, 8, 9, =, 0, .]
        return [
            del, operators[0], operators[1],
            numbers.slice(0, 3), operators[2],
            numbers.slice(3, 6), operators[3],
            numbers.slice(6, 9), equal,
            numbers[9], decimal
        ]
    }

    // props: formula, display, handleState
    
    handleDelete() {
        // set the parent states to default (formula is empty, display is zero)
        const for_formula = '';
        const for_display = 0;
        this.props.handleState(for_formula, for_display)
    }

    handleOperator(operator) {
        // NOTE: operator argument is the description string, not the symbol.
        // Also, due to decison tree, I end up writing nested if-else, (I'll just refactor later)

        const formula = this.props.formula.toString();
        const operator_signs = Object.values(this.state.operators);
        const operator_value = this.state.operators[operator];

        // check1: if formula state from parent only consists of operator, just change it upon new operator press
        if (operator_signs.includes(formula)) {
            const for_formula = operator_value;
            const for_display = operator_value;
            this.props.handleState(for_formula, for_display);
        } else if (operator_signs.some(operator => formula.endsWith(operator))) {
            // check2: formula ends with operator
            // follow up: next operator is a 'negative sign (-)' and still valid to add?
            
            const valid_to_append = str => /(\d[+*/-])$/.test(str);
            
            if (operator_value === '-' && valid_to_append(formula)) {
                // operator is for negative sign & it's ok to add it on formula
                const for_formula = `${formula}${operator_value}`;
                const for_display = operator_value;
                this.props.handleState(for_formula, for_display);
            } else {
                // just replace the latest operator
                const for_formula = formula.slice(0, formula.length-1) + operator_value;
                const for_display = operator_value;
                this.props.handleState(for_formula, for_display);
            }
        } else if (formula.includes('=')) {
            // check3: formula is from a successful calculation (user just hit equal)
            const for_formula = this.props.display.toString() + operator_value; // we're taking the latest answer for next calculation
            const for_display = 0;
            this.props.handleState(for_formula, for_display);
        } else {
            // if all conditions above failed, it's just the regular use of operator
            const for_formula = `${formula}${operator_value}`;
            const for_display = operator_value;
            this.props.handleState(for_formula, for_display);
        }
    }

    handleNumber(number) {
        // Note: number argument is the number word, not the exact number

        const formula = this.props.formula.toString();
        const display = Number(this.props.display);
        const number_value = this.state.numbers[number];
        const display_digit_limit = 22 // <<<<<<<< CHANGE THIS LATER BASED ON SCREEN SIZE

        // check1: entering number after performing calculation (equal is just pressed)
        if (formula.includes('=')) {
            // comes from a calculation? overwrite:
            const for_formula = '';
            const for_display = number_value;
            this.props.handleState(for_formula, for_display);
        } else if (display.toString().length <= display_digit_limit) {
            // check2: display length <= limit (limit depends on screen size)
            // follow up: check if display is a string (operator) or num
            if (isNaN(display)) {
                // display is currently showing an operator:
                const for_formula = formula + number_value;
                const for_display = number_value;
                this.props.handleState(for_formula, for_display);
            } else {
                const is_decimal = num => num.toString().includes('.');
                const endswith_operator = displayed_formula => {
                    return Object.values(this.state.operators).some(operator => displayed_formula.toString().endsWith(operator))
                };

                const for_formula = `${formula}${number_value}`;
                const for_display = endswith_operator(formula) ? number_value : is_decimal(this.props.display) ? `${display}${number_value}` : (display * 10) + number_value;
                this.props.handleState(for_formula, for_display);
            }
        }

    }

    handleDecimal() {
        // make sure no repeated decimal in a number
        // in case formula is empty, use 0 then .
        const formula = this.props.formula;
        const display = this.props.display;

        if (formula.length === 0) {
            const for_formula = '0.';
            const for_display = '0.';
            this.props.handleState(for_formula, for_display);
        } else {
            // check for repetition:
            const formula_numbers = formula.split(/[*/]/);
            const dont_have_decimal = num =>  ! num.includes('.');
            if (dont_have_decimal(formula_numbers[formula_numbers.length-1])) {
                const for_formula = `${formula}.`;
                const for_display = `${display}.`;
                this.props.handleState(for_formula, for_display);
            }
        }
    }

    handleEqual() {
        // take the formula and execute it
        try {
            const formula = this.props.formula;
            const answer = eval(formula);
            const for_formula = `${formula}=${answer}`
            const for_display = answer;
            this.props.handleState(for_formula, for_display);
        } catch {
            const for_formula = '';
            const error_flash = 'Math Error';
            this.props.handleState(for_formula, error_flash);
            const for_display = 0;
            setTimeout(() => this.props.handleState(for_formula, for_display), 1000);
        }
    }

    render() {
        // take state values
        const {del, operators, numbers, decimal, equal} = this.state;

        // generate buttons
        const del_button = <button id="clear" className="button" onClick={this.handleDelete} key="del">{del}</button>;
        const operator_buttons = Object.keys(operators).map(operator => {
            return <button id={operator} className="operator button" onClick={() => this.handleOperator(operator)} key={operator}>{operators[operator]}</button>
        });
        const number_buttons = Object.keys(numbers).map(number => {
            return <button id={number} className="number button" onClick={() => this.handleNumber(number)} key={number}>{numbers[number]}</button>
        });
        const decimal_button = <button id="decimal" className="button" onClick={this.handleDecimal} key="decimal">{decimal}</button>;
        const equal_button = <button id="equal" className="button" onClick={this.handleEqual} key="equal">{equal}</button>

        return (
            <div id="calc_keypad">
                {this.buttons_layout(del_button, operator_buttons, number_buttons, decimal_button, equal_button)}
            </div>
        );
    }
}

export default Keypad;
