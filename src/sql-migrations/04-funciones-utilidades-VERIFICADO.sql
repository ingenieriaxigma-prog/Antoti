-- ========================================
-- PARTE 4: FUNCIONES Y TRIGGERS ÚTILES (VERIFICADO)
-- ========================================
-- Ejecutar CUARTO - Funciones de limpieza y utilidades
-- 100% VERIFICADO contra esquema real de BD

-- ====================================
-- 1. FUNCIÓN: Limpiar invitaciones expiradas
-- ====================================
CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS TABLE (
  deleted_count INTEGER,
  execution_time TIMESTAMPTZ
) AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM family_invitations_727b50c3
  WHERE status = 'pending' AND expires_at < NOW();
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN QUERY SELECT v_deleted_count, NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================
-- 2. FUNCIÓN: Limpiar notificaciones antiguas
-- ====================================
CREATE OR REPLACE FUNCTION cleanup_old_notifications(days_old INTEGER DEFAULT 90)
RETURNS TABLE (
  deleted_count INTEGER,
  execution_time TIMESTAMPTZ
) AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM family_notifications_727b50c3
  WHERE read = TRUE 
    AND created_at < NOW() - (days_old || ' days')::INTERVAL;
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN QUERY SELECT v_deleted_count, NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================
-- 3. FUNCIÓN: Estadísticas de uso
-- ====================================
CREATE OR REPLACE FUNCTION get_usage_stats()
RETURNS TABLE (
  metric TEXT,
  value BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 'total_users'::TEXT, COUNT(DISTINCT user_id) FROM transactions_727b50c3
  UNION ALL
  SELECT 'total_transactions'::TEXT, COUNT(*)::BIGINT FROM transactions_727b50c3
  UNION ALL
  SELECT 'total_accounts'::TEXT, COUNT(*)::BIGINT FROM accounts_727b50c3
  UNION ALL
  SELECT 'total_categories'::TEXT, COUNT(*)::BIGINT FROM categories_727b50c3
  UNION ALL
  SELECT 'total_budgets'::TEXT, COUNT(*)::BIGINT FROM budgets_727b50c3
  UNION ALL
  SELECT 'total_groups'::TEXT, COUNT(*)::BIGINT FROM family_groups_727b50c3
  UNION ALL
  SELECT 'total_group_members'::TEXT, COUNT(*)::BIGINT FROM group_members_727b50c3
  UNION ALL
  SELECT 'total_group_transactions'::TEXT, COUNT(*)::BIGINT FROM group_transactions_727b50c3
  UNION ALL
  SELECT 'total_invitations_pending'::TEXT, COUNT(*)::BIGINT FROM family_invitations_727b50c3 WHERE status = 'pending'
  UNION ALL
  SELECT 'total_notifications_unread'::TEXT, COUNT(*)::BIGINT FROM family_notifications_727b50c3 WHERE read = FALSE
  UNION ALL
  SELECT 'kv_store_entries'::TEXT, COUNT(*)::BIGINT FROM kv_store_727b50c3;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================
-- 4. FUNCIÓN: Obtener actividad de grupo
-- ====================================
CREATE OR REPLACE FUNCTION get_group_activity(
  p_group_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  activity_date DATE,
  transaction_count BIGINT,
  total_expense NUMERIC,
  total_income NUMERIC,
  comment_count BIGINT,
  reaction_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(gt.transaction_date) as activity_date,
    COUNT(DISTINCT gt.id) as transaction_count,
    COALESCE(SUM(CASE WHEN gt.transaction_type = 'expense' THEN gt.amount ELSE 0 END), 0) as total_expense,
    COALESCE(SUM(CASE WHEN gt.transaction_type = 'income' THEN gt.amount ELSE 0 END), 0) as total_income,
    COUNT(DISTINCT gc.id) as comment_count,
    COUNT(DISTINCT gr.id) as reaction_count
  FROM group_transactions_727b50c3 gt
  LEFT JOIN group_comments_727b50c3 gc ON gc.group_transaction_id = gt.id
  LEFT JOIN group_reactions_727b50c3 gr ON gr.group_transaction_id = gt.id
  WHERE gt.group_id = p_group_id
    AND gt.transaction_date >= CURRENT_DATE - (p_days || ' days')::INTERVAL
  GROUP BY DATE(gt.transaction_date)
  ORDER BY activity_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================
-- 5. FUNCIÓN: Validar permisos de admin
-- ====================================
CREATE OR REPLACE FUNCTION is_group_admin(
  p_user_id TEXT,
  p_group_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_admin BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM group_members_727b50c3
    WHERE group_id = p_group_id
      AND user_id = p_user_id
      AND role IN ('admin', 'owner')
      AND status = 'active'
  ) INTO v_is_admin;
  
  RETURN v_is_admin;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================
-- 6. VISTAS ÚTILES
-- ====================================

-- Vista: Invitaciones pendientes con info del grupo
-- NOTA: family_groups_727b50c3 NO tiene member_count ni owner_id
CREATE OR REPLACE VIEW pending_invitations_with_group AS
SELECT 
  i.*,
  g.name as group_name,
  g.emoji as group_emoji,
  g.created_by as group_created_by
FROM family_invitations_727b50c3 i
JOIN family_groups_727b50c3 g ON g.id = i.group_id
WHERE i.status = 'pending' 
  AND i.expires_at > NOW();

-- Vista: Notificaciones no leídas con info del grupo
CREATE OR REPLACE VIEW unread_notifications_with_group AS
SELECT 
  n.*,
  g.name as group_name,
  g.emoji as group_emoji
FROM family_notifications_727b50c3 n
LEFT JOIN family_groups_727b50c3 g ON g.id = n.group_id
WHERE n.read = FALSE
ORDER BY n.created_at DESC;

-- Vista: Transacciones recientes de grupos con detalles
-- CORREGIDO: group_transactions usa shared_by_user_id (no user_id)
CREATE OR REPLACE VIEW recent_group_transactions AS
SELECT 
  gt.*,
  g.name as group_name,
  g.emoji as group_emoji,
  gm.role as user_role,
  COUNT(DISTINCT gr.id) as reaction_count,
  COUNT(DISTINCT gc.id) as comment_count
FROM group_transactions_727b50c3 gt
JOIN family_groups_727b50c3 g ON g.id = gt.group_id
LEFT JOIN group_members_727b50c3 gm ON gm.group_id = gt.group_id AND gm.user_id = gt.shared_by_user_id
LEFT JOIN group_reactions_727b50c3 gr ON gr.group_transaction_id = gt.id
LEFT JOIN group_comments_727b50c3 gc ON gc.group_transaction_id = gt.id
WHERE gt.created_at >= NOW() - INTERVAL '7 days'
GROUP BY gt.id, g.name, g.emoji, gm.role
ORDER BY gt.created_at DESC;

-- ====================================
-- 7. GRANTS (Permisos)
-- ====================================
GRANT EXECUTE ON FUNCTION cleanup_expired_invitations() TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_old_notifications(INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION get_usage_stats() TO service_role;
GRANT EXECUTE ON FUNCTION get_group_activity(UUID, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION is_group_admin(TEXT, UUID) TO service_role;

-- ====================================
-- 8. VERIFICACIÓN
-- ====================================

-- Probar función de limpieza de invitaciones
SELECT * FROM cleanup_expired_invitations();

-- Probar función de limpieza de notificaciones
SELECT * FROM cleanup_old_notifications(90);

-- Ver estadísticas de uso
SELECT * FROM get_usage_stats();

-- Ver funciones creadas
SELECT 
  p.proname as function_name,
  pg_get_function_result(p.oid) as return_type,
  pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname IN (
    'cleanup_expired_invitations',
    'cleanup_old_notifications',
    'get_usage_stats',
    'get_group_activity',
    'is_group_admin'
  )
ORDER BY p.proname;

-- Ver vistas creadas
SELECT 
  table_name,
  view_definition
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name IN (
    'pending_invitations_with_group',
    'unread_notifications_with_group',
    'recent_group_transactions'
  );

COMMENT ON FUNCTION cleanup_expired_invitations() IS 'Elimina invitaciones expiradas y retorna el contador';
COMMENT ON FUNCTION cleanup_old_notifications(INTEGER) IS 'Elimina notificaciones leídas más antiguas que X días';
COMMENT ON FUNCTION get_usage_stats() IS 'Retorna estadísticas generales de uso de la aplicación';
COMMENT ON FUNCTION get_group_activity(UUID, INTEGER) IS 'Retorna actividad diaria de un grupo en los últimos X días';
COMMENT ON FUNCTION is_group_admin(TEXT, UUID) IS 'Verifica si un usuario es admin de un grupo';
