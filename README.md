# 🍽️ Sabores Ancestrales — Sistema Web para Restaurante

**Sabores Ancestrales** es una aplicación web completa para la gestión de un restaurante. Permite a los clientes explorar un menú interactivo, realizar pedidos con cálculo de IVA, descargar recibos en PDF, hacer reservas, dejar opiniones y valoraciones. Incluye autenticación de usuarios con JWT y un backend robusto sobre Supabase (PostgreSQL).


---

## 📦 Librerías utilizadas

### Backend (npm)

| Librería | Versión | Propósito |
|----------|---------|-----------|
| `express` | ^4.18.2 | Framework web para Node.js |
| `@supabase/supabase-js` | ^2.31.0 | Cliente de Supabase (PostgreSQL) |
| `bcrypt` | ^6.0.0 | Hashing de contraseñas |
| `jsonwebtoken` | ^9.0.3 | Generación y verificación de JWT |
| `multer` | ^2.1.1 | Subida de archivos (imágenes de perfil) |
| `sharp` | ^0.34.5 | Procesamiento y optimización de imágenes |
| `cors` | ^2.8.5 | Middleware de CORS |
| `compression` | ^1.8.1 | Compresión Gzip de respuestas |
| `dotenv` | ^16.6.1 | Carga de variables de entorno |

### Frontend (CDN)

| Librería | Versión | Propósito |
|----------|---------|-----------|
| **Font Awesome** | 6.4.0 | Iconos (menú, carrito, estrellas, etc.) |
| **jsPDF** | 2.5.1 | Generación de recibos PDF en el cliente |
| **@supabase/supabase-js** | última (UMD) | Cliente de Supabase para el frontend |

---

## 🚀 Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | HTML5 semántico, CSS3 moderno (Flexbox/Grid), JavaScript vanilla (ES6+) |
| **Backend** | Node.js + Express.js |
| **Base de datos** | Supabase (PostgreSQL) con UUIDs y constraints |
| **Autenticación** | JWT (jsonwebtoken) + bcrypt (salt rounds: 10) |
| **PDF** | jsPDF + jspdf-autotable (generación 100% cliente) |
| **Subida de archivos** | Multer (máx 5 MB, imágenes de perfil) |

---

## 📁 Estructura del proyecto

```
restaurante-con-css/
├── public/                      # Frontend estático
│   ├── index.html               # Página de inicio / landing page
│   ├── menu.html                # Menú interactivo + carrito + PDF + historial
│   ├── login.html               # Inicio de sesión y registro de usuarios
│   ├── reservas.html            # Formulario de reservas
│   ├── opiniones.html           # Formulario de opiniones
│   ├── valoracion.html          # Valoraciones con sistema de estrellas (1-5)
│   ├── informacion.html         # Página "Sobre nosotros"
│   ├── css/
│   │   └── style.css            # Estilos globales del sitio
│   └── js/
│       ├── app.js               # Lógica compartida (auth, toast, API calls, loading)
│       └── supabase.js          # Cliente de Supabase para el frontend
│
├── src/                         # Backend (Node.js + Express)
│   ├── app.js                   # Entrypoint: configura Express, middlewares, rutas
│   ├── lib/
│   │   └── supabaseClient.js    # Cliente de Supabase (desde variables de entorno)
│   ├── middleware/
│   │   └── auth.js              # JWT: generarToken(), verificarToken()
│   └── routes/
│       ├── usuarios.js          # POST /registro, POST /login, GET /
│       ├── pedidos.js           # POST /, GET /, PATCH /:id (protegido con JWT)
│       ├── reservas.js          # POST /, GET /
│       ├── opiniones.js         # POST /, GET /
│       └── valoraciones.js      # POST /, GET /
│
├── supabase_tables.sql          # Esquema completo de la base de datos
├── uploads/                     # Imágenes de perfil subidas por los usuarios
├── .env                         # Variables de entorno (no se comitea)
├── package.json
└── README.md
```

---

## ✨ Funcionalidades

### 👤 Módulo de Usuarios
- **Registro** con nombre, email, contraseña y foto de perfil opcional (subida con Multer, máx 5 MB)
- **Login** con generación de JWT (expiración: 7 días)
- **Seguridad**: contraseñas hasheadas con bcrypt antes de almacenar en Supabase
- **Sesión persistente**: el token se guarda en `localStorage` y se adjunta automáticamente en peticiones autenticadas
- Endpoints: `POST /api/usuarios/registro`, `POST /api/usuarios/login`, `GET /api/usuarios`

### 🍕 Menú Interactivo
- **5 categorías**: Entradas, Platos fuertes, Postres, Bebidas, Cervezas
- **Búsqueda en tiempo real**: filtra platillos por nombre o descripción mientras el usuario escribe
- **Carrito de compras inteligente**:
  - Cálculo automático de subtotal, IVA (15% — tasa de Nicaragua) y total
  - Persistencia en `localStorage` (no se pierde al recargar la página)
  - Botón flotante con badge contador de artículos
  - Interfaz tipo modal con lista de items, cantidades y totales
- **Pago con tarjeta**: detección automática de marca (Visa, MasterCard, American Express, Discover)

### 📦 Pedidos
- Creación de pedidos con detalle (items como JSON), total, método de pago y datos de tarjeta
- Cada pedido recibe un **UUID real** desde la base de datos
- **Historial de pedidos** visible en la misma página del menú
- **Estados**: `pendiente` → `preparando` → `servido` / `cancelado`
- Endpoints:
  - `POST /api/pedidos` — crear pedido
  - `GET /api/pedidos` — listar todos (ordenados por fecha descendente)
  - `PATCH /api/pedidos/:id` — actualizar estado (requiere JWT)

### 📄 Generación de PDF
- Descarga de recibo/factura con:
  - Logo del restaurante
  - Datos del cliente (nombre, email)
  - Lista de items con cantidades y precios
  - Subtotal, IVA 15% y total
- Generado 100% en el cliente con **jsPDF**
- El recibo se conserva en memoria incluso después de enviar el pedido

### 📅 Reservas
- Formulario con: nombre, apellido, número de personas, fecha y mensaje opcional
- Validación en frontend y backend
- Endpoints: `POST /api/reservas`, `GET /api/reservas`

### 💬 Opiniones
- Los usuarios pueden dejar comentarios sobre el restaurante
- Asociadas opcionalmente a un usuario registrado
- Endpoints: `POST /api/opiniones`, `GET /api/opiniones`

### ⭐ Valoraciones
- Sistema de calificación de 1 a 5 estrellas
- Comentario opcional
- Endpoints: `POST /api/valoraciones`, `GET /api/valoraciones`

### 🔒 Seguridad
- Contraseñas hasheadas con **bcrypt** (salt rounds: 10)
- **JWT** para proteger endpoints sensibles (actualización de estado de pedidos)
- Validación estricta de tipos, rangos y longitudes en todas las rutas del backend
- Límite de 5 MB en subida de imágenes
- Detección de marca de tarjeta del lado del cliente (no se almacenan números completos)

---

## 🛠️ Instalación y configuración

### Prerrequisitos
- Node.js 18+ y npm
- Una cuenta en [Supabase](https://supabase.com) (plan gratuito suficiente)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/wilderaleman8-bot/restaurante-con-css.git
cd restaurante-con-css

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
# Crear archivo .env en la raíz del proyecto:
SUPABASE_URL=https://dgdwpcrxrhxnsjpnfddw.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnZHdwY3J4cmh4bnNqcG5mZGR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMzM3MDYsImV4cCI6MjA5MjkwOTcwNn0
JWT_SECRET=sabores-ancestrales-secret-key-2025
PORT=3000

# 4. Inicializar la base de datos
# Abrir supabase_tables.sql y ejecutar todo el contenido
# en el SQL Editor del panel de Supabase

# 5. Iniciar el servidor
npm start

# 6. Abrir en el navegador
http://localhost:3000
```

---

## 📡 API — Referencia completa

| Método | Ruta | Auth | Descripción | Cuerpo |
|--------|------|------|-------------|--------|
| POST | `/api/usuarios/registro` | — | Registrar usuario | `FormData` con `nombre`, `email`, `password`, opcional `image` |
| POST | `/api/usuarios/login` | — | Iniciar sesión | `{ email, password }` |
| GET | `/api/usuarios` | — | Listar usuarios | — |
| POST | `/api/pedidos` | — | Crear pedido | `{ detalle, total, metodo_pago, card_last4?, card_exp?, card_brand?, usuario_id? }` |
| GET | `/api/pedidos` | — | Listar pedidos | — |
| PATCH | `/api/pedidos/:id` | JWT | Actualizar estado | `{ status }` |
| POST | `/api/reservas` | — | Crear reserva | `{ nombre, apellido, personas, fecha, mensaje?, usuario_id? }` |
| GET | `/api/reservas` | — | Listar reservas | — |
| POST | `/api/opiniones` | — | Crear opinión | `{ nombre, apellido, comentario, usuario_id? }` |
| GET | `/api/opiniones` | — | Listar opiniones | — |
| POST | `/api/valoraciones` | — | Crear valoración | `{ calificacion` (int 1–5)`, comentario?, usuario_id? }` |
| GET | `/api/valoraciones` | — | Listar valoraciones | — |

---

## 🗄️ Base de datos

El esquema completo está en `supabase_tables.sql`. Incluye las siguientes tablas:

| Tabla | Propósito |
|-------|-----------|
| `usuarios` | Usuarios registrados (nombre, email, password_hash, image_path) |
| `reservas` | Reservas de mesas (nombre, apellido, personas, fecha, mensaje) |
| `opiniones` | Comentarios de los clientes |
| `valoraciones` | Calificaciones de 1-5 estrellas |
| `pedidos` | Pedidos realizados (detalle JSON, total, método de pago, status) |

**Notas:**
- Todas las tablas usan UUIDs como clave primaria (generados por `gen_random_uuid()`)
- `pedidos.status` tiene valor por defecto `'pendiente'` y constraint CHECK con valores: `pendiente`, `preparando`, `servido`, `cancelado`
- Las contraseñas se almacenan como hash de bcrypt, nunca en texto plano
- `usuarios.image_path` guarda solo el nombre del archivo; las imágenes se sirven en `/uploads/<filename>`

---

## 🧪 Posibles mejoras futuras

- [ ] Dashboard administrativo para ver pedidos entrantes en tiempo real (WebSockets)
- [ ] Notificaciones por email con SendGrid o Resend
- [ ] Panel de administración del menú (CRUD de platillos desde el frontend)
- [ ] Soporte multi-idioma (i18n — español/inglés)
- [ ] Código QR para acceder al menú desde la mesa
- [ ] Integración con pasarela de pagos (Stripe)
- [ ] Tests automatizados (unitarios y de integración)
- [ ] Modo oscuro

---

## 📄 Licencia

Este proyecto es de código abierto. Puedes usarlo, modificarlo y distribuirlo libremente.
