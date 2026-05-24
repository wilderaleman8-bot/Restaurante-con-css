# Sabores Ancestrales

Sitio web completo para restaurante nicaragüense con menú interactivo, carrito de compras, reservas, opiniones, valoraciones, panel admin y notificaciones en tiempo real.

---

## Tecnologías

### Backend
| Paquete | Versión | Uso |
|---------|---------|-----|
| `express` | ^4.18.2 | Servidor HTTP |
| `@supabase/supabase-js` | ^2.31.0 | Cliente Supabase (PostgreSQL) |
| `bcrypt` | ^6.0.0 | Encriptación de contraseñas |
| `jsonwebtoken` | ^9.0.3 | JWT para autenticación |
| `helmet` | ^8.1.0 | Seguridad HTTP (CSP, etc.) |
| `cors` | ^2.8.5 | CORS |
| `compression` | ^1.8.1 | Compresión gzip |
| `morgan` | ^1.10.1 | Logging de peticiones |
| `express-rate-limit` | ^8.5.2 | Límite de peticiones |
| `multer` | ^2.1.1 | Subida de archivos |
| `nodemailer` | ^8.0.7 | Envío de correos |
| `socket.io` | ^4.8.3 | WebSockets en tiempo real |
| `sharp` | ^0.34.5 | Procesamiento de imágenes |
| `dotenv` | ^16.6.1 | Variables de entorno |
| `date-fns` | ^4.1.0 | Manejo de fechas |
| `express-validator` | ^7.3.2 | Validación de formularios |

### Frontend
- HTML5 semántico, CSS3 con custom properties
- JavaScript vanilla (sin frameworks)
- Google Fonts: Playfair Display + Poppins (vía `@import` en CSS)
- Supabase JS Client — `cdn.jsdelivr.net/npm/@supabase/supabase-js`
- Socket.io Client — `cdn.socket.io/4.7.5/socket.io.min.js` (panel admin)
- jsPDF — `cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js` (ticket PDF en pedidos)

### Base de datos
- **Supabase** (PostgreSQL)
- RLS deshabilitado — la autenticación se maneja desde el backend con JWT

---

## Estructura del proyecto

```
restaurante-con-css/
├── src/                          # Backend (Express)
│   ├── app.js                    # Punto de entrada, middlewares, rutas, WebSocket
│   ├── lib/
│   │   └── supabaseClient.js     # Cliente de Supabase
│   ├── middlewares/
│   │   ├── auth.js               # JWT: generarToken, verificarToken, verificarAdmin
│   │   └── upload.js             # Multer: configuración de subida de imágenes
│   ├── controllers/              # Lógica de negocio separada de rutas
│   │   ├── usuariosController.js
│   │   ├── platillosController.js
│   │   ├── pedidosController.js
│   │   ├── reservasController.js
│   │   ├── opinionesController.js
│   │   ├── valoracionesController.js
│   │   ├── adminController.js
│   │   ├── uploadController.js
│   │   └── passwordResetController.js
│   ├── routes/                   # Rutas delgadas, solo definen endpoints
│   │   ├── usuarios.js
│   │   ├── platillos.js
│   │   ├── pedidos.js
│   │   ├── reservas.js
│   │   ├── opiniones.js
│   │   ├── valoraciones.js
│   │   ├── admin.js
│   │   ├── upload.js
│   │   └── password-reset.js
│   ├── services/
│   │   └── email.js              # Nodemailer (Ethereal dev / SMTP real)
│   └── utils/
│       └── validation.js         # Validaciones reutilizables (email, nombre)
├── public/                       # Frontend (estático)
│   ├── index.html                # Landing page
│   ├── menu.html                 # Menú interactivo con carrito y pedido
│   ├── reservas.html             # Formulario de reserva con selector de hora
│   ├── login.html                # Inicio de sesión
│   ├── registro.html             # Registro de usuarios
│   ├── opiniones.html            # Dejar opinión
│   ├── valoracion.html           # Valoración con estrellas
│   ├── informacion.html          # Información del restaurante
│   ├── solicitar-reset.html      # Solicitar recuperación de contraseña
│   ├── resetear-password.html    # Restablecer contraseña
│   ├── 404.html                  # Página personalizada de error
│   ├── template.html             # Template para nuevas páginas
│   ├── admin/                    # Panel de administración
│   │   ├── index.html            # Dashboard con estadísticas
│   │   ├── pedidos.html          # Gestión de pedidos
│   │   ├── reservas.html         # Gestión de reservas
│   │   ├── menu.html             # CRUD del menú (con subida de imágenes)
│   │   ├── app.js                # JS compartido del admin
│   │   └── style.css             # Estilos del admin
│   ├── css/
│   │   └── style.css             # Estilos globales del frontend
│   ├── js/
│   │   ├── app.js                # Lógica frontend (login, registro, API, etc.)
│   │   └── supabase.js           # Inicialización de Supabase cliente
│   └── imagenes/                 # Imágenes del sitio (70+ archivos)
├── uploads/                      # Imágenes subidas por usuarios
│   ├── menu/                     # Imágenes de platillos (subidas desde admin)
│   └── profile-*.jpg             # Fotos de perfil
├── supabase_tables.sql           # Esquema completo de la base de datos
├── .env.example                  # Variables de entorno de ejemplo
├── package.json
└── README.md
```

---

## Instalación y ejecución

```bash
# 1. Clonar el repositorio
git clone <https://github.com/wilderaleman8-bot/Restaurante-con-css>
cd restaurante-con-css

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase

# 4. Crear las tablas en Supabase
# Abrir Supabase Dashboard → SQL Editor y pegar el contenido de supabase_tables.sql

# 5. Iniciar el servidor
npm run dev    # desarrollo (con nodemon)
# o
npm start      # producción
```

El servidor arranca en `http://localhost:3000`.

---

## Variables de entorno (.env)

| Variable | Obligatorio | Descripción |
|----------|-------------|-------------|
| `SUPABASE_URL` | ✅ | URL del proyecto Supabase |
| `SUPABASE_KEY` | ✅ | Anon key de Supabase |
| `JWT_SECRET` | ✅ | Secreto para firmar tokens JWT |
| `PORT` | ❌ | Puerto del servidor (default: 3000) |
| `APP_URL` | ❌ | URL pública (para enlaces en correos). Si no se define, se detecta automáticamente |
| `SMTP_HOST` | ❌ | Host SMTP para correos reales. Si no se define, usa Ethereal (pruebas) |
| `SMTP_PORT` | ❌ | Puerto SMTP (default: 587) |
| `SMTP_SECURE` | ❌ | `true` si usa SSL/TLS |
| `SMTP_USER` | ❌ | Usuario SMTP |
| `SMTP_PASS` | ❌ | Contraseña SMTP |
| `SMTP_FROM` | ❌ | Dirección "De" en los correos |

---

## API Endpoints

### Usuarios
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/usuarios/registro` | — | Registrar usuario (multipart: nombre, email, password, image) |
| POST | `/api/usuarios/login` | — | Iniciar sesión, devuelve JWT |
| GET | `/api/usuarios` | Admin | Listar todos los usuarios |

### Menú (Platillos)
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/platillos` | — | Platillos activos (público) |
| GET | `/api/platillos/admin` | Admin | Todos los platillos (activos e inactivos) |
| POST | `/api/platillos` | Admin | Crear platillo |
| PUT | `/api/platillos/:id` | Admin | Actualizar platillo |
| DELETE | `/api/platillos/:id` | Admin | Desactivar platillo (soft delete) |
| POST | `/api/platillos/seed` | Admin | Poblar base de datos con datos iniciales |

### Pedidos
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/pedidos` | — | Crear pedido (detalle[], total, metodo_pago, etc.) |
| GET | `/api/pedidos` | — | Listar todos los pedidos |
| PATCH | `/api/pedidos/:id` | Token | Cambiar estado del pedido |

### Reservas
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/reservas` | — | Crear reserva (nombre, apellido, personas, fecha, mensaje) |
| GET | `/api/reservas` | — | Listar reservas |

### Opiniones y Valoraciones
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/opiniones` | — | Crear opinión |
| GET | `/api/opiniones` | — | Listar opiniones |
| POST | `/api/valoraciones` | — | Crear valoración (1-5) |
| GET | `/api/valoraciones` | — | Listar valoraciones |

### Admin
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/admin/pedidos` | Admin | Pedidos con datos del usuario |
| PATCH | `/api/admin/pedidos/:id` | Admin | Cambiar estado del pedido |
| GET | `/api/admin/reservas` | Admin | Listar reservas |
| GET | `/api/admin/usuarios` | Admin | Listar usuarios |
| GET | `/api/admin/valoraciones` | Admin | Estadísticas de valoraciones |

### Otros
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/upload` | Admin | Subir imagen para platillo |
| POST | `/api/password-reset/solicitar` | — | Solicitar restablecimiento de contraseña |
| POST | `/api/password-reset/verificar` | — | Verificar token de reseteo |
| POST | `/api/password-reset/cambiar` | — | Cambiar contraseña con token |

---

## Base de datos (Supabase)

### Tablas

| Tabla | Descripción |
|-------|-------------|
| `usuarios` | Usuarios (id, nombre, email, password, image_path, rol, created_at) |
| `password_reset_tokens` | Tokens de recuperación de contraseña |
| `platillos` | Platillos del menú (category, subcategory, name, description, price, currency, image, active, order) |
| `reservas` | Reservas (nombre, apellido, personas, fecha_reserva, mensaje) |
| `opiniones` | Opiniones de clientes (nombre, apellido, comentario) |
| `valoraciones` | Valoraciones numéricas (calificacion 1-5, comentario) |
| `pedidos` | Pedidos (detalle JSONB, total, metodo_pago, card_last4, card_brand, status) |

> **Nota:** RLS está habilitado en Supabase con políticas para permitir registro y consulta anónima en la tabla `usuarios`. La autenticación y autorización se manejan desde el backend con JWT + bcrypt.

### Roles de usuario
- `cliente` — Usuario normal (puede hacer pedidos, reservas, opiniones, valoraciones)
- `admin` — Acceso al panel de administración en `/admin/`

---

## Características principales

### Frontend público
- **Landing page** con hero, historia, testimonios dinámicos, valoraciones agregadas, tarjeta del mapa, enlaces a redes sociales, botón "volver arriba"
- **Menú interactivo** con 4 categorías (entradas, platos principales, postres, bebidas), subcategorías para bebidas, búsqueda en vivo, carrito de compras con cálculo de IVA (15%), formulario de pago con detección de marca de tarjeta, ticket PDF, historial de pedidos del usuario
- **Reservas** con selector de fecha y hora (grid visual de 9 AM a 12 PM), máximo 15 personas. Las horas se envían con zona horaria local para evitar desfases al visualizarlas
- **Valoraciones** con sistema de estrellas (1-5) y comentario
- **Opiniones** de clientes
- **Recuperación de contraseña** con enlace por correo
- **Diseño responsive** con animaciones de scroll (IntersectionObserver)

### Panel de administración (`/admin/`)
- **Dashboard** con estadísticas en tiempo real (pedidos hoy, pendientes, reservas hoy, total usuarios), últimos pedidos, acciones rápidas. Auto-refresh cada 30 segundos
- **Pedidos** — Lista completa, filtro por cliente y estado, cambio de estado (pendiente → preparando → servido / cancelado)
- **Reservas** — Lista con búsqueda, muestra fecha y hora
- **Menú** — CRUD completo: crear, editar, desactivar/activar platillos, subir imágenes, sincronizar desde datos precargados
- **Notificaciones en tiempo real** vía WebSocket (socket.io): toast al recibir nuevo pedido, nueva reserva o cambio de estado

### Seguridad
- Helmet CSP para prevenir XSS
- Rate limiting (100 peticiones/15 minutos en `/api/`)
- Contraseñas encriptadas con bcrypt
- JWT con expiración de 7 días
- Validación de dominio de email (registro)

---

## Correos electrónicos

### Desarrollo (Ethereal)
Por defecto usa **Ethereal** (servicio de correos de prueba). Los correos no se entregan realmente, pero se genera una URL en la consola del servidor para verlos:

```
Correo de prueba (Ethereal) URL: https://ethereal.email/message/...
```

### Producción (SMTP real)
Configurar en `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-correo@gmail.com
SMTP_PASS=tu-contraseña-de-aplicacion
SMTP_FROM="Sabores Ancestrales" <tu-correo@gmail.com>
```

> Para Gmail necesitás una [contraseña de aplicación](https://myaccount.google.com/apppasswords).

### Flujos que envían correo
- Recuperación de contraseña (solicitar-reset → enlace con token)

---

## WebSockets (socket.io)

Los eventos en tiempo real se emiten desde el backend y el admin los recibe automáticamente:

| Evento | Cuándo | Datos |
|--------|--------|-------|
| `new-order` | Nuevo pedido creado | `{ id, total, metodo_pago, status }` |
| `order-status` | Cambio de estado del pedido | `{ id, status }` |
| `new-reservation` | Nueva reserva | `{ nombre, apellido, personas, fecha }` |

El admin muestra un toast con la notificación al instante, sin necesidad de recargar.

---

## Subida de imágenes

- **Fotos de perfil** → Se suben al registrarse, se guardan en `uploads/profile-*.jpg`
- **Imágenes de platillos** → Se suben desde el admin (menú → formulario → selector "O subir archivo"), se guardan en `uploads/menu/menu-*.jpg`
- Tamaño máximo: **5 MB**
- Formatos permitidos: solo imágenes

---

## Desarrollo

```bash
# Iniciar con recarga automática
npm run dev

# Iniciar en producción
npm start
```

El servidor se recarga automáticamente al modificar archivos del backend. Los cambios en archivos estáticos (`public/`) solo requieren recargar el navegador.


