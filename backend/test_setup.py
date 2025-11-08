import requests

payload = {
    "username": "admin",
    "password": "admin123",
    "nombre_completo": "Administrador",
    "email": "admin@example.com"
}

response = requests.post("http://127.0.0.1:8000/api/auth/setup", json=payload)

print("Status:", response.status_code)
print("Body:", response.text)

