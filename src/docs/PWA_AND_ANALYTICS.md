# 📱 PWA & ANALYTICS - IMPLEMENTATION GUIDE

> **Versión:** 1.0  
> **Fecha:** Diciembre 30, 2025  
> **Estado:** ✅ Implementado y Funcional

---

## 📋 TABLA DE CONTENIDOS

1. [PWA (Progressive Web App)](#pwa-progressive-web-app)
2. [Analytics System](#analytics-system)
3. [Setup Instructions](#setup-instructions)
4. [Usage Examples](#usage-examples)
5. [Best Practices](#best-practices)

---

## 📱 PWA (PROGRESSIVE WEB APP)

### ✅ Características Implementadas

- ✅ **Service Worker** - Caching inteligente y modo offline
- ✅ **Web App Manifest** - Instalación como app nativa
- ✅ **Offline Mode** - Página offline personalizada
- ✅ **Install Prompt** - Prompt de instalación con toast
- ✅ **Network Detection** - Detección de conexión online/offline
- ✅ **Auto-update** - Notificaciones de nuevas versiones
- ✅ **Background Sync** - Preparado para sincronización offline (placeholder)
- ✅ **Push Notifications** - Soporte para notificaciones push (básico)

### 📁 Archivos Creados

```
/public/
├── manifest.json           # PWA manifest con metadata
├── service-worker.js       # Service Worker v3.2
└── offline.html           # Página offline personalizada

/src/utils/
└── pwa.ts                 # PWA utilities y helpers
```

### 🎯 Estrategia de Caching

El Service Worker implementa una estrategia **Network-First con Cache Fallback**:

```
1. Intenta obtener del network (online)
   ├─ ✅ Success → Guarda en cache y retorna
   └─ ❌ Fail → Busca en cache
      ├─ ✅ Found → Retorna desde cache
      └─ ❌ Not Found → Muestra página offline
```

### 📦 Tipos de Cache

```javascript
// Static Assets (Pre-cached en install)
CACHE_STATIC = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/offline.html'
];

// Dynamic Assets (Cached on-demand)
CACHE_DYNAMIC = [
  // CSS, JS, images loaded during use
];

// API Responses (Selective caching)
CACHE_API = [
  '/make-server-727b50c3/accounts',
  '/make-server-727b50c3/categories',
  '/make-server-727b50c3/budgets'
];
```

### 🚀 Funcionalidades PWA

#### 1. **Instalación Como App**

```typescript
// Trigger install prompt
import { promptInstall, canInstall } from '@/utils/pwa';

if (canInstall()) {
  await promptInstall();
}
```

**Beneficios:**
- Icono en home screen
- Experiencia sin navegador
- Splash screen personalizado
- Shortcuts de acciones rápidas

#### 2. **Modo Offline**

Cuando el usuario pierde conexión:
- Se muestra toast notificando
- Se sirve contenido desde cache
- Para navegación se muestra `/offline.html`
- Auto-reconexión cuando vuelve online

#### 3. **Auto-Update**

Cuando hay una nueva versión:
- Service Worker detecta el cambio
- Se muestra toast con botón "Actualizar"
- Al hacer click, se actualiza la app
- Se recarga con la nueva versión

#### 4. **Shortcuts**

Definidos en `manifest.json`:
- **Nueva Transacción** → `/?action=new-transaction`
- **Chat con Oti** → `/?action=chat`
- **Estadísticas** → `/?action=statistics`

### 🔧 Configuración

#### index.html

```html
<!-- PWA Manifest -->
<link rel="manifest" href="/manifest.json">

<!-- Theme Color -->
<meta name="theme-color" content="#10b981">

<!-- Apple Touch Icon -->
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
```

#### main.tsx

```typescript
import { initPWA } from './utils/pwa';

// Initialize PWA features
initPWA();
```

### 📊 Métricas PWA

- **Install Prompt Available** - Se trackea en analytics
- **PWA Installed** - Se trackea con toast success
- **Offline Mode** - Se trackea con toast error/success
- **Service Worker Status** - Se logea en consola

### 🎨 Iconos Requeridos

Para PWA completo, necesitas estos iconos en `/public/`:

```
icon-72x72.png      (Android)
icon-96x96.png      (Android)
icon-128x128.png    (Android)
icon-144x144.png    (Android)
icon-152x152.png    (iOS)
icon-192x192.png    (Android/Chrome)
icon-384x384.png    (Android)
icon-512x512.png    (Android/Chrome)
apple-touch-icon.png (iOS - 180x180)
```

**Tip:** Usa https://realfavicongenerator.net/ para generar todos los iconos.

---

## 📊 ANALYTICS SYSTEM

### ✅ Características Implementadas

- ✅ **Custom Event Tracking** - Trackear cualquier evento
- ✅ **User Properties** - Propiedades del usuario
- ✅ **User Identification** - Identificar usuarios autenticados
- ✅ **Page View Tracking** - Trackear navegación
- ✅ **Error Tracking** - Trackear errores automáticamente
- ✅ **Performance Timing** - Medir performance
- ✅ **Privacy-Friendly** - Sin PII (Personally Identifiable Information)
- ✅ **Predefined Events** - Eventos comunes pre-configurados
- ✅ **Multiple Providers** - Soporte para GA, Mixpanel, backend custom

### 📁 Archivo Creado

```
/src/utils/
└── analytics.ts           # Analytics system completo
```

### 🎯 Providers Soportados

#### 1. **Google Analytics 4 (GA4)**

```typescript
// Setup en .env
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

// Auto-inicializa con GA4
// Envia eventos automáticamente
```

#### 2. **Mixpanel**

```typescript
// Setup en .env
VITE_MIXPANEL_TOKEN=your_token_here

// Auto-inicializa con Mixpanel
// Envia eventos automáticamente
```

#### 3. **Custom Backend** (Opcional)

```typescript
// Puedes implementar tu propio backend
// Ver función sendToBackend() en analytics.ts
```

### 📈 Uso Básico

#### Inicialización

```typescript
import { initAnalytics } from '@/utils/analytics';

// Se llama automáticamente en main.tsx
initAnalytics();
```

#### Track Event

```typescript
import { trackEvent } from '@/utils/analytics';

trackEvent('Transaction', 'Create', 'expense', 1500);
```

#### Identify User

```typescript
import { identifyUser } from '@/utils/analytics';

// Después del login
identifyUser(userId, {
  plan: 'free',
  language: 'es',
  theme: 'dark'
});
```

#### Page View

```typescript
import { trackPageView } from '@/utils/analytics';

trackPageView('/dashboard', 'Dashboard Principal');
```

#### Track Error

```typescript
import { trackError } from '@/utils/analytics';

try {
  // Code that might throw
} catch (error) {
  trackError(error as Error, 'Transaction creation');
}
```

### 🎨 Eventos Predefinidos

#### Auth Events

```typescript
import { AuthEvents } from '@/utils/analytics';

// Login
AuthEvents.login('email');        // 'email' | 'google' | 'facebook'

// Sign up
AuthEvents.signup('google');

// Logout
AuthEvents.logout();

// Password reset
AuthEvents.passwordReset();
```

#### Transaction Events

```typescript
import { TransactionEvents } from '@/utils/analytics';

// Create
TransactionEvents.create('expense');   // 'income' | 'expense' | 'transfer'

// Edit
TransactionEvents.edit('income');

// Delete
TransactionEvents.delete();

// Voice input
TransactionEvents.voiceInput();

// Batch import
TransactionEvents.batchImport(15);     // count
```

#### Budget Events

```typescript
import { BudgetEvents } from '@/utils/analytics';

BudgetEvents.create();
BudgetEvents.edit();
BudgetEvents.delete();
BudgetEvents.exceeded();               // Cuando se excede el presupuesto
```

#### AI Events

```typescript
import { AIEvents } from '@/utils/analytics';

AIEvents.chatMessage();
AIEvents.advisor('savings-tips');      // feature name
AIEvents.statementUpload();
```

#### Feature Usage

```typescript
import { FeatureEvents } from '@/utils/analytics';

FeatureEvents.use('family-groups');
FeatureEvents.install();               // PWA install
FeatureEvents.share();
FeatureEvents.export('pdf');           // format
```

### 📊 Datos Trackeados

#### Event Data

```typescript
{
  category: string,      // 'Transaction', 'Budget', etc.
  action: string,        // 'Create', 'Edit', 'Delete'
  label?: string,        // Extra context
  value?: number,        // Numeric value
  metadata?: object      // Additional data
}
```

#### User Properties

```typescript
{
  userId?: string,
  plan?: 'free' | 'premium',
  language?: 'es' | 'en' | 'pt',
  theme?: 'light' | 'dark',
  // Custom properties...
}
```

### 🔒 Privacy

**NO se trackean:**
- ❌ Nombres personales
- ❌ Emails
- ❌ Montos específicos de transacciones
- ❌ Nombres de cuentas
- ❌ Notas privadas

**SI se trackean:**
- ✅ Eventos de uso (crear, editar, eliminar)
- ✅ Features usadas
- ✅ Navegación entre pantallas
- ✅ Errores técnicos
- ✅ Performance metrics
- ✅ User properties generales (idioma, tema)

### 🐛 Debug Mode

En desarrollo (DEV mode):
- Se logean todos los eventos en consola
- No se envía a providers reales (opcional)
- Fácil verificar que eventos se trackean

```typescript
// En DEV se ve en consola:
console.log('[Analytics] Event:', {
  category: 'Transaction',
  action: 'Create',
  label: 'expense',
  value: 1500
});
```

---

## 🛠️ SETUP INSTRUCTIONS

### Step 1: Generar Iconos PWA

1. Crea un icono base de 512x512px con el logo de Oti
2. Usa https://realfavicongenerator.net/
3. Descarga los iconos generados
4. Colócalos en `/public/`

### Step 2: Configurar Google Analytics (Opcional)

```bash
# 1. Ve a https://analytics.google.com
# 2. Crea una propiedad GA4
# 3. Obtén el Measurement ID (G-XXXXXXXXXX)
# 4. Agrégalo a .env

echo "VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX" >> .env
```

### Step 3: Configurar Mixpanel (Opcional)

```bash
# 1. Ve a https://mixpanel.com
# 2. Crea un proyecto
# 3. Obtén el Project Token
# 4. Agrégalo a .env

echo "VITE_MIXPANEL_TOKEN=your_token_here" >> .env
```

### Step 4: Verificar Implementación

1. **PWA:**
   - Abre DevTools → Application → Service Workers
   - Verifica que el SW está registrado
   - Ve a Manifest y verifica los datos

2. **Analytics:**
   - Abre DevTools → Console
   - Realiza acciones en la app
   - Verifica que se logean los eventos

3. **Offline Mode:**
   - Abre DevTools → Network
   - Marca "Offline"
   - Recarga la página
   - Deberías ver la página offline

---

## 💡 USAGE EXAMPLES

### Ejemplo 1: Trackear Creación de Transacción

```typescript
// En NewTransactionScreen.tsx
import { TransactionEvents } from '@/utils/analytics';

const handleSave = async (data: Transaction) => {
  try {
    await createTransaction(data);
    
    // Track success
    TransactionEvents.create(data.type);
    
    toast.success('Transacción creada');
  } catch (error) {
    // Track error
    trackError(error as Error, 'Transaction creation');
    toast.error('Error al crear transacción');
  }
};
```

### Ejemplo 2: Trackear Navegación

```typescript
// En App.tsx o UIContext
import { trackPageView } from '@/utils/analytics';

const handleNavigate = (screen: string) => {
  setCurrentScreen(screen);
  
  // Track page view
  trackPageView(`/${screen}`, getScreenTitle(screen));
};
```

### Ejemplo 3: Identificar Usuario

```typescript
// En AuthContext después del login
import { identifyUser } from '@/utils/analytics';

const handleLogin = async (email, password) => {
  const { user } = await signIn(email, password);
  
  // Identify user
  identifyUser(user.id, {
    plan: user.plan || 'free',
    language: user.language || 'es'
  });
};
```

### Ejemplo 4: Prompt de Instalación PWA

```typescript
// En Settings o Dashboard
import { canInstall, promptInstall } from '@/utils/pwa';
import { FeatureEvents } from '@/utils/analytics';

const handleInstall = async () => {
  if (!canInstall()) {
    toast.error('La instalación no está disponible');
    return;
  }
  
  const accepted = await promptInstall();
  
  if (accepted) {
    FeatureEvents.install();
    toast.success('Oti se está instalando');
  }
};
```

---

## ✅ BEST PRACTICES

### PWA

1. **Mantén el Service Worker Actualizado**
   - Incrementa la versión en `CACHE_VERSION`
   - Limpia caches antiguos en evento `activate`

2. **Cache Estratégicamente**
   - Solo cachea assets estáticos importantes
   - Evita cachear datos sensibles o muy dinámicos
   - Limita el tamaño del cache

3. **Prueba Offline**
   - Siempre prueba la app offline antes de deploy
   - Verifica que las páginas cached funcionan
   - Asegúrate que la página offline se ve bien

4. **Iconos Optimizados**
   - Usa iconos PNG optimizados
   - Tamaños correctos para cada plataforma
   - Iconos "maskable" para Android

5. **Manifest Completo**
   - Descripción clara y concisa
   - Screenshots para app stores
   - Shortcuts útiles para usuarios

### Analytics

1. **Track Eventos Importantes**
   - Acciones clave del usuario (crear, editar, eliminar)
   - Features usadas
   - Errores críticos
   - Conversiones (ej: completar onboarding)

2. **No Trackear Todo**
   - Evita trackear eventos muy frecuentes (ej: cada scroll)
   - No trackees datos sensibles
   - Agrupa eventos similares

3. **Usa Categorías Consistentes**
   - Define categorías claras: 'Transaction', 'Budget', 'Auth'
   - Usa la misma nomenclatura siempre
   - Documenta los eventos trackeados

4. **Privacy First**
   - Nunca trackees PII
   - Anonimiza datos cuando sea posible
   - Cumple con GDPR/CCPA

5. **Test en DEV**
   - Siempre verifica eventos en DEV
   - Usa debug mode para ver eventos
   - Valida que los datos son correctos

---

## 🎯 CHECKLIST PRE-DEPLOY

### PWA

- [ ] Service Worker registrado correctamente
- [ ] Manifest.json válido y completo
- [ ] Iconos de todos los tamaños generados
- [ ] Página offline funcional y bonita
- [ ] Install prompt funcionando
- [ ] Offline mode testeado
- [ ] Cache strategy verificada
- [ ] Auto-update notifications funcionando

### Analytics

- [ ] Analytics inicializado en main.tsx
- [ ] GA4 o Mixpanel configurado (si aplica)
- [ ] Eventos importantes trackeados
- [ ] User identification después de login
- [ ] Page views trackeadas
- [ ] Error tracking implementado
- [ ] Privacy verificada (no PII)
- [ ] Debug mode testeado en DEV

---

## 📚 RECURSOS

### PWA

- **MDN Web Docs:** https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps
- **Web.dev PWA Guide:** https://web.dev/progressive-web-apps/
- **PWA Builder:** https://www.pwabuilder.com/
- **Favicon Generator:** https://realfavicongenerator.net/

### Analytics

- **Google Analytics 4 Docs:** https://developers.google.com/analytics/devguides/collection/ga4
- **Mixpanel Docs:** https://developer.mixpanel.com/docs
- **Privacy Best Practices:** https://gdpr.eu/

---

## 🚀 PRÓXIMOS PASOS

### PWA Avanzado

- [ ] Push Notifications completas
- [ ] Background Sync real (sincronizar transacciones offline)
- [ ] Periodic Background Sync
- [ ] Share Target API (compartir a Oti)
- [ ] Web Share API
- [ ] Badging API (mostrar badge en icono)

### Analytics Avanzado

- [ ] Funnels de conversión
- [ ] A/B Testing
- [ ] Session Recording
- [ ] Heatmaps
- [ ] User journey mapping
- [ ] Retention cohorts

---

**Versión:** 1.0  
**Fecha:** Diciembre 30, 2025  
**Autor:** Equipo Oti  
**Licencia:** Ver Attributions.md
