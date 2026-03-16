#!/bin/bash

# ========================================
# POST-DESCARGA SETUP - OTI FINANZAS
# ========================================
# Script para ejecutar después de descargar el proyecto desde Figma Make
# 
# Uso: bash scripts/post-download-setup.sh

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BOLD='\033[1m'

echo ""
echo "${BLUE}${BOLD}╔═══════════════════════════════════════════════════════╗${NC}"
echo "${BLUE}${BOLD}║                                                       ║${NC}"
echo "${BLUE}${BOLD}║     POST-DESCARGA SETUP - OTI FINANZAS               ║${NC}"
echo "${BLUE}${BOLD}║     Configuración automática para VS Code            ║${NC}"
echo "${BLUE}${BOLD}║                                                       ║${NC}"
echo "${BLUE}${BOLD}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""

# Función para mostrar progreso
step() {
    echo ""
    echo "${BOLD}${BLUE}▶ $1${NC}"
}

success() {
    echo "${GREEN}✅ $1${NC}"
}

warning() {
    echo "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo "${RED}❌ $1${NC}"
}

# Verificar que estamos en la raíz del proyecto
if [ ! -f "package.json" ]; then
    error "Error: No se encontró package.json"
    echo "Por favor, ejecuta este script desde la raíz del proyecto."
    exit 1
fi

# PASO 1: Verificar Node.js
step "PASO 1/6: Verificando Node.js..."

if ! command -v node &> /dev/null; then
    error "Node.js no está instalado"
    echo "Por favor, instala Node.js 18+ desde https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v)
success "Node.js instalado: $NODE_VERSION"

# PASO 2: Instalar dependencias
step "PASO 2/6: Instalando dependencias..."

if [ -d "node_modules" ]; then
    warning "node_modules ya existe, omitiendo instalación"
    warning "Si quieres reinstalar, ejecuta: rm -rf node_modules && npm install"
else
    echo "Instalando dependencias (esto puede tomar 2-3 minutos)..."
    npm install
    
    if [ $? -eq 0 ]; then
        success "Dependencias instaladas correctamente"
    else
        error "Error al instalar dependencias"
        exit 1
    fi
fi

# PASO 3: Crear archivo .env
step "PASO 3/6: Configurando archivo .env..."

if [ -f ".env" ]; then
    warning ".env ya existe, no se sobrescribirá"
    echo "Si quieres recrearlo, ejecuta: cp .env.example .env"
else
    cp .env.example .env
    success ".env creado desde .env.example"
    warning "⚠️  IMPORTANTE: Debes editar .env con tus credenciales"
    echo ""
    echo "Variables que debes configurar:"
    echo "  - VITE_SUPABASE_URL"
    echo "  - VITE_SUPABASE_ANON_KEY"
    echo "  - OPENAI_API_KEY (opcional)"
    echo ""
fi

# PASO 4: Crear configuración de VS Code
step "PASO 4/6: Configurando VS Code..."

if [ -f ".vscode/settings.json" ]; then
    warning ".vscode/settings.json ya existe"
else
    if [ -f ".vscode/settings.json.example" ]; then
        cp .vscode/settings.json.example .vscode/settings.json
        success "Configuración de VS Code creada"
    else
        warning "No se encontró .vscode/settings.json.example"
    fi
fi

# PASO 5: Verificar migraciones SQL
step "PASO 5/6: Verificando migraciones SQL..."

SQL_FILES=(
    "sql-migrations/01-crear-tablas.sql"
    "sql-migrations/02-agregar-indices-VERIFICADO.sql"
    "sql-migrations/03-implementar-rls-VERIFICADO.sql"
    "sql-migrations/04-funciones-utilidades-VERIFICADO.sql"
    "sql-migrations/05-tablas-chat.sql"
    "sql-migrations/07-tablas-dispositivos-invitaciones-notificaciones.sql"
    "sql-migrations/07-budgets-month-year-SAFE.sql"
)

ALL_FOUND=true
for file in "${SQL_FILES[@]}"; do
    if [ -f "$file" ]; then
        success "$(basename $file)"
    else
        error "$(basename $file) NO encontrado"
        ALL_FOUND=false
    fi
done

if [ "$ALL_FOUND" = true ]; then
    success "Todas las migraciones SQL están presentes"
else
    error "Faltan algunas migraciones SQL"
    exit 1
fi

# PASO 6: Resumen y próximos pasos
step "PASO 6/6: ¡Setup completado!"

echo ""
echo "${GREEN}${BOLD}✅ Setup automático completado exitosamente${NC}"
echo ""
echo "${BOLD}📋 PRÓXIMOS PASOS MANUALES:${NC}"
echo ""
echo "1️⃣  ${BOLD}Configurar Supabase:${NC}"
echo "   - Ve a https://supabase.com"
echo "   - Crea un nuevo proyecto (GRATIS)"
echo "   - Ejecuta las migraciones SQL en orden (ver sql-migrations/README.md)"
echo ""
echo "2️⃣  ${BOLD}Configurar .env:${NC}"
echo "   - Edita el archivo .env"
echo "   - Agrega tus credenciales de Supabase"
echo "   - (Opcional) Agrega tu API key de OpenAI"
echo ""
echo "3️⃣  ${BOLD}Ejecutar el proyecto:${NC}"
echo "   ${BLUE}npm run dev${NC}"
echo ""
echo "4️⃣  ${BOLD}Abrir en el navegador:${NC}"
echo "   http://localhost:3000"
echo ""
echo "${BOLD}📚 DOCUMENTACIÓN:${NC}"
echo "   - ${BLUE}SETUP_LOCAL.md${NC} - Guía completa paso a paso"
echo "   - ${BLUE}README.md${NC} - Overview del proyecto"
echo "   - ${BLUE}sql-migrations/README.md${NC} - Guía de migraciones"
echo ""
echo "${BOLD}🆘 ¿NECESITAS AYUDA?${NC}"
echo "   - Lee SETUP_LOCAL.md completo"
echo "   - Consulta docs/FAQ.md"
echo "   - Ejecuta: npm run verify"
echo ""
echo "${GREEN}¡Éxito con el desarrollo! 🚀${NC}"
echo ""
