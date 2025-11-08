"""
Modelos de datos (Pydantic)
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import date, datetime
from enum import Enum

# Enums
class PlanType(str, Enum):
    BASICO = "Basico"
    PREMIUM = "Premium"
    EMPRESARIAL = "Empresarial"

class EstadoCliente(str, Enum):
    ACTIVO = "Activo"
    SUSPENDIDO = "Suspendido"
    CANCELADO = "Cancelado"

class EstadoPago(str, Enum):
    PAGADO = "Pagado"
    PENDIENTE = "Pendiente"
    ATRASADO = "Atrasado"

class MetodoPago(str, Enum):
    EFECTIVO = "Efectivo"
    TRANSFERENCIA = "Transferencia"
    TARJETA = "Tarjeta"

class EstadoLicencia(str, Enum):
    ACTIVA = "Activa"
    SUSPENDIDA = "Suspendida"
    EXPIRADA = "Expirada"

# Modelos de Cliente
class ClienteRentaBase(BaseModel):
    nombre_empresa: str
    contacto_nombre: str
    telefono: str
    email: Optional[EmailStr] = None
    cedula: Optional[str] = None
    plan: PlanType
    precio_mensual: float
    fecha_inicio: date

class ClienteRentaCreate(ClienteRentaBase):
    pass

class ClienteRentaUpdate(BaseModel):
    nombre_empresa: Optional[str] = None
    contacto_nombre: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[EmailStr] = None
    plan: Optional[PlanType] = None
    precio_mensual: Optional[float] = None
    estado: Optional[EstadoCliente] = None

class ClienteRenta(ClienteRentaBase):
    id: int
    estado: EstadoCliente
    licencia_key: str
    fecha_creacion: datetime
    dias_hasta_vencimiento: Optional[int] = None
    proximo_pago: Optional[date] = None
    
    class Config:
        from_attributes = True

# Modelos de Pago
class PagoRentaBase(BaseModel):
    monto: float
    fecha_pago: date
    fecha_vencimiento: date
    metodo_pago: Optional[MetodoPago] = None
    referencia: Optional[str] = None
    notas: Optional[str] = None

class PagoRentaCreate(PagoRentaBase):
    cliente_renta_id: int

class PagoRenta(PagoRentaBase):
    id: int
    cliente_renta_id: int
    estado: EstadoPago
    dias_atraso: int
    registrado_por: Optional[str] = None
    fecha_creacion: datetime
    
    class Config:
        from_attributes = True

# Modelos de Licencia
class LicenciaBase(BaseModel):
    licencia_key: str
    fecha_activacion: date
    fecha_expiracion: date
    dispositivo_id: Optional[str] = None

class LicenciaCreate(LicenciaBase):
    cliente_renta_id: int

class Licencia(LicenciaBase):
    id: int
    cliente_renta_id: int
    estado: EstadoLicencia
    ultima_conexion: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Modelos de Autenticación
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class User(BaseModel):
    id: int
    username: str
    nombre_completo: str
    email: Optional[str] = None
    rol: str
    activo: bool
    
    class Config:
        from_attributes = True


class UserSetup(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=6, max_length=128)
    nombre_completo: str = Field(min_length=3, max_length=120)
    email: Optional[EmailStr] = None

# Modelos de Dashboard
class ResumenMes(BaseModel):
    por_cobrar: float
    cobrado: float
    pendiente: float

class EstadoClientes(BaseModel):
    al_dia: int
    por_vencer: int
    atrasados: int

class DashboardData(BaseModel):
    resumen_mes: ResumenMes
    estado_clientes: EstadoClientes
    total_clientes: int
    ingresos_proyectados: float

# Modelo de Notificación
class Notificacion(BaseModel):
    id: int
    cliente_renta_id: int
    tipo: str
    mensaje: str
    leida: bool
    fecha_creacion: datetime
    nombre_empresa: Optional[str] = None
    
    class Config:
        from_attributes = True
