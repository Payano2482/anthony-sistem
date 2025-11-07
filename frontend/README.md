# Anthony System - Frontend Web

Aplicación web responsive para gestión de rentas de clientes.

## 🚀 Instalación

### 1. Instalar dependencias

```bash
cd frontend
npm install
```

### 2. Iniciar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: http://localhost:3000

## 🏗️ Build para producción

```bash
npm run build
```

Los archivos optimizados se generarán en la carpeta `dist/`.

## 📱 Características

### ✅ Responsive Design
- Funciona perfectamente en desktop, tablet y móvil
- Diseño adaptativo con TailwindCSS

### 🎨 Interfaz Moderna
- UI limpia y profesional
- Iconos con Lucide React
- Animaciones y transiciones suaves

### 🔐 Autenticación
- Login seguro con JWT
- Sesión persistente
- Protección de rutas

### 📊 Dashboard
- Resumen de ingresos
- Estado de clientes
- Estadísticas en tiempo real

### 👥 Gestión de Clientes
- Lista con búsqueda y filtros
- Detalle completo de cada cliente
- Historial de pagos
- Acciones rápidas (llamar, WhatsApp)

### 💰 Registro de Pagos
- Formulario intuitivo
- Múltiples métodos de pago
- Actualización automática de licencias

## 🛠️ Tecnologías

- **React 18** - Framework UI
- **Vite** - Build tool ultra-rápido
- **React Router** - Navegación
- **TailwindCSS** - Estilos
- **Axios** - HTTP client
- **Lucide React** - Iconos
- **date-fns** - Manejo de fechas

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── components/
│   │   └── Layout.jsx          # Layout principal
│   ├── context/
│   │   └── AuthContext.jsx     # Contexto de autenticación
│   ├── pages/
│   │   ├── Login.jsx           # Página de login
│   │   ├── Dashboard.jsx       # Dashboard principal
│   │   ├── Clientes.jsx        # Lista de clientes
│   │   ├── ClienteDetalle.jsx  # Detalle de cliente
│   │   └── RegistrarPago.jsx   # Formulario de pago
│   ├── services/
│   │   └── api.js              # Configuración de Axios
│   ├── App.jsx                 # Componente principal
│   ├── main.jsx                # Entry point
│   └── index.css               # Estilos globales
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🌐 Despliegue

### Opción 1: Netlify

```bash
npm run build
netlify deploy --prod --dir=dist
```

### Opción 2: Vercel

```bash
npm run build
vercel --prod
```

### Opción 3: Servidor propio

```bash
npm run build
# Copiar carpeta dist/ a tu servidor web
```

## 🔧 Configuración

### API URL

Por defecto, la app usa proxy a `http://localhost:8000`. Para cambiar:

1. Edita `vite.config.js`:

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

2. O en producción, edita `src/services/api.js`:

```js
const api = axios.create({
  baseURL: 'https://tu-api.com/api'
})
```

## 📝 Notas

- Los errores de lint sobre `@tailwind` y `@apply` son normales - son directivas de TailwindCSS
- Asegúrate de que el backend esté corriendo antes de iniciar el frontend
- La app guarda el token JWT en localStorage
- Todas las rutas excepto `/login` requieren autenticación

## 🎯 Próximas Mejoras

- [ ] Notificaciones push
- [ ] Modo oscuro
- [ ] Exportar reportes PDF
- [ ] Gráficas de ingresos
- [ ] Filtros avanzados
- [ ] Paginación de clientes
