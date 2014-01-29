// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232509
(function () {
    "use strict";

    var appView = Windows.UI.ViewManagement.ApplicationView;
    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;
    var applicationData = Windows.Storage.ApplicationData;
    var nav = WinJS.Navigation;
    var ui = WinJS.UI;

    ui.Pages.define("/pages/highScores/highScores.html", {
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
            var easyBestTime = localSettings.values["easy"];
            var easyGamesPlayed = localSettings.values["easyGamesPlayed"] || 0;
            var easyGamesWon = localSettings.values["easyGamesWon"] || 0;
            var easyGamesLost = localSettings.values["easyGamesLost"] || 0;

            $("#easyBestTime").text(easyBestTime);
            $("#easyGamesPlayed").text(easyGamesPlayed);
            $("#easyWin").text(easyGamesWon);
            $("#easyLose").text(easyGamesLost);

            var mediumBestTime = localSettings.values["medium"];
            var mediumGamesPlayed = localSettings.values["mediumGamesPlayed"] || 0;
            var mediumGamesWon = localSettings.values["mediumGamesWon"] || 0;
            var mediumGamesLost = localSettings.values["mediumGamesLost"] || 0;

            $("#mediumBestTime").text(mediumBestTime);
            $("#mediumGamesPlayed").text(mediumGamesPlayed);
            $("#mediumWin").text(mediumGamesWon);
            $("#mediumLose").text(mediumGamesLost);

            var proBestTime = localSettings.values["pro"];
            var proGamesPlayed = localSettings.values["proGamesPlayed"] || 0;
            var proGamesWon = localSettings.values["proGamesWon"] || 0;
            var proGamesLost = localSettings.values["proGamesLost"] || 0;

            $("#proBestTime").text(proBestTime);
            $("#proGamesPlayed").text(proGamesPlayed);
            $("#proWin").text(proGamesWon);
            $("#proLose").text(proGamesLost);
        }
    });
})();
