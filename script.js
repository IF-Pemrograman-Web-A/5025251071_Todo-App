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
        
        if (isDark) {
            themeToggleBtn.textContent = "Light Mode";
        } else {
            themeToggleBtn.textContent = "Dark Mode";
        }
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

const addForm = document.querySelector(".todo-form");
if (addForm) {
    addForm.addEventListener("submit", function() {
        const titleInput = document.getElementById("input-title") ? document.getElementById("input-title").value : "";
        const notifyTimeInput = document.getElementById("input-notify-time") ? document.getElementById("input-notify-time").value : "";
        
        if (notifyTimeInput && 'serviceWorker' in navigator && Notification.permission === 'granted') {
            const targetTime = new Date(notifyTimeInput).getTime();
            const now = new Date().getTime();
            const delay = targetTime - now;

            if (delay > 0) {
                navigator.serviceWorker.ready.then(registration => {
                    registration.active.postMessage({
                        type: 'SCHEDULE_NOTIFICATION',
                        title: `🚨Reminder: ${titleInput}`,
                        body: 'Oy kerjain tugasnyaaa!',
                        delay: delay
                    });
                });
            }
        }
    });
}