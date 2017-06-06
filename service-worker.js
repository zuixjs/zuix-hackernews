importScripts('workbox-sw.prod.v1.0.1.js');

/**
 * DO NOT EDIT THE FILE MANIFEST ENTRY
 *
 * The method precache() does the following:
 * 1. Cache URLs in the manifest to a local cache.
 * 2. When a network request is made for any of these URLs the response
 *    will ALWAYS comes from the cache, NEVER the network.
 * 3. When the service worker changes ONLY assets with a revision change are
 *    updated, old cache entries are left as is.
 *
 * By changing the file manifest manually, your users may end up not receiving
 * new versions of files because the revision hasn't changed.
 *
 * Please use workbox-build or some other tool / approach to generate the file
 * manifest which accounts for changes to local files and update the revision
 * accordingly.
 */
const fileManifest = [
  {
    "url": "/css/animate.min.css",
    "revision": "69a5232d75efb4ca2cb8fa0eb68f8c1a"
  },
  {
    "url": "/css/app.css",
    "revision": "bb17d7fd79a5fa34a2de4fd774d2599d"
  },
  {
    "url": "/css/flex-layout-attribute.min.css",
    "revision": "c55488315343d9afb4d13ebf9cc8f97b"
  },
  {
    "url": "/img/android-chrome-144x144.png",
    "revision": "14fd6e755642b3d0a95cf1fc39f8bda4"
  },
  {
    "url": "/img/android-chrome-192x192.png",
    "revision": "27672b194be4ac949d90e3f71381d0a5"
  },
  {
    "url": "/img/apple-touch-icon-120x120.png",
    "revision": "df472c5a362a7017ccb939a01508f6cb"
  },
  {
    "url": "/img/apple-touch-icon-152x152.png",
    "revision": "9258c097eaa2981d78b699c8fca21722"
  },
  {
    "url": "/img/splashscreen-icon-384x384.png",
    "revision": "b60a097bd7c608e1c59b66ee055885e6"
  },
  {
    "url": "/img/splashscreen-icon-512x512.png",
    "revision": "6e8071db09c4e72d5dd84662a82e8cd0"
  },
  {
    "url": "/js/app.js",
    "revision": "534fa810dbacdef231ea6d377c020c29"
  },
  {
    "url": "/js/moment.min.js",
    "revision": "aeb7908241d9f6d5a45e504cc4f2ec15"
  },
  {
    "url": "/node_modules/zuix-dist/js/zuix.min.js",
    "revision": "b40eb5ecbb59cc146cd2531690450ac8"
  },
  {
    "url": "/node_modules/zuix-dist/js/zuix.min.js.map",
    "revision": "414fe4d29587a9540dfb84e05eab7d73"
  },
  {
    "url": "/app.bundle.js",
    "revision": "f10a10a2659741257b2ccac04ce931ab"
  },
  {
    "url": "/index.html",
    "revision": "e45cb519e8e39288e348c628ace1b9e1"
  }
];

const workboxSW = new self.WorkboxSW();
workboxSW.precache(fileManifest);
