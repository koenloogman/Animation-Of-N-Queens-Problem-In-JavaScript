'use strict';
const { Set } = require('immutable');
const Util = require('./util');

class ChessBoard {
    constructor(n = 8) {
        /**
         * @type {Set<String>}
         */
        this._literals = new Set();
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
        this.state = Array(n).fill(0).map(x => Array(n).fill(' '));
    }

    clear() {
        this.state.forEach(row => row.fill(' '));
        this._literals = new Set();
    }

    /**
     * @param {Array<Array<String>>} clauses 
     */
    setState(clauses) {
        /**
         * @type {Set<String>}
         */
        let _literals = new Set(clauses.map(clause => new Set(clause))).flatten();
        _literals = _literals.filter(literal => !_literals.has(Util.negateLiteral(literal)));

        // get sets of elements to remove and add
        let literals = _literals.subtract(this._literals);
        let rem = this._literals.subtract(_literals).map(literal => (literal.substr(0, 1) == '!' ? literal.substr(1) : literal).split(',').map(n => Number(n) - 1));
        let pos = literals.filter(literal => literal.substr(0, 1) != '!').map(literal => literal.split(',').map(n => Number(n) - 1));
        let neg = literals.filter(literal => literal.substr(0, 1) == '!').map(literal => literal.substr(1).split(',').map(n => Number(n) - 1));

        this._literals = _literals;

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