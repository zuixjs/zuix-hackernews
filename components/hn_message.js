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
        if (item.dead || item.deleted) {
            console.log("DELETED", cp.context);
            zuix.unload(cp.context);
            return;
        }
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

    function openThread() {
        cp.field('replies-toggle').find('i')
            .removeClass('arrow-close')
            .addClass('arrow-open');
        cp.field('replies').show();
        cp.field('bottom-bar').show();
        cp.field('replies-collapse').show('inline');
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

});
