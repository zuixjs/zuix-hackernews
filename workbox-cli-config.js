module.exports = {
    "globDirectory": "./",
    "globPatterns": [
        "node_modules/zuix-dist/js/zuix.min.js",
        "node_modules/zuix-dist/js/zuix.min.js.map",
        "img/*.{sample,xml,iml,js,css,html,png,json,md}",
        "js/*.{sample,xml,iml,js,css,html,png,json,md}",
        "app.bundle.js",
        "index.html"
    ],
    "swDest": "service-worker.js",
    "globIgnores": [
        "workbox-cli-config.js"
    ]
};
