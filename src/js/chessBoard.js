'use strict';

const Two = require('two.js');

class ChessBoard {

    constructor(two, n = 8, size = 500) {
        this.two = two;

        // parameters
        this._noStroke = false;
        this._whiteFill = "#fff";
        this._blackFill = "#000";

        // chess board
        this.board = new Two.RoundedRectangle(0, 0, 0, 0, 0);
        this.group = new Two.Group();
        this.group.add(this.board);
        this.tiles = [];
        this.size = size;
        this.n = n;

        two.add(this.group);
    }

    get n() {
        return this._n;
    }

    set n(n) {
        this._n = n;
        // reduce tiles if new n is smaller than previous
        this.group.remove(this.tiles.slice(n * n));
        this.tiles = this.tiles.slice(0, n * n);

        // create tiles
        for (var i = this.tiles.length; i < n * n; i++) {
            let tile = new Two.RoundedRectangle(0, 0, 0, 0);
            this.tiles.push(tile);
            this.group.add(tile);
        }
        // resize tiles to fit the board
        this.size = this.size;
    }

    get size() {
        return this._size;
    }

    set size(size) {
        this._size = size;

        // rearrange group and board
        this.board.width = size;
        this.board.height = size;
        this.board.radius = size * 0.0125;

        // define sizes
        let innerSize = this.innerSize;
        let tileSpacing = this.tileSpacing;
        let tileSize = this.tileSize;

        // resize tiles
        this.tiles.forEach((tile, i) => {
            let x = i % this.n;
            let y = Math.floor(i / this.n);

            tile.height = tileSize;
            tile.width = tileSize;
            tile.radius = tileSize * 0.05;
            tile.translation.set(
                x * (tileSize + tileSpacing) + tileSize / 2 - innerSize / 2,
                y * (tileSize + tileSpacing) + tileSize / 2 - innerSize / 2
            );

            // TODO replace colors
            tile.fill = x % 2 == y % 2 ? this._whiteFill : this._blackFill;
        });
        if (this._noStroke) {
            this.noStroke();
        }
    }

    get innerSize() {
        return this.size * (1 - 0.035 * 8 / this.n);
    }

    get tileSpacing() {
        return this.size * 0.01 * (this.n > 1 ? 8 / this.n : 0)
    }

    get tileSize() {
        return (this.innerSize - (this.n - 1) * this.tileSpacing) / this.n;
    }

    get translation() {
        return this.group.translation;
    }

    whiteTiles() {
        return this.tiles.filter((tile, i) => (i % this.n) % 2 == Math.floor(i / this.n) % 2);
    }
    
    blackTiles() {
        return this.tiles.filter((tile, i) => (i % this.n) % 2 != Math.floor(i / this.n) % 2);
    }

    getTile(x, y) {
        return this.tiles[y * this.n + x];
    }

    get whiteFill() {
        return this._whiteFill;
    }

    set whiteFill(color) {
        this._whiteFill = color;
        this.whiteTiles().forEach((tile) => tile.fill = color);
    }

    get blackFill() {
        return this._blackFill;
    }

    set blackFill(color) {
        this._blackFill = color;
        this.blackTiles().forEach((tile) => tile.fill = color);
    }

    noStroke() {
        this._noStroke = true;
        this.group.noStroke();
    }
}

module.exports = ChessBoard;