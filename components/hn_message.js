zuix.controller(function (cp) {
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
        cp.field('time').html(item.timestamp);
        cp.field('by').html(item.by);
        cp.field('body').html(item.text);
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
        var messages = cp.field('replies').children();
        for(var i = messages.length()-1; i >= 0; i--)
            zuix.unload(messages.get(i));
    }

});
