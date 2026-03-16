-- =====================================================
-- SCRIPT 6: LIMPIEZA DE KV_STORE (Datos Migrados)
-- =====================================================
-- Descripción: Limpia datos obsoletos del KV store que ya fueron migrados
-- Tabla afectada: kv_store_727b50c3
--
-- ⚠️ IMPORTANTE: 
--   - Este script ELIMINA datos de prueba del KV store
--   - Solo ejecuta este script si ya ejecutaste el Script 5
--   - Solo elimina datos de chat (conversation:*)
--   - Mantiene datos que aún se usan (device info, invitaciones)
-- =====================================================

-- =====================================================
-- 1. VERIFICAR QUÉ HAY EN KV_STORE
-- =====================================================

-- Ver un resumen de los tipos de datos en KV store
SELECT 
  CASE 
    WHEN key LIKE 'conversation:%' THEN 'CHAT - Conversaciones (OBSOLETO)'
    WHEN key LIKE 'user:%:device' THEN 'Device Info (SE USA)'
    WHEN key LIKE 'family_invitation:%' THEN 'Invitaciones Familiares (SE USA)'
    WHEN key LIKE 'family_notification:%' THEN 'Notificaciones (SE USA)'
    WHEN key LIKE 'family_request:%' THEN 'Solicitudes Familiares (SE USA)'
    WHEN key LIKE 'users_data' THEN 'Datos de usuarios (REVISAR)'
    WHEN key LIKE 'recent_group_transactions%' THEN 'Cache transacciones (REVISAR)'
    WHEN key LIKE 'subcategories%' THEN 'Cache subcategorías (REVISAR)'
    ELSE CONCAT('OTRO: ', SUBSTRING(key, 1, 50))
  END AS tipo_dato,
  COUNT(*) AS cantidad,
  SUM(LENGTH(value::text)) / 1024 AS tamano_kb
FROM kv_store_727b50c3
GROUP BY tipo_dato
ORDER BY cantidad DESC;

-- =====================================================
-- 2. VER EJEMPLOS DE DATOS DE CHAT (Para confirmar)
-- =====================================================

-- Ver las primeras 10 conversaciones de chat
SELECT 
  key,
  LEFT(value::text, 100) AS preview,
  LENGTH(value::text) AS size_bytes
FROM kv_store_727b50c3
WHERE key LIKE 'conversation:%'
ORDER BY key
LIMIT 10;

-- Contar total de conversaciones
SELECT COUNT(*) AS total_conversaciones_chat
FROM kv_store_727b50c3
WHERE key LIKE 'conversation:%';

-- =====================================================
-- 3. LIMPIEZA: ELIMINAR CONVERSACIONES DE CHAT
-- =====================================================

-- ⚠️ CUIDADO: Esto elimina TODOS los datos de chat del KV store
-- Solo ejecuta esto si:
--   1. Ya ejecutaste el Script 5 (tablas chat_conversations y chat_messages)
--   2. El código backend ya usa las nuevas tablas
--   3. NO quieres conservar estos datos de prueba

-- COMENTADO POR SEGURIDAD - Descomenta para ejecutar:
/*
DELETE FROM kv_store_727b50c3
WHERE key LIKE 'conversation:%';
*/

-- Ver cuántos registros se eliminarían
SELECT 
  COUNT(*) AS registros_a_eliminar,
  SUM(LENGTH(value::text)) / 1024 AS kb_a_liberar
FROM kv_store_727b50c3
WHERE key LIKE 'conversation:%';

-- =====================================================
-- 4. VERIFICACIÓN POST-LIMPIEZA
-- =====================================================

-- Después de ejecutar el DELETE, verifica que:
-- 1. No hay más conversaciones en KV store
-- 2. Los datos que se usan siguen ahí

-- Verificar que no hay conversaciones
SELECT COUNT(*) AS conversaciones_restantes
FROM kv_store_727b50c3
WHERE key LIKE 'conversation:%';

-- Verificar que los datos importantes siguen ahí
SELECT 
  CASE 
    WHEN key LIKE 'user:%:device' THEN 'Device Info'
    WHEN key LIKE 'family_invitation:%' THEN 'Invitaciones Familiares'
    WHEN key LIKE 'family_notification:%' THEN 'Notificaciones'
    ELSE 'Otros datos'
  END AS tipo_dato,
  COUNT(*) AS cantidad
FROM kv_store_727b50c3
WHERE key NOT LIKE 'conversation:%'
GROUP BY tipo_dato;

-- =====================================================
-- 5. RESUMEN DE KV_STORE DESPUÉS DE LIMPIEZA
-- =====================================================

-- Tabla resumen final
SELECT 
  'Total de registros' AS descripcion,
  COUNT(*) AS valor
FROM kv_store_727b50c3

UNION ALL

SELECT 
  'Tamaño total (KB)' AS descripcion,
  ROUND(SUM(LENGTH(value::text)) / 1024.0, 2) AS valor
FROM kv_store_727b50c3

UNION ALL

SELECT 
  'Conversaciones chat' AS descripcion,
  COUNT(*) AS valor
FROM kv_store_727b50c3
WHERE key LIKE 'conversation:%';

-- =====================================================
-- 6. DATOS QUE SE SIGUEN USANDO EN KV_STORE
-- =====================================================

/*
  📌 IMPORTANTE: NO elimines estos datos del KV store:

  1. user:{userId}:device
     - Info del dispositivo del usuario
     - Usado en: /signup, /get-data
     - Endpoints: make-server-727b50c3/signup
  
  2. family_invitation:{groupId}:{invitationId}
     - Invitaciones pendientes a grupos familiares
     - Usado en: /family-invite, /family-accept-invitation, etc.
     - Endpoints: make-server-727b50c3/family-*
  
  3. family_notification:{groupId}:{notificationId}
     - Notificaciones del sistema familiar
     - Usado en: Family endpoints
  
  4. Otros datos:
     - users_data: Posible cache de usuarios
     - recent_group_transactions: Cache de transacciones
     - subcategories: Cache de subcategorías

  🔄 FUTURAS MIGRACIONES:
     - Las invitaciones familiares podrían migrar a tablas
     - Las notificaciones podrían migrar a tablas
     - Por ahora se mantienen en KV store
*/

-- =====================================================
-- 7. OPCIONAL: LIMPIEZA DE OTROS DATOS OBSOLETOS
-- =====================================================

-- Si tienes otros datos que ya no se usan, agrégalos aquí:
/*
-- Ejemplo: Limpiar cache viejo
DELETE FROM kv_store_727b50c3
WHERE key LIKE 'old_cache:%'
  AND created_at < NOW() - INTERVAL '30 days';
*/
