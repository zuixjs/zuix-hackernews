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
    "url": "./node_modules/zuix-dist/js/zuix.min.js",
    "revision": "a8af4bd5b2f79fc50fb884c28705da61"
  },
  {
    "url": "./node_modules/zuix-dist/js/zuix.min.js.map",
    "revision": "34cb0008eab42ec27e50efb018aec091"
  },
  {
    "url": "./img/android-chrome-144x144.png",
    "revision": "c878037e9100058800676eb5e350f26a"
  },
  {
    "url": "./img/android-chrome-192x192.png",
    "revision": "4ba2b7ea5f8cf255b6d1dda8be6ccdc9"
  },
  {
    "url": "./img/apple-touch-icon-120x120.png",
    "revision": "d81da58f45219409d0b08aa6e4ebc0e2"
  },
  {
    "url": "./img/apple-touch-icon-152x152.png",
    "revision": "155b2f9f75aea120bfa154e4108ca11f"
  },
  {
    "url": "./img/splashscreen-icon-384x384.png",
    "revision": "817f4d3e8fd26a9f2701bba041597d98"
  },
  {
    "url": "./img/splashscreen-icon-512x512.png",
    "revision": "2865338f10638bacad8eb0464ed2e548"
  },
  {
    "url": "./js/app.js",
    "revision": "ec878d403f42e6e4c83d8e300adb2c54"
  },
  {
    "url": "./app.bundle.js",
    "revision": "536e537db379594058eacc70f4263ce5"
  },
  {
    "url": "./index.html",
    "revision": "e83999e8f3e5b685becb827f8ae69311"
  }
];

const workboxSW = new self.WorkboxSW();
workboxSW.precache(fileManifest);
