"""
Script para actualizar la contraseña del usuario admin en la base de datos SQLite.
Uso:
    python update_admin_password.py --password NUEVA_CONTRASENA [--username admin]
"""

import argparse
import sqlite3
from auth import get_password_hash
from config import settings


def update_password(username: str, new_password: str) -> None:
    """Actualiza la contraseña hasheada del usuario indicado."""
    if not new_password:
        raise ValueError("La nueva contraseña no puede estar vacía.")

    hash_nuevo = get_password_hash(new_password)

    conn = sqlite3.connect(settings.DATABASE_PATH)
    cursor = conn.cursor()

    cursor.execute(
        "UPDATE usuarios SET password_hash = ? WHERE username = ?",
        (hash_nuevo, username),
    )

    if cursor.rowcount == 0:
        conn.close()
        raise RuntimeError(f"No se encontró el usuario '{username}'.")

    conn.commit()
    conn.close()


def main():
    parser = argparse.ArgumentParser(
        description="Actualizar la contraseña de un usuario en la base de datos SQLite."
    )
    parser.add_argument(
        "--username",
        default="admin",
        help="Nombre de usuario a actualizar (por defecto: admin)",
    )
    parser.add_argument(
        "--password",
        required=True,
        help="Nueva contraseña en texto plano. Será almacenada hasheada.",
    )

    args = parser.parse_args()
    update_password(args.username, args.password)
    print(f"Contraseña actualizada correctamente para el usuario '{args.username}'.")


if __name__ == "__main__":
    main()

