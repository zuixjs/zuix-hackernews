zuix.controller(function (cp) {
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
            console.log("DELETED", cp.context);
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

});
