# ⚡ INICIO RÁPIDO - Tests de Integridad

**Para:** Super Usuario que quiere correr tests YA  
**Tiempo:** 2 minutos  

---

## 🚀 OPCIÓN 1: Forma Fácil (Recomendado)

### Linux / Mac
```bash
chmod +x scripts/run-integrity-tests.sh
./scripts/run-integrity-tests.sh
```

### Windows
```bash
scripts\run-integrity-tests.bat
```

**Eso es todo.** El script hace todo automáticamente.

---

## 🚀 OPCIÓN 2: Forma Manual

### 1. Instalar dependencias (si no las tienes)
```bash
npm install -D vitest
```

### 2. Configurar Supabase (primera vez solamente)

Crear archivo `.env.test`:
```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### 3. Correr tests
```bash
npx vitest tests/integration/data-integrity
```

---

## ✅ RESULTADO ESPERADO

```
✓ tests/integration/data-integrity/budget-persistence.test.tsx (6)
✓ tests/integration/data-integrity/transaction-persistence.test.tsx (6)
✓ tests/integration/data-integrity/account-balance.test.tsx (8)

Test Files  3 passed (3)
     Tests  20 passed (20)
  Duration  15.42s

✅ ¡TODOS LOS TESTS PASARON!
```

**Interpretación:** ✅ Todo funciona, puedes hacer deploy

---

## ❌ SI LOS TESTS FALLAN

```
Test Files  1 failed (1)
     Tests  18 passed | 2 failed (20)
```

**Interpretación:** ❌ HAY BUGS, NO hacer deploy

**Qué hacer:**
1. Ver qué test falló en el output
2. Leer el error (dice exactamente qué esperaba y qué recibió)
3. Corregir el bug
4. Volver a correr los tests

---

## 🎯 COMANDOS ÚTILES

### Ver solo presupuestos
```bash
npx vitest budget-persistence
```

### Ver solo transacciones
```bash
npx vitest transaction-persistence
```

### Ver solo balances
```bash
npx vitest account-balance
```

### Modo watch (auto-rerun)
```bash
npx vitest tests/integration/data-integrity --watch
```

---

## 📚 MÁS INFORMACIÓN

- **Guía completa:** `/GUIA_SUPER_USUARIO_TESTS.md`
- **Configurar CI/CD:** `/CONFIGURAR_CI_CD.md`
- **Troubleshooting:** `/GUIA_SUPER_USUARIO_TESTS.md#troubleshooting`

---

## 🎉 ¡LISTO!

Eso es todo. Ahora puedes verificar que tu app funciona correctamente con un solo comando.
