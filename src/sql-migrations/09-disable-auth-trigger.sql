-- =====================================================
-- FIX: Deshabilitar trigger en auth.users
-- =====================================================
-- 
-- PROBLEMA: El trigger "trigger_cleanup_deleted_user" causa errores
-- al intentar eliminar usuarios desde el Admin API
--
-- SOLUCIÓN: Deshabilitar/eliminar el trigger porque ya manejamos
-- la limpieza manualmente en deleteAllUserData()
-- =====================================================

BEGIN;

-- =====================================================
-- PASO 1: Eliminar el trigger de auth.users
-- =====================================================

DROP TRIGGER IF EXISTS trigger_cleanup_deleted_user ON auth.users;

-- =====================================================
-- PASO 2: Verificar que se eliminó
-- =====================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.triggers 
    WHERE trigger_name = 'trigger_cleanup_deleted_user'
      AND event_object_table = 'users'
      AND event_object_schema = 'auth'
  ) THEN
    RAISE NOTICE '⚠️  WARNING: Trigger still exists!';
  ELSE
    RAISE NOTICE '✅ Trigger successfully removed';
  END IF;
END $$;

COMMIT;

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
--
-- ¿Por qué eliminamos el trigger?
--
-- 1. El trigger se ejecuta ANTES de eliminar el usuario de auth.users
-- 2. Esto causa conflictos con Supabase Auth API
-- 3. Ya manejamos la limpieza manualmente en deleteAllUserData()
-- 4. Es más confiable y controlable hacerlo desde el código
--
-- La limpieza ahora funciona así:
--
-- 1. deleteAllUserData(userId) elimina:
--    - Transacciones, presupuestos, cuentas, categorías
--    - Conversaciones de chat
--    - Membresías de grupos
--    - Invitaciones
--    - Dispositivos
--    - Notificaciones
--
-- 2. auth.admin.deleteUser() elimina el usuario de Auth
--
-- =====================================================
