<?php
// Menentukan kategori aktif dari URL (?category=Personal / Shared)
$current_category = isset($_GET['category']) && $_GET['category'] === 'Shared' ? 'Shared' : 'Personal';
?>

<!-- Sidebar Menu "Personal" dan "Shared" -->
<aside class="sidebar" role="navigation" aria-label="Menu Utama">
    <h2>Categories</h2>
    <ul class="menu-list">
        <li>
            <a href="index.php?category=Personal" class="<?= $current_category === 'Personal' ? 'active' : '' ?>">
                👤 Personal
            </a>
        </li>
        <li>
            <a href="index.php?category=Shared" class="<?= $current_category === 'Shared' ? 'active' : '' ?>">
                👥 Shared
            </a>
        </li>
    </ul>
</aside>