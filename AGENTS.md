# Restaurante con-css

Backend Express.js + frontend estático HTML/CSS/JS + Supabase (PostgreSQL).

## Configuración

```bash
npm install
# Crear .env a partir de .env.example con SUPABASE_URL, SUPABASE_KEY, JWT_SECRET, PORT (opcional, default 3000)
npm start
```

## API — Referencia

Servidor local: `http://localhost:3000`

### Usuarios

| Método | Ruta | Cuerpo | Respuesta |
|--------|------|--------|-----------|
| POST | `/api/usuarios/registro` | `FormData` con `nombre`, `email`, `password`, opcional `image` | `{ message, usuario, token }` |
| POST | `/api/usuarios/login` | `{ email, password }` | `{ message, usuario, token }` |
| GET | `/api/usuarios` | — | `[{ id, nombre, email, created_at }]` |

### Pedidos

| Método | Ruta | Cuerpo | Respuesta |
|--------|------|--------|-----------|
| POST | `/api/pedidos` | `{ detalle, total, metodo_pago, card_last4?, card_exp?, card_brand?, usuario_id? }` | `{ message, id, status }` |
| GET | `/api/pedidos` | — | Lista de pedidos con `status` |
| PATCH | `/api/pedidos/:id` | `{ status }` (requiere JWT) | `{ message, id, status }` |

### Reservas / Opiniones / Valoraciones

| Método | Ruta | Cuerpo | Respuesta |
|--------|------|--------|-----------|
| POST | `/api/reservas` | `{ nombre, apellido, personas, fecha, mensaje?, usuario_id? }` | `{ message }` |
| GET | `/api/reservas` | — | Lista de reservas |
| POST | `/api/opiniones` | `{ nombre, apellido, comentario, usuario_id? }` | `{ message }` |
| GET | `/api/opiniones` | — | Lista de opiniones |
| POST | `/api/valoraciones` | `{ calificacion` (int 1–5)`, comentario?, usuario_id? }` | `{ message }` |
| GET | `/api/valoraciones` | — | Lista de valoraciones |

## Base de datos

Esquema en `supabase_tables.sql`. Tablas: `usuarios`, `reservas`, `opiniones`, `valoraciones`, `pedidos`.

- Contraseñas hasheadas con bcrypt.
- `usuarios.image_path` guarda solo el nombre del archivo; se sirve en `/uploads/<filename>`.
- `pedidos.status` por defecto `'pendiente'`. Valores: `pendiente`, `preparando`, `servido`, `cancelado`.

## Archivos clave

| Archivo | Propósito |
|---------|-----------|
| `src/app.js` | Entrypoint, configura Express y monta rutas |
| `src/lib/supabaseClient.js` | Cliente de Supabase desde variables de entorno |
| `src/middleware/auth.js` | JWT: generarToken, verificarToken |
| `src/routes/*.js` | Handlers por recurso |
| `public/js/app.js` | Frontend: auth, toast, API calls, loading states |
| `public/menu.html` | Menú, carrito, PDF, historial de pedidos |
| `uploads/` | Imágenes de perfil subidas |
| `supabase_tables.sql` | Esquema completo de la BD |
| `migrate-passwords.js` | Script para migrar passwords a bcrypt |
