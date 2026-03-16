-- =====================================================
-- FIX SIMPLE: Eliminar todas las constraints que bloquean
-- =====================================================
-- Este script elimina TODAS las FKs y triggers que 
-- impiden eliminar usuarios de auth.users
-- =====================================================

BEGIN;

-- 1. Eliminar FKs específicas de chat_conversations_727b50c3
ALTER TABLE IF EXISTS chat_conversations_727b50c3 
DROP CONSTRAINT IF EXISTS chat_conversations_727b50c3_user_id_fkey CASCADE;

ALTER TABLE IF EXISTS chat_conversations_727b50c3 
DROP CONSTRAINT IF EXISTS chat_conversations_user_id_fkey CASCADE;

-- 2. Eliminar FKs específicas de chat_messages_727b50c3
ALTER TABLE IF EXISTS chat_messages_727b50c3 
DROP CONSTRAINT IF EXISTS chat_messages_727b50c3_user_id_fkey CASCADE;

-- 3. Eliminar DINÁMICAMENTE todas las FKs que apuntan a auth.users
DO $$
DECLARE
  fk_record RECORD;
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
    EXECUTE format('ALTER TABLE %I.%I DROP CONSTRAINT IF EXISTS %I CASCADE', 
      fk_record.table_schema, 
      fk_record.table_name,
      fk_record.constraint_name
    );
  END LOOP;
END $$;

-- 4. Eliminar triggers específicos conocidos
DROP TRIGGER IF EXISTS trigger_cleanup_deleted_user ON auth.users CASCADE;
DROP TRIGGER IF EXISTS cleanup_deleted_user ON auth.users CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users CASCADE;

-- 5. Eliminar DINÁMICAMENTE todos los triggers de auth.users
DO $$
DECLARE
  trigger_name TEXT;
BEGIN
  FOR trigger_name IN
    SELECT tgname::text
    FROM pg_trigger
    WHERE tgrelid = 'auth.users'::regclass
      AND tgisinternal = false
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON auth.users CASCADE', trigger_name);
  END LOOP;
END $$;

COMMIT;

-- =====================================================
-- VERIFICACIÓN: Ejecuta estas queries después
-- =====================================================
-- 
-- Para verificar que funcionó:
--
-- SELECT constraint_name 
-- FROM information_schema.table_constraints tc
-- JOIN information_schema.constraint_column_usage ccu
--   ON ccu.constraint_name = tc.constraint_name
-- WHERE tc.constraint_type = 'FOREIGN KEY'
--   AND ccu.table_schema = 'auth'
--   AND ccu.table_name = 'users';
-- 
-- Debe retornar: 0 filas
-- =====================================================
