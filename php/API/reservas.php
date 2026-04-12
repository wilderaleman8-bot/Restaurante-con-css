<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');
//conexión a la base de datos
include_once('../conexion.php');
// Obtener el método de la solicitud
$method = $_SERVER['REQUEST_METHOD'];
$response = [];
// manejar diferentes métodos HTTP
if ($method === 'GET') {
    $query = "SELECT * FROM reservas ORDER BY fecha_registro DESC";
    $result = $conn->query($query);
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    $response = ['success' => true, 'data' => $data];
}
elseif ($method === 'POST') {
    $input = json_decode(file_get_contents("php://input"), true);
    if (!$input) $input = $_POST;
    // Validar y sanitizar los datos de entrada
    $nombre = $input['nombre'] ?? '';
    $apellido = $input['apellido'] ?? '';
    $email = $input['email'] ?? '';
    $telefono = $input['telefono'] ?? '';
    $fecha = $input['fecha'] ?? null;
    $hora = $input['hora'] ?? null;
    $personas = $input['personas'] ?? null;
    $mensaje = $input['mensaje'] ?? '';
    // Preparar y ejecutar la consulta de inserción
    $stmt = $conn->prepare("INSERT INTO reservas (nombre, apellido, email, telefono, fecha, hora, personas, mensaje) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssssis", $nombre, $apellido, $email, $telefono, $fecha, $hora, $personas, $mensaje);
    // Ejecutar la consulta y Verificar el resultado
    if ($stmt->execute()) {
        $response = ['success' => true, 'message' => 'Reserva registrada correctamente'];
    } else {
        $response = ['success' => false, 'message' => 'Error al guardar reserva'];
    }
}   // Manejar métodos no permitidos
else {
    http_response_code(405);
    $response = ['success' => false, 'message' => 'Método no permitido'];
}

echo json_encode($response);
?>