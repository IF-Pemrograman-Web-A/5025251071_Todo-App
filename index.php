<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>To-do App</title>
    <link rel="stylesheet" href="style.css">

    <link rel="manifest" href="manifest.json">
    <meta name="theme-color" content="#e8a5a5">
</head>
<body>

    <header>
        <h1>Piw's To-do List</h1>
        <div style="display: flex; gap: 10px; align-items: center;">
            <!-- Tombol Install App -->
            <button id="btn-install" style="display: none; background-color: #d98e8e; color: white; border: none; padding: 6px 16px; border-radius: 20px; cursor: pointer; font-size: 0.95rem;">
                Install
            </button>

            <!-- Tombol Dark Mode -->
            <button id="theme-toggle-btn">Dark Mode</button>
        </div>
    </header>

    <main class="container">
        <?php include 'menu-bar.php'; ?>
        <?php include 'content.php'; ?>
    </main>

    <!-- Footer -->
    <footer>
        <p>&copy; 2026 Todo App - Nasywa Zhafirah</p>
    </footer>

    <script src="script.js"></script>
</body>
</html>