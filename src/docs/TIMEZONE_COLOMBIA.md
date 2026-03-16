# 🇨🇴 Sistema de Zona Horaria de Colombia

## 📍 Zona Horaria Oficial

Oti usa la zona horaria oficial de Colombia del **estándar IANA Time Zone Database**:

```
America/Bogota (UTC-5)
```

Este es un estándar público internacional mantenido por la **Internet Assigned Numbers Authority (IANA)** y soportado por todos los navegadores modernos.

---

## 🔧 Implementación Técnica

### ✅ Función Principal: `getTodayLocalDate()`

```typescript
export function getTodayLocalDate(): string {
  const now = new Date();
  
  // Usar zona horaria oficial de Colombia del estándar IANA
  const colombiaFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  
  // Retorna formato YYYY-MM-DD
  return colombiaFormatter.format(now);
}
```

### 🎯 Características Clave

1. **Zona Horaria Explícita:** Usa `timeZone: 'America/Bogota'` del estándar IANA
2. **Formato Estándar:** Retorna `YYYY-MM-DD` (ISO 8601)
3. **Locale Canadiense:** Usa `'en-CA'` que formatea fechas como `YYYY-MM-DD` automáticamente
4. **Sin Dependencias:** Solo usa APIs nativas del navegador (`Intl.DateTimeFormat`)

---

## ❌ ¿Por Qué NO Usar `toISOString()`?

### Método Incorrecto (NO USAR):
```typescript
// ❌ INCORRECTO - Usa UTC en lugar de zona local
const date = new Date().toISOString().split('T')[0];
// Resultado en Colombia (7:36 PM del 30 nov):
// "2025-12-01" ← ¡1 DÍA ADELANTE!
```

### Método Correcto (USAR):
```typescript
// ✅ CORRECTO - Usa zona horaria de Colombia
const date = getTodayLocalDate();
// Resultado en Colombia (7:36 PM del 30 nov):
// "2025-11-30" ← CORRECTO
```

---

## 🌍 ¿Qué es el Estándar IANA Time Zone Database?

El **IANA Time Zone Database** (también conocido como `tzdata` o `zoneinfo`) es:

- **Público y Gratuito:** Mantenido por IANA (organización sin fines de lucro)
- **Estándar Global:** Usado por todos los sistemas operativos modernos
- **Actualizado Regularmente:** Incluye cambios de horario de verano, reformas políticas, etc.
- **Soportado Universalmente:** 
  - ✅ Todos los navegadores (Chrome, Firefox, Safari, Edge)
  - ✅ Node.js y Deno
  - ✅ Java, Python, Ruby, PHP, etc.
  - ✅ iOS, Android, Windows, Linux, macOS

**Referencia oficial:** https://www.iana.org/time-zones

---

## 📦 Zonas Horarias de Colombia en IANA

Colombia tiene **UNA sola zona horaria oficial**:

| Código IANA | Región | UTC Offset | Horario de Verano |
|-------------|--------|------------|-------------------|
| `America/Bogota` | Todo Colombia | UTC-5 | No aplica |

**Nota:** Colombia NO observa horario de verano (DST) desde 1993.

---

## 🧪 Validación y Testing

### Panel de Debug (Temporal)

Se incluye un panel de debug en `/components/DateDebugPanel.tsx` que muestra:

1. **Zona Horaria Oficial:** `America/Bogota (UTC-5)`
2. **Hora Actual en Colombia:** Usando `Intl.DateTimeFormat` con `timeZone: 'America/Bogota'`
3. **Fecha Local (Correcta):** Usando `getTodayLocalDate()`
4. **Fecha UTC (Incorrecta):** Para comparación y mostrar el problema

### Cómo Validar

1. Abrir la app (el panel aparece en la esquina inferior derecha)
2. Verificar que:
   - **Estándar:** IANA Time Zone DB
   - **Zona:** America/Bogota
   - **Estado:** ✅ CORRECTO
3. Crear una transacción y verificar que la fecha sea correcta

---

## 📝 Archivos Actualizados

### Archivos con `getTodayLocalDate()`:

1. `/utils/dateUtils.ts` - Función principal
2. `/features/transactions/components/NewTransactionScreen.tsx`
3. `/features/dashboard/components/DashboardScreen.tsx`
4. `/components/OtiChatV3.tsx`
5. `/features/family/components/GroupDashboard.tsx`
6. `/features/family/components/ShareTransactionModal.tsx`

### Búsqueda de Usos Incorrectos:

Para buscar usos del método incorrecto:
```bash
grep -r "toISOString().split('T')\[0\]" --include="*.tsx" --include="*.ts"
```

---

## 🔒 Garantías de Robustez

### ✅ Funciona Aunque el Usuario Esté en Otra Zona Horaria

Si un usuario colombiano viaja a New York o Madrid, la app **SIEMPRE** usará la hora de Colombia (`America/Bogota`) para registrar transacciones.

**Ejemplo:**
- Usuario en Madrid (UTC+1)
- Hora local en Madrid: 2:00 AM del 1 dic 2025
- Hora en Colombia: 8:00 PM del 30 nov 2025
- **Transacción se guarda con:** `2025-11-30` ✅

### ✅ Funciona en Todos los Dispositivos

- iOS (Safari, Chrome)
- Android (Chrome, Samsung Internet)
- Desktop (Chrome, Firefox, Safari, Edge)
- Web Views (React Native, Electron, etc.)

### ✅ No Requiere Conexión a Internet

El estándar IANA está **incluido en el navegador**, no requiere API externa.

---

## 🚀 Funciones Adicionales

### `getColombiaTime()` - Fecha/Hora Completa

```typescript
const colombiaTime = getColombiaTime();
// Retorna: Date object ajustado a zona horaria de Colombia
```

### `formatLocalDate()` - Formatear Fechas

```typescript
const formatted = formatLocalDate('2025-11-30', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});
// Resultado: "domingo, 30 de noviembre de 2025"
```

---

## 📚 Referencias

- **IANA Time Zone Database:** https://www.iana.org/time-zones
- **MDN - Intl.DateTimeFormat:** https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat
- **MDN - timeZone option:** https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#timezone
- **Lista completa de zonas IANA:** https://en.wikipedia.org/wiki/List_of_tz_database_time_zones

---

## 🐛 Troubleshooting

### Problema: La fecha sigue mostrando 1 día adelante

**Solución:**
1. Verificar que estés usando `getTodayLocalDate()` en lugar de `new Date().toISOString().split('T')[0]`
2. Buscar usos incorrectos:
   ```bash
   grep -r "toISOString().split" --include="*.tsx" --include="*.ts"
   ```
3. Reemplazar con `getTodayLocalDate()`

### Problema: El navegador no soporta `timeZone: 'America/Bogota'`

**Causa:** Navegador muy antiguo (anterior a 2017)

**Solución:** Actualizar navegador. Soportado desde:
- Chrome 24+ (2013)
- Firefox 52+ (2017)
- Safari 10+ (2016)
- Edge 14+ (2016)

---

## ✅ Checklist de Validación

- [ ] Panel de debug muestra "✅ CORRECTO"
- [ ] Fecha local muestra `2025-11-30`
- [ ] Fecha UTC muestra `2025-12-01`
- [ ] Transacciones se guardan con fecha correcta
- [ ] Estadísticas mensuales muestran datos correctos
- [ ] Presupuestos calculan contra el mes correcto

---

**Última actualización:** 30 de noviembre de 2025  
**Versión:** 2.0 - Migración a estándar IANA  
**Autor:** Sistema Oti
