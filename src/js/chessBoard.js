'use strict';
const { Set } = require('immutable');
const Two = require('two.js');

/**
 * The ChessBoard class is a chessboard implemented with Two.js to display the state of the DavisPutnam algorithm when solving the N-Queens Problem.
 * 
 * @author Koen Loogman <koen@loogman.de>
 */
class ChessBoard {
    /**
     * The constructor of the ChessBoard class.
     * 
     * @param {{two: Two, n: Number, size: Number, color: {board: String, tileB: String, tileW: String, queen: String, cross: String}}} options
     */
    constructor(options) {
        // overwrite default settings with the options
        const settings = {
            two: new Two(),
            n: 8,
            size: 200,
            color: {
                board: '#4F2649',
                tileB: '#FCFCFC',
                tileW: '#080816',
                queen: '#88D317',
                cross: '#D31717'
            }
        };
        this.settings = {...settings, ...options};

        /**
         * @type {Set<String>}
         */
        this.literals = new Set();
        /**
         * @type {Array<Array<T>>}
         */
        this.state = [[]];
        this.tiles = [];
        this.queens = [];
        this.crosses = [];

        // create board and groups
        this.size = this.settings.size;
        this.board = this.settings.two.makeRectangle(this.settings.size / 2, this.settings.size / 2, this.settings.size, this.settings.size);
        this.board.fill = this.settings.color.board;
        this.board.noStroke();
        this.tileLayer = this.settings.two.makeGroup();
        this.queenLayer = this.settings.two.makeGroup();
        this.crossLayer = this.settings.two.makeGroup();

        this.n = this.settings.n;
    }

    /**
     * @returns {Number} 
     */
    get n() {
        return this.state.length;
    }
    /**
     * @param {Number} n - number of tiles for x and y axis of the chessboard
     */
    set n(n) {
        this.literals = new Set();
        
        // calculate sizes
        let padding = this.size * 0.1 / n;
        let slotSize = (this.size - padding * 2) / n;
        let tileSize = slotSize - padding * 2 / n;

        // remove old tiles and queenLayer from the scene
        this.tileLayer.remove(this.tiles);
        this.queenLayer.remove(this.queens);
        this.crossLayer.remove(this.crosses)

        // initialize reference arrays
        this.state = Array(n).fill(0).map(_ => Array(n).fill(' '));
        this.tiles = Array(n * n).fill(null);
        this.queens = Array(n * n).fill(null);
        this.crosses = Array(n * n).fill(null);

        // set start vector to center of the first tile
        this.tileLayer.translation = new Two.Vector(slotSize / 2 + padding, slotSize / 2 + padding);
        this.queenLayer.translation = this.tileLayer.translation;
        this.crossLayer.translation = this.tileLayer.translation;

        // init all layers
        for (let i = 0; i < n * n; i++) {
            let x = i % n;
            let y = Math.floor(i / n);

            // create tile
            let tile = new Two.Rectangle(x * slotSize, y * slotSize, tileSize, tileSize);
            tile.fill = y % 2 == x % 2 ? this.settings.color.tileW : this.settings.color.tileB;
            this.tiles[i] = tile;

            // create queen
            let queen = new Two.Group();
            queen.add(new Two.Circle(0 , 0, tileSize / 2 * 0.9));
            queen.translation = new Two.Vector(x * slotSize, y * slotSize);
            queen.fill = this.settings.color.queen;
            queen.noStroke();
            this.queens[i] = queen;

            // create cross
            let corner = tileSize * 0.75 / 2;
            let cross = new Two.Group();
            cross.add(new Two.Line(-corner, -corner, corner, corner));
            cross.add(new Two.Line(-corner, corner, corner, -corner));
            cross.translation = new Two.Vector(x * slotSize, y * slotSize);
            cross.linewidth = tileSize * 0.1;
            cross.opacity = 0.8;
            cross.stroke = this.settings.color.cross;
            this.crosses[i] = cross;
        }

        this.tileLayer.add(this.tiles);
        this.tileLayer.noStroke();
    }

    /**
     * Clears the current state of the chessboard.
     */
    clear() {
        this.literals = new Set();
        this.state.forEach((row, y) => row.forEach((_, x) => this.setClear(x, y)));
    }

    /**
     * Sets the state of the chessboard and changes the visual representation by removing and adding queens and crosses to the board.
     * 
     * @param {Array<String>} state
     */
    setState(state) {
        /**
         * @type {Set<String>}
         */
        let _literals = new Set(state);

        // get removed literals
        let remove = this.literals.subtract(_literals).map(literal => (literal.substr(0, 1) == '!' ? literal.substr(1) : literal).split(',').map(n => Number(n) - 1));
        
        // get new literals
        let add = _literals.subtract(this.literals);
        let queens = add.filter(literal => literal.substr(0, 1) != '!').map(literal => literal.split(',').map(n => Number(n) - 1));
        let crosses = add.filter(literal => literal.substr(0, 1) == '!').map(literal => literal.substr(1).split(',').map(n => Number(n) - 1));
        
        // overwrite old literals
        this.literals = _literals;

        // update the visuals
        remove.forEach(([x, y]) => this.setClear(x, y));
        queens.forEach(([x, y]) => this.setQueen(x, y));
        crosses.forEach(([x, y]) => this.setCross(x, y));
    }

    /**
     * Clears the given tile of the chessboard by removing the queen and/or cross.
     * 
     * @param {Number} x - column
     * @param {Number} y - row
     */
    setClear(x, y) {
        this.state[y][x] = ' ';

        // remove queen only if not in literals
        if (!this.literals.contains((x + 1) + ',' + (y + 1)))
            this.queenLayer.remove(this.queens[x + y * this.n]);
        
        // remove cross only if not in literals
        if (!this.literals.contains('!' + (x + 1) + ',' + (y + 1)))
            this.crossLayer.remove(this.crosses[x + y * this.n]);
    }

    /**
     * Sets a queen at the given tile.
     * 
     * @param {Number} x - column
     * @param {Number} y - row
     */
    setQueen(x, y) {
        this.state[y][x] = 'Q';
        this.queenLayer.add(this.queens[x + y * this.n]);
    }

    /**
     * Sets a cross at the given tile.
     * 
     * @param {Number} x - column
     * @param {Number} y - row
     */
    setCross(x, y) {
        this.state[y][x] = '.';
        this.crossLayer.add(this.crosses[x + y * this.n]);
    }

    /**
     * Returns a ASCII representation of the state.
     * 
     * @returns {String}
     */
    toString() {
        let border = '+' + '---+'.repeat(this.n) + '\n';
        return border + this.state.map(row => '| ' + row.join(' | ') + ' |\n').join(border) + border;
    }
}

module.exports = ChessBoard;