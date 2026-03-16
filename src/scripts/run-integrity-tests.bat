@echo off
REM 🧪 Script para correr Tests de Integridad de Datos (Windows)
REM Autor: Sistema de Testing
REM Fecha: Noviembre 20, 2024

echo.
echo ===============================================
echo    TESTS DE INTEGRIDAD DE DATOS
echo ===============================================
echo.

REM Verificar que estamos en la raíz del proyecto
if not exist "vitest.config.ts" (
    echo ❌ Error: No se encontró vitest.config.ts
    echo    Por favor ejecuta este script desde la raíz del proyecto
    pause
    exit /b 1
)

REM Verificar que existe la carpeta de tests
if not exist "tests\integration\data-integrity" (
    echo ❌ Error: No se encontró la carpeta de tests
    echo    Esperado: tests\integration\data-integrity\
    pause
    exit /b 1
)

REM Verificar que Node está instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error: Node.js no está instalado
    echo    Por favor instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

echo 📋 Configuración:
node --version
npm --version
echo.

REM Verificar que Vitest está instalado
npx vitest --version >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Vitest no está instalado
    echo    Instalando dependencias...
    npm install -D vitest @testing-library/react @testing-library/user-event jsdom
    echo.
)

echo 🚀 Iniciando tests...
echo.

REM Correr tests
if "%1"=="" (
    echo    Corriendo: TODOS los tests de integridad (20 tests)
    echo.
    npx vitest tests/integration/data-integrity --run
) else (
    echo    Corriendo: Tests de %1
    echo.
    npx vitest %1 --run
)

REM Capturar el exit code
set TEST_EXIT_CODE=%ERRORLEVEL%

echo.
echo ==============================================

REM Mostrar resultado final
if %TEST_EXIT_CODE% EQU 0 (
    echo ✅ ¡TODOS LOS TESTS PASARON!
    echo.
    echo    ✓ Datos se guardan correctamente
    echo    ✓ Persistencia verificada
    echo    ✓ Integridad de campos OK
    echo    ✓ La app está lista para deploy
    echo.
) else (
    echo ❌ ALGUNOS TESTS FALLARON
    echo.
    echo    ✗ Hay bugs de persistencia de datos
    echo    ✗ NO hacer deploy hasta corregir
    echo    ✗ Revisar los errores arriba
    echo.
    echo    💡 Tips para debugging:
    echo       1. Revisar el error específico en el output
    echo       2. Correr test individual: run-integrity-tests.bat budget-persistence
    echo       3. Modo verbose: npx vitest [test-name] --reporter=verbose
    echo.
)

echo ==============================================
echo.

pause
exit /b %TEST_EXIT_CODE%
