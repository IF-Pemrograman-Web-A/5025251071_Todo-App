// Dark Mode
const themeToggleBtn = document.getElementById("theme-toggle-btn");

const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    if (themeToggleBtn) themeToggleBtn.textContent = "Light Mode";
}

if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", function() {
        document.body.classList.toggle("dark-mode");
        const isDark = document.body.classList.contains("dark-mode");
        
        localStorage.setItem("theme", isDark ? "dark" : "light");
        themeToggleBtn.textContent = isDark ? "Light Mode" : "Dark Mode";
    });
}

// SW & Notification
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('serwork.js')
        .then(() => console.log('Service Worker terdaftar!'))
        .catch(err => console.error('Pendaftaran Service Worker gagal:', err));
}

function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission();
    }
}
requestNotificationPermission();

//Penjadwalan Notifikasi
document.addEventListener('DOMContentLoaded', () => {
    // Membaca semua todo-item dari database MySQL
    const todoItems = document.querySelectorAll('.todo-item');

    todoItems.forEach(item => {
        const title = item.getAttribute('data-title');
        const deadlineStr = item.getAttribute('data-deadline');

        if (deadlineStr && 'serviceWorker' in navigator && Notification.permission === 'granted') {
            const formattedDeadline = deadlineStr.replace(' ', 'T');
            const targetTime = new Date(deadlineStr).getTime();
            const now = new Date().getTime();
            const delay = targetTime - now;

            // Kirim pesan ke Service Worker jika deadline masih di masa depan
            if (delay > 0) {
                navigator.serviceWorker.ready.then(registration => {
                    if (registration.active) {
                        registration.active.postMessage({
                            type: 'SCHEDULE_NOTIFICATION',
                            title: `🚨 Reminder: ${title}`,
                            body: 'Oy kerjain tugasnyaaa!',
                            delay: delay
                        });
                    }
                });
            }
        }
    });
});