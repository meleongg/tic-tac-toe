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

singlePlayerBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const singlePlayerFormContainer = document.getElementsByClassName("single-player-form-container")[0];
    singlePlayerFormContainer.style.display = "flex";
    gameMode = "single";
})

twoPlayerBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const twoPlayerFormContainer = document.getElementsByClassName("two-player-form-container")[0];
    twoPlayerFormContainer.style.display = "flex";
    gameMode = "two-player";
});

submitBtns.forEach((btn) => {
    const singlePlayerFormContainer = document.getElementsByClassName("single-player-form-container")[0];
    const twoPlayerFormContainer = document.getElementsByClassName("two-player-form-container")[0];
    const gameModeSelection = document.getElementsByClassName("game-mode-selection")[0];
    const gameContainer = document.getElementsByClassName("game-container")[0];

    const getFormInfo = () => {
        if (gameMode === "single") {
            const pName = document.getElementsByClassName("player-name")[0];
            let pNameValue = pName.value;
            if (pNameValue === "") {
                pNameValue = "Player";
            } 
            return [pNameValue];
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
            singlePlayerFormContainer.style.display = "none";
        } else {
            twoPlayerFormContainer.style.display = "none";
        }

        gameModeSelection.style.display = "none"; 
        gameContainer.style.display = "grid";
        displayController.renderBoard();
        formInfo = getFormInfo();
        gameBoard.startGame(formInfo);
    });
});

cancelBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
        e.preventDefault();
        const twoPlayerFormContainer = document.getElementsByClassName("two-player-form-container")[0];
        const singlePlayerFormContainer = document.getElementsByClassName("single-player-form-container")[0];
        twoPlayerFormContainer.style.display = "none";
        singlePlayerFormContainer.style.display = "none";
        twoForm.reset();
    });
});

// creates "Player" objects
const playerFactory = (name, wins, symbol) => {
    return {name, wins, symbol}
};

// stores all the functions that manipulate the gameboard array
const gameBoard = (() => {
    let turn; 
    let _player1;
    let _player2;
    let _gameOver = false;

    const _initializePlayers = (vals) => {
        if (gameMode === "single") {
            _player1 = playerFactory(vals[0], 0, "X");
            _player2 = playerFactory("Computer", 0, "O");
        } else {
            _player1 = playerFactory(vals[0], 0, "X");
            _player2 = playerFactory(vals[1], 0, "O");
        }
    }

    const startGame = (vals) => {
        _initializePlayers(vals);
        turn = _player1;
        displayController.renderScore([_player1, _player2]);
        displayController.renderTurn(turn);
    }

    const _checkEmpty = (index) => {
        let row = index[0];
        let col = index[1];
        console.log(row, col)
        let sqr = board[row][col];
        if (sqr === "") {
            return true;
        } 
        return false;
    }

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
        if (_checkIndices(indices)) {
            return true;
        } else {
            return false;
        }
    }

    const _chooseRandomSqr = () => {
        const row = Math.floor(Math.random() * 3);
        const col = Math.floor(Math.random() * 3);
        return [row, col];
    }

    const _makeChoice = () => {
        let choice = [];
        let choosing = true;
        while (choosing) {
            choice = _chooseRandomSqr();
            if (_checkEmpty(choice)) {
                return choice;
            }
        }
    }

    const _makeAIMove = () => {
        if (!_gameOver) {
            let sym = _player2.symbol;
            let randomSqr = _makeChoice();
            let row = randomSqr[0];
            let col = randomSqr[1];
            board[row][col] = sym;
            if (_checkWin(sym)) {
                _gameOver = true;
                displayController.updateStateMessage(_player2);
                _player2.wins += 1;
                displayController.renderScore([_player1, _player2]);
                displayController.renderButtons();
                _detectPlayAgain();
                _detectChangeMode();
            } else if (_checkTie()) {
                _gameOver = true;
                displayController.updateStateMessage("tie");
                displayController.renderButtons();
                _detectPlayAgain();
                _detectChangeMode();
            } else {
                _switchTurn();
            }
            displayController.renderBoard();
        }
    }

    const _switchTurn = () => {
        if (turn === _player1) {
            turn = _player2;
            if (gameMode === "single") {
                _makeAIMove();
            }
        } else {
            turn = _player1;
        }
        displayController.renderTurn(turn);
    }

    const _clearBoard = () => {
        for (let i=0; i<board.length; i++) {
            for (let j=0; j<board.length; j++) {
                board[i][j] = "";
            }
        }
    }

    const _updateTurn = () => {
        turn = _player1;
        displayController.renderTurn(turn);
    }

    const _detectPlayAgain = () => {
        const playAgainBtn = document.getElementsByClassName("play-again-btn")[0];
        playAgainBtn.addEventListener("click", () => {
            _updateTurn();
            _clearBoard();
            displayController.renderBoard();
            displayController.hideButtons();
            _gameOver = false;
        });
    }

    const _goToMenu = () => {
        const gameContainer = document.getElementsByClassName("game-container")[0];
        const gameModeSelection = document.getElementsByClassName("game-mode-selection")[0];
        gameContainer.style.display = "none";
        gameModeSelection.style.display = "grid";
        displayController.updateStateMessage("menu");
    }

    const _detectChangeMode = () => {
        const changeModeBtn = document.getElementsByClassName("change-mode-btn")[0];
        changeModeBtn.addEventListener("click", () => {
            _updateTurn();
            _clearBoard();
            _goToMenu();
            displayController.hideButtons();
            _gameOver = false;
        });
    }

    const updateBoard = (index) => {
        let row = index[0];
        let col = index[1];
        if (_checkEmpty(index) && !_gameOver) {
            console.log("worked")
            board[row][col] = turn.symbol;
            if (_checkWin(turn.symbol)) {
                _gameOver = true;
                displayController.updateStateMessage(turn);
                turn.wins += 1;
                displayController.renderScore([_player1, _player2]);
                displayController.renderButtons();
                _detectPlayAgain();
                _detectChangeMode();
            } else if (_checkTie()) {
                _gameOver = true;
                displayController.updateStateMessage("tie");
                displayController.renderButtons();
                _detectPlayAgain();
                _detectChangeMode();
            } else {
                _switchTurn();
            }
            displayController.renderBoard();
        } 
    }

    return {updateBoard, startGame};
})();

// functions to render HTML to screen
const displayController = (() => {
    const boardElm = document.getElementsByClassName("board")[0];
    const stateMsg = document.getElementsByClassName("state-message")[0];

    const updateStateMessage = (msg) => {
        if (typeof msg !== 'string') {
            stateMsg.innerHTML = `${msg.name} is the winner!`;
        } else if (msg === "tie") {
            stateMsg.innerHTML = `No one wins! Tie game!`;
        } else {
            stateMsg.innerHTML = `Choose Your Game Mode`;
        }
    }

    const renderTurn = (player) => {
        stateMsg.innerHTML = `It is ${player.name}'s move!`;
    }

    const _detectClick = (sqr) => {
        sqr.addEventListener("click", () => {
            index = sqr.dataset.index;
            index = [Number(index[0]), Number(index[2])];
            gameBoard.updateBoard(index);
        });
    }

    const _renderScoreHeaders = (players) => {
        const p1ScoreHeader = document.getElementsByClassName("p1-score-header")[0];
        const p2ScoreHeader = document.getElementsByClassName("p2-score-header")[0];

        p1ScoreHeader.innerHTML = `${players[0].name} Score`;
        p2ScoreHeader.innerHTML = `${players[1].name} Score`;
    }

    const renderScore = (players) => {
        const p1Score = document.getElementsByClassName("p1-score")[0];
        const p2Score = document.getElementsByClassName("p2-score")[0];
        _renderScoreHeaders(players);
        p1Score.innerHTML = players[0].wins;
        p2Score.innerHTML = players[1].wins;
    }

    const renderButtons = () => {
        const bottomBtns = document.getElementsByClassName("bottom-btns")[0];
        bottomBtns.style.display = "flex";
    }

    const hideButtons = () => {
        const bottomBtns = document.getElementsByClassName("bottom-btns")[0];
        bottomBtns.style.display = "none";
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

    return {renderBoard, renderTurn, updateStateMessage, renderScore, renderButtons, hideButtons};
})();