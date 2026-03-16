# 🚀 Preparación para Producción - Oti

## ✅ Cambios Implementados

### 1. Sistema de Logging Profesional

Se creó `/utils/logger.ts` con **niveles configurables**:

- **ERROR** → ❌ Siempre se muestra (errores críticos)
- **WARN** → ⚠️ Se muestra en dev y prod (advertencias importantes)
- **INFO** → ℹ️ Solo en desarrollo (información general)
- **DEBUG** → 🔍 Solo en desarrollo (detalles técnicos)

### 2. Detección Automática de Ambiente

```typescript
// En desarrollo (npm run dev)
isDevelopment = true  → Todos los logs activos

// En producción (npm run build)
isDevelopment = false → Solo errores y warnings
```

### 3. Archivos Actualizados

✅ `/App.tsx` - Eliminados logs innecesarios  
✅ `/contexts/AuthContext.tsx` - Convertido a logger profesional  
✅ `/utils/api/accounts.tsx` - Reducidos logs verbosos  
✅ `/utils/logger.ts` - Sistema de logging creado

---

## 📋 Pasos para Limpiar TODOS los Logs

### Opción A: Búsqueda Manual (Recomendado)

Busca y reemplaza en TODO el proyecto:

1. **Buscar:** `console.log('🔵`  
   **Reemplazar con:** `logger.debug(`

2. **Buscar:** `console.log('✅`  
   **Reemplazar con:** `logger.info(`

3. **Buscar:** `console.log('⚠️`  
   **Reemplazar con:** `logger.warn(`

4. **Buscar:** `console.log('❌`  
   **Reemplazar con:** `logger.error(`

5. **Buscar:** `console.log('📊`  
   **Reemplazar con:** `logger.debug(`

6. **Buscar:** `console.log('🔍`  
   **Reemplazar con:** `logger.debug(`

7. **Buscar:** `console.log('━━━`  
   **Eliminar línea completa**

### Opción B: Archivos Críticos a Revisar

Estos son los archivos con MÁS logs:

```
/utils/api/
  - accounts.ts ✅ (ya limpio)
  - transactions.ts
  - categories.ts
  - budgets.ts
  
/contexts/
  - AuthContext.tsx ✅ (ya limpio)
  - AppContext.tsx
  - UIContext.tsx

/hooks/
  - useDataLoader.ts
  
/components/
  - AdminPanel.tsx
  - OtiChatV3.tsx
  - BankStatementUpload.tsx
```

---

## 🎯 Guía de Uso del Logger

### Ejemplo ANTES (❌ Malo para producción):

```typescript
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔵 [getAccounts] CALLED');
console.log(`📌 providedToken: ${providedToken}`);
console.log(`📌 localStorage token: ${getAccessToken()}`);
console.log(`📌 Final token: ${token}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📥 [getAccounts] Fetching accounts...');
console.log('✅ [getAccounts] Received 5 accounts');
```

### Ejemplo DESPUÉS (✅ Bueno para producción):

```typescript
import { logger } from '../utils/logger';

logger.debug('[getAccounts] Fetching accounts...');
logger.info(`Received ${accounts.length} accounts`);
```

**Resultado en producción:** ¡CERO logs! 🎉  
**Resultado en desarrollo:** Todos los logs visibles ✅

---

## 🧪 Cómo Probar

### 1. Modo Desarrollo (Todos los logs)

```bash
npm run dev
```

Abre la consola → Verás TODOS los logs (info, debug, warn, error)

### 2. Modo Producción (Solo errores)

```bash
npm run build
npm run preview
```

Abre la consola → Verás SOLO errores y warnings críticos

---

## 🔧 Variables de Ambiente (Opcional)

Si quieres control manual, puedes crear `.env`:

```env
# .env
VITE_LOG_LEVEL=error  # Opciones: error, warn, info, debug
```

Y modificar `logger.ts`:

```typescript
const logLevel = import.meta.env.VITE_LOG_LEVEL || 'info';
```

---

## 📦 Build para Producción

```bash
# 1. Construir la app
npm run build

# 2. Verificar el tamaño
# dist/ debería ser < 2MB (aproximadamente)

# 3. Probar localmente
npm run preview

# 4. Verificar la consola - debe estar LIMPIA
```

---

## ✅ Checklist Final

Antes de subir a producción:

- [ ] Todos los `console.log` convertidos a `logger.*`
- [ ] Build ejecutado sin errores: `npm run build`
- [ ] Consola limpia en `npm run preview`
- [ ] Variables de entorno configuradas
- [ ] Analytics/Tracking configurado (si aplica)
- [ ] SSL certificado configurado
- [ ] Dominio apuntando correctamente

---

## 🎨 Logs Permitidos en Producción

**SÍ está bien mostrar:**

- ❌ Errores críticos (conexión fallida, auth error, etc.)
- ⚠️ Warnings importantes (token expirando, data corrupta, etc.)

**NO mostrar:**

- 🔍 Debug de tokens, IDs, datos de usuario
- ℹ️ Información de flujo normal ("Usuario autenticado", "Datos cargados")
- 📊 Estadísticas detalladas de data
- 🔵 Logs de llamadas a funciones

---

## 🚨 Seguridad

**NUNCA loguear en producción:**

- Tokens de acceso (access_token, refresh_token)
- Contraseñas o PINs
- Datos personales completos (emails, teléfonos)
- API keys o secrets
- IDs de usuarios completos

**Ejemplo seguro:**

```typescript
// ❌ MAL
logger.info('Token:', accessToken);

// ✅ BIEN
logger.debug('Token:', accessToken?.substring(0, 10) + '...');

// ✅ MEJOR (solo en desarrollo)
logger.debug('Has token:', !!accessToken);
```

---

## 📞 Soporte

Si tienes dudas sobre qué logs mantener o eliminar, revisa:

1. **Errores del usuario** → Mantener (con toast message)
2. **Errores del sistema** → Mantener (para debugging)
3. **Flujo normal** → Eliminar (innecesario)
4. **Debug de desarrollo** → Eliminar (sensible)

---

**¡Listo para producción!** 🚀

Una vez limpies los logs restantes siguiendo esta guía, tu app estará 100% lista para deployment.
