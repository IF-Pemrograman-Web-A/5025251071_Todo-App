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
        .catch(err => console.error('Duh, pendaftaran Service Worker gagal:', err));
}

function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission();
    }
}
requestNotificationPermission();

//Penjadwalan Notifikasi
document.addEventListener('DOMContentLoaded', () => {
    if ('Notification' in window) {
        if (Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    console.log('Izin notifikasi diberikan!');
                }
            });
        }
    }
    
    // Membaca semua todo-item dari db sql
    const todoItems = document.querySelectorAll('.todo-item');

    todoItems.forEach(item => {
        const title = item.getAttribute('data-title');
        const deadlineStr = item.getAttribute('data-deadline');

        if (deadlineStr && 'serviceWorker' in navigator && Notification.permission === 'granted') {
            const formattedDeadline = deadlineStr.replace(' ', 'T');
            const targetTime = new Date(deadlineStr).getTime();
            const now = new Date().getTime();

            // Waktu untuk notifikasi pengingat dl (3 jam sebelum dl) 
            const MINUTES_BEFORE = 180; 
            const warningTime = targetTime - (MINUTES_BEFORE * 60 * 1000);

            const delayWarning = warningTime - now; // Delay pengingat awal
            const delayExact = targetTime - now;     // Delay saat deadline tepat tiba

            navigator.serviceWorker.ready.then(registration => {
                if (!registration.active) return;

            // Reminder sebelum dl
            if (delayWarning > 0) {
                    registration.active.postMessage({
                        type: 'SCHEDULE_NOTIFICATION',
                        title: `🚨Reminder (3 Hours Left): ${title}`,
                        body: `Oy kerjain tugasnyaaa!!`,
                        delay: delayWarning
                    });
                }

            // Reminder udah waktunya dl
            if (delayExact > 0) {
                    registration.active.postMessage({
                        type: 'SCHEDULE_NOTIFICATION',
                        title: `🚨Deadline ${title}`,
                        body: `Kumpulin sekarang! "${title}".`,
                        delay: delayExact
                    });
                }
            });    
        }
    });
});

let deferredPrompt;
const installBtn = document.getElementById('btn-install');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) installBtn.style.display = 'block';
});

if (installBtn) {
    installBtn.addEventListener('click', () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User menerima instalasi PWA!');
                }
                deferredPrompt = null;
                installBtn.style.display = 'none';
            });
        }
    });
}