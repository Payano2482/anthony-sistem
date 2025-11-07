# 🌐 INSTALAR NGROK PARA HTTPS

## 📥 **PASO 1: DESCARGAR NGROK**

### **Opción A: Descarga Directa (Más Fácil)**
1. Ve a: https://ngrok.com/download
2. Descarga la versión para Windows
3. Descomprime el archivo ZIP
4. Copia `ngrok.exe` a una carpeta (ej: `C:\ngrok\`)

### **Opción B: Con Chocolatey**
```powershell
choco install ngrok
```

---

## 🔑 **PASO 2: CREAR CUENTA (GRATIS)**

1. Ve a: https://dashboard.ngrok.com/signup
2. Crea cuenta gratis
3. Ve a: https://dashboard.ngrok.com/get-started/your-authtoken
4. Copia tu authtoken

---

## ⚙️ **PASO 3: CONFIGURAR NGROK**

```powershell
# Navega a donde está ngrok.exe
cd C:\ngrok

# Configura tu authtoken (reemplaza con el tuyo)
.\ngrok.exe config add-authtoken TU_TOKEN_AQUI
```

---

## 🚀 **PASO 4: INICIAR NGROK**

```powershell
# En una terminal nueva
cd C:\ngrok
.\ngrok.exe http 3000
```

---

## ✅ **PASO 5: COPIAR URL**

Verás algo como:
```
Forwarding  https://abc123-456-789.ngrok-free.app -> http://localhost:3000
```

**Copia esa URL:** `https://abc123-456-789.ngrok-free.app`

---

## 📝 **PASO 6: ACTUALIZAR CONFIGURACIÓN**

Yo actualizaré automáticamente:
- `webauthn_service.py` con tu URL
- Reiniciaré el backend

---

## 🎯 **DESPUÉS DE CONFIGURAR:**

1. ✅ Frontend en: `https://abc123.ngrok-free.app`
2. ✅ Backend en: `http://localhost:8000`
3. ✅ Funciona en móvil con HTTPS
4. ✅ Sensor de huella REAL

---

**¡Sigue estos pasos y dime cuando tengas la URL de ngrok!**
