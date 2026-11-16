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
            if (todo.status === 'Done!' || !todo.notify_time) return;

            const formattedDeadline = todo.notify_time.replace(' ', 'T');
            const targetTime = new Date(formattedDeadline).getTime();
            const now = new Date().getTime();

            const MINUTES_BEFORE = 180; // 3 jam sebelum deadline
            const warningTime = targetTime - (MINUTES_BEFORE * 60 * 1000);

            const delayWarning = warningTime - now;
            const delayExact = targetTime - now;

            if (delayWarning > 0) {
                registration.active.postMessage({
                    type: 'SCHEDULE_NOTIFICATION',
                    title: `🚨Reminder (3 Hours Left): ${todo.title}`,
                    body: `Oy kerjain tugasnyaaa!!`,
                    delay: delayWarning
                });
            }

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
let currentTodos = [];

const apiHeaders = {
    'Content-Type': 'application/json',
    'X-API-KEY': API_KEY
};

function getCurrentCategory() {
    const params = new URLSearchParams(window.location.search);
    return params.get('category') || 'Personal';
}

// GET: Ambil seluruh daftar tugas dari api.php
async function loadTodos() {
    const listContainer = document.getElementById('todo-list');
    if (!listContainer) return;

    const category = getCurrentCategory();
    const heading = document.getElementById('category-heading');
    if (heading) heading.textContent = `${category} Tasks`;

    const url = `${API_URL}?category=${encodeURIComponent(category)}`;

    try {
        const res = await fetch(url, { method: 'GET', headers: apiHeaders });
        const result = await res.json();

        if (!res.ok) throw new Error(result.message || 'Gagal memuat data');

        currentTodos = result.data;
        renderTodos(currentTodos);
        scheduleTodoNotifications(currentTodos);
    } catch (err) {
        listContainer.innerHTML = `<li class="todo-item"><p>Error: ${err.message}</p></li>`;
    }
}

// Render daftar tugas sesuai struktur style.css asli
function renderTodos(todos) {
    const listContainer = document.getElementById('todo-list');
    if (!todos || todos.length === 0) {
        listContainer.innerHTML = `<li class="todo-item"><p>Belum ada daftar tugas 🙌🏻</p></li>`;
        return;
    }

    listContainer.innerHTML = todos.map(todo => `
        <li class="todo-item ${todo.status === 'Done!' ? 'completed' : ''}" data-id="${todo.id}">
            <div>
                <h4>${escapeHTML(todo.title)}</h4>
                ${todo.description ? `<p>${escapeHTML(todo.description)}</p>` : ''}
                <p>Status: <b>${escapeHTML(todo.status)}</b>${todo.notify_time ? ` | ⏰ ${escapeHTML(todo.notify_time)}` : ''}</p>
            </div>
            <div class="todo-actions">
                <a href="javascript:void(0)" class="btn-edit" onclick="openEditor(${todo.id})">Edit</a>
                <a href="javascript:void(0)" class="btn-delete" onclick="deleteTodo(${todo.id})">Delete</a>
            </div>
        </li>
    `).join('');
}

// POST: Tambah tugas baru (kategori otomatis mengikuti sidebar kiri)
document.getElementById('todo-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
        title: document.getElementById('todo-title').value,
        description: document.getElementById('todo-desc').value,
        category: getCurrentCategory(),
        notify_time: document.getElementById('todo-notify').value || null
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

// Buka Panel Kanan untuk Edit Tugas
function openEditor(id) {
    const todo = currentTodos.find(t => Number(t.id) === Number(id));
    if (!todo) return;

    document.getElementById('editor-placeholder').style.display = 'none';
    const editForm = document.getElementById('edit-form');
    editForm.style.display = 'flex';

    document.getElementById('edit-id').value = todo.id;
    document.getElementById('edit-title').value = todo.title;
    document.getElementById('edit-desc').value = todo.description || '';
    document.getElementById('edit-status').value = todo.status || 'Unfinished';
    document.getElementById('edit-notify').value = todo.notify_time ? todo.notify_time.replace(' ', 'T').slice(0, 16) : '';
}

// PUT: Simpan perubahan dari Panel Kanan
document.getElementById('edit-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('edit-id').value;
    const payload = {
        title: document.getElementById('edit-title').value,
        description: document.getElementById('edit-desc').value,
        status: document.getElementById('edit-status').value,
        notify_time: document.getElementById('edit-notify').value || null
    };

    try {
        const res = await fetch(`${API_URL}?id=${id}`, {
            method: 'PUT',
            headers: apiHeaders,
            body: JSON.stringify(payload)
        });
        const result = await res.json();

        if (!res.ok) {
            alert(`Gagal (${res.status}): ${result.message}`);
            return;
        }

        document.getElementById('edit-form').style.display = 'none';
        document.getElementById('editor-placeholder').style.display = 'block';
        loadTodos();
    } catch (err) {
        alert('Gagal memperbarui tugas.');
    }
});

// DELETE: Hapus tugas (dari list maupun dari panel kanan)
async function deleteTodo(id) {
    if (!confirm('Yakin ingin menghapus tugas ini?')) return;

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

        if (document.getElementById('edit-id').value == id) {
            document.getElementById('edit-form').style.display = 'none';
            document.getElementById('editor-placeholder').style.display = 'block';
        }
        loadTodos();
    } catch (err) {
        alert('Gagal menghapus tugas.');
    }
}

function deleteFromEditor() {
    const id = document.getElementById('edit-id').value;
    if (id) deleteTodo(id);
}

// Helper keamanan mencegah XSS
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str ?? '';
    return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', loadTodos);