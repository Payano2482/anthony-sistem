# 🔧 SOLUCIÓN ERROR 404 EN NETLIFY

## ❌ **PROBLEMA:**
Netlify muestra "Página no encontrada" cuando intentas abrir el proyecto.

## ✅ **SOLUCIÓN:**

### **Opción 1: Subir archivos actualizados (RECOMENDADO)**

He creado los archivos necesarios:
- ✅ `frontend/netlify.toml` - Configuración actualizada
- ✅ `frontend/public/_redirects` - Archivo de respaldo

**Sube estos cambios a GitHub:**

```powershell
# En la carpeta del proyecto
git add .
git commit -m "Fix: Agregar configuración para rutas de React Router"
git push
```

Netlify redesplegará automáticamente en 2-3 minutos.

---

### **Opción 2: Configurar manualmente en Netlify**

Si no quieres hacer commit, configura directamente en Netlify:

1. Ve a tu sitio en Netlify
2. **"Site settings"** → **"Build & deploy"** → **"Post processing"**
3. En **"Redirects and rewrites"**, agrega:
   ```
   /*    /index.html   200
   ```

---

### **Opción 3: Verificar configuración de build**

Asegúrate de que en Netlify tengas:

```
Base directory:    frontend
Build command:     npm run build
Publish directory: frontend/dist
```

**NO debe ser solo `dist`, debe ser `frontend/dist`**

---

## 🔍 **VERIFICAR EN NETLIFY:**

### **1. Build settings:**
```
Site settings → Build & deploy → Build settings

✅ Base directory: frontend
✅ Build command: npm run build
✅ Publish directory: frontend/dist
```

### **2. Redeploy:**
```
Deploys → Trigger deploy → Deploy site
```

---

## 📝 **EXPLICACIÓN DEL ERROR:**

El error ocurre porque:
1. React Router maneja las rutas en el cliente
2. Cuando refrescas o accedes directamente a una ruta (ej: `/dashboard`)
3. Netlify busca un archivo físico `/dashboard/index.html`
4. No lo encuentra → Error 404

**Solución:** Redirigir todas las rutas a `/index.html` para que React Router las maneje.

---

## ✅ **DESPUÉS DE APLICAR LA SOLUCIÓN:**

1. Espera 2-3 minutos
2. Recarga tu sitio
3. ✅ Debería funcionar correctamente

---

## 🐛 **SI AÚN NO FUNCIONA:**

### **Verifica los logs de build:**
1. En Netlify: **"Deploys"** → Clic en el último deploy
2. Ve **"Deploy log"**
3. Busca errores

### **Errores comunes:**

**Error: "Command failed"**
```
Solución:
- Verifica que package.json tenga "build": "vite build"
- Verifica que las dependencias estén en package.json
```

**Error: "Publish directory not found"**
```
Solución:
- Cambia "Publish directory" a: frontend/dist
- NO solo "dist"
```

---

## 📞 **NECESITAS AYUDA:**

Si el error persiste:
1. Copia el log completo del deploy
2. Copia la URL de tu sitio
3. Dime qué error específico ves

---

**¡Con estos cambios debería funcionar!** 🚀
