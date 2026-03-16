# 📊 SQL Migrations - Oti Finanzas Personales

**Última actualización:** Diciembre 30, 2025  
**Estado:** ✅ Todas las migraciones completadas

---

## 🎯 RESUMEN EJECUTIVO

Este directorio contiene todas las migraciones SQL para la base de datos de Oti. Todas las migraciones han sido ejecutadas exitosamente y la base de datos está completamente configurada.

### Estado de Migraciones

```
✅ Script 1: Tablas principales (7 tablas)
✅ Script 2: Índices de performance (80+ índices)
✅ Script 3: Row Level Security (68 políticas)
✅ Script 4: Funciones y vistas (5 funciones)
✅ Script 5: Tablas de chat
✅ Script 6: Limpieza de KV store
✅ Script 7: Presupuestos mensuales
✅ Script 8: Fix de constraints
✅ Script 9: Disable auth trigger
```

---

## 📁 ESTRUCTURA DE ARCHIVOS

### Scripts de Migración Principales

```
01-crear-tablas.sql                     # ✅ Tablas principales
02-agregar-indices-VERIFICADO.sql       # ✅ Índices (versión final)
03-implementar-rls-VERIFICADO.sql       # ✅ RLS policies (versión final)
04-funciones-utilidades-VERIFICADO.sql  # ✅ Funciones (versión final)
05-tablas-chat.sql                      # ✅ Tablas de chat Oti
06-limpieza-kv-store.sql                # ✅ Limpieza de KV store
07-budgets-month-year-SAFE.sql          # ✅ Presupuestos mensuales (versión final)
07-tablas-dispositivos-invitaciones-notificaciones.sql  # ✅ Tablas adicionales
08-fix-chat-fk-constraint.sql           # ✅ Fix de constraints
09-disable-auth-trigger.sql             # ✅ Disable trigger
```

### Scripts de Verificación

```
verificacion-tablas.sql                 # Verificar todas las tablas
verificacion-script-7.sql               # Verificar script 7
```

### Scripts de Fix

```
DIAGNOSE_AND_FIX_ALL_CONSTRAINTS.sql    # Diagnóstico de constraints
FIX_COMPLETE_USER_DELETION.sql          # Fix de eliminación de usuarios
FIX_SIMPLE_NO_RAISE.sql                 # Fix sin raise
FIX_ULTRA_SIMPLE.sql                    # Fix ultra simple
```

---

## 🗄️ SCHEMA DE LA BASE DE DATOS

### Tablas Principales

#### **transactions_727b50c3**
Almacena todas las transacciones financieras.

```sql
CREATE TABLE transactions_727b50c3 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  amount DECIMAL(15,2) NOT NULL,
  category_id UUID REFERENCES categories_727b50c3(id) ON DELETE SET NULL,
  subcategory_id UUID REFERENCES subcategories_727b50c3(id) ON DELETE SET NULL,
  account_id UUID REFERENCES accounts_727b50c3(id) ON DELETE CASCADE,
  to_account_id UUID REFERENCES accounts_727b50c3(id) ON DELETE SET NULL,
  date TIMESTAMPTZ NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **accounts_727b50c3**
Cuentas bancarias y de efectivo.

```sql
CREATE TABLE accounts_727b50c3 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('cash', 'bank', 'savings', 'credit')),
  balance DECIMAL(15,2) DEFAULT 0,
  currency TEXT DEFAULT 'COP',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **categories_727b50c3**
Categorías de transacciones.

```sql
CREATE TABLE categories_727b50c3 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  icon TEXT,
  color TEXT,
  is_custom BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **budgets_727b50c3**
Presupuestos mensuales por categoría.

```sql
CREATE TABLE budgets_727b50c3 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories_727b50c3(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2020 AND year <= 2100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category_id, month, year)
);
```

#### **subcategories_727b50c3**
Subcategorías de transacciones.

```sql
CREATE TABLE subcategories_727b50c3 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories_727b50c3(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tablas de Finanzas Familiares

#### **family_groups_727b50c3**
Grupos familiares para compartir finanzas.

```sql
CREATE TABLE family_groups_727b50c3 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invite_code TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **group_members_727b50c3**
Miembros de grupos familiares.

```sql
CREATE TABLE group_members_727b50c3 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES family_groups_727b50c3(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);
```

#### **group_transactions_727b50c3**
Transacciones compartidas en grupos familiares.

```sql
CREATE TABLE group_transactions_727b50c3 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES family_groups_727b50c3(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(15,2) NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  receipt_url TEXT,
  date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **group_reactions_727b50c3**
Reacciones con stickers a transacciones compartidas.

```sql
CREATE TABLE group_reactions_727b50c3 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES group_transactions_727b50c3(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sticker TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(transaction_id, user_id, sticker)
);
```

#### **group_comments_727b50c3**
Comentarios en transacciones compartidas.

```sql
CREATE TABLE group_comments_727b50c3 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES group_transactions_727b50c3(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabla de KV Store

#### **kv_store_727b50c3**
Almacenamiento key-value para datos temporales.

```sql
CREATE TABLE kv_store_727b50c3 (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Uso actual:**
- `conversation:{userId}:{convId}` - Conversaciones de Oti Chat
- `user:{userId}:device` - Información de dispositivos

---

## 🔒 ROW LEVEL SECURITY (RLS)

Todas las tablas tienen políticas RLS implementadas para garantizar que:

✅ Los usuarios solo pueden ver sus propios datos  
✅ Los miembros de grupos solo pueden ver datos del grupo  
✅ Solo los admins pueden eliminar grupos  
✅ Protección contra acceso no autorizado

### Ejemplo de Política RLS

```sql
-- Los usuarios solo pueden ver sus propias transacciones
CREATE POLICY "Users can view own transactions"
ON transactions_727b50c3
FOR SELECT
USING (auth.uid() = user_id);

-- Los miembros del grupo pueden ver transacciones compartidas
CREATE POLICY "Group members can view shared transactions"
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

---

## 🎯 ÍNDICES DE PERFORMANCE

Se han creado 80+ índices para optimizar las consultas más frecuentes:

```sql
-- Transacciones por usuario y fecha
CREATE INDEX idx_transactions_user_date 
ON transactions_727b50c3(user_id, date DESC);

-- Transacciones por cuenta
CREATE INDEX idx_transactions_account 
ON transactions_727b50c3(account_id);

-- Presupuestos por usuario, mes y año
CREATE INDEX idx_budgets_user_month_year 
ON budgets_727b50c3(user_id, year, month);

-- Transacciones de grupo
CREATE INDEX idx_group_transactions_group 
ON group_transactions_727b50c3(group_id, date DESC);
```

---

## 📋 FUNCIONES Y VISTAS

### Funciones Principales

#### **update_account_balance()**
Actualiza automáticamente el balance de cuentas al crear/editar/eliminar transacciones.

#### **calculate_budget_progress()**
Calcula el progreso de presupuestos vs gastos reales.

#### **get_user_statistics()**
Retorna estadísticas financieras del usuario.

### Vistas

#### **v_transactions_with_details**
Vista que incluye transacciones con nombres de categorías y cuentas.

#### **v_budget_progress**
Vista que muestra el progreso de todos los presupuestos.

---

## 🚀 MEJORES PRÁCTICAS

### Uso del KV Store vs Tablas

**Usar KV Store para:**
- ✅ Datos temporales (< 24 horas)
- ✅ Configuraciones de sesión
- ✅ Cache de datos
- ✅ Device tokens

**Usar Tablas para:**
- ✅ Datos permanentes
- ✅ Datos que requieren queries complejas
- ✅ Datos que necesitan relaciones
- ✅ Datos que necesitan RLS

### Consideraciones de Performance

1. **Siempre usar índices** en columnas que se usan en WHERE, JOIN, o ORDER BY
2. **Usar RLS policies** para seguridad en lugar de filtrar en el cliente
3. **Evitar SELECT *** - solo seleccionar columnas necesarias
4. **Usar EXPLAIN ANALYZE** para optimizar queries lentas
5. **Implementar paginación** para listas grandes

---

## 🔧 MANTENIMIENTO

### Limpieza de Datos Obsoletos

```sql
-- Eliminar conversaciones de chat antiguas (> 90 días)
DELETE FROM kv_store_727b50c3
WHERE key LIKE 'conversation:%'
AND created_at < NOW() - INTERVAL '90 days';

-- Eliminar tokens de dispositivos antiguos (> 180 días)
DELETE FROM kv_store_727b50c3
WHERE key LIKE 'user:%:device'
AND updated_at < NOW() - INTERVAL '180 days';
```

### Verificación de Integridad

```sql
-- Verificar que todas las transacciones tienen cuenta válida
SELECT COUNT(*) 
FROM transactions_727b50c3 t
LEFT JOIN accounts_727b50c3 a ON t.account_id = a.id
WHERE t.account_id IS NOT NULL AND a.id IS NULL;
-- Debe retornar 0

-- Verificar que los balances son correctos
SELECT 
  a.id,
  a.name,
  a.balance,
  COALESCE(SUM(
    CASE 
      WHEN t.type = 'income' THEN t.amount
      WHEN t.type = 'expense' THEN -t.amount
      WHEN t.type = 'transfer' AND t.account_id = a.id THEN -t.amount
      WHEN t.type = 'transfer' AND t.to_account_id = a.id THEN t.amount
    END
  ), 0) as calculated_balance
FROM accounts_727b50c3 a
LEFT JOIN transactions_727b50c3 t ON t.account_id = a.id OR t.to_account_id = a.id
GROUP BY a.id, a.name, a.balance
HAVING a.balance != COALESCE(SUM(...), 0);
-- Debe retornar 0 filas
```

---

## 📚 RECURSOS ADICIONALES

### Documentación Relacionada

- [/docs/DEVELOPER_GUIDE.md](/docs/DEVELOPER_GUIDE.md) - Guía para desarrolladores
- [/ARCHITECTURE.md](/ARCHITECTURE.md) - Arquitectura del proyecto
- [/docs/TIMEZONE_COLOMBIA.md](/docs/TIMEZONE_COLOMBIA.md) - Sistema de fechas

### Links Útiles

- **Supabase Dashboard:** https://supabase.com/dashboard
- **Postgres Docs:** https://www.postgresql.org/docs/
- **RLS Tutorial:** https://supabase.com/docs/guides/auth/row-level-security

---

## ⚠️ NOTAS IMPORTANTES

1. **Nunca eliminar tablas directamente** - Usar scripts de migración
2. **Siempre hacer backup** antes de ejecutar scripts de migración
3. **Probar en desarrollo** antes de ejecutar en producción
4. **Los nombres tienen sufijo _727b50c3** para evitar conflictos
5. **RLS está habilitado** - asegurarse de tener políticas correctas
6. **Timezone:** Todas las fechas se guardan en UTC (America/Bogota para display)

---

## 🆘 TROUBLESHOOTING

### Error: "permission denied for table"
**Solución:** Verificar que RLS policies están configuradas correctamente.

```sql
-- Ver policies de una tabla
SELECT * FROM pg_policies WHERE tablename = 'transactions_727b50c3';
```

### Error: "duplicate key value violates unique constraint"
**Solución:** Verificar que no existen duplicados antes de insertar.

```sql
-- Ejemplo para budgets (único por user, category, month, year)
SELECT user_id, category_id, month, year, COUNT(*)
FROM budgets_727b50c3
GROUP BY user_id, category_id, month, year
HAVING COUNT(*) > 1;
```

### Queries lentas
**Solución:** Usar EXPLAIN ANALYZE y agregar índices si es necesario.

```sql
EXPLAIN ANALYZE
SELECT * FROM transactions_727b50c3 
WHERE user_id = '...' 
ORDER BY date DESC 
LIMIT 50;
```

---

**Última actualización:** Diciembre 30, 2025  
**Mantenido por:** Equipo de Desarrollo Oti
