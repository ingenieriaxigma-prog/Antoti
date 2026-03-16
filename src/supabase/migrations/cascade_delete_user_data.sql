-- =====================================================
-- CASCADE DELETE: Limpieza automática al eliminar usuarios
-- =====================================================
-- Este trigger se ejecuta ANTES de eliminar un usuario en auth.users
-- y limpia TODOS sus datos relacionados en las tablas de grupos familiares
-- =====================================================

-- Crear función que limpia datos del usuario
CREATE OR REPLACE FUNCTION cleanup_deleted_user_data()
RETURNS TRIGGER AS $$
DECLARE
  deleted_user_email TEXT;
  records_deleted INT;
BEGIN
  -- Obtener el email del usuario que será eliminado
  deleted_user_email := OLD.email;
  
  RAISE NOTICE '🗑️  Limpiando datos del usuario: % (ID: %)', deleted_user_email, OLD.id;
  RAISE NOTICE '';

  -- ============================================
  -- PASO 1: Eliminar comentarios del usuario
  -- ============================================
  DELETE FROM group_comments_727b50c3 
  WHERE user_id = OLD.id;
  GET DIAGNOSTICS records_deleted = ROW_COUNT;
  RAISE NOTICE '  ✅ Comentarios eliminados: %', records_deleted;

  -- ============================================
  -- PASO 2: Eliminar reacciones del usuario
  -- ============================================
  DELETE FROM group_reactions_727b50c3 
  WHERE user_id = OLD.id;
  GET DIAGNOSTICS records_deleted = ROW_COUNT;
  RAISE NOTICE '  ✅ Reacciones eliminadas: %', records_deleted;

  -- ============================================
  -- PASO 3: Eliminar notificaciones generadas por el usuario
  -- ============================================
  DELETE FROM group_notifications_727b50c3 
  WHERE triggered_by_user_id = OLD.id;
  GET DIAGNOSTICS records_deleted = ROW_COUNT;
  RAISE NOTICE '  ✅ Notificaciones eliminadas: %', records_deleted;

  -- ============================================
  -- PASO 4: Eliminar transacciones compartidas por el usuario
  -- ============================================
  DELETE FROM group_transactions_727b50c3 
  WHERE shared_by_user_id = OLD.id;
  GET DIAGNOSTICS records_deleted = ROW_COUNT;
  RAISE NOTICE '  ✅ Transacciones eliminadas: %', records_deleted;

  -- ============================================
  -- PASO 5: Eliminar invitaciones relacionadas con el usuario
  -- ============================================
  -- Invitaciones enviadas por el usuario (invited_by_email)
  DELETE FROM family_invitations_727b50c3 
  WHERE invited_by_email = deleted_user_email;
  GET DIAGNOSTICS records_deleted = ROW_COUNT;
  RAISE NOTICE '  ✅ Invitaciones enviadas eliminadas: %', records_deleted;

  -- Invitaciones recibidas por el usuario (email)
  DELETE FROM family_invitations_727b50c3 
  WHERE email = deleted_user_email;
  GET DIAGNOSTICS records_deleted = ROW_COUNT;
  RAISE NOTICE '  ✅ Invitaciones recibidas eliminadas: %', records_deleted;

  -- ============================================
  -- PASO 6: Eliminar membresías del usuario
  -- ============================================
  DELETE FROM group_members_727b50c3 
  WHERE user_id = OLD.id;
  GET DIAGNOSTICS records_deleted = ROW_COUNT;
  RAISE NOTICE '  ✅ Membresías eliminadas: %', records_deleted;

  RAISE NOTICE '';
  RAISE NOTICE '✨ Limpieza completada para: %', deleted_user_email;
  
  -- Permitir que la eliminación del usuario continúe
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Crear trigger en auth.users
-- ============================================
DROP TRIGGER IF EXISTS trigger_cleanup_deleted_user ON auth.users;

CREATE TRIGGER trigger_cleanup_deleted_user
  BEFORE DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_deleted_user_data();

-- Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '================================================';
  RAISE NOTICE '🎉 CASCADE DELETE configurado exitosamente';
  RAISE NOTICE '================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'ℹ️  El trigger se ejecutará automáticamente cuando:';
  RAISE NOTICE '   - Elimines un usuario desde Supabase Auth UI';
  RAISE NOTICE '   - Ejecutes: DELETE FROM auth.users WHERE id = ...';
  RAISE NOTICE '';
  RAISE NOTICE '🔍 Tablas monitoreadas:';
  RAISE NOTICE '   ✓ group_comments_727b50c3';
  RAISE NOTICE '   ✓ group_reactions_727b50c3';
  RAISE NOTICE '   ✓ group_notifications_727b50c3';
  RAISE NOTICE '   ✓ group_transactions_727b50c3';
  RAISE NOTICE '   ✓ family_invitations_727b50c3';
  RAISE NOTICE '   ✓ group_members_727b50c3';
  RAISE NOTICE '';
END $$;
