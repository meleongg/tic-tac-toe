const singlePlayerBtn = document.getElementsByClassName("singleplayer")[0];
const twoPlayerBtn = document.getElementsByClassName("2-player")[0];

const submitBtns = Array.from(document.getElementsByClassName("submit-btn"));
const cancelBtns = Array.from(document.getElementsByClassName("cancel-btn"));

const singleForm = document.getElementsByClassName("single-player-form")[0];
const twoForm = document.getElementsByClassName("two-player-form")[0];

let gameMode;
let board = [["", "", ""], 
             ["", "", ""], 
             ["", "", ""]];

twoPlayerBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const twoPlayerFormContainer = document.getElementsByClassName("two-player-form-container")[0];
    twoPlayerFormContainer.style.display = "flex";
    gameMode = "two-player";
});

submitBtns.forEach((btn) => {
    const twoPlayerFormContainer = document.getElementsByClassName("two-player-form-container")[0];
    const gameModeSelection = document.getElementsByClassName("game-mode-selection")[0];
    const gameContainer = document.getElementsByClassName("game-container")[0];

    const getFormInfo = () => {
        if (gameMode === "single") {
            const pName = document.getElementsByClassName("player-name")
            return [pName.value];
        } else {
            const p1Name = document.getElementsByClassName("player-1-name")[0];
            const p2Name = document.getElementsByClassName("player-2-name")[0];
            let p1NameValue = p1Name.value;
            let p2NameValue = p2Name.value;
            if (p1NameValue === "") {
                p1NameValue = "Player 1";
            }
            if (p2NameValue === "") {
                p2NameValue = "Player 2";
            }
            return [p1NameValue, p2NameValue];
        }
    }

    btn.addEventListener("click", (e) => {
        e.preventDefault();
        if (gameMode === "single") {
            console.log("s") // -> validateInput()
        } else {
            twoPlayerFormContainer.style.display = "none";
            gameModeSelection.style.display = "none"; // -> validateInput() & render board
            gameContainer.style.display = "grid";
            displayController.renderBoard();
            formInfo = getFormInfo();
            gameBoard.startGame(formInfo);
        }
    });
});

cancelBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
        e.preventDefault();
        const twoPlayerFormContainer = document.getElementsByClassName("two-player-form-container")[0];
        twoPlayerFormContainer.style.display = "none";
        twoForm.reset();
    });
});

const playerFactory = (name, wins, symbol) => {

    return {name, wins, symbol}
};

const gameBoard = (() => {
    // functions to update the turn, etc.
    // checkWin, checkPlace
    let turn; 
    let _player;
    let _player1;
    let _player2;
    let _gameOver = false;

    const _initializePlayers = (vals) => {
        if (gameMode === "single") {
            player = playerFactory(vals[0], 0, "X");
        } else {
            _player1 = playerFactory(vals[0], 0, "X");
            _player2 = playerFactory(vals[1], 0, "O");
        }
    }

    const startGame = (vals) => {
        _initializePlayers(vals);
        if (gameMode === "single") {
            turn = _player;
        } else {
            turn = _player1;
        }
        displayController.renderTurn(turn);
    }

    const _checkEmpty = (index) => {
        let row = index[0];
        let col = index[1];
        let sqr = board[row][col];
        if (sqr === "") {
            return true;
        } else {
            return false;
        }
    }

     // check if any subarray of winningIndices is in indices array
    const _checkIndices = (indices) => {
        const winningIndices = [["00", "10", "20"], ["01", "11", "21"], ["02", "12", "22"],
                                ["00", "01", "02"], ["10", "11", "12"], ["20", "21", "22"],
                                ["20", "11", "02"], ["00", "11", "22"]];
        
        const checkMatch = (arr, target) => {
            return target.every(val => arr.includes(val));
        }

        for (let i=0; i<winningIndices.length; i++) {
            winningIndex = winningIndices[i];
            let match = checkMatch(indices, winningIndex);

            if (match) {
                return true;
            } 
        }

        return false;
    }

    const _checkTie = () => {
        for (let i=0; i<board.length; i++) {
            for (let j=0; j<board.length; j++) {
                if (board[i][j] === "") {
                    return false;
                } 
            }
        }

        return true;
    }

    const _checkWin = (sym) => {
        let indices = []; 

        for (let i=0; i<board.length; i++) {
            for (let j=0; j<board.length; j++) {
                if (board[i][j] === sym) {
                    indices.push(`${i}${j}`);
                }
            }
        }

        console.log(_checkIndices(indices))

        if (_checkIndices(indices)) {
            return true;
        } else {
            return false;
        }
    }

    const _switchTurn = () => {
        if (turn === _player1) {
            turn = _player2;
        } else {
            turn = _player1;
        }

        displayController.renderTurn(turn);
    }

    const updateBoard = (index) => {
        let row = index[0];
        let col = index[1];
        if (_checkEmpty(index) && !_gameOver) {
            board[row][col] = turn.symbol;
            if (_checkWin(turn.symbol)) {
                _gameOver = true;
                displayController.produceWinner(turn);
            } else if (_checkTie()) {
                _gameOver = true;
                displayController.produceWinner("tie");
            } else {
                _switchTurn();
            }
            displayController.renderBoard();
        } 
    }

    return { updateBoard, startGame };
})();

const displayController = (() => {
    const boardElm = document.getElementsByClassName("board")[0];
    const stateMsg = document.getElementsByClassName("state-message")[0];

    const produceWinner = (winner) => {
        if (typeof winner !== String) {
            stateMsg.innerHTML = `${winner.name} is the winner!`;
        } else {
            stateMsg.innerHTML = `No one wins! Tie game!`;
        }
    }

    // functions to update what is rendered on the screen
    const renderTurn = (turn) => {
        stateMsg.innerHTML = `It is ${turn.name}'s move!`;
    }

    const _detectClick = (sqr) => {
        sqr.addEventListener("click", () => {
            index = sqr.dataset.index;
            index = [Number(index[0]), Number(index[2])];
            gameBoard.updateBoard(index);
        });
    }

    const renderBoard = () => {
        boardElm.innerHTML = "";
        for (let i=0; i<board.length; i++) {
            for (let j=0; j<board.length; j++) {
                let square = document.createElement("div");
                square.classList.add("square");
                let squareText = document.createElement("p");
                squareText.classList.add("square-text");
                squareText.innerHTML = board[i][j];
                square.appendChild(squareText);
                boardElm.appendChild(square);
                _detectClick(square);
                square.dataset.index = `${[i]}-${[j]}`;
            }
        }
    }

    return { renderBoard, renderTurn, produceWinner };
})();