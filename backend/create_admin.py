"""
Script auxiliar para crear el primer usuario administrador.

Uso:
    python create_admin.py --username admin --password admin123 --nombre "Administrador"
"""

import argparse

from auth import users_exist, create_user


def main():
    parser = argparse.ArgumentParser(description="Crear usuario administrador inicial")
    parser.add_argument("--username", default="admin", help="Nombre de usuario (por defecto: admin)")
    parser.add_argument("--password", default="admin123", help="Contraseña (por defecto: admin123)")
    parser.add_argument("--nombre", default="Administrador", help="Nombre completo")
    parser.add_argument("--email", default=None, help="Correo electrónico (opcional)")
    args = parser.parse_args()

    if users_exist():
        print("Ya existen usuarios registrados. No se creó un nuevo administrador.")
        return

    user = create_user(
        username=args.username,
        password=args.password,
        nombre_completo=args.nombre,
        email=args.email,
        rol="superadmin",
        activo=True,
    )

    print("Usuario administrador creado correctamente:")
    print(f"  Username: {user['username']}")
    print(f"  Nombre: {user['nombre_completo']}")
    if user.get("email"):
        print(f"  Email: {user['email']}")


if __name__ == "__main__":
    main()

