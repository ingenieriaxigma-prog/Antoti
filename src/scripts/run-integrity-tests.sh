#!/bin/bash

# 🧪 Script para correr Tests de Integridad de Datos
# Autor: Sistema de Testing
# Fecha: Noviembre 20, 2024

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "🧪 =============================================="
echo "   TESTS DE INTEGRIDAD DE DATOS"
echo "   =============================================="
echo ""

# Verificar que estamos en la raíz del proyecto
if [ ! -f "vitest.config.ts" ]; then
    echo -e "${RED}❌ Error: No se encontró vitest.config.ts${NC}"
    echo "   Por favor ejecuta este script desde la raíz del proyecto"
    exit 1
fi

# Verificar que existe la carpeta de tests
if [ ! -d "tests/integration/data-integrity" ]; then
    echo -e "${RED}❌ Error: No se encontró la carpeta de tests${NC}"
    echo "   Esperado: tests/integration/data-integrity/"
    exit 1
fi

# Verificar que Node está instalado
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Error: Node.js no está instalado${NC}"
    echo "   Por favor instala Node.js desde https://nodejs.org/"
    exit 1
fi

echo -e "${BLUE}📋 Configuración:${NC}"
echo "   - Node version: $(node --version)"
echo "   - NPM version: $(npm --version)"
echo ""

# Verificar que Vitest está instalado
if ! npx vitest --version &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vitest no está instalado${NC}"
    echo "   Instalando dependencias..."
    npm install -D vitest @testing-library/react @testing-library/user-event jsdom
    echo ""
fi

# Verificar variables de entorno
if [ -z "$VITE_SUPABASE_URL" ] && [ ! -f ".env.test" ] && [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Variables de entorno no configuradas${NC}"
    echo ""
    echo "   Necesitas configurar las credenciales de Supabase:"
    echo ""
    echo "   Opción 1: Crear archivo .env.test"
    echo "   ────────────────────────────────────"
    echo "   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co"
    echo "   VITE_SUPABASE_ANON_KEY=eyJhbGci..."
    echo ""
    echo "   Opción 2: Exportar manualmente"
    echo "   ────────────────────────────────────"
    echo "   export VITE_SUPABASE_URL=https://tu-proyecto.supabase.co"
    echo "   export VITE_SUPABASE_ANON_KEY=eyJhbGci..."
    echo ""
    read -p "   ¿Continuar de todas formas? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo -e "${BLUE}🚀 Iniciando tests...${NC}"
echo ""

# Opción de comando: si se pasa un argumento, usarlo como filtro
if [ -z "$1" ]; then
    # Correr TODOS los tests de integridad
    echo "   Corriendo: TODOS los tests de integridad (20 tests)"
    echo ""
    npx vitest tests/integration/data-integrity --run
else
    # Correr tests específicos
    echo "   Corriendo: Tests de $1"
    echo ""
    npx vitest "$1" --run
fi

# Capturar el exit code
EXIT_CODE=$?

echo ""
echo "=============================================="

# Mostrar resultado final
if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ ¡TODOS LOS TESTS PASARON!${NC}"
    echo ""
    echo "   ✓ Datos se guardan correctamente"
    echo "   ✓ Persistencia verificada"
    echo "   ✓ Integridad de campos OK"
    echo "   ✓ La app está lista para deploy"
    echo ""
else
    echo -e "${RED}❌ ALGUNOS TESTS FALLARON${NC}"
    echo ""
    echo "   ✗ Hay bugs de persistencia de datos"
    echo "   ✗ NO hacer deploy hasta corregir"
    echo "   ✗ Revisar los errores arriba"
    echo ""
    echo "   💡 Tips para debugging:"
    echo "      1. Revisar el error específico en el output"
    echo "      2. Correr test individual: ./scripts/run-integrity-tests.sh budget-persistence"
    echo "      3. Modo verbose: npx vitest [test-name] --reporter=verbose"
    echo ""
fi

echo "=============================================="
echo ""

exit $EXIT_CODE
