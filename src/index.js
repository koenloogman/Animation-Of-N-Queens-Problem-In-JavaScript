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

let n = 8;
let size = Math.min(two.width, two.height) * 0.8;
let board = two.makeRoundedRectangle(0, 0, size, size, size * 0.0125);
board.fill = "#73563F";

let chessBoard = two.makeGroup(board);

let tiles = new Array();
let tilesGroup = two.makeGroup();
let outerMargin = size * 0.05;
let innerMargin = size * 0.01;
let innerSize = size - 2 * outerMargin;
let tileSize = (innerSize - (n - 1) * innerMargin) / n;
// add tiles
for (let i = 0; i < n * n; i++) {
    let x = i % n;
    let y = Math.floor(i / n);

    let tile = two.makeRoundedRectangle((tileSize + innerMargin) * x, (tileSize + innerMargin) * y, tileSize, tileSize, tileSize * 0.05);
    tile.fill = x % 2 == y % 2 ? "#DED9D4" : "#353238";
    tilesGroup.add(tile);
    tiles.push(tile);
}
chessBoard.add(tilesGroup);
tilesGroup.translation.set(-(innerSize - tileSize) / 2, -(innerSize - tileSize) / 2);
chessBoard.translation.set(two.width / 2, two.height / 2);
chessBoard.noStroke();

two.bind('update', function(frameCount) {
    chessBoard.rotation += Math.PI / 256;
}).bind('resize', function() {
    chessBoard.translation.set(two.width / 2, two.height / 2);
}).play();

function getRandomColor() {
    return 'rgb('
        + Math.round(Math.random() * 255) + ','
        + Math.round(Math.random() * 255) + ','
        + Math.round(Math.random() * 255) + ')';
}

// events
two.update();
tiles.forEach(tile => {
    $(tile._renderer.elem)
        .css('cursor', 'pointer')
        .click(function(e) {
            tile.fill = getRandomColor();
        });
});