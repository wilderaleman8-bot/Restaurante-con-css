<?php
$servername = "localhost";
$username = "root"; // usuario por defecto de XAMPP
$password = ""; // sin contraseña por defecto
$dbname = "restaurante_db"; // La base de dato

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Error de conexión: " . $conn->connect_error);
}
?>
