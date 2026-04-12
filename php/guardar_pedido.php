<?php
include("conexion.php"); // Conexión a la base de datos
// guaardar pedido
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $pedido = $_POST['pedido'] ?? '';
    $total = $_POST['total'] ?? '';
    $pago = $_POST['pago'] ?? '';
    $card_last4 = $_POST['card_last4'] ?? null;
    $card_exp = $_POST['card_exp'] ?? null;
    $card_brand = $_POST['card_brand'] ?? null;

    // validar que no esten vacios lo mínimo
    if (!empty($pedido) && $total !== '' && !empty($pago)) {
        $fecha = date("Y-m-d H:i:s");
        $total = floatval($total);
        $stmt = $conn->prepare("INSERT INTO pedidos (detalle, total, metodo_pago, card_last4, card_exp, card_brand, fecha) VALUES (?, ?, ?, ?, ?, ?, ?)");
        if ($stmt) {
            $stmt->bind_param('sdsssss', $pedido, $total, $pago, $card_last4, $card_exp, $card_brand, $fecha);
            if ($stmt->execute()) {
                echo "✅ Pedido guardado correctamente";
            } else {
                echo "Error al guardar: " . $stmt->error;
            }
            $stmt->close();
        } else {
            echo "Error de preparación: " . $conn->error;
        }
    } else {
        echo "❌ Datos incompletos.";
    }
}

$conn->close();
?>
