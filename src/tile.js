'use strict';
class Tile {
    constructor(chessBoard) {
        /**
         * @type {ChessBoard}
         */
        this.chessBoard = chessBoard;
        this.queen = false;
        this.mark = false;

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
}

module.exports = Tile;