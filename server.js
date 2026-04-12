const express = require('express');
const path = require('path');
const mysql = require('mysql2');

const app = express();

// Configuración de la conexión a MySQL (XAMPP)
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',  // usuario de XAMPP
  password: '',  // contraseña (vacía por defecto)
  database: 'restaurante_db'  // nombre de la DB en XAMPP
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Conectado a MySQL');
});

// Middleware para servir archivos estáticos (HTML, CSS, imágenes)
app.use(express.static(path.join(__dirname)));

// Middleware para parsear JSON
app.use(express.json());

// Ejemplo de consulta
app.get('/api/menu', (req, res) => {
  connection.query('SELECT * FROM menu', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Ruta raíz para servir index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Puerto
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});