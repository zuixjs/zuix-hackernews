module.exports = {
    "globDirectory": "./",
    "globPatterns": [
        "css/*.{sample,xml,iml,js,css,html,png,json,md}",
        "img/*.{sample,xml,iml,js,css,html,png,json,md}",
        "js/*.{sample,xml,iml,js,css,html,png,json,md}",
        "node_modules/zuix-dist/js/zuix.min.js",
        "node_modules/zuix-dist/js/zuix.min.js.map",
        "app.bundle.js",
        "index.html"
    ],
    "swDest": "service-worker.js",
    "globIgnores": [
        "workbox-cli-config.js"
    ]
};
