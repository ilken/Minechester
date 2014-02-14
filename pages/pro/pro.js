// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232509
(function () {
    "use strict";

    var appView = Windows.UI.ViewManagement.ApplicationView;
    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;
    var applicationData = Windows.Storage.ApplicationData;
    var nav = WinJS.Navigation;
    var ui = WinJS.UI;
    var proAlgorithm;

    ui.Pages.define("/pages/pro/pro.html", {
        // Navigates to the groupHeaderPage. Called from the groupHeaders,
        // keyboard shortcut and iteminvoked.
        navigateToGroup: function (key) {
            nav.navigate("/pages/groupDetail/groupDetail.html", { groupKey: key });
        },

        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            $('#game').prominesweeper();

            proAlgorithm = false;

            $(".mineCounter").text(40);
            
            $('.emptyPalette').on('click', function (event) {
                $('.emptyRevealed').css("background-color", event.target.id);
            });

            $('.numberPalette').on('click', function (event) {
                $('.profield').css("color", event.target.id);
            });

            $('.hiddenPalette').on('click', function (event) {
                $('.hidden').css("background-color", event.target.id);
            });

            $('.revealedPalette').on('click', function (event) {
                $('.revealed').css("background-color", event.target.id);
            });
        },
    });

    //customizable initial screen
    //custom mines field
    //multiplayer important
    //hexagonal
    //2 mines cannot be close to each other
    //time limit
    var Game = function (gameElement) {
        var obj = {},
            isActive = false,
            board,
            time = 0,
            timer,
            timerElement,
            mine = 40,
            mineCounter,
            difficulty = {
                'easy': { d: 10, m: 5 },
                'medium': { d: 12, m: 20 },
                'pro': { d: 16, m: 40 },
                'godlike': { d: 10, m: 99 }
            };

        /*TIMER FUNCTIONS*/
        function startTimer() {
            stopTimer();

            timer = window.setInterval(function () {
                time += 0.01;
                timerElement.text(time.toFixed(2));
            }, 10);

            timerElement.text(time);
        }

        function resetTimer() {
            time = 0;
            timerElement.text(time);
        }

        function stopTimer() {
            window.clearInterval(timer);
        }

        /*MINE COUNTER FUNCTIONS*/
        function incrementMineCounter() {
            mine += 1;
            mineCounter.text(mine);
        }

        function decrementMineCounter() {
            mine -= 1;
            if (mine < 0)
                mineCounter.text(0);
            else
                mineCounter.text(mine);
        }

        function resetMineCounter() {
            mine = 40;
            mineCounter.text(mine);
        }

        /*GAME MESSAGES*/
        function displayMessage(message) {
            // Create the message dialog and set its content
            Windows.UI.Popups.MessageDialog("Time: " + $(".timer").text() + "seconds", message).showAsync();
        }
        obj.start = function () {
            proAlgorithm = false;
            var difficultyLevel = difficulty["pro"];

            $(".mineCounter").text(difficultyLevel.m);

            // set game width
            gameElement.width((difficultyLevel.d * 50) + 2);

            // create board
            board = Board(gameElement.find('.proBoard').empty(), difficultyLevel.d, difficultyLevel.m);
            board.draw();

            $(board)
                .one('win', function () {
                    obj.stop();
                    obj.updateStatistics("win");
                    window.setTimeout(function () { displayMessage("You Win"); }, 100);
                })
                .one('gameover', function () {
                    obj.stop();
                    obj.updateStatistics("lose");
                    window.setTimeout(function () { displayMessage("Game Over"); }, 100);
                })
                .one('fieldSelected', startTimer) // start timer on first move
                .on('fieldSelected', obj.reveal);

            stopTimer();
            resetTimer();
            resetMineCounter();

            isActive = true;
        };

        obj.updateStatistics = function (result) {
            var localSettings = applicationData.current.localSettings;
            var localFolder = applicationData.current.localFolder;
            var gameTime = $(".timer").text();
            
            /*HIGH SCORES*/
            if (!proAlgorithm) {
                var bestTime = localSettings.values["pro"];
                var gamesPlayed = localSettings.values["proGamesPlayed"] || 0;
                var gamesWon = localSettings.values["proGamesWon"] || 0;
                var gamesLost = localSettings.values["proGamesLost"] || 0;

                if (result == "win") {
                    if (!bestTime || (bestTime && (gameTime < bestTime))) {
                        localSettings.values["pro"] = gameTime;
                    }
                    localSettings.values["proGamesWon"] = gamesWon + 1;
                    localSettings.values["proGamesLost"] = gamesLost;
                }
                else if (result == "lose") {
                    localSettings.values["proGamesWon"] = gamesWon;
                    localSettings.values["proGamesLost"] = gamesLost + 1;
                }
                localSettings.values["proGamesPlayed"] = gamesPlayed + 1;
            }
            else {
                var bestTime = localSettings.values["AIPro"];
                var gamesPlayed = localSettings.values["AIProGamesPlayed"] || 0;
                var gamesWon = localSettings.values["AIProGamesWon"] || 0;
                var gamesLost = localSettings.values["AIProGamesLost"] || 0;

                if (result == "win") {
                    if (!bestTime || (bestTime && (gameTime < bestTime))) {
                        localSettings.values["AIPro"] = gameTime;
                    }
                    localSettings.values["AIProGamesWon"] = gamesWon + 1;
                    localSettings.values["AIProGamesLost"] = gamesLost;
                }
                else if (result == "lose") {
                    localSettings.values["AIProGamesWon"] = gamesWon;
                    localSettings.values["AIProGamesLost"] = gamesLost + 1;
                }
                localSettings.values["AIProGamesPlayed"] = gamesPlayed + 1;
            }

            /*ACHIEVEMENTS*/
            var totalGamesPlayed = localSettings.values["totalGamesPlayed"] || 0;
            localSettings.values["totalGamesPlayed"] = totalGamesPlayed + 1;


        };

        obj.stop = function () {
            stopTimer();
            isActive = false;
        };

        obj.reveal = function (e, mousedownEvent, field) {
            if (!isActive) { return; }

            if (mousedownEvent.which === 1) {
                board.reveal(field);
            }
            else {
                var _mineCounter = board.flag(field);
                if (_mineCounter == 1)
                    decrementMineCounter();
                else if (_mineCounter == 0)
                    incrementMineCounter();
            }
        };

        // constructor
        (function init() {
            timerElement = gameElement.find('.timer');

            mineCounter = gameElement.find('.mineCounter');

            gameElement.find('button.newGame').on('click', obj.start);

            gameElement.on('contextmenu', function () { return false; });

            obj.start();
        }());

        return obj;
    };

    var Field = function (element, x, y) {
        var obj = {};

        obj.isMine = false;
        obj.isRevealed = false;
        obj.isEmpty = false;
        obj.isFlagged = false;
        obj.isText = false;
        obj.x = x;
        obj.y = y;
        obj.mineCount = 0;

        obj.setFlagged = function (value) {
            element.toggleClass('flag', value);
            obj.isFlagged = value;
        };

        obj.setRevealed = function (value) {
            element.toggleClass('hidden', !value);
            element.removeClass('revealed');
            obj.isRevealed = value;

            if (obj.isText) {
                element.css("background-color", "black");
            }
            if (obj.isEmpty) {
                element.addClass('emptyRevealed');
            }
        };

        obj.setEmpty = function (value) {
            obj.isEmpty = value;
            obj.isText = false;
            element.toggleClass('empty');
        };

        obj.setMine = function (value) {
            obj.isMine = value;
            element.toggleClass('mine', value);
        };

        obj.setMineCount = function (value) {
            obj.mineCount = value;
            obj.setText(value);
        };

        obj.setText = function (value) {
            $('<span />').text(value).appendTo(element);
            obj.isText = true;
        };

        return obj;
    };

    var Board = function (element, dimension, mines) {
        var obj = {},
            boardData = [],
            field;

        function drawBoard() {
            var i, j, fieldElement;

            for (i = 0; i < dimension; i++) {
                boardData[i] = [];

                for (j = 0; j < dimension; j++) {
                    fieldElement = $('<div class="profield hidden revealed" id="' + i + 'X' + j + '"/>').appendTo(element);

                    boardData[i][j] = Field(fieldElement, i, j);

                    fieldElement.data('location', { x: i, y: j });
                }

                $('<div class="clear" />').appendTo(element);
            }
        }

        function getRandomNumber(max) {
            return Math.floor((Math.random() * 1000) + 1) % max;
        }

        function plantMines() {
            var i, minesPlanted = 0, x, y;

            while (minesPlanted < mines) {
                x = getRandomNumber(dimension);
                y = getRandomNumber(dimension);

                if (!boardData[x][y].isMine) {
                    boardData[x][y].setMine(true);
                    minesPlanted++;
                }
            }
        }

        function calculateDistance() {
            var i, j;

            for (i = 0; i < dimension; i++)
                for (j = 0; j < dimension; j++) {
                    field = boardData[i][j];

                    if (!field.isMine) {
                        var mines = traverseBoard(field, function (f) { return !!f.isMine; });

                        if (mines.length > 0) {
                            field.setMineCount(mines.length);
                        }
                        else {
                            field.setEmpty(true);
                        }
                    }
                }
        }

        function traverseBoard(fromField, condition) {
            var result = [];

            condition = condition || function () { return true; };

            // traverse up
            if (fromField.x > 0) {
                result.push(boardData[fromField.x - 1][fromField.y]);
            }

            // traverse down
            if (fromField.x < dimension - 1) {
                result.push(boardData[fromField.x + 1][fromField.y]);
            }

            // traverse left
            if (fromField.y > 0) {
                result.push(boardData[fromField.x][fromField.y - 1]);
            }

            // traverse right
            if (fromField.y < dimension - 1) {
                result.push(boardData[fromField.x][fromField.y + 1]);
            }

            // traverse upper left
            if (fromField.x > 0 && fromField.y > 0) {
                result.push(boardData[fromField.x - 1][fromField.y - 1]);
            }

            // traverse lower left
            if (fromField.x < dimension - 1 && fromField.y > 0) {
                result.push(boardData[fromField.x + 1][fromField.y - 1]);
            }

            // traverse upper right
            if (fromField.x > 0 && fromField.y < dimension - 1) {
                result.push(boardData[fromField.x - 1][fromField.y + 1]);
            }

            // traverse lower right
            if (fromField.x < dimension - 1 && fromField.y < dimension - 1) {
                result.push(boardData[fromField.x + 1][fromField.y + 1]);
            }

            return $.grep(result, condition);
        }

        $('.revealBox').click(function () {
            for (var i = 0; i < dimension; i++) {
                for (var j = 0; j < dimension; j++) {
                    if (boardData[i][j].isText && !boardData[i][j].isRevealed) {
                        boardData[i][j].setRevealed(true);

                        if (isGameOver()) {
                            $(obj).trigger('win');
                        }
                        return;
                    }
                }
            }
        });

        $('.flagMine').click(function () {
            for (var i = 0; i < dimension; i++) {
                for (var j = 0; j < dimension; j++) {
                    if (boardData[i][j].isMine && !boardData[i][j].isFlagged) {
                        boardData[i][j].setFlagged(true);
                        return;
                    }
                }
            }
        });

        function revealBoard() {
            for (var i = 0; i < dimension; i++)
                for (var j = 0; j < dimension; j++)
                    boardData[i][j].setRevealed(true);
        };

        function isGameOver() {
            var hiddenCount = 0;

            for (var i = 0; i < dimension; i++)
                for (var j = 0; j < dimension; j++)
                    if (!boardData[i][j].isRevealed) { hiddenCount++; }

            return hiddenCount === mines;
        };

        function locateField(fieldElement) {
            var l = fieldElement.data('location')
            return field = boardData[l.x][l.y];
        }

        obj.draw = function () {
            drawBoard();
            plantMines();
            calculateDistance();
        };

        obj.reveal = function (field, auto) {
            // do not reveal flagged and revealed fields in auto mode
            if (field.isFlagged || (auto && field.isRevealed)) { return; }

            if (field.isMine) {
                revealBoard();
                $(obj).trigger('gameover');
                return;
            }
            else if (field.isRevealed && !auto) {
                var flaggedMines = traverseBoard(field, function (f) { return f.isFlagged; });

                if (field.mineCount === flaggedMines.length) {
                    var hiddenFields = traverseBoard(field, function (f) { return !f.isRevealed && !f.isFlagged; });

                    for (var i = 0; i < hiddenFields.length; i++) {
                        obj.reveal(hiddenFields[i], true);
                    }
                }
            }
            else {
                field.setRevealed(true);
                field.setFlagged(false);

                if (field.isEmpty) {
                    var area = traverseBoard(field);

                    for (var i = 0; i < area.length; i++) {
                        if (area[i].isEmpty || !area[i].isMine) {
                            obj.reveal(area[i], true);
                        }
                    }
                }

                if (isGameOver()) {
                    $(obj).trigger('win');
                    return;
                }
            }
        };

        obj.flag = function (field) {
            if (!field.isRevealed) {
                field.setFlagged(!field.isFlagged);

                if (field.isFlagged)
                    return 1;
                else
                    return 0;
            }
            return 2;
        };

        //Solver
        $('.algorithm').click(function () {
            proAlgorithm = true;
            Solver(obj,boardData, dimension);
        });

        // constructor
        (function init() {
            // expose fieldSelected event
            element
                .off('mousedown', '.profield')
                .on('mousedown', '.profield', function (e) {
                    $(obj).trigger('fieldSelected', [e, locateField($(this))]);
                });
        }());

        return obj;
    };

    var Solver = function (obj, boardData, dimension) {
        var STRAIGHT_FORWARD = "StraightForward",
            MULTI_BOX = "MultiBox",
            BEST_GUESS = "BestGuess",
            END_GAME = "EndGame";

        clearLogger();
        solverLogger("Running Solver Algorithm...");      
        //Run
        switchAlgorithm(STRAIGHT_FORWARD);
        function clearLogger() {
            $('#algoText').val("");
        }
        function solverLogger(txt) {
            $('#algoText').append(txt + "\n");
        }

        function isGameStarted() {
            var rtn = false;
            for (var i = 0; i < dimension; i++) {
                for (var j = 0; j < dimension; j++) {
                    if (boardData[i][j].isRevealed) {
                        rtn = true;
                    }
                }
            }
            return rtn;
        }

        function randomGuess() {
            solverLogger("Making a random guess!");
            var x = Math.floor((Math.random() * dimension));
            var y = Math.floor((Math.random() * dimension));

            solverLogger("Random:(" + x + " | " + y + ")");
            obj.reveal(boardData[x][y]);
        }

        function getSafeBox(row, column,mines) {
            var _boxes=0,
                _clickableBoxes=0,
                _revealedMines=0,
                _clickableArray = [],
                isSafeBox = false;

            //Count number of boxes, clickable boxes and revealed mines
            for (var i = row - 1; i <= row + 1; i++){
                for(var j = column - 1; j <= column + 1; j++){
                    if ((i >= 0) && (i <= (dimension - 1)) && (j >= 0) && (j <= (dimension - 1))) {
                        _boxes++;
                        if (!boardData[i][j].isRevealed && !boardData[i][j].isFlagged) {
                            _clickableBoxes++;
                            _clickableArray.push(boardData[i][j]);
                        }
                        if (boardData[i][j].isFlagged) {
                            _revealedMines++;
                        }
                    }
                }
            }
            if (mines == _revealedMines && _clickableBoxes > 0) {
                for (var i = 0; i < _clickableArray.length; i++) {
                    animateClick(_clickableArray[i],"number");
                    isSafeBox = true;
                    //solverLogger("Field:(" + column+1 + " | " + row+1 + ")");
                    //solverLogger("Click:(" + _clickableArray[i].y+1 + " | " + _clickableArray[i].x+1 + ")");
                }
                //solverLogger("-----------");
            }
            else if (_clickableBoxes > 0 && (_revealedMines < mines) && (_clickableBoxes == (mines - _revealedMines))) {
                //solverLogger("Field:(" + column + " | " + row + ")");
                for (var i = 0; i < _clickableArray.length; i++) {
                    animateClick(_clickableArray[i],"flag");
                    isSafeBox = true;

                    //solverLogger("Flag:(" + _clickableArray[i].y+1 + " | " + _clickableArray[i].x+1 + ")");
                }
                //solverLogger("-----------");
            }
                
            return isSafeBox;
        }

        function solveMultiBox(row, column, mines) {
            var _boxes = 0,
                _clickableBoxes = 0,
                _revealedMines = 0,
                _clickableArray = [],
                isMultiBox = false;

            //Count number of boxes, clickable boxes and revealed mines
            for (var i = row - 1; i <= row + 1; i++) {
                for (var j = column - 1; j <= column + 1; j++) {
                    if ((i >= 0) && (i <= (dimension - 1)) && (j >= 0) && (j <= (dimension - 1))) {
                        _boxes++;
                        if (!boardData[i][j].isRevealed && boardData[i][j].isText) {
                            _clickableBoxes++;
                            _clickableArray.push(boardData[i][j]);
                            isMultiBox = true;
                        }
                    }
                }
            }
            if(_clickableBoxes > 0)
                animateClick(_clickableArray[0],"number");
            return isMultiBox;
        }

        function changeMineCounter() {
            var m = $(".mineCounter").text() - 1;
            if (m < 0)
                $(".mineCounter").text(0);
            else
                $(".mineCounter").text(m);
        }

        function animateClick(cell, type) {
            if (type == "flag") {
                obj.flag(cell);
                changeMineCounter();
            }
            else
                obj.reveal(cell);
        }
        /*ALGORITHMS*/
        function straightForwardAlgorithm() {
            solverLogger("Running Straight Forward Algorithm");
            var isStraightForwardAlgoWorking = false;
            if (!isGameStarted()) {
                randomGuess();
            }

            for (var i = 0; i < dimension; i++) {
                var mines;
                for (var j = 0; j < dimension; j++) {
                    if (boardData[i][j].isRevealed && boardData[i][j].isText) {
                        mines = boardData[i][j].mineCount;
                        if (getSafeBox(i, j, mines)) {
                            isStraightForwardAlgoWorking = true;
                        }
                    }
                }
            }
            
            if (isStraightForwardAlgoWorking)
                switchAlgorithm(STRAIGHT_FORWARD);
            else
                switchAlgorithm(MULTI_BOX);
        }

        function multiBoxAlgorithm() {
            solverLogger("Running Multi Box Algorithm");
            var isMultiBoxAlgoWorking = false;

            for (var i = 0; i < dimension; i++) {
                var mines;
                for (var j = 0; j < dimension; j++) {
                    if (boardData[i][j].isRevealed && boardData[i][j].isText) {
                        mines = boardData[i][j].mineCount;
                        if (solveMultiBox(i, j, mines)) {
                            isMultiBoxAlgoWorking = true;
                            i = j = dimension;
                        }
                    }
                }
            }
            
            if (isMultiBoxAlgoWorking)
                switchAlgorithm(STRAIGHT_FORWARD);
            else
                switchAlgorithm(BEST_GUESS);
        }
        
        function bestGuessAlgorithm() {
            solverLogger("Running Best Guess Algorithm");
        }

        function endGameAlgorithm() {
            solverLogger("Running End Game Algorithm");
        }
        /*ALGORITHMS END*/
        function switchAlgorithm(algo) {
            switch(algo){
                case STRAIGHT_FORWARD:
                    straightForwardAlgorithm();
                    break;
                case MULTI_BOX:
                    multiBoxAlgorithm();
                    break;
                case BEST_GUESS:
                    bestGuessAlgorithm();
                    break;
                case END_GAME:
                    endGameAlgorithm();
                    break;
            default:
              
            }
        }
    };

    $.fn.prominesweeper = function () {
        Game(this);

        return this;
    };
})();
