<div class="memo-container">
    <!-- Form Tambah Tugas -->
    <form id="todo-form" class="todo-form">
        <input type="text" id="todo-title" placeholder="Title..." required>
        <textarea id="todo-desc" placeholder="Description..." rows="2"></textarea>
        
        <div class="form-row">
            <select id="todo-category">
                <option value="Personal">Personal</option>
                <option value="Shared">Shared</option>
            </select>
            <input type="datetime-local" id="todo-deadline" title="Waktu Deadline">
            <button type="submit" class="btn-add">Add</button>
        </div>
    </form>

    <!-- Wadah Daftar Tugas -->
    <div id="todo-list" class="todo-list">
        <p class="loading-text">Belum ada daftar tugas 🙌🏻</p>
    </div>
</div>