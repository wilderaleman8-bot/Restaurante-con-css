<?php
include("conexion.php");
header('Content-Type: application/json; charset=utf-8');
$response = ['success' => false, 'message' => 'Error inesperado.'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nombre = trim($_POST['nombre'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirmPassword = $_POST['confirm_password'] ?? '';

    if ($nombre === '' || $email === '' || $password === '' || $confirmPassword === '') {
        $response['message'] = 'Completa todos los campos.';
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $response['message'] = 'Correo no válido.';
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($password !== $confirmPassword) {
        $response['message'] = 'Las contraseñas no coinciden.';
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        exit;
    }

    $stmt = $conn->prepare('SELECT id FROM usuarios WHERE email = ? LIMIT 1');
    if (!$stmt) {
        $response['message'] = 'Error de base de datos.';
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        exit;
    }
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $stmt->store_result();
    if ($stmt->num_rows > 0) {
        $response['message'] = 'Ya existe una cuenta con ese correo.';
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        $stmt->close();
        exit;
    }
    $stmt->close();

    $uploadDir = __DIR__ . '/../imagenes/usuarios/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $imagePath = 'imagenes/Logo.jpg';
    if (!empty($_FILES['imagen']['name']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
        $allowedTypes = ['image/jpeg' => 'jpg', 'image/png' => 'png'];
        $fileType = $_FILES['imagen']['type'];
        if (isset($allowedTypes[$fileType])) {
            $extension = $allowedTypes[$fileType];
            $fileName = uniqid('user_', true) . '.' . $extension;
            $fullPath = $uploadDir . $fileName;
            if (move_uploaded_file($_FILES['imagen']['tmp_name'], $fullPath)) {
                $imagePath = 'imagenes/usuarios/' . $fileName;
            }
        }
    }

    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $conn->prepare('INSERT INTO usuarios (nombre, email, password, image_path, fecha_creado) VALUES (?, ?, ?, ?, NOW())');
    if (!$stmt) {
        $response['message'] = 'Error al preparar la cuenta.';
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        exit;
    }

    $stmt->bind_param('ssss', $nombre, $email, $hashedPassword, $imagePath);
    if ($stmt->execute()) {
        $response = [
            'success' => true,
            'message' => 'Cuenta creada correctamente.',
            'user' => [
                'id' => $stmt->insert_id,
                'name' => $nombre,
                'email' => $email,
                'imageUrl' => $imagePath
            ]
        ];
    } else {
        $response['message'] = 'Error al guardar la cuenta: ' . $stmt->error;
    }
    $stmt->close();
}

echo json_encode($response, JSON_UNESCAPED_UNICODE);
$conn->close();
