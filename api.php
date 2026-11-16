<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-API-KEY");

// Tangani Preflight Request dari browser
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config.php';

// Cek koneksi database (500 Internal Server Error jika gagal)
if (!$conn) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database connection failed"]);
    exit();
}

// Implementasi Autentikasi Sederhana via API Key
$VALID_API_KEY = "Piw's Todo App"; // Ubah sesuai keinginanmu
$headers = getallheaders();
$client_key = $headers['X-API-KEY'] ?? $headers['x-api-key'] ?? '';

if ($client_key !== $VALID_API_KEY) {
    http_response_code(401);
    echo json_encode([
        "status" => "error",
        "message" => "Unauthorized: Invalid or missing X-API-KEY header"
    ]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? intval($_GET['id']) : null;
$input  = json_decode(file_get_contents("php://input"), true);

switch ($method) {
    // GET: Ambil semua tugas atau detail 1 tugas berdasarkan ID
    case 'GET':
        if ($id !== null) {
            $stmt = $conn->prepare("SELECT * FROM todos WHERE id = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows === 0) {
                http_response_code(404);
                echo json_encode(["status" => "error", "message" => "Todo with ID $id not found"]);
            } else {
                http_response_code(200);
                echo json_encode(["status" => "success", "data" => $result->fetch_assoc()]);
            }
        } else {
            $category = $_GET['category'] ?? null;
            if ($category && in_array($category, ['Personal', 'Shared'])) {
                $stmt = $conn->prepare("SELECT * FROM todos ORDER BY id DESC WHERE category = ?");
                // Perbaikan urutan SQL: WHERE sebelum ORDER BY
                $stmt = $conn->prepare("SELECT * FROM todos WHERE category = ? ORDER BY id DESC");
                $stmt->bind_param("s", $category);
                $stmt->execute();
                $result = $stmt->get_result();
            } else {
                $result = $conn->query("SELECT * FROM todos ORDER BY id DESC");
            }

            $todos = [];
            while ($row = $result->fetch_assoc()) {
                $todos[] = $row;
            }
            http_response_code(200);
            echo json_encode(["status" => "success", "data" => $todos]);
        }
        break;

    // POST: Tambah tugas baru
    case 'POST':
        if (!is_array($input) || empty(trim($input['title'] ?? ''))) {
            http_response_code(400);
            echo json_encode([
                "status" => "error",
                "message" => "Bad Request: 'title' is required and payload must be valid JSON"
            ]);
            exit();
        }

        $title       = trim($input['title']);
        $description = trim($input['description'] ?? '');
        $category    = in_array($input['category'] ?? '', ['Personal', 'Shared']) ? $input['category'] : 'Personal';
        $notify_time = !empty($input['notify_time']) ? $input['notify_time'] : null;

        $stmt = $conn->prepare("INSERT INTO todos (title, description, category, notify_time) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssss", $title, $description, $category, $notify_time);

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode([
                "status" => "success",
                "message" => "Todo created successfully",
                "data" => [
                    "id" => $stmt->insert_id,
                    "title" => $title,
                    "description" => $description,
                    "category" => $category,
                    "notify_time" => $notify_time
                ]
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Failed to create todo"]);
        }
        break;

    // PUT / PATCH: Update tugas atau ubah status selesai
    case 'PUT':
    case 'PATCH':
        if ($id === null) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Bad Request: 'id' query parameter is required"]);
            exit();
        }

        // Cek apakah data dengan ID tersebut ada (404 jika tidak ada)
        $check = $conn->prepare("SELECT * FROM todos WHERE id = ?");
        $check->bind_param("i", $id);
        $check->execute();
        $existing = $check->get_result()->fetch_assoc();

        if (!$existing) {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Todo with ID $id not found"]);
            exit();
        }

        if (!is_array($input)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Bad Request: Invalid JSON body"]);
            exit();
        }

        // Gabung data lama dengan field baru yang dikirim (mendukung PATCH parsial & PUT penuh)
        $title       = isset($input['title']) ? trim($input['title']) : $existing['title'];
        $description = isset($input['description']) ? trim($input['description']) : $existing['description'];
        $category    = isset($input['category']) && in_array($input['category'], ['Personal', 'Shared']) ? $input['category'] : $existing['category'];
        $is_done     = isset($input['is_done']) ? intval($input['is_done']) : ($existing['is_done'] ?? 0);

        if (empty($title)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Bad Request: 'title' cannot be empty"]);
            exit();
        }

        $stmt = $conn->prepare("UPDATE todos SET title = ?, description = ?, category = ?, is_done = ? WHERE id = ?");
        $stmt->bind_param("sssii", $title, $description, $category, $is_done, $id);

        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode([
                "status" => "success",
                "message" => "Todo updated successfully",
                "data" => [
                    "id" => $id,
                    "title" => $title,
                    "description" => $description,
                    "category" => $category,
                    "is_done" => $is_done
                ]
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Failed to update todo"]);
        }
        break;

    // DELETE: Hapus tugas berdasarkan ID
    case 'DELETE':
        if ($id === null) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Bad Request: 'id' query parameter is required"]);
            exit();
        }

        $check = $conn->prepare("SELECT id FROM todos WHERE id = ?");
        $check->bind_param("i", $id);
        $check->execute();
        if ($check->get_result()->num_rows === 0) {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Todo with ID $id not found"]);
            exit();
        }

        $stmt = $conn->prepare("DELETE FROM todos WHERE id = ?");
        $stmt->bind_param("i", $id);

        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Todo with ID $id deleted successfully"]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Failed to delete todo"]);
        }
        break;

    // Method Tidak Didukung (405 Method Not Allowed)
    default:
        http_response_code(405);
        echo json_encode([
            "status" => "error",
            "message" => "Method $method Not Allowed"
        ]);
        break;
}
?>