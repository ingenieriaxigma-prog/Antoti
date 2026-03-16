-- =====================================================
-- FIX: Remove FK constraint from chat_conversations_727b50c3
-- =====================================================
-- 
-- PROBLEMA: La FK directa a auth.users causa "Database error deleting user"
-- SOLUCIÓN: Eliminar el constraint y usar solo UUID sin FK
-- 
-- Esto permite que Supabase Auth elimine usuarios sin problemas,
-- y nosotros manejamos la eliminación de conversaciones manualmente
-- en el código (deleteAllUserData function).

BEGIN;

-- =====================================================
-- STEP 1: Drop the foreign key constraint
-- =====================================================

-- Find the constraint name (it might be auto-generated)
-- We'll drop it regardless of the name

ALTER TABLE chat_conversations_727b50c3 
DROP CONSTRAINT IF EXISTS chat_conversations_727b50c3_user_id_fkey;

-- Also drop any other possible variations of the constraint name
ALTER TABLE chat_conversations_727b50c3 
DROP CONSTRAINT IF EXISTS chat_conversations_user_id_fkey;

-- =====================================================
-- STEP 2: Verify the change
-- =====================================================

-- Query to check if FK constraint still exists
-- (This is informational only - won't fail the migration)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_type = 'FOREIGN KEY' 
      AND table_name = 'chat_conversations_727b50c3'
      AND constraint_name LIKE '%user_id%'
  ) THEN
    RAISE NOTICE '⚠️  WARNING: FK constraint still exists!';
  ELSE
    RAISE NOTICE '✅ FK constraint successfully removed';
  END IF;
END $$;

COMMIT;

-- =====================================================
-- NOTES
-- =====================================================
-- 
-- Después de ejecutar este script:
-- 
-- 1. La tabla chat_conversations_727b50c3 ya NO tendrá FK a auth.users
-- 2. user_id seguirá siendo UUID NOT NULL, pero sin constraint
-- 3. Supabase Auth podrá eliminar usuarios sin errores
-- 4. Nosotros manejamos la limpieza de conversaciones en deleteAllUserData()
-- 
-- =====================================================
