// filepath: c:\xampp\htdocs\Restaurante con-css\server.js
const mysql = require('mysql2');

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

// Ejemplo de consulta
app.get('/api/menu', (req, res) => {
  connection.query('SELECT * FROM menu', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});