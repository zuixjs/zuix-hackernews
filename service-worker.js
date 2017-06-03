var cacheName = 'zuix-hn-cache-v1';
var filesToCache = [
    './',
    './index.html',
    './js/app.js',
    './js/moment.min.js',
    './app.bundle.js',
    './css/app.css',
    './css/animate.min.css',
    './css/flex-layout-attribute.min.css'
];

self.addEventListener('install', function(e) {
    console.log('ServiceWorker', 'Install');
    e.waitUntil(
        caches.open(cacheName).then(function(cache) {
            console.log('ServiceWorker', 'Caching app shell');
            return cache.addAll(filesToCache);
        })
    );
});
self.addEventListener('activate', function(e) {
    console.log('ServiceWorker', 'Activate');
    e.waitUntil(
        caches.keys().then(function(keyList) {
            return Promise.all(keyList.map(function(key) {
                if (key !== cacheName) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});
self.addEventListener('fetch', function(event) {
    //console.log('ServiceWorker', 'Fetch: '+event.request.url);
    event.respondWith(
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request).catch(function(err) {
                    console.log('ServiceWorker', 'Fetch Error', err);
                    var status = {
                        status: 200,
                        statusText: "OK",
                        headers: {'Content-Type': 'text/plain'}
                    };
                    return new Response(JSON.stringify({
                        "by":"network",
                        "descendants":0,
                        "id":0,
                        "score":0,
                        "time":Math.round(new Date().getTime()/1000),
                        "title":"Network error",
                        "type":"story"
                    }), status);
                });
        })
    )
});