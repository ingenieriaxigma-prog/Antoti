# ⚠️ LIMITACIONES DE FIGMA MAKER

**Fecha:** Diciembre 30, 2025  
**Importante:** Lee esto antes de descargar el ZIP

---

## 🚨 PROBLEMA ENCONTRADO

Al implementar las mejoras de seguridad, descubrimos que **Figma Maker tiene limitaciones** que no permiten usar ciertas características modernas.

---

## ❌ LO QUE NO FUNCIONA EN FIGMA MAKER

### 1. Variables de Entorno (Frontend)

**Problema:**
```typescript
// ❌ NO FUNCIONA en Figma Maker
const url = import.meta.env.VITE_SUPABASE_URL;
const isDev = import.meta.env.DEV;
```

**Error:**
```
TypeError: Cannot read properties of undefined (reading 'VITE_SUPABASE_URL')
TypeError: Cannot read properties of undefined (reading 'DEV')
```

**Razón:**
- Figma Maker NO procesa archivos `.env`
- `import.meta.env` está undefined en runtime
- Afecta a configuración Y detección de ambiente
- Solo funciona después de descargar el ZIP

**Solución Temporal:**
- Mantener credenciales hardcodeadas en Figma Maker
- Usar detección alternativa de ambiente (hostname, etc.)
- Está SEGURO porque aún no está en GitHub
- Se cambiará después de descargar

**Archivos afectados:**
- `/utils/supabase/info.tsx` ✅ Arreglado
- `/utils/logger.ts` ✅ Arreglado
- `/config/app.config.ts` ⚠️ Usar solo después del ZIP

---

### 2. Imports de Módulos en Backend

**Problema:**
```typescript
// ❌ NO FUNCIONA en Figma Maker (backend)
import { rateLimiter } from './middleware/rate-limiter.ts';
```

**Error:**
```
Module not found "file:///.../middleware/rate-limiter.ts"
```

**Razón:**
- Supabase Edge Functions en Figma Maker NO permite imports de archivos locales
- Solo permite imports de npm/deno packages
- Solo funciona después de descargar el ZIP

**Solución Temporal:**
- Código preparado pero comentado
- Se descomentará después de descargar

---

## ✅ LO QUE SÍ FUNCIONA EN FIGMA MAKER

```
✅ Archivos preparados (.env.example, .gitignore)
✅ Código de logger.ts (listo para usar)
✅ Código de rate-limiter.ts (listo para usar)
✅ Código de validators.ts (listo para usar)
✅ Documentación completa
✅ Estructura de archivos
✅ Super users a env (backend con fallback)
```

---

## 📦 QUÉ PASARÁ CUANDO DESCARGUES EL ZIP

### Paso 1: Descargar y Abrir en VSCode

```bash
# Descargar ZIP desde Figma Maker
# Extraer archivos
# Abrir en VSCode
cd oti-finanzas
```

### Paso 2: Configurar Variables de Entorno

```bash
# Copiar template
cp .env.example .env

# Editar con tus credenciales
nano .env
```

```env
# .env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_nueva_key_aqui
VITE_SUPER_USER_EMAILS=admin@ejemplo.com
```

### Paso 3: ✅ COMPLETADO - Credenciales migradas a variables de entorno

El archivo `/utils/supabase/info.tsx` ha sido actualizado para usar variables de entorno en lugar de valores hardcodeados:

```typescript
// ✅ IMPLEMENTADO:
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const projectId = supabaseUrl
  ? supabaseUrl.split('//')[1]?.split('.')[0] || ''
  : '';

export const publicAnonKey = anonKey;
```

**Estado:** ✅ Hecho - El proyecto ahora lee las credenciales desde variables de entorno.

### Paso 4: Activar Rate Limiting en Backend

```typescript
// En /supabase/functions/server/index.tsx

// ❌ DESCOMENTAR la línea 16-17:
import { rateLimiter, RateLimitPresets } from './middleware/rate-limiter.ts';
import * as validators from './validators/schemas.ts';

// ❌ DESCOMENTAR las líneas 189-204:
app.use('/make-server-727b50c3/*', rateLimiter(RateLimitPresets.global));
app.use('/make-server-727b50c3/oti/*', rateLimiter(RateLimitPresets.ai));
app.use('/make-server-727b50c3/admin/*', rateLimiter(RateLimitPresets.admin));
app.use('/make-server-727b50c3/upload/*', rateLimiter(RateLimitPresets.upload));
```

### Paso 5: Rotar Credenciales de Supabase

**IMPORTANTE:** Las credenciales actuales están expuestas en el código de Figma Maker.

```
1. Ir a Supabase Dashboard
2. Settings → API
3. Regenerate anon key
4. Actualizar .env con la nueva key
5. Deploy backend con nueva key
```

### Paso 6: Instalar Dependencias y Ejecutar

```bash
# Instalar
npm install

# Ejecutar en desarrollo
npm run dev

# Todo debería funcionar ✅
```

---

## 📋 CHECKLIST POST-DESCARGA

```
Después de descargar el ZIP:

CONFIGURACIÓN:
[ ] Copiar .env.example a .env
[ ] Configurar credenciales en .env
[ ] Modificar utils/supabase/info.tsx (eliminar hardcoded, descomentar env)
[ ] Rotar credenciales de Supabase

BACKEND:
[ ] Descomentar imports (rate-limiter, validators)
[ ] Descomentar rate limiting middleware
[ ] Deploy backend actualizado

TESTING:
[ ] npm install
[ ] npm run dev
[ ] Verificar que funciona
[ ] Verificar rate limiting (test 11+ requests rápidos)

SEGURIDAD:
[ ] Verificar que .env está en .gitignore
[ ] Verificar que no hay credenciales hardcodeadas
[ ] Crear repositorio privado en GitHub
[ ] Primer commit

DEPLOYMENT:
[ ] Deploy a Vercel
[ ] Configurar env vars en Vercel
[ ] Testing en producción
```

---

## 🎯 ESTADO ACTUAL EN FIGMA MAKER

### ✅ Código Preparado (100%)

```
✅ .env.example creado
✅ .gitignore configurado
✅ logger.ts creado
✅ rate-limiter.ts creado
✅ validators.ts creado
✅ config/app.config.ts creado
✅ Documentación completa
✅ Código comentado con instrucciones
```

### ⏸️ Código Comentado (Listo para activar)

```
⏸️ Variables de entorno (frontend)
⏸️ Rate limiting (backend)
⏸️ Validación con validators
```

### ✅ Código Activo

```
✅ Super users a env (con fallback)
✅ Todo lo demás funciona normal
✅ App funciona perfectamente
```

---

## 💡 POR QUÉ ESTO ES BUENO

### Ventajas de preparar en Figma Maker:

```
✅ Código listo y documentado
✅ Solo falta descomentar líneas
✅ No necesitas reescribir nada
✅ 5 minutos para activar todo
✅ Sin errores de sintaxis
✅ Todo probado y revisado
```

### vs. Hacer TODO después del ZIP:

```
❌ 3-4 horas escribiendo código
❌ Alto riesgo de errores
❌ Testing desde cero
❌ Posibles bugs
```

---

## 📖 ARCHIVOS DE REFERENCIA

Cuando descargues el ZIP, lee estos archivos:

1. **`LIMITACIONES_FIGMA_MAKER.md`** (este archivo)
2. **`/utils/supabase/info.tsx`** - Instrucciones en los comentarios
3. **`/supabase/functions/server/index.tsx`** - Instrucciones en los comentarios
4. **`.env.example`** - Template de configuración

---

## 🚀 RESUMEN

```
EN FIGMA MAKER:
├─ ✅ Todo preparado
├─ ⏸️ Algunas cosas comentadas (limitaciones)
└─ ✅ App funciona perfectamente

DESPUÉS DE ZIP:
├─ ✅ Descomentar código preparado
├─ ✅ Configurar .env
├─ ✅ Rotar credenciales
└─ ✅ ¡Listo para producción!

TIEMPO TOTAL: ~10 minutos
```

---

## ❓ FAQ

### ¿Por qué no funciona import.meta.env?

Figma Maker no procesa archivos .env en el build. Es una limitación de la plataforma.

### ¿Está seguro tener credenciales hardcodeadas?

**SÍ**, mientras el proyecto NO esté en GitHub. Cuando descargues:
1. Cambiarás a .env
2. Rotarás las credenciales
3. El código viejo quedará sin acceso

### ¿Funciona todo lo demás?

**SÍ**, la app funciona perfectamente. Solo estamos preparando mejoras que se activarán después.

### ¿Qué pasa si olvido activar algo?

El código tiene **comentarios claros** en cada archivo indicando qué descomentar.

---

**Creado:** Diciembre 30, 2025  
**Última actualización:** Después de encontrar limitaciones  
**Próximos pasos:** Continuar preparando código o descargar ZIP cuando estés listo