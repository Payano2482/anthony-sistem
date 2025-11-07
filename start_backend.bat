@echo off
echo ========================================
echo   ANTHONY SYSTEM - Iniciando Backend
echo ========================================
echo.

cd backend

echo [1/3] Verificando base de datos...
if not exist "database\anthony_system.db" (
    echo Base de datos no encontrada. Inicializando...
    python database\init_db.py
) else (
    echo Base de datos encontrada.
)

echo.
echo [2/3] Verificando dependencias...
pip install -q -r requirements.txt

echo.
echo [3/3] Iniciando servidor...
echo.
echo Backend disponible en: http://localhost:8000
echo Documentacion API: http://localhost:8000/docs
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

python main.py

pause
