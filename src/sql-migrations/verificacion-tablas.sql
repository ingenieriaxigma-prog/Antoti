-- =====================================================
-- VERIFICACIÓN COMPLETA DE TABLAS Y ESTRUCTURA
-- =====================================================
-- Ejecuta este script para verificar que todas las tablas
-- estén correctamente creadas y configuradas.
-- =====================================================

-- =====================================================
-- 1. LISTAR TODAS LAS TABLAS DE OTI
-- =====================================================

SELECT 
  tablename AS tabla,
  CASE 
    WHEN tablename LIKE '%transactions%' THEN '💸 Transacciones'
    WHEN tablename LIKE '%accounts%' THEN '🏦 Cuentas'
    WHEN tablename LIKE '%categories%' THEN '📁 Categorías'
    WHEN tablename LIKE '%budgets%' THEN '💰 Presupuestos'
    WHEN tablename LIKE '%groups%' THEN '👥 Grupos'
    WHEN tablename LIKE '%chat%' THEN '💬 Chat'
    WHEN tablename LIKE '%kv_store%' THEN '🗄️ Key-Value Store'
    ELSE '📊 Otros'
  END AS tipo,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS tamano
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE '%727b50c3%'
ORDER BY 
  CASE 
    WHEN tablename LIKE '%chat%' THEN 1
    WHEN tablename LIKE '%transactions%' THEN 2
    WHEN tablename LIKE '%accounts%' THEN 3
    WHEN tablename LIKE '%categories%' THEN 4
    WHEN tablename LIKE '%budgets%' THEN 5
    WHEN tablename LIKE '%groups%' THEN 6
    ELSE 99
  END,
  tablename;

-- =====================================================
-- 2. VERIFICAR TABLAS DE CHAT (Script 5)
-- =====================================================

-- Chat Conversations
SELECT 
  'chat_conversations_727b50c3' AS tabla,
  COUNT(*) AS total_registros,
  COUNT(DISTINCT user_id) AS usuarios_unicos,
  MIN(created_at) AS primer_registro,
  MAX(created_at) AS ultimo_registro
FROM chat_conversations_727b50c3;

-- Chat Messages
SELECT 
  'chat_messages_727b50c3' AS tabla,
  COUNT(*) AS total_mensajes,
  COUNT(DISTINCT conversation_id) AS conversaciones_con_mensajes,
  COUNT(DISTINCT role) AS roles_diferentes,
  SUM(tokens_used) AS total_tokens_usados
FROM chat_messages_727b50c3;

-- Distribución de roles en mensajes
SELECT 
  role,
  COUNT(*) AS cantidad,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER(), 2) AS porcentaje
FROM chat_messages_727b50c3
GROUP BY role
ORDER BY cantidad DESC;

-- =====================================================
-- 3. VERIFICAR COLUMNAS DE TABLAS DE CHAT
-- =====================================================

-- Columnas de chat_conversations_727b50c3
SELECT 
  column_name AS columna,
  data_type AS tipo,
  is_nullable AS nullable,
  column_default AS valor_default
FROM information_schema.columns
WHERE table_name = 'chat_conversations_727b50c3'
ORDER BY ordinal_position;

-- Columnas de chat_messages_727b50c3
SELECT 
  column_name AS columna,
  data_type AS tipo,
  is_nullable AS nullable,
  column_default AS valor_default
FROM information_schema.columns
WHERE table_name = 'chat_messages_727b50c3'
ORDER BY ordinal_position;

-- =====================================================
-- 4. VERIFICAR ÍNDICES
-- =====================================================

-- Índices de tablas de chat
SELECT 
  tablename AS tabla,
  indexname AS indice,
  indexdef AS definicion
FROM pg_indexes
WHERE tablename IN ('chat_conversations_727b50c3', 'chat_messages_727b50c3')
ORDER BY tablename, indexname;

-- Contar índices por tabla
SELECT 
  tablename AS tabla,
  COUNT(*) AS total_indices
FROM pg_indexes
WHERE tablename LIKE '%chat%727b50c3%'
GROUP BY tablename;

-- =====================================================
-- 5. VERIFICAR TRIGGERS
-- =====================================================

-- Triggers en tablas de chat
SELECT 
  event_object_table AS tabla,
  trigger_name AS trigger,
  event_manipulation AS evento,
  action_timing AS cuando,
  action_statement AS funcion
FROM information_schema.triggers
WHERE event_object_table IN ('chat_conversations_727b50c3', 'chat_messages_727b50c3')
ORDER BY event_object_table, trigger_name;

-- =====================================================
-- 6. VERIFICAR POLÍTICAS RLS
-- =====================================================

-- Verificar que RLS está habilitado
SELECT 
  tablename AS tabla,
  rowsecurity AS rls_habilitado
FROM pg_tables
WHERE tablename IN ('chat_conversations_727b50c3', 'chat_messages_727b50c3');

-- Políticas de chat_conversations
SELECT 
  tablename AS tabla,
  policyname AS politica,
  cmd AS comando,
  roles AS roles
FROM pg_policies
WHERE tablename = 'chat_conversations_727b50c3'
ORDER BY cmd;

-- Políticas de chat_messages
SELECT 
  tablename AS tabla,
  policyname AS politica,
  cmd AS comando,
  roles AS roles
FROM pg_policies
WHERE tablename = 'chat_messages_727b50c3'
ORDER BY cmd;

-- Contar políticas por tabla
SELECT 
  tablename AS tabla,
  COUNT(*) AS total_politicas
FROM pg_policies
WHERE tablename LIKE '%chat%727b50c3%'
GROUP BY tablename;

-- =====================================================
-- 7. VERIFICAR FOREIGN KEYS
-- =====================================================

-- Foreign keys en chat_messages (debe apuntar a chat_conversations)
SELECT
  tc.table_name AS tabla,
  kcu.column_name AS columna,
  ccu.table_name AS tabla_referenciada,
  ccu.column_name AS columna_referenciada,
  rc.update_rule AS on_update,
  rc.delete_rule AS on_delete
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name LIKE '%chat%727b50c3%'
ORDER BY tc.table_name, kcu.column_name;

-- =====================================================
-- 8. VERIFICAR VISTAS
-- =====================================================

-- Listar vistas de chat
SELECT 
  table_name AS vista,
  view_definition AS definicion
FROM information_schema.views
WHERE table_name LIKE '%chat%'
  AND table_schema = 'public';

-- =====================================================
-- 9. VERIFICAR FUNCIONES
-- =====================================================

-- Funciones relacionadas con chat
SELECT 
  routine_name AS funcion,
  routine_type AS tipo,
  data_type AS tipo_retorno
FROM information_schema.routines
WHERE routine_name LIKE '%chat%'
  AND routine_schema = 'public'
ORDER BY routine_name;

-- =====================================================
-- 10. RESUMEN GENERAL
-- =====================================================

-- Tabla resumen de la estructura
SELECT 
  '📊 Total de tablas Oti' AS descripcion,
  COUNT(*) AS valor
FROM pg_tables
WHERE tablename LIKE '%727b50c3%'

UNION ALL

SELECT 
  '💬 Tablas de Chat' AS descripcion,
  COUNT(*) AS valor
FROM pg_tables
WHERE tablename LIKE '%chat%727b50c3%'

UNION ALL

SELECT 
  '🔐 Políticas RLS (Chat)' AS descripcion,
  COUNT(*) AS valor
FROM pg_policies
WHERE tablename LIKE '%chat%727b50c3%'

UNION ALL

SELECT 
  '⚡ Triggers (Chat)' AS descripcion,
  COUNT(*) AS valor
FROM information_schema.triggers
WHERE event_object_table LIKE '%chat%727b50c3%'

UNION ALL

SELECT 
  '📇 Índices (Chat)' AS descripcion,
  COUNT(*) AS valor
FROM pg_indexes
WHERE tablename LIKE '%chat%727b50c3%'

UNION ALL

SELECT 
  '🔗 Foreign Keys (Chat)' AS descripcion,
  COUNT(*) AS valor
FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY'
  AND table_name LIKE '%chat%727b50c3%';

-- =====================================================
-- 11. HEALTH CHECK FINAL
-- =====================================================

-- Verificación de integridad
WITH tabla_checks AS (
  SELECT 
    'chat_conversations_727b50c3' AS tabla,
    EXISTS(SELECT 1 FROM pg_tables WHERE tablename = 'chat_conversations_727b50c3') AS existe
  UNION ALL
  SELECT 
    'chat_messages_727b50c3' AS tabla,
    EXISTS(SELECT 1 FROM pg_tables WHERE tablename = 'chat_messages_727b50c3') AS existe
),
rls_checks AS (
  SELECT 
    'RLS en conversations' AS check_name,
    EXISTS(
      SELECT 1 FROM pg_tables 
      WHERE tablename = 'chat_conversations_727b50c3' 
        AND rowsecurity = true
    ) AS ok
  UNION ALL
  SELECT 
    'RLS en messages' AS check_name,
    EXISTS(
      SELECT 1 FROM pg_tables 
      WHERE tablename = 'chat_messages_727b50c3' 
        AND rowsecurity = true
    ) AS ok
),
trigger_checks AS (
  SELECT 
    'Trigger update timestamp' AS check_name,
    EXISTS(
      SELECT 1 FROM information_schema.triggers
      WHERE trigger_name = 'trigger_update_chat_conversation_timestamp'
    ) AS ok
  UNION ALL
  SELECT 
    'Trigger new message' AS check_name,
    EXISTS(
      SELECT 1 FROM information_schema.triggers
      WHERE trigger_name = 'trigger_update_conversation_on_new_message'
    ) AS ok
  UNION ALL
  SELECT 
    'Trigger delete message' AS check_name,
    EXISTS(
      SELECT 1 FROM information_schema.triggers
      WHERE trigger_name = 'trigger_update_conversation_on_delete_message'
    ) AS ok
),
policy_checks AS (
  SELECT 
    'Políticas conversations (4)' AS check_name,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'chat_conversations_727b50c3') = 4 AS ok
  UNION ALL
  SELECT 
    'Políticas messages (4)' AS check_name,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'chat_messages_727b50c3') = 4 AS ok
)

SELECT 
  check_name AS verificacion,
  CASE WHEN ok THEN '✅ PASS' ELSE '❌ FAIL' END AS estado
FROM (
  SELECT tabla AS check_name, existe AS ok FROM tabla_checks
  UNION ALL
  SELECT * FROM rls_checks
  UNION ALL
  SELECT * FROM trigger_checks
  UNION ALL
  SELECT * FROM policy_checks
) all_checks
ORDER BY 
  CASE WHEN ok THEN 2 ELSE 1 END, 
  check_name;

-- =====================================================
-- 12. COMPARACIÓN CON OTRAS TABLAS
-- =====================================================

-- Ver todas las tablas y su número de registros
SELECT 
  tablename AS tabla,
  (xpath('/row/cnt/text()', 
    query_to_xml(format('SELECT COUNT(*) AS cnt FROM %I', tablename), 
    false, true, '')))[1]::text::int AS registros
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE '%727b50c3%'
ORDER BY registros DESC;
