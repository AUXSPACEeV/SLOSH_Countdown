const APP_VERSION = 1;
const APP_CACHE_NAME = `app-cache-v${APP_VERSION}`;
const PRECACHED_URLS = [
  "./",
  "./index.html",
  "./script.js",
  "./service-worker.js",
  "./styles.css",
  "./data/flightEvents.json",
  "./web-app/apple-touch-icon.png",
  "./web-app/favicon.ico",
  "./web-app/favicon.svg",
  "./web-app/favicon-96x96.png",
  "./web-app/manifest.json",
  "./web-app/web-app-manifest-192x192.png",
  "./web-app/web-app-manifest-512x512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_CACHE_NAME).then((cache) =>
      Promise.all(
        PRECACHED_URLS.map((url) =>
          cache.add(url).catch((error) => console.warn(`Service Worker - Failed to pre-cache the file ${url}:`, error))
        )
      )
    )
  );
  self.skipWaiting().catch((error) => console.warn("Service Worker - Failed to forcefully activate the new worker:", error));
  console.info("Service Worker - Finished installing the app");
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((existingCacheNames) =>
      Promise.all(
        existingCacheNames.map((existingCacheName) => {
          if (existingCacheName !== APP_CACHE_NAME) {
            caches.delete(existingCacheName).then(() => console.info(`Service Worker - Deleted unused cache ${existingCacheName}`));
          }
        })
      )
    )
  );
  self.clients.claim().catch((error) => console.warn("Service Worker - Failed to claim all active clients:", error));
  console.info("Service Worker - Finished activating worker and deleting unused caches");
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.open(APP_CACHE_NAME).then((cache) =>
      fetch(event.request).then((networkResponse) => {
        cache.put(event.request, networkResponse.clone()).catch((error) =>
          console.warn(`Service Worker - Failed to cache the file ${event.request}:`, error)
        );
        return networkResponse;
      }).catch(() => {
        return cache.match(event.request);
      })
    )
  );
});
