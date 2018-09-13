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
     * @param {Array<Array<Number>>} arr 
     */
    setQueens(arr) {
        console.log(arr.toArray());
    }

    draw() {
        push();
        translate((width - this.size.width) / 2, (height - this.size.height) / 2);
        noStroke();

        // border
        fill(170, 0, 70);
        rect(-this.border.size, -this.border.size, this.size.width + 2 * this.border.size, this.size.height + 2 * this.border.size);
        
        // letters
        var letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
        fill(255);
        textSize(this.border.size * 0.6);
        textAlign(CENTER, CENTER);
        var w = this.size.width / this.cols;
        var h = this.size.height / this.rows;
        var b = this.border.size / 2;
        push();
        translate(w / 2, -b);
        for (var i = 0; i < this.cols; i++) {
            text(letters[i], 0, 0);
            text(letters[i], 0, this.size.height + this.border.size);
            translate(w, 0);
        }
        pop();

        // numbers
        push();
        translate(-b, h / 2);
        for (var i = 0; i < this.cols; i++) {
            text(this.cols - i, 0, 0);
            text(this.cols - i, this.size.width + this.border.size, 0);
            translate(0, h);
        }
        pop();

        // tiles
        this.tiles.forEach(tile => {
            tile.draw();
        });
        pop();
    }
}