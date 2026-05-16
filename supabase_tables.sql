-- Tablas de Supabase / PostgreSQL

create extension if not exists "pgcrypto";

create table if not exists usuarios (
    id uuid primary key default gen_random_uuid(),
    nombre text not null,
    email text not null unique,
    password text not null,
    image_path text,
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
