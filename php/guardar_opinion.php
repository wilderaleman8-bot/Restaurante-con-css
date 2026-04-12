<?php
include("conexion.php");
// Guardar opinión en la base de datos
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $nombre   = $_POST["nombre"] ?? '';
    $apellido = $_POST["apellido"] ?? '';
    $comentario = $_POST["comentario"] ?? ''; 
    //validar que no esten vacios
    $sql = "INSERT INTO opiniones (nombre, apellido, comentario)
            VALUES ('$nombre', '$apellido', '$comentario')";
      // Ejecutar la consulta
    if ($conn->query($sql) === TRUE) {
        echo "<script>
                alert('✅ Opinión enviada correctamente');
                window.location.href='../opiniones.html';
              </script>";
    } else { // Manejo de errores
        echo "<script>
                alert('❌ Error al guardar la opinión: " . $conn->error . "');
                window.history.back();
              </script>";
    }  // cerrar la conexión
     
    $conn->close();
}
?>
