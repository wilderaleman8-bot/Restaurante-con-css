<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');
// conexión a la base de datos
include_once('../conexion.php');

$method = $_SERVER['REQUEST_METHOD'];
$response = [];
// manejar diferentes métodos HTTP
if ($method === 'GET') {
    $query = "SELECT * FROM pedidos ORDER BY fecha DESC";
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
    $detalle = $input['detalle'] ?? '';
    $total = $input['total'] ?? 0;
    $metodo_pago = $input['metodo_pago'] ?? '';
    $fecha = $input['fecha'] ?? date('Y-m-d');
    // preparar y ejecutar la cosulta
    $stmt = $conn->prepare("INSERT INTO pedidos (detalle, total, metodo_pago, fecha) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("sdss", $detalle, $total, $metodo_pago, $fecha);
    // ejecutar la cosulta y verificar el resultado
    if ($stmt->execute()) {
        $response = ['success' => true, 'message' => 'Pedido registrado correctamente'];
    } else {
        $response = ['success' => false, 'message' => 'Error al guardar pedido'];
    }
} // Fin del POST
else {
    http_response_code(405);
    $response = ['success' => false, 'message' => 'Método no permitido'];
}
// cerrar la conexión
echo json_encode($response);
?>