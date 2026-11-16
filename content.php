<div class="content-wrapper">
    <!-- Panel Kiri: Form Tambah & Daftar Tugas -->
    <div class="left-panel">
        <h2 id="category-heading">Tasks</h2>
        
        <form id="todo-form">
            <input type="text" id="todo-title" placeholder="Title..." required>
            <textarea id="todo-desc" placeholder="Description..." rows="2"></textarea>
            
            <label for="todo-notify">Deadline:</label>
            <input type="datetime-local" id="todo-notify">

            <button type="submit">Add Task</button>
        </form>

        <ul id="todo-list" class="todo-list">
            <li class="todo-item"><p>Memuat daftar tugas...</p></li>
        </ul>
    </div>

    <!-- Panel Kanan: Editor Tugas (Muncul saat tombol Edit diklik) -->
    <div class="right-panel" id="editor-panel">
        <h2>Task Detail & Editor</h2>
        <p id="editor-placeholder" style="color: var(--text-muted);">Pilih tombol <b>Edit</b> pada salah satu tugas di sebelah kiri untuk mengubah detailnya.</p>
        
        <form id="edit-form" style="display: none;">
            <input type="hidden" id="edit-id">
            
            <label for="edit-title">Title:</label>
            <input type="text" id="edit-title" required>

            <label for="edit-desc">Description:</label>
            <textarea id="edit-desc" rows="3"></textarea>

            <label for="edit-status">Status:</label>
            <select id="edit-status">
                <option value="Unfinished">Unfinished</option>
                <option value="In Progress">In Progress</option>
                <option value="Done!">Done!</option>
            </select>

            <label for="edit-notify">Deadline / Reminder:</label>
            <input type="datetime-local" id="edit-notify">

            <div class="editor-buttons">
                <button type="submit" class="btn-save">Save</button>
                <button type="button" class="btn-delete" onclick="deleteFromEditor()">Delete</button>
            </div>
        </form>
    </div>
</div>