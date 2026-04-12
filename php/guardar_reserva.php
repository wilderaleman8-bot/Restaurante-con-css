<?php
include("conexion.php");

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $nombre   = $_POST["nombre"] ?? '';
    $apellido = $_POST["apellido"] ?? '';
    $personas = $_POST["personas"] ?? '';
    $fecha    = $_POST["fecha"] ?? '';
    $mensaje  = $_POST["mensaje"] ?? '';

    // Validar datos básicos
    if (empty($nombre) || empty($apellido) || empty($personas) || empty($fecha)) {
        echo "<script>
                alert('❌ Por favor completa todos los campos obligatorios.');
                window.history.back();
              </script>";
        exit;
    }

    // Insertar en la base de datos
    $sql = "INSERT INTO reservas (nombre, apellido, personas, fecha, mensaje)
            VALUES ('$nombre', '$apellido', '$personas', '$fecha', '$mensaje')";

    if ($conn->query($sql) === TRUE) {
        echo "<script>
                alert('✅ ¡Reserva realizada con éxito!');
                window.location.href='../reservas.html';
              </script>";
    } else {
        echo "<script>
                alert('❌ Error al guardar la reserva: " . $conn->error . "');
                window.history.back();
              </script>";
    }

    $conn->close();
}
?>
