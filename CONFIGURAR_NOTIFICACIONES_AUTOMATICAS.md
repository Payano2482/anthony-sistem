# 🔔 Configurar Notificaciones Automáticas

## Anthony System - Guía de Configuración

---

## 📋 **¿Qué hace el sistema automático?**

El sistema revisa **automáticamente** todos los días a las 9:00 AM y:
1. ✅ Identifica clientes con 5+ días laborables de mora
2. ✅ Prepara las notificaciones
3. ✅ Registra en un log
4. ✅ (Opcional) Envía por WhatsApp/Email/SMS

---

## ⚙️ **Opción 1: Programador de Tareas de Windows (Recomendado)**

### **Paso 1: Abrir Programador de Tareas**
1. Presiona `Win + R`
2. Escribe: `taskschd.msc`
3. Presiona Enter

### **Paso 2: Crear Nueva Tarea**
1. Haz clic en **"Crear tarea básica"** (panel derecho)
2. Nombre: `Anthony System - Notificaciones`
3. Descripción: `Envío automático de notificaciones de pago`
4. Haz clic en **"Siguiente"**

### **Paso 3: Configurar Desencadenador**
1. Selecciona: **"Diariamente"**
2. Haz clic en **"Siguiente"**
3. Hora: `09:00:00` (9:00 AM)
4. Repetir cada: `1 días`
5. Haz clic en **"Siguiente"**

### **Paso 4: Configurar Acción**
1. Selecciona: **"Iniciar un programa"**
2. Haz clic en **"Siguiente"**
3. Programa/script: `C:\AnthonySistem.App\notificaciones_automaticas.bat`
4. Haz clic en **"Siguiente"**

### **Paso 5: Finalizar**
1. Marca: **"Abrir el cuadro de diálogo Propiedades..."**
2. Haz clic en **"Finalizar"**

### **Paso 6: Configuraciones Avanzadas**
En la ventana de Propiedades:
1. Pestaña **"General"**:
   - ☑ Ejecutar tanto si el usuario inició sesión como si no
   - ☑ Ejecutar con los privilegios más altos

2. Pestaña **"Condiciones"**:
   - ☐ Iniciar la tarea solo si el equipo está conectado a la CA (desmarcar)
   - ☐ Detener si el equipo deja de usar CA (desmarcar)

3. Pestaña **"Configuración"**:
   - ☑ Permitir que se ejecute la tarea a petición
   - ☑ Si la tarea no se ejecuta, volver a iniciarla cada: `10 minutos`

4. Haz clic en **"Aceptar"**

---

## ⚙️ **Opción 2: Script Manual (Para Pruebas)**

### **Ejecutar Manualmente:**
1. Abre PowerShell o CMD
2. Navega a la carpeta:
   ```cmd
   cd C:\AnthonySistem.App
   ```
3. Ejecuta:
   ```cmd
   notificaciones_automaticas.bat
   ```

---

## 📱 **Opción 3: Integración con WhatsApp Business API**

Para envío automático por WhatsApp, necesitas:

### **Servicios Recomendados:**
1. **Twilio** (https://www.twilio.com/whatsapp)
   - Costo: ~$0.005 por mensaje
   - Fácil integración
   - API oficial

2. **WhatsApp Business API** (https://business.whatsapp.com/)
   - Requiere aprobación de Facebook
   - Más complejo pero oficial
   - Mejor para volumen alto

3. **Baileys** (Librería Node.js)
   - Gratis
   - No oficial
   - Riesgo de bloqueo

### **Configuración con Twilio (Ejemplo):**

1. **Crear cuenta en Twilio**
2. **Obtener credenciales**:
   - Account SID
   - Auth Token
   - WhatsApp Number

3. **Agregar al backend** (`main.py`):
```python
from twilio.rest import Client

@app.post("/api/notificaciones/enviar-whatsapp")
async def enviar_whatsapp(cliente_id: int):
    # Configuración Twilio
    account_sid = "TU_ACCOUNT_SID"
    auth_token = "TU_AUTH_TOKEN"
    client = Client(account_sid, auth_token)
    
    # Obtener cliente
    cliente = db_service.get_cliente(cliente_id)
    
    # Mensaje
    mensaje = f"""⚠️ NOTIFICACIÓN DE PAGO VENCIDO

Hola {cliente['contacto_nombre']},

Tu pago está vencido:
💰 Monto: ${cliente['precio_mensual']}

Deposita en:
🔴 BHD León: 06584350073
🔵 Banreservas: 9608461925

A nombre de: Antonio Payano"""
    
    # Enviar
    message = client.messages.create(
        from_='whatsapp:+14155238886',  # Número Twilio
        body=mensaje,
        to=f'whatsapp:+1{cliente["telefono"]}'
    )
    
    return {"success": True, "message_sid": message.sid}
```

---

## 📧 **Opción 4: Integración con Email**

### **Usando Gmail:**

1. **Instalar dependencia**:
```bash
pip install python-dotenv smtplib
```

2. **Configurar en `.env`**:
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_contraseña_app
```

3. **Agregar al backend**:
```python
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

@app.post("/api/notificaciones/enviar-email")
async def enviar_email(cliente_id: int):
    cliente = db_service.get_cliente(cliente_id)
    
    # Configurar email
    msg = MIMEMultipart()
    msg['From'] = "tu_email@gmail.com"
    msg['To'] = cliente['email']
    msg['Subject'] = "⚠️ Notificación de Pago Vencido - Anthony System"
    
    # Cuerpo del mensaje
    body = f"""
    Hola {cliente['contacto_nombre']},
    
    Tu pago mensual está vencido.
    
    Monto: ${cliente['precio_mensual']}
    
    Deposita en:
    - BHD León: 06584350073
    - Banreservas: 9608461925
    
    A nombre de: Antonio Payano
    
    Gracias,
    Anthony System
    """
    
    msg.attach(MIMEText(body, 'plain'))
    
    # Enviar
    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()
    server.login("tu_email@gmail.com", "tu_contraseña_app")
    server.send_message(msg)
    server.quit()
    
    return {"success": True}
```

---

## 📊 **Verificar que Funciona:**

### **1. Ver Log de Ejecuciones:**
```cmd
type C:\AnthonySistem.App\notificaciones.log
```

### **2. Probar Manualmente:**
```cmd
cd C:\AnthonySistem.App
notificaciones_automaticas.bat
```

### **3. Ver en el Dashboard:**
- Ve a "Notificaciones" en el sistema
- Verás los clientes que necesitan notificación

---

## 🔧 **Solución de Problemas:**

### **Problema: La tarea no se ejecuta**
**Solución:**
1. Verifica que el backend esté corriendo
2. Revisa el log: `notificaciones.log`
3. Ejecuta manualmente para ver errores

### **Problema: No encuentra curl**
**Solución:**
Instala curl o usa PowerShell:
```powershell
Invoke-WebRequest -Method POST -Uri "http://localhost:8000/api/notificaciones/enviar-automaticas"
```

### **Problema: Backend no responde**
**Solución:**
1. Verifica que el backend esté corriendo:
   ```cmd
   curl http://localhost:8000
   ```
2. Reinicia el backend si es necesario

---

## 📅 **Horarios Recomendados:**

### **Opción 1: Una vez al día**
- **Hora**: 9:00 AM
- **Frecuencia**: Diaria
- **Ventaja**: Simple, no molesta

### **Opción 2: Dos veces al día**
- **Horas**: 9:00 AM y 3:00 PM
- **Frecuencia**: Diaria
- **Ventaja**: Más oportunidades de cobro

### **Opción 3: Solo días laborables**
- **Días**: Lunes a Viernes
- **Hora**: 9:00 AM
- **Ventaja**: No molesta en fines de semana

---

## 💡 **Mejores Prácticas:**

1. ✅ **Ejecutar en horario laboral** (9 AM - 5 PM)
2. ✅ **No enviar en fines de semana** (opcional)
3. ✅ **Mantener log de envíos**
4. ✅ **Revisar log semanalmente**
5. ✅ **Tener backup del script**

---

## 🚀 **Próximos Pasos:**

1. **Configurar tarea programada** (Opción 1)
2. **Probar manualmente** una vez
3. **Esperar al día siguiente** para verificar
4. **Revisar log** de ejecuciones
5. **(Opcional) Integrar WhatsApp API**

---

## 📞 **Soporte:**

Si necesitas ayuda:
1. Revisa el log: `notificaciones.log`
2. Verifica que el backend esté corriendo
3. Prueba manualmente el script

---

**¡Tu sistema ahora enviará notificaciones automáticamente todos los días!** 🎉🔔
