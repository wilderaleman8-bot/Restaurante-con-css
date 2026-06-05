// ─── Dependencias externas ──────────────────────────────────────────
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// ─── Rutas locales de la API ────────────────────────────────────────
const usuariosRoutes = require('./routes/usuarios');
const reservasRoutes = require('./routes/reservas');
const pedidosRoutes = require('./routes/pedidos');
const opinionesRoutes = require('./routes/opiniones');
const valoracionesRoutes = require('./routes/valoraciones');
const adminRoutes = require('./routes/admin');
const platillosRoutes = require('./routes/platillos');
const passwordResetRoutes = require('./routes/password-reset');
const uploadRoutes = require('./routes/upload');

const path = require('path');
const fs = require('fs');

['uploads', 'uploads/menu'].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const app = express();

// ─── Middlewares globales ───────────────────────────────────────────

// Helmet CSP: define qué orígenes y recursos puede cargar el navegador
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "http://localhost:3000", "https://localhost:3000", "cdnjs.cloudflare.com", "cdn.jsdelivr.net", "cdn.socket.io", "ws:", "wss:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com", "cdn.jsdelivr.net", "cdn.socket.io"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      imgSrc: ["*", "data:"],
      fontSrc: ["'self'", "data:", "fonts.gstatic.com"],
    },
  },
}));
app.use(morgan('dev')); // Logging de peticiones HTTP

// Rate limit: máximo 100 peticiones por 15 minutos en /api/
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas peticiones. Intenta de nuevo en 15 minutos.' }
});
app.use('/api/', limiter);

// Rate limit específico para login: máximo 5 intentos por minuto
const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { error: 'Demasiados intentos de inicio de sesión. Intenta de nuevo en 1 minuto.' }
});
app.use('/api/usuarios/login', loginLimiter);

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
const corsOrigins = corsOrigin.split(',').map(s => s.trim());
app.use(cors({ credentials: true, origin: corsOrigins }));
app.use(compression());                    // Comprime respuestas con gzip
app.use(express.json());                   // Parsea JSON del cuerpo de la petición
app.use(express.urlencoded({ extended: true }));
app.use(require('cookie-parser')());

// ─── Archivos estáticos ─────────────────────────────────────────────
// Se sirven con caché de 7 días para mejorar rendimiento
const cacheOptions = { maxAge: '7d', immutable: true };
app.use('/uploads/menu', express.static('uploads/menu', cacheOptions));
app.use('/uploads', express.static('uploads', cacheOptions));
app.use(express.static('public', cacheOptions));

// Ruta raíz: sirve el index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ─── Rutas de la API ────────────────────────────────────────────────
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/opiniones', opinionesRoutes);
app.use('/api/valoraciones', valoracionesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/platillos', platillosRoutes);
app.use('/api/password-reset', passwordResetRoutes);
app.use('/api/upload', uploadRoutes);

// ─── 404: rutas no encontradas ──────────────────────────────────────
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Endpoint no encontrado' });
  }
  res.status(404).sendFile(path.join(__dirname, '../public/404.html'));
});

// ─── Manejador global de errores ────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'La imagen no puede exceder 5 MB' });
  }
  if (err.message === 'Solo se permiten archivos de imagen') {
    return res.status(400).json({ error: err.message });
  }
  if (err.name === 'MulterError') {
    return res.status(400).json({ error: `Error al subir archivo: ${err.message}` });
  }
  res.status(500).json({ error: 'Error interno del servidor' });
});

// ─── Servidor HTTP + WebSockets ─────────────────────────────────────
const port = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: corsOrigins } });

  io.on('connection', (socket) => {
    console.log('🔌 Admin conectado:', socket.id);
    socket.on('disconnect', () => console.log('🔌 Admin desconectado:', socket.id));
  });

  app.set('io', io);

  server.listen(port, () => {
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
