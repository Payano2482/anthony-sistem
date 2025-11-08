import requests
import json
from auth import (
    authenticate_user,
    get_password_hash,
    users_exist,
    create_user,
)

print("=" * 60)
print("PRUEBA DE AUTENTICACIÓN")
print("=" * 60)

# Crear usuario temporal si no existe
if not users_exist():
    print("\n⚠️  No existen usuarios. Creando usuario temporal 'admin'...")
    create_user("admin", "admin123", "Administrador Temporal")
    print("   Usuario creado.")

# Probar autenticación directa
print("\n1. Probando función authenticate_user...")
user = authenticate_user("admin", "admin123")
if user:
    print(f"✅ Autenticación exitosa!")
    print(f"   Usuario: {user['username']}")
    print(f"   Nombre: {user['nombre_completo']}")
    print(f"   Rol: {user['rol']}")
else:
    print("❌ Autenticación fallida")

# Probar endpoint API
print("\n2. Probando endpoint /api/auth/login...")
try:
    response = requests.post(
        "http://localhost:8000/api/auth/login",
        json={"username": "admin", "password": "admin123"}
    )
    print(f"   Status Code: {response.status_code}")
    if response.status_code == 200:
        print("✅ Login exitoso via API!")
        data = response.json()
        print(f"   Token recibido: {data['access_token'][:50]}...")
    else:
        print(f"❌ Error: {response.text}")
except Exception as e:
    print(f"❌ Error al conectar: {e}")

# Generar nuevo hash para verificar
print("\n3. Generando nuevo hash de 'admin123'...")
new_hash = get_password_hash("admin123")
print(f"   Hash generado: {new_hash}")

print("\n" + "=" * 60)
