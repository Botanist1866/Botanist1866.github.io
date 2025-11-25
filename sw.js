const CACHE_NAME = 'solfege-trainer-v4';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/style.css',
    '/main.js',
    '/src/renderer.js',
    '/src/relative.js',
    '/src/ordinance.js',
    '/src/ui.js',
    '/src/performance.js',
    '/src/translations.js',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png'
];

// Install Event - Cache Assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching all: app shell and content');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    // Force the waiting service worker to become the active service worker
    self.skipWaiting();
});

// Fetch Event - Serve from Cache, Fallback to Network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                return response;
            }
            return fetch(event.request);
        })
    );
});

// Activate Event - Cleanup Old Caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('[Service Worker] Removing old cache', key);
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => {
            // Take control of all clients immediately
            return self.clients.claim();
        })
    );
});
