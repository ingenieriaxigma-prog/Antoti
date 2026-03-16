-- =====================================================
-- LIMPIEZA ÚNICA: Datos huérfanos de usuarios ya eliminados
-- =====================================================
-- Este script elimina datos de usuarios que YA fueron eliminados
-- ANTES de implementar el trigger automático.
-- 
-- ⚠️ EJECUTAR SOLO UNA VEZ después del trigger principal
-- =====================================================

DO $$
DECLARE
  orphan_count INT;
  total_cleaned INT := 0;
  orphan_emails TEXT[];
BEGIN
  RAISE NOTICE '🔍 Buscando datos huérfanos...';
  RAISE NOTICE '';

  -- Obtener lista de emails huérfanos en invitaciones
  SELECT ARRAY_AGG(DISTINCT invited_by_email)
  INTO orphan_emails
  FROM family_invitations_727b50c3
  WHERE invited_by_email NOT IN (SELECT email FROM auth.users);

  IF array_length(orphan_emails, 1) > 0 THEN
    RAISE NOTICE '📧 Emails huérfanos encontrados en invitaciones:';
    FOR i IN 1..array_length(orphan_emails, 1) LOOP
      RAISE NOTICE '   - %', orphan_emails[i];
    END LOOP;
    RAISE NOTICE '';
  END IF;

  -- ============================================
  -- PASO 1: Limpiar comentarios huérfanos
  -- ============================================
  DELETE FROM group_comments_727b50c3
  WHERE user_id NOT IN (SELECT id FROM auth.users);
  GET DIAGNOSTICS orphan_count = ROW_COUNT;
  total_cleaned := total_cleaned + orphan_count;
  RAISE NOTICE '  🗑️  Comentarios huérfanos eliminados: %', orphan_count;

  -- ============================================
  -- PASO 2: Limpiar reacciones huérfanas
  -- ============================================
  DELETE FROM group_reactions_727b50c3
  WHERE user_id NOT IN (SELECT id FROM auth.users);
  GET DIAGNOSTICS orphan_count = ROW_COUNT;
  total_cleaned := total_cleaned + orphan_count;
  RAISE NOTICE '  🗑️  Reacciones huérfanas eliminadas: %', orphan_count;

  -- ============================================
  -- PASO 3: Limpiar notificaciones huérfanas
  -- ============================================
  DELETE FROM group_notifications_727b50c3
  WHERE triggered_by_user_id NOT IN (SELECT id FROM auth.users);
  GET DIAGNOSTICS orphan_count = ROW_COUNT;
  total_cleaned := total_cleaned + orphan_count;
  RAISE NOTICE '  🗑️  Notificaciones huérfanas eliminadas: %', orphan_count;

  -- ============================================
  -- PASO 4: Limpiar transacciones huérfanas
  -- ============================================
  DELETE FROM group_transactions_727b50c3
  WHERE shared_by_user_id NOT IN (SELECT id FROM auth.users);
  GET DIAGNOSTICS orphan_count = ROW_COUNT;
  total_cleaned := total_cleaned + orphan_count;
  RAISE NOTICE '  🗑️  Transacciones huérfanas eliminadas: %', orphan_count;

  -- ============================================
  -- PASO 5: Limpiar invitaciones huérfanas (enviadas)
  -- ============================================
  DELETE FROM family_invitations_727b50c3
  WHERE invited_by_email NOT IN (SELECT email FROM auth.users);
  GET DIAGNOSTICS orphan_count = ROW_COUNT;
  total_cleaned := total_cleaned + orphan_count;
  RAISE NOTICE '  🗑️  Invitaciones enviadas (huérfanas): %', orphan_count;

  -- ============================================
  -- PASO 6: Limpiar invitaciones huérfanas (recibidas)
  -- ============================================
  DELETE FROM family_invitations_727b50c3
  WHERE email NOT IN (SELECT email FROM auth.users)
    AND status = 'pending'; -- Solo eliminar pendientes
  GET DIAGNOSTICS orphan_count = ROW_COUNT;
  total_cleaned := total_cleaned + orphan_count;
  RAISE NOTICE '  🗑️  Invitaciones recibidas (huérfanas): %', orphan_count;

  -- ============================================
  -- PASO 7: Limpiar membresías huérfanas
  -- ============================================
  DELETE FROM group_members_727b50c3
  WHERE user_id NOT IN (SELECT id FROM auth.users);
  GET DIAGNOSTICS orphan_count = ROW_COUNT;
  total_cleaned := total_cleaned + orphan_count;
  RAISE NOTICE '  🗑️  Membresías huérfanas eliminadas: %', orphan_count;

  -- Resumen
  RAISE NOTICE '';
  RAISE NOTICE '================================================';
  RAISE NOTICE '✨ Limpieza completada';
  RAISE NOTICE '================================================';
  RAISE NOTICE '📊 Total de registros huérfanos eliminados: %', total_cleaned;
  RAISE NOTICE '';
  
  IF total_cleaned = 0 THEN
    RAISE NOTICE '🎉 No se encontraron datos huérfanos. Base de datos limpia!';
  ELSE
    RAISE NOTICE '✅ Base de datos limpia. Ya puedes recrear usuarios con emails duplicados.';
  END IF;
  
  RAISE NOTICE '';
END $$;
