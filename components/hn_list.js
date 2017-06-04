zuix.controller(function (cp) {
    'use strict';

    var listView;
    var sourceId;
    var currentPage = 0;
    var updateCallback;

    cp.create = function () {

        sourceId = cp.view().attr('data-ui-field');
        // get a reference to the list_view component once it is loaded (async)
        zuix.context(cp.field('list-view'), function(ctx){
            listView = ctx;
            // listen and route the listView 'status' event
            listView.on('status', function (e, status) {
                if (updateCallback != null)
                    updateCallback(status);
            });
            // set items per page (from component attribute or 20 by default)
            var ipp = cp.view().attr('data-ui-items');
            if (ipp == null) ipp = 20;
            listView.config({
                listMode: 'paged',
                itemsPerPage: parseInt(ipp)
            });
            // fetch the list data by invoking Hacker News FireBase API
            loadList(sourceId+'stories');
        });

        // Methods exposed by hn_list component

        // <hn_list_ctx>.source()
        // returns the data source name (eg. new, top, job)
        cp.expose('source', function () {
            return sourceId;
        });

        // <hn_list_ctx>.page([<p>])
        // gets or sets the current listView page
        cp.expose('page', function (p) {
            if (!isNaN(p)) {
                cp.view().get().scrollTop = 0;
                currentPage = p;
            }
            if (listView != null)
                currentPage = listView.page(currentPage);
            return currentPage;
        });

        // <hn_list_ctx>.callback(<callback_fn>)
        // register a <callback_fn> that will get called
        // each time a new item is loaded or page is changed
        cp.expose('callback', function (callback) {
            updateCallback = callback;
        });

    };

    cp.destroy = function () {
        if (listView != null)
            listView.clear();
        cp.log.i('Element disposed... G\'bye!');
    };

    function loadList(sourceId) {
        listView.clear();
        firebase.loadList(sourceId, function (listData) {
            listView.model({
                itemList: listData,
                getItem: function (index, item) {
                    return {
                        // Unique identifier for this item.
                        itemId: index,
                        // Display item using "hn_list/story_item" component.
                        componentId: 'components/hn_list/story_item',
                        // Component options.
                        options: {
                            // Set the item model's data.
                            model: { index: index, id: item },
                            // Do not check for model refresh since
                            // it does not change once created.
                            static: true,
                            // Load the component only when
                            // it's about to come into view
                            lazyLoad: true,
                            // The min-height of the item container
                            // should be specified before its component
                            // is loaded in order to prevent list resize
                            // flickering after lazy-loading an item.
                            // So we either define a responsive 'className'
                            // or a fixed 'height' property.
                            className: 'list-item',
                            // Event handlers.
                            on: {
                                'item:enter': function (e, item) {
                                    item.view.addClass('active');
                                },
                                'item:leave': function (e, item) {
                                    item.view.removeClass('active');
                                }
                            },
                            ready: function () {
                                // TODO: ...
                            }
                        }
                    }
                }
            });
            // go to current page
            if (currentPage >= 0)
                currentPage = listView.page(currentPage);
        });
    }

});
