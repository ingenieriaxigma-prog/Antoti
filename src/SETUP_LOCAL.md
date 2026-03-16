# 🚀 Setup Local - Oti Finanzas

Guía paso a paso para configurar Oti en tu entorno local de desarrollo.

---

## 📋 Pre-requisitos

Antes de comenzar, asegúrate de tener instalado:

- ✅ **Node.js 18+** (recomendado: 20+)
  - Verificar: `node --version`
  - Descargar: https://nodejs.org/

- ✅ **npm, pnpm o yarn**
  - Verificar: `npm --version`

- ✅ **Git**
  - Verificar: `git --version`
  - Descargar: https://git-scm.com/

- ✅ **Cuenta de Supabase**
  - Crear: https://supabase.com

- ✅ **API Key de OpenAI** 
  - Obtener: https://platform.openai.com/api-keys

- ✅ **VS Code** 
  - Descargar: https://code.visualstudio.com/

---

## 📦 PASO 1: Instalación

### 1.1 Clonar o Descargar el Proyecto

**Opción A: Desde Figma Make (lo más probable)**
```bash
# Si descargaste el ZIP desde Figma Make
unzip oti-finanzas.zip
cd oti-finanzas
```

### 1.2 Instalar Dependencias

```bash
# Con npm (recomendado)
npm install

```

**Tiempo estimado:** 2-3 minutos

---

## 🗄️ PASO 2: Configurar Base de Datos

> **⚠️ IMPORTANTE:** Si ya tienes Supabase funcionando en Figma Make, ve directo a la **OPCIÓN A**

### OPCIÓN A: Ya tengo Supabase funcionando (RECOMENDADO si vienes de Figma Make)

Si ya tienes Oti funcionando en Figma Make con datos reales:

✅ **Usa la MISMA base de datos** - No crees una nueva  
✅ **Conserva todos tus datos** - Transacciones, cuentas, presupuestos, usuarios  
✅ **NO ejecutes las migraciones SQL** - Ya existen las tablas  

**Lo único que necesitas hacer:**

1. Ir al **PASO 3** directamente (Configurar Variables de Entorno)
2. Copiar las **MISMAS credenciales** que usas ahora:
   - `VITE_SUPABASE_URL` (la misma que tienes)
   - `VITE_SUPABASE_ANON_KEY` (la misma que tienes)
   - `OPENAI_API_KEY` (la misma que tienes)

**Resultado:** VS Code local → misma DB → mismos datos → todo funciona igual ✅

**Tiempo estimado:** 2 minutos ⚡

---

### OPCIÓN B: Empiezo desde cero (usuarios nuevos sin Supabase)

Si es la primera vez que instalas Oti y NO tienes Supabase:

#### 2.1 Crear Proyecto en Supabase

1. Ve a https://app.supabase.com
2. Click en "New Project"
3. Completa:
   - **Name:** oti-finanzas-dev
   - **Database Password:** (guarda esta contraseña)
   - **Region:** South America (São Paulo) - más cercano a Colombia
4. Click "Create new project"

**Tiempo estimado:** 2-3 minutos (Supabase provisiona la DB)

#### 2.2 Ejecutar Migraciones SQL

Una vez que tu proyecto esté listo:

1. Ve a tu proyecto → **SQL Editor**
2. Ejecuta los scripts en este orden:

```sql
-- Script 1: Crear tablas
-- Copia y pega el contenido de: /sql-migrations/01-crear-tablas.sql
-- Click "Run" o F5

-- Script 2: Agregar índices
-- Copia y pega: /sql-migrations/02-agregar-indices-VERIFICADO.sql
-- Click "Run"

-- Script 3: Implementar RLS (seguridad)
-- Copia y pega: /sql-migrations/03-implementar-rls-VERIFICADO.sql
-- Click "Run"

-- Script 4: Funciones y vistas
-- Copia y pega: /sql-migrations/04-funciones-utilidades-VERIFICADO.sql
-- Click "Run"

-- Script 5: Tablas de chat
-- Copia y pega: /sql-migrations/05-tablas-chat.sql
-- Click "Run"

-- Script 6: Tablas de familia
-- Copia y pega: /sql-migrations/07-tablas-dispositivos-invitaciones-notificaciones.sql
-- Click "Run"

-- Script 7: Fix de budgets
-- Copia y pega: /sql-migrations/07-budgets-month-year-SAFE.sql
-- Click "Run"
```

#### 2.3 Verificar Tablas Creadas

En Supabase → **Table Editor**, deberías ver estas tablas:

- ✅ `kv_store_727b50c3` (datos de usuarios)
- ✅ `accounts_727b50c3` (cuentas bancarias)
- ✅ `transactions_727b50c3` (transacciones)
- ✅ `categories_727b50c3` (categorías)
- ✅ `budgets_727b50c3` (presupuestos)
- ✅ `family_groups_727b50c3` (grupos familiares)
- ✅ `group_members_727b50c3` (miembros de grupos)
- ✅ `group_transactions_727b50c3` (transacciones compartidas)
- ✅ `invitations_727b50c3` (invitaciones)
- ✅ `chat_sessions_727b50c3` (sesiones de chat)
- ✅ `chat_messages_727b50c3` (mensajes del chat)

**Total:** 11 tablas principales

📖 **Documentación completa:** Ver `/sql-migrations/README.md`

**Tiempo estimado:** 5-10 minutos