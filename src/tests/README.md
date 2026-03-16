# 🧪 Testing en Oti - Guía Completa

**Sistema de Testing:** Vitest + Testing Library + Zod Validation
**Cobertura Objetivo:** 79% (fin de Semana 4)
**Estado Actual:** Fase 1B completada ✅

---

## 📋 Tabla de Contenidos

1. [Estructura de Tests](#estructura-de-tests)
2. [Comandos Disponibles](#comandos-disponibles)
3. [Escribir Tests](#escribir-tests)
4. [Testing Manual vs Automatizado](#testing-manual-vs-automatizado)
5. [Roadmap](#roadmap)

---

## 🗂️ Estructura de Tests

```
/tests/
├── setup.ts                      # Configuración global de Vitest
├── README.md                     # Esta guía
│
├── utils/                        # ✅ Unit Tests - Utilidades
│   ├── calculations.test.ts     # Tests de cálculos financieros (10 suites, 34 tests)
│   └── formatting.test.ts       # Tests de formateo (10 suites, 28 tests)
│
├── schemas/                      # ✅ Schema Validation Tests
│   └── validation.test.ts       # Tests de validación Zod (5 suites, 35 tests)
│
├── features/                     # 🔄 Feature Tests (Semana 2)
│   ├── transactions/
│   ├── budgets/
│   ├── accounts/
│   └── categories/
│
├── components/                   # 🔄 Component Tests (Semana 2)
│   ├── SpeedDial.test.tsx
│   ├── Navigation.test.tsx
│   └── ThemeToggle.test.tsx
│
└── integration/                  # 🔄 Integration Tests (Semana 3)
    ├── transaction-flow.test.ts
    ├── budget-alerts.test.ts
    └── multi-user.test.ts
```

---

## ⚡ Comandos Disponibles

### Ejecutar Tests

```bash
# Ejecutar todos los tests
npm run test

# Ejecutar tests en modo watch (desarrollo)
npm run test:watch

# Ejecutar tests con reporte de cobertura
npm run test:coverage

# Ejecutar tests en modo UI (interfaz visual)
npm run test:ui

# Ejecutar solo tests de un archivo específico
npm run test calculations.test.ts

# Ejecutar tests de un directorio específico
npm run test tests/utils/
```

### Análisis de Cobertura

```bash
# Ver reporte HTML de cobertura
npm run test:coverage
# Luego abrir: coverage/index.html

# Ver reporte en terminal
npm run test -- --coverage
```

### Debugging

```bash
# Ejecutar tests con logs detallados
npm run test -- --reporter=verbose

# Ejecutar un solo test
npm run test -- -t "debería calcular correctamente el total de ingresos"

# Ejecutar tests en modo debug (Node inspector)
npm run test:debug
```

---

## 📝 Escribir Tests

### 1. Unit Test Básico (Utils/Functions)

```typescript
// tests/utils/mi-funcion.test.ts
import { describe, it, expect } from 'vitest';
import { miFuncion } from '@/utils/mi-funcion';

describe('miFuncion', () => {
  it('debería hacer algo específico', () => {
    const resultado = miFuncion(parametro);
    expect(resultado).toBe(valorEsperado);
  });

  it('debería manejar casos edge', () => {
    expect(miFuncion(null)).toBe(default);
    expect(miFuncion([])).toBe(0);
  });
});
```

### 2. Schema Validation Test

```typescript
// tests/schemas/mi-schema.test.ts
import { describe, it, expect } from 'vitest';
import { MiSchema } from '@/schemas';

describe('MiSchema', () => {
  it('debería validar datos correctos', () => {
    const validData = { campo: 'valor' };
    const result = MiSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('debería rechazar datos inválidos', () => {
    const invalidData = { campo: null };
    const result = MiSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

### 3. Component Test (React)

```typescript
// tests/components/MiComponente.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MiComponente from '@/components/MiComponente';

describe('MiComponente', () => {
  it('debería renderizar correctamente', () => {
    render(<MiComponente />);
    expect(screen.getByText('Texto esperado')).toBeInTheDocument();
  });

  it('debería manejar click', async () => {
    render(<MiComponente />);
    const boton = screen.getByRole('button');
    fireEvent.click(boton);
    expect(screen.getByText('Después del click')).toBeInTheDocument();
  });
});
```

### 4. Integration Test

```typescript
// tests/integration/flujo-completo.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { TransactionService } from '@/features/transactions/services/transaction.service';

describe('Flujo completo de transacción', () => {
  beforeEach(() => {
    // Setup inicial
  });

  it('debería crear transacción y actualizar balance', () => {
    // 1. Crear transacción
    const transaction = TransactionService.create({...});
    
    // 2. Verificar que se creó
    expect(transaction.id).toBeDefined();
    
    // 3. Verificar que el balance se actualizó
    const newBalance = AccountService.getBalance(accountId);
    expect(newBalance).toBe(expectedBalance);
  });
});
```

---

## 🎯 Matchers Disponibles

### Matchers de Vitest

```typescript
// Igualdad
expect(value).toBe(expected)              // Igualdad estricta (===)
expect(value).toEqual(expected)           // Igualdad profunda (objetos/arrays)
expect(value).toStrictEqual(expected)     // Igualdad estricta profunda

// Truthiness
expect(value).toBeTruthy()                // Es truthy
expect(value).toBeFalsy()                 // Es falsy
expect(value).toBeDefined()               // No es undefined
expect(value).toBeUndefined()             // Es undefined
expect(value).toBeNull()                  // Es null

// Números
expect(value).toBeGreaterThan(n)          // Mayor que
expect(value).toBeGreaterThanOrEqual(n)   // Mayor o igual
expect(value).toBeLessThan(n)             // Menor que
expect(value).toBeLessThanOrEqual(n)      // Menor o igual
expect(value).toBeCloseTo(n, precision)   // Cercano a (decimales)

// Strings
expect(string).toContain(substring)       // Contiene substring
expect(string).toMatch(/regex/)           // Coincide con regex
expect(string).toHaveLength(n)            // Longitud específica

// Arrays
expect(array).toContain(item)             // Contiene item
expect(array).toHaveLength(n)             // Longitud específica
expect(array).toContainEqual(obj)         // Contiene objeto igual

// Objetos
expect(obj).toHaveProperty('key')         // Tiene propiedad
expect(obj).toHaveProperty('key', value)  // Propiedad con valor
expect(obj).toMatchObject(partial)        // Coincide parcialmente

// Funciones/Promises
expect(fn).toThrow()                      // Lanza error
expect(fn).toThrow('message')             // Lanza error con mensaje
await expect(promise).resolves.toBe(val)  // Promise resuelve
await expect(promise).rejects.toThrow()   // Promise rechaza

// Testing Library (DOM)
expect(element).toBeInTheDocument()       // Está en el documento
expect(element).toHaveTextContent(text)   // Tiene texto
expect(element).toHaveClass(className)    // Tiene clase CSS
expect(input).toHaveValue(value)          // Input tiene valor
expect(button).toBeDisabled()             // Está deshabilitado
```

---

## 🔄 Testing Manual vs Automatizado

### Testing Manual (UI Visual en App)

**Ubicación:** Configuración → Testing de Schemas (solo admin)

**Pros:**
- ✅ Interfaz visual amigable
- ✅ Ver datos de ejemplo
- ✅ Ejecutar tests individuales
- ✅ Ver errores detallados en tiempo real
- ✅ Ideal para desarrollo rápido

**Contras:**
- ❌ Manual (requiere clicks)
- ❌ No automatizable en CI/CD
- ❌ Solo para Schema Validation

**Uso:**
1. Login como `ingenieriaxigma@gmail.com`
2. Configuración → Testing de Schemas
3. Click "Ejecutar todos los tests" o tests individuales

---

### Testing Automatizado (Vitest)

**Ubicación:** Terminal / CI/CD

**Pros:**
- ✅ Automatizable (CI/CD)
- ✅ Ejecuta rápido (paralelo)
- ✅ Reporte de cobertura
- ✅ Todos los tipos de tests (unit, component, integration, e2e)
- ✅ Modo watch para desarrollo

**Contras:**
- ❌ Requiere configuración inicial
- ❌ Menos visual

**Uso:**
```bash
npm run test:watch  # Desarrollo
npm run test        # Pre-commit
```

---

## 📊 Cobertura Actual

### Tests Implementados (Semana 1 - Fase 1B)

| Tipo | Archivos | Tests | Cobertura |
|------|----------|-------|-----------|
| **Schema Validation** | 1 | 35 tests | 100% ✅ |
| **Unit Tests (Utils)** | 2 | 62 tests | 85% ✅ |
| **Component Tests** | 0 | 0 tests | 0% 🔄 |
| **Integration Tests** | 0 | 0 tests | 0% 🔄 |
| **E2E Tests** | 0 | 0 tests | 0% 🔄 |
| **TOTAL** | **3** | **97 tests** | **40%** |

### Tests Manuales (UI)

| Tipo | Tests | Estado |
|------|-------|--------|
| Schema Validation | 19 casos | ✅ Activo |
| Unit Tests | 25 tests | ✅ Activo |
| **TOTAL** | **44 tests** | ✅ |

---

## 🗓️ Roadmap

### ✅ Semana 1 - Base de Testing (COMPLETADA)

**Días 1-2: Mejorar UI + Agregar Tests**
- ✅ Auditoría de tests existentes
- ✅ Verificación de compatibilidad (95% OK)
- ✅ Agregar 5 test cases nuevos (SpeedDial, Navigation, Auth, Sync, Themes)

**Días 3-4: Setup Vitest + Migrar Tests**
- ✅ Configurar Vitest + Testing Library
- ✅ Crear `/tests/setup.ts` con mocks globales
- ✅ Migrar 97 tests a Vitest:
  - ✅ 35 tests de Schema Validation
  - ✅ 34 tests de Calculations
  - ✅ 28 tests de Formatting

**Días 5-7: Documentación + Scripts**
- ✅ Documentar comandos en README
- ✅ Agregar scripts npm
- 🔄 GitHub Actions workflow (pendiente)

---

### 🔄 Semana 2 - Component & Feature Tests (EN PROGRESO)

**Objetivos:**
- Component tests para SpeedDial, Navigation, ThemeToggle
- Feature tests para Transaction/Budget Services
- Aumentar cobertura a 60%

**Tasks:**
- [ ] Component tests (20 tests)
- [ ] Feature tests (15 tests)
- [ ] Mock de Supabase
- [ ] Tests de hooks personalizados

---

### 🔄 Semana 3 - Integration Tests

**Objetivos:**
- Tests de flujos completos
- Tests de sincronización con Supabase
- Aumentar cobertura a 70%

**Tasks:**
- [ ] Flujo de crear transacción → actualizar balance → sincronizar
- [ ] Flujo de presupuesto → alertas → notificaciones
- [ ] Flujo de multi-usuario → auth → permisos

---

### 🔄 Semana 4 - E2E + CI/CD

**Objetivos:**
- E2E tests con Playwright
- CI/CD completo
- Cobertura objetivo: 79%

**Tasks:**
- [ ] E2E tests de flujos críticos
- [ ] GitHub Actions workflow
- [ ] Pre-commit hooks
- [ ] Reporte de cobertura en PR

---

## 🐛 Troubleshooting

### Error: "Cannot find module '@/utils/...'"

**Solución:** Verifica los path aliases en `vitest.config.ts`

```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './'),
  },
}
```

---

### Error: "ReferenceError: window is not defined"

**Solución:** Asegúrate de usar `environment: 'jsdom'` en `vitest.config.ts`

---

### Tests lentos

**Solución:**
1. Aumentar `testTimeout` en `vitest.config.ts`
2. Usar `--no-coverage` si no necesitas cobertura
3. Ejecutar tests en paralelo (default en Vitest)

---

### Mock no funciona

**Solución:** Verifica que estés usando `vi.fn()` de Vitest, no `jest.fn()`

```typescript
import { vi } from 'vitest';

const mockFn = vi.fn();
```

---

## 📚 Recursos

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Zod Documentation](https://zod.dev/)
- [Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## 🤝 Contribuir

### Agregar Nuevos Tests

1. Crea archivo en directorio correspondiente (`tests/utils/`, `tests/components/`, etc.)
2. Nombrar con patrón `*.test.ts` o `*.test.tsx`
3. Ejecutar `npm run test:watch` durante desarrollo
4. Verificar cobertura con `npm run test:coverage`
5. Commit cuando todos los tests pasen

### Mantener Tests Actualizados

- ⚠️ Cuando cambies código, actualiza tests relacionados
- ⚠️ Agregar tests para nuevas features
- ⚠️ No bajar umbral de cobertura (actualmente 60%)

---

**Última actualización:** 30 de noviembre, 2025
**Próxima revisión:** Semana 2 - Component Tests
