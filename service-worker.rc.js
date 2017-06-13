// Hacker News API caching
workboxSW.router.registerRoute(
    'https://hacker-news.firebaseio.com/(.*)',
    workboxSW.strategies.cacheFirst({
        cacheName: 'stories',
        cacheExpiration: {
            maxEntries: 1000,
            maxAgeSeconds: 7 * 24 * 60 * 60
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
