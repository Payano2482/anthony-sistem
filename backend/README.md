# Anthony System - Backend API

Sistema de gestión de rentas para control de clientes y licencias.

## 🚀 Instalación

### 1. Instalar dependencias

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configurar variables de entorno

```bash
copy .env.example .env
```

Edita el archivo `.env` y cambia la `SECRET_KEY` por una clave segura.

### 3. Inicializar base de datos

```bash
python database/init_db.py
```

### 4. Iniciar servidor

```bash
python main.py
```

O con uvicorn:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 📚 Documentación API

Una vez iniciado el servidor, accede a:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔐 Credenciales por defecto

- **Usuario**: `admin`
- **Contraseña**: `admin123`

⚠️ **IMPORTANTE**: Cambia estas credenciales en producción.

## 📡 Endpoints Principales

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener usuario actual

### Dashboard
- `GET /api/dashboard` - Datos del dashboard

### Clientes
- `GET /api/clientes` - Lista de clientes
- `GET /api/clientes/{id}` - Detalle de cliente
- `POST /api/clientes` - Crear cliente
- `PUT /api/clientes/{id}` - Actualizar cliente
- `POST /api/clientes/{id}/suspend` - Suspender cliente

### Pagos
- `GET /api/clientes/{id}/pagos` - Historial de pagos
- `POST /api/pagos` - Registrar pago

### Licencias
- `GET /api/licencias/verify/{key}` - Verificar licencia

## 🗄️ Base de Datos

SQLite con las siguientes tablas:
- `clientes_renta` - Clientes que rentan el sistema
- `pagos_renta` - Pagos mensuales
- `licencias` - Control de acceso
- `usuarios` - Administradores
- `notificaciones` - Alertas del sistema

## 🔧 Desarrollo

### Estructura del proyecto

```
backend/
├── database/
│   ├── schema.sql          # Esquema de BD
│   ├── init_db.py          # Inicializador
│   └── anthony_system.db   # Base de datos (generada)
├── main.py                 # API FastAPI
├── models.py               # Modelos Pydantic
├── auth.py                 # Autenticación JWT
├── database_service.py     # Lógica de negocio
├── config.py               # Configuración
├── requirements.txt        # Dependencias
└── .env                    # Variables de entorno
```

## 🌐 Despliegue

### Opción 1: DigitalOcean App Platform

1. Conecta tu repositorio
2. Configura las variables de entorno
3. Deploy automático

### Opción 2: Heroku

```bash
heroku create anthony-system-api
git push heroku main
```

### Opción 3: VPS (Ubuntu)

```bash
# Instalar dependencias
sudo apt update
sudo apt install python3-pip nginx

# Clonar proyecto
git clone tu-repo
cd backend

# Instalar dependencias Python
pip3 install -r requirements.txt

# Configurar systemd service
sudo nano /etc/systemd/system/anthony-system.service

# Iniciar servicio
sudo systemctl start anthony-system
sudo systemctl enable anthony-system
```

## 📝 Notas

- La base de datos SQLite es ideal para desarrollo y pequeñas implementaciones
- Para producción con muchos clientes, considera migrar a PostgreSQL
- Asegúrate de configurar HTTPS en producción
- Realiza backups regulares de la base de datos
