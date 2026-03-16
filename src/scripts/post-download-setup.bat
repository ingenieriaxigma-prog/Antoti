@echo off
REM ========================================
REM POST-DESCARGA SETUP - OTI FINANZAS
REM ========================================
REM Script para ejecutar después de descargar el proyecto desde Figma Make
REM 
REM Uso: scripts\post-download-setup.bat

echo.
echo ╔═══════════════════════════════════════════════════════╗
echo ║                                                       ║
echo ║     POST-DESCARGA SETUP - OTI FINANZAS               ║
echo ║     Configuración automática para VS Code            ║
echo ║                                                       ║
echo ╚═══════════════════════════════════════════════════════╝
echo.

REM Verificar que estamos en la raíz del proyecto
if not exist "package.json" (
    echo ❌ Error: No se encontró package.json
    echo Por favor, ejecuta este script desde la raíz del proyecto.
    pause
    exit /b 1
)

REM PASO 1: Verificar Node.js
echo.
echo ▶ PASO 1/6: Verificando Node.js...
echo.

where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ Node.js no está instalado
    echo Por favor, instala Node.js 18+ desde https://nodejs.org
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✅ Node.js instalado: %NODE_VERSION%

REM PASO 2: Instalar dependencias
echo.
echo ▶ PASO 2/6: Instalando dependencias...
echo.

if exist "node_modules" (
    echo ⚠️  node_modules ya existe, omitiendo instalación
    echo ⚠️  Si quieres reinstalar, ejecuta: rmdir /s /q node_modules ^& npm install
) else (
    echo Instalando dependencias (esto puede tomar 2-3 minutos)...
    call npm install
    
    if %ERRORLEVEL% equ 0 (
        echo ✅ Dependencias instaladas correctamente
    ) else (
        echo ❌ Error al instalar dependencias
        pause
        exit /b 1
    )
)

REM PASO 3: Crear archivo .env
echo.
echo ▶ PASO 3/6: Configurando archivo .env...
echo.

if exist ".env" (
    echo ⚠️  .env ya existe, no se sobrescribirá
    echo Si quieres recrearlo, ejecuta: copy .env.example .env
) else (
    copy .env.example .env >nul
    echo ✅ .env creado desde .env.example
    echo ⚠️  IMPORTANTE: Debes editar .env con tus credenciales
    echo.
    echo Variables que debes configurar:
    echo   - VITE_SUPABASE_URL
    echo   - VITE_SUPABASE_ANON_KEY
    echo   - OPENAI_API_KEY (opcional)
    echo.
)

REM PASO 4: Crear configuración de VS Code
echo.
echo ▶ PASO 4/6: Configurando VS Code...
echo.

if exist ".vscode\settings.json" (
    echo ⚠️  .vscode\settings.json ya existe
) else (
    if exist ".vscode\settings.json.example" (
        copy .vscode\settings.json.example .vscode\settings.json >nul
        echo ✅ Configuración de VS Code creada
    ) else (
        echo ⚠️  No se encontró .vscode\settings.json.example
    )
)

REM PASO 5: Verificar migraciones SQL
echo.
echo ▶ PASO 5/6: Verificando migraciones SQL...
echo.

set ALL_FOUND=1

if exist "sql-migrations\01-crear-tablas.sql" (
    echo ✅ 01-crear-tablas.sql
) else (
    echo ❌ 01-crear-tablas.sql NO encontrado
    set ALL_FOUND=0
)

if exist "sql-migrations\02-agregar-indices-VERIFICADO.sql" (
    echo ✅ 02-agregar-indices-VERIFICADO.sql
) else (
    echo ❌ 02-agregar-indices-VERIFICADO.sql NO encontrado
    set ALL_FOUND=0
)

if exist "sql-migrations\03-implementar-rls-VERIFICADO.sql" (
    echo ✅ 03-implementar-rls-VERIFICADO.sql
) else (
    echo ❌ 03-implementar-rls-VERIFICADO.sql NO encontrado
    set ALL_FOUND=0
)

if exist "sql-migrations\04-funciones-utilidades-VERIFICADO.sql" (
    echo ✅ 04-funciones-utilidades-VERIFICADO.sql
) else (
    echo ❌ 04-funciones-utilidades-VERIFICADO.sql NO encontrado
    set ALL_FOUND=0
)

if exist "sql-migrations\05-tablas-chat.sql" (
    echo ✅ 05-tablas-chat.sql
) else (
    echo ❌ 05-tablas-chat.sql NO encontrado
    set ALL_FOUND=0
)

if exist "sql-migrations\07-tablas-dispositivos-invitaciones-notificaciones.sql" (
    echo ✅ 07-tablas-dispositivos-invitaciones-notificaciones.sql
) else (
    echo ❌ 07-tablas-dispositivos-invitaciones-notificaciones.sql NO encontrado
    set ALL_FOUND=0
)

if exist "sql-migrations\07-budgets-month-year-SAFE.sql" (
    echo ✅ 07-budgets-month-year-SAFE.sql
) else (
    echo ❌ 07-budgets-month-year-SAFE.sql NO encontrado
    set ALL_FOUND=0
)

if %ALL_FOUND% equ 1 (
    echo ✅ Todas las migraciones SQL están presentes
) else (
    echo ❌ Faltan algunas migraciones SQL
    pause
    exit /b 1
)

REM PASO 6: Resumen y próximos pasos
echo.
echo ▶ PASO 6/6: ¡Setup completado!
echo.
echo ✅ Setup automático completado exitosamente
echo.
echo 📋 PRÓXIMOS PASOS MANUALES:
echo.
echo 1️⃣  Configurar Supabase:
echo    - Ve a https://supabase.com
echo    - Crea un nuevo proyecto (GRATIS)
echo    - Ejecuta las migraciones SQL en orden (ver sql-migrations\README.md)
echo.
echo 2️⃣  Configurar .env:
echo    - Edita el archivo .env
echo    - Agrega tus credenciales de Supabase
echo    - (Opcional) Agrega tu API key de OpenAI
echo.
echo 3️⃣  Ejecutar el proyecto:
echo    npm run dev
echo.
echo 4️⃣  Abrir en el navegador:
echo    http://localhost:3000
echo.
echo 📚 DOCUMENTACIÓN:
echo    - SETUP_LOCAL.md - Guía completa paso a paso
echo    - README.md - Overview del proyecto
echo    - sql-migrations\README.md - Guía de migraciones
echo.
echo 🆘 ¿NECESITAS AYUDA?
echo    - Lee SETUP_LOCAL.md completo
echo    - Consulta docs\FAQ.md
echo    - Ejecuta: npm run verify
echo.
echo ¡Éxito con el desarrollo! 🚀
echo.
pause
