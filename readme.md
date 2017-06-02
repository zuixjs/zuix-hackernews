# ZUIX • Hacker News Web

Example of using **list_view** component with progressive/lazy loading.

https://g-labs-sw.github.io/zuix-hackernews/

Each item in the list is loaded on-the-fly by using official
HN firebase API https://github.com/HackerNews/API.

#### Local testing

Issue the following commands to install development dependencies
and start the local web server (port 8080).

```shell
npm install
npm run start
```

If you change components' source code, remember to comment the `app.bundle.js`
file inclusion in the `index.html` file otherwise old components will be loaded from the
bundle. For more information about *bundling* see the ZUIX docs.

## About ZUIX

> ZUIX is a lite JavaScript framework (~11kB) for creating component-based web sites and applications.

Main features:
- Content Manager
- Template Engine
- Component Manager
- Cross-domain content/component loading
- Lazy loading
- Events, Behaviors and Hooks
- Automatic events unbinding
- Components and fields caching
- Integrated resources loader
- Integrated jQuery-like DOM helper
- Integrated localization engine


### Resources

- [ZUIX Home and Docs](https://genielabs.github.io/zuix)
- [Source code](https://github.com/genielabs/zuix)

### Support

- [Issues on GitHub](https://github.com/genielabs/zuix/issues)
