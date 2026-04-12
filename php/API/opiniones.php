<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');
// Conexion Con la base de datos
include_once('../conexion.php');
// Obtener el método de la solicitud
$method = $_SERVER['REQUEST_METHOD'];
$response = [];
// Manejar la solicitud según el método
if ($method === 'GET') {
    $query = "SELECT * FROM opiniones ORDER BY fecha_registro DESC"; // Ajusta el nombre de la tabla según la base de datos
    $result = $conn->query($query);
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    $response = ['success' => true, 'data' => $data];
}  
elseif ($method === 'POST') {
    $input = json_decode(file_get_contents("php://input"), true); //para recibir en json
    if (!$input) $input = $_POST;
    // validar y sanitizar los datos recibidos
    $nombre = $input['nombre'] ?? '';
    $apellido = $input['apellido'] ?? '';
    $comentario = $input['comentario'] ?? '';
    // preparar y ejecutar la cosulta
    $stmt = $conn->prepare("INSERT INTO opiniones (nombre, apellido, comentario) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $nombre, $apellido, $comentario);
    // ejecutar la cosulta y verificar el resultado
    if ($stmt->execute()) {
        $response = ['success' => true, 'message' => 'Opinión registrada correctamente'];
    } else {
        $response = ['success' => false, 'message' => 'Error al guardar opinión'];
    }
} // Fin del metodo POST
else {
    http_response_code(405);
    $response = ['success' => false, 'message' => 'Método no permitido'];
}
// cerrar la conexión
echo json_encode($response);
?>