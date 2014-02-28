// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232509
(function () {
    "use strict";

    var appView = Windows.UI.ViewManagement.ApplicationView;
    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;
    var nav = WinJS.Navigation;
    var ui = WinJS.UI;

    //Variable Declarations
    var p1Score,p2Score,
        player1,player2,
        turn,
        winner;

    ui.Pages.define("/pages/challengeAI/challengeAI.html", {
        // Navigates to the groupHeaderPage. Called from the groupHeaders,
        // keyboard shortcut and iteminvoked.
        navigateToGroup: function (key) {
            nav.navigate("/pages/groupDetail/groupDetail.html", { groupKey: key });
        },

        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            $('#game').aiminesweeper();
            $(".mineCounter").text(99);

            p1Score = $("#p1Score").text(),
            p2Score = $("#p2Score").text(),
            player1 = "p1",
            player2 = "p2",
            turn = player1,
            winner = "";
        }

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
            mine = 99,
            mineCounter,
            difficulty = {
                'easy': { d: 10, m: 15 },
                'medium': { d: 12, m: 10 },
                'pro': { d: 16, m: 24 },
                'godlike': { d: 20, m: 99 }
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
            time = 0.00;
            timerElement.text(time);
        }

        function stopTimer() {
            window.clearInterval(timer);
        }

        /*MINE COUNTER FUNCTIONS*/
        function incrementMineCounter() {
            var mC = parseInt($(".mineCounter").text());
            mC += 1;
            $(".mineCounter").text(mC);
        }

        function decrementMineCounter() {
            var mC = parseInt($(".mineCounter").text());
            mC -= 1;
            if (mC < 0)
                $(".mineCounter").text(0);
            else
                $(".mineCounter").text(mC);
        }

        function resetMineCounter() {
            $(".mineCounter").text(99);
        }

        /*GAME MESSAGES*/
        function displayMessage(message) {
            // Create the message dialog and set its content
            Windows.UI.Popups.MessageDialog("Time: " + $(".timer").text() + "seconds", message).showAsync();
        }
        obj.start = function () {
            $("#p1Score").text(0);
            $("#p2Score").text(0);
            var difficultyLevel = difficulty["godlike"];

            // set game width
            gameElement.width((difficultyLevel.d * 50) + 2);

            // create board
            board = Board(gameElement.find('.AIBoard').empty(), difficultyLevel.d, difficultyLevel.m);
            board.draw();

            $(board)
                .one('win', function () {
                    obj.stop();
                    var finalP1Score = parseInt($("#p1Score").text()),
                        finalP2Score = parseInt($("#p2Score").text());
                    if (finalP1Score > finalP2Score)
                        winner = "Player 1 Win!";
                    else if (finalP2Score > finalP1Score)
                        winner = "Player 2 Win!";
                    else
                        winner = "Noob Draw";

                    window.setTimeout(function () { displayMessage(winner); }, 100);
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
            $('<span class="AISpan"/>').text(value).appendTo(element);
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
                    fieldElement = $('<div class="AIfield hidden revealed" id="'+i+'X'+j+'"/>').appendTo(element);

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

        function revealBoard() {
            for (var i = 0; i < dimension; i++)
                for (var j = 0; j < dimension; j++)
                    boardData[i][j].setRevealed(true);
        };

        function isGameOver() {
            var mC = parseInt($(".mineCounter").text()),
                hiddenCount = 0;

            for (var i = 0; i < dimension; i++)
                for (var j = 0; j < dimension; j++)
                    if (boardData[i][j].isRevealed || boardData[i][j].isFlagged)
                        hiddenCount++;

            if (hiddenCount == (dimension * dimension) && mC == 0)
                return true;
            return false;
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

            if (field.isMine && field.isRevealed){ return; }
            if (field.isMine && !field.isRevealed) {
                setScore(turn, -100);
                field.setRevealed(true);
                field.setFlagged(false);
                changeMineCounter();
                checkTriggerWin();
                switchTurn();
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

                if (field.isText) {
                    setScore(turn, field.mineCount * 100);
                    checkTriggerWin();
                }
                if (field.isEmpty) {
                    var area = traverseBoard(field),
                        score = 0;

                    for (var i = 0; i < area.length; i++) {
                        if (area[i].isEmpty || !area[i].isMine) {
                            if (area[i].isEmpty) {
                                score += 100;
                            }
                            else if (area[i].isText) {
                                score += (area[i].mineCount * 100);
                            }
                            obj.reveal(area[i], true);
                        }
                    }
                    setScore(turn, score);
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

                if (field.isFlagged) {
                    if (field.isMine) {
                        setScore(turn, 500);
                        checkTriggerWin();
                    }
                    else {
                        setScore(turn, -500);
                        field.setFlagged(!field.isFlagged);
                        switchTurn();
                        return 2;
                    }
                    return 1;
                }
                else
                    return 0;
            }
            return 2;
        };

        function checkTriggerWin() {
            if (isGameOver()) {
                $(obj).trigger('win');
                return;
            }
        }

        function animateScore(points) {
            if (points > 0)
                $("#" + turn + "PlusScore").css('color', 'orange');
            else
                $("#" + turn + "PlusScore").css('color', 'red');

            $("#" + turn + "PlusScore").animate({
                top: "-1px"
            }, 200);
            $("#" + turn + "PlusScore").animate({
                top: "0px"
            }, 200);
        }

        function setScore(player, points) {
            //Set Score
            var currentScore = parseInt($("#" + player + "Score").text()),
                newScore = currentScore + points;
            if (newScore < 0) newScore = 0;
            $("#" + player + "Score").text(newScore);

            //Set Plus Score
            if (turn == player1)
                $("#" + player2 + "PlusScore").text("");
            else
                $("#" + player1 + "PlusScore").text("");

            if (points > 0) {
                $("#" + player + "PlusScore").text("+" + points);
                $("#" + turn + "PlusScore").css('color', 'green');
            }
            else {
                $("#" + player + "PlusScore").text(points);
                $("#" + turn + "PlusScore").css('color', 'red');
            }
            animateScore(points);
        }

        function switchTurn() {
            if (turn == player1) {
                turn = player2;
                $("#player2").css('background-color', 'green');
                $("#player1").css('background-color', 'transparent');
                switchAlgorithm("StraightForward");
            }
            else {
                turn = player1;
                $("#player1").css('background-color', 'green');
                $("#player2").css('background-color', 'transparent');
            }

        }

        function changeMineCounter() {
            var mC = parseInt($(".mineCounter").text());
            mC -= 1;
            if (mC < 0)
                $(".mineCounter").text(0);
            else
                $(".mineCounter").text(mC);
        }

        function switchAlgorithm(algo) {
            switch (algo) {
                case "StraightForward":
                    straightForwardAlgorithm();
                    break;
                case "RandomGuess":
                    randomGuess();
                    break;
                default:

            }
        }

        function randomGuess() {
            do {
                var x = Math.floor((Math.random() * dimension));
                var y = Math.floor((Math.random() * dimension));
            } while (!boardData[x][y].isRevealed);

            obj.reveal(boardData[x][y]);
        }

        function straightForwardAlgorithm() {
            var isStraightForwardAlgoWorking = false;

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
            
            if (!isStraightForwardAlgoWorking)
                switchAlgorithm("RandomGuess");
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
                //for (var i = 0; i < _clickableArray.length; i++) {
                //    animateClick(_clickableArray[i],"number");
                //    isSafeBox = true;
                //}
                animateClick(_clickableArray[0], "number");
                isSafeBox = true;
            }
            else if (_clickableBoxes > 0 && (_revealedMines < mines) && (_clickableBoxes == (mines - _revealedMines))) {
                //for (var i = 0; i < _clickableArray.length; i++) {
                //    animateClick(_clickableArray[i],"flag");
                //    isSafeBox = true;
                //}
                animateClick(_clickableArray[0], "flag");
                isSafeBox = true;
            }
                
            return isSafeBox;
        }

        function animateClick(cell, type) {
            if (type == "flag")
                window.setTimeout(function () { obj.flag(cell) }, 100);
            else
                window.setTimeout(function () { obj.reveal(cell) }, 100);
        }

        // constructor
        (function init() {
            // expose fieldSelected event
            element
                .off('mousedown', '.AIfield')
                .on('mousedown', '.AIfield', function (e) {
                    $(obj).trigger('fieldSelected', [e, locateField($(this))]);
                });
        }());

        return obj;
    };

    var Solver = function (obj, boardData, dimension) {

        switchAlgorithm(STRAIGHT_FORWARD);



    };

    $.fn.aiminesweeper = function () {
        Game(this);

        return this;
    };
})();
