"""
Sistema de Autenticación JWT
"""
from datetime import datetime, timedelta
from typing import Optional
import sqlite3
from sqlite3 import IntegrityError

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from config import settings

# Configuración de seguridad
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica una contraseña contra su hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Genera el hash de una contraseña"""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Crea un token JWT"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> dict:
    """Verifica y decodifica un token JWT"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido"
            )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado"
        )


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Obtiene el usuario actual desde el token"""
    token = credentials.credentials
    payload = verify_token(token)
    username = payload.get("sub")
    
    conn = sqlite3.connect(settings.DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM usuarios WHERE username = ? AND activo = 1", (username,))
    user = cursor.fetchone()
    conn.close()
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado"
        )
    
    return dict(user)


def authenticate_user(username: str, password: Optional[str]):
    """Autentica un usuario con verificación opcional de contraseña"""
    conn = sqlite3.connect(settings.DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM usuarios WHERE username = ? AND activo = 1", (username,))
    user = cursor.fetchone()
    conn.close()
    
    if not user:
        return False
    
    if password is None:
        # Permite autenticación sin contraseña (ej. WebAuthn)
        return dict(user)
    
    if not verify_password(password, user["password_hash"]):
        return False
    
    return dict(user)


def users_exist() -> bool:
    """Verifica si existen usuarios registrados"""
    conn = sqlite3.connect(settings.DATABASE_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM usuarios")
    count = cursor.fetchone()[0]
    conn.close()
    return count > 0


def create_user(
    username: str,
    password: str,
    nombre_completo: str,
    email: Optional[str] = None,
    rol: str = "superadmin",
    activo: bool = True,
):
    """Crea un usuario nuevo"""
    conn = sqlite3.connect(settings.DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    password_hash = get_password_hash(password)
    
    try:
        cursor.execute(
            """
            INSERT INTO usuarios (username, password_hash, nombre_completo, email, rol, activo)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                username,
                password_hash,
                nombre_completo,
                email,
                rol,
                1 if activo else 0,
            ),
        )
        conn.commit()
        user_id = cursor.lastrowid
        cursor.execute("SELECT * FROM usuarios WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        return dict(user)
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El nombre de usuario ya está en uso",
        )
    finally:
        conn.close()
