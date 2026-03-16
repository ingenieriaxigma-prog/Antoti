-- =====================================================
-- FIX COMPLETO: Permitir eliminación de usuarios
-- =====================================================
-- 
-- Este script resuelve TODOS los problemas que impiden
-- eliminar usuarios desde el Admin Panel:
--
-- 1. Elimina la FK constraint de chat_conversations a auth.users
-- 2. Elimina el trigger BEFORE DELETE en auth.users
--
-- ⚠️  EJECUTA ESTE SCRIPT COMPLETO EN SUPABASE SQL EDITOR
-- =====================================================

BEGIN;

-- =====================================================
-- PARTE 1: Eliminar FK constraint de chat_conversations
-- =====================================================

RAISE NOTICE '';
RAISE NOTICE '================================================';
RAISE NOTICE '🔧 PARTE 1: Eliminando FK constraint';
RAISE NOTICE '================================================';

-- Drop the foreign key constraint
ALTER TABLE chat_conversations_727b50c3 
DROP CONSTRAINT IF EXISTS chat_conversations_727b50c3_user_id_fkey;

-- Also drop any other possible variations
ALTER TABLE chat_conversations_727b50c3 
DROP CONSTRAINT IF EXISTS chat_conversations_user_id_fkey;

-- Verify
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_type = 'FOREIGN KEY' 
      AND table_name = 'chat_conversations_727b50c3'
      AND constraint_name LIKE '%user_id%'
  ) THEN
    RAISE NOTICE '❌ FK constraint still exists!';
  ELSE
    RAISE NOTICE '✅ FK constraint removed successfully';
  END IF;
END $$;

-- =====================================================
-- PARTE 2: Eliminar trigger de auth.users
-- =====================================================

RAISE NOTICE '';
RAISE NOTICE '================================================';
RAISE NOTICE '🔧 PARTE 2: Eliminando trigger de auth.users';
RAISE NOTICE '================================================';

-- Drop the trigger
DROP TRIGGER IF EXISTS trigger_cleanup_deleted_user ON auth.users;

-- Verify
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.triggers 
    WHERE trigger_name = 'trigger_cleanup_deleted_user'
      AND event_object_table = 'users'
      AND event_object_schema = 'auth'
  ) THEN
    RAISE NOTICE '❌ Trigger still exists!';
  ELSE
    RAISE NOTICE '✅ Trigger removed successfully';
  END IF;
END $$;

-- =====================================================
-- PARTE 3: Verificación final
-- =====================================================

RAISE NOTICE '';
RAISE NOTICE '================================================';
RAISE NOTICE '✅ FIX COMPLETADO';
RAISE NOTICE '================================================';
RAISE NOTICE '';
RAISE NOTICE '📋 Cambios realizados:';
RAISE NOTICE '  1. ✅ FK constraint eliminado de chat_conversations';
RAISE NOTICE '  2. ✅ Trigger BEFORE DELETE eliminado de auth.users';
RAISE NOTICE '';
RAISE NOTICE '🎯 Ahora puedes:';
RAISE NOTICE '  - Eliminar usuarios desde el Admin Panel';
RAISE NOTICE '  - La limpieza se hace en deleteAllUserData()';
RAISE NOTICE '  - No habrá errores de database constraints';
RAISE NOTICE '';
RAISE NOTICE '🧪 Siguiente paso:';
RAISE NOTICE '  - Ve al Admin Panel';
RAISE NOTICE '  - Intenta eliminar fg.fibonacci@gmail.com';
RAISE NOTICE '  - Debería funcionar sin errores ✅';
RAISE NOTICE '';

COMMIT;

-- =====================================================
-- NOTAS TÉCNICAS
-- =====================================================
--
-- ¿Por qué estos cambios?
--
-- PROBLEMA 1: FK constraint
--   - chat_conversations tenía FK a auth.users(id)
--   - Supabase Auth no puede eliminar users con FKs apuntándoles
--   - Solución: Eliminar la FK, manejar limpieza en código
--
-- PROBLEMA 2: Trigger BEFORE DELETE
--   - El trigger se ejecutaba antes de eliminar el usuario
--   - Causaba conflictos con Supabase Auth API
--   - Solución: Eliminar el trigger, manejar limpieza en código
--
-- Arquitectura final:
--   1. Admin Panel llama a /admin/users/cleanup/:email
--   2. Servidor ejecuta deleteAllUserData(userId)
--      - Elimina transacciones, cuentas, categorías
--      - Elimina conversaciones de chat (SIN FK)
--      - Elimina membresías, invitaciones
--      - Elimina dispositivos, notificaciones
--   3. Servidor ejecuta auth.admin.deleteUser(userId)
--      - Ahora funciona SIN errores ✅
--
-- =====================================================
