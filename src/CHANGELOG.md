# 📝 Changelog - Oti Finanzas Personales

Todos los cambios notables del proyecto están documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto sigue [Semantic Versioning](https://semver.org/lang/es/).

---

## [3.1.0] - 2025-12-30 🎉

### 🎯 Highlights

**VERSIÓN ENTERPRISE COMPLETA** - Documentación profesional, testing 93.5%, arquitectura escalable, y limpieza masiva de archivos obsoletos.

### ✨ Added (Agregado)

#### Documentación Enterprise
- ✅ **ARCHITECTURE.md consolidado** - Guía completa de arquitectura (700+ líneas)
  - Feature-First Architecture documentada
  - Diagramas arquitectónicos actualizados
  - Guía de migración integrada
  - Template de features
  - Best practices y convenciones
- ✅ **README.md completamente actualizado** - Entry point profesional
  - Badges de calidad (tests, TypeScript, arquitectura)
  - Roadmap detallado
  - Guías de instalación y deploy
  - Documentación de todas las features
- ✅ **sql-migrations/README.md consolidado** - Documentación completa de BD
  - Schema detallado de todas las tablas
  - Políticas RLS documentadas
  - Guía de troubleshooting
  - Mejores prácticas de mantenimiento
- ✅ **CHANGELOG.md unificado** - Historial completo de versiones

#### Limpieza y Consolidación
- ✅ **FASE 1 completada:** 122 archivos obsoletos eliminados (81% de reducción)
  - Migraciones completadas (10)
  - Fases y checkpoints antiguos (13)
  - Bugfixes resueltos (15)
  - Índices obsoletos (8)
  - Instrucciones de migraciones (12)
  - Comandos temporales (8)
  - Features completados (16)
  - Testing redundantes (18)
  - Adicionales obsoletos (22)

- ✅ **FASE 2 completada:** 80 archivos consolidados
  - Arquitectura: 6 archivos → 1 ARCHITECTURE.md
  - Testing: 5 archivos eliminados (ya consolidados)
  - SQL Migrations: 28 archivos → 1 README.md
  - Optimizaciones y bugfixes: 13 archivos eliminados
  - Tests de progreso semanal: 10 archivos eliminados
  - Archivos temporales: 18 archivos eliminados

### 🔧 Changed (Modificado)

#### Estructura de Proyecto
- 📁 **Documentación organizada** - De ~150 archivos .md a 30 esenciales
- 📁 **docs/history/** creado - Archivos históricos preservados
- 📁 **sql-migrations/** limpio - Solo scripts finales mantenidos
- 📁 **tests/** organizado - Documentación consolidada

#### Mejoras de Calidad
- ♻️ **Código más limpio** - Sin duplicados ni obsoletos
- 📚 **Navegación mejorada** - Fácil encontrar documentación
- 🎯 **Enfoque claro** - Solo información relevante

### 📦 Removed (Eliminado)

#### Archivos Obsoletos Totales: 202 archivos
- ❌ Migraciones completadas
- ❌ Fases antiguas de desarrollo
- ❌ Bugfixes resueltos
- ❌ Índices redundantes
- ❌ Scripts SQL duplicados (versiones no finales)
- ❌ Guías de testing antiguas
- ❌ Archivos de progreso semanal
- ❌ Templates de email en raíz
- ❌ Archivos de test temporales
- ❌ Documentación fragmentada

### 🐛 Fixed (Corregido)

- 🔧 Documentación fragmentada consolidada
- 🔧 Links rotos actualizados
- 🔧 Información desactualizada corregida

### 📊 Metrics (Métricas)

```
Archivos .md eliminados:     202 archivos (85% de reducción)
Documentación consolidada:   3 archivos maestros
Test Coverage:               93.5% (sin cambios)
Arquitectura:                Feature-First (documentada)
```

---

## [3.0.2] - 2025-11-28

### 🎯 Highlights

**SISTEMA DE FECHAS COLOMBIA** - Fix completo del sistema de fechas con timezone America/Bogota y correcciones en balances mensuales.

### ✨ Added

#### Sistema de Fechas Colombia
- ✅ **Timezone IANA America/Bogota** implementado
- ✅ **26 fixes aplicados en 11 archivos** para consistencia de fechas
- ✅ **Documentación completa** en `/docs/TIMEZONE_COLOMBIA.md`
- ✅ **Utilidades centralizadas** en `/utils/dateUtils.ts`

#### Funciones de Fecha
```typescript
// Nuevas funciones disponibles
formatDateForDisplay(date: string)     // "30 Dic 2025"
parseColombiaDate(dateString: string)  // Convierte a UTC correcto
getColombiaTimezone()                  // "America/Bogota"
getCurrentColombiaDate()               // Fecha actual Colombia
```

### 🐛 Fixed

#### Balances Mensuales
- 🔧 **Budgets.tsx** - Filtro de transacciones corregido con fechas Colombia
- 🔧 **Statistics.tsx** - Cálculos mensuales con timezone correcto
- 🔧 **Dashboard.tsx** - Estadísticas del mes actual precisas
- 🔧 **useTransactions.ts** - Formato consistente de fechas
- 🔧 **TransactionService.ts** - Guardado correcto en UTC

#### Problemas Resueltos
- ❌ Transacciones aparecían en el mes equivocado
- ❌ Balances mensuales incorrectos por timezone
- ❌ Presupuestos con datos del mes anterior/siguiente
- ❌ Estadísticas desincronizadas

### 🔄 Changed

#### Archivos Actualizados (26 fixes)
1. `/components/Budgets.tsx` - Filtros de fecha
2. `/components/Statistics.tsx` - Cálculos mensuales
3. `/components/dashboard/QuickStats.tsx` - Stats del mes
4. `/components/NewTransaction.tsx` - Input de fecha
5. `/hooks/useTransactions.ts` - Formato de fechas
6. `/services/TransactionService.ts` - Guardado en BD
7. `/utils/calculations.ts` - Cálculos financieros
8. `/utils/formatting.ts` - Formateo de fechas
9. `/utils/dateUtils.ts` - Utilidades centralizadas
10. `/types/index.ts` - Types actualizados
11. `/supabase/functions/server/index.tsx` - Backend

### 📖 Documentation

- ✅ **TIMEZONE_COLOMBIA.md** - Documentación completa del sistema
- ✅ **EJEMPLO_USO_FECHAS.md** - Ejemplos prácticos
- ✅ **RESUMEN_FIX_FECHAS.md** - Resumen de correcciones

---

## [3.0.1] - 2025-11-25

### 🎯 Highlights

**REFACTORIZACIÓN ARQUITECTURAL** - Solución definitiva de balances con principio Single Source of Truth.

### 🐛 Fixed

#### Bug Crítico: Balances en $0
**Problema resuelto:** Balances de cuentas aparecían en $0 al recargar la página.

**Causa raíz:** Arquitectura problemática con 3 lugares diferentes calculando balances:
1. ❌ Backend POST /accounts - Calculaba y guardaba
2. ❌ Backend GET /accounts - Recalculaba (ignorando guardados)
3. ❌ Frontend useTransactions - Actualizaba localmente

**Resultado anterior:** Race conditions, balances inconsistentes.

### ✅ Solución Implementada

#### Backend Simplificado
**Archivo:** `/supabase/functions/server/index.tsx`

**POST /accounts:**
```typescript
// ANTES: 40+ líneas de cálculo
// DESPUÉS: 0 líneas - Solo guarda lo que el frontend envía
```

**GET /accounts:**
```typescript
// Cálculo centralizado con SUM de transacciones
// Balance = SUM(ingresos) - SUM(gastos) + transferencias
```

#### Frontend Actualizado
**Archivo:** `/hooks/useTransactions.ts`

- ✅ Actualización local de balances al crear transacciones
- ✅ Sincronización con backend cuando sea necesario
- ✅ Cache optimizado

### 🔄 Changed

#### Principio Arquitectural
```
ANTES: 3 lugares calculando balances ❌
DESPUÉS: 1 solo lugar (Backend GET) ✅

Balance = SUM(transacciones)
```

#### Archivos Modificados
- `/supabase/functions/server/index.tsx` (líneas 3087-3227)
- `/hooks/useTransactions.ts`
- `/services/AccountService.ts`
- `/features/accounts/components/AccountsScreen.tsx`

### 📖 Documentation

- ✅ **CHANGELOG_v3.1.md** - Documentación detallada
- ✅ **BUG_FIX_ACCOUNT_BALANCES_FINAL.md** - Análisis técnico

---

## [3.0.0] - 2025-11-21

### 🎯 Highlights

**VERSIÓN MAYOR** - Bug fix crítico de balances + arquitectura mejorada.

### 🐛 Fixed

#### Saldos de Cuentas en $0
**Problema:** Al recargar la página, los saldos aparecían en $0.

**Impacto:**
- ⚠️ Alto - Usuarios no veían balances reales
- ⚠️ Crítico - Funcionalidad principal afectada

### ✅ Solución

#### Mapeo de Compatibilidad
**Archivo:** `/utils/api/transactions.ts`

Capa de compatibilidad que detecta automáticamente formato de servidor:
- Formato viejo: `account_id`
- Formato nuevo: `account`

**Beneficios:**
- ✅ Funciona con ambos formatos
- ✅ No requiere cambios en servidor
- ✅ Protege contra regresiones

### 🧹 Limpieza

**Archivos modificados:**
- `/features/accounts/components/AccountsScreen.tsx`
  - Removido botón de debug "Recargar desde Backend"
  - Removida función `handleReloadFromBackend`
  - Limpiados imports innecesarios

- `/utils/api/transactions.ts`
  - Simplificados logs de debug
  - Mantenidos logs esenciales

- `/hooks/useDataLoader.ts`
  - Simplificados logs
  - Mantenida lógica de recálculo

### 📖 Documentation

- ✅ **CHANGELOG_v3.0.md** creado
- ✅ **BUG_FIX_ACCOUNT_BALANCE_ZERO.md** creado

---

## [2.1.0] - 2025-11-20

### 🎯 Highlights

**TESTING COMPLETO** - 93.5% de cobertura alcanzado con 47 tests implementados.

### ✨ Added

#### Sistema de Testing
- ✅ **47 tests implementados**
  - 28 Unit Tests (60%)
  - 14 Integration Tests (30%)
  - 5 E2E Tests (10%)

- ✅ **Configuración completa de Vitest**
- ✅ **React Testing Library** configurado
- ✅ **Test coverage reporting**

#### Tests por Categoría
```
Schemas:     100% cobertura ✅
Utils:        95% cobertura ✅
Services:     92% cobertura ✅
Hooks:        90% cobertura ✅
Components:   88% cobertura ✅
```

### 📖 Documentation

- ✅ **TESTING_GUIDE.md** - Guía completa de testing
- ✅ **RESUMEN_FINAL_TESTS.md** - Reporte final
- ✅ **QUICK_START_TESTS.md** - Inicio rápido

---

## [2.0.0] - 2025-11-19

### 🎯 Highlights

**ARQUITECTURA ENTERPRISE** - Migración completa a Feature-First Architecture.

### 🚀 Major Changes

#### Feature-First Architecture
- ✅ **83 archivos modulares** organizados en `/features/`
- ✅ **Clean Architecture** implementada
- ✅ **Atomic Design** para componentes compartidos
- ✅ **Separation of Concerns** en todas las capas

#### Estructura de Features
```
/features/
├── accounts/       ✅ Migrado
├── budgets/        ✅ Migrado
├── categories/     ✅ Migrado
├── dashboard/      ✅ Migrado
├── family/         ✅ Migrado
├── oti/            ✅ Migrado
├── settings/       ✅ Migrado
├── statistics/     ✅ Migrado
└── transactions/   ✅ Migrado
```

### ♻️ Refactored

- 🔄 Todos los componentes migrados a features
- 🔄 Hooks organizados por feature
- 🔄 Services centralizados y documentados
- 🔄 Types globales en `/types/`
- 🔄 Constants centralizados en `/constants/`

### 📖 Documentation

- ✅ **ARCHITECTURE.md** creado
- ✅ **MIGRATION_GUIDE.md** creado
- ✅ **FEATURE_TEMPLATE.md** creado
- ✅ **PLAN_REFACTORIZACION_COMPLETA.md** creado

---

## [1.5.0] - 2025-11-15

### 🎯 Highlights

**FINANZAS FAMILIARES** - Feature completo de grupos familiares implementado.

### ✨ Added

#### Family Feature
- ✅ **18 componentes** del feature family
- ✅ **Grupos familiares** - Crear y gestionar grupos
- ✅ **Sistema de invitaciones** - Códigos únicos
- ✅ **Transacciones compartidas** - Con recibos
- ✅ **Sistema de reacciones** - 30+ stickers
- ✅ **Comentarios** - En transacciones
- ✅ **Estadísticas por miembro**

#### Base de Datos
- ✅ **family_groups_727b50c3** - Tabla de grupos
- ✅ **group_members_727b50c3** - Tabla de miembros
- ✅ **group_transactions_727b50c3** - Transacciones compartidas
- ✅ **group_reactions_727b50c3** - Reacciones
- ✅ **group_comments_727b50c3** - Comentarios

### 🔒 Security

- ✅ **RLS policies** para grupos familiares
- ✅ **Roles:** Admin y Member
- ✅ **Permisos granulares** por acción

---

## [1.4.0] - 2025-11-10

### 🎯 Highlights

**CHAT OTI CON GPT-4O** - Asistente financiero con IA implementado.

### ✨ Added

#### Oti Chat
- ✅ **GPT-4o integration** - OpenAI API
- ✅ **Reconocimiento de voz** - Speech-to-Text
- ✅ **Text-to-Speech** - Escuchar respuestas
- ✅ **Contexto de datos** - Respuestas personalizadas
- ✅ **Comandos naturales** - Crear transacciones hablando

#### Comandos Soportados
```
"Registra un gasto de $50,000 en supermercado"
"¿Cuánto gasté este mes?"
"Crea un presupuesto de $200,000 en comida"
"¿En qué categoría gasto más?"
"Dame consejos para ahorrar"
```

#### Backend
- ✅ **openai-helper.ts** - Cliente OpenAI
- ✅ **Endpoints de chat** - /oti/chat, /oti/create-transaction
- ✅ **KV store** para conversaciones

---

## [1.3.0] - 2025-11-05

### 🎯 Highlights

**INTERNACIONALIZACIÓN** - Multi-idioma completo (ES/EN/PT).

### ✨ Added

#### i18n System
- ✅ **3 idiomas soportados**
  - 🇨🇴 Español (Colombia)
  - 🇺🇸 English (United States)
  - 🇧🇷 Português (Brasil)

- ✅ **LocalizationContext** - Sistema de contexto
- ✅ **Traducciones completas** - 500+ strings
- ✅ **Cambio dinámico** - Sin reload de página

#### Archivos
```
/i18n/
├── locales/
│   ├── es.ts    # Español
│   ├── en.ts    # English
│   └── pt.ts    # Português
└── config.ts
```

---

## [1.2.0] - 2025-11-01

### 🎯 Highlights

**TEMAS DINÁMICOS** - 12 temas con modo claro/oscuro.

### ✨ Added

#### Theme System
- ✅ **12 temas disponibles**
  - 🌿 Esperanza Financiera (predeterminado)
  - 🌙 Medianoche Elegante
  - 🌊 Océano Profundo
  - 🔥 Fuego y Pasión
  - 🌸 Jardín de Cerezos
  - 🍂 Otoño Cálido
  - 🌌 Galaxia Violeta
  - 🌅 Amanecer Dorado
  - 💎 Esmeralda Clásica
  - 🌺 Tropical Vibrante
  - ☕ Café y Crema
  - 🎨 Profesional Neutro

- ✅ **Modo oscuro** en todos los temas
- ✅ **Persistencia** en localStorage
- ✅ **Transiciones suaves** entre temas

---

## [1.1.0] - 2025-10-25

### 🎯 Highlights

**TUTORIAL DE ONBOARDING** - Guía interactiva para nuevos usuarios.

### ✨ Added

#### Product Tour
- ✅ **Tutorial interactivo** - 8 pasos
- ✅ **Tooltips contextuales** - Guía paso a paso
- ✅ **Skip y restart** - Control total
- ✅ **Persistencia** - No volver a mostrar
- ✅ **Responsive** - Funciona en móvil

#### Components
- ✅ **ProductTour.tsx** - Componente principal
- ✅ **OnboardingContext** - Estado global
- ✅ **Tutorial dashboard** - Dashboard de gestión

---

## [1.0.0] - 2025-10-20

### 🎯 Highlights

**LANZAMIENTO INICIAL** - MVP completo con features core.

### ✨ Added

#### Core Features
- ✅ **Transacciones** - Ingresos, gastos, transferencias
- ✅ **Cuentas** - Múltiples cuentas bancarias
- ✅ **Categorías** - Sistema personalizable
- ✅ **Presupuestos** - Presupuestos mensuales
- ✅ **Estadísticas** - Gráficos y análisis
- ✅ **Dashboard** - Panel principal

#### Authentication
- ✅ **Supabase Auth** - Sistema completo
- ✅ **Sign up/Login** - Con validación
- ✅ **Multi-usuario** - Datos aislados por usuario
- ✅ **RLS** - Row Level Security

#### Backend
- ✅ **Supabase Edge Functions** - Hono server
- ✅ **Postgres Database** - 7 tablas principales
- ✅ **80+ índices** - Performance optimizado
- ✅ **68 políticas RLS** - Seguridad completa

#### UI/UX
- ✅ **Material Design** - Interface moderna
- ✅ **Tailwind CSS** - Styling
- ✅ **Responsive** - Móvil first
- ✅ **Animaciones** - Motion (Framer Motion)

---

## [Unreleased] - Próximas Versiones

### 🚧 En Progreso (v3.2)

- [ ] Progressive Web App (PWA)
- [ ] Notificaciones push
- [ ] Modo offline
- [ ] Export de datos (CSV, Excel)
- [ ] Reportes avanzados
- [ ] Integración con bancos

### 🔮 Futuro (v4.0)

- [ ] App móvil nativa (React Native)
- [ ] Metas de ahorro
- [ ] Inversiones
- [ ] Dashboard multi-cuenta
- [ ] Marketplace de templates
- [ ] Webhooks y API pública

---

## 📊 Resumen de Versiones

```
v3.1.0  ✅ Documentación Enterprise + Limpieza masiva
v3.0.2  ✅ Sistema de fechas Colombia
v3.0.1  ✅ Fix balances arquitectural
v3.0.0  ✅ Bug fix crítico balances
v2.1.0  ✅ Testing 93.5% coverage
v2.0.0  ✅ Feature-First Architecture
v1.5.0  ✅ Finanzas Familiares
v1.4.0  ✅ Chat Oti (GPT-4o)
v1.3.0  ✅ Multi-idioma (i18n)
v1.2.0  ✅ 12 temas dinámicos
v1.1.0  ✅ Tutorial Onboarding
v1.0.0  ✅ MVP Inicial
```

---

## 🔗 Links Útiles

- [Arquitectura](./ARCHITECTURE.md)
- [Guía de Desarrollo](./docs/DEVELOPER_GUIDE.md)
- [Guía de Testing](./tests/TESTING_GUIDE.md)
- [Deploy a Vercel](./DEPLOY_TO_VERCEL.md)
- [FAQ](./docs/FAQ.md)

---

**Mantenido por:** Equipo de Desarrollo Oti  
**Formato:** [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/)  
**Versionado:** [Semantic Versioning](https://semver.org/lang/es/)
