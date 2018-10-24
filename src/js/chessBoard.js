'use strict';
const Tile = require('./tile');

function toAlphabet(i, alphabet, size = 1) {
    var alphabet = alphabet.split('');
    var base = alphabet.length;

    var result = "";
    while (i >= base) {
        result = alphabet[i % base] + result;
        i = Math.floor(i / base);
    }
    result = alphabet[i % base] + result;
    while (result.length < size) {
        result = alphabet[0] + result;
    }
    return result;
}
class ChessBoard {
    constructor(size, n = 8) {
        /**
         * @type {Number}
         */
        this.cols = n;

        /**
         * @type {Number}
         */
        this.rows = n;

        /**
         * @type {Array<Tile>}
         */
        this.tiles = new Array();
        for (var i = 0; i < this.cols * this.rows; i++) {
            this.tiles.push(new Tile(this));
        }

        /**
         * @type {Array<String>}
         */
        this.letters = new Array();
        let base = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let length = Math.log(n) / Math.log(base.length);
        for (var i = 0; i < n; i++) {
            this.letters.push(toAlphabet(i, base, length));
        }
    }

    /**
     * @param {Tile} tile 
     */
    getTilePosition(tile) {
        var index = this.tiles.indexOf(tile);
        return {'x': index % this.cols, 'y': Math.floor(index / this.cols)}
    }

    /**
     * @param {Number} x 
     * @param {Number} y 
     */
    getTileByPosition(x, y) {
        return this.tiles[x + y * this.cols];
    }

    /**
     * @param {Array<Array<String>>} arr 
     */
    setQueens(arr) {
        /**
         * @type {Array<String>}
         */
        var units = arr.filter(a => a.length == 1).map(a => a[0]);
        /**
         * @param {Array<Array<Number>>}
         */
        var queens = units.filter(a => a.substr(0, 1) != '!').map(a => a.split(',').map(b => Number.parseInt(b) - 1));
        var notQueens = units.filter(a => a.substr(0, 1) == '!').map(a => a.substr(1).split(',').map(b => Number.parseInt(b) - 1));

        this.tiles.forEach(tile => {
            tile.queen = false;
            tile.mark = false;
        });
        queens.forEach(queen => {
            this.getTileByPosition(queen[0], queen[1]).queen = true;
        });
        notQueens.forEach(notQueen => {
            this.getTileByPosition(notQueen[0], notQueen[1]).mark = true;
        });
    }
}

module.exports = ChessBoard;