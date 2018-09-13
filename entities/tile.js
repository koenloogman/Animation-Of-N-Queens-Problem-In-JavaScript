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

    draw() {
        push();
        // go to position on board
        translate(this.size.width * this.position.x, this.size.height * this.position.y);
        
        if (this.position.x % 2 == this.position.y % 2) {
            fill(255);
        } else {
            fill(0);
        }
        rect(0, 0, this.size.width, this.size.height);
        pop();
    }
}