const CACHE_NAME = 'todo-app-ch';
const ASSETS_TO_CACHE = [
    './',
    './index.php',
    './style.css',
    './script.js',
    './manifest.json',
    './icons/icon-192.png',
    './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Simpan salinan terbaru ke cache jika berhasil fetch
                const resClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
                return response;
            })
            .catch(() => {
                // Ambil dari cache jika offline
                return caches.match(event.request);
            })
    );
});

// Menangani permintaan Notifikasi
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
        const { title, body, delay } = event.data;
        
        setTimeout(() => {
            self.registration.showNotification(title, {
                body: body,
                icon: './icons/icon-192.png',
                vibrate: [200, 100, 200]
            });
        }, delay);
    }
});