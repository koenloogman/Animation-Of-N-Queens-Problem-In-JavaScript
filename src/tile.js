'use strict';

class Tile {
    constructor(chessBoard) {
        /**
         * @type {ChessBoard}
         */
        this.chessBoard = chessBoard;
        this.contains = null;

        /**
         * @type {{x: Number, y: Number}}
         * @private
         */
        this._position = null;

        /**
         * @type {{width: Number, height: Number}}
         * @private
         */
        this._size = null;
    }

    /**
     * @returns {{x: Number, y: Number}}
     */
    get position() {
        if (this._position == null) {
            this._position = this.chessBoard.getTilePosition(this);
        }
        return this._position;
    }

    /**
     * @returns {{width: Number, height: Number}}
     */
    get size() {
        if (this._size == null) {
            var w = this.chessBoard.size.width / this.chessBoard.cols;
            var h = this.chessBoard.size.height / this.chessBoard.rows;
            this._size = {
                'width': w,
                'height': h
            };
        }
        return this._size;
    }

    draw(p5) {
        p5.push();
        // go to position on board
        p5.translate(this.size.width * this.position.x, this.size.height * this.position.y);
        
        if (this.position.x % 2 == this.position.y % 2) {
            p5.fill(255);
        } else {
            p5.fill(0);
        }
        p5.rect(0, 0, this.size.width, this.size.height);
        if (this.contains != null) {
            if (this.contains == "queen") {
                p5.fill(0, 255, 0);
            } else {
                p5.fill(255, 0, 0);
            }
            p5.ellipse(this.size.width / 2, this.size.height / 2, this.size.width / 2, this.size.height / 2);
        }
        p5.pop();
    }
}

module.exports = Tile;