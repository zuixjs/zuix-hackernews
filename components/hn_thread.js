zuix.controller(function (cp) {
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

});
