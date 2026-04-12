API PHP para Restaurante (XAMPP + MySQL)
====================================================

Estructura:
php/api/
 ├── opiniones.php
 ├── pedidos.php
 ├── reservas.php
 ├── valoraciones.php
 └── README_API.txt

Uso:
-----
Cada archivo responde con JSON.

Ejemplo GET (listar):
  http://localhost/Restaurante%20con-css/php/api/opiniones.php

Ejemplo POST (agregar):
  URL: http://localhost/Restaurante%20con-css/php/api/opiniones.php
  Método: POST
  Cuerpo (JSON):
  {
    "nombre": "Wilder",
    "apellido": "Alemán",
    "comentario": "Excelente servicio"
  }

Cada endpoint funciona igual adaptado a su tabla.
