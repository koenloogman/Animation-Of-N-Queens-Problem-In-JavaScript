'use strict';
const ChessBoard = require('./chessBoard');
const DavisPutnam = require('./davisPutnam');
const QueensClauses = require('./qeensClauses');

const Sketch = (p5) => {
    var n = 8;
    var chessBoard = null;
    var davisPutnam = new DavisPutnam(QueensClauses(n));

    p5.setup = () => {
        p5.createCanvas(p5.windowWidth, p5.windowHeight);
        chessBoard = new ChessBoard(p5.width > p5.height ? p5.height * 0.8 : p5.width * 0.8, n);
    };
    p5.draw = () => {
        davisPutnam.solve(1);
        chessBoard.setQueens(davisPutnam.clauses);
        p5.background(75);
    
        // center chessboard
        p5.translate((p5.width - chessBoard.size.width) / 2, (p5.height - chessBoard.size.height) / 2);
        chessBoard.draw(p5);

        p5.frameRate(60);
    };
    p5.windowResized = () => {
        p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    };
};

module.exports = Sketch;