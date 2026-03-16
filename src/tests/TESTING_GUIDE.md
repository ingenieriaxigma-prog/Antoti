# 🧪 Guía de Testing - Oti Finance App

## 📋 Índice

1. [Introducción](#introducción)
2. [Arquitectura de Testing](#arquitectura-de-testing)
3. [Schema Tests](#schema-tests)
4. [E2E Tests](#e2e-tests)
5. [Acceso al Testing Dashboard](#acceso-al-testing-dashboard)
6. [Plan de Testing (4 Semanas)](#plan-de-testing-4-semanas)
7. [Mejores Prácticas](#mejores-prácticas)

---

## 🎯 Introducción

Oti cuenta con un **sistema completo de testing visual** que permite ejecutar y validar:
- ✅ **34+ Schema Tests**: Validación de schemas Zod
- ✅ **18+ E2E Tests**: Flujos completos de usuario

**Objetivo:** Alcanzar **79% de cobertura** en 4 semanas siguiendo el Enfoque Híbrido (Opción C).

---

## 🏗️ Arquitectura de Testing

```
/tests/
├── test-cases.ts          # Schema test cases (Zod validation)
├── e2e-test-cases.ts      # E2E test scenarios
└── TESTING_GUIDE.md       # Esta guía

/components/testing/
├── TestingDashboard.tsx   # Dashboard principal con tabs
├── SchemaTestsTab.tsx     # Tab de Schema Tests
├── E2ETestDashboard.tsx   # Dashboard de E2E Tests
├── E2ETestRunner.tsx      # Ejecutor de tests E2E
├── TestRunner.tsx         # Ejecutor de schema tests
├── TestResults.tsx        # Visualización de resultados
└── SchemaValidator.tsx    # Validador de schemas
```

---

## 🧬 Schema Tests

### ¿Qué Validan?

Los Schema Tests validan que los **schemas Zod** funcionan correctamente:
- ✅ Aceptan datos válidos
- ✅ Rechazan datos inválidos
- ✅ Muestran errores descriptivos

### Categorías (34 tests)

| Categoría      | Tests | Descripción                          |
|----------------|-------|--------------------------------------|
| transactions   | 3     | Validación de transacciones          |
| budgets        | 4     | Validación de presupuestos           |
| accounts       | 3     | Validación de cuentas                |
| categories     | 3     | Validación de categorías             |
| filters        | 3     | Validación de filtros                |
| ui             | 11    | Validación de componentes UI         |
| navigation     | 5     | Validación de navegación             |
| auth           | 1     | Validación de autenticación          |
| sync           | 1     | Validación de sincronización         |

### Ejemplo de Schema Test

```typescript
'TransactionCreate - Ingreso': {
  category: 'transactions',
  description: 'Creación de transacción de ingreso',
  schema: TransactionCreateSchema,
  validData: {
    type: 'income',
    amount: 5000,
    category: '550e8400-e29b-41d4-a716-446655440000',
    account: '550e8400-e29b-41d4-a716-446655440001',
    date: new Date().toISOString(),
    note: 'Salario mensual'
  },
  invalidData: {
    type: 'income',
    amount: -5000, // ❌ Monto negativo (inválido)
    account: 'not-a-uuid', // ❌ UUID inválido
    date: 'not-a-date', // ❌ Fecha inválida
    category: null // ❌ Categoría requerida
  }
}
```

### Resultados

Cada schema test valida:
1. **Datos Válidos**: El schema acepta los datos correctos
2. **Datos Inválidos**: El schema rechaza los datos incorrectos
3. **Errores**: Muestra mensajes de error descriptivos

**Estado:** ✅ **100% Pass Rate** (34/34 tests pasando)

---

## ⚡ E2E Tests

### ¿Qué Validan?

Los E2E Tests validan **flujos completos de usuario** desde el inicio hasta el resultado final:
- 🎯 Interacciones UI (clicks, inputs, navigation)
- 🔄 Llamadas al backend
- 📊 Cambios de estado
- 💾 Persistencia de datos

### Categorías (18 tests)

| Categoría     | Tests | Descripción                          | Prioridad |
|---------------|-------|--------------------------------------|-----------|
| auth          | 2     | Login/Signup flow                    | High      |
| transactions  | 5     | CRUD de transacciones                | High      |
| budgets       | 2     | Creación y alertas de presupuestos   | High      |
| accounts      | 1     | Creación de cuentas                  | High      |
| categories    | 1     | Creación de categorías               | Medium    |
| navigation    | 1     | Navegación completa de la app        | Medium    |
| filters       | 1     | Aplicación de filtros                | Medium    |
| sync          | 1     | Sincronización con Supabase          | High      |
| voice         | 1     | Comando de voz a transacción         | Medium    |
| chat          | 1     | Conversación con Oti                 | Medium    |

### Estructura de un E2E Test

```typescript
'transaction-create-income-flow': {
  id: 'transaction-create-income-flow',
  category: 'transactions',
  title: 'Crear Transacción de Ingreso',
  description: 'Flujo completo de creación de ingreso desde dashboard',
  priority: 'high',
  timeout: 8000,
  steps: [
    {
      action: 'open_transaction_form',
      description: 'Abrir formulario desde SpeedDial o botón',
      expectedResult: 'Formulario de transacción visible'
    },
    {
      action: 'select_income_type',
      description: 'Seleccionar tipo "Ingreso"',
      expectedResult: 'Tipo ingreso seleccionado'
    },
    {
      action: 'fill_amount',
      description: 'Ingresar monto (ej: 5000)',
      expectedResult: 'Monto válido ingresado'
    },
    {
      action: 'submit_transaction',
      description: 'Guardar transacción',
      expectedResult: 'Transacción creada exitosamente',
      critical: true // Si falla, abortar el test
    },
    {
      action: 'verify_account_balance',
      description: 'Verificar actualización de saldo',
      expectedResult: 'Saldo de cuenta incrementado'
    }
  ]
}
```

### Pasos Críticos

Los pasos marcados como `critical: true` son cruciales:
- Si fallan, el test se **aborta** inmediatamente
- Los pasos restantes se marcan como **skipped**
- Útil para prevenir cascada de errores

### Estados de Pasos

| Estado    | Descripción                               | Icono |
|-----------|-------------------------------------------|-------|
| pending   | Paso no ejecutado aún                     | ⏱️     |
| running   | Paso ejecutándose actualmente             | 🔄     |
| passed    | Paso completado exitosamente              | ✅     |
| failed    | Paso falló                                | ❌     |
| skipped   | Paso omitido (por fallo crítico previo)   | ⏭️     |

---

## 🖥️ Acceso al Testing Dashboard

### Requisitos

- Usuario: **ingenieriaxigma@gmail.com** (admin)
- Acceso desde: **Settings → Admin Tools → Testing Dashboard**

### Navegación

```
Dashboard
  └── Settings (⚙️)
        └── Admin Section (solo visible para admin)
              └── Testing Dashboard (🧪)
                    ├── Tab: Schema Tests (34 tests)
                    └── Tab: E2E Tests (18 tests)
```

### Funciones Principales

#### Schema Tests Tab

- ✅ **Ejecutar Todos**: Corre los 34 schema tests
- ✅ **Ejecutar Categoría**: Corre tests de categoría filtrada
- ✅ **Ejecutar Individual**: Corre un test específico
- ✅ **Ver Detalles**: Expande resultados con datos válidos/inválidos
- ✅ **Exportar**: Descarga JSON con resultados completos
- ✅ **Reset**: Limpia todos los resultados

#### E2E Tests Tab

- ⚡ **Ejecutar Todos**: Corre los 18 E2E tests
- ⚡ **Ejecutar Filtrados**: Corre tests por categoría/prioridad
- ⚡ **Ejecutar Individual**: Corre un test específico
- ⚡ **Ver Pasos**: Expande detalles de cada paso
- ⚡ **Progress Bar**: Visualiza progreso en tiempo real
- ⚡ **Exportar**: Descarga JSON con resultados completos
- ⚡ **Reset**: Limpia todos los resultados

---

## 📅 Plan de Testing (4 Semanas)

### ✅ Semana 1: Schema Tests (COMPLETADO)

**Objetivo:** Validación de todos los schemas Zod

- ✅ Crear 34+ test cases para schemas
- ✅ Implementar TestRunner visual
- ✅ Dashboard de Schema Tests
- ✅ Exportación de reportes JSON
- ✅ Alcanzar 100% pass rate

**Resultado:** ✅ **34/34 tests pasando (100%)**

---

### ✅ Semana 2: E2E Tests (COMPLETADO)

**Objetivo:** Tests de flujos completos de usuario

- ✅ Crear 18+ test cases E2E
- ✅ Implementar E2ETestRunner
- ✅ Dashboard de E2E Tests con visualización de pasos
- ✅ Sistema de pasos críticos
- ✅ Filtrado por categoría y prioridad
- ✅ Exportación de reportes JSON

**Cobertura E2E:**
- ✅ Auth flows (signup, login)
- ✅ Transaction flows (create, edit, delete, transfer)
- ✅ Budget flows (create, alerts)
- ✅ Account & Category flows
- ✅ Navigation flow
- ✅ Filter flow
- ✅ Sync flow
- ✅ Voice flow
- ✅ Chat flow

---

### 🔜 Semana 3: Integration Tests

**Objetivo:** Tests de integración entre componentes

- [ ] Tests de integración con Supabase
- [ ] Tests de sincronización offline/online
- [ ] Tests de hooks personalizados
- [ ] Tests de context providers
- [ ] Tests de servicios y utilidades

**Estimado:** 25+ integration tests

---

### 🔜 Semana 4: Automatización y CI/CD

**Objetivo:** Automatizar testing y setup CI/CD

- [ ] Configurar GitHub Actions
- [ ] Pipeline de testing automático
- [ ] Tests pre-commit con Husky
- [ ] Coverage reports automáticos
- [ ] Notificaciones de resultados
- [ ] Badge de cobertura en README

**Meta Final:** ✅ **79% de cobertura total**

---

## ✨ Mejores Prácticas

### Para Schema Tests

1. **Datos Válidos Realistas**: Usa datos que realmente se usarían en producción
2. **Datos Inválidos Variados**: Prueba diferentes tipos de invalidez
3. **Mensajes de Error Claros**: Los schemas deben dar feedback útil
4. **Cobertura Completa**: Prueba todos los campos y validaciones

### Para E2E Tests

1. **Flujos Realistas**: Simula lo que un usuario real haría
2. **Pasos Atómicos**: Cada paso debe hacer una cosa específica
3. **Pasos Críticos**: Marca pasos esenciales como `critical: true`
4. **Precondiciones Claras**: Documenta qué debe existir antes del test
5. **Cleanup**: Siempre limpia datos de test después de ejecutar

### Para Debugging

1. **Logs Detallados**: Los tests deben loggear cada paso
2. **Screenshots**: Captura estado de UI en fallos (futuro)
3. **Reproducibilidad**: Tests deben ser determinísticos
4. **Tiempos de Espera**: Usa timeouts apropiados para async

### Para Mantenimiento

1. **Tests Independientes**: Cada test debe poder correr solo
2. **Sin Estado Compartido**: No dependas de orden de ejecución
3. **Documentación**: Describe qué valida cada test
4. **Refactoring**: Mantén tests DRY con helpers

---

## 📊 Métricas Actuales

### Schema Tests
```
Total Tests: 34
Pass Rate: 100.0%
Average Duration: ~100ms/test
Total Duration: ~3.4 segundos
Coverage: 100% de schemas críticos
```

### E2E Tests
```
Total Tests: 18
Total Steps: 114
Average Steps/Test: 6.3
Categories: 10
High Priority: 7 tests
Medium Priority: 9 tests
Low Priority: 1 test
```

### Cobertura Proyectada

| Semana | Tipo           | Tests | Cobertura |
|--------|----------------|-------|-----------|
| 1      | Schema         | 34    | ~30%      |
| 2      | E2E            | 18    | ~50%      |
| 3      | Integration    | 25    | ~70%      |
| 4      | Automatización | -     | **79%**   |

---

## 🚀 Próximos Pasos

1. ✅ **Ejecutar Schema Tests** - Verificar 100% pass rate
2. ✅ **Ejecutar E2E Tests** - Validar flujos de usuario
3. ⏭️ **Semana 3**: Implementar Integration Tests
4. ⏭️ **Semana 4**: Setup CI/CD y automatización
5. ⏭️ **Producción**: Deploy con confianza 🎉

---

## 💡 Tips de Uso

### Para Desarrolladores

- Ejecuta schema tests después de cambiar schemas
- Ejecuta E2E tests relevantes antes de hacer PR
- Exporta reportes para documentar bugs
- Usa filtros para ejecutar solo tests relacionados

### Para QA

- Ejecuta todos los tests semanalmente
- Documenta fallos con reportes exportados
- Verifica nuevos features con E2E tests
- Mantén actualizada la documentación de tests

### Para Product Managers

- Usa pass rate como métrica de calidad
- Reportes JSON documentan funcionalidad
- E2E tests definen comportamiento esperado
- Dashboard muestra estado de calidad en tiempo real

---

## 📚 Recursos

- [Zod Documentation](https://zod.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [E2E Testing Guide](https://martinfowler.com/articles/practical-test-pyramid.html)

---

**Creado por:** Oti Finance App Team  
**Última actualización:** Semana 2 - E2E Tests Completados  
**Versión:** 2.0
