/*
 || Hacker News Web - ZUIX implementation
 || Framework official site and documentation:
 ||     https://genielabs.github.io/zuix
 ||     http://zuix.it
 */

var app = new (function() {
    'use strict';

    // ---------- includes -------------

    /**
     * The advantage of loading resources with `using` is that these can
     * then be crunched into a single *app.bundle.js* file by using
     * the *zuix-bundler*.
     * Another advantage is that applying this method inside a component
     * can make the component reusable across applications without worrying
     * about dependencies it might requires because it will be loaded
     * on-demand by the *zuix.using* method.
     */
    // Main App CSS
    zuix.using('style', 'css/app.css');
    // Animate CSS and Flex Layout Attribute
    //zuix.using('style', 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.5.2/animate.min.css');
    zuix.using('style', 'css/animate.min.css'); // (<-- this is a minimal build)
    zuix.using('style', 'css/flex-layout-attribute.min.css');
    // Google 'Scope One' Fonts
    //zuix.using('style', 'https://fonts.googleapis.com/css?family=Scope+One');

    // ---------- initialization stuff -------------

    var currentFeed = null;
    var footerVisible = false;

    // Comment the following line to enable zuix debug output to console
    window.zuixNoConsoleOutput = true;

    // Setup service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('./service-worker.js')
            .then(function() { console.log('ServiceWorker', 'Registered'); });
    }

    // Set options for the `hn_list` component (HN-ListView). These are
    // referenced through the `data-ui-options` attribute of the DIV container
    window.hnListOptions = {
        ready: function (hnList) {
            // Register the status callback, called each time the list is updated
            hnList.callback(function (statusInfo) {
                // update counter/status info in the footer
                zuix.field('load-count').html(statusInfo.items.loaded+' of '+statusInfo.items.count);
                zuix.field('page-count').html((statusInfo.page.current+1)+' / '+statusInfo.page.count);
            });
            // Attach the Scroll Helper controller to the HN-ListView component
            // This is an example of loading multiple controllers on the same component
            zuix.load('https://genielabs.github.io/zuix/ui/controls/scroll_helper', {
                view: hnList.view(),
                on: {
                    'scrollHelper': function (e, p) {
                        switch (p) {
                            case 'moving':
                                hideFooter();
                                break;
                            case 'hitTop':
                                showFooter();
                                break;
                            case 'hitBottom':
                                showFooter();
                                break;
                        }
                    }
                }
            });
        }
    };

    // Register event handler for URL routing
    if ('onhashchange' in window) {
        // custom url routing
        window.onhashchange = function () {
            showCurrentView(parseUrlPath(window.location.hash));
        };
    }
    // Force componentize on resize to process lazy-elements that might come into the view
    window.addEventListener('resize', function () {
        zuix.componentize();
    });

    // Hide the about dialog at startup
    zuix.field('about').on('click', function(){
        this.hide();
    }).on('keydown', function () {
        this.hide();
    }).hide();
    // Show footer when FAB is clicked
    zuix.$.find('.page-button').on('click', function () {
        showFooter();
    }).hide();

    // Set lazy loading mode (load components ahead by 150% of screen)
    zuix.lazyLoad(true, 1.5);

    // App startup complete: hide splash and show the main screen
    showCurrentView();
    zuix.field('app-splash').hide();
    zuix.field('app-screen').css('display', '');


    // ---------- private function -------------


    // Parse URL hash in the form #/<page>/<args>
    function parseUrlPath(hash) {
        if (hash == null || hash.length < 3)
            hash = '#/top';
        // get page number parameter
        var args;
        var i= hash.lastIndexOf('/');
        if (i > 1) {
            args = hash.substring(i+1);
            hash = hash.substring(0, i);
        }
        hash = hash.substring(2);
        return { page: hash, args: args };
    }

    function showCurrentView(pr) {
        if (pr == null)
            pr = parseUrlPath(window.location.hash);
        // update top menu
        zuix.$.find('header .menu a').removeClass('is-active');
        zuix.$.find('header .menu a[href="#/'+pr.page+'"]').addClass('is-active');
        // hide all Hacker News lists
        zuix.$.find('.scrollable')
            .removeClass('tab-visible')
            .addClass('tab-hidden');

        if (pr.page === 'comments') {
            // show message thread header
            showMessageNav();
            // show comments thread
            var comments = zuix.field('comments')
                .removeClass('tab-hidden')
                .addClass('tab-visible');
            zuix.context(comments, function (ctx) {
                ctx.load(pr.args, function(item){
                    // TODO: update footer data
                    zuix.field('thread-count')
                        .html(item.comments);
                    zuix.field('thread-title')
                        .html(item.title);
                });
            });
            // run componentize to lazy-load elements
            zuix.componentize(comments);
        } else {
            // show feeds' list header
            showListNav();
            // show the selected hacker news feed
            var hn_current = zuix.field(pr.page)
                .removeClass('tab-hidden')
                .addClass('tab-visible');
            // store a reference to the current hn_list component
            zuix.context(hn_current, function (ctx) {
                currentFeed = ctx;
                ctx.page(parseInt(pr.args));
            });
            // run componentize to lazy-load elements
            zuix.componentize(hn_current);
        }
    }

    function showListNav() {
        // hide message thread header and show feed's list header
        zuix.field('header-nav').show();
        zuix.field('thread-info').hide();
        showFooter();
    }

    function showMessageNav() {
        // hide feeds' list header and show message thread header
        zuix.field('header-nav').hide();
        zuix.field('thread-info').show();
        // hide list paging footer
        hideFooter(); zuix.$.find('.page-button').hide();
    }

    function hideFooter () {
        if (!footerVisible) {
            footerVisible = true;
            zuix.$('footer').addClass('animated fadeOutDown');
            zuix.$.find('.page-button').show();
        }
    }

    function showFooter () {
        if (footerVisible) {
            footerVisible = false;
            zuix.$('footer').removeClass('animated fadeOutDown')
                .addClass('animated fadeInUp');
            zuix.$.find('.page-button').hide();
        }
    }


    // ---------- public interface -------------


    // App's public methods
    this.next = function () {
        location.href = '#/'+currentFeed.source()+'/'+(currentFeed.page()+1);
    };
    this.prev = function () {
        location.href = '#/'+currentFeed.source()+'/'+(currentFeed.page()-1);
    };
    this.about = function () {
        zuix.field('about').show().get().focus();
    };
    return this;

})();


// HN FireBase API small utility class with item caching
// TODO: this should be put in a separate file ?!?!? =)
window.firebase = new (function() {
    'use strict';

    // this class requires Moment.JS library
    zuix.using('script', 'node_modules/moment-mini/moment.min.js');

    function load(id, callback) {
        // Fetch item data from remote service
        zuix.$.ajax({
            url: 'https://hacker-news.firebaseio.com/v0/item/' + id + '.json',
            success: function (jsonText) {
                var item = JSON.parse(jsonText);
                item.time = moment.unix(item.time);
                item.timestamp = item.time.fromNow();
                if (item.url != null) {
                    var path = item.url.split('/');
                    if (path.length > 0) {
                        path = path[2].replace('www.', '') + (path[3] != null && path[3].length > 0 && path[3].length < 30 && path[3].indexOf('.') < 0 ? '/' + path[3] : '');
                    }
                    item.shorturl = path;
                }
                if (item.descendants > 0) {
                    item.comments = item.descendants + ' comment';
                    if (item.descendants > 1) item.comments += 's';
                }
                callback(item);
            }
        });
    }
    function list(sourceId, callback) {
        zuix.$.ajax({
            // Load item data using official Hacker News firebase API
            url: 'https://hacker-news.firebaseio.com/v0/' + sourceId + '.json',
            success: function (jsonText) {
                callback(JSON.parse(jsonText));
            }
        });
    }

    // public FireBase API class methods
    this.loadItem = load;
    this.loadList = list;
    return this;

})();
