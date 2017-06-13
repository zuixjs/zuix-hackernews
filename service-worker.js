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
    "url": "/node_modules/zuix-dist/js/zuix.min.js",
    "revision": "3693065adfec25a93c5ff4adc587bf17"
  },
  {
    "url": "/js/app.js",
    "revision": "8a983a86a0a30b9e97c1a14223a30c52"
  },
  {
    "url": "/app.bundle.js",
    "revision": "a779797b353d9810d3b21c0714a1cb82"
  },
  {
    "url": "/index.html",
    "revision": "7a4cfbe842d33c00a731c57e871f5f3d"
  }
];

const workboxSW = new self.WorkboxSW();
workboxSW.precache(fileManifest);
importScripts('service-worker.rc.js');
