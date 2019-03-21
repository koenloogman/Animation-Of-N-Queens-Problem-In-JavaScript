'use strict';
const { Set } = require('immutable');

class ChessBoard {
    constructor(n = 8) {
        /**
         * @type {Set<String>}
         */
        this.literals = new Set();
        /**
         * @type {Array<Array<T>>}
         */
        this.state = null;
        
        this.n = n;
    }

    get n() {
        return this.state.length;
    }
    set n(n) {
        this.state = Array(n).fill(0).map(_ => Array(n).fill(' '));
    }

    clear() {
        this.state.forEach(row => row.fill(' '));
        this.literals = new Set();
    }

    /**
     * @param {Array<String>} state 
     */
    setState(state) {
        /**
         * @type {Set<String>}
         */
        let literals = new Set(state);
        // get removed literals
        let rem = this.literals.subtract(literals).map(literal => (literal.substr(0, 1) == '!' ? literal.substr(1) : literal).split(',').map(n => Number(n) - 1));
        // get new literals
        literals = literals.subtract(this.literals);
        let pos = literals.filter(literal => literal.substr(0, 1) != '!').map(literal => literal.split(',').map(n => Number(n) - 1));
        let neg = literals.filter(literal => literal.substr(0, 1) == '!').map(literal => literal.substr(1).split(',').map(n => Number(n) - 1));
        this.literals = literals;

        rem.forEach(([x, y]) => this.setClear(x, y));
        pos.forEach(([x, y]) => this.setQueen(x, y));
        neg.forEach(([x, y]) => this.setCross(x, y));
    }

    setClear(x, y) {
        this.state[y][x] = ' ';
    }

    setQueen(x, y) {
        this.state[y][x] = 'Q';
    }

    setCross(x, y) {
        this.state[y][x] = '.';
    }

    /**
     * @returns {String}
     */
    toString() {
        let border = '+' + '---+'.repeat(this.n) + '\n';
        return border + this.state.map(row => '| ' + row.join(' | ') + ' |\n').join(border) + border;
    }
}

module.exports = ChessBoard;