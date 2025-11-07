"""
Configuración de la aplicación
"""
from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    # Seguridad
    SECRET_KEY: str = "anthony_system_secret_key_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 horas
    
    # Base de datos
    DATABASE_PATH: str = "database/anthony_system.db"
    
    # CORS
    CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:5173"]
    
    # Twilio WhatsApp
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_WHATSAPP_FROM: str = "whatsapp:+14155238886"
    WHATSAPP_ENABLED: bool = False
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
