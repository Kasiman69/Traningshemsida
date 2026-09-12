"use strict";
const CACHE_NAME = "traning-v3";
const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./dist/script.js",
    "./manifest.json"
];
// Installera ny service worker
self.addEventListener("install", event => {
    event.waitUntil(caches.open(CACHE_NAME).then(cache => {
        return cache.addAll(FILES_TO_CACHE);
    }));
    self.skipWaiting();
});
// Aktivera ny service worker och rensa gamla cacher
self.addEventListener("activate", event => {
    event.waitUntil(caches.keys().then(cacheNames => {
        return Promise.all(cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => caches.delete(cacheName)));
    }));
    self.clients.claim();
});
// Hämta filer
self.addEventListener("fetch", event => {
    event.respondWith(fetch(event.request)
        .then(response => {
        return response;
    })
        .catch(() => {
        return caches.match(event.request);
    }));
});
