let db;
const request = indexedDB.open("TodoAppDataBase", 1);

request.onupgradeneeded = function(event) {
    db = event.target.result;
    if (!db.objectStoreNames.contains("todos")) {
        db.createObjectStore("todos", { keyPath: "id" });
    }
};

request.onsuccess = function(event) {
    db = event.target.result;
    checkAndSeedDummyData();
};

request.onerror = function(event) {
    console.error("IndexedDB error:", event.target.errorCode);
};

function checkAndSeedDummyData() {
    const tx = db.transaction("todos", "readonly");
    const store = tx.objectStore("todos");
    const countReq = store.count();

    countReq.onsuccess = function() {
        if (countReq.result === 0) {
            const initialTodos = [
                { 
                    id: 1, 
                    title: "Tugas Pemrograman Web", 
                    desc: "Bikin website sederhana pake html dan css", 
                    status: "Unfinished",
                    image: null,
                    notifyTime: ""
                },
                { 
                    id: 2, 
                    title: "Beli keperluan yang abis", 
                    desc: "Sabun cuci baju, sunscreen", 
                    status: "In progress",
                    image: null,
                    notifyTime: ""
                }
            ];
            const writeTx = db.transaction("todos", "readwrite");
            const writeStore = writeTx.objectStore("todos");
            initialTodos.forEach(item => writeStore.add(item));
            writeTx.oncomplete = function() {
                loadTodosFromIndexedDB();
            };
        } else {
            loadTodosFromIndexedDB();
        }
    };
}

const todoListEl = document.getElementById("todo-list");
const addFormEl = document.getElementById("add-todo-form");
const editFormEl = document.getElementById("edit-todo-form");
const btnDeleteEditor = document.getElementById("btn-delete-editor");
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

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(() => console.log('Service Worker terdaftar'))
        .catch(err => console.error('Pendaftaran Service Worker gagal:', err));
}

function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission();
    }
}
requestNotificationPermission();

function scheduleNotification(title, body, notifyTime) {
    if ('serviceWorker' in navigator && Notification.permission === 'granted' && notifyTime) {
        const targetTime = new Date(notifyTime).getTime();
        const now = new Date().getTime();
        const delay = targetTime - now;

        if (delay > 0) {
            navigator.serviceWorker.ready.then(registration => {
                registration.active.postMessage({
                    type: 'SCHEDULE_NOTIFICATION',
                    title: `⏰ Reminder: ${title}`,
                    body: body || 'Oy kerjain tugasnyaaaa!',
                    delay: delay
                });
            });
        }
    }
}

function loadTodosFromIndexedDB() {
    const tx = db.transaction("todos", "readonly");
    const store = tx.objectStore("todos");
    const getAllReq = store.getAll();

    getAllReq.onsuccess = function() {
        renderTodos(getAllReq.result);
    };
}

function saveTodoToIndexedDB(todo) {
    const tx = db.transaction("todos", "readwrite");
    const store = tx.objectStore("todos");
    store.put(todo);
    tx.oncomplete = function() {
        loadTodosFromIndexedDB();
    };
}

function deleteTodoFromIndexedDB(id) {
    const tx = db.transaction("todos", "readwrite");
    const store = tx.objectStore("todos");
    store.delete(id);
    tx.oncomplete = function() {
        loadTodosFromIndexedDB();
    };
}

function renderTodos(todos) {
    todoListEl.innerHTML = ""; 

    todos.forEach(todo => {
        const li = document.createElement("li");
        const isDone = todo.status === "Done!";
        
        li.className = `todo-item ${isDone ? 'completed' : ''}`;
        
        const imgTag = todo.image ? `<img src="${todo.image}" alt="Lampiran untuk ${todo.title}" class="todo-img-preview" style="max-width:80px; border-radius:8px; margin-top:8px; display:block;">` : '';

        li.innerHTML = `
            <input type="checkbox" ${isDone ? 'checked' : ''} onchange="toggleCheckbox(${todo.id})" aria-label="Tandain tugas ${todo.title} ini selesai!">
            <div class="todo-content">
                <h4>${todo.title}</h4>
                <p>${todo.desc}</p>
                ${imgTag}
                <small style="color: var(--text-muted); font-size: 0.85rem;">- Status: <b>${todo.status}</b></small>
            </div>
            <div class="todo-actions">
                <button type="button" class="btn-edit" onclick="loadToEditor(${todo.id})" aria-label="Edit tugas ${todo.title}">Edit</button>
            </div>
        `;

        todoListEl.appendChild(li);
    });
}

addFormEl.addEventListener("submit", function(event) {
    event.preventDefault(); 

    const titleInput = document.getElementById("input-title").value;
    const descInput = document.getElementById("input-desc").value;
    
    const imageInput = document.getElementById("input-image") ? document.getElementById("input-image").files[0] : null;
    const notifyTimeInput = document.getElementById("input-notify-time") ? document.getElementById("input-notify-time").value : "";

    const createTodo = (imageData = null) => {
        const newTodo = {
            id: Date.now(), 
            title: titleInput,
            desc: descInput,
            status: "Unfinished",
            image: imageData,        
            notifyTime: notifyTimeInput 
        };

        saveTodoToIndexedDB(newTodo); 
        if (notifyTimeInput) {
            scheduleNotification(newTodo.title, newTodo.desc, notifyTimeInput);
        }

        addFormEl.reset(); 
    };

    if (imageInput) {
        const reader = new FileReader();
        reader.onloadend = function() {
            createTodo(reader.result);
        };
        reader.readAsDataURL(imageInput);
    } else {
        createTodo();
    }
});

function loadToEditor(id) {
    const tx = db.transaction("todos", "readonly");
    const store = tx.objectStore("todos");
    const getReq = store.get(id);

    getReq.onsuccess = function() {
        const todo = getReq.result;
        if (todo) {
            document.getElementById("edit-id").value = todo.id;
            document.getElementById("edit-title").value = todo.title;
            document.getElementById("edit-desc").value = todo.desc;
            document.getElementById("edit-status").value = todo.status;
        }
    };
}

editFormEl.addEventListener("submit", function(event) {
    event.preventDefault();

    const id = Number(document.getElementById("edit-id").value);
    if (!id) return; 

    const tx = db.transaction("todos", "readonly");
    const store = tx.objectStore("todos");
    const getReq = store.get(id);

    getReq.onsuccess = function() {
        const todo = getReq.result;
        if (todo) {
            todo.title = document.getElementById("edit-title").value;
            todo.desc = document.getElementById("edit-desc").value;
            todo.status = document.getElementById("edit-status").value;

            saveTodoToIndexedDB(todo);
            editFormEl.reset();
        }
    };
});

btnDeleteEditor.addEventListener("click", function() {
    const id = Number(document.getElementById("edit-id").value);
    if (!id) return;

    deleteTodoFromIndexedDB(id);
    editFormEl.reset(); 
});

function toggleCheckbox(id) {
    const tx = db.transaction("todos", "readonly");
    const store = tx.objectStore("todos");
    const getReq = store.get(id);

    getReq.onsuccess = function() {
        const todo = getReq.result;
        if (todo) {
            todo.status = (todo.status === "Done!") ? "Unfinished" : "Done!";
            saveTodoToIndexedDB(todo);
        }
    };
}