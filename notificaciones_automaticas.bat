@echo off
:: ============================================
:: ANTHONY SYSTEM - Notificaciones Automáticas
:: Script para enviar notificaciones diarias
:: ============================================

echo.
echo ========================================
echo   ANTHONY SYSTEM
echo   Notificaciones Automáticas
echo ========================================
echo.

:: Llamar al endpoint de notificaciones
curl -X POST http://localhost:8000/api/notificaciones/enviar-automaticas

echo.
echo ========================================
echo   Proceso completado
echo ========================================
echo.

:: Registrar en log
echo [%date% %time%] Notificaciones ejecutadas >> notificaciones.log

pause
