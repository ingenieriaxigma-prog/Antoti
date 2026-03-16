-- =====================================================
-- VERIFICACIÓN DEL SCRIPT 7
-- =====================================================
-- Ejecuta este script después del Script 7 para verificar
-- que todas las tablas, índices y políticas se crearon correctamente
-- =====================================================

-- =====================================================
-- 1. VERIFICAR TABLAS CREADAS
-- =====================================================

SELECT 
  tablename AS tabla,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS tamano,
  (SELECT COUNT(*) 
   FROM information_schema.columns 
   WHERE table_name = tablename) AS columnas
FROM pg_tables
WHERE tablename IN (
  'user_devices_727b50c3',
  'family_invitations_727b50c3',
  'notifications_727b50c3'
)
ORDER BY tablename;

-- =====================================================
-- 2. VERIFICAR COLUMNAS
-- =====================================================

-- User Devices
SELECT 
  'user_devices_727b50c3' AS tabla,
  column_name AS columna,
  data_type AS tipo,
  is_nullable AS nullable
FROM information_schema.columns
WHERE table_name = 'user_devices_727b50c3'
ORDER BY ordinal_position;

-- Family Invitations
SELECT 
  'family_invitations_727b50c3' AS tabla,
  column_name AS columna,
  data_type AS tipo,
  is_nullable AS nullable
FROM information_schema.columns
WHERE table_name = 'family_invitations_727b50c3'
ORDER BY ordinal_position;

-- Notifications
SELECT 
  'notifications_727b50c3' AS tabla,
  column_name AS columna,
  data_type AS tipo,
  is_nullable AS nullable
FROM information_schema.columns
WHERE table_name = 'notifications_727b50c3'
ORDER BY ordinal_position;

-- =====================================================
-- 3. VERIFICAR ÍNDICES
-- =====================================================

SELECT 
  tablename AS tabla,
  indexname AS indice,
  indexdef AS definicion
FROM pg_indexes
WHERE tablename IN (
  'user_devices_727b50c3',
  'family_invitations_727b50c3',
  'notifications_727b50c3'
)
ORDER BY tablename, indexname;

-- Resumen de índices
SELECT 
  tablename AS tabla,
  COUNT(*) AS total_indices
FROM pg_indexes
WHERE tablename IN (
  'user_devices_727b50c3',
  'family_invitations_727b50c3',
  'notifications_727b50c3'
)
GROUP BY tablename
ORDER BY tablename;

-- =====================================================
-- 4. VERIFICAR RLS HABILITADO
-- =====================================================

SELECT 
  tablename AS tabla,
  CASE WHEN rowsecurity THEN '✅ Habilitado' ELSE '❌ Deshabilitado' END AS rls_status
FROM pg_tables
WHERE tablename IN (
  'user_devices_727b50c3',
  'family_invitations_727b50c3',
  'notifications_727b50c3'
)
ORDER BY tablename;

-- =====================================================
-- 5. VERIFICAR POLÍTICAS RLS
-- =====================================================

SELECT 
  tablename AS tabla,
  policyname AS politica,
  cmd AS comando,
  CASE 
    WHEN qual IS NOT NULL THEN 'Con USING'
    ELSE 'Sin USING'
  END AS tipo
FROM pg_policies
WHERE tablename IN (
  'user_devices_727b50c3',
  'family_invitations_727b50c3',
  'notifications_727b50c3'
)
ORDER BY tablename, cmd, policyname;

-- Resumen de políticas
SELECT 
  tablename AS tabla,
  COUNT(*) AS total_politicas
FROM pg_policies
WHERE tablename IN (
  'user_devices_727b50c3',
  'family_invitations_727b50c3',
  'notifications_727b50c3'
)
GROUP BY tablename
ORDER BY tablename;

-- =====================================================
-- 6. VERIFICAR TRIGGERS
-- =====================================================

SELECT 
  event_object_table AS tabla,
  trigger_name AS trigger,
  event_manipulation AS evento,
  action_timing AS cuando
FROM information_schema.triggers
WHERE event_object_table IN (
  'user_devices_727b50c3',
  'family_invitations_727b50c3',
  'notifications_727b50c3'
)
ORDER BY event_object_table, trigger_name;

-- =====================================================
-- 7. VERIFICAR FUNCIONES
-- =====================================================

SELECT 
  routine_name AS funcion,
  data_type AS tipo_retorno,
  routine_definition AS definicion_preview
FROM information_schema.routines
WHERE routine_name IN (
  'get_active_devices',
  'get_unread_notifications',
  'get_pending_invitations',
  'update_updated_at_column',
  'expire_old_invitations'
)
ORDER BY routine_name;

-- =====================================================
-- 8. VERIFICAR VISTAS
-- =====================================================

SELECT 
  table_name AS vista,
  LEFT(view_definition, 100) AS definicion_preview
FROM information_schema.views
WHERE table_name IN (
  'v_group_invitations_summary',
  'v_device_stats',
  'v_notification_stats'
)
ORDER BY table_name;

-- =====================================================
-- 9. VERIFICAR CONSTRAINTS
-- =====================================================

SELECT 
  tc.table_name AS tabla,
  tc.constraint_name AS constraint,
  tc.constraint_type AS tipo,
  CASE 
    WHEN tc.constraint_type = 'CHECK' THEN cc.check_clause
    ELSE NULL
  END AS clausula
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name IN (
  'user_devices_727b50c3',
  'family_invitations_727b50c3',
  'notifications_727b50c3'
)
  AND tc.constraint_type IN ('CHECK', 'UNIQUE', 'PRIMARY KEY')
ORDER BY tc.table_name, tc.constraint_type, tc.constraint_name;

-- =====================================================
-- 10. HEALTH CHECK COMPLETO
-- =====================================================

WITH checks AS (
  -- Tablas
  SELECT 'Tabla: user_devices' AS check_name,
    EXISTS(SELECT 1 FROM pg_tables WHERE tablename = 'user_devices_727b50c3') AS ok
  UNION ALL
  SELECT 'Tabla: family_invitations',
    EXISTS(SELECT 1 FROM pg_tables WHERE tablename = 'family_invitations_727b50c3')
  UNION ALL
  SELECT 'Tabla: notifications',
    EXISTS(SELECT 1 FROM pg_tables WHERE tablename = 'notifications_727b50c3')
  
  -- RLS
  UNION ALL
  SELECT 'RLS: user_devices',
    EXISTS(SELECT 1 FROM pg_tables WHERE tablename = 'user_devices_727b50c3' AND rowsecurity = true)
  UNION ALL
  SELECT 'RLS: family_invitations',
    EXISTS(SELECT 1 FROM pg_tables WHERE tablename = 'family_invitations_727b50c3' AND rowsecurity = true)
  UNION ALL
  SELECT 'RLS: notifications',
    EXISTS(SELECT 1 FROM pg_tables WHERE tablename = 'notifications_727b50c3' AND rowsecurity = true)
  
  -- Políticas
  UNION ALL
  SELECT 'Políticas: user_devices (4)',
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'user_devices_727b50c3') = 4
  UNION ALL
  SELECT 'Políticas: family_invitations (5)',
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'family_invitations_727b50c3') = 5
  UNION ALL
  SELECT 'Políticas: notifications (4)',
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'notifications_727b50c3') = 4
  
  -- Triggers
  UNION ALL
  SELECT 'Trigger: updated_at devices',
    EXISTS(SELECT 1 FROM information_schema.triggers 
           WHERE trigger_name = 'trigger_user_devices_updated_at')
  UNION ALL
  SELECT 'Trigger: updated_at invitations',
    EXISTS(SELECT 1 FROM information_schema.triggers 
           WHERE trigger_name = 'trigger_family_invitations_updated_at')
  UNION ALL
  SELECT 'Trigger: updated_at notifications',
    EXISTS(SELECT 1 FROM information_schema.triggers 
           WHERE trigger_name = 'trigger_notifications_updated_at')
  UNION ALL
  SELECT 'Trigger: expire invitations',
    EXISTS(SELECT 1 FROM information_schema.triggers 
           WHERE trigger_name = 'trigger_expire_invitations')
  
  -- Funciones
  UNION ALL
  SELECT 'Función: get_active_devices',
    EXISTS(SELECT 1 FROM information_schema.routines 
           WHERE routine_name = 'get_active_devices')
  UNION ALL
  SELECT 'Función: get_unread_notifications',
    EXISTS(SELECT 1 FROM information_schema.routines 
           WHERE routine_name = 'get_unread_notifications')
  UNION ALL
  SELECT 'Función: get_pending_invitations',
    EXISTS(SELECT 1 FROM information_schema.routines 
           WHERE routine_name = 'get_pending_invitations')
  
  -- Vistas
  UNION ALL
  SELECT 'Vista: v_group_invitations_summary',
    EXISTS(SELECT 1 FROM information_schema.views 
           WHERE table_name = 'v_group_invitations_summary')
  UNION ALL
  SELECT 'Vista: v_device_stats',
    EXISTS(SELECT 1 FROM information_schema.views 
           WHERE table_name = 'v_device_stats')
  UNION ALL
  SELECT 'Vista: v_notification_stats',
    EXISTS(SELECT 1 FROM information_schema.views 
           WHERE table_name = 'v_notification_stats')
)
SELECT 
  check_name AS verificacion,
  CASE WHEN ok THEN '✅ PASS' ELSE '❌ FAIL' END AS estado
FROM checks
ORDER BY 
  CASE WHEN ok THEN 2 ELSE 1 END,
  check_name;

-- =====================================================
-- 11. RESUMEN EJECUTIVO
-- =====================================================

SELECT 
  '📊 RESUMEN DEL SCRIPT 7' AS seccion,
  '' AS detalle

UNION ALL
SELECT '---', '---'

UNION ALL
SELECT 
  '✅ Tablas creadas',
  (SELECT COUNT(*)::text FROM pg_tables 
   WHERE tablename IN ('user_devices_727b50c3', 'family_invitations_727b50c3', 'notifications_727b50c3'))

UNION ALL
SELECT 
  '✅ Índices creados',
  (SELECT COUNT(*)::text FROM pg_indexes 
   WHERE tablename IN ('user_devices_727b50c3', 'family_invitations_727b50c3', 'notifications_727b50c3'))

UNION ALL
SELECT 
  '✅ Políticas RLS',
  (SELECT COUNT(*)::text FROM pg_policies 
   WHERE tablename IN ('user_devices_727b50c3', 'family_invitations_727b50c3', 'notifications_727b50c3'))

UNION ALL
SELECT 
  '✅ Triggers',
  (SELECT COUNT(*)::text FROM information_schema.triggers 
   WHERE event_object_table IN ('user_devices_727b50c3', 'family_invitations_727b50c3', 'notifications_727b50c3'))

UNION ALL
SELECT 
  '✅ Funciones',
  (SELECT COUNT(*)::text FROM information_schema.routines 
   WHERE routine_name IN ('get_active_devices', 'get_unread_notifications', 'get_pending_invitations', 'update_updated_at_column', 'expire_old_invitations'))

UNION ALL
SELECT 
  '✅ Vistas',
  (SELECT COUNT(*)::text FROM information_schema.views 
   WHERE table_name IN ('v_group_invitations_summary', 'v_device_stats', 'v_notification_stats'));

-- =====================================================
-- 12. PRUEBAS BÁSICAS
-- =====================================================

-- Probar que las vistas funcionan (deben retornar vacío inicialmente)
SELECT 'Vista v_device_stats' AS prueba, COUNT(*) AS filas FROM v_device_stats;
SELECT 'Vista v_group_invitations_summary' AS prueba, COUNT(*) AS filas FROM v_group_invitations_summary;
SELECT 'Vista v_notification_stats' AS prueba, COUNT(*) AS filas FROM v_notification_stats;

-- =====================================================
-- ✅ VERIFICACIÓN COMPLETADA
-- =====================================================
-- Si todos los checks están en ✅ PASS, el Script 7 se ejecutó correctamente.
-- Próximo paso: Actualizar el backend para usar estas tablas.
-- =====================================================
