// Importaciones de dependencias externas
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Importaciones de rutas locales
const usuariosRoutes = require('./routes/usuarios');
const reservasRoutes = require('./routes/reservas');
const pedidosRoutes = require('./routes/pedidos');
const opinionesRoutes = require('./routes/opiniones');
const valoracionesRoutes = require('./routes/valoraciones');

const path = require('path');

const app = express();

// Middlewares de seguridad y logging
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "cdnjs.cloudflare.com", "cdn.jsdelivr.net"],
      scriptSrc: ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com", "cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      imgSrc: ["'self'", "data:"],
      fontSrc: ["'self'", "data:", "fonts.gstatic.com"],
    },
  },
}));
app.use(morgan('dev'));

// Límite de peticiones para evitar abusos
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas peticiones. Intenta de nuevo en 15 minutos.' }
});
app.use('/api/', limiter);

app.use(cors());               // Permite peticiones desde otros dominios
app.use(compression());        // Comprime las respuestas para mejorar velocidad
app.use(express.json());       // Parsea cuerpos JSON en las peticiones

// Archivos estáticos con caché de 7 días
const cacheOptions = { maxAge: '7d', immutable: true };
app.use('/uploads', express.static('uploads', cacheOptions));
app.use(express.static('public', cacheOptions));

// Ruta raíz: sirve el index.html del frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Montaje de rutas de la API
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/opiniones', opinionesRoutes);
app.use('/api/valoraciones', valoracionesRoutes);

// Manejo de rutas no encontradas (404)
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Endpoint no encontrado' });
  }
  res.status(404).sendFile(path.join(__dirname, '../public/404.html'));
});

// Manejo global de errores del servidor
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Inicio del servidor
const port = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(port, () => {
    console.log(`Backend escuchando en puerto ${port}`);
  });

  // Manejo de error cuando el puerto ya está en uso
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
