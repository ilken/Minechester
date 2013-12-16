﻿// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232509
(function () {
    "use strict";

    //Variable Declarations
    var l,
        field,
        difficultyLevel,
        _mineCounter;

    $(document).ready(function () {
        $('#game').minesweeper();

        $('#navBar').click(function () {
            window.location.href = "/default.html";
        });

        $('#emptyPalette').on('change', function () {
            $('.emptyRevealed').css("background-color",this.value);
        });

        $('#numberPalette').on('change', function () {
            $('.field').css("color", this.value);
        });

        $('#hiddenPalette').on('change', function () {
            $('.hidden').css("background-color", this.value);
        });

        $('#revealedPalette').on('change', function () {
            $('.revealed').css("background-color", this.value);
        });
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
            mine = 5,
            mineCounter,
            difficulty = {
                'easy': { d: 10, m: 5 },
                'beginner': { d: 12, m: 10 },
                'intermediate': { d: 16, m: 24 },
                'advanced': { d: 20, m: 60 }
            };

        function enablePalette() {
            $('#numberPalette').prop('disabled', false);
            $('#emptyPalette').prop('disabled', false);
            $('#revealedPalette').prop('disabled', false);
        }

        function disablePalette() {
            $('#numberPalette').prop('disabled', true);
            $('#emptyPalette').prop('disabled', true);
            $('#revealedPalette').prop('disabled', true);
        }

        function enableCheatEngine() {
            $('.revealBox').prop('disabled', false);
            $('.flagMine').prop('disabled', false);
        }

        function disableCheatEngine() {
            $('.revealBox').prop('disabled', true);
            $('.flagMine').prop('disabled', true);
        }

        /*TIMER FUNCTIONS*/
        function startTimer() {
            stopTimer();
            enablePalette();
            enableCheatEngine();

            timer = window.setInterval(function () {
                time += 0.1;
                timerElement.text(time.toFixed(1));
            }, 100);

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
            mine = 5;
            mineCounter.text(mine);
        }

        /*GAME MESSAGES*/
        function displayMessage(message) {
            // Create the message dialog and set its content
            Windows.UI.Popups.MessageDialog(message, "Title").showAsync();
        }
        obj.start = function () {
            difficultyLevel = difficulty["easy"];

            // set game width
            gameElement.width((difficultyLevel.d * 42) + 2);

            // create board
            board = Board(gameElement.find('.board').empty(), difficultyLevel.d, difficultyLevel.m);
            board.draw();

            $(board)
                .one('win', function () {
                    obj.stop();
                    window.setTimeout(function () { displayMessage("You Win"); }, 100);
                })
                .one('gameover', function () {
                    obj.stop();
                    window.setTimeout(function () { displayMessage("Game Over"); }, 100);
                })
                .one('fieldSelected', startTimer) // start timer on first move
                .on('fieldSelected', obj.reveal);

            stopTimer();
            resetTimer();
            resetMineCounter();
            //disableCheatEngine();
            //disablePalette();

            isActive = true;
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
                _mineCounter = board.flag(field);
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
            boardData = [];

        function drawBoard() {
            var i, j, fieldElement;

            for (i = 0; i < dimension; i++) {
                boardData[i] = [];

                for (j = 0; j < dimension; j++) {
                    fieldElement = $('<div class="field hidden revealed" />').appendTo(element);

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
            l = fieldElement.data('location')
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
            Solver(obj,boardData, dimension);
        });

        // constructor
        (function init() {
            // expose fieldSelected event
            element
                .off('mousedown', '.field')
                .on('mousedown', '.field', function (e) {
                    $(obj).trigger('fieldSelected', [e, locateField($(this))]);
                });
        }());

        return obj;
    };

    var Solver = function (obj, boardData, dimension) {
        clearLogger();
        solverLogger("Running Solver Algorithm...");
        straightForwardAlgorithm();

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
                        if (!boardData[i][j].isRevealed /*&& !boardData[i][j].isFlagged*/) {
                            _clickableBoxes++;
                            _clickableArray.push(boardData[i][j]);
                        }
                        if (/*boardData[i][j].isRevealed && (boardData[i][j].isMine ||*/ boardData[i][j].isFlagged/*)*/) {
                            _revealedMines++;
                        }
                    }
                }
            }
            if (mines == _revealedMines && _clickableBoxes > 0) {
                for (var i = 0; i < _clickableArray.length; i++) {
                    obj.reveal(_clickableArray[i]);
                    isSafeBox = true;
                    solverLogger("Field:("+column+" | "+row+")");
                    solverLogger("Click:(" + _clickableArray[i].y + " | " + _clickableArray[i].x + ")");
                }
                solverLogger("-----------");
            }
            else if (_clickableBoxes > 0 && (_revealedMines < mines) && (_clickableBoxes == (mines - _revealedMines))) {
                solverLogger("Field:(" + column + " | " + row + ")");
                for (var i = 0; i < _clickableArray.length; i++) {
                    obj.flag(_clickableArray[i]);
                    isSafeBox = true;

                    solverLogger("Flag:(" + _clickableArray[i].y + " | " + _clickableArray[i].x + ")");
                }
                solverLogger("-----------");
            }
                
            return isSafeBox;
        }

        function straightForwardAlgorithm() {
            if (!isGameStarted()) {
                randomGuess();
            }

            for (var i = 0; i < dimension; i++) {
                var mines,safeBoxClicked;
                for (var j = 0; j < dimension; j++) {
                    if (boardData[i][j].isRevealed && boardData[i][j].isText) {
                        mines = boardData[i][j].mineCount;
                        //solverLogger(mines);
                        setTimeout(getSafeBox(i, j,mines),2000);
                    }
                }
            }
        };
    };

    $.fn.minesweeper = function () {
        Game(this);

        return this;
    };
})();
