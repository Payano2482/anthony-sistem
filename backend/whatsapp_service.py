"""
Servicio de WhatsApp con Twilio
Anthony System - Sistema de Gestión de Rentas
"""
from twilio.rest import Client
from config import settings
from datetime import datetime

class WhatsAppService:
    def __init__(self):
        self.enabled = settings.WHATSAPP_ENABLED
        if self.enabled:
            self.client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            self.from_number = settings.TWILIO_WHATSAPP_FROM
    
    def enviar_notificacion_mora(self, cliente: dict, dias_mora: int, fecha_vencimiento: str) -> dict:
        """Enviar notificación de pago vencido por WhatsApp"""
        
        if not self.enabled:
            return {
                "success": False,
                "message": "WhatsApp no está habilitado. Configura WHATSAPP_ENABLED=true en .env"
            }
        
        # Formatear teléfono (debe incluir código de país)
        telefono = cliente['telefono'].replace('-', '').replace(' ', '')
        if not telefono.startswith('+'):
            # Asumir República Dominicana (+1809, +1829, +1849)
            if telefono.startswith('809') or telefono.startswith('829') or telefono.startswith('849'):
                telefono = f"+1{telefono}"
            else:
                telefono = f"+1809{telefono}"
        
        # Mensaje personalizado
        mensaje = f"""⚠️ *NOTIFICACIÓN DE PAGO VENCIDO*
*ANTHONY SISTEM*

Hola *{cliente['contacto_nombre']}*,

Tu pago mensual está *VENCIDO*:

💰 *Monto:* ${cliente['precio_mensual']}
📅 *Fecha de vencimiento:* {fecha_vencimiento}
⏰ *Días laborables de mora:* {dias_mora}

🚫 *Tu servicio está SUSPENDIDO por falta de pago*

*Deposita en cualquiera de estas cuentas:*

🔴 *BHD León*
Cuenta: *06584350073*
A nombre de: Antonio Payano

🔵 *Banreservas*
Cuenta: *9608461925*
A nombre de: Antonio Payano

📱 Después de depositar, envía tu comprobante por WhatsApp para reactivar tu servicio inmediatamente.

Gracias por tu comprensión.
_Anthony System - Gestión de Rentas_"""
        
        try:
            # Enviar mensaje
            message = self.client.messages.create(
                from_=self.from_number,
                body=mensaje,
                to=f'whatsapp:{telefono}'
            )
            
            return {
                "success": True,
                "message_sid": message.sid,
                "status": message.status,
                "to": telefono,
                "fecha_envio": datetime.now().isoformat()
            }
        
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "to": telefono
            }
    
    def enviar_confirmacion_pago(self, cliente: dict, monto: float, fecha_pago: str) -> dict:
        """Enviar confirmación de pago recibido"""
        
        if not self.enabled:
            return {"success": False, "message": "WhatsApp no habilitado"}
        
        telefono = cliente['telefono'].replace('-', '').replace(' ', '')
        if not telefono.startswith('+'):
            if telefono.startswith('809') or telefono.startswith('829') or telefono.startswith('849'):
                telefono = f"+1{telefono}"
            else:
                telefono = f"+1809{telefono}"
        
        mensaje = f"""✅ *PAGO RECIBIDO*
*ANTHONY SISTEM*

Hola *{cliente['contacto_nombre']}*,

Hemos recibido tu pago:

💰 *Monto:* ${monto}
📅 *Fecha:* {fecha_pago}
🏢 *Empresa:* {cliente['nombre_empresa']}

✅ *Tu servicio ha sido REACTIVADO*

Gracias por tu pago puntual.
_Anthony System - Gestión de Rentas_"""
        
        try:
            message = self.client.messages.create(
                from_=self.from_number,
                body=mensaje,
                to=f'whatsapp:{telefono}'
            )
            
            return {
                "success": True,
                "message_sid": message.sid,
                "status": message.status
            }
        
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def enviar_recordatorio_proximo_vencimiento(self, cliente: dict, dias_restantes: int, fecha_vencimiento: str) -> dict:
        """Enviar recordatorio de próximo vencimiento (3 días antes)"""
        
        if not self.enabled:
            return {"success": False, "message": "WhatsApp no habilitado"}
        
        telefono = cliente['telefono'].replace('-', '').replace(' ', '')
        if not telefono.startswith('+'):
            if telefono.startswith('809') or telefono.startswith('829') or telefono.startswith('849'):
                telefono = f"+1{telefono}"
            else:
                telefono = f"+1809{telefono}"
        
        mensaje = f"""🔔 *RECORDATORIO DE PAGO*
*ANTHONY SISTEM*

Hola *{cliente['contacto_nombre']}*,

Te recordamos que tu pago vence pronto:

💰 *Monto:* ${cliente['precio_mensual']}
📅 *Fecha de vencimiento:* {fecha_vencimiento}
⏰ *Días restantes:* {dias_restantes}

*Deposita en cualquiera de estas cuentas:*

🔴 *BHD León*: 06584350073
🔵 *Banreservas*: 9608461925
A nombre de: Antonio Payano

📱 Envía tu comprobante después de depositar.

Gracias.
_Anthony System_"""
        
        try:
            message = self.client.messages.create(
                from_=self.from_number,
                body=mensaje,
                to=f'whatsapp:{telefono}'
            )
            
            return {
                "success": True,
                "message_sid": message.sid,
                "status": message.status
            }
        
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

# Instancia global
whatsapp_service = WhatsAppService()
