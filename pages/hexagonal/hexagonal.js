// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232509
(function () {
    "use strict";

    var appView = Windows.UI.ViewManagement.ApplicationView;
    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;
    var applicationData = Windows.Storage.ApplicationData;
    var nav = WinJS.Navigation;
    var ui = WinJS.UI;


    ui.Pages.define("/pages/hexagonal/hexagonal.html", {
        // Navigates to the groupHeaderPage. Called from the groupHeaders,
        // keyboard shortcut and iteminvoked.
        navigateToGroup: function (key) {
            nav.navigate("/pages/groupDetail/groupDetail.html", { groupKey: key });
        },

        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            $('#game').hexminesweeper();

            $(".mineCounter").text(40);

            $("#backButton").on('click', function () {
                nav.navigate("/pages/groupedItems/groupedItems.html");
            });
            $('.emptyPalette').on('click', function (event) {
                $('.emptyRevealed').closest('.hex').find('.top').css("border-bottom", "15px solid " + event.target.id);
                $('.emptyRevealed').css("background-color", event.target.id);
                $('.emptyRevealed').closest('.hex').find('.bottom').css("border-top", "15px solid " + event.target.id);
            });

            $('.numberPalette').on('click', function (event) {
                $('.middle').css("color", event.target.id);
            });

            $('.hiddenPalette').on('click', function (event) {
                $('.hidden').closest('.hex').find('.top').css("border-bottom", "15px solid " + event.target.id);
                $('.hidden').css("background-color", event.target.id);
                $('.hidden').closest('.hex').find('.bottom').css("border-top", "15px solid " + event.target.id);
            });
        }
    });

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
            Windows.UI.Popups.MessageDialog("Time: " + $(".timer").text() + " seconds", message).showAsync();
        }
        obj.start = function () {
            var difficultyLevel = difficulty["pro"];

            $(".mineCounter").text(difficultyLevel.m);

            // set game width
            gameElement.width((difficultyLevel.d * 50) + 2);

            // create board
            board = Board(gameElement.find('.hexBoard'), difficultyLevel.d, difficultyLevel.m);
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
                .on('fieldSelected', function (e, mouseDownEvent, field) {
                    obj.reveal(e, mouseDownEvent, field);
                });

            stopTimer();
            resetTimer();
            resetMineCounter();

            isActive = true;
        };

        obj.updateStatistics = function (result) {
            var localSettings = applicationData.current.localSettings;
            var localFolder = applicationData.current.localFolder;
            var gameTime = $(".timer").text();
            var totalGamesPlayed = localSettings.values["totalGamesPlayed"] || 0;
            localSettings.values["totalGamesPlayed"] = totalGamesPlayed + 1;

            var bestTime = localSettings.values["hex"];
            var gamesPlayed = localSettings.values["hexGamesPlayed"] || 0;
            var gamesWon = localSettings.values["hexGamesWon"] || 0;
            var gamesLost = localSettings.values["hexGamesLost"] || 0;

            if (result == "win") {
                if (!bestTime || (bestTime && (gameTime < bestTime))) {
                    localSettings.values["hex"] = gameTime;
                }
                localSettings.values["hexGamesWon"] = gamesWon + 1;
                localSettings.values["hexGamesLost"] = gamesLost;
            }
            else if (result == "lose") {
                localSettings.values["hexGamesWon"] = gamesWon;
                localSettings.values["hexGamesLost"] = gamesLost + 1;
            }
            localSettings.values["hexGamesPlayed"] = gamesPlayed + 1;
           
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

            gameElement.find('button.newGame').on('click', function () {
                var item = Data.items.getAt(5);
                nav.navigate("/pages/hexagonal/hexagonal.html", { item: Data.getItemReference(item) });
            });

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
        obj.mineCount = 0,
        obj.textValue = 0;

        obj.setFlagged = function (value) {
            var imageUrl = '/images/flag.png';
            $(element).find('.middle').toggleClass('flag', value);
            if (value) {
                $(element).find('.middle').css('background-image', 'url(' + imageUrl + ')');
                $(element).find('.middle').css('background', 'white');
            }
            else {
                $(element).find('.middle').css('background-image', 'none');
            }

            obj.isFlagged = value;
        };

        obj.setRevealed = function (value) {
            $(element).find('.middle').toggleClass('hidden', !value);
            $(element).find('.middle').removeClass('revealed');
            obj.isRevealed = value;

            if (obj.isText) {
                $(element).find('.top').css("border-bottom", "15px solid black");
                $(element).find('.middle').css("background-color", "black");
                $(element).find('.bottom').css("border-top", "15px solid black");
                $(element).find('.middle').text(obj.textValue);
                //$('<span class="numbers" />').text(obj.textValue).appendTo($(element).find('.middle'));
            }
            if (obj.isEmpty) {
                $(element).find('.middle').addClass('emptyRevealed');
                $(element).find('.middle').toggleClass('empty');
                $(element).find('.top').css("border-bottom", "15px solid purple");
                $(element).find('.middle').css("background-color", "purple");
                $(element).find('.bottom').css("border-top", "15px solid purple");
            }
            if (obj.isMine) {
                $(element).find('.middle').toggleClass('mine', value);
                $(element).find('.top').css("border-bottom", "15px solid red");
                $(element).find('.middle').css("background-color", "red");
                $(element).find('.bottom').css("border-top", "15px solid red");
            }
        };

        obj.setEmpty = function (value) {
            obj.isEmpty = value;
            obj.isText = false;
        };

        obj.setMine = function (value) {
            obj.isMine = value;
        };

        obj.setMineCount = function (value) {
            obj.mineCount = value;
            obj.setText(value);
        };

        obj.setText = function (value) {
            obj.isText = true;
            obj.textValue = value;
        };

        return obj;
    };

    var Board = function (element, dimension, mines) {
        var obj = {},
            boardData = [],
            field,
            row=17,
            column=17;

        function drawBoard() {
            var i, j, fieldElement;
            for (i = 0; i < row; i++) {
                boardData[i] = [];
                //if (i % 2 == 1) column = 16;
                //else column = 17;
                for (j = 0; j < column; j++) {
                    fieldElement = $('#'+i+'X'+j);

                    boardData[i][j] = Field(fieldElement, i, j);
                    fieldElement.data('location', { x: i, y: j });
                }
            }
        }

        function getRandomNumber(max) {
            return Math.floor((Math.random() * 1000) + 1) % max;
        }

        function plantMines() {
            var i, minesPlanted = 0, x, y;

            while (minesPlanted < mines) {
                x = getRandomNumber(row);
                y = getRandomNumber(column);

                if (!boardData[x][y].isMine) {
                    boardData[x][y].setMine(true);
                    minesPlanted++;
                }
            }
        }

        function calculateDistance() {
            var i, j;

            for (i = 0; i < row; i++)
                for (j = 0; j < column; j++) {
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

            if (fromField.x % 2 == 0) {
                // traverse up left
                if (fromField.y > 0 && fromField.x > 0) {
                    result.push(boardData[fromField.x - 1][fromField.y-1]);
                }

                // traverse up right
                if (fromField.x > 0 ) {
                    result.push(boardData[fromField.x - 1][fromField.y]);
                }

                // traverse left
                if (fromField.y > 0) {
                    result.push(boardData[fromField.x][fromField.y - 1]);
                }

                // traverse right
                if (fromField.y < column - 1) {
                    result.push(boardData[fromField.x][fromField.y + 1]);
                }

                // traverse lower left
                if (fromField.y > 0 && fromField.x < row - 1) {
                    result.push(boardData[fromField.x + 1][fromField.y - 1]);
                }

                // traverse lower right
                if (fromField.x < row - 1) {
                    result.push(boardData[fromField.x + 1][fromField.y]);
                }
            }
            else {
                // traverse up left
                if (fromField.x > 0) {
                    result.push(boardData[fromField.x - 1][fromField.y]);
                }

                // traverse up right
                if (fromField.x < row - 1 && fromField.y < column - 1) {
                    result.push(boardData[fromField.x - 1][fromField.y+1]);
                }

                // traverse left
                if (fromField.y > 0) {
                    result.push(boardData[fromField.x][fromField.y - 1]);
                }

                // traverse right
                if (fromField.y < column - 1) {
                    result.push(boardData[fromField.x][fromField.y + 1]);
                }

                // traverse lower left
                if (fromField.x < row-1) {
                    result.push(boardData[fromField.x + 1][fromField.y]);
                }

                // traverse lower right
                if (fromField.x < row - 1 && fromField.y < column - 1) {
                    result.push(boardData[fromField.x + 1][fromField.y + 1]);
                }
            }
            return $.grep(result, condition);
        }

        function revealBoard() {
            for (var i = 0; i < row; i++)
                for (var j = 0; j < column; j++)
                    boardData[i][j].setRevealed(true);
        };

        function isGameOver() {
            var hiddenCount = 0;

            for (var i = 0; i < row; i++)
                for (var j = 0; j < column; j++)
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

        // constructor
        (function init() {
            // expose fieldSelected event
            element
                .off('mousedown', '.hex')
                .on('mousedown', '.hex', function (e) {
                    $(obj).trigger('fieldSelected', [e, locateField($(this))]);
                });
        }());

        return obj;
    };

    $.fn.hexminesweeper = function () {
        Game(this);

        return this;
    };
})();
