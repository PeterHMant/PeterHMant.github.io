import { Chess } from "./chess.js"

var sixPawnRook = "8/pppppp2/8/8/8/8/8/7R w - - 0 1"
var bishopFourPawns = "8/pppp4/8/8/8/8/8/5B2 w - - 0 1"
var knightFourPawns = "8/pppp4/8/8/8/8/8/5N2 w - - 0 1"
var currPosition = sixPawnRook;
var board = null
var game = new Chess(sixPawnRook)

var whiteSquareGrey = '#a9a9a9'
var blackSquareGrey = '#696969'

var config = {
    draggable: true,
    position: sixPawnRook,
    onDragStart: onDragStart,
    onDrop: onDrop,
    onMouseoutSquare: onMouseoutSquare,
    onMouseoverSquare: onMouseoverSquare,
    onSnapEnd: onSnapEnd
  }

function removeGreySquares () {
  $('#myBoard .square-55d63').css('background', '')
}

function greySquare (square) {
  var $square = $('#myBoard .square-' + square)

  var background = whiteSquareGrey
  if ($square.hasClass('black-3c85d')) {
    background = blackSquareGrey
  }

  $square.css('background', background)
}

function onDragStart (source, piece) { 
  // do not pick up pieces if the game is over
  //if (game.game_over()) return false

  // or if it's not that side's turn
  if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false
  }
}

function onDrop (source, target) {
  removeGreySquares()

  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  })

  // illegal move
  if (move === null) return 'snapback'

}

function onMouseoverSquare (square, piece) {
  // get list of possible moves for this square
  var moves = game.moves({
    square: square,
    verbose: true
  })

  // exit if there are no moves available for this square
  if (moves.length === 0) return

  // highlight the square they moused over
  greySquare(square)

  // highlight the possible squares for this piece
  for (var i = 0; i < moves.length; i++) {
    greySquare(moves[i].to)
  }
}

function onMouseoutSquare (square, piece) {
  removeGreySquares()
}

function onSnapEnd () {
  board.position(game.fen())

  if (checkQueenCanMove()) {
    window.setTimeout(alert, 550, "You lose :c - black has a queen")
    window.setTimeout(restartGame, 1000);
  }

  else if (noBlackPawns()) {
    window.setTimeout(alert, 550, "YOU WIN")
    window.setTimeout(restartGame, 1000);

  }

  else if (game.moves().length === 0) {
    window.setTimeout(alert, 550, "draw")
    window.setTimeout(restartGame, 1000);
  }
  else {
    makeBestABMove1();
  }
  
  console.log(game.moves().length)
  if (game.turn() === 'w' && game.moves().length === 0) {
    window.setTimeout(alert, 550, "YOU LOSE - no pieces")
    window.setTimeout(restartGame, 1000);
  }
  
  
  
}

// 
//if black queen can move = lose
function checkQueenCanMove() {
    var ascii = game.ascii()
    if ((ascii.includes("q") && game.turn() === 'b')) {
        
        return true;
    }
}
//win when no pawns left
function noBlackPawns() {
    
    var ascii = game.ascii()
    
    if (!ascii.includes("p") && !ascii.includes("q")) {
        
        return true;
    }
}

//restart game 
function restartGame() {
    game = new Chess(currPosition)
    board.position(currPosition)
}


const pieceValues = {
    "p": 1,
    "b": 3,
    "n": 3,
    "r": 5,
    "q": 900,
    "k": 1
}



function alphaBeta1(node, depth, alpha, beta, maxPlayer) {
    let value = 0;
    let legalMoves = node.moves();
    legalMoves.sort(() => (Math.random() -0.5));
    let bestMove = legalMoves[0];
    if (depth === 0 || legalMoves.length === 0) {
        return [null, evalPosition(node)];
    }
    if (maxPlayer) {
        // console.log(maxPlayer);
        // console.log(node.turn());
        value = Number.MIN_SAFE_INTEGER;
        for (let move of legalMoves) {
            let childNode = new Chess(node.fen());
            childNode.move(move);
            let res = alphaBeta1(childNode, depth - 1, alpha, beta, false);
            let calcedValue = res[1];
            if (calcedValue > value) {
                value = calcedValue;
                bestMove = move;
            }
            
            alpha = Math.max(value, alpha);
            if (beta <= alpha) {
                break;
            }
            
        }
        return [bestMove, value];
    }
    else {
        value = Number.MAX_SAFE_INTEGER;
        for (let move of legalMoves) {
            let childNode = new Chess(node.fen());
            childNode.move(move);
            let res = alphaBeta1(childNode, depth - 1, alpha, beta, true);
            let calcedValue = res[1];
            if (calcedValue < value) {
                value = calcedValue;
                bestMove = move;
            }
            
            beta = Math.min(value, beta);
            if (beta <= alpha) {
                break;
            }
            
        }
        return [bestMove, value];
    }
    
}

function evalPosition(chessGame) {
    let brd = chessGame.board()
    let score = 0;

    for(let row = 0; row < 8; row++) {
        for (let sq = 0; sq <8; sq++) {
            let i = brd[row][sq]
            //if piece on square
            if(i) {
                switch (i.color) {
                    case 'w':
                        //neg
                        score -= pieceValues[i.type]
                        break
                    case 'b':
                        //pos                       
                        //want to promote
                        if (i.type === 'p') {
                            let rank = parseInt(i.square[1]);
                            
                            switch (rank) {
                                case 8:
                                    break;
                                case 7:
                                    break;
                                case 6:
                                    score += 0.1;
                                    break;
                                case 5:
                                    score += 0.2;
                                    break;
                                case 4:
                                    score += 0.4;
                                    break;
                                case 3:
                                    score += 0.8;
                                    break;
                                case 2:
                                    score += 2;
                                    break;
                                case 1:
                                    score += 100;
                                    break;
                                default:
                                    console.log("NEVER");
                            }
                            
                        }

                        score += pieceValues[i.type];
                        break
                }
            }
        }
    }
    

    return score;


}



function makeBestABMove1() {
    let depth = 3;
    let legalMoves = game.moves();
    legalMoves.sort(() => (Math.random() -0.5));
    console.log(legalMoves)
    
    // game over
    if (legalMoves.length === 0) return

    let res = alphaBeta1(game, depth, Math.MIN_SAFE_INTEGER, Math.MAX_SAFE_INTEGER, true);

    
    console.log(res);
    game.move(res[0]);
    board.position(game.fen())

    
}


function loadRook() {
    currPosition = sixPawnRook;
    restartGame();
}

function loadBishop() {
    currPosition = bishopFourPawns;
    restartGame();
}

function loadKnight() {
    currPosition = knightFourPawns;
    restartGame();
}

$(document).ready(function() {
    $("#btnRook").click(function() {
        loadRook();
    });
    $("#btnBishop").click(function() {
        loadBishop();
    });
    $("#btnKnight").click(function() {
        loadKnight();
    });

});


board = Chessboard('myBoard', config);
