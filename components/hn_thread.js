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
        cp.field('title').html(item.title);
        if (item.url != null) {
            cp.field('title').attr('href', item.url);
            cp.field('url').html(item.shorturl)
                .attr('href', item.url);
        }
        cp.field('user').html(item.by);
        cp.field('score').html(item.score);
        cp.field('date').html(item.timestamp);
        cp.field('thread').hide();
        cp.field('loading').show();
        setTimeout(function () {
            clear();
            zuix.$.each(item.kids, function (k, v) {

                var message = zuix.createComponent('components/hn_message', {
                    lazyLoad: true,
                    ready: function (ctx) {
                        ctx.load(v);
                    }
                });
                message.container().style['min-height'] = '48px';
                cp.field('thread').append(message.container());

            });
            cp.field('loading').hide();
            cp.field('thread').show();
            zuix.componentize(cp.field('thread'));
        }, 100);
    }

    function clear() {
        var messages = cp.field('thread').children();
        for(var i = messages.length()-1; i >= 0; i--)
            zuix.unload(messages.get(i));
    }

});
