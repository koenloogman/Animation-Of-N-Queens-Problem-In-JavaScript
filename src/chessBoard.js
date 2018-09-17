'use strict';
const Tile = require('./tile');

class ChessBoard {
    constructor(size, n = 8) {
        /**
         * @type {{size: Number}}
         */
        this.border = {
            'size': size / n / 3
        }

        /**
         * @type {{width: Number, height: Number}}
         */
        this.size = {
            'width': size - this.border.size * 2,
            'height': size - this.border.size * 2
        };

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

        this.tiles.forEach(tile => tile.contains = null);
        queens.forEach(queen => {
            this.getTileByPosition(queen[0], queen[1]).contains = "queen";
        });
        notQueens.forEach(notQueen => {
            this.getTileByPosition(notQueen[0], notQueen[1]).contains = "notQueen";
        });
    }

    draw(p5) {
        p5.push();
        p5.noStroke();

        // border
        p5.fill(170, 0, 70);
        p5.rect(-this.border.size, -this.border.size, this.size.width + 2 * this.border.size, this.size.height + 2 * this.border.size);
        
        // letters
        var letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
        p5.fill(255);
        p5.textSize(this.border.size * 0.6);
        p5.textAlign(p5.CENTER, p5.CENTER);
        var w = this.size.width / this.cols;
        var h = this.size.height / this.rows;
        var b = this.border.size / 2;
        p5.push();
        p5.translate(w / 2, -b);
        for (var i = 0; i < this.cols; i++) {
            p5.text(letters[i], 0, 0);
            p5.text(letters[i], 0, this.size.height + this.border.size);
            p5.translate(w, 0);
        }
        p5.pop();

        // numbers
        p5.push();
        p5.translate(-b, h / 2);
        for (var i = 0; i < this.cols; i++) {
            p5.text(this.cols - i, 0, 0);
            p5.text(this.cols - i, this.size.width + this.border.size, 0);
            p5.translate(0, h);
        }
        p5.pop();

        // tiles
        this.tiles.forEach(tile => {
            tile.draw(p5);
        });
        p5.pop();
    }
}

module.exports = ChessBoard;