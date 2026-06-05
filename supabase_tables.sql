-- Tablas de Supabase / PostgreSQL

create extension if not exists "pgcrypto";

create table if not exists usuarios (
    id uuid primary key default gen_random_uuid(),
    nombre text not null,
    email text not null unique,
    password text not null,
    image_path text,
    rol text not null default 'cliente' check (rol in ('cliente', 'admin')),
    token_version int not null default 0,
    created_at timestamptz default now()
);

-- Si la tabla ya existía sin token_version, agregarla
alter table usuarios add column if not exists token_version int not null default 0;

-- Permitir a usuarios anónimos registrarse (INSERT)
create policy "Permitir registro anónimo" on usuarios
  for insert to anon
  with check (true);

-- Permitir a usuarios anónimos consultar datos (para login)
create policy "Permitir consulta anónima" on usuarios
  for select to anon
  using (true);

create table if not exists password_reset_tokens (
    id uuid primary key default gen_random_uuid(),
    usuario_id uuid references usuarios(id) on delete cascade,
    token text not null unique,
    expires_at timestamptz not null,
    used boolean not null default false,
    created_at timestamptz default now()
);

create table if not exists platillos (
    id uuid primary key default gen_random_uuid(),
    category text not null,
    subcategory text,
    name text not null,
    description text,
    price numeric(10,2) not null,
    currency text not null default 'C$',
    image text,
    active boolean not null default true,
    "order" int not null default 0,
    created_at timestamptz default now()
);

create table if not exists reservas (
    id uuid primary key default gen_random_uuid(),
    usuario_id uuid references usuarios(id) on delete set null,
    nombre text not null,
    apellido text not null,
    personas int not null,
    fecha_reserva timestamptz not null,
    mensaje text,
    created_at timestamptz default now()
);

create table if not exists opiniones (
    id uuid primary key default gen_random_uuid(),
    usuario_id uuid references usuarios(id) on delete set null,
    nombre text not null,
    apellido text not null,
    comentario text not null,
    created_at timestamptz default now()
);

create table if not exists valoraciones (
    id uuid primary key default gen_random_uuid(),
    usuario_id uuid references usuarios(id) on delete set null,
    calificacion int not null check (calificacion between 1 and 5),
    comentario text,
    created_at timestamptz default now()
);

create table if not exists pedidos (
    id uuid primary key default gen_random_uuid(),
    usuario_id uuid references usuarios(id) on delete set null,
    detalle jsonb not null,
    total numeric(10,2) not null,
    metodo_pago text not null,
    card_last4 varchar(4),
    card_exp varchar(7),
    card_brand text,
    status text not null default 'pendiente',
    created_at timestamptz default now()
);
