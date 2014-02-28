(function () {
    "use strict";

    var list = new WinJS.Binding.List();
    var groupedItems = list.createGrouped(
        function groupKeySelector(item) { return item.group.key; },
        function groupDataSelector(item) { return item.group; }
    );

    // TODO: Replace the data with your real data.
    // You can add data from asynchronous sources whenever it becomes available.
    generateMinechesterData().forEach(function (item) {
        list.push(item);
    });

    WinJS.Namespace.define("Data", {
        items: groupedItems,
        groups: groupedItems.groups,
        getItemUrl: getItemUrl,
        getGroupKey: getGroupKey,
        getItemReference: getItemReference,
        getItemsFromGroup: getItemsFromGroup,
        resolveGroupReference: resolveGroupReference,
        resolveItemReference: resolveItemReference
    });

    function getGroupKey(item) {
        return item.group.key;
    }

    function getItemUrl(item) {
        return item.url;
    }

    // Get a reference for an item, using the group key and item title as a
    // unique reference to the item that can be easily serialized.
    function getItemReference(item) {
        return [item.group.key, item.title];
    }

    // This function returns a WinJS.Binding.List containing only the items
    // that belong to the provided group.
    function getItemsFromGroup(group) {
        return list.createFiltered(function (item) { return item.group.key === group.key; });
    }

    // Get the unique group corresponding to the provided group key.
    function resolveGroupReference(key) {
        for (var i = 0; i < groupedItems.groups.length; i++) {
            if (groupedItems.groups.getAt(i).key === key) {
                return groupedItems.groups.getAt(i);
            }
        }
    }

    // Get a unique item from the provided string array, which should contain a
    // group key and an item title.
    function resolveItemReference(reference) {
        for (var i = 0; i < groupedItems.length; i++) {
            var item = groupedItems.getAt(i);
            if (item.group.key === reference[0] && item.title === reference[1]) {
                return item;
            }
        }
    }
    
    // Returns an array of sample data that can be added to the application's
    // data list. 
    function generateMinechesterData() {
        var itemContent = "";
        var itemDescription = "";
        var groupDescription = "";

        // These three strings encode placeholder images. You will want to set the
        // backgroundImage property in your real data to be URLs to images.
        var darkGray = "/images/WideLogo.scale-100.png";
        var lightGray = "/images/WideLogo.scale-100.png";
        var mediumGray = "/images/WideLogo.scale-100.png";

        // Each of these sample groups must have a unique key to be displayed
        // separately.
        var uiGroups = [
            { key: "group1", title: "Classic", subtitle: "", backgroundImage: darkGray, description: groupDescription },
            { key: "group2", title: "Modern", subtitle: "", backgroundImage: lightGray, description: groupDescription },
            { key: "group3", title: "Extras", subtitle: "", backgroundImage: mediumGray, description: groupDescription },
            { key: "group4", title: "Themes", subtitle: "", backgroundImage: lightGray, description: groupDescription }
        ];

        // Each of these sample items should have a reference to a particular
        // group.
        var uiItems = [
            { group: uiGroups[0], title: "Easy", subtitle: "9x9", url: "/pages/easy/easy.html", description: itemDescription, content: itemContent, backgroundImage: "/images/easyLevel.png" },
            { group: uiGroups[0], title: "Medium", subtitle: "12x12", url: "/pages/medium/medium.html", description: itemDescription, content: itemContent, backgroundImage: "/images/mediumLevel.png" },
            { group: uiGroups[0], title: "Pro", subtitle: "20x20", url: "/pages/pro/pro.html", description: itemDescription, content: itemContent, backgroundImage: "/images/proLevel.png" },
            
            { group: uiGroups[1], title: "Multiplayer", subtitle: "", url: "/pages/multiplayer/multiplayer.html", description: itemDescription, content: itemContent, backgroundImage: "/images/multiplayer.png"},
            { group: uiGroups[1], title: "Challenge AI", subtitle: "", url: "/pages/challengeAI/challengeAI.html", description: itemDescription, content: itemContent, backgroundImage: "/images/challengeAI.PNG" },
            { group: uiGroups[1], title: "Hexagonal", subtitle: "", url: "/pages/hexagonal/hexagonal.html", description: itemDescription, content: itemContent, backgroundImage: "/images/hexagonal.png" },

            { group: uiGroups[2], title: "Tutorial", subtitle: "", url: "/pages/tutorial/tutorial.html", description: itemDescription, content: itemContent, backgroundImage: "/images/tutorial.PNG" },
            { group: uiGroups[2], title: "High Scores", subtitle: "", url: "/pages/highScores/highScores.html", description: itemDescription, content: itemContent, backgroundImage: "/images/highscores.PNG" },
            { group: uiGroups[2], title: "Achievements", subtitle: "", url: "/pages/achievements/achievements.html", description: itemDescription, content: itemContent, backgroundImage: "/images/achievement.PNG" },

            { group: uiGroups[3], title: "University of Manchester", subtitle: "", description: itemDescription, content: itemContent, backgroundImage: "/images/UOM/uni.png" },
            { group: uiGroups[3], title: "London", subtitle: "", description: itemDescription, content: itemContent, backgroundImage: "images/London/London.png" },
            { group: uiGroups[3], title: "Cyprus", subtitle: "", description: itemDescription, content: itemContent, backgroundImage: "/images/Cyprus/Cyprus.PNG" },
            { group: uiGroups[3], title: "Classic", subtitle: "", description: itemDescription, content: itemContent, backgroundImage: "images/classicTheme.png" }
        ];

        return uiItems;
    }
})();
