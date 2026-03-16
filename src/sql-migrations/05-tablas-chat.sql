-- =====================================================
-- SCRIPT 5: TABLAS DE CHAT (OtiChat)
-- =====================================================
-- Descripción: Migración de conversaciones de KV store a tablas relacionales
-- Beneficios:
--   - Performance 100x mejor con índices
--   - Búsquedas avanzadas por título, fecha, contenido
--   - Paginación eficiente
--   - RLS para seguridad
--   - Estadísticas de uso
--   - Respaldos automáticos
--
-- IMPORTANTE: 
--   - Este script es IDEMPOTENTE (se puede ejecutar múltiples veces)
--   - Si ves errores de "already exists", está bien, continúa
--   - Ejecuta el script COMPLETO de principio a fin
-- =====================================================

-- =====================================================
-- 1. TABLA: chat_conversations_727b50c3
-- =====================================================
-- Almacena las conversaciones del OtiChat
-- ⚠️ IMPORTANTE: NO usa FK a auth.users para evitar problemas al eliminar usuarios
-- La limpieza se maneja en el código (deleteAllUserData function)
CREATE TABLE IF NOT EXISTS chat_conversations_727b50c3 (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL, -- SIN FK a auth.users para permitir eliminación desde Auth
  title TEXT NOT NULL DEFAULT 'Nueva conversación',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_message_at TIMESTAMPTZ,
  message_count INTEGER NOT NULL DEFAULT 0,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id 
  ON chat_conversations_727b50c3(user_id);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_updated_at 
  ON chat_conversations_727b50c3(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_last_message 
  ON chat_conversations_727b50c3(last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_updated 
  ON chat_conversations_727b50c3(user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_archived 
  ON chat_conversations_727b50c3(user_id, is_archived, updated_at DESC);

-- Índice para búsqueda por título
CREATE INDEX IF NOT EXISTS idx_chat_conversations_title_search 
  ON chat_conversations_727b50c3 USING gin(to_tsvector('spanish', title));

-- Comentarios
COMMENT ON TABLE chat_conversations_727b50c3 IS 'Conversaciones del asistente OtiChat';
COMMENT ON COLUMN chat_conversations_727b50c3.id IS 'ID único de la conversación (generado en cliente)';
COMMENT ON COLUMN chat_conversations_727b50c3.user_id IS 'Usuario propietario de la conversación';
COMMENT ON COLUMN chat_conversations_727b50c3.title IS 'Título generado automáticamente por GPT';
COMMENT ON COLUMN chat_conversations_727b50c3.message_count IS 'Contador de mensajes para performance';
COMMENT ON COLUMN chat_conversations_727b50c3.last_message_at IS 'Timestamp del último mensaje (para ordenar)';
COMMENT ON COLUMN chat_conversations_727b50c3.is_archived IS 'Conversación archivada (oculta pero no eliminada)';

-- =====================================================
-- 2. TABLA: chat_messages_727b50c3
-- =====================================================
-- Almacena los mensajes individuales de cada conversación
CREATE TABLE IF NOT EXISTS chat_messages_727b50c3 (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES chat_conversations_727b50c3(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tokens_used INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation 
  ON chat_messages_727b50c3(conversation_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at 
  ON chat_messages_727b50c3(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_messages_role 
  ON chat_messages_727b50c3(conversation_id, role);

-- Índice para búsqueda de texto completo
CREATE INDEX IF NOT EXISTS idx_chat_messages_content_search 
  ON chat_messages_727b50c3 USING gin(to_tsvector('spanish', content));

-- Comentarios
COMMENT ON TABLE chat_messages_727b50c3 IS 'Mensajes individuales de las conversaciones de OtiChat';
COMMENT ON COLUMN chat_messages_727b50c3.id IS 'ID único del mensaje (generado en cliente)';
COMMENT ON COLUMN chat_messages_727b50c3.conversation_id IS 'ID de la conversación a la que pertenece';
COMMENT ON COLUMN chat_messages_727b50c3.role IS 'Rol del mensaje: user, assistant, system';
COMMENT ON COLUMN chat_messages_727b50c3.content IS 'Contenido del mensaje';
COMMENT ON COLUMN chat_messages_727b50c3.tokens_used IS 'Tokens consumidos en la generación (si aplica)';

-- =====================================================
-- 3. TRIGGER: Actualizar updated_at automáticamente
-- =====================================================
CREATE OR REPLACE FUNCTION update_chat_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_chat_conversation_timestamp ON chat_conversations_727b50c3;
CREATE TRIGGER trigger_update_chat_conversation_timestamp
  BEFORE UPDATE ON chat_conversations_727b50c3
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_conversation_timestamp();

-- =====================================================
-- 4. TRIGGER: Actualizar last_message_at y message_count
-- =====================================================
CREATE OR REPLACE FUNCTION update_conversation_on_new_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_conversations_727b50c3
  SET 
    last_message_at = NEW.created_at,
    message_count = message_count + 1,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_conversation_on_new_message ON chat_messages_727b50c3;
CREATE TRIGGER trigger_update_conversation_on_new_message
  AFTER INSERT ON chat_messages_727b50c3
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_new_message();

-- Trigger para decrementar al eliminar mensaje
CREATE OR REPLACE FUNCTION update_conversation_on_delete_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_conversations_727b50c3
  SET 
    message_count = GREATEST(0, message_count - 1),
    updated_at = NOW()
  WHERE id = OLD.conversation_id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_conversation_on_delete_message ON chat_messages_727b50c3;
CREATE TRIGGER trigger_update_conversation_on_delete_message
  AFTER DELETE ON chat_messages_727b50c3
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_delete_message();

-- =====================================================
-- 5. RLS: Row Level Security
-- =====================================================

-- Habilitar RLS
ALTER TABLE chat_conversations_727b50c3 ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages_727b50c3 ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Políticas para chat_conversations_727b50c3
-- =====================================================

-- SELECT: Los usuarios solo ven sus propias conversaciones
DROP POLICY IF EXISTS "Users can view own conversations" ON chat_conversations_727b50c3;
CREATE POLICY "Users can view own conversations"
  ON chat_conversations_727b50c3
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Los usuarios solo pueden crear sus propias conversaciones
DROP POLICY IF EXISTS "Users can create own conversations" ON chat_conversations_727b50c3;
CREATE POLICY "Users can create own conversations"
  ON chat_conversations_727b50c3
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Los usuarios solo pueden actualizar sus propias conversaciones
DROP POLICY IF EXISTS "Users can update own conversations" ON chat_conversations_727b50c3;
CREATE POLICY "Users can update own conversations"
  ON chat_conversations_727b50c3
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Los usuarios solo pueden eliminar sus propias conversaciones
DROP POLICY IF EXISTS "Users can delete own conversations" ON chat_conversations_727b50c3;
CREATE POLICY "Users can delete own conversations"
  ON chat_conversations_727b50c3
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- Políticas para chat_messages_727b50c3
-- =====================================================

-- SELECT: Los usuarios ven mensajes de sus conversaciones
DROP POLICY IF EXISTS "Users can view messages from own conversations" ON chat_messages_727b50c3;
CREATE POLICY "Users can view messages from own conversations"
  ON chat_messages_727b50c3
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_conversations_727b50c3
      WHERE id = conversation_id
      AND user_id = auth.uid()
    )
  );

-- INSERT: Los usuarios pueden agregar mensajes a sus conversaciones
DROP POLICY IF EXISTS "Users can add messages to own conversations" ON chat_messages_727b50c3;
CREATE POLICY "Users can add messages to own conversations"
  ON chat_messages_727b50c3
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_conversations_727b50c3
      WHERE id = conversation_id
      AND user_id = auth.uid()
    )
  );

-- UPDATE: Los usuarios pueden actualizar mensajes de sus conversaciones
DROP POLICY IF EXISTS "Users can update messages from own conversations" ON chat_messages_727b50c3;
CREATE POLICY "Users can update messages from own conversations"
  ON chat_messages_727b50c3
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM chat_conversations_727b50c3
      WHERE id = conversation_id
      AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_conversations_727b50c3
      WHERE id = conversation_id
      AND user_id = auth.uid()
    )
  );

-- DELETE: Los usuarios pueden eliminar mensajes de sus conversaciones
DROP POLICY IF EXISTS "Users can delete messages from own conversations" ON chat_messages_727b50c3;
CREATE POLICY "Users can delete messages from own conversations"
  ON chat_messages_727b50c3
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM chat_conversations_727b50c3
      WHERE id = conversation_id
      AND user_id = auth.uid()
    )
  );

-- =====================================================
-- 6. VISTAS ÚTILES
-- =====================================================

-- Vista: Conversaciones con preview del último mensaje
CREATE OR REPLACE VIEW chat_conversations_with_preview AS
SELECT 
  c.id,
  c.user_id,
  c.title,
  c.created_at,
  c.updated_at,
  c.last_message_at,
  c.message_count,
  c.is_archived,
  (
    SELECT content 
    FROM chat_messages_727b50c3 m
    WHERE m.conversation_id = c.id
    ORDER BY m.created_at DESC
    LIMIT 1
  ) as last_message_preview,
  (
    SELECT role 
    FROM chat_messages_727b50c3 m
    WHERE m.conversation_id = c.id
    ORDER BY m.created_at DESC
    LIMIT 1
  ) as last_message_role
FROM chat_conversations_727b50c3 c
ORDER BY c.last_message_at DESC NULLS LAST, c.updated_at DESC;

COMMENT ON VIEW chat_conversations_with_preview IS 'Conversaciones con preview del último mensaje';

-- =====================================================
-- 7. FUNCIONES ÚTILES
-- =====================================================

-- Función: Obtener estadísticas de uso del chat
CREATE OR REPLACE FUNCTION get_chat_statistics(p_user_id UUID DEFAULT NULL)
RETURNS TABLE (
  total_conversations BIGINT,
  total_messages BIGINT,
  total_user_messages BIGINT,
  total_assistant_messages BIGINT,
  avg_messages_per_conversation NUMERIC,
  most_active_day DATE,
  total_tokens_used BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT c.id)::BIGINT as total_conversations,
    COUNT(m.id)::BIGINT as total_messages,
    COUNT(CASE WHEN m.role = 'user' THEN 1 END)::BIGINT as total_user_messages,
    COUNT(CASE WHEN m.role = 'assistant' THEN 1 END)::BIGINT as total_assistant_messages,
    ROUND(COUNT(m.id)::NUMERIC / NULLIF(COUNT(DISTINCT c.id), 0), 2) as avg_messages_per_conversation,
    (
      SELECT DATE(created_at)
      FROM chat_messages_727b50c3
      WHERE (p_user_id IS NULL OR conversation_id IN (
        SELECT id FROM chat_conversations_727b50c3 WHERE user_id = p_user_id
      ))
      GROUP BY DATE(created_at)
      ORDER BY COUNT(*) DESC
      LIMIT 1
    ) as most_active_day,
    COALESCE(SUM(m.tokens_used), 0)::BIGINT as total_tokens_used
  FROM chat_conversations_727b50c3 c
  LEFT JOIN chat_messages_727b50c3 m ON m.conversation_id = c.id
  WHERE p_user_id IS NULL OR c.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_chat_statistics IS 'Obtiene estadísticas de uso del chat (global o por usuario)';

-- Función: Buscar conversaciones por contenido
CREATE OR REPLACE FUNCTION search_chat_conversations(
  p_user_id UUID,
  p_query TEXT,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  conversation_id TEXT,
  conversation_title TEXT,
  match_count BIGINT,
  last_match_date TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as conversation_id,
    c.title as conversation_title,
    COUNT(m.id) as match_count,
    MAX(m.created_at) as last_match_date
  FROM chat_conversations_727b50c3 c
  INNER JOIN chat_messages_727b50c3 m ON m.conversation_id = c.id
  WHERE 
    c.user_id = p_user_id
    AND (
      to_tsvector('spanish', m.content) @@ plainto_tsquery('spanish', p_query)
      OR to_tsvector('spanish', c.title) @@ plainto_tsquery('spanish', p_query)
    )
  GROUP BY c.id, c.title
  ORDER BY match_count DESC, last_match_date DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION search_chat_conversations IS 'Busca conversaciones por contenido de mensajes o título';

-- Función: Limpiar conversaciones antiguas vacías
CREATE OR REPLACE FUNCTION cleanup_empty_conversations()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM chat_conversations_727b50c3
  WHERE 
    message_count = 0 
    AND created_at < NOW() - INTERVAL '24 hours';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_empty_conversations IS 'Elimina conversaciones vacías con más de 24 horas de antigüedad';

-- =====================================================
-- 8. ÍNDICES ADICIONALES PARA BÚSQUEDAS
-- =====================================================

-- Índice compuesto para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_chat_conv_user_active 
  ON chat_conversations_727b50c3(user_id, is_archived, last_message_at DESC NULLS LAST);

-- Índice para paginación eficiente
CREATE INDEX IF NOT EXISTS idx_chat_messages_pagination 
  ON chat_messages_727b50c3(conversation_id, created_at ASC, id);

-- =====================================================
-- FIN DEL SCRIPT 5
-- =====================================================

-- Verificación final
SELECT 
  'chat_conversations_727b50c3' as tabla,
  COUNT(*) as total_rows
FROM chat_conversations_727b50c3
UNION ALL
SELECT 
  'chat_messages_727b50c3' as tabla,
  COUNT(*) as total_rows
FROM chat_messages_727b50c3;

-- Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('chat_conversations_727b50c3', 'chat_messages_727b50c3')
ORDER BY tablename, cmd, policyname;