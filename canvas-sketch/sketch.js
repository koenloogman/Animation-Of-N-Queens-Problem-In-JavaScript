var chessBoard = null;

function setup() {
  createCanvas(windowWidth, windowHeight);

  chessBoard = new ChessBoard(width > height ? height * 0.8 : width * 0.8, 26);
  console.log(chessBoard);
}

function draw() {
  background(75);

  chessBoard.draw();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}