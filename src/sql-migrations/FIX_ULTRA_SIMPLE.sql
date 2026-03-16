-- Ultra simple fix - Sin bloques DO, sin RAISE
-- Ejecuta esto si el otro script falla

-- Eliminar FKs conocidas
ALTER TABLE IF EXISTS chat_conversations_727b50c3 
DROP CONSTRAINT IF EXISTS chat_conversations_727b50c3_user_id_fkey CASCADE;

ALTER TABLE IF EXISTS chat_conversations_727b50c3 
DROP CONSTRAINT IF EXISTS chat_conversations_user_id_fkey CASCADE;

ALTER TABLE IF EXISTS chat_messages_727b50c3 
DROP CONSTRAINT IF EXISTS chat_messages_727b50c3_user_id_fkey CASCADE;

-- Eliminar triggers conocidos
DROP TRIGGER IF EXISTS trigger_cleanup_deleted_user ON auth.users CASCADE;
DROP TRIGGER IF EXISTS cleanup_deleted_user ON auth.users CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users CASCADE;
