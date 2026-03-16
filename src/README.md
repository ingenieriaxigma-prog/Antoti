# 🌿 Oti - Tu Asistente Financiero Personal con IA

![Oti Logo](./public/og-image.png)

[![Tests](https://img.shields.io/badge/tests-93.5%25%20coverage-brightgreen.svg)](./tests/TESTING_GUIDE.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue.svg)](https://www.typescriptlang.org/)
[![Arquitectura](https://img.shields.io/badge/arquitectura-Feature--First-purple.svg)](./ARCHITECTURE.md)
[![Deploy](https://img.shields.io/badge/deploy-Vercel-black.svg)](./DEPLOY_TO_VERCEL.md)
[![Ready for VS Code](https://img.shields.io/badge/VS%20Code-Ready-blue.svg)](./SETUP_LOCAL.md)

**Controla tus finanzas con inteligencia artificial**: registra gastos, crea presupuestos, analiza tus hábitos, comparte gastos con tu familia y recibe asesoría financiera personalizada con GPT-4o.

> 🚀 **¿Descargaste desde Figma Make?** Lee [SETUP_LOCAL.md](./SETUP_LOCAL.md) para instalar en tu VS Code local en 15 minutos.

---

## ✨ Características Principales

### 💰 Gestión Financiera Completa
- ✅ **Registro de transacciones** - Ingresos, gastos y transferencias con categorías personalizables
- ✅ **Cuentas múltiples** - Gestiona efectivo, bancos, ahorros y tarjetas de crédito
- ✅ **Presupuestos mensuales** - Establece límites por categoría y recibe alertas de sobre-gasto
- ✅ **Estadísticas inteligentes** - Gráficos interactivos y análisis detallado de tus hábitos
- ✅ **Categorías y subcategorías** - Sistema flexible con iconos y colores personalizables

### 👨‍👩‍👧‍👦 Finanzas Familiares
- ✅ **Grupos familiares** - Crea grupos y comparte gastos con tu familia
- ✅ **Transacciones compartidas** - Todos los miembros ven y comentan gastos del grupo
- ✅ **Sistema de invitaciones** - Invita miembros con códigos únicos
- ✅ **Reacciones con stickers** - Interactúa con transacciones de forma divertida
- ✅ **Estadísticas por miembro** - Ve quién gasta más y en qué

### 🤖 Inteligencia Artificial (GPT-4o)
- ✅ **Chat Oti** - Asistente financiero conversacional con contexto de tus datos
- ✅ **Reconocimiento de voz** - Registra gastos hablando naturalmente
- ✅ **Carga de extractos** - Analiza PDFs bancarios y crea transacciones automáticamente
- ✅ **Asesoría personalizada** - Consejos financieros basados en tu historial
- ✅ **Creación de presupuestos con IA** - Oti te ayuda a crear presupuestos inteligentes
- ✅ **Text-to-Speech** - Escucha las respuestas de Oti

### 🎨 Experiencia de Usuario
- ✅ **Diseño moderno** - Interface limpia y profesional con Material Design
- ✅ **12 temas dinámicos** - Paleta "Esperanza Financiera" con verde esmeralda #10B981
- ✅ **Modo oscuro** - Tema claro/oscuro con transiciones suaves
- ✅ **100% responsive** - Optimizado para móvil, tablet y desktop
- ✅ **Tutorial interactivo** - Onboarding guiado con tooltips y tour del producto
- ✅ **Multi-idioma** - Español, Inglés y Portugués (i18n completo)
- ✅ **Splash screen** - Pantalla de carga con logo animado
- ✅ **Speed dial** - Acciones rápidas desde cualquier pantalla

### 🔐 Seguridad y Multi-usuario
- ✅ **Autenticación robusta** - Sistema completo con Supabase Auth
- ✅ **Row Level Security (RLS)** - 68 políticas de seguridad en base de datos
- ✅ **Datos privados** - Cada usuario ve solo sus datos
- ✅ **Bloqueo con PIN** - Seguridad adicional en la app
- ✅ **Backup automático** - Sincronización en tiempo real en la nube
- ✅ **Eliminación segura** - Cascade delete para mantener integridad

### 🌍 Sistema de Fechas Colombia
- ✅ **Timezone America/Bogota** - Fechas correctas para Colombia
- ✅ **Formato local** - "30 Dic 2025" en español
- ✅ **Balances mensuales precisos** - Sin errores de timezone UTC

---

## 🛠️ Stack Tecnológico

### Frontend
```
├── React 18 + TypeScript        # Framework principal
├── Vite 6.x                     # Build tool ultra-rápido
├── Tailwind CSS v4.0            # Styling moderno
├── Motion (Framer Motion)       # Animaciones fluidas
├── Recharts                     # Gráficos interactivos
├── Lucide React                 # Iconos
├── Zod                          # Validación de schemas
├── Sonner                       # Toast notifications
└── React Hook Form              # Formularios optimizados
```

### Backend
```
├── Supabase
│   ├── Postgres                 # Base de datos relacional
│   ├── Row Level Security       # Seguridad a nivel de fila
│   ├── Edge Functions (Deno)    # Serverless backend
│   ├── Auth                     # Autenticación JWT
│   └── Storage                  # Archivos (recibos)
│
└── OpenAI GPT-4o                # Inteligencia artificial
```

### Arquitectura
```
├── Feature-First Architecture   # Código organizado por features
├── Clean Architecture           # Separation of concerns
├── Atomic Design                # Componentes reutilizables
└── 93.5% Test Coverage          # Quality assurance
```

### DevOps
```
├── Vercel                       # Hosting y CI/CD
├── Vitest 2.x                   # Unit testing (compatible con Vite 6)
├── React Testing Library        # Integration testing
└── GitHub Actions               # CI/CD pipeline (opcional)
```

---

## 📦 Instalación Rápida

### Prerrequisitos

- Node.js 18+ (recomendado: 20+)
- npm, pnpm o yarn
- Cuenta de [Supabase](https://supabase.com)
- API Key de [OpenAI](https://platform.openai.com)

### 1. Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/oti-finanzas.git
cd oti-finanzas
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar base de datos

Ejecuta las migraciones SQL en tu proyecto de Supabase:

```bash
# Ver instrucciones detalladas en:
./sql-migrations/README.md
```

Scripts principales:
```sql
01-crear-tablas.sql                     # Tablas principales
02-agregar-indices-VERIFICADO.sql       # Índices de performance
03-implementar-rls-VERIFICADO.sql       # Seguridad RLS
04-funciones-utilidades-VERIFICADO.sql  # Funciones y vistas
05-tablas-chat.sql                      # Tablas de chat Oti
```

### 4. Configurar variables de entorno

Crea un archivo `.env` en la raíz:

```env
# Supabase (obligatorio)
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key

# OpenAI (obligatorio para features de IA)
VITE_OPENAI_API_KEY=sk-...

# Opcional: Configuración adicional
VITE_APP_VERSION=3.1.0
```

**Obtener credenciales:**
1. **Supabase:** Dashboard → Settings → API
2. **OpenAI:** https://platform.openai.com/api-keys

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

La app estará disponible en `http://localhost:5173`

### 6. Build para producción

```bash
npm run build
npm run preview
```

---

## 🚀 Deploy en Vercel

### Deploy automático (recomendado)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/TU_USUARIO/oti-finanzas)

### Deploy manual

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Deploy a producción
vercel --prod
```

**Configurar variables de entorno en Vercel:**
1. Dashboard → Settings → Environment Variables
2. Agregar las mismas variables del archivo `.env`

📖 **Guía completa:** [DEPLOY_TO_VERCEL.md](./DEPLOY_TO_VERCEL.md)

---

## 🏗️ Arquitectura del Proyecto

El proyecto sigue **Feature-First Architecture** con 83+ archivos modulares organizados por dominio de negocio.

```
oti-finanzas/
├── /features/                  # ✅ Feature-First Architecture
│   ├── /accounts/             # Gestión de cuentas bancarias
│   ├── /budgets/              # Presupuestos mensuales
│   ├── /categories/           # Categorías y subcategorías
│   ├── /dashboard/            # Panel principal
│   ├── /family/               # Finanzas familiares (18 componentes)
│   ├── /oti/                  # Chat IA (GPT-4o)
│   ├── /settings/             # Configuración y temas
│   ├── /statistics/           # Estadísticas y gráficos
│   └── /transactions/         # Transacciones
│
├── /components/               # Componentes compartidos
│   ├── /ui/                  # Shadcn/ui components (40+)
│   ├── /branding/            # OtiLogo, OtiAvatar
│   ├── /dashboard/           # Componentes del dashboard
│   └── /testing/             # Dashboard de tests
│
├── /contexts/                 # React Context API
│   ├── AuthContext.tsx       # Autenticación
│   ├── AppContext.tsx        # Estado de la app
│   ├── UIContext.tsx         # Estado de UI
│   └── LocalizationContext.tsx # i18n (ES/EN/PT)
│
├── /services/                 # Lógica de negocio
│   ├── AccountService.ts      # ✅ Re-exportado desde /features/accounts/
│   ├── BudgetService.ts       # ✅ Re-exportado desde /features/budgets/
│   ├── TransactionService.ts  # ✅ Re-exportado desde /features/transactions/
│   └── ValidationService.ts   # Validación de datos
│
├── /hooks/                    # Custom hooks (15+)
│   ├── useTransactions.ts
│   ├── useAccounts.ts
│   ├── useBudgets.ts
│   └── ...
│
├── /utils/                    # Utilidades
│   ├── /api/                 # API helpers
│   ├── /supabase/            # Cliente Supabase
│   ├── dateUtils.ts          # Sistema de fechas Colombia
│   ├── formatting.ts         # Formateo de números
│   └── calculations.ts       # Cálculos financieros
│
├── /i18n/                     # Internacionalización
│   ├── /locales/
│   │   ├── es.ts             # Español
│   │   ├── en.ts             # English
│   │   └── pt.ts             # Português
│   └── config.ts
│
├── /schemas/                  # Zod validation schemas
│   ├── transaction.schema.ts
│   ├── account.schema.ts
│   ├── budget.schema.ts
│   └── category.schema.ts
│
├── /tests/                    # Testing (93.5% coverage)
│   ├── /integration/         # Tests de integración
│   ├── /e2e/                 # Tests end-to-end
│   ├── /unit/                # Tests unitarios
│   └── TESTING_GUIDE.md
│
├── /supabase/functions/server/ # Backend (Hono)
│   ├── index.tsx             # Main server
│   ├── database.ts           # DB helpers
│   ├── family-db.ts          # Family helpers
│   ├── openai-helper.ts      # OpenAI integration
│   └── kv_store.tsx          # KV store helpers
│
├── /sql-migrations/           # Migraciones SQL
│   ├── README.md
│   ├── 01-crear-tablas.sql
│   ├── 02-agregar-indices-VERIFICADO.sql
│   ├── 03-implementar-rls-VERIFICADO.sql
│   └── ...
│
├── /docs/                     # Documentación
│   ├── USER_GUIDE.md         # Guía de usuario
│   ├── DEVELOPER_GUIDE.md    # Guía de desarrollador
│   ├── FAQ.md                # Preguntas frecuentes
│   ├── TIMEZONE_COLOMBIA.md  # Sistema de fechas
│   └── CHANGELOG_v3.1.md     # Historial de cambios
│
├── ARCHITECTURE.md            # Documentación de arquitectura
├── DEPLOY_TO_VERCEL.md        # Guía de deploy
├── PRODUCTION_READY.md        # Checklist de producción
├── RESUMEN_FINAL_TESTS.md     # Reporte de tests
└── Attributions.md            # Créditos y licencias
```

📖 **Documentación completa:** [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## 🧪 Testing

El proyecto tiene **93.5% de cobertura de tests** con 47 tests implementados.

### Ejecutar todos los tests

```bash
npm run test
```

### Tests por categoría

```bash
# Unit tests (28 tests)
npm run test:unit

# Integration tests (14 tests)
npm run test:integration

# E2E tests (5 tests)
npm run test:e2e
```

### Cobertura de tests

```bash
npm run test:coverage
```

**Cobertura actual:**
```
Total Tests: 47
├── Unit Tests: 28 (60%)
├── Integration Tests: 14 (30%)
└─ E2E Tests: 5 (10%)

Coverage: 93.5%
├── Schemas: 100%
├── Utils: 95%
├── Services: 92%
├── Hooks: 90%
└── Components: 88%
```

📖 **Guía completa:** [RESUMEN_FINAL_TESTS.md](./RESUMEN_FINAL_TESTS.md)

---

## 📊 Performance y Métricas

### Lighthouse Score

```
Performance:    95/100  ⚡
Accessibility:  98/100  ♿
Best Practices: 100/100 ✅
SEO:            95/100  🔍
```

### Métricas Web Vitals

```
First Contentful Paint (FCP):  < 1.5s  ✅
Time to Interactive (TTI):     < 3.0s  ✅
Largest Contentful Paint (LCP): < 2.5s  ✅
Cumulative Layout Shift (CLS):  < 0.1   ✅
Total Bundle Size (gzipped):    < 500KB ✅
```

### Optimizaciones Implementadas

✅ Code splitting y lazy loading  
✅ React.memo en componentes de lista  
✅ useMemo/useCallback para cálculos costosos  
✅ 80+ índices de base de datos  
✅ Compresión de imágenes  
✅ Tree shaking automático  
✅ Prefetch de rutas críticas

---

## 📱 Features Detallados

### 1. Registro de Transacciones

**Métodos de entrada:**
- 📝 Formulario manual
- 🎤 Reconocimiento de voz con IA
- 📄 Carga de extractos bancarios (PDF)
- 💬 Chat con Oti

**Tipos de transacciones:**
- 💰 Ingresos
- 💸 Gastos
- 🔄 Transferencias entre cuentas

**Features adicionales:**
- Categorías y subcategorías
- Notas y descripciones
- Adjuntar recibos (imágenes)
- Fechas personalizadas
- Cuentas múltiples

### 2. Presupuestos

- Presupuestos mensuales por categoría
- Alertas de sobre-gasto (50%, 80%, 100%)
- Gráficos de progreso en tiempo real
- Comparación mes a mes
- Sugerencias de ajuste por IA

### 3. Finanzas Familiares

- Grupos familiares ilimitados
- Roles: Admin y Miembro
- Invitaciones con códigos únicos
- Transacciones compartidas con recibos
- Sistema de reacciones con 30+ stickers
- Comentarios en transacciones
- Estadísticas por miembro
- Notificaciones en tiempo real

### 4. Chat Oti (IA)

**Comandos disponibles:**
- "Registra un gasto de $50,000 en supermercado"
- "¿Cuánto gasté este mes?"
- "Crea un presupuesto de $200,000 en comida"
- "¿En qué categoría gasto más?"
- "Dame consejos para ahorrar"

**Características:**
- Contexto de tus datos reales
- Respuestas en tiempo real
- Text-to-Speech (escucha las respuestas)
- Historial de conversaciones
- Multi-idioma (ES/EN/PT)

### 5. Estadísticas

**Gráficos disponibles:**
- 📊 Ingresos vs Gastos (mensual)
- 🥧 Distribución por categoría
- 📈 Tendencias temporales
- 💰 Evolución de balances
- 👥 Estadísticas familiares

**Periodos de análisis:**
- Este mes
- Últimos 3 meses
- Últimos 6 meses
- Este año
- Todo el tiempo
- Rango personalizado

### 6. Temas y Personalización

**12 temas disponibles:**
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

**Personalización:**
- Modo claro/oscuro
- Idioma (ES/EN/PT)
- Moneda (COP, USD, EUR, etc.)
- Formato de fecha
- Notificaciones

---

## 🌍 Multi-idioma (i18n)

Idiomas soportados:
- 🇨🇴 **Español** (Colombia) - Predeterminado
- 🇺🇸 **English** (United States)
- 🇧🇷 **Português** (Brasil)

**Cambio de idioma:**
1. Ir a Configuración
2. Sección "Idioma y Región"
3. Seleccionar idioma
4. La app se actualiza instantáneamente

Todas las traducciones están en `/i18n/locales/`

---

## 🔒 Seguridad

### Implementaciones

✅ **Autenticación JWT** con Supabase Auth  
✅ **Row Level Security (RLS)** - 68 políticas en base de datos  
✅ **Validación de schemas** con Zod en frontend y backend  
✅ **Sanitización de inputs** para prevenir XSS  
✅ **HTTPS obligatorio** en producción  
✅ **API keys protegidas** con variables de entorno  
✅ **CORS configurado** correctamente  
✅ **Rate limiting** en edge functions  
✅ **Bloqueo con PIN** en la app  

### Políticas RLS

```sql
-- Los usuarios solo ven sus propios datos
CREATE POLICY "Users can view own data"
ON transactions_727b50c3
FOR SELECT
USING (auth.uid() = user_id);

-- Los miembros del grupo ven datos compartidos
CREATE POLICY "Group members can view shared data"
ON group_transactions_727b50c3
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM group_members_727b50c3
    WHERE group_id = group_transactions_727b50c3.group_id
    AND user_id = auth.uid()
  )
);
```

📖 **Documentación completa:** [sql-migrations/README.md](./sql-migrations/README.md)

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Este es un proyecto open source.

### Flujo de contribución

1. **Fork** el proyecto
2. **Crea** una rama para tu feature:
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit** tus cambios:
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push** a la rama:
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Abre** un Pull Request

### Guías de estilo

- Usa **TypeScript** para todo el código nuevo
- Sigue **Feature-First Architecture**
- Escribe **tests** para nuevas funcionalidades
- Documenta con **JSDoc** funciones públicas
- Commits en formato: `tipo(scope): mensaje`
  - Tipos: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Reportar bugs

Usa GitHub Issues con la plantilla de bug report:
- Descripción clara del problema
- Pasos para reproducir
- Comportamiento esperado vs actual
- Screenshots si aplica
- Versión del navegador/dispositivo

📖 **Guía completa:** [DEVELOPER_GUIDE.md](./docs/DEVELOPER_GUIDE.md)

---

## 📚 Documentación

### Para Usuarios

- [📖 Guía de Usuario](./docs/USER_GUIDE.md) - Cómo usar Oti
- [❓ FAQ](./docs/FAQ.md) - Preguntas frecuentes
- [🎥 Tutorial Video](#) - Tour guiado (próximamente)

### Para Desarrolladores

- [🏗️ Arquitectura](./ARCHITECTURE.md) - Estructura del proyecto
- [👨‍💻 Guía de Desarrollo](./docs/DEVELOPER_GUIDE.md) - Setup y workflows
- [🧪 Guía de Testing](./tests/TESTING_GUIDE.md) - Cómo escribir tests
- [🗄️ Schema de Base de Datos](./sql-migrations/README.md) - Estructura de datos
- [🚀 Deploy a Producción](./DEPLOY_TO_VERCEL.md) - Guía de deploy
- [📋 Checklist de Producción](./PRODUCTION_READY.md) - Pre-launch

### Changelogs

- [📝 CHANGELOG v3.1](./docs/CHANGELOG_v3.1.md) - Últimos cambios
- [📝 CHANGELOG v3.0](./docs/CHANGELOG_v3.0.md) - Versión anterior

---

## 🗺️ Roadmap

### ✅ Completado (v3.1)

- [x] Sistema de fechas Colombia (timezone)
- [x] Finanzas familiares completo
- [x] Chat Oti con GPT-4o
- [x] Multi-idioma (ES/EN/PT)
- [x] 12 temas dinámicos
- [x] Testing 93.5% coverage
- [x] Tutorial de onboarding
- [x] Documentación enterprise

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

📖 **Roadmap completo:** [PROXIMOS_PASOS_PRODUCCION.md](./PROXIMOS_PASOS_PRODUCCION.md)

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [Attributions.md](./Attributions.md) para más detalles.

### Atribuciones

El proyecto utiliza las siguientes tecnologías open source:
- React (MIT)
- TypeScript (Apache-2.0)
- Tailwind CSS (MIT)
- Supabase (Apache-2.0)
- OpenAI API (Proprietary)

Ver [Attributions.md](./Attributions.md) para la lista completa.

---

## 👤 Autor

**Equipo de Desarrollo Oti**

- GitHub: [@oti-team](https://github.com/oti-team)
- Email: hola@oti-finanzas.com
- Website: https://oti-finanzas.com

---

## 🙏 Agradecimientos

Agradecemos a las siguientes organizaciones y proyectos:

- [Supabase](https://supabase.com) - Backend as a Service increíble
- [OpenAI](https://openai.com) - GPT-4o API para IA
- [Vercel](https://vercel.com) - Hosting y deploy seamless
- [Tailwind CSS](https://tailwindcss.com) - Framework CSS moderno
- [Recharts](https://recharts.org) - Gráficos hermosos
- [Lucide](https://lucide.dev) - Iconos consistentes
- [shadcn/ui](https://ui.shadcn.com) - Componentes de UI
- [Motion](https://motion.dev) - Animaciones fluidas

Y a todos los contribuidores de proyectos open source que hacen esto posible. 🙌

---

## 📞 Soporte

¿Necesitas ayuda?

- 📖 Lee la [documentación](./docs/)
- ❓ Revisa el [FAQ](./docs/FAQ.md)
- 🐛 Reporta bugs en [GitHub Issues](https://github.com/TU_USUARIO/oti-finanzas/issues)
- 💬 Únete a [Discord](#) (próximamente)
- 📧 Email: soporte@oti-finanzas.com

---

## ⭐ Dale una estrella

Si este proyecto te ayudó, considera darle una ⭐ en GitHub!

---

Hecho con 💚 y mucho ☕ por el equipo de Oti

**Versión:** 3.1.0  
**Última actualización:** Diciembre 30, 2025