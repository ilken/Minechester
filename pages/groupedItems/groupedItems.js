(function () {
    "use strict";

    var appView = Windows.UI.ViewManagement.ApplicationView;
    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;
    var nav = WinJS.Navigation;
    var ui = WinJS.UI;

    ui.Pages.define("/pages/groupedItems/groupedItems.html", {
        // Navigates to the groupHeaderPage. Called from the groupHeaders,
        // keyboard shortcut and iteminvoked.
        navigateToGroup: function (key) {
            nav.navigate("/pages/groupDetail/groupDetail.html", { groupKey: key });
        },

        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            var listView = element.querySelector(".groupeditemslist").winControl;
            listView.groupHeaderTemplate = element.querySelector(".headertemplate");
            listView.itemTemplate = element.querySelector(".itemtemplate");
            listView.oniteminvoked = this._itemInvoked.bind(this);

            // Set up a keyboard shortcut (ctrl + alt + g) to navigate to the
            // current group when not in snapped mode.
            listView.addEventListener("keydown", function (e) {
                if (appView.value !== appViewState.snapped && e.ctrlKey && e.keyCode === WinJS.Utilities.Key.g && e.altKey) {
                    var data = listView.itemDataSource.list.getAt(listView.currentItem.index);
                    this.navigateToGroup(data.group.key);
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }
            }.bind(this), true);

            this._initializeLayout(listView, appView.value);
            listView.element.focus();
        },

        // This function updates the page layout in response to viewState changes.
        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />

            var listView = element.querySelector(".groupeditemslist").winControl;
            if (lastViewState !== viewState) {
                if (lastViewState === appViewState.snapped || viewState === appViewState.snapped) {
                    var handler = function (e) {
                        listView.removeEventListener("contentanimating", handler, false);
                        e.preventDefault();
                    }
                    listView.addEventListener("contentanimating", handler, false);
                    this._initializeLayout(listView, viewState);
                }
            }
        },

        // This function updates the ListView with new layouts
        _initializeLayout: function (listView, viewState) {
            /// <param name="listView" value="WinJS.UI.ListView.prototype" />

            if (viewState === appViewState.snapped) {
                listView.itemDataSource = Data.groups.dataSource;
                listView.groupDataSource = null;
                listView.layout = new ui.ListLayout();
            } else {
                listView.itemDataSource = Data.items.dataSource;
                listView.groupDataSource = Data.groups.dataSource;
                listView.layout = new ui.GridLayout({ groupHeaderPosition: "top" });
            }
        },

        _itemInvoked: function (args) {
            if (appView.value === appViewState.snapped) {
                // If the page is snapped, the user invoked a group.
                var group = Data.groups.getAt(args.detail.itemIndex);
                this.navigateToGroup(group.key);
            } else {
                // If the page is not snapped, the user invoked an item.
                var item = Data.items.getAt(args.detail.itemIndex);
                if (Data.getGroupKey(item) == "group4") {
                    if(item.title == "Cyprus"){
                        Data.items.getAt(0).backgroundImage = "/images/Cyprus/Cyprus1.PNG";
                        Data.items.getAt(1).backgroundImage = "/images/Cyprus/Cyprus4.PNG";
                        Data.items.getAt(2).backgroundImage = "/images/Cyprus/Cyprus7.PNG";
                        Data.items.getAt(3).backgroundImage = "/images/Cyprus/Cyprus2.PNG";
                        Data.items.getAt(4).backgroundImage = "/images/Cyprus/Cyprus5.PNG";
                        Data.items.getAt(5).backgroundImage = "/images/Cyprus/Cyprus8.PNG";
                        Data.items.getAt(6).backgroundImage = "/images/Cyprus/Cyprus3.PNG";
                        Data.items.getAt(7).backgroundImage = "/images/Cyprus/Cyprus6.PNG";
                        Data.items.getAt(8).backgroundImage = "/images/Cyprus/Cyprus9.PNG";
                    }
                    else if (item.title == "University of Manchester") {
                        Data.items.getAt(0).backgroundImage = "/images/UOM/uni1.PNG";
                        Data.items.getAt(1).backgroundImage = "/images/UOM/uni4.PNG";
                        Data.items.getAt(2).backgroundImage = "/images/UOM/uni7.PNG";
                        Data.items.getAt(3).backgroundImage = "/images/UOM/uni2.PNG";
                        Data.items.getAt(4).backgroundImage = "/images/UOM/uni5.PNG";
                        Data.items.getAt(5).backgroundImage = "/images/UOM/uni8.PNG";
                        Data.items.getAt(6).backgroundImage = "/images/UOM/uni3.PNG";
                        Data.items.getAt(7).backgroundImage = "/images/UOM/uni6.PNG";
                        Data.items.getAt(8).backgroundImage = "/images/UOM/uni9.PNG";
                    }
                    else if (item.title == "London") {
                        Data.items.getAt(0).backgroundImage = "/images/London/London1.PNG";
                        Data.items.getAt(1).backgroundImage = "/images/London/London4.PNG";
                        Data.items.getAt(2).backgroundImage = "/images/London/London7.PNG";
                        Data.items.getAt(3).backgroundImage = "/images/London/London2.PNG";
                        Data.items.getAt(4).backgroundImage = "/images/London/London5.PNG";
                        Data.items.getAt(5).backgroundImage = "/images/London/London8.PNG";
                        Data.items.getAt(6).backgroundImage = "/images/London/London3.PNG";
                        Data.items.getAt(7).backgroundImage = "/images/London/London6.PNG";
                        Data.items.getAt(8).backgroundImage = "/images/London/London9.PNG";
                    }
                    nav.navigate("/pages/groupedItems/groupedItems.html", { item: Data.getItemReference(item) });
                }
                else
                    nav.navigate(Data.getItemUrl(item), { item: Data.getItemReference(item) });
            }
        }
    });
})();
