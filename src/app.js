const express = require('express');
const cors = require('cors');

const usuariosRoutes = require('./routes/usuarios');
const reservasRoutes = require('./routes/reservas');
const pedidosRoutes = require('./routes/pedidos');
const opinionesRoutes = require('./routes/opiniones');
const valoracionesRoutes = require('./routes/valoraciones');

const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.use('/api/usuarios', usuariosRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/opiniones', opinionesRoutes);
app.use('/api/valoraciones', valoracionesRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const port = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(port, () => {
    console.log(`Backend escuchando en puerto ${port}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Error: el puerto ${port} ya está en uso. Cierra el proceso que lo ocupa o cambia el valor de PORT.`);
      process.exit(1);
    }
    console.error('Error del servidor:', error);
    process.exit(1);
  });
}

module.exports = app;
