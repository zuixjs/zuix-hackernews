zuix.bundle([{"componentId":"components\u002Fhn_list","view":"\u003Cdiv self=\"size-x1\" layout=\"column center-center\" class=\"list\"\u003E\n\n    \u003C!-- Example of loading a component from a remote hosting site.\n         The *list_view* component is loaded from ZUIX site.\n         When bundling the app all remote components will be\n         crunched into the `app.bundle.js` file and will then\n         be loaded from memory. --\u003E\n\n    \u003Cdiv data-ui-load=\"https:\u002F\u002Fgenielabs.github.io\u002Fzuix\u002Fui\u002Fcontrols\u002Flist_view\"\n         data-ui-field=\"list-view\"\n         self=\"size-large\"\u003E\n\n        Loading news list...\n\n    \u003C\u002Fdiv\u003E\n\n\u003C\u002Fdiv\u003E\n","css":".list \u003E div {\n    padding-right: 16px;\n}","controller":function (cp) {
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

}},{"componentId":"https:\u002F\u002Fgenielabs.github.io\u002Fzuix\u002Fui\u002Fcontrols\u002Flist_view","controller":function (cp) {

    // Set the list items' creation method either to be
    // using HTML elements with data-ui-load attribute (htmlMode = true)
    // or by using zuix.createComponent(..) (htmlMode = false)
    var htmlMode = true;

    // Set list type: [ 'full', 'paged', 'incremental' ] (default: 'full')
    var MODE_FULL = 'full', MODE_PAGED = 'paged', MODE_INCREMENTAL = 'incremental';
    var listMode = MODE_FULL;

    // How many items per page to show/add (for 'paged' and 'incremental' modes) (default: 30)
    var itemsPerPage = 30;

    // Structure used to store component state info
    var statusInfo = {
        page: {
            current: 0,
            count: 0
        },
        items: {
            loaded: 0,
            count: 0
        }
    };

    // Objects data persistence
    var listItems = [];
    var itemOptions;

    cp.init = function () {
        cp.options().html = false;
        cp.options().css = false;
        // custom component options
    };

    // TODO: describe the model and options used by this component
    cp.create = function () {
        // exposed methods through this component context
        cp.expose('config', configure);
        cp.expose('page', setPage);
        cp.expose('status', getStatus);
        cp.expose('more', function () {
            statusInfo.page.current++;
            cp.update();
        });
        cp.expose('clear', clear);
        // init
        clear();
    };

    cp.destroy = function () {
        clear();
    };

    cp.update = function() {

        var modelList = cp.model().itemList;
        if (modelList == null) return;

        statusInfo.page.count = pageCount();
        statusInfo.items.count = modelList.length;

        var startItem = statusInfo.page.current*itemsPerPage;

        for (var i = 0; i < modelList.length; i++) {

            var dataItem = cp.model().getItem(i, modelList[i]);
            var id = dataItem.itemId;

            if ((listMode === MODE_FULL) ||
                (listMode === MODE_PAGED && i >= startItem && i < startItem+itemsPerPage) ||
                (listMode === MODE_INCREMENTAL && i < startItem+itemsPerPage)) {
                if (typeof listItems[id] === 'undefined') {
                    var container;
                    if (htmlMode) {
                        // This is the 'htmlMode' approach for creating the
                        // list_view components. This methods is way faster than
                        // `zuix.createComponent` since it just creates a `div` container.
                        // Using this approach we have to wait for the 'component:ready'
                        // event before obtaining a reference to the component context.
                        container = document.createElement('div');
                        // Set the component to load for this item
                        //container.innerHTML = '<div class="spinner"><div></div><div></div><div></div><div></div></div>';
                        container.setAttribute('data-ui-load', dataItem.componentId);
                        container.setAttribute('data-ui-options', setItemOptions(i, dataItem.options));
                        // TODO: the next line is a work around, otherwise element won't load - not sure if this is a bug
                        dataItem.options.lazyLoad = false;
                    } else {
                        // This other method is a bit slower since the `createComponent`
                        // method involves other extra checks.
                        // The main advantage is that we can obtain a reference to the
                        // component context before it is created. For very long lists,
                        // always prefer using the `htmlMode` approach.
                        container = zuix.createComponent(dataItem.componentId, dataItem.options).container();
                    }
                    // use a responsive CSS class if provided
                    if (dataItem.options.className != null) {
                        // this class should set the min-height property
                        container.classList.add(dataItem.options.className);
                    } else {
                        // set a temporary height for the container (for lazy load to work properly)
                        container.style['min-height'] = dataItem.options.height || '48px';
                    }
                    // add item container to the list-view, the component will be lazy-loaded later as needed
                    cp.view().insert(i, container);
                    // register a callback to know when the component is actually loaded
                    var listener = function (itemIndex, el) {
                        var l = function () {
                            el.removeEventListener('component:ready', l);
                            // trigger status update event
                            statusInfo.items.loaded++;
                            cp.trigger('status', statusInfo);
                            // if all components have been loaded, then trigger 'complete' event
                            if (itemIndex === modelList.length - 1)
                                cp.trigger('complete');
                        };
                        container.addEventListener('component:ready', l);
                    }(i, container);
                    // keep track of already allocated items
                    listItems[id] = container;
                } else if (!dataItem.options.static) {
                    // update existing item model's data
                    // TODO: should check if the data in the model has changed before calling this
                    // TODO: should also call the `model` method in the `zuix.context` callback
                    zuix.context(listItems[id]).model(dataItem.options.model);
                }
            }

            if (typeof listItems[id] !== 'undefined') {
                if ((listMode === MODE_PAGED && i < statusInfo.page.current * itemsPerPage) || (listMode !== MODE_FULL && i > ((statusInfo.page.current + 1) * itemsPerPage - 1)))
                    listItems[id].style.display = 'none';
                else
                    listItems[id].style.display = '';
            }

        }

        // trigger status update event
        cp.trigger('status', statusInfo);

        // `componentize` is required to process lazy-loaded items
        zuix.componentize(cp.view());

    };

    function setPage(number) {
        if (!isNaN(number) && number >= 0 && number < pageCount()) {
            statusInfo.page.current = parseInt(number);
            cp.update();
        }
        return statusInfo.page.current;
    }

    function getStatus() {
        return statusInfo;
    }

    function pageCount() {
        return Math.ceil(cp.model().itemList.length / itemsPerPage);
    }

    function setItemOptions(i, options){
        itemOptions['opt_'+i] = options;
        return 'list_view_opts.'+cp.context.contextId.replace(/-/g, '_')+'.opt_'+i;
    }

    function configure(options) {
        if (options.itemsPerPage != null)
            itemsPerPage = options.itemsPerPage;
        if (options.listMode != null)
            listMode = options.listMode;
        if (options.htmlMode != null)
            htmlMode = options.htmlMode;
    }

    function clear() {
        // TODO: find a better solution for storing data globally (eg. add method zuix.store(....) - localStorage)
        // globally store list view item options
        window.list_view_opts = window.list_view_opts || {};
        itemOptions = window.list_view_opts[cp.context.contextId.replace(/-/g, '_')] = {};
        // dispose components
        for (var i = 0; i < listItems.length; i++) {
            zuix.unload(listItems[i]);
        }
        listItems.length = 0;
        statusInfo.page.current = 0;
        statusInfo.page.count = 0;
        statusInfo.items.loaded = 0;
        statusInfo.items.count = 0;
        // clear the view
        cp.view().html('');
    }
}},{"componentId":"components\u002Fhn_list\u002Fstory_item","view":"\u003Cdiv class=\"number\" data-ui-field=\"number\"\u003E\u003C\u002Fdiv\u003E\n\u003Cdiv data-ui-field=\"card\" class=\"content\"\u003E\n    \u003Ch3\u003E\n        \u003Ca data-ui-field=\"title\" class=\"single-line\"\u003ELoading...\u003C\u002Fa\u003E\n    \u003C\u002Fh3\u003E\n    \u003Ca data-ui-field=\"url\" class=\"single-line\"\u003E\u003C\u002Fa\u003E\n    \u003Cdiv data-ui-field=\"description\" class=\"single-line\"\u003E\n        \u003Cspan data-ui-field=\"date\"\u003E...\u003C\u002Fspan\u003E\n        by \u003Cspan data-ui-field=\"user\"\u003E...\u003C\u002Fspan\u003E\n        \u002F \u003Cspan data-ui-field=\"score\"\u003E...\u003C\u002Fspan\u003E points\n        \u003Ca data-ui-field=\"descendants\"\u003E\u003C\u002Fa\u003E\n    \u003C\u002Fdiv\u003E\n\u003C\u002Fdiv\u003E\n","css":". {\n    border-bottom: solid 1px whitesmoke;\n    overflow: hidden;\n    position: relative;\n}\n\nh3 {\n    margin: 0;\n    font-weight: 600;\n}\nh3 \u003E a {\n    color: black;\n}\na {\n    text-decoration: none;\n}\n.number {\n    position: absolute;\n    margin: 0;\n    padding: 8px 0 0;\n    width: 48px;\n    text-align: center;\n    color: #3b5998;\n    font-size: 120%;\n    font-weight: bold;\n    animation-duration: 0.8s;\n    -webkit-animation-duration: 0.8s;\n    -moz-animation-duration: 0.8s;\n    -o-animation-duration: 0.8s;\n}\n.content {\n    padding-top: 8px;\n    padding-left: 48px;\n    animation-duration: 0.3s;\n    -webkit-animation-duration: 0.3s;\n    -moz-animation-duration: 0.3s;\n    -o-animation-duration: 0.3s;\n}\n.active {\n    background-color: rgba(100, 100, 100, 0.1);\n}","controller":function (cp) {
    'use strict';

    cp.create = function () {
        var item = cp.model();
        // Display item number
        cp.field('number').html(item.index+1);
        firebase.loadItem(item.id, render);
    };

    cp.destroy = function () {
        cp.log.i('Element disposed... G\'bye!');
    };

    function render(item) {
        if (item.dead || item.deleted) {
            // This is a delete message, so there's nothing to show,
            // we just unload/remove the component
            zuix.unload(cp.context);
            return;
        }
        cp.field('title').html(item.title);
        cp.field('user').html(item.by);
        cp.field('score').html(item.score);
        if (item.descendants > 0) {
            cp.field('descendants').html(' / '+item.comments);
            cp.field('descendants').attr('href', '#/comments/'+item.id);
        }
        cp.field('date').html(item.timestamp);
        if (item.url != null) {
            cp.field('url').html(item.shorturl)
                .attr('href', item.url);
            cp.field('title')
                .attr('href', item.url);
        } else {
            cp.field('title').attr('href', '#/comments/'+item.id);
        }
        // Custom Events for this component
        var card = cp.field('card');
        var payload = {
            view: card,
            data: item
        };
        card.on('mouseover', 'item:enter', payload)
            .on('mouseout', 'item:leave', payload);
    }

},"css_applied":true},{"componentId":"components\u002Fhn_thread","view":"\u003Cdiv self=\"size-x1\" layout=\"column center-center\"\u003E\n\n    \u003Cdiv class=\"main-header\" self=\"size-xlarge top-center\"\u003E\n        \u003Ch1\u003E\u003Ca data-ui-field=\"title\"\u003EThread title...\u003C\u002Fa\u003E\u003C\u002Fh1\u003E\n        \u003Ca data-ui-field=\"url\" class=\"single-line\"\u003E\u003C\u002Fa\u003E\n        \u003Ch3\u003E\n            \u003Cspan data-ui-field=\"date\"\u003E...\u003C\u002Fspan\u003E\n            by \u003Cspan data-ui-field=\"user\"\u003E...\u003C\u002Fspan\u003E\n            \u002F \u003Cspan data-ui-field=\"score\"\u003E...\u003C\u002Fspan\u003E points\n        \u003C\u002Fh3\u003E\n        \u003Cp data-ui-field=\"body\"\u003E\u003C\u002Fp\u003E\n        \u003Ca data-ui-field=\"reply\"\u003E&#8631; Reply\u003C\u002Fa\u003E\n    \u003C\u002Fdiv\u003E\n\n    \u003Cdiv data-ui-field=\"thread\"\n         layout=\"column top-stretch\"\n         self=\"size-xlarge top-center\"\u003E\n    \u003C\u002Fdiv\u003E\n\n    \u003Cdiv data-ui-field=\"loading\"\n         self=\"size-xlarge center-center\"\n         align=\"center\"\u003E\n        \u003Ch1 class=\"animated bounce infinite\"\u003E... loading ...\u003C\u002Fh1\u003E\n    \u003C\u002Fdiv\u003E\n\n\u003C\u002Fdiv\u003E\n","css":".main-header h1 {\n    margin-top: 8px;\n    margin-bottom: 0;\n}\n.main-header h3 {\n    margin-top: 8px;\n    margin-bottom: 8px;\n}\n\na[data-ui-field=\"reply\"] {\n    color: dodgerblue;\n    cursor: pointer;\n    font-weight: bold;\n    margin-right: 2px;\n    text-decoration: none;\n    text-transform: uppercase;\n}\n\na[data-ui-field=\"title\"] {\n    color: black;\n    text-decoration: none;\n}\n\n.main-header {\n    padding: 16px;\n    margin-bottom: 8px;\n}\n\ndiv[data-ui-field=\"thread\"] {\n   overflow-x: hidden;\n}\ndiv[data-ui-field=\"thread\"] \u003E div \u003E div.message {\n    padding-bottom: 16px;\n    border-bottom: dotted 2px rgba(0,0,0,0.3);\n}\n\nspan[data-ui-field=\"count\"] {\n    margin-left: 24px;\n}","controller":function (cp) {
    'use strict';

    cp.create = function () {
        cp.expose('load', function(id, callback) {
            firebase.loadItem(id, function (itemData) {
                render(itemData);
                callback(itemData);
            });
        });
    };

    cp.destroy = function () {
        clear();
    };

    function render(item) {
        cp.view().get().scrollTop = 0;
        // Load data from `item` to the view's fields.
        // This could also be done automatically
        // by calling `cp.model(item)` method
        // and take advantage of model-to-field mapping,
        // but we prefer more control over it in this case.
        cp.field('title').html(item.title);
        if (item.url != null) {
            cp.field('title').attr('href', item.url);
            cp.field('url').html(item.shorturl)
                .attr('href', item.url);
        }
        cp.field('user').html(item.by);
        cp.field('score').html(item.score);
        cp.field('date').html(item.timestamp);
        if (item.text != null)
            cp.field('body').html(item.text);
        else
            cp.field('body').html('');
        cp.field('reply').attr('href', 'https://news.ycombinator.com/reply?id='+item.id);
        cp.field('thread').hide();
        cp.field('loading').show();
        // since disposing of previous list may block the UI,
        // we delay its call to allow the loading message to be shown first
        setTimeout(function () {
            clear();
            // list thread's messages
            zuix.$.each(item.kids, function (k, v) {

                // create the message component
                var message = zuix.createComponent('components/hn_message', {
                    lazyLoad: true,
                    // the `ready` callback
                    ready: function (ctx) {
                        // once the component is ready and visible we call its
                        // `load` method to actually load the message data from firebase
                        ctx.load(v);
                    }
                });
                // give a min-height to the message container
                // for better lazy-loading performance
                message.container().style['min-height'] = '48px';
                // append the message component container to the list
                // at this point the component is not yet loaded
                // it will be only loaded if the container comes
                // into the user's screen view, then the `ready`
                // callback registered above will be called
                cp.field('thread').append(message.container());

            });
            // after appending all messages containers we show the list's div
            // so that zuix.componentize(...) can start lazy-loading components
            cp.field('loading').hide();
            cp.field('thread').show();
            zuix.componentize(cp.field('thread'));
        }, 100);
    }

    function clear() {
        // clear the list by disposing all message components
        var messages = cp.field('thread').children();
        for(var i = messages.length()-1; i >= 0; i--)
            zuix.unload(messages.get(i));
    }

}},{"componentId":"components\u002Fhn_message","view":"\u003Cdiv class=\"message\"\u003E\n\n    \u003Cdiv class=\"header\"\u003E\n        \u003Cspan class=\"from\" data-ui-field=\"by\"\u003E\u003C\u002Fspan\u003E\n        \u003Cspan data-ui-field=\"time\"\u003E\u003C\u002Fspan\u003E\n    \u003C\u002Fdiv\u003E\n\n    \u003Cp data-ui-field=\"body\"\u003E\n\n        Loading message...\n\n    \u003C\u002Fp\u003E\n\n    \u003Cdiv class=\"toolbar\"\u003E\n        \u003Ca data-ui-field=\"replies-toggle\"\u003E\u003Ci class=\"arrow-close\"\u003E\u003C\u002Fi\u003E\u003C\u002Fa\u003E\n        \u003Cspan data-ui-field=\"replies-count\"\u003E\u003C\u002Fspan\u003E\n        \u003Ca data-ui-field=\"reply\"\u003E&#8631; Reply\u003C\u002Fa\u003E\n    \u003C\u002Fdiv\u003E\n\n    \u003Cdiv data-ui-field=\"replies\" class=\"replies\"\u003E\u003C\u002Fdiv\u003E\n\n    \u003Cdiv data-ui-field=\"bottom-bar\" class=\"toolbar\"\u003E\n        \u003Ca data-ui-field=\"replies-top\"\u003E\u003Ci class=\"arrow-top\"\u003E\u003C\u002Fi\u003E\u003C\u002Fa\u003E\n    \u003C\u002Fdiv\u003E\n\n\u003C\u002Fdiv\u003E\n","css":".header {\n    font-size: 110%;\n    margin-bottom: 8px;\n}\n\n.from {\n    font-weight: bold;\n    margin-right: 10px;\n}\n\n.replies {\n    border-left: dotted 1px rgba(0,0,0,0.2);\n}\n\n.toolbar {\n    font-size: 90%;\n    font-weight: bold;\n    text-transform: uppercase;\n    padding: 8px;\n    margin-left: -12px;\n}\n.toolbar span {\n    margin-right: 12px;\n}\n.toolbar a {\n    color: dodgerblue;\n    cursor: pointer;\n    margin-right: 2px;\n    text-decoration: none;\n}\n\n.arrow-open:after {\n    content: '\\21e9 \\ Hide';\n    font-style: normal;\n}\n\n.arrow-close:after {\n    content: '\\279c \\ Show';\n    font-style: normal;\n}\n\n.arrow-top:after {\n    content: '\\21e7 \\ Top';\n    font-style: normal;\n}\n\npre {\n    font-size: 95%;\n    white-space: pre-wrap;       \u002F* Since CSS 2.1 *\u002F\n    white-space: -moz-pre-wrap;  \u002F* Mozilla, since 1999 *\u002F\n    white-space: -pre-wrap;      \u002F* Opera 4-6 *\u002F\n    white-space: -o-pre-wrap;    \u002F* Opera 7 *\u002F\n    word-wrap: break-word;       \u002F* Internet Explorer 5.5+ *\u002F\n}\n","controller":function (cp) {
    'use strict';

    cp.create = function () {
        cp.expose('load', function(id) {
            firebase.loadItem(id, render);
        });
    };

    cp.destroy = function () {
        clear();
    };

    function render(item) {
        if (item.dead || item.deleted) {
            // This is a delete message, so there's nothing to show,
            // we just unload/remove the component
            zuix.unload(cp.context);
            return;
        }
        // Load data from `item` to the view's fields.
        // This could also be done automatically
        // by calling `cp.model(item)` method
        // and take advantage of model-to-field mapping,
        // but we prefer more control over it in this case.
        cp.field('time').html(item.timestamp);
        cp.field('by').html(item.by);
        cp.field('body').html(item.text);
        cp.field('reply').attr('href', 'https://news.ycombinator.com/reply?id='+item.id);
        cp.field('replies').hide();
        cp.field('bottom-bar').hide();
        // Message thread replies
        if (item.kids != null) {
            // Collapse / Expand message thread
            cp.field('replies-toggle').show('inline').on('click', function () {
                this.removeClass('animated flash');
                if (cp.field('replies').display()==='none')
                    openThread();
                else
                    closeThread();
            });
            // Handle button for moving to top of message thread
            cp.field('replies-top').on('click', function () {
                var scroller = this.parent('.scrollable');
                zuix.$.scrollTo(scroller.get(), -(cp.field('replies').get().offsetHeight-16), 300);
            });
            var countText = (item.kids.length > 1 ? 'replies' : 'reply');
            cp.field('replies-count').html(item.kids.length + ' ' + countText);
        } else {
            cp.field('replies-toggle').hide();
        }
        // Create components for direct replies of this message.
        // We are using this same component for child message.
        // So this is some sort of components loading recursion.
        // The recursion will only be engaged after the message
        // comes into the user's screen's view (lazy-loading).
        zuix.$.each(item.kids, function (k, v) {
            var message = zuix.createComponent('components/hn_message', {
                lazyLoad: true,
                ready: function (ctx) {
                    ctx.load(v);
                }
            });
            message.container().style['min-height'] = '48px';
            cp.field('replies').append(message.container());
        });
        zuix.componentize(cp.field('replies'));
    }

    function clear() {
        // clear the list by disposing all message components
        var messages = cp.field('replies').children();
        for(var i = messages.length()-1; i >= 0; i--)
            zuix.unload(messages.get(i));
    }

    function openThread() {
        cp.field('replies-toggle').find('i')
            .removeClass('arrow-close')
            .addClass('arrow-open');
        cp.field('replies').show();
        cp.field('bottom-bar').show();
        cp.field('replies-collapse').show('inline');
        // we call `zuix.componentize(..)` after making the replies' div
        // visible so that replies' components get actually loaded
        zuix.componentize(cp.field('replies'));
    }

    function closeThread() {
        cp.field('replies-toggle').find('i')
            .removeClass('arrow-open')
            .addClass('arrow-close');
        cp.field('replies').hide();
        cp.field('bottom-bar').hide();
        cp.field('replies-collapse').hide();
    }

},"css_applied":true}]);