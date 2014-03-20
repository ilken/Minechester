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

            /*PLAYER PART*/      
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

            var hexBestTime = localSettings.values["hex"];
            var hexGamesPlayed = localSettings.values["hexGamesPlayed"] || 0;
            var hexGamesWon = localSettings.values["hexGamesWon"] || 0;
            var hexGamesLost = localSettings.values["hexGamesLost"] || 0;

            $("#hexBestTime").text(hexBestTime);
            $("#hexGamesPlayed").text(hexGamesPlayed);
            $("#hexWin").text(hexGamesWon);
            $("#hexLose").text(hexGamesLost);

            var multiAIBestTime = localSettings.values["AI"];
            var multiAIGamesPlayed = localSettings.values["AIGamesPlayed"] || 0;
            var multiAIGamesWon = localSettings.values["p1AIGamesWon"] || 0;
            var multiAIGamesLost = localSettings.values["p2AIGamesWon"] || 0;

            $("#multiBestTime").text(multiAIBestTime);
            $("#multiGamesPlayed").text(multiAIGamesPlayed);
            $("#multiWin").text(multiAIGamesWon);
            $("#multiLose").text(multiAIGamesLost);

            /*AI PART*/
            var AIeasyBestTime = localSettings.values["AIEasy"];
            var AIeasyGamesPlayed = localSettings.values["AIEasyGamesPlayed"] || 0;
            var AIeasyGamesWon = localSettings.values["AIEasyGamesWon"] || 0;
            var AIeasyGamesLost = localSettings.values["AIEasyGamesLost"] || 0;

            $("#AIEasyBestTime").text(AIeasyBestTime);
            $("#AIEasyGamesPlayed").text(AIeasyGamesPlayed);
            $("#AIEasyWin").text(AIeasyGamesWon);
            $("#AIEasyLose").text(AIeasyGamesLost);

            var AImediumBestTime = localSettings.values["AIMedium"];
            var AImediumGamesPlayed = localSettings.values["AIMediumGamesPlayed"] || 0;
            var AImediumGamesWon = localSettings.values["AIMediumGamesWon"] || 0;
            var AImediumGamesLost = localSettings.values["AIMediumGamesLost"] || 0;

            $("#AIMediumBestTime").text(AImediumBestTime);
            $("#AIMediumGamesPlayed").text(AImediumGamesPlayed);
            $("#AIMediumWin").text(AImediumGamesWon);
            $("#AIMediumLose").text(AImediumGamesLost);

            var AIproBestTime = localSettings.values["AIPro"];
            var AIproGamesPlayed = localSettings.values["AIProGamesPlayed"] || 0;
            var AIproGamesWon = localSettings.values["AIProGamesWon"] || 0;
            var AIproGamesLost = localSettings.values["AIProGamesLost"] || 0;

            $("#AIProBestTime").text(AIproBestTime);
            $("#AIProGamesPlayed").text(AIproGamesPlayed);
            $("#AIProWin").text(AIproGamesWon);
            $("#AIProLose").text(AIproGamesLost);

            //localSettings.values.clear();
        }
    });
})();
