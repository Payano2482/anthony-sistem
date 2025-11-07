# 📦 Instrucciones de Instalación - Anthony System

## ⚡ Instalación Rápida (Windows)

### Paso 1: Verificar Requisitos

Abre PowerShell o CMD y verifica que tengas instalado:

```bash
# Python
python --version
# Debe mostrar: Python 3.8 o superior

# Node.js
node --version
# Debe mostrar: v16.0.0 o superior

# npm
npm --version
# Debe mostrar: 8.0.0 o superior
```

Si no tienes Python o Node.js instalados:
- **Python**: https://www.python.org/downloads/
- **Node.js**: https://nodejs.org/

### Paso 2: Iniciar el Sistema

1. **Doble clic en**: `start_backend.bat`
   - Espera a ver: "Uvicorn running on http://0.0.0.0:8000"
   - NO cierres esta ventana

2. **Doble clic en**: `start_frontend.bat`
   - Espera a que se abra el navegador automáticamente
   - NO cierres esta ventana

3. **Accede a la aplicación**:
   - URL: http://localhost:3000
   - Usuario: `admin`
   - Contraseña: `admin123`

¡Listo! 🎉

---

## 🔧 Instalación Manual

### Backend (API)

```bash
# Navegar a la carpeta backend
cd backend

# Crear entorno virtual (opcional pero recomendado)
python -m venv venv

# Activar entorno virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Inicializar base de datos
python database/init_db.py

# Iniciar servidor
python main.py
```

El backend estará disponible en: http://localhost:8000

### Frontend (Web App)

```bash
# Abrir nueva terminal
# Navegar a la carpeta frontend
cd frontend

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev
```

El frontend estará disponible en: http://localhost:3000

---

## 🐛 Solución de Problemas Comunes

### Error: "python no se reconoce como comando"

**Solución**: Python no está en el PATH del sistema.
1. Reinstala Python marcando "Add Python to PATH"
2. O agrega manualmente Python al PATH

### Error: "npm no se reconoce como comando"

**Solución**: Node.js no está instalado correctamente.
1. Descarga e instala Node.js desde: https://nodejs.org/
2. Reinicia la terminal

### Error: "pip no se reconoce como comando"

**Solución**: 
```bash
python -m pip install --upgrade pip
```

### Error: "ModuleNotFoundError: No module named 'fastapi'"

**Solución**: Las dependencias no están instaladas.
```bash
cd backend
pip install -r requirements.txt
```

### Error: "Cannot find module 'react'"

**Solución**: Las dependencias del frontend no están instaladas.
```bash
cd frontend
npm install
```

### Error: "Address already in use" (Puerto 8000 o 3000 ocupado)

**Solución**: Otro proceso está usando el puerto.

**Windows**:
```bash
# Ver qué proceso usa el puerto 8000
netstat -ano | findstr :8000

# Matar el proceso (reemplaza PID con el número que aparece)
taskkill /PID <PID> /F
```

**Linux/Mac**:
```bash
# Ver qué proceso usa el puerto 8000
lsof -i :8000

# Matar el proceso
kill -9 <PID>
```

### Error: "CORS policy" en el navegador

**Solución**: El backend no está corriendo o la configuración de CORS es incorrecta.
1. Verifica que el backend esté corriendo en http://localhost:8000
2. Verifica que `config.py` tenga `http://localhost:3000` en `CORS_ORIGINS`

### Base de datos no se crea

**Solución**:
```bash
cd backend
python database/init_db.py
```

Si persiste el error, elimina `database/anthony_system.db` y vuelve a ejecutar el comando.

---

## 📋 Verificación de Instalación

### 1. Verificar Backend

Abre el navegador y ve a: http://localhost:8000/docs

Deberías ver la documentación interactiva de la API (Swagger UI).

### 2. Verificar Frontend

Abre el navegador y ve a: http://localhost:3000

Deberías ver la pantalla de login.

### 3. Verificar Base de Datos

```bash
cd backend/database
# Debería existir el archivo: anthony_system.db
```

### 4. Probar Login

- Usuario: `admin`
- Contraseña: `admin123`

Si puedes iniciar sesión, ¡todo está funcionando correctamente! ✅

---

## 🔄 Actualizar el Sistema

```bash
# Detener backend y frontend (Ctrl+C en ambas ventanas)

# Actualizar código
git pull origin main

# Actualizar backend
cd backend
pip install -r requirements.txt

# Actualizar frontend
cd ../frontend
npm install

# Reiniciar ambos servidores
```

---

## 🗑️ Desinstalar

```bash
# Eliminar entorno virtual de Python
cd backend
rmdir /s venv  # Windows
rm -rf venv    # Linux/Mac

# Eliminar node_modules
cd ../frontend
rmdir /s node_modules  # Windows
rm -rf node_modules    # Linux/Mac

# Eliminar base de datos (si deseas)
cd ../backend/database
del anthony_system.db  # Windows
rm anthony_system.db   # Linux/Mac
```

---

## 📞 Obtener Ayuda

Si sigues teniendo problemas:

1. **Revisa los logs**:
   - Backend: Mira la terminal donde corre el backend
   - Frontend: Abre la consola del navegador (F12)

2. **Verifica los requisitos**:
   - Python 3.8+
   - Node.js 16+
   - Espacio en disco: ~500MB

3. **Reinstala desde cero**:
   - Elimina las carpetas `venv` y `node_modules`
   - Sigue los pasos de instalación manual

4. **Crea un issue en GitHub** con:
   - Sistema operativo
   - Versión de Python y Node.js
   - Mensaje de error completo
   - Capturas de pantalla

---

## 🎯 Próximos Pasos

Una vez instalado:

1. ✅ Cambia la contraseña por defecto
2. ✅ Agrega tu primer cliente
3. ✅ Registra un pago de prueba
4. ✅ Explora el dashboard
5. ✅ Lee la documentación completa en README.md

¡Disfruta usando Anthony System! 🚀
