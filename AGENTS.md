# Restaurante con-css

Backend Express.js + frontend estático HTML/CSS/JS + Supabase (PostgreSQL).

## Configuración

```bash
npm install
# Crear .env a partir de .env.example con SUPABASE_URL, SUPABASE_KEY, PORT (opcional, default 3000)
npm start
```

## API — Referencia para Postman

Servidor local: `http://localhost:3000`

### Usuarios

| Método | Ruta | Cuerpo | Respuesta |
|--------|------|--------|-----------|
| POST | `/api/usuarios/registro` | `FormData` con `nombre`, `email`, `password`, opcional `image` (archivo, máx 5 MB, solo imágenes) | `{ message, usuario: { id, nombre, email, image_path } }` |
| POST | `/api/usuarios/login` | `{ email, password }` | `{ message, usuario: { id, nombre, email, image_path } }` |
| GET | `/api/usuarios` | — | `[{ id, nombre, email, created_at }]` |

### Reservas

| Método | Ruta | Cuerpo | Respuesta |
|--------|------|--------|-----------|
| POST | `/api/reservas` | `{ nombre, apellido, personas, fecha, mensaje?, usuario_id? }` | `{ message }` |
| GET | `/api/reservas` | — | Lista de reservas |

### Pedidos

| Método | Ruta | Cuerpo | Respuesta |
|--------|------|--------|-----------|
| POST | `/api/pedidos` | `{ detalle` (objeto)`, total, metodo_pago, card_last4?, card_exp?, card_brand?, usuario_id? }` | `{ message }` |
| GET | `/api/pedidos` | — | Lista de pedidos |

### Opiniones

| Método | Ruta | Cuerpo | Respuesta |
|--------|------|--------|-----------|
| POST | `/api/opiniones` | `{ nombre, apellido, comentario, usuario_id? }` | `{ message }` |
| GET | `/api/opiniones` | — | Lista de opiniones |

### Valoraciones

| Método | Ruta | Cuerpo | Respuesta |
|--------|------|--------|-----------|
| POST | `/api/valoraciones` | `{ calificacion` (int 1–5)`, comentario?, usuario_id? }` | `{ message }` |
| GET | `/api/valoraciones` | — | Lista de valoraciones |

## ngrok — Acceso externo

```bash
# Terminal 1: iniciar backend
npm start

# Terminal 2: exponer el puerto 3000
ngrok http 3000

# Usar la URL https://xxxx.ngrok.io generada por ngrok
# en Postman o navegador desde cualquier equipo.
```

## Base de datos

Esquema en `supabase_tables.sql`. Tablas: `usuarios`, `reservas`, `opiniones`, `valoraciones`, `pedidos`.

- La contraseña se guarda en texto plano (sin hash).
- `usuarios.image_path` guarda solo el nombre del archivo; se sirve en `GET /uploads/<filename>`.

## Despliegue

Configurado para Vercel (`vercel.json`): todo el tráfico se rutea a `src/app.js` con `@vercel/node`.

## Archivos clave

| Archivo | Propósito |
|---------|-----------|
| `src/app.js` | Entrypoint, configura Express y monta rutas |
| `src/lib/supabaseClient.js` | Cliente de Supabase desde variables de entorno |
| `src/routes/*.js` | Handlers por recurso (usuarios, reservas, pedidos, opiniones, valoraciones) |
| `public/` | Frontend estático (HTML, CSS, JS) |
| `uploads/` | Imágenes de perfil subidas (gitignored) |
