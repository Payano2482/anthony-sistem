"""
Script de inicio para Railway
"""
import os
import sys

# Obtener el puerto de la variable de entorno
port = os.environ.get('PORT', '8000')

print(f"🚀 Iniciando servidor en puerto: {port}")
print(f"📊 Variables de entorno PORT: {os.environ.get('PORT', 'NO DEFINIDA')}")

# Verificar que el puerto sea válido
try:
    port_int = int(port)
    print(f"✅ Puerto válido: {port_int}")
except ValueError:
    print(f"❌ Puerto inválido: {port}, usando 8000 por defecto")
    port_int = 8000

# Iniciar uvicorn
import uvicorn
uvicorn.run("main:app", host="0.0.0.0", port=port_int)
