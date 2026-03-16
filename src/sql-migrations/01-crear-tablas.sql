-- ========================================
-- PARTE 1: CREAR TABLAS NUEVAS
-- ========================================
-- Ejecutar PRIMERO - Crea tablas de invitaciones y notificaciones

-- 1. Tabla de Invitaciones Familiares
CREATE TABLE IF NOT EXISTS family_invitations_727b50c3 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES family_groups_727b50c3(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  invited_by TEXT NOT NULL,
  invited_by_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  accepted_by TEXT
);

-- Índices para invitaciones
CREATE INDEX IF NOT EXISTS idx_invitations_email ON family_invitations_727b50c3(email);
CREATE INDEX IF NOT EXISTS idx_invitations_code ON family_invitations_727b50c3(code);
CREATE INDEX IF NOT EXISTS idx_invitations_group ON family_invitations_727b50c3(group_id);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON family_invitations_727b50c3(status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_invitations_expires ON family_invitations_727b50c3(expires_at) WHERE status = 'pending';

-- 2. Tabla de Notificaciones
CREATE TABLE IF NOT EXISTS family_notifications_727b50c3 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  group_id UUID REFERENCES family_groups_727b50c3(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  data JSONB,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  
  CONSTRAINT read_has_timestamp CHECK (
    (read = TRUE AND read_at IS NOT NULL) OR
    (read = FALSE AND read_at IS NULL)
  )
);

-- Índices para notificaciones
CREATE INDEX IF NOT EXISTS idx_notifications_user ON family_notifications_727b50c3(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_group ON family_notifications_727b50c3(group_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON family_notifications_727b50c3(user_id, created_at DESC) WHERE read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_type ON family_notifications_727b50c3(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON family_notifications_727b50c3(created_at DESC);

-- Verificación
SELECT 'family_invitations_727b50c3' as tabla, COUNT(*) as registros FROM family_invitations_727b50c3
UNION ALL
SELECT 'family_notifications_727b50c3', COUNT(*) FROM family_notifications_727b50c3;

-- Mostrar índices creados
SELECT 
  tablename,
  indexname
FROM pg_indexes
WHERE tablename IN ('family_invitations_727b50c3', 'family_notifications_727b50c3')
ORDER BY tablename, indexname;
