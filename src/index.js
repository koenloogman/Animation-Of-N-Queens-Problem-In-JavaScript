'use strict';
const $ = require('jquery');
const Two = require('two.js');
const queenSVG = require('../svg/queen.svg');

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
$('body').append('<svg id="queen" class="hide" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve"><path d="M211.6,276.9V266c0-4.1-3.4-7.5-7.5-7.5c-4.1,0-7.5,3.4-7.5,7.5v10.9c0,4.1,3.4,7.5,7.5,7.5C208.2,284.4,211.6,281.1,211.6,276.9z"/><path d="M332.6,276.9V266c0-4.1-3.4-7.5-7.5-7.5c-4.1,0-7.5,3.4-7.5,7.5v10.9c0,4.1,3.4,7.5,7.5,7.5C329.2,284.4,332.6,281.1,332.6,276.9z"/><path d="M264.6,290.3c8,0,15.5-3.3,20.6-9.2c2.7-3.1,2.4-7.9-0.7-10.6s-7.9-2.4-10.6,0.7c-2.2,2.6-5.6,4-9.3,4s-7-1.5-9.3-4c-2.7-3.1-7.5-3.4-10.6-0.7c-3.1,2.7-3.4,7.5-0.7,10.6C249.1,286.9,256.6,290.3,264.6,290.3z"/><path d="M357.8,360.9c14.8-19.9,22.9-44.1,22.9-69.2c0-64-52.1-116.1-116.1-116.1c-22.9,0-45.1,6.7-64.1,19.3c-3.4,2.3-4.4,6.9-2.1,10.4c2.3,3.4,6.9,4.4,10.4,2.1c16.6-11,35.9-16.8,55.8-16.8c55.8,0,101.1,45.4,101.1,101.1c0,24.5-8.8,48-24.8,66.4H188.3c-16-18.4-24.8-41.9-24.8-66.4c0-24.1,8.6-47.5,24.3-65.8c2.7-3.1,2.3-7.9-0.8-10.6c-3.1-2.7-7.9-2.3-10.6,0.8c-18,21-27.9,47.8-27.9,75.6c0,25.1,8.1,49.3,22.9,69.2c-12,5.2-20.4,17.2-20.4,31.1c0,15.1,9.9,27.9,23.6,32.3l63.7,0.4c1.2,0,2.3,0,3.5,0l45.8,0.3c0.1,0,0.2,0,0.3,0l18.9,0.1c0.2,0,0.5-0.1,0.7-0.1c0.5,0,1,0,1.6,0.1l37,0.2c2.8-0.4,5.6-0.7,8.5-0.9c13.8-4.3,23.8-17.2,23.8-32.4C378.2,378.1,369.8,366.2,357.8,360.9zM344.3,410.9H184.9c-10.4,0-18.9-8.5-18.9-18.9s8.5-18.9,18.9-18.9h159.4c10.4,0,18.9,8.5,18.9,18.9S354.7,410.9,344.3,410.9z"/><path d="M323.3,99.8c-4.1,0-7.4,3.3-7.4,7.4c0,2.1,0.8,3.9,2.2,5.3l-16.7,33.2l-0.2-32.1c2.2-1.3,3.7-3.7,3.7-6.4c0-4.1-3.3-7.4-7.4-7.4s-7.4,3.3-7.4,7.4c0,2.5,1.2,4.7,3.1,6l-12,36.2l-12.2-36.2c1.9-1.3,3.1-3.5,3.1-6c0-4.1-3.3-7.4-7.4-7.4s-7.4,3.3-7.4,7.4c0,2.5,1.2,4.7,3.1,6l-12.2,36.3l-12-36.3c1.9-1.3,3.1-3.5,3.1-6c0-4.1-3.3-7.4-7.4-7.4s-7.4,3.3-7.4,7.4c0,2.7,1.5,5.1,3.7,6.4l-0.2,32.1l-16.8-33.5c1.2-1.3,2-3.1,2-5.1c0-4.1-3.3-7.4-7.4-7.4s-7.4,3.3-7.4,7.4c0,3.4,2.3,6.2,5.4,7.1l24.4,65.1c0.5,1.5,1.9,2.4,3.5,2.4h66c1.6,0,3-1,3.5-2.4l24.4-65.2c2.9-1,5-3.8,5-7C330.8,103.1,327.4,99.8,323.3,99.8z"/></svg>');
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