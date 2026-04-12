<?php
include("conexion.php");
header('Content-Type: application/json; charset=utf-8');
$response = ['success' => false, 'message' => 'Datos incorrectos.'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    if ($email === '' || $password === '') {
        $response['message'] = 'Ingrese correo y contraseña.';
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        exit;
    }

    $stmt = $conn->prepare('SELECT id, nombre, password, image_path FROM usuarios WHERE email = ? LIMIT 1');
    if (!$stmt) {
        $response['message'] = 'Error de base de datos.';
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        exit;
    }

    $stmt->bind_param('s', $email);
    $stmt->execute();
    $stmt->bind_result($id, $nombre, $hash, $imagePath);

    if ($stmt->fetch()) {
        if (password_verify($password, $hash)) {
            $response = [
                'success' => true,
                'user' => [
                    'id' => $id,
                    'name' => $nombre,
                    'email' => $email,
                    'imageUrl' => $imagePath ?: 'imagenes/Logo.jpg'
                ]
            ];
        } else {
            $response['message'] = 'Contraseña incorrecta.';
        }
    } else {
        $response['message'] = 'No existe una cuenta con ese correo.';
    }

    $stmt->close();
}

echo json_encode($response, JSON_UNESCAPED_UNICODE);
$conn->close();
