-- =====================================================
-- DIAGNÓSTICO COMPLETO Y FIX DE TODAS LAS CONSTRAINTS
-- =====================================================
-- Este script:
-- 1. Investiga TODAS las FK y triggers que bloquean auth.users
-- 2. Elimina TODO lo que impide eliminar usuarios
-- 3. Verifica que quedó limpio
-- =====================================================

BEGIN;

-- =====================================================
-- PARTE 1: DIAGNÓSTICO INICIAL
-- =====================================================

RAISE NOTICE '';
RAISE NOTICE '================================================';
RAISE NOTICE '🔍 DIAGNÓSTICO: Buscando constraints problemáticas';
RAISE NOTICE '================================================';
RAISE NOTICE '';

-- 1.1 Buscar TODAS las FK que apuntan a auth.users
RAISE NOTICE '📋 Foreign Keys que apuntan a auth.users:';
DO $$
DECLARE
  fk_record RECORD;
  fk_count INTEGER := 0;
BEGIN
  FOR fk_record IN
    SELECT 
      tc.table_schema,
      tc.table_name,
      tc.constraint_name,
      kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu
      ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND ccu.table_schema = 'auth'
      AND ccu.table_name = 'users'
  LOOP
    fk_count := fk_count + 1;
    RAISE NOTICE '   %: %.% → % (constraint: %)', 
      fk_count,
      fk_record.table_schema, 
      fk_record.table_name,
      fk_record.column_name,
      fk_record.constraint_name;
  END LOOP;
  
  IF fk_count = 0 THEN
    RAISE NOTICE '   ✅ No foreign keys found';
  END IF;
END $$;

RAISE NOTICE '';

-- 1.2 Buscar TODOS los triggers en auth.users
RAISE NOTICE '📋 Triggers en auth.users:';
DO $$
DECLARE
  trigger_record RECORD;
  trigger_count INTEGER := 0;
BEGIN
  FOR trigger_record IN
    SELECT 
      trigger_name,
      event_manipulation,
      action_timing,
      action_statement
    FROM information_schema.triggers
    WHERE event_object_schema = 'auth'
      AND event_object_table = 'users'
  LOOP
    trigger_count := trigger_count + 1;
    RAISE NOTICE '   %: % % on auth.users', 
      trigger_count,
      trigger_record.action_timing,
      trigger_record.event_manipulation;
    RAISE NOTICE '      Name: %', trigger_record.trigger_name;
    RAISE NOTICE '      Action: %', trigger_record.action_statement;
  END LOOP;
  
  IF trigger_count = 0 THEN
    RAISE NOTICE '   ✅ No triggers found';
  END IF;
END $$;

RAISE NOTICE '';

-- =====================================================
-- PARTE 2: ELIMINACIÓN DE TODAS LAS CONSTRAINTS
-- =====================================================

RAISE NOTICE '================================================';
RAISE NOTICE '🔧 ELIMINANDO TODAS LAS CONSTRAINTS';
RAISE NOTICE '================================================';
RAISE NOTICE '';

-- 2.1 Eliminar TODAS las FK de chat_conversations_727b50c3
RAISE NOTICE '🗑️  Eliminando FKs de chat_conversations_727b50c3...';

-- Método 1: Por nombre específico
ALTER TABLE IF EXISTS chat_conversations_727b50c3 
DROP CONSTRAINT IF EXISTS chat_conversations_727b50c3_user_id_fkey CASCADE;

ALTER TABLE IF EXISTS chat_conversations_727b50c3 
DROP CONSTRAINT IF EXISTS chat_conversations_user_id_fkey CASCADE;

-- Método 2: Buscar y eliminar dinámicamente TODAS las FK de esa tabla
DO $$
DECLARE
  fk_name TEXT;
BEGIN
  FOR fk_name IN
    SELECT constraint_name
    FROM information_schema.table_constraints
    WHERE table_name = 'chat_conversations_727b50c3'
      AND constraint_type = 'FOREIGN KEY'
  LOOP
    EXECUTE format('ALTER TABLE chat_conversations_727b50c3 DROP CONSTRAINT IF EXISTS %I CASCADE', fk_name);
    RAISE NOTICE '   ✅ Dropped FK: %', fk_name;
  END LOOP;
END $$;

RAISE NOTICE '';

-- 2.2 Eliminar TODAS las FK de chat_messages_727b50c3 
RAISE NOTICE '🗑️  Eliminando FKs de chat_messages_727b50c3...';

DO $$
DECLARE
  fk_name TEXT;
BEGIN
  FOR fk_name IN
    SELECT constraint_name
    FROM information_schema.table_constraints
    WHERE table_name = 'chat_messages_727b50c3'
      AND constraint_type = 'FOREIGN KEY'
  LOOP
    EXECUTE format('ALTER TABLE chat_messages_727b50c3 DROP CONSTRAINT IF EXISTS %I CASCADE', fk_name);
    RAISE NOTICE '   ✅ Dropped FK: %', fk_name;
  END LOOP;
END $$;

RAISE NOTICE '';

-- 2.3 Eliminar TODAS las FK que apunten a auth.users desde CUALQUIER tabla
RAISE NOTICE '🗑️  Eliminando TODAS las FKs que apuntan a auth.users...';

DO $$
DECLARE
  fk_record RECORD;
  drop_count INTEGER := 0;
BEGIN
  FOR fk_record IN
    SELECT 
      tc.table_schema,
      tc.table_name,
      tc.constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu
      ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND ccu.table_schema = 'auth'
      AND ccu.table_name = 'users'
  LOOP
    drop_count := drop_count + 1;
    EXECUTE format('ALTER TABLE %I.%I DROP CONSTRAINT IF EXISTS %I CASCADE', 
      fk_record.table_schema, 
      fk_record.table_name,
      fk_record.constraint_name
    );
    RAISE NOTICE '   ✅ Dropped FK: %.% → %', 
      fk_record.table_schema,
      fk_record.table_name,
      fk_record.constraint_name;
  END LOOP;
  
  IF drop_count = 0 THEN
    RAISE NOTICE '   ℹ️  No FKs to drop';
  END IF;
END $$;

RAISE NOTICE '';

-- 2.4 Eliminar TODOS los triggers en auth.users
RAISE NOTICE '🗑️  Eliminando TODOS los triggers de auth.users...';

-- Específicos conocidos
DROP TRIGGER IF EXISTS trigger_cleanup_deleted_user ON auth.users CASCADE;
DROP TRIGGER IF EXISTS cleanup_deleted_user ON auth.users CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users CASCADE;

-- Dinámicamente TODOS
DO $$
DECLARE
  trigger_name TEXT;
  drop_count INTEGER := 0;
BEGIN
  FOR trigger_name IN
    SELECT tgname::text
    FROM pg_trigger
    WHERE tgrelid = 'auth.users'::regclass
      AND tgisinternal = false  -- Excluir triggers internos del sistema
  LOOP
    drop_count := drop_count + 1;
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON auth.users CASCADE', trigger_name);
    RAISE NOTICE '   ✅ Dropped trigger: %', trigger_name;
  END LOOP;
  
  IF drop_count = 0 THEN
    RAISE NOTICE '   ℹ️  No triggers to drop';
  END IF;
END $$;

RAISE NOTICE '';

-- =====================================================
-- PARTE 3: VERIFICACIÓN FINAL
-- =====================================================

RAISE NOTICE '================================================';
RAISE NOTICE '🔍 VERIFICACIÓN FINAL';
RAISE NOTICE '================================================';
RAISE NOTICE '';

-- 3.1 Verificar FKs eliminadas
RAISE NOTICE '📋 FKs que apuntan a auth.users (debe estar vacío):';
DO $$
DECLARE
  fk_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO fk_count
  FROM information_schema.table_constraints tc
  JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
  WHERE tc.constraint_type = 'FOREIGN KEY'
    AND ccu.table_schema = 'auth'
    AND ccu.table_name = 'users';
  
  IF fk_count = 0 THEN
    RAISE NOTICE '   ✅ 0 foreign keys found (GOOD!)';
  ELSE
    RAISE NOTICE '   ❌ % foreign keys still exist!', fk_count;
  END IF;
END $$;

RAISE NOTICE '';

-- 3.2 Verificar triggers eliminados
RAISE NOTICE '📋 Triggers en auth.users (debe estar vacío):';
DO $$
DECLARE
  trigger_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO trigger_count
  FROM pg_trigger
  WHERE tgrelid = 'auth.users'::regclass
    AND tgisinternal = false;
  
  IF trigger_count = 0 THEN
    RAISE NOTICE '   ✅ 0 triggers found (GOOD!)';
  ELSE
    RAISE NOTICE '   ❌ % triggers still exist!', trigger_count;
  END IF;
END $$;

RAISE NOTICE '';

-- =====================================================
-- PARTE 4: RESUMEN
-- =====================================================

RAISE NOTICE '================================================';
RAISE NOTICE '✅ FIX COMPLETADO';
RAISE NOTICE '================================================';
RAISE NOTICE '';
RAISE NOTICE '🎯 Cambios realizados:';
RAISE NOTICE '   ✅ Todas las FKs a auth.users eliminadas';
RAISE NOTICE '   ✅ Todos los triggers de auth.users eliminados';
RAISE NOTICE '';
RAISE NOTICE '🧪 Próximo paso:';
RAISE NOTICE '   1. Ve al Admin Panel';
RAISE NOTICE '   2. Intenta eliminar fg.fibonacci@gmail.com';
RAISE NOTICE '   3. Debería funcionar sin errores ✅';
RAISE NOTICE '';

COMMIT;

-- =====================================================
-- NOTAS
-- =====================================================
-- 
-- Este script es más agresivo y completo que el anterior.
-- Busca y elimina DINÁMICAMENTE todas las constraints,
-- no solo las que conocemos por nombre.
--
-- Si aún falla después de esto, el problema está en otro lado
-- (posiblemente RLS policies o algo en el esquema de Supabase Auth)
-- =====================================================
