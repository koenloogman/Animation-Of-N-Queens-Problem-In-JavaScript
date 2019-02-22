'use strict';

const fs = require('fs');
const Two = require('two.js');
const ChessBoard = require('./chessBoard.js');

//Force page refresh on hot reload
if (module.hot) {
    module.hot.accept(function () {
        window.location.reload();
    })
}

// define colors
let colors = {
    'black': "#353238",
    'white': "#DED9D4",
    'wood': "#73563F",
    'queen': "#888888"
};

let two = new Two({
    fullscreen: true,
    autostart: true
}).appendTo(document.body);

let chessBoard, state = startingState, n = 8, ln = 8;

function startingState() {
    let nextState = idleState;

    two.clear();
    chessBoard = new ChessBoard(two, n, Math.min(two.width - 50, two.height - 50));
    chessBoard.board.fill = colors.wood;
    chessBoard.whiteFill = colors.white;
    chessBoard.blackFill = colors.black;
    chessBoard.noStroke();

    two.scene.translation.set(two.width / 2, two.height / 2);
    console.log(chessBoard);
    return nextState;
}

function idleState() {
    let max = 3200;
    n = ++n % max;
    let nn = Math.round(Math.abs(n - max / 2) / 100);
    if (ln != nn) {
        chessBoard.n = nn;
    }
    ln = chessBoard.n;
    return idleState;
}

two.bind('update', (frame, td) => {
    state = state();
}).bind('resize', (frame, td) => {
    two.scene.translation.set(two.width / 2, two.height / 2);
    chessBoard.size = Math.min(two.width - 50, two.height - 50);
});