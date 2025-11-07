"""
Inicializador de Base de Datos
Anthony System - Sistema de Gestión de Rentas
"""
import sqlite3
import os
from pathlib import Path

def init_database():
    """Inicializa la base de datos con el esquema"""
    # Crear directorio si no existe
    db_dir = Path(__file__).parent
    db_path = db_dir / "anthony_system.db"
    
    # Leer el esquema SQL
    schema_path = db_dir / "schema.sql"
    with open(schema_path, 'r', encoding='utf-8') as f:
        schema_sql = f.read()
    
    # Crear/conectar a la base de datos
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Ejecutar el esquema
    cursor.executescript(schema_sql)
    
    conn.commit()
    conn.close()
    
    print(f"✅ Base de datos inicializada: {db_path}")
    return db_path

if __name__ == "__main__":
    init_database()
