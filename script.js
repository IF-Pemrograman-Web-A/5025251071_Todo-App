let todos = [
    { 
        id: 1, 
        title: "Tugas Pemrograman Web", 
        desc: "Bikin website sederhana pake html dan css", 
        status: "Unfinished" 
    },
    { 
        id: 2, 
        title: "Beli keperluan yang abis", 
        desc: "Sabun cuci baju, sunscreen", 
        status: "In progress" 
    }
];

const todoListEl = document.getElementById("todo-list");
const addFormEl = document.getElementById("add-todo-form");
const editFormEl = document.getElementById("edit-todo-form");
const btnDeleteEditor = document.getElementById("btn-delete-editor");
const themeToggleBtn = document.getElementById("theme-toggle-btn");

function renderTodos() {
    todoListEl.innerHTML = ""; 

    todos.forEach(todo => {
        const li = document.createElement("li");
        const isDone = todo.status === "Done!";
        
        li.className = `todo-item ${isDone ? 'completed' : ''}`;
        
        li.innerHTML = `
            <input type="checkbox" ${isDone ? 'checked' : ''} onchange="toggleCheckbox(${todo.id})">
            <div class="todo-content">
                <h4>${todo.title}</h4>
                <p>${todo.desc}</p>
                <small style="color: var(--text-muted); font-size: 0.85rem;">- Status: <b>${todo.status}</b></small>
            </div>
            <div class="todo-actions">
                <button type="button" class="btn-edit" onclick="loadToEditor(${todo.id})">Edit</button>
            </div>
        `;

        todoListEl.appendChild(li);
    });
}

addFormEl.addEventListener("submit", function(event) {
    event.preventDefault(); 

    const titleInput = document.getElementById("input-title").value;
    const descInput = document.getElementById("input-desc").value;

    const newTodo = {
        id: Date.now(), 
        title: titleInput,
        desc: descInput,
        status: "Unfinished" 
    };

    todos.push(newTodo); 
    renderTodos();       
    addFormEl.reset();   
});

function loadToEditor(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        document.getElementById("edit-id").value = todo.id;
        document.getElementById("edit-title").value = todo.title;
        document.getElementById("edit-desc").value = todo.desc;
        document.getElementById("edit-status").value = todo.status;
    }
}

editFormEl.addEventListener("submit", function(event) {
    event.preventDefault();

    const id = Number(document.getElementById("edit-id").value);
    if (!id) return; 

    const title = document.getElementById("edit-title").value;
    const desc = document.getElementById("edit-desc").value;
    const status = document.getElementById("edit-status").value;

    todos = todos.map(todo => {
        if (todo.id === id) {
            return { ...todo, title: title, desc: desc, status: status };
        }
        return todo;
    });

    renderTodos();
    editFormEl.reset();
});

btnDeleteEditor.addEventListener("click", function() {
    const id = Number(document.getElementById("edit-id").value);
    if (!id) return;

    todos = todos.filter(todo => todo.id !== id);

    renderTodos();
    editFormEl.reset(); 
});

function toggleCheckbox(id) {
    todos = todos.map(todo => {
        if (todo.id === id) {
            const newStatus = todo.status === "Done!" ? "Unfinished" : "Done!";
            return { ...todo, status: newStatus };
        }
        return todo;
    });
    renderTodos();
}

themeToggleBtn.addEventListener("click", function() {
    document.body.classList.toggle("dark-mode");
    
    if (document.body.classList.contains("dark-mode")) {
        themeToggleBtn.textContent = "Light Mode";
    } else {
        themeToggleBtn.textContent = "Dark Mode";
    }
});

renderTodos();