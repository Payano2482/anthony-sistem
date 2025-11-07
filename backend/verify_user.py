import sqlite3

conn = sqlite3.connect('database/anthony_system.db')
cursor = conn.cursor()

cursor.execute('SELECT id, username, nombre_completo, rol, activo FROM usuarios')
print('Usuarios en la base de datos:')
print('-' * 60)
for row in cursor.fetchall():
    print(f'ID: {row[0]}')
    print(f'Usuario: {row[1]}')
    print(f'Nombre: {row[2]}')
    print(f'Rol: {row[3]}')
    print(f'Activo: {row[4]}')
    print('-' * 60)

conn.close()
print('\n✅ Ahora puedes iniciar sesión con:')
print('   Usuario: admin')
print('   Contraseña: admin123')
