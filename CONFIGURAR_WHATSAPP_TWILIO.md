# 📱 Configurar WhatsApp con Twilio - Nivel 3

## Anthony System - Envío Automático de Mensajes

---

## 🎯 **¿Qué Lograrás?**

Con esta configuración, el sistema enviará **automáticamente** mensajes de WhatsApp a tus clientes:
- ✅ **Sin intervención manual**
- ✅ **Todos los días a las 9 AM**
- ✅ **Solo a clientes con 5+ días de mora**
- ✅ **Mensajes profesionales y personalizados**
- ✅ **Incluye cuentas bancarias**

---

## 📋 **Requisitos:**

1. ✅ Cuenta de Twilio (Gratis para empezar)
2. ✅ Número de teléfono verificado
3. ✅ Tarjeta de crédito (para activar cuenta)
4. ✅ ~$20 USD de crédito inicial

---

## 🚀 **Paso 1: Crear Cuenta en Twilio**

### **1.1 Registrarse:**
1. Ve a: https://www.twilio.com/try-twilio
2. Completa el formulario:
   - Email
   - Contraseña
   - Nombre
3. Verifica tu email
4. Verifica tu número de teléfono

### **1.2 Configurar Cuenta:**
1. Selecciona: **"WhatsApp"** como producto
2. Selecciona: **"Notifications, 2-way conversations"**
3. Lenguaje: **Python**
4. Haz clic en: **"Get Started with Twilio"**

---

## 🔑 **Paso 2: Obtener Credenciales**

### **2.1 Account SID y Auth Token:**
1. Ve al Dashboard: https://console.twilio.com/
2. En la parte superior verás:
   - **Account SID**: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **Auth Token**: Haz clic en "Show" para verlo
3. **¡CÓPIALOS!** Los necesitarás después

### **2.2 Número de WhatsApp:**
Twilio te da un número de prueba:
- **Sandbox Number**: `+1 415 523 8886`
- Este número es GRATIS para pruebas
- Puedes enviar hasta 1000 mensajes gratis

---

## 📱 **Paso 3: Activar WhatsApp Sandbox**

### **3.1 Configurar Sandbox:**
1. Ve a: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
2. Verás un código como: `join <palabra-clave>`
3. Ejemplo: `join anthony-system`

### **3.2 Activar tu WhatsApp:**
1. Abre WhatsApp en tu teléfono
2. Envía un mensaje a: `+1 415 523 8886`
3. Mensaje: `join anthony-system` (usa TU palabra clave)
4. Recibirás confirmación: "You are all set!"

### **3.3 Activar WhatsApp de tus Clientes:**
Cada cliente debe hacer lo mismo:
1. Enviar a `+1 415 523 8886`
2. Mensaje: `join anthony-system`
3. Confirmar

**IMPORTANTE:** En modo Sandbox, cada número debe unirse primero.

---

## ⚙️ **Paso 4: Configurar en Anthony System**

### **4.1 Instalar Dependencias:**
```bash
cd C:\AnthonySistem.App\backend
pip install twilio==8.10.0
```

### **4.2 Crear archivo .env:**
1. Copia `.env.example` a `.env`:
   ```cmd
   copy .env.example .env
   ```

2. Edita `.env` con tus credenciales:
   ```env
   # Twilio WhatsApp Configuration
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=tu_auth_token_aqui
   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
   WHATSAPP_ENABLED=true
   ```

### **4.3 Reemplazar Valores:**
- `TWILIO_ACCOUNT_SID`: Tu Account SID de Twilio
- `TWILIO_AUTH_TOKEN`: Tu Auth Token de Twilio
- `TWILIO_WHATSAPP_FROM`: Déjalo como está (número sandbox)
- `WHATSAPP_ENABLED`: Cambia a `true`

---

## 🧪 **Paso 5: Probar el Sistema**

### **5.1 Reiniciar Backend:**
```cmd
cd C:\AnthonySistem.App\backend
python main.py
```

### **5.2 Probar Manualmente:**
```cmd
curl -X POST http://localhost:8000/api/notificaciones/enviar-automaticas
```

### **5.3 Verificar:**
1. Deberías recibir un mensaje en WhatsApp
2. Revisa el log: `notificaciones.log`
3. Verifica en Twilio Console: https://console.twilio.com/us1/monitor/logs/sms

---

## 💰 **Costos de Twilio:**

### **Modo Sandbox (Gratis):**
- ✅ 1000 mensajes gratis
- ✅ Perfecto para pruebas
- ❌ Cada número debe unirse con `join`
- ❌ Aparece "Twilio Sandbox" en mensajes

### **Modo Producción:**
- 💰 **$0.005 USD por mensaje** (~5 centavos por 10 mensajes)
- ✅ Sin límite de mensajes
- ✅ Tu propio número de WhatsApp
- ✅ Mensajes profesionales
- ✅ No requiere `join`

**Ejemplo de Costos:**
```
10 clientes × 30 días = 300 mensajes/mes
300 mensajes × $0.005 = $1.50 USD/mes
```

---

## 🏢 **Paso 6: Pasar a Producción (Opcional)**

### **6.1 Solicitar Número Propio:**
1. Ve a: https://console.twilio.com/us1/develop/sms/senders/whatsapp-senders
2. Haz clic en: **"Request to enable your Twilio number for WhatsApp"**
3. Completa el formulario
4. Espera aprobación (1-3 días)

### **6.2 Actualizar Configuración:**
```env
TWILIO_WHATSAPP_FROM=whatsapp:+1tu_numero_aqui
```

### **6.3 Ventajas:**
- ✅ Sin "Sandbox" en mensajes
- ✅ Clientes no necesitan `join`
- ✅ Más profesional
- ✅ Sin límites

---

## 📊 **Monitoreo y Logs:**

### **Ver Mensajes Enviados:**
1. Twilio Console: https://console.twilio.com/us1/monitor/logs/sms
2. Filtrar por: WhatsApp
3. Ver estado: Delivered, Failed, etc.

### **Ver Log Local:**
```cmd
type C:\AnthonySistem.App\notificaciones.log
```

### **Verificar Crédito:**
1. Twilio Console
2. Billing: https://console.twilio.com/us1/billing
3. Ver balance y uso

---

## 🔧 **Solución de Problemas:**

### **Error: "Unable to create record"**
**Causa:** El número no está en el Sandbox
**Solución:** El cliente debe enviar `join anthony-system` primero

### **Error: "Authentication failed"**
**Causa:** Credenciales incorrectas
**Solución:** Verifica Account SID y Auth Token en `.env`

### **Error: "Invalid 'To' Phone Number"**
**Causa:** Formato de teléfono incorrecto
**Solución:** Debe ser +1809XXXXXXX (con código de país)

### **Mensajes no llegan:**
**Solución:**
1. Verifica que WHATSAPP_ENABLED=true
2. Revisa Twilio Console logs
3. Verifica que el número esté en Sandbox
4. Confirma que tienes crédito

---

## 📱 **Formato de Mensajes:**

### **Notificación de Mora:**
```
⚠️ NOTIFICACIÓN DE PAGO VENCIDO
ANTHONY SYSTEM

Hola Juan Pérez,

Tu pago mensual está VENCIDO:

💰 Monto: $150.00
📅 Fecha de vencimiento: 01/11/2024
⏰ Días laborables de mora: 5

🚫 Tu servicio está SUSPENDIDO por falta de pago

Deposita en cualquiera de estas cuentas:

🔴 BHD León
Cuenta: 06584350073
A nombre de: Antonio Payano

🔵 Banreservas
Cuenta: 9608461925
A nombre de: Antonio Payano

📱 Después de depositar, envía tu comprobante por WhatsApp.

Anthony System - Gestión de Rentas
```

---

## 🎯 **Flujo Automático Completo:**

```
9:00 AM cada día
    ↓
Script ejecuta automáticamente
    ↓
Backend identifica clientes con 5+ días mora
    ↓
Para cada cliente:
    ↓
    Formatea teléfono (+1809XXXXXXX)
    ↓
    Crea mensaje personalizado
    ↓
    Envía por Twilio WhatsApp API
    ↓
    Registra resultado (éxito/error)
    ↓
Guarda log completo
    ↓
Proceso completado
```

---

## 💡 **Mejores Prácticas:**

1. ✅ **Prueba primero** en Sandbox
2. ✅ **Monitorea logs** diariamente
3. ✅ **Revisa crédito** semanalmente
4. ✅ **Backup de credenciales** en lugar seguro
5. ✅ **No compartas** Auth Token
6. ✅ **Rota credenciales** cada 6 meses

---

## 🔐 **Seguridad:**

### **Proteger Credenciales:**
1. ✅ Nunca subas `.env` a Git
2. ✅ Usa variables de entorno en producción
3. ✅ Rota Auth Token periódicamente
4. ✅ Limita acceso al servidor

### **Regenerar Auth Token:**
1. Twilio Console
2. Settings → API Keys
3. Create new key
4. Actualiza `.env`

---

## 📞 **Soporte Twilio:**

- **Documentación**: https://www.twilio.com/docs/whatsapp
- **Support**: https://support.twilio.com/
- **Status**: https://status.twilio.com/
- **Pricing**: https://www.twilio.com/whatsapp/pricing

---

## ✅ **Checklist de Configuración:**

- [ ] Cuenta Twilio creada
- [ ] Número verificado
- [ ] Account SID copiado
- [ ] Auth Token copiado
- [ ] Sandbox activado
- [ ] Tu WhatsApp unido al Sandbox
- [ ] `.env` configurado
- [ ] Dependencias instaladas
- [ ] Backend reiniciado
- [ ] Prueba manual exitosa
- [ ] Tarea programada configurada
- [ ] Primer mensaje automático enviado

---

## 🎉 **¡Listo!**

Tu sistema ahora:
- ✅ Envía mensajes automáticamente
- ✅ Todos los días a las 9 AM
- ✅ Solo a clientes morosos
- ✅ Por WhatsApp oficial
- ✅ Sin intervención manual

**¡Bienvenido al Nivel 3!** 🚀📱💬
