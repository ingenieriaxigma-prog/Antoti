# 🔧 Developer Guide - Oti

**Guía completa para desarrolladores que quieren contribuir o extender Oti**

---

## 📚 Índice

1. [Arquitectura del Proyecto](#arquitectura-del-proyecto)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Setup Local](#setup-local)
4. [Estructura de Carpetas](#estructura-de-carpetas)
5. [Feature-First Architecture](#feature-first-architecture)
6. [Database Schema](#database-schema)
7. [API Documentation](#api-documentation)
8. [Testing](#testing)
9. [Contributing](#contributing)
10. [Deployment](#deployment)
11. [Troubleshooting](#troubleshooting)

---

## 🏗️ Arquitectura del Proyecto

### **Arquitectura General**

```
┌─────────────────────────────────────────────────┐
│                   Frontend                      │
│              React + TypeScript                 │
│                  Tailwind CSS                   │
└──────────────────┬──────────────────────────────┘
                   │
                   ↓ (API Calls)
┌─────────────────────────────────────────────────┐
│                   Backend                       │
│          Supabase (PostgreSQL)                  │
│   Auth | Database | Storage | Real-time        │
└─────────────────────────────────────────────────┘
```

### **Flujo de Datos**

```
User Action
    ↓
React Component
    ↓
Custom Hook (useTransactions, useBudgets, etc.)
    ↓
Supabase Client
    ↓
PostgreSQL Database
    ↓
Real-time Subscription (optional)
    ↓
UI Update
```

---

## 🛠️ Stack Tecnológico

### **Frontend**

- **Framework**: React 18
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **Routing**: React Router (client-side)
- **State Management**: React Context API + Hooks
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Charts**: Recharts
- **Build Tool**: Vite

### **Backend**

- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Real-time**: Supabase Real-time subscriptions

### **AI/ML**

- **Chat Assistant**: OpenAI GPT-4o
- **Voice Recognition**: Web Speech API
- **OCR**: GPT-4 Vision (extractos bancarios)

### **Testing**

- **Custom Testing Dashboard**: Schema + E2E + Integration
- **Type Checking**: TypeScript strict mode
- **Validation**: Zod schemas

### **Deployment**

- **Hosting**: Vercel / Netlify (recomendado)
- **Database**: Supabase Cloud
- **CI/CD**: GitHub Actions (planned)

---

## 🚀 Setup Local

### **Prerequisitos**

```bash
Node.js >= 18.x
npm >= 9.x
Git
```

### **1. Clonar el repositorio**

```bash
git clone https://github.com/tu-usuario/oti.git
cd oti
```

### **2. Instalar dependencias**

```bash
npm install
```

### **3. Configurar variables de entorno**

Crea un archivo `.env` en la raíz:

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI (para chat assistant)
VITE_OPENAI_API_KEY=your_openai_api_key
```

**Obtener credenciales de Supabase:**

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ve a Settings → API
3. Copia `URL` y `anon/public key`

### **4. Setup de Database**

Ejecuta las migraciones en Supabase:

```sql
-- Copia y pega el contenido de /supabase/migrations/
-- en el SQL Editor de Supabase
```

O usa el CLI:

```bash
npx supabase db push
```

### **5. Ejecutar en desarrollo**

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173)

---

## 📁 Estructura de Carpetas

```
oti/
├── src/
│   ├── App.tsx                    # Componente principal
│   ├── main.tsx                   # Entry point
│   │
│   ├── features/                  # Feature-First Architecture
│   │   ├── auth/                  # Autenticación
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── types/
│   │   │   └── utils/
│   │   │
│   │   ├── transactions/          # Gestión de transacciones
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── types/
│   │   │   └── utils/
│   │   │
│   │   ├── budgets/               # Presupuestos
│   │   ├── accounts/              # Cuentas
│   │   ├── categories/            # Categorías
│   │   ├── statistics/            # Estadísticas
│   │   ├── voice/                 # Reconocimiento de voz
│   │   └── chat/                  # Chat con Oti
│   │
│   ├── components/                # Componentes compartidos
│   │   ├── ui/                    # Componentes UI básicos
│   │   ├── layout/                # Layout components
│   │   └── testing/               # Testing dashboard
│   │
│   ├── hooks/                     # Hooks globales
│   ├── utils/                     # Utilidades
│   ├── types/                     # TypeScript types globales
│   ├── styles/                    # CSS global
│   └── assets/                    # Imágenes, logos, etc.
│
├── tests/                         # Test suites
│   ├── schema-test-cases.ts
│   ├── e2e-test-cases.ts
│   ├── integration-test-cases.ts
│   └── *.md                       # Documentación de tests
│
├── docs/                          # Documentación
│   ├── USER_GUIDE.md
│   ├── DEVELOPER_GUIDE.md
│   └── API.md
│
├── supabase/                      # Supabase config
│   └── migrations/                # Database migrations
│
├── public/                        # Assets públicos
├── .env                           # Variables de entorno
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

---

## 🎯 Feature-First Architecture

### **Principio**

Organizamos el código **por features** en lugar de por tipos de archivos.

❌ **NO (tipo-first):**
```
/components/TransactionList.tsx
/components/TransactionForm.tsx
/hooks/useTransactions.tsx
/types/transaction.ts
```

✅ **SÍ (feature-first):**
```
/features/transactions/
  ├── components/
  │   ├── TransactionList.tsx
  │   └── TransactionForm.tsx
  ├── hooks/
  │   └── useTransactions.tsx
  └── types/
      └── transaction.ts
```

### **Ventajas**

1. **Co-location**: Todo relacionado a una feature está junto
2. **Encapsulación**: Fácil de mover o eliminar features
3. **Escalabilidad**: Agregar features no afecta otras
4. **Claridad**: Estructura refleja el dominio del negocio

### **Estructura de una Feature**

```
/features/transactions/
├── components/           # Componentes React de la feature
│   ├── TransactionList.tsx
│   ├── TransactionForm.tsx
│   ├── TransactionCard.tsx
│   └── TransactionFilters.tsx
│
├── hooks/                # Custom hooks
│   ├── useTransactions.tsx
│   ├── useTransactionForm.tsx
│   └── useTransactionFilters.tsx
│
├── types/                # TypeScript types
│   └── transaction.ts
│
├── utils/                # Utilidades específicas
│   ├── formatters.ts
│   ├── validators.ts
│   └── calculators.ts
│
├── constants.ts          # Constantes
└── index.ts              # Public API de la feature
```

### **Public API Pattern**

Cada feature exporta su API pública en `index.ts`:

```typescript
// /features/transactions/index.ts

// Components
export { TransactionList } from './components/TransactionList';
export { TransactionForm } from './components/TransactionForm';

// Hooks
export { useTransactions } from './hooks/useTransactions';

// Types
export type { Transaction, TransactionType } from './types/transaction';

// Utils (si son necesarios externamente)
export { formatAmount } from './utils/formatters';
```

**Uso desde otra feature:**

```typescript
import { 
  TransactionList, 
  useTransactions, 
  type Transaction 
} from '@/features/transactions';
```

---

## 💾 Database Schema

### **Tablas Principales**

#### **1. users**

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **2. accounts**

```sql
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'bank', 'cash', 'credit_card', 'wallet'
  balance DECIMAL(12,2) DEFAULT 0,
  color TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **3. categories**

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'income' or 'expense'
  icon TEXT,
  color TEXT,
  parent_id UUID REFERENCES categories(id), -- Para subcategorías
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### **4. transactions**

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id),
  category_id UUID REFERENCES categories(id),
  type TEXT NOT NULL, -- 'income', 'expense', 'transfer'
  amount DECIMAL(12,2) NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **5. budgets**

```sql
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id),
  amount DECIMAL(12,2) NOT NULL,
  period TEXT DEFAULT 'monthly', -- 'weekly', 'monthly', 'yearly'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  alert_percentage INT DEFAULT 80,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **Row Level Security (RLS)**

Todas las tablas tienen RLS habilitado:

```sql
-- Ejemplo para transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);
```

---

## 🔌 API Documentation

### **Supabase Client Setup**

```typescript
// /utils/supabase/client.ts

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);
```

### **Operaciones CRUD**

#### **Crear Transacción**

```typescript
const { data, error } = await supabase
  .from('transactions')
  .insert({
    user_id: userId,
    account_id: accountId,
    category_id: categoryId,
    type: 'expense',
    amount: 1500,
    date: '2025-11-30',
    notes: 'Supermercado'
  })
  .select()
  .single();
```

#### **Leer Transacciones**

```typescript
const { data, error } = await supabase
  .from('transactions')
  .select(`
    *,
    account:accounts(id, name, type),
    category:categories(id, name, icon)
  `)
  .eq('user_id', userId)
  .order('date', { ascending: false })
  .limit(50);
```

#### **Actualizar Transacción**

```typescript
const { data, error } = await supabase
  .from('transactions')
  .update({ amount: 2000, notes: 'Actualizado' })
  .eq('id', transactionId)
  .select()
  .single();
```

#### **Eliminar Transacción**

```typescript
const { error } = await supabase
  .from('transactions')
  .delete()
  .eq('id', transactionId);
```

### **Real-time Subscriptions**

```typescript
const channel = supabase
  .channel('transactions_changes')
  .on(
    'postgres_changes',
    {
      event: '*', // 'INSERT', 'UPDATE', 'DELETE'
      schema: 'public',
      table: 'transactions',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      console.log('Change received!', payload);
      // Actualizar UI
    }
  )
  .subscribe();

// Cleanup
return () => {
  supabase.removeChannel(channel);
};
```

---

## 🧪 Testing

### **Sistema de Testing**

Oti incluye un **Testing Dashboard completo** con 4 tipos de tests:

#### **1. Schema Tests (34 tests)**

Validan schemas de Zod:

```typescript
// Ejemplo de test case
export const SCHEMA_TEST_CASES = {
  'transaction-valid': {
    id: 'transaction-valid',
    category: 'schemas',
    name: 'Transaction Schema - Valid Case',
    description: 'Acepta transacción válida',
    schema: TransactionSchema,
    validCases: [
      {
        type: 'expense',
        amount: 1500,
        categoryId: 'cat-1',
        accountId: 'acc-1',
        date: '2025-11-30'
      }
    ],
    invalidCases: []
  }
};
```

#### **2. E2E Tests (18 tests)**

Validan flujos completos:

```typescript
export const E2E_TEST_CASES = {
  'create-transaction-flow': {
    id: 'create-transaction-flow',
    category: 'transactions',
    title: 'Create Transaction Flow',
    steps: [
      {
        id: 'step-1',
        description: 'Click en botón +',
        action: 'click',
        expectedResult: 'Modal abierto',
        isCritical: true
      },
      // ... más steps
    ]
  }
};
```

#### **3. Integration Tests (25 tests)**

Validan hooks, contexts, services:

```typescript
export const INTEGRATION_TEST_CASES = {
  'hook-use-transactions': {
    id: 'hook-use-transactions',
    type: 'hooks',
    title: 'useTransactions Hook',
    execute: async () => {
      // Lógica de test
    },
    assertions: [
      {
        description: 'Hook retorna array',
        validate: (result) => Array.isArray(result.transactions)
      }
    ]
  }
};
```

#### **4. Performance & Coverage**

Dashboard con métricas, coverage report, test history.

### **Ejecutar Tests**

**Via UI:**
```
Settings → Admin Tools → Testing Dashboard
```

**Via Scripts (future):**
```bash
npm run test:schema
npm run test:e2e
npm run test:integration
npm run test:all
```

### **Coverage Target**

- **Meta**: 79%
- **Actual**: 93.5% ✅
- **Estado**: SUPERADO

---

## 🤝 Contributing

### **Git Workflow**

```bash
# 1. Fork el repositorio

# 2. Clonar tu fork
git clone https://github.com/tu-usuario/oti.git

# 3. Crear branch para tu feature
git checkout -b feature/nueva-feature

# 4. Hacer cambios y commits
git add .
git commit -m "feat: descripción de la feature"

# 5. Push a tu fork
git push origin feature/nueva-feature

# 6. Crear Pull Request en GitHub
```

### **Commit Convention**

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: Nueva feature
fix: Bug fix
docs: Documentación
style: Cambios de estilo (formato, etc.)
refactor: Refactoring de código
test: Agregar o modificar tests
chore: Cambios en build, deps, etc.
```

**Ejemplos:**
```bash
git commit -m "feat: agregar exportación de transacciones a CSV"
git commit -m "fix: corregir cálculo de balance en Dashboard"
git commit -m "docs: actualizar guía de usuario"
```

### **Code Review Checklist**

Antes de crear un PR, verifica:

- [ ] Tests pasan (run Testing Dashboard)
- [ ] No hay errores de TypeScript (`npm run type-check`)
- [ ] Código está formateado (`npm run format`)
- [ ] Commit messages siguen convención
- [ ] PR tiene descripción clara
- [ ] Screenshots si hay cambios visuales

---

## 🚀 Deployment

### **Vercel (Recomendado)**

1. **Conectar repositorio:**
   - Ir a [vercel.com](https://vercel.com)
   - Import Git Repository
   - Seleccionar tu repo

2. **Configurar variables de entorno:**
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   VITE_OPENAI_API_KEY=...
   ```

3. **Deploy:**
   - Vercel auto-deploya en cada push a `main`

### **Netlify**

Similar a Vercel:

1. **Build Command:** `npm run build`
2. **Publish Directory:** `dist`
3. **Environment Variables:** Same as Vercel

### **Manual Build**

```bash
# Build para producción
npm run build

# Resultado en /dist
# Subir a cualquier hosting estático
```

---

## 🔧 Troubleshooting

### **Problema: Supabase connection error**

**Síntoma:** `Error: Invalid Supabase URL or Key`

**Solución:**
1. Verificar `.env` tiene las keys correctas
2. Reiniciar dev server (`npm run dev`)
3. Verificar que Supabase project está activo

---

### **Problema: TypeScript errors**

**Síntoma:** Muchos errores de tipos

**Solución:**
```bash
# Regenerar types de Supabase
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts

# Limpiar caché
rm -rf node_modules .vite
npm install
```

---

### **Problema: Tests fallan**

**Síntoma:** Tests que pasaban ahora fallan

**Solución:**
1. Verificar cambios en schemas
2. Actualizar test cases si cambió API
3. Revisar mocks y fixtures
4. Ver logs en Testing Dashboard

---

### **Problema: Build falla**

**Síntoma:** `npm run build` falla

**Solución:**
```bash
# Verificar tipos
npm run type-check

# Ver errores específicos
npm run build 2>&1 | grep "error"

# Limpiar y rebuild
rm -rf dist node_modules
npm install
npm run build
```

---

## 📞 Soporte para Desarrolladores

- 📧 **Email**: dev@oti.app
- 💬 **Discord**: [discord.gg/oti-dev](https://discord.gg/oti-dev)
- 📚 **Docs**: [docs.oti.app](https://docs.oti.app)
- 🐛 **Issues**: [github.com/oti/issues](https://github.com/oti/issues)

---

## 📚 Recursos Adicionales

### **Documentación Relacionada**

- [User Guide](/docs/USER_GUIDE.md) - Guía para usuarios
- [API Reference](/docs/API.md) - Referencia completa de API
- [Testing Guide](/tests/SISTEMA_TESTING_COMPLETO.md) - Sistema de testing

### **External Resources**

- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

## 🎯 Roadmap

### **Próximas Features**

- [ ] CI/CD con GitHub Actions
- [ ] PWA con Service Workers
- [ ] Notificaciones Push
- [ ] Export a PDF
- [ ] Mobile app nativa (Capacitor)
- [ ] Colaboración multi-usuario
- [ ] Widgets y shortcuts
- [ ] Visual regression testing

---

**¡Happy Coding!** 🚀💻

---

**Versión:** 1.0.0  
**Última actualización:** Noviembre 30, 2025
