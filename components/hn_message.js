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

});
