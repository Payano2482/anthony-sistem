@echo off
echo ========================================
echo   ANTHONY SYSTEM - Iniciando Frontend
echo ========================================
echo.

cd frontend

echo [1/2] Verificando dependencias...
if not exist "node_modules" (
    echo Instalando dependencias...
    call npm install
) else (
    echo Dependencias encontradas.
)

echo.
echo [2/2] Iniciando aplicacion web...
echo.
echo Frontend disponible en: http://localhost:3000
echo.
echo Usuario: admin
echo Password: admin123
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

call npm run dev

pause
