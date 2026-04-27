const express = require('express');
const path = require('path');

const app = express();

// Middleware
app.use(express.static(path.join(__dirname)));
app.use(express.json());

// Datos falsos (simulando menú)
const menu = [
  { id: 1, nombre: "Hamburguesa", precio: 5 },
  { id: 2, nombre: "Pizza", precio: 8 },
  { id: 3, nombre: "Refresco", precio: 2 }
];

// Ruta API sin base de datos
app.get('/api/menu', (req, res) => {
  res.json(menu);
});

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});