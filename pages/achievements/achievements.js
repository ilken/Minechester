// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232509
(function () {
    "use strict";

    var appView = Windows.UI.ViewManagement.ApplicationView;
    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;
    var applicationData = Windows.Storage.ApplicationData;
    var nav = WinJS.Navigation;
    var ui = WinJS.UI;

    ui.Pages.define("/pages/achievements/achievements.html", {
        // Navigates to the groupHeaderPage. Called from the groupHeaders,
        // keyboard shortcut and iteminvoked.
        navigateToGroup: function (key) {
            nav.navigate("/pages/groupDetail/groupDetail.html", { groupKey: key });
        },

        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            var localSettings = applicationData.current.localSettings;
            var localFolder = applicationData.current.localFolder;
            
            var winHundredHexagonalProgress = localSettings.values["hexGamesWon"] || 0;
            if (winHundredHexagonalProgress > 100) winHundredHexagonalProgress = 100;
            $("#winHundredHexagonalProgress").text(winHundredHexagonalProgress + "/100");

            var playHundredGamesProgress = localSettings.values["totalGamesPlayed"] || 0;
            if (playHundredGamesProgress > 100) playHundredGamesProgress = 100;
            $("#playHundredGamesProgress").text(playHundredGamesProgress + "/100");

            var win100EasyGames = localSettings.values["easyGamesWon"] || 0;
            if (win100EasyGames > 100) win100EasyGames = 100;
            $("#win100EasyGamesProgress").text(win100EasyGames + "/100");

            var win100MediumGames = localSettings.values["mediumGamesWon"] || 0;
            if (win100MediumGames > 100) win100MediumGames = 100;
            $("#win100MediumGamesProgress").text(win100MediumGames + "/100");

            var win100ProGames = localSettings.values["proGamesWon"] || 0;
            if (win100ProGames > 100) win100ProGames = 100;
            $("#win100ProGamesProgress").text(win100ProGames + "/100");

            var play100MultiplayerGames = localSettings.values["multiGamesWon"] || 0;
            if (play100MultiplayerGames > 100) play100MultiplayerGames = 100;
            $("#play100MultiplayerGamesProgress").text(play100MultiplayerGames + "/100");

            var beatAI10Times = localSettings.values["p1AIGamesWon"] || 0;
            if (beatAI10Times > 10) beatAI10Times = 10;
            $("#BeatAIProgress").text(beatAI10Times + "/10");

            var solver100Times = (localSettings.values["AIEasyGamesWon"] || 0) + (localSettings.values["AIMediumGamesWon"] || 0) + (localSettings.values["AIProGamesWon"] || 0);
            if (solver100Times > 100) solver100Times = 100;
            $("#flagHundredMinesProgress").text(solver100Times + "/100");
            
        }
    });
})();
