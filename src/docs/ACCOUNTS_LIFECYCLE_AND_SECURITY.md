# 🏦 CICLO DE VIDA DE CUENTAS - Diseño Seguro y Definitivo

**Fecha:** 25 de noviembre de 2025  
**Versión:** 1.0 - Rediseño completo  
**Principio:** Single Source of Truth = Transacciones en PostgreSQL

---

## 🎯 PRINCIPIOS FUNDAMENTALES

### 1. ✅ LA ÚNICA FUENTE DE VERDAD: Las Transacciones

**REGLA DE ORO:**
```
Balance de una cuenta = SUM(transacciones de esa cuenta)
```

- ✅ Los balances NUNCA se guardan como valor persistente
- ✅ Los balances SIEMPRE se calculan desde las transacciones
- ✅ La tabla `accounts_727b50c3.balance` es solo CACHE, NO fuente de verdad

### 2. ✅ Cuentas por Defecto: Solo Una Vez

**REGLA:**
- Se crean SOLO cuando el usuario se registra por primera vez
- Se crean con balance = 0
- NUNCA se vuelven a crear automáticamente
- Si el usuario las elimina, NO se recrean

### 3. ✅ Cuenta por Defecto para Transacciones: Efectivo

**REGLA:**
- Si el usuario NO selecciona cuenta → Usar "Efectivo" automáticamente
- Garantiza que NINGUNA transacción quede huérfana

---

## 📋 CUENTAS POR DEFECTO (Solo Primera Vez)

```typescript
const DEFAULT_ACCOUNTS = [
  {
    id: 'ac111111-0000-4000-a000-000000000001',
    name: 'Efectivo',
    type: 'cash',
    balance: 0,  // ← Solo al crear, luego se calcula
    icon: 'wallet',
    color: '#10b981'
  },
  {
    id: 'ac111111-0000-4000-a000-000000000002',
    name: 'Bancolombia',
    type: 'bank',
    balance: 0,
    icon: 'building-2',
    color: '#FFDE00'
  },
  {
    id: 'ac111111-0000-4000-a000-000000000003',
    name: 'Falabella',
    type: 'bank',
    balance: 0,
    icon: 'building-2',
    color: '#00A859'
  },
  {
    id: 'ac111111-0000-4000-a000-000000000004',
    name: 'BBVA',
    type: 'bank',
    balance: 0,
    icon: 'building-2',
    color: '#004481'
  },
  {
    id: 'ac111111-0000-4000-a000-000000000005',
    name: 'Nequi',
    type: 'digital',
    balance: 0,
    icon: 'smartphone',
    color: '#FF006B'
  },
  {
    id: 'ac111111-0000-4000-a000-000000000006',
    name: 'DaviPlata',
    type: 'digital',
    balance: 0,
    icon: 'smartphone',
    color: '#EB001B'
  },
  {
    id: 'ac111111-0000-4000-a000-000000000007',
    name: 'Tarjeta de Crédito',
    type: 'card',
    balance: 0,
    icon: 'credit-card',
    color: '#ef4444'
  }
];
```

---

## 🔄 CICLO DE VIDA DE LAS TRANSACCIONES

### Tipo 1️⃣: INGRESO (Income)

**Ejemplo:** Recibo salario de $3,000,000 en Bancolombia

```typescript
{
  id: "tx001",
  type: "income",
  amount: 3000000,
  account: "ac111111-0000-4000-a000-000000000002",  // Bancolombia
  category: "cat-income-salary",
  date: "2025-11-25",
  description: "Salario noviembre"
}
```

**Efecto en Balance:**
```
Bancolombia:
  Balance anterior: 0
  + Ingreso: 3,000,000
  = Balance nuevo: 3,000,000
```

**Cálculo:**
```typescript
if (tx.type === 'income' && tx.account === accountId) {
  balance += tx.amount;
}
```

---

### Tipo 2️⃣: GASTO (Expense)

**Ejemplo:** Compro mercado de $500,000 con Efectivo

```typescript
{
  id: "tx002",
  type: "expense",
  amount: 500000,
  account: "ac111111-0000-4000-a000-000000000001",  // Efectivo
  category: "cat-expense-food",
  date: "2025-11-25",
  description: "Mercado del mes"
}
```

**Efecto en Balance:**
```
Efectivo:
  Balance anterior: 0
  - Gasto: 500,000
  = Balance nuevo: -500,000  ← NEGATIVO (debe)
```

**Cálculo:**
```typescript
if (tx.type === 'expense' && tx.account === accountId) {
  balance -= tx.amount;
}
```

---

### Tipo 3️⃣: TRANSFERENCIA (Transfer)

**Ejemplo:** Transfiero $1,000,000 de Bancolombia a Nequi

```typescript
{
  id: "tx003",
  type: "transfer",
  amount: 1000000,
  account: "ac111111-0000-4000-a000-000000000002",    // Bancolombia (origen)
  toAccount: "ac111111-0000-4000-a000-000000000005",  // Nequi (destino)
  date: "2025-11-25",
  description: "Transferencia a Nequi"
}
```

**Efecto en Balance:**
```
Bancolombia (origen):
  Balance anterior: 3,000,000
  - Transferencia: 1,000,000
  = Balance nuevo: 2,000,000

Nequi (destino):
  Balance anterior: 0
  + Transferencia: 1,000,000
  = Balance nuevo: 1,000,000
```

**Cálculo:**
```typescript
if (tx.type === 'transfer') {
  // Cuenta origen: resta
  if (tx.account === accountId) {
    balance -= tx.amount;
  }
  // Cuenta destino: suma
  if (tx.toAccount === accountId) {
    balance += tx.amount;
  }
}
```

---

## 💡 EJEMPLO COMPLETO: Historia de Usuario

### Día 1: Usuario se registra

```typescript
// 1. Usuario crea cuenta en la app
POST /signup
{
  email: "juan@example.com",
  password: "******"
}

// 2. Sistema crea 7 cuentas por defecto con balance = 0
INSERT INTO accounts_727b50c3 (id, user_id, name, type, balance)
VALUES 
  ('ac111...001', 'user123', 'Efectivo', 'cash', 0),
  ('ac111...002', 'user123', 'Bancolombia', 'bank', 0),
  ('ac111...003', 'user123', 'Falabella', 'bank', 0),
  ('ac111...004', 'user123', 'BBVA', 'bank', 0),
  ('ac111...005', 'user123', 'Nequi', 'digital', 0),
  ('ac111...006', 'user123', 'DaviPlata', 'digital', 0),
  ('ac111...007', 'user123', 'Tarjeta de Crédito', 'card', 0);

// 3. Usuario ve todas las cuentas en $0
GET /accounts → Todas con balance = 0
```

---

### Día 1: Primera transacción

```typescript
// Usuario recibe salario
POST /transactions
{
  type: "income",
  amount: 3000000,
  account: "ac111...002",  // Bancolombia
  category: "salary",
  date: "2025-11-25"
}

// Backend guarda transacción
INSERT INTO transactions_727b50c3 (id, user_id, type, amount, account_id, ...)
VALUES ('tx001', 'user123', 'income', 3000000, 'ac111...002', ...);

// Usuario recarga página
GET /accounts
// Backend calcula balance:
//   Bancolombia: SUM(transactions WHERE account_id = 'ac111...002') = 3,000,000
//   Efectivo: 0
//   Falabella: 0
//   ...

// Usuario ve:
// ✅ Bancolombia: $3,000,000
// ✅ Efectivo: $0
```

---

### Día 2: Gastos y transferencias

```typescript
// 1. Usuario gasta en mercado (sin seleccionar cuenta)
POST /transactions
{
  type: "expense",
  amount: 500000,
  // account: NO ESPECIFICADA
}

// Backend aplica regla: Si no hay account, usar "Efectivo"
INSERT INTO transactions_727b50c3 (...)
VALUES (..., account_id: 'ac111...001');  // ← Efectivo por defecto

// 2. Usuario transfiere a Nequi
POST /transactions
{
  type: "transfer",
  amount: 1000000,
  account: "ac111...002",    // Bancolombia
  toAccount: "ac111...005"   // Nequi
}

INSERT INTO transactions_727b50c3 (...)
VALUES (..., account_id: 'ac111...002', to_account_id: 'ac111...005');
```

---

### Día 2: Cierra sesión y vuelve a abrir

```typescript
// Usuario cierra sesión
localStorage.clear();

// Usuario abre la app en otro navegador/dispositivo
GET /accounts

// Backend calcula balances desde transacciones:
// 
// Efectivo:
//   tx002 (expense): -500,000
//   = -500,000
//
// Bancolombia:
//   tx001 (income): +3,000,000
//   tx003 (transfer OUT): -1,000,000
//   = 2,000,000
//
// Nequi:
//   tx003 (transfer IN): +1,000,000
//   = 1,000,000
//
// Resto: 0

// Usuario ve:
// ✅ Efectivo: -$500,000 (debe)
// ✅ Bancolombia: $2,000,000
// ✅ Falabella: $0
// ✅ BBVA: $0
// ✅ Nequi: $1,000,000
// ✅ DaviPlata: $0
// ✅ Tarjeta de Crédito: $0
```

**🎯 RESULTADO:** Los balances son SIEMPRE correctos en cualquier dispositivo/sesión.

---

## 🔒 GARANTÍAS DE SEGURIDAD

### 1. ✅ Balances Siempre Correctos

```sql
-- Balance de una cuenta = SUM de sus transacciones
SELECT 
  a.name,
  a.balance AS balance_guardado,
  COALESCE(SUM(
    CASE 
      WHEN t.type = 'income' AND t.account_id = a.id THEN t.amount
      WHEN t.type = 'expense' AND t.account_id = a.id THEN -t.amount
      WHEN t.type = 'transfer' AND t.account_id = a.id THEN -t.amount
      WHEN t.type = 'transfer' AND t.to_account_id = a.id THEN t.amount
      ELSE 0
    END
  ), 0) AS balance_real
FROM accounts_727b50c3 a
LEFT JOIN transactions_727b50c3 t ON a.user_id = t.user_id
WHERE a.user_id = 'USER_ID'
GROUP BY a.id, a.name, a.balance;
```

### 2. ✅ No Hay Transacciones Huérfanas

```typescript
// REGLA: Si account no está definido, usar "Efectivo"
const EFECTIVO_ID = 'ac111111-0000-4000-a000-000000000001';

function processTransaction(tx) {
  if (!tx.account || tx.account === '') {
    tx.account = EFECTIVO_ID;  // ← Siempre asignar Efectivo
  }
  return tx;
}
```

### 3. ✅ Cuentas se Crean Solo Una Vez

```typescript
// Backend: Solo crear si NO existen
async function ensureDefaultAccounts(userId: string) {
  const existing = await db.getAccounts(userId);
  
  if (existing.length === 0) {
    // Primera vez → Crear cuentas por defecto
    await db.createDefaultAccounts(userId);
  }
  
  // Si ya existen → NO hacer nada
}
```

---

## 🚨 PROBLEMAS IDENTIFICADOS EN CÓDIGO ACTUAL

### ❌ Problema 1: Crear cuentas faltantes automáticamente

**Código actual (useDataLoader.ts):**
```typescript
// ❌ MALO: Si faltan cuentas, las crea
const missingDefaultAccounts = defaultAccounts.filter(
  defAccount => !existingAccountIds.has(defAccount.id)
);

if (missingDefaultAccounts.length > 0) {
  await saveAccounts([...accountsData, ...missingDefaultAccounts]);
}
```

**Por qué es malo:**
- Si el usuario eliminó una cuenta, se recrea
- Viola el principio de "crear solo una vez"

**Solución:**
```typescript
// ✅ BUENO: Solo crear si el usuario NO tiene NINGUNA cuenta
if (accountsData.length === 0) {
  // Primera vez → Crear todas las cuentas por defecto
  await saveAccounts(DEFAULT_ACCOUNTS);
} else {
  // Ya tiene cuentas → No tocar nada
  setAccounts(accountsData);
}
```

---

### ❌ Problema 2: POST /accounts calcula balances

**Código actual (index.tsx):**
```typescript
// ❌ MALO: POST recalcula balances al guardar
app.post("/make-server-727b50c3/accounts", async (c) => {
  const allTransactions = await db.getTransactions(userId);
  
  // Calcula balances
  const balanceMap = new Map();
  allTransactions.forEach(tx => {
    // ... cálculo ...
  });
  
  // Guarda con balance calculado
  await db.createAccount({
    ...acc,
    balance: calculatedBalance
  });
});
```

**Por qué es malo:**
- El balance guardado en BD puede quedar desincronizado
- Si hay un bug en el cálculo, persiste el error

**Solución:**
```typescript
// ✅ BUENO: POST NO calcula balances, solo guarda metadata
app.post("/make-server-727b50c3/accounts", async (c) => {
  for (const acc of accounts) {
    await db.createAccount({
      id: acc.id,
      user_id: userId,
      name: acc.name,
      type: acc.type,
      icon: acc.icon,
      color: acc.color,
      // ✅ NO guardar balance - se calcula en GET
    });
  }
});
```

---

### ❌ Problema 3: Frontend calcula balances localmente

**Código actual (useTransactions.ts):**
```typescript
// ❌ MALO: Frontend recalcula balances
const updatedAccounts = accounts.map(acc => {
  if (acc.id === transaction.account) {
    return {
      ...acc,
      balance: acc.balance + transaction.amount  // ← Cálculo local
    };
  }
  return acc;
});
setAccounts(updatedAccounts);
```

**Por qué es malo:**
- Balance en frontend puede desincronizarse con BD
- Si hay un error, se propaga

**Solución:**
```typescript
// ✅ BUENO: Frontend NO calcula balances
const addTransaction = async (transaction) => {
  // 1. Guardar transacción
  await saveTransactions([...transactions, newTransaction]);
  
  // 2. NO tocar accounts - se actualizarán automáticamente
  //    cuando el usuario recargue o cambie de pantalla
  
  // 3. Opcionalmente: Recargar cuentas para mostrar nuevo balance
  const updatedAccounts = await loadAccounts();
  setAccounts(updatedAccounts);
};
```

---

## ✅ SOLUCIÓN DEFINITIVA

### Arquitectura Correcta:

```
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL (Fuente de Verdad)            │
│                                                             │
│  transactions_727b50c3                accounts_727b50c3    │
│  ├─ id                                ├─ id                │
│  ├─ type (income/expense/transfer)   ├─ name              │
│  ├─ amount                            ├─ type              │
│  ├─ account_id        ──────────────→ ├─ (NO balance)     │
│  ├─ to_account_id (si transfer)      ├─ icon              │
│  └─ date                              └─ color             │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Cálculo)                        │
│                                                             │
│  GET /accounts:                                             │
│    1. Leer accounts_727b50c3                               │
│    2. Leer transactions_727b50c3                           │
│    3. CALCULAR balance por cuenta                          │
│    4. Retornar accounts + balance calculado                │
│                                                             │
│  POST /accounts:                                            │
│    1. Guardar metadata (name, type, icon, color)          │
│    2. NO guardar balance                                   │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Display)                       │
│                                                             │
│  - Mostrar balance recibido del backend                    │
│  - NO calcular balances localmente                         │
│  - Al agregar transacción → Recargar accounts             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 CHECKLIST DE IMPLEMENTACIÓN

### Backend:

- [ ] Eliminar columna `balance` de `accounts_727b50c3` (es cache innecesario)
- [ ] `getAccounts()` siempre calcula balances desde transacciones
- [ ] `POST /accounts` NO guarda balance
- [ ] Agregar validación: Si transaction.account no existe → Usar "Efectivo"

### Frontend:

- [ ] `useDataLoader`: Crear cuentas solo si `accounts.length === 0`
- [ ] `useTransactions`: NO calcular balances localmente
- [ ] Al agregar transacción → Llamar `loadAccounts()` para actualizar balances
- [ ] Remover lógica de "cuentas faltantes"

### Testing:

- [ ] Usuario nuevo → Ve 7 cuentas en $0
- [ ] Agregar ingreso → Balance se actualiza
- [ ] Cerrar sesión → Balance persiste
- [ ] Abrir en otro navegador → Balance correcto
- [ ] Eliminar cuenta → NO se recrea automáticamente
