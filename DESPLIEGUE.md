# 🚀 Guía de Despliegue - Anthony System

## Opción 1: DigitalOcean (Recomendado)

### Costo: $5-10/mes

### Backend en DigitalOcean App Platform

1. **Crear cuenta en DigitalOcean**
   - https://www.digitalocean.com/

2. **Conectar repositorio**
   - App Platform → Create App
   - Conecta tu repositorio de GitHub

3. **Configurar el servicio**
   ```yaml
   name: anthony-system-backend
   services:
     - name: api
       github:
         repo: tu-usuario/AnthonySistem.App
         branch: main
         deploy_on_push: true
       source_dir: /backend
       run_command: uvicorn main:app --host 0.0.0.0 --port 8080
       environment_slug: python
       envs:
         - key: SECRET_KEY
           value: "tu_clave_super_secreta_aqui"
         - key: DATABASE_PATH
           value: "database/anthony_system.db"
       http_port: 8080
   ```

4. **Deploy**
   - Click en "Deploy"
   - Espera 5-10 minutos

### Frontend en Netlify

1. **Crear cuenta en Netlify**
   - https://www.netlify.com/

2. **Conectar repositorio**
   - New site from Git
   - Selecciona tu repositorio

3. **Configurar build**
   ```
   Base directory: frontend
   Build command: npm run build
   Publish directory: frontend/dist
   ```

4. **Variables de entorno**
   ```
   VITE_API_URL=https://tu-backend.ondigitalocean.app/api
   ```

5. **Deploy**
   - Click en "Deploy site"

---

## Opción 2: Heroku

### Costo: $7/mes (Eco Dyno)

### Backend

1. **Instalar Heroku CLI**
   ```bash
   # Windows
   winget install Heroku.HerokuCLI
   ```

2. **Login**
   ```bash
   heroku login
   ```

3. **Crear app**
   ```bash
   cd backend
   heroku create anthony-system-api
   ```

4. **Configurar variables**
   ```bash
   heroku config:set SECRET_KEY="tu_clave_secreta"
   heroku config:set DATABASE_PATH="database/anthony_system.db"
   ```

5. **Crear Procfile**
   ```
   web: uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

6. **Deploy**
   ```bash
   git push heroku main
   ```

### Frontend en Vercel

1. **Instalar Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   cd frontend
   vercel --prod
   ```

---

## Opción 3: VPS Propio (Ubuntu)

### Costo: $5/mes (DigitalOcean Droplet)

### 1. Crear Droplet

- Ubuntu 22.04 LTS
- 1GB RAM mínimo
- Configurar SSH

### 2. Conectar al servidor

```bash
ssh root@tu-ip
```

### 3. Instalar dependencias

```bash
# Actualizar sistema
apt update && apt upgrade -y

# Instalar Python
apt install python3 python3-pip python3-venv -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install nodejs -y

# Instalar Nginx
apt install nginx -y

# Instalar Certbot (SSL)
apt install certbot python3-certbot-nginx -y
```

### 4. Clonar proyecto

```bash
cd /var/www
git clone https://github.com/tu-usuario/AnthonySistem.App.git
cd AnthonySistem.App
```

### 5. Configurar Backend

```bash
cd backend

# Crear entorno virtual
python3 -m venv venv
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Inicializar BD
python database/init_db.py

# Configurar variables
nano .env
# Edita y guarda
```

### 6. Crear servicio systemd

```bash
nano /etc/systemd/system/anthony-backend.service
```

Contenido:
```ini
[Unit]
Description=Anthony System Backend
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/AnthonySistem.App/backend
Environment="PATH=/var/www/AnthonySistem.App/backend/venv/bin"
ExecStart=/var/www/AnthonySistem.App/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000

[Install]
WantedBy=multi-user.target
```

Activar:
```bash
systemctl enable anthony-backend
systemctl start anthony-backend
systemctl status anthony-backend
```

### 7. Configurar Frontend

```bash
cd /var/www/AnthonySistem.App/frontend

# Instalar dependencias
npm install

# Build
npm run build
```

### 8. Configurar Nginx

```bash
nano /etc/nginx/sites-available/anthony-system
```

Contenido:
```nginx
server {
    listen 80;
    server_name anthonysystem.app www.anthonysystem.app;

    # Frontend
    location / {
        root /var/www/AnthonySistem.App/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Activar:
```bash
ln -s /etc/nginx/sites-available/anthony-system /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 9. Configurar SSL (HTTPS)

```bash
certbot --nginx -d anthonysystem.app -d www.anthonysystem.app
```

### 10. Configurar dominio

En tu proveedor de dominio (Namecheap, GoDaddy, etc.):

```
Tipo    Nombre    Valor
A       @         tu-ip-del-servidor
A       www       tu-ip-del-servidor
```

---

## 🔒 Seguridad en Producción

### 1. Cambiar credenciales

```bash
# Backend
cd backend
python
>>> from auth import get_password_hash
>>> get_password_hash("tu_nueva_contraseña")
# Copia el hash y actualiza en la BD
```

### 2. Configurar firewall

```bash
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable
```

### 3. Backups automáticos

```bash
# Crear script de backup
nano /usr/local/bin/backup-anthony.sh
```

Contenido:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/anthony-system"
mkdir -p $BACKUP_DIR

# Backup de base de datos
cp /var/www/AnthonySistem.App/backend/database/anthony_system.db \
   $BACKUP_DIR/anthony_system_$DATE.db

# Mantener solo últimos 30 días
find $BACKUP_DIR -name "*.db" -mtime +30 -delete
```

Hacer ejecutable y programar:
```bash
chmod +x /usr/local/bin/backup-anthony.sh
crontab -e
# Agregar: 0 2 * * * /usr/local/bin/backup-anthony.sh
```

---

## 📊 Monitoreo

### Logs del Backend

```bash
# Ver logs en tiempo real
journalctl -u anthony-backend -f

# Ver últimos 100 logs
journalctl -u anthony-backend -n 100
```

### Logs de Nginx

```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## 🔄 Actualizar la Aplicación

```bash
cd /var/www/AnthonySistem.App

# Pull cambios
git pull origin main

# Actualizar backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
systemctl restart anthony-backend

# Actualizar frontend
cd ../frontend
npm install
npm run build

# Reiniciar Nginx
systemctl restart nginx
```

---

## 💡 Tips

1. **Usa un dominio propio** - Más profesional
2. **Configura HTTPS** - Obligatorio para producción
3. **Haz backups regulares** - Automatiza con cron
4. **Monitorea el servidor** - Usa herramientas como Uptime Robot
5. **Optimiza la BD** - Considera PostgreSQL para muchos clientes

---

## 🆘 Troubleshooting

### Backend no inicia

```bash
# Ver logs
journalctl -u anthony-backend -n 50

# Verificar puerto
netstat -tlnp | grep 8000

# Reiniciar servicio
systemctl restart anthony-backend
```

### Frontend muestra error 502

```bash
# Verificar Nginx
nginx -t
systemctl status nginx

# Verificar backend
curl http://localhost:8000/health
```

### Base de datos corrupta

```bash
# Restaurar desde backup
cp /backups/anthony-system/anthony_system_FECHA.db \
   /var/www/AnthonySistem.App/backend/database/anthony_system.db
systemctl restart anthony-backend
```

---

¡Listo para producción! 🚀
