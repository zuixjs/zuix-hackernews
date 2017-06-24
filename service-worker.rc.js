// Hacker News API caching
workboxSW.router.registerRoute(
    'https://hacker-news.firebaseio.com/v0/item/(.*)',
    workboxSW.strategies.cacheFirst({
        cacheName: 'stories',
        cacheExpiration: {
            maxEntries: 500,
            maxAgeSeconds: 120 // 2 minutes
        },
        cacheableResponse: {statuses: [0, 200]}
    })
);
// Images caching
workboxSW.router.registerRoute(
    '/img/(.*)',
    workboxSW.strategies.cacheFirst({
        cacheName: 'images',
        cacheExpiration: {
            maxEntries: 30
        },
        cacheableResponse: {statuses: [0, 200]}
    })
);
