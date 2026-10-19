<?php
// Menyambungkan koneksi database & mengambil kategori
include 'config.php';
$category = isset($_GET['category']) && $_GET['category'] === 'Shared' ? 'Shared' : 'Personal';

// Tambah To-do
if (isset($_POST['add_todo'])) {
    $title = mysqli_real_escape_string($conn, $_POST['title']);
    $desc = mysqli_real_escape_string($conn, $_POST['description']);
    $cat = mysqli_real_escape_string($conn, $_POST['category']);
    $image_name = NULL;

    // Upload Gambar ke server PHP
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
        $image_name = time() . '_' . uniqid() . '.' . $ext;
        if (!is_dir('uploads')) { mkdir('uploads', 0777, true); }
        move_uploaded_file($_FILES['image']['tmp_name'], 'uploads/' . $image_name);
    }

    $query = "INSERT INTO todos (title, description, status, category, image) VALUES ('$title', '$desc', 'Unfinished', '$cat', '$image_name')";
    mysqli_query($conn, $query);
    header("Location: index.php?category=" . $cat);
    exit();
}

// Hapus To-do)
if (isset($_GET['delete'])) {
    $id = intval($_GET['delete']);
    mysqli_query($conn, "DELETE FROM todos WHERE id = $id");
    header("Location: index.php?category=" . $category);
    exit();
}

// Menyimpan Editan To-do
if (isset($_POST['update_todo'])) {
    $id = intval($_POST['id']);
    $title = mysqli_real_escape_string($conn, $_POST['title']);
    $desc = mysqli_real_escape_string($conn, $_POST['description']);
    $status = mysqli_real_escape_string($conn, $_POST['status']);

    $query = "UPDATE todos SET title='$title', description='$desc', status='$status' WHERE id=$id";
    mysqli_query($conn, $query);
    header("Location: index.php?category=" . $category);
    exit();
}

// Fetch data dari database sql
$todos_result = mysqli_query($conn, "SELECT * FROM todos WHERE category = '$category' ORDER BY id DESC");
?>

<div class="content-wrapper">
    <!-- Left panel: List -->
    <section class="left-panel">
        <h2>List Task (<?= $category ?>)</h2>
        
        <!-- Form new todo -->
        <!-- Method POST, enctype untuk file, & input category -->
        <form action="index.php?category=<?= $category ?>" method="POST" enctype="multipart/form-data" class="todo-form">
            <h3>New To-do</h3>
            <input type="hidden" name="category" value="<?= $category ?>">
            
            <input type="text" name="title" placeholder="Task title..." required>
            <textarea name="description" placeholder="Description..."></textarea>

            <!-- Input Waktu Deadline -->
            <label for="notify_time" style="color: var(--text-muted); font-weight: bold; font-size: 0.95rem;">Deadline:</label>
            <input type="datetime-local" id="notify_time" name="notify_time">
            
            <!-- Input File -->
            <label for="input-image" style="font-size: 0.9rem;">Foto Tugas:</label>
            <input type="file" id="input-image" name="image" accept="image/*">

            <button type="submit" name="add_todo">Add</button>
        </form>

        <!-- Dynamic Todo List dari Database MySQL -->
        <ul class="todo-list">
            <?php while ($row = mysqli_fetch_assoc($todos_result)): ?>
                <?php $isDone = ($row['status'] === 'Done!'); ?>
                <li class="todo-item <?= $isDone ? 'completed' : '' ?>">
                    <div class="todo-content">
                        <h4><?= htmlspecialchars($row['title']) ?></h4>
                        <?php if (!empty($row['description'])): ?>
                            <p><?= htmlspecialchars($row['description']) ?></p>
                        <?php endif; ?>
                        
                        <!-- Tampilan gambar jika di-upload -->
                        <?php if ($row['image']): ?>
                            <img src="uploads/<?= $row['image'] ?>" alt="Lampiran" style="max-width:80px; border-radius:8px; margin-top:8px; display:block;">
                        <?php endif; ?>
                        
                        <small style="color: var(--text-muted); font-size: 0.85rem;">- Status: <b><?= htmlspecialchars($row['status']) ?></b></small>
                    </div>
                    
                    <div class="todo-actions">
                        <!-- Tombol Edit & Delete interaktif via PHP -->
                        <a href="index.php?category=<?= $category ?>&edit=<?= $row['id'] ?>" class="btn-edit">Edit</a>
                        <a href="index.php?category=<?= $category ?>&delete=<?= $row['id'] ?>" class="btn-delete" onclick="return confirm('Mau hapus tugasnya?')">Delete</a>
                    </div>
                </li>
            <?php endwhile; ?>
        </ul>
    </section>

    <!-- Right panel: Editor/detail Todo -->
    <?php
    $edit_data = null;
    if (isset($_GET['edit'])) {
        $edit_id = intval($_GET['edit']);
        $res = mysqli_query($conn, "SELECT * FROM todos WHERE id = $edit_id");
        $edit_data = mysqli_fetch_assoc($res);
    }
    ?>
    <aside class="right-panel">
        <h2>Detail Todo</h2>
        <?php if ($edit_data): ?>
            <!-- Form terhubung ke PHP Update -->
            <form action="index.php?category=<?= $category ?>" method="POST" class="editor-form">
                <input type="hidden" name="id" value="<?= $edit_data['id'] ?>">

                <label for="edit-title">Title:</label>
                <input type="text" id="edit-title" name="title" value="<?= htmlspecialchars($edit_data['title']) ?>" required>

                <label for="edit-desc">Description:</label>
                <textarea id="edit-desc" name="description" rows="5"><?= htmlspecialchars($edit_data['description']) ?></textarea>

                <label for="edit-status">Status:</label>
                <select id="edit-status" name="status">
                    <option value="Unfinished" <?= $edit_data['status'] === 'Unfinished' ? 'selected' : '' ?>>Unfinished</option>
                    <option value="In progress" <?= $edit_data['status'] === 'On progress' ? 'selected' : '' ?>>In progress</option>
                    <option value="Done!" <?= $edit_data['status'] === 'Done!' ? 'selected' : '' ?>>Done!</option>
                </select>

                <div class="editor-buttons" style="display: flex; gap: 10px; margin-top: 10px;">
                    <button type="submit" name="update_todo" class="btn-save" style="flex: 1;">Yup, save!</button>
                    <a href="index.php?category=<?= $category ?>&delete=<?= $edit_data['id'] ?>" class="btn-delete" style="flex: 1; text-align: center; text-decoration: none; line-height: 2.2;" onclick="return confirm('Mau hapus tugasnya?')">Delete</a>
                </div>
            </form>
        <?php else: ?>
            <p style="color: var(--text-muted);">Pilih tugasnya trus <b>Edit</b> buat lihat atau ubah detail!</p>
        <?php endif; ?>
    </aside>
</div>
