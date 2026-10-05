self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// Menangani permintaan Notifikasi
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
        const { title, body, delay } = event.data;
        setTimeout(() => {
            self.registration.showNotification(title, {
                body: body,
                icon: '[https://via.placeholder.com/128/e8a5a5/ffffff?text=Todo](https://via.placeholder.com/128/e8a5a5/ffffff?text=Todo)'
            });
        }, delay);
    }
});