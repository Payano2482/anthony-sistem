"""
Script de inicialización de la aplicación
Se ejecuta antes de iniciar el servidor
"""
import os
import sys

# Agregar el directorio actual al path
sys.path.insert(0, os.path.dirname(__file__))

from database.init_db import init_database
from auth import users_exist, create_user

def init_app():
    """Inicializa la aplicación"""
    print("🚀 Inicializando aplicación...")
    
    # 1. Inicializar base de datos
    print("📊 Inicializando base de datos...")
    try:
        init_database()
        print("✅ Base de datos inicializada")
    except Exception as e:
        print(f"⚠️  Error al inicializar base de datos: {e}")
    
    # 2. Crear usuario admin si no existe
    print("👤 Verificando usuario administrador...")
    try:
        if not users_exist():
            user = create_user(
                username="admin",
                password="admin123",
                nombre_completo="Administrador",
                email=None,
                rol="superadmin",
                activo=True,
            )
            print("✅ Usuario administrador creado:")
            print(f"   Username: {user['username']}")
            print(f"   Password: admin123")
        else:
            print("✅ Usuario administrador ya existe")
    except Exception as e:
        print(f"⚠️  Error al crear usuario: {e}")
    
    print("🎉 Inicialización completada\n")

if __name__ == "__main__":
    init_app()
