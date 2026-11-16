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

// Service Worker, Install PWA & Notification Permission
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('serwork.js')
        .then(() => console.log('Service Worker terdaftar!'))
        .catch(err => console.error('Duh, pendaftaran Service Worker gagal:', err));
}

function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('Izin notifikasi diberikan!');
            }
        });
    }
}
requestNotificationPermission();

// Tombol Install PWA
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

// Notifikasi Deadline (H-3 Jam & Tepat Waktu)
function scheduleTodoNotifications(todos) {
    if (!('serviceWorker' in navigator) || Notification.permission !== 'granted') return;

    navigator.serviceWorker.ready.then(registration => {
        if (!registration.active) return;

        todos.forEach(todo => {
            // Lewati jika sudah selesai atau tidak ada waktu deadline
            if (todo.is_done == 1 || !todo.deadline) return;

            const formattedDeadline = todo.deadline.replace(' ', 'T');
            const targetTime = new Date(formattedDeadline).getTime();
            const now = new Date().getTime();

            const MINUTES_BEFORE = 180; // 3 jam sebelum deadline
            const warningTime = targetTime - (MINUTES_BEFORE * 60 * 1000);

            const delayWarning = warningTime - now;
            const delayExact = targetTime - now;

            // Reminder 3 jam sebelum deadline
            if (delayWarning > 0) {
                registration.active.postMessage({
                    type: 'SCHEDULE_NOTIFICATION',
                    title: `🚨Reminder (3 Hours Left): ${todo.title}`,
                    body: `Oy kerjain tugasnyaaa!!`,
                    delay: delayWarning
                });
            }

            // Reminder saat deadline tiba
            if (delayExact > 0) {
                registration.active.postMessage({
                    type: 'SCHEDULE_NOTIFICATION',
                    title: `🚨Deadline ${todo.title}`,
                    body: `Kumpulin sekarang! "${todo.title}".`,
                    delay: delayExact
                });
            }
        });
    });
}

// RESTFUL API CRUD Operations
const API_URL = './api.php';
const API_KEY = "Piw's Todo App";

const apiHeaders = {
    'Content-Type': 'application/json',
    'X-API-KEY': API_KEY
};

function getCurrentCategory() {
    const params = new URLSearchParams(window.location.search);
    return params.get('category') || '';
}

// GET: Ambil seluruh daftar tugas dari api.php
async function loadTodos() {
    const listContainer = document.getElementById('todo-list');
    if (!listContainer) return;

    const category = getCurrentCategory();
    const url = category ? `${API_URL}?category=${encodeURIComponent(category)}` : API_URL;

    try {
        const res = await fetch(url, { method: 'GET', headers: apiHeaders });
        const result = await res.json();

        if (!res.ok) throw new Error(result.message || 'Gagal memuat data');

        renderTodos(result.data);
        scheduleTodoNotifications(result.data); // Jadwalkan notif dari data API
    } catch (err) {
        listContainer.innerHTML = `<p class="error-text">Error: ${err.message}</p>`;
    }
}

// Render daftar tugas ke dalam HTML
function renderTodos(todos) {
    const listContainer = document.getElementById('todo-list');
    if (!todos || todos.length === 0) {
        listContainer.innerHTML = `<p class="empty-text">Belum ada catatan di kategori ini 🐻</p>`;
        return;
    }

    listContainer.innerHTML = todos.map(todo => `
        <div class="todo-item ${todo.is_done == 1 ? 'completed' : ''}" data-id="${todo.id}" data-title="${escapeHTML(todo.title)}" data-deadline="${escapeHTML(todo.deadline || '')}">
            <div class="todo-content">
                <div class="todo-header">
                    <span class="badge badge-${todo.category.toLowerCase()}">${escapeHTML(todo.category)}</span>
                    <h3>${escapeHTML(todo.title)}</h3>
                </div>
                ${todo.description ? `<p>${escapeHTML(todo.description)}</p>` : ''}
                ${todo.deadline ? `<small>⏰ ${escapeHTML(todo.deadline)}</small>` : ''}
            </div>
            <div class="todo-actions">
                <button onclick="toggleTodo(${todo.id}, ${todo.is_done == 1 ? 0 : 1})" title="Tandai Selesai">
                    ${todo.is_done == 1 ? '↩️' : '✅'}
                </button>
                <button onclick="editTodo(${todo.id}, '${escapeHTML(todo.title)}', '${escapeHTML(todo.description || '')}')" title="Edit">
                    ✏️
                </button>
                <button onclick="deleteTodo(${todo.id})" title="Hapus">
                    🗑️
                </button>
            </div>
        </div>
    `).join('');
}

// POST: Tambah tugas baru
document.getElementById('todo-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
        title: document.getElementById('todo-title').value,
        description: document.getElementById('todo-desc').value,
        category: document.getElementById('todo-category').value,
        deadline: document.getElementById('todo-deadline')?.value || document.getElementById('todo-notify')?.value || null
    };

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: apiHeaders,
            body: JSON.stringify(payload)
        });
        const result = await res.json();

        if (!res.ok) {
            alert(`Gagal (${res.status}): ${result.message}`);
            return;
        }

        e.target.reset();
        loadTodos();
    } catch (err) {
        alert('Terjadi kesalahan jaringan saat menambah tugas.');
    }
});

// PATCH: Ubah status selesai/belum
async function toggleTodo(id, newStatus) {
    try {
        const res = await fetch(`${API_URL}?id=${id}`, {
            method: 'PATCH',
            headers: apiHeaders,
            body: JSON.stringify({ is_done: newStatus })
        });
        if (res.ok) loadTodos();
    } catch (err) {
        console.error(err);
    }
}

// PUT: Edit judul dan deskripsi tugas
async function editTodo(id, oldTitle, oldDesc) {
    const newTitle = prompt('Edit Judul Tugas:', oldTitle);
    if (newTitle === null) return;

    const newDesc = prompt('Edit Deskripsi Tugas:', oldDesc);
    if (newDesc === null) return;

    try {
        const res = await fetch(`${API_URL}?id=${id}`, {
            method: 'PUT',
            headers: apiHeaders,
            body: JSON.stringify({ title: newTitle, description: newDesc })
        });
        const result = await res.json();

        if (!res.ok) {
            alert(`Gagal (${res.status}): ${result.message}`);
            return;
        }
        loadTodos();
    } catch (err) {
        alert('Gagal memperbarui tugas.');
    }
}

// DELETE: Hapus tugas
async function deleteTodo(id) {
    if (!confirm('Yakin ingin menghapus catatan ini?')) return;

    try {
        const res = await fetch(`${API_URL}?id=${id}`, {
            method: 'DELETE',
            headers: apiHeaders
        });
        const result = await res.json();

        if (!res.ok) {
            alert(`Gagal (${res.status}): ${result.message}`);
            return;
        }
        loadTodos();
    } catch (err) {
        alert('Gagal menghapus tugas.');
    }
}

// Helper keamanan mencegah XSS
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str ?? '';
    return div.innerHTML;
}

// Muat daftar tugas dari REST API saat halaman siap
document.addEventListener('DOMContentLoaded', loadTodos);