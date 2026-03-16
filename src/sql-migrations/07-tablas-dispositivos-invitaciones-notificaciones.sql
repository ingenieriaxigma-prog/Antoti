-- =====================================================
-- SCRIPT 7: MIGRACIÓN DE DATOS KV A TABLAS
-- =====================================================
-- Descripción: Crea tablas para Device Info, Invitaciones y Notificaciones
-- Prioridad: ALTA (Mejora arquitectura y permite queries complejas)
--
-- Tablas a crear:
--   1. user_devices_727b50c3 (Device Info)
--   2. family_invitations_727b50c3 (Invitaciones)
--   3. notifications_727b50c3 (Notificaciones)
--
-- ⚠️ IMPORTANTE: Ejecuta este script COMPLETO en Supabase SQL Editor
-- =====================================================

BEGIN;

-- =====================================================
-- 1. TABLA: USER DEVICES
-- =====================================================
-- Reemplaza: user:{userId}:device en KV store
-- Beneficios: Historial, queries, analytics

DROP TABLE IF EXISTS user_devices_727b50c3 CASCADE;

CREATE TABLE user_devices_727b50c3 (
  -- Identificación
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Información del dispositivo
  device_id TEXT NOT NULL, -- Identificador único del dispositivo
  device_name TEXT,
  device_model TEXT,
  device_brand TEXT,
  
  -- Sistema operativo
  os_name TEXT,
  os_version TEXT,
  
  -- App info
  app_version TEXT,
  
  -- Ubicación (opcional)
  ip_address TEXT,
  country TEXT,
  city TEXT,
  
  -- Estado
  is_active BOOLEAN DEFAULT true,
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id, device_id)
);

-- Índices para performance
CREATE INDEX idx_user_devices_user_id ON user_devices_727b50c3(user_id);
CREATE INDEX idx_user_devices_last_seen ON user_devices_727b50c3(last_seen_at DESC);
CREATE INDEX idx_user_devices_active ON user_devices_727b50c3(is_active) WHERE is_active = true;
CREATE INDEX idx_user_devices_os ON user_devices_727b50c3(os_name, os_version);

-- Comentarios
COMMENT ON TABLE user_devices_727b50c3 IS 'Dispositivos registrados de usuarios (migrado de KV store)';
COMMENT ON COLUMN user_devices_727b50c3.device_id IS 'Identificador único del dispositivo (fingerprint)';
COMMENT ON COLUMN user_devices_727b50c3.last_seen_at IS 'Última vez que el dispositivo estuvo activo';

-- =====================================================
-- 2. TABLA: FAMILY INVITATIONS
-- =====================================================
-- Reemplaza: family_invitation:{groupId}:{invitationId} en KV store
-- Beneficios: Queries, historial, workflow completo

DROP TABLE IF EXISTS family_invitations_727b50c3 CASCADE;

CREATE TABLE family_invitations_727b50c3 (
  -- Identificación
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL,
  
  -- Quién invita
  invited_by UUID NOT NULL,
  invited_by_email TEXT,
  invited_by_name TEXT,
  
  -- A quién invita
  email TEXT NOT NULL,
  role TEXT DEFAULT 'member', -- admin, member, viewer
  
  -- Código de invitación
  code TEXT UNIQUE,
  
  -- Estado
  status TEXT DEFAULT 'pending', -- pending, accepted, rejected, expired, cancelled
  
  -- Workflow
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  accepted_by UUID,
  rejected_at TIMESTAMPTZ,
  rejected_by UUID,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  cancelled_at TIMESTAMPTZ,
  
  -- Metadata
  message TEXT, -- Mensaje personalizado del invitador
  
  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CHECK (status IN ('pending', 'accepted', 'rejected', 'expired', 'cancelled')),
  CHECK (role IN ('admin', 'member', 'viewer'))
);

-- Índices para performance
CREATE INDEX idx_family_invitations_group_id ON family_invitations_727b50c3(group_id);
CREATE INDEX idx_family_invitations_email ON family_invitations_727b50c3(email);
CREATE INDEX idx_family_invitations_invited_by ON family_invitations_727b50c3(invited_by);
CREATE INDEX idx_family_invitations_status ON family_invitations_727b50c3(status);
CREATE INDEX idx_family_invitations_code ON family_invitations_727b50c3(code) WHERE code IS NOT NULL;
CREATE INDEX idx_family_invitations_pending ON family_invitations_727b50c3(group_id, status) 
  WHERE status = 'pending';
CREATE INDEX idx_family_invitations_expires ON family_invitations_727b50c3(expires_at) 
  WHERE status = 'pending';

-- Comentarios
COMMENT ON TABLE family_invitations_727b50c3 IS 'Invitaciones a grupos familiares (migrado de KV store)';
COMMENT ON COLUMN family_invitations_727b50c3.code IS 'Código único para aceptar invitación sin email';
COMMENT ON COLUMN family_invitations_727b50c3.expires_at IS 'Fecha de expiración de la invitación';

-- =====================================================
-- 3. TABLA: NOTIFICATIONS
-- =====================================================
-- Reemplaza: family_notification:{groupId}:{notificationId} en KV store
-- Beneficios: Queries, filtros, historial completo

DROP TABLE IF EXISTS notifications_727b50c3 CASCADE;

CREATE TABLE notifications_727b50c3 (
  -- Identificación
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Destinatario
  user_id UUID NOT NULL,
  
  -- Contenido
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- invitation, transaction, budget, group, system
  
  -- Datos relacionados (para deep links)
  related_entity_type TEXT, -- group, transaction, budget, invitation
  related_entity_id UUID,
  
  -- Estado
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  is_archived BOOLEAN DEFAULT false,
  archived_at TIMESTAMPTZ,
  
  -- Prioridad
  priority TEXT DEFAULT 'normal', -- low, normal, high, urgent
  
  -- Metadata
  icon TEXT, -- emoji o nombre de icono
  action_url TEXT, -- deep link para la acción
  action_label TEXT, -- texto del botón de acción
  
  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CHECK (type IN ('invitation', 'transaction', 'budget', 'group', 'system', 'reminder', 'achievement')),
  CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
);

-- Índices para performance
CREATE INDEX idx_notifications_user_id ON notifications_727b50c3(user_id);
CREATE INDEX idx_notifications_created ON notifications_727b50c3(created_at DESC);
CREATE INDEX idx_notifications_type ON notifications_727b50c3(type);
CREATE INDEX idx_notifications_read ON notifications_727b50c3(user_id, is_read);
CREATE INDEX idx_notifications_unread ON notifications_727b50c3(user_id, created_at DESC) 
  WHERE is_read = false AND is_archived = false;
CREATE INDEX idx_notifications_priority ON notifications_727b50c3(user_id, priority, created_at DESC) 
  WHERE is_read = false;
CREATE INDEX idx_notifications_related ON notifications_727b50c3(related_entity_type, related_entity_id);

-- Comentarios
COMMENT ON TABLE notifications_727b50c3 IS 'Notificaciones de usuarios (migrado de KV store)';
COMMENT ON COLUMN notifications_727b50c3.related_entity_id IS 'ID de la entidad relacionada (para deep links)';
COMMENT ON COLUMN notifications_727b50c3.action_url IS 'Deep link a la pantalla relacionada';

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS
ALTER TABLE user_devices_727b50c3 ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_invitations_727b50c3 ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications_727b50c3 ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4.1 POLÍTICAS: USER DEVICES
-- =====================================================

-- Usuarios pueden ver sus propios dispositivos
DROP POLICY IF EXISTS user_devices_select_own ON user_devices_727b50c3;
CREATE POLICY user_devices_select_own ON user_devices_727b50c3
  FOR SELECT
  USING (auth.uid() = user_id);

-- Usuarios pueden registrar dispositivos
DROP POLICY IF EXISTS user_devices_insert_own ON user_devices_727b50c3;
CREATE POLICY user_devices_insert_own ON user_devices_727b50c3
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuarios pueden actualizar sus dispositivos
DROP POLICY IF EXISTS user_devices_update_own ON user_devices_727b50c3;
CREATE POLICY user_devices_update_own ON user_devices_727b50c3
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Usuarios pueden eliminar sus dispositivos
DROP POLICY IF EXISTS user_devices_delete_own ON user_devices_727b50c3;
CREATE POLICY user_devices_delete_own ON user_devices_727b50c3
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 4.2 POLÍTICAS: FAMILY INVITATIONS
-- =====================================================

-- Usuarios pueden ver invitaciones de sus grupos
DROP POLICY IF EXISTS family_invitations_select_group ON family_invitations_727b50c3;
CREATE POLICY family_invitations_select_group ON family_invitations_727b50c3
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members_727b50c3
      WHERE group_id = family_invitations_727b50c3.group_id
        AND user_id = auth.uid()
    )
  );

-- Usuarios pueden ver invitaciones enviadas a su email
DROP POLICY IF EXISTS family_invitations_select_own_email ON family_invitations_727b50c3;
CREATE POLICY family_invitations_select_own_email ON family_invitations_727b50c3
  FOR SELECT
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Admins pueden crear invitaciones
DROP POLICY IF EXISTS family_invitations_insert_admin ON family_invitations_727b50c3;
CREATE POLICY family_invitations_insert_admin ON family_invitations_727b50c3
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members_727b50c3
      WHERE group_id = family_invitations_727b50c3.group_id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
  );

-- Usuarios pueden actualizar invitaciones (aceptar/rechazar)
DROP POLICY IF EXISTS family_invitations_update_recipient ON family_invitations_727b50c3;
CREATE POLICY family_invitations_update_recipient ON family_invitations_727b50c3
  FOR UPDATE
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR auth.uid() = invited_by
  );

-- Admins pueden eliminar invitaciones
DROP POLICY IF EXISTS family_invitations_delete_admin ON family_invitations_727b50c3;
CREATE POLICY family_invitations_delete_admin ON family_invitations_727b50c3
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM group_members_727b50c3
      WHERE group_id = family_invitations_727b50c3.group_id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
  );

-- =====================================================
-- 4.3 POLÍTICAS: NOTIFICATIONS
-- =====================================================

-- Usuarios solo pueden ver sus notificaciones
DROP POLICY IF EXISTS notifications_select_own ON notifications_727b50c3;
CREATE POLICY notifications_select_own ON notifications_727b50c3
  FOR SELECT
  USING (auth.uid() = user_id);

-- Sistema puede crear notificaciones (desde backend)
DROP POLICY IF EXISTS notifications_insert_system ON notifications_727b50c3;
CREATE POLICY notifications_insert_system ON notifications_727b50c3
  FOR INSERT
  WITH CHECK (true); -- Backend usa service role key

-- Usuarios pueden marcar como leídas/archivadas
DROP POLICY IF EXISTS notifications_update_own ON notifications_727b50c3;
CREATE POLICY notifications_update_own ON notifications_727b50c3
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Usuarios pueden eliminar sus notificaciones
DROP POLICY IF EXISTS notifications_delete_own ON notifications_727b50c3;
CREATE POLICY notifications_delete_own ON notifications_727b50c3
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 5. TRIGGERS
-- =====================================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS trigger_user_devices_updated_at ON user_devices_727b50c3;
CREATE TRIGGER trigger_user_devices_updated_at
  BEFORE UPDATE ON user_devices_727b50c3
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_family_invitations_updated_at ON family_invitations_727b50c3;
CREATE TRIGGER trigger_family_invitations_updated_at
  BEFORE UPDATE ON family_invitations_727b50c3
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_notifications_updated_at ON notifications_727b50c3;
CREATE TRIGGER trigger_notifications_updated_at
  BEFORE UPDATE ON notifications_727b50c3
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para marcar invitaciones expiradas
CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE family_invitations_727b50c3
  SET status = 'expired'
  WHERE status = 'pending'
    AND expires_at < NOW();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_expire_invitations ON family_invitations_727b50c3;
CREATE TRIGGER trigger_expire_invitations
  AFTER INSERT OR UPDATE ON family_invitations_727b50c3
  FOR EACH STATEMENT
  EXECUTE FUNCTION expire_old_invitations();

-- =====================================================
-- 6. FUNCIONES ÚTILES
-- =====================================================

-- Función: Obtener dispositivos activos de un usuario
CREATE OR REPLACE FUNCTION get_active_devices(p_user_id UUID)
RETURNS TABLE (
  device_id TEXT,
  device_name TEXT,
  os_name TEXT,
  last_seen_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ud.device_id,
    ud.device_name,
    ud.os_name,
    ud.last_seen_at
  FROM user_devices_727b50c3 ud
  WHERE ud.user_id = p_user_id
    AND ud.is_active = true
  ORDER BY ud.last_seen_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función: Obtener notificaciones no leídas
CREATE OR REPLACE FUNCTION get_unread_notifications(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  message TEXT,
  type TEXT,
  priority TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.title,
    n.message,
    n.type,
    n.priority,
    n.created_at
  FROM notifications_727b50c3 n
  WHERE n.user_id = p_user_id
    AND n.is_read = false
    AND n.is_archived = false
  ORDER BY 
    CASE n.priority
      WHEN 'urgent' THEN 1
      WHEN 'high' THEN 2
      WHEN 'normal' THEN 3
      WHEN 'low' THEN 4
    END,
    n.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función: Obtener invitaciones pendientes
CREATE OR REPLACE FUNCTION get_pending_invitations(p_email TEXT)
RETURNS TABLE (
  id UUID,
  group_id UUID,
  invited_by_name TEXT,
  code TEXT,
  invited_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fi.id,
    fi.group_id,
    fi.invited_by_name,
    fi.code,
    fi.invited_at,
    fi.expires_at
  FROM family_invitations_727b50c3 fi
  WHERE fi.email = p_email
    AND fi.status = 'pending'
    AND fi.expires_at > NOW()
  ORDER BY fi.invited_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. VISTAS ÚTILES
-- =====================================================

-- Vista: Resumen de invitaciones por grupo
CREATE OR REPLACE VIEW v_group_invitations_summary AS
SELECT 
  group_id,
  COUNT(*) AS total_invitations,
  COUNT(*) FILTER (WHERE status = 'pending') AS pending,
  COUNT(*) FILTER (WHERE status = 'accepted') AS accepted,
  COUNT(*) FILTER (WHERE status = 'rejected') AS rejected,
  COUNT(*) FILTER (WHERE status = 'expired') AS expired,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE status = 'accepted') / NULLIF(COUNT(*), 0),
    2
  ) AS acceptance_rate
FROM family_invitations_727b50c3
GROUP BY group_id;

-- Vista: Estadísticas de dispositivos
CREATE OR REPLACE VIEW v_device_stats AS
SELECT 
  os_name,
  COUNT(*) AS total_devices,
  COUNT(DISTINCT user_id) AS unique_users,
  COUNT(*) FILTER (WHERE is_active = true) AS active_devices,
  MAX(last_seen_at) AS last_activity
FROM user_devices_727b50c3
GROUP BY os_name
ORDER BY total_devices DESC;

-- Vista: Notificaciones por tipo
CREATE OR REPLACE VIEW v_notification_stats AS
SELECT 
  type,
  priority,
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE is_read = false) AS unread,
  COUNT(DISTINCT user_id) AS unique_users
FROM notifications_727b50c3
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY type, priority
ORDER BY total DESC;

-- =====================================================
-- 8. GRANTS (Permisos)
-- =====================================================

-- Dar permisos a authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON user_devices_727b50c3 TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON family_invitations_727b50c3 TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON notifications_727b50c3 TO authenticated;

-- Dar permisos a service role (backend)
GRANT ALL ON user_devices_727b50c3 TO service_role;
GRANT ALL ON family_invitations_727b50c3 TO service_role;
GRANT ALL ON notifications_727b50c3 TO service_role;

-- =====================================================
-- 9. VERIFICACIÓN FINAL
-- =====================================================

-- Verificar que las tablas existen
DO $$
BEGIN
  ASSERT (SELECT COUNT(*) FROM pg_tables WHERE tablename = 'user_devices_727b50c3') = 1,
    'Tabla user_devices_727b50c3 no creada';
  ASSERT (SELECT COUNT(*) FROM pg_tables WHERE tablename = 'family_invitations_727b50c3') = 1,
    'Tabla family_invitations_727b50c3 no creada';
  ASSERT (SELECT COUNT(*) FROM pg_tables WHERE tablename = 'notifications_727b50c3') = 1,
    'Tabla notifications_727b50c3 no creada';
  
  RAISE NOTICE '✅ Todas las tablas creadas correctamente';
END $$;

-- Verificar RLS habilitado
DO $$
BEGIN
  ASSERT (SELECT relrowsecurity FROM pg_class WHERE relname = 'user_devices_727b50c3'),
    'RLS no habilitado en user_devices_727b50c3';
  ASSERT (SELECT relrowsecurity FROM pg_class WHERE relname = 'family_invitations_727b50c3'),
    'RLS no habilitado en family_invitations_727b50c3';
  ASSERT (SELECT relrowsecurity FROM pg_class WHERE relname = 'notifications_727b50c3'),
    'RLS no habilitado en notifications_727b50c3';
  
  RAISE NOTICE '✅ RLS habilitado en todas las tablas';
END $$;

COMMIT;

-- =====================================================
-- ✅ SCRIPT 7 COMPLETADO
-- =====================================================
-- Tablas creadas: 3
-- Índices creados: 21
-- Políticas RLS: 13
-- Triggers: 4
-- Funciones: 3
-- Vistas: 3
--
-- SIGUIENTE PASO:
-- 1. Ejecuta /sql-migrations/verificacion-script-7.sql
-- 2. Actualiza el backend para usar estas tablas
-- 3. Migra los datos del KV store (opcional)
-- 4. Elimina los datos obsoletos del KV store
-- =====================================================
