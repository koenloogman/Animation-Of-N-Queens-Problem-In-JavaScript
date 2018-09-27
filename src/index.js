'use strict';
const $ = require('jquery');
const Two = require('two.js');

//Force page refresh on hot reload
if (module.hot) {
    module.hot.accept(function () {
        window.location.reload();
    })
}

let two = new Two({
    fullscreen: true
}).appendTo(document.body);
two.scene.translation.set(two.width / 2, two.height / 2);

// define sizes
let n = 8;
let size = Math.min(two.width, two.height) * 0.8;
let outerMargin = size * 0.035 * 8 / n;
let innerMargin = size * 0.01 * (n > 1 ? 8 / n : 0);
let innerSize = size - 2 * outerMargin;
let tileSize = (innerSize - (n - 1) * innerMargin) / n;
console.log("size: " + size);
console.log("outerMargin: " + outerMargin);
console.log("innerMargin: " + innerMargin);
console.log("innerSize: " + innerSize);
console.log("tileSize: " + tileSize);

// define colors
let colors = {
    'black': "#353238",
    'white': "#DED9D4",
    'brown': "#73563F",
    'gray': "#888888"
};

// create board
let board = two.makeRoundedRectangle(size / 2, size / 2, size, size, size * 0.0125);
board.fill = colors.brown;

let chessBoard = two.makeGroup(board);
chessBoard.translation.set(- size / 2, -size / 2);

// get queen
let firstQueen = two.interpret($('#queen')[0]).center(); // 400px scale
firstQueen.scale *= tileSize / 400;
firstQueen.fill = colors.gray;
$('#queen').remove();

// add tiles
let tiles = new Array();
let queens = new Array();
for (let i = 0; i < n * n; i++) {
    let x = i % n;
    let y = Math.floor(i / n);
    let left = (tileSize + innerMargin) * x + tileSize * 0.5 + outerMargin;
    let top = (tileSize + innerMargin) * y + tileSize * 0.5 + outerMargin;

    let tile = two.makeRoundedRectangle(0, 0, tileSize, tileSize, tileSize * 0.05);
    tile.fill = x % 2 == y % 2 ? colors.white : colors.black;

    let group = two.makeGroup(tile);
    group.translation.set(left, top);
    chessBoard.add(group);

    tiles.push(group);
}
chessBoard.noStroke();

for (let i = 0; i < n; i++) {
    let queen = i == 0 ? firstQueen : firstQueen.clone();
    queens.push(queen);
    two.remove(queen);
}


two.bind('update', function(frameCount) {
    //queens.forEach(queen => queen.rotation += Math.PI / 258);
}).bind('resize', function() {
    chessBoard.translation.set(two.width / 2, two.height / 2);
}).play();

// events
two.update();
// hide queens
tiles.forEach((tile, index) => {
    $(tile._renderer.elem)
        .css('cursor', 'pointer')
        .click(function(e) {
            let i = Math.floor(index / n);
            let queen = queens[i];
            queen.translation.set(0, 0);
            if (queen.parent == tile) {
                tile.remove(queen);
            } else {
                tile.add(queen);
            }
        });
});

console.log(two);