-- ============================================
-- ANTHONY SYSTEM - Base de Datos
-- Sistema de Gestión de Rentas
-- ============================================

-- Tabla de clientes que rentan el sistema
CREATE TABLE IF NOT EXISTS clientes_renta (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_empresa TEXT NOT NULL,
    contacto_nombre TEXT NOT NULL,
    telefono TEXT NOT NULL,
    email TEXT,
    cedula TEXT,
    plan TEXT NOT NULL CHECK(plan IN ('Basico', 'Premium', 'Empresarial')),
    precio_mensual REAL NOT NULL,
    fecha_inicio DATE NOT NULL,
    estado TEXT NOT NULL DEFAULT 'Activo' CHECK(estado IN ('Activo', 'Suspendido', 'Cancelado')),
    licencia_key TEXT UNIQUE NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de pagos de renta mensuales
CREATE TABLE IF NOT EXISTS pagos_renta (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_renta_id INTEGER NOT NULL,
    monto REAL NOT NULL,
    fecha_pago DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    metodo_pago TEXT CHECK(metodo_pago IN ('Efectivo', 'Transferencia', 'Tarjeta')),
    referencia TEXT,
    estado TEXT NOT NULL DEFAULT 'Pendiente' CHECK(estado IN ('Pagado', 'Pendiente', 'Atrasado')),
    dias_atraso INTEGER DEFAULT 0,
    notas TEXT,
    registrado_por TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_renta_id) REFERENCES clientes_renta(id) ON DELETE CASCADE
);

-- Tabla de licencias
CREATE TABLE IF NOT EXISTS licencias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_renta_id INTEGER NOT NULL,
    licencia_key TEXT UNIQUE NOT NULL,
    fecha_activacion DATE NOT NULL,
    fecha_expiracion DATE NOT NULL,
    estado TEXT NOT NULL DEFAULT 'Activa' CHECK(estado IN ('Activa', 'Suspendida', 'Expirada')),
    dispositivo_id TEXT,
    ultima_conexion TIMESTAMP,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_renta_id) REFERENCES clientes_renta(id) ON DELETE CASCADE
);

-- Tabla de usuarios administradores
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    nombre_completo TEXT NOT NULL,
    email TEXT,
    rol TEXT DEFAULT 'admin' CHECK(rol IN ('admin', 'superadmin')),
    activo INTEGER DEFAULT 1,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de notificaciones
CREATE TABLE IF NOT EXISTS notificaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_renta_id INTEGER NOT NULL,
    tipo TEXT NOT NULL CHECK(tipo IN ('vencimiento', 'atraso', 'pago_recibido', 'suspension')),
    mensaje TEXT NOT NULL,
    leida INTEGER DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_renta_id) REFERENCES clientes_renta(id) ON DELETE CASCADE
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_clientes_estado ON clientes_renta(estado);
CREATE INDEX IF NOT EXISTS idx_clientes_licencia ON clientes_renta(licencia_key);
CREATE INDEX IF NOT EXISTS idx_pagos_cliente ON pagos_renta(cliente_renta_id);
CREATE INDEX IF NOT EXISTS idx_pagos_estado ON pagos_renta(estado);
CREATE INDEX IF NOT EXISTS idx_pagos_fecha ON pagos_renta(fecha_vencimiento);
CREATE INDEX IF NOT EXISTS idx_licencias_key ON licencias(licencia_key);
CREATE INDEX IF NOT EXISTS idx_notificaciones_leida ON notificaciones(leida);

-- No se inserta usuario por defecto; el primer administrador se crea desde la aplicación.
