"""
Anthony System - API REST
Sistema de Gestión de Rentas
"""
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import timedelta
from typing import List, Optional

from config import settings
from models import *
from auth import authenticate_user, create_access_token, get_current_user
from database_service import db_service
import webauthn_service

# Crear aplicación
app = FastAPI(
    title="Anthony System API",
    description="Sistema de Gestión de Rentas",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== AUTENTICACIÓN ====================

@app.post("/api/auth/login", response_model=Token, tags=["Autenticación"])
async def login(user_data: UserLogin):
    """Iniciar sesión"""
    user = authenticate_user(user_data.username, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos"
        )
    
    access_token = create_access_token(
        data={"sub": user["username"]},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/me", response_model=User, tags=["Autenticación"])
async def get_me(current_user: dict = Depends(get_current_user)):
    """Obtener usuario actual"""
    return {
        "id": current_user["id"],
        "username": current_user["username"],
        "nombre_completo": current_user["nombre_completo"],
        "email": current_user.get("email"),
        "rol": current_user["rol"],
        "activo": bool(current_user["activo"])
    }

# ==================== DASHBOARD ====================

@app.get("/api/dashboard", response_model=DashboardData, tags=["Dashboard"])
async def get_dashboard(current_user: dict = Depends(get_current_user)):
    """Obtener datos del dashboard"""
    return db_service.get_dashboard_data()

# ==================== CLIENTES ====================

@app.get("/api/clientes", response_model=List[ClienteRenta], tags=["Clientes"])
async def get_clientes(
    estado: Optional[EstadoCliente] = None,
    current_user: dict = Depends(get_current_user)
):
    """Obtener lista de clientes"""
    clientes = db_service.get_clientes(estado.value if estado else None)
    return clientes

@app.get("/api/clientes/{cliente_id}", response_model=ClienteRenta, tags=["Clientes"])
async def get_cliente(
    cliente_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Obtener detalle de un cliente"""
    cliente = db_service.get_cliente(cliente_id)
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return cliente

@app.post("/api/clientes", response_model=ClienteRenta, tags=["Clientes"])
async def create_cliente(
    cliente: ClienteRentaCreate,
    current_user: dict = Depends(get_current_user)
):
    """Crear nuevo cliente"""
    cliente_data = cliente.model_dump()
    cliente_data['fecha_inicio'] = cliente_data['fecha_inicio'].isoformat()
    return db_service.create_cliente(cliente_data)

@app.put("/api/clientes/{cliente_id}", response_model=ClienteRenta, tags=["Clientes"])
async def update_cliente(
    cliente_id: int,
    cliente: ClienteRentaUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Actualizar cliente"""
    update_data = {k: v for k, v in cliente.model_dump().items() if v is not None}
    updated = db_service.update_cliente(cliente_id, update_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return updated

@app.post("/api/clientes/{cliente_id}/suspend", tags=["Clientes"])
async def suspend_cliente(
    cliente_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Suspender acceso de un cliente"""
    success = db_service.suspend_license(cliente_id)
    if not success:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return {"message": "Cliente suspendido exitosamente"}

# ==================== PAGOS ====================

@app.get("/api/clientes/{cliente_id}/pagos", response_model=List[PagoRenta], tags=["Pagos"])
async def get_pagos_cliente(
    cliente_id: int,
    limit: int = 6,
    current_user: dict = Depends(get_current_user)
):
    """Obtener historial de pagos de un cliente"""
    return db_service.get_pagos_cliente(cliente_id, limit)

@app.post("/api/pagos", response_model=PagoRenta, tags=["Pagos"])
async def create_pago(
    pago: PagoRentaCreate,
    current_user: dict = Depends(get_current_user)
):
    """Registrar un nuevo pago"""
    pago_data = pago.model_dump()
    pago_data['fecha_pago'] = pago_data['fecha_pago'].isoformat()
    pago_data['fecha_vencimiento'] = pago_data['fecha_vencimiento'].isoformat()
    return db_service.create_pago(pago_data, current_user["username"])

# ==================== LICENCIAS ====================

@app.get("/api/licencias/verify/{licencia_key}", tags=["Licencias"])
async def verify_license(licencia_key: str):
    """Verificar estado de una licencia (endpoint público para el sistema de escritorio)"""
    return db_service.verify_license(licencia_key)

# ==================== CÉDULA JCE ====================

@app.get("/api/cedula/{cedula}", tags=["Utilidades"])
async def consultar_cedula(cedula: str):
    """Consultar cédula en la JCE"""
    import requests
    
    try:
        # Limpiar cédula
        cedula_limpia = cedula.replace('-', '')
        
        # Intentar con diferentes APIs
        apis = [
            f"https://api.digital.gob.do/v3/cedulas/{cedula_limpia}/validate",
            f"https://api.adamix.net/apec/cedula/{cedula_limpia}",
        ]
        
        for api_url in apis:
            try:
                response = requests.get(api_url, timeout=5)
                if response.status_code == 200:
                    data = response.json()
                    
                    # Normalizar respuesta según la API
                    if 'valid' in data and data.get('valid'):
                        persona = data.get('data', {})
                        return {
                            "success": True,
                            "data": {
                                "nombres": persona.get('nombres', ''),
                                "apellido1": persona.get('apellido1', ''),
                                "apellido2": persona.get('apellido2', ''),
                                "nombre_completo": f"{persona.get('nombres', '')} {persona.get('apellido1', '')} {persona.get('apellido2', '')}".strip(),
                                "foto": persona.get('foto')
                            }
                        }
                    elif 'nombres' in data:
                        return {
                            "success": True,
                            "data": {
                                "nombres": data.get('nombres', ''),
                                "apellido1": data.get('apellido1', ''),
                                "apellido2": data.get('apellido2', ''),
                                "nombre_completo": f"{data.get('nombres', '')} {data.get('apellido1', '')} {data.get('apellido2', '')}".strip(),
                                "foto": data.get('foto')
                            }
                        }
            except:
                continue
        
        return {"success": False, "message": "Cédula no encontrada"}
    except Exception as e:
        return {"success": False, "message": str(e)}

# ==================== NOTIFICACIONES AUTOMÁTICAS ====================

@app.get("/api/notificaciones/automaticas", tags=["Notificaciones"])
async def obtener_clientes_para_notificar():
    """Obtener clientes que necesitan notificación automática (5 días laborables de mora)"""
    from datetime import datetime, timedelta
    
    def calcular_proximo_vencimiento(fecha_inicio):
        inicio = datetime.strptime(fecha_inicio, '%Y-%m-%d')
        hoy = datetime.now()
        dias_desde_inicio = (hoy - inicio).days
        meses_completos = dias_desde_inicio // 30
        proximo_vencimiento = inicio + timedelta(days=(meses_completos + 1) * 30)
        return proximo_vencimiento
    
    def contar_dias_laborables(fecha_inicio, fecha_fin):
        dias_laborables = 0
        fecha_actual = fecha_inicio
        while fecha_actual <= fecha_fin:
            if fecha_actual.weekday() < 5:  # 0-4 = Lunes a Viernes
                dias_laborables += 1
            fecha_actual += timedelta(days=1)
        return dias_laborables
    
    clientes = db_service.get_all_clientes()
    clientes_para_notificar = []
    
    for cliente in clientes:
        proximo_vencimiento = calcular_proximo_vencimiento(cliente['fecha_inicio'])
        hoy = datetime.now()
        
        # Solo si ya venció
        if proximo_vencimiento < hoy:
            dias_laborables_vencidos = contar_dias_laborables(proximo_vencimiento, hoy)
            
            # Si han pasado exactamente 5 días laborables o más
            if dias_laborables_vencidos >= 5:
                clientes_para_notificar.append({
                    **cliente,
                    'dias_mora': dias_laborables_vencidos,
                    'fecha_vencimiento': proximo_vencimiento.strftime('%Y-%m-%d')
                })
    
    return {
        "total": len(clientes_para_notificar),
        "clientes": clientes_para_notificar
    }

@app.post("/api/notificaciones/enviar-automaticas", tags=["Notificaciones"])
async def enviar_notificaciones_automaticas():
    """Enviar notificaciones automáticas a clientes con 5+ días de mora"""
    from whatsapp_service import whatsapp_service
    
    resultado = await obtener_clientes_para_notificar()
    
    enviados = []
    errores = []
    
    # Enviar por WhatsApp si está habilitado
    if settings.WHATSAPP_ENABLED:
        for cliente in resultado['clientes']:
            resultado_envio = whatsapp_service.enviar_notificacion_mora(
                cliente=cliente,
                dias_mora=cliente['dias_mora'],
                fecha_vencimiento=cliente['fecha_vencimiento']
            )
            
            if resultado_envio['success']:
                enviados.append({
                    "cliente": cliente['nombre_empresa'],
                    "telefono": cliente['telefono'],
                    "message_sid": resultado_envio.get('message_sid')
                })
            else:
                errores.append({
                    "cliente": cliente['nombre_empresa'],
                    "error": resultado_envio.get('error', 'Error desconocido')
                })
    
    return {
        "success": True,
        "whatsapp_enabled": settings.WHATSAPP_ENABLED,
        "total_clientes": resultado['total'],
        "mensajes_enviados": len(enviados),
        "mensajes_fallidos": len(errores),
        "enviados": enviados,
        "errores": errores,
        "fecha_ejecucion": datetime.now().isoformat()
    }

# ==================== HEALTH CHECK ====================

@app.get("/", tags=["Sistema"])
async def root():
    """Health check"""
    return {
        "app": "Anthony System API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health", tags=["Sistema"])
async def health():
    """Health check detallado"""
    return {
        "status": "healthy",
        "database": "connected"
    }

# ==================== WEBAUTHN (BIOMETRÍA REAL) ====================

@app.post("/api/webauthn/register/begin", tags=["WebAuthn"])
async def webauthn_register_begin(current_user: dict = Depends(get_current_user)):
    """Iniciar registro de credencial biométrica"""
    user_id = str(current_user["id"])
    username = current_user["username"]
    
    result = webauthn_service.generate_registration_challenge(user_id, username)
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result.get("error", "Error al generar desafío"))
    
    return result["options"]

@app.post("/api/webauthn/register/complete", tags=["WebAuthn"])
async def webauthn_register_complete(
    credential: dict,
    current_user: dict = Depends(get_current_user)
):
    """Completar registro de credencial biométrica"""
    user_id = str(current_user["id"])
    
    result = webauthn_service.verify_registration(user_id, credential)
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result.get("error", "Error al verificar credencial"))
    
    return {"success": True, "message": "Credencial biométrica registrada exitosamente"}

@app.post("/api/webauthn/auth/begin", tags=["WebAuthn"])
async def webauthn_auth_begin(username: str):
    """Iniciar autenticación biométrica"""
    # Buscar usuario por username
    user = authenticate_user(username, None)
    if not user:
        # No revelar si el usuario existe o no
        raise HTTPException(status_code=400, detail="Error al generar desafío")
    
    user_id = str(user["id"])
    
    result = webauthn_service.generate_authentication_challenge(user_id)
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result.get("error", "Error al generar desafío"))
    
    return result["options"]

@app.post("/api/webauthn/auth/complete", tags=["WebAuthn"])
async def webauthn_auth_complete(username: str, credential: dict):
    """Completar autenticación biométrica"""
    # Buscar usuario
    user = authenticate_user(username, None)
    if not user:
        raise HTTPException(status_code=401, detail="Autenticación fallida")
    
    user_id = str(user["id"])
    
    result = webauthn_service.verify_authentication(user_id, credential)
    
    if not result["success"] or not result.get("verified"):
        raise HTTPException(status_code=401, detail="Autenticación biométrica fallida")
    
    # Generar token de acceso
    access_token = create_access_token(
        data={"sub": user["username"]},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/webauthn/has-credentials", tags=["WebAuthn"])
async def webauthn_has_credentials(current_user: dict = Depends(get_current_user)):
    """Verificar si el usuario tiene credenciales biométricas"""
    user_id = str(current_user["id"])
    has_creds = webauthn_service.has_credentials(user_id)
    return {"has_credentials": has_creds}

@app.delete("/api/webauthn/credentials", tags=["WebAuthn"])
async def webauthn_delete_credentials(current_user: dict = Depends(get_current_user)):
    """Eliminar credenciales biométricas del usuario"""
    user_id = str(current_user["id"])
    deleted = webauthn_service.delete_credentials(user_id)
    
    if not deleted:
        raise HTTPException(status_code=404, detail="No se encontraron credenciales")
    
    return {"success": True, "message": "Credenciales eliminadas"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
