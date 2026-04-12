<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');
// Conexión a la base de datos
include_once('../conexion.php');
// Obtener el método de la solicitud
$method = $_SERVER['REQUEST_METHOD'];
$response = [];
// Manejar la solicitud según el método
if ($method === 'GET') {
    $query = "SELECT * FROM valoraciones ORDER BY fecha_registro DESC";
    $result = $conn->query($query);
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    $response = ['success' => true, 'data' => $data];
}// Manejar solicitud POST para agregar una nueva valoración
elseif ($method === 'POST') {
    $input = json_decode(file_get_contents("php://input"), true);
    if (!$input) $input = $_POST;
    // validar y sanitizar los datos de entrada
    $nombre = $input['nombre'] ?? '';
    $apellido = $input['apellido'] ?? '';
    $puntuacion = $input['puntuacion'] ?? null;
    $calificacion = $input['calificacion'] ?? '';
    $comentario = $input['comentario'] ?? '';
    // Validaciones básicas
    $stmt = $conn->prepare("INSERT INTO valoraciones (nombre, apellido, puntuacion, calificacion, comentario) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("ssiss", $nombre, $apellido, $puntuacion, $calificacion, $comentario);
    // Ejecutar la consultas
    if ($stmt->execute()) {
        $response = ['success' => true, 'message' => 'Valoración registrada correctamente'];
    } else {
        $response = ['success' => false, 'message' => 'Error al guardar valoración'];
    }
}   // Manejar otros métodos no permitidos
else {
    http_response_code(405);
    $response = ['success' => false, 'message' => 'Método no permitido'];
}

echo json_encode($response);
?>