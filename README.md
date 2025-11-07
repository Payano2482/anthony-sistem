# 🏢 ANTHONY SISTEM - Sistema de Gestión de Rentas

Sistema completo de gestión de clientes y licencias con **autenticación biométrica REAL**.

## 📋 Descripción

**Anthony Sistem** es una aplicación web profesional que te permite:

- ✅ Gestionar clientes que rentan tu sistema
- ✅ Controlar pagos mensuales
- ✅ Administrar licencias de acceso
- ✅ Suspender/activar clientes automáticamente
- ✅ Ver estadísticas y reportes en tiempo real
- ✅ Acceder desde cualquier dispositivo (responsive)
- 🔐 **Login con huella dactilar REAL (Touch ID, Face ID, Android Fingerprint)**
- 📱 **Instalable como PWA en móvil**
- 📸 **Reconocimiento facial con cámara**
- 📊 **Reportes gráficos en vivo**
- 📧 **Notificaciones automáticas por WhatsApp**

## 🚀 Inicio Rápido

### Prerrequisitos

- Python 3.8+
- Node.js 16+
- npm o yarn

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/AnthonySistem.App.git
cd AnthonySistem.App
```

### 2. Configurar Backend

```bash
cd backend

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
copy .env.example .env
# Edita .env y cambia SECRET_KEY

# Inicializar base de datos
python database/init_db.py

# Iniciar servidor
python main.py
```

El backend estará en: http://localhost:8000

### 3. Configurar Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar en desarrollo
npm run dev
```

El frontend estará en: http://localhost:3000

### 4. Acceder a la aplicación

- **URL**: http://localhost:3000
- **Usuario**: `admin`
- **Contraseña**: `admin123`

⚠️ **IMPORTANTE**: Cambia estas credenciales en producción.

## 📁 Estructura del Proyecto

```
AnthonySistem.App/
├── backend/                    # API REST (FastAPI)
│   ├── database/
│   │   ├── schema.sql         # Esquema de BD
│   │   ├── init_db.py         # Inicializador
│   │   └── anthony_system.db  # Base de datos SQLite
│   ├── main.py                # Aplicación principal
│   ├── models.py              # Modelos Pydantic
│   ├── auth.py                # Autenticación JWT
│   ├── database_service.py    # Lógica de negocio
│   ├── config.py              # Configuración
│   └── requirements.txt       # Dependencias Python
│
├── frontend/                   # Aplicación Web (React)
│   ├── src/
│   │   ├── components/        # Componentes reutilizables
│   │   ├── context/           # Contextos de React
│   │   ├── pages/             # Páginas de la app
│   │   ├── services/          # Servicios API
│   │   └── App.jsx            # Componente principal
│   ├── package.json
│   └── vite.config.js
│
└── README.md                   # Este archivo
```

## 🎨 Capturas de Pantalla

### Dashboard
- Resumen de ingresos mensuales
- Estado de clientes (al día, por vencer, atrasados)
- Estadísticas en tiempo real

### Lista de Clientes
- Búsqueda y filtros
- Indicadores visuales de estado
- Acceso rápido a detalles

### Detalle de Cliente
- Información completa
- Historial de pagos
- Acciones rápidas (llamar, WhatsApp, suspender)

### Registro de Pagos
- Formulario intuitivo
- Múltiples métodos de pago
- Actualización automática de licencias

## 🔐 Seguridad

- ✅ Autenticación con JWT
- ✅ Contraseñas hasheadas con bcrypt
- ✅ Protección de rutas
- ✅ Validación de datos
- ✅ CORS configurado

## 📊 Base de Datos

### Tablas Principales

1. **clientes_renta** - Clientes que rentan el sistema
2. **pagos_renta** - Pagos mensuales
3. **licencias** - Control de acceso
4. **usuarios** - Administradores
5. **notificaciones** - Alertas del sistema

## 🌐 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Usuario actual

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

**Documentación completa**: http://localhost:8000/docs

## 🚢 Despliegue en Producción

### Backend (DigitalOcean/Heroku)

```bash
# Configurar variables de entorno
export SECRET_KEY="tu_clave_super_secreta"
export DATABASE_PATH="database/anthony_system.db"

# Iniciar con Gunicorn
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend (Netlify/Vercel)

```bash
cd frontend
npm run build
# Subir carpeta dist/ a tu hosting
```

### Costos Estimados

- **Servidor**: $5-10/mes (DigitalOcean Droplet)
- **Dominio**: $10/año
- **SSL**: Gratis (Let's Encrypt)

**Total**: ~$7/mes

## 🔧 Configuración Avanzada

### Cambiar Puerto del Backend

Edita `backend/main.py`:

```python
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)  # Cambiar puerto aquí
```

### Cambiar URL de la API

Edita `frontend/vite.config.js`:

```js
server: {
  proxy: {
    '/api': {
      target: 'https://tu-api.com',
      changeOrigin: true
    }
  }
}
```

### Migrar a PostgreSQL

1. Instala `psycopg2`:
```bash
pip install psycopg2-binary
```

2. Actualiza `config.py`:
```python
DATABASE_URL = "postgresql://user:pass@localhost/anthony_system"
```

3. Adapta `database_service.py` para usar SQLAlchemy

## 📝 Funcionalidades Clave

### 🔒 Control de Licencias

- Cada cliente tiene una licencia única
- Verificación en tiempo real
- Suspensión automática por falta de pago
- Reactivación al registrar pago

### 💰 Gestión de Pagos

- Registro de pagos con múltiples métodos
- Historial completo
- Cálculo automático de próximo vencimiento
- Alertas de pagos pendientes

### 📊 Dashboard Inteligente

- Resumen financiero del mes
- Estado de todos los clientes
- Proyección de ingresos
- Acciones rápidas

### 🔍 Búsqueda y Filtros

- Búsqueda por nombre de empresa o contacto
- Filtros por estado (al día, por vencer, atrasados)
- Ordenamiento personalizado

## 🐛 Solución de Problemas

### Error: "Token inválido"

- Verifica que el backend esté corriendo
- Limpia localStorage del navegador
- Vuelve a iniciar sesión

### Error: "Cannot connect to database"

- Verifica que la base de datos esté inicializada
- Ejecuta: `python database/init_db.py`

### Error: "CORS policy"

- Verifica que el frontend esté en la lista de `CORS_ORIGINS` en `config.py`

## 📞 Soporte

Para reportar bugs o solicitar features:
- Crea un issue en GitHub
- Email: soporte@anthonysystem.com

## 📄 Licencia

Este proyecto es privado y propietario.

## 👨‍💻 Autor

**Anthony** - Sistema de Gestión de Rentas

---

⭐ Si te gusta este proyecto, dale una estrella en GitHub!
