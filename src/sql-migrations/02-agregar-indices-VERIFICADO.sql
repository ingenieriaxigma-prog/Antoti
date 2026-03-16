-- ========================================
-- PARTE 2: AGREGAR ÍNDICES CRÍTICOS (VERIFICADO)
-- ========================================
-- Ejecutar SEGUNDO - Agrega índices para performance
-- 100% VERIFICADO contra esquema real de BD

-- ====================================
-- TRANSACCIONES PERSONALES
-- ====================================
CREATE INDEX IF NOT EXISTS idx_transactions_user_date 
  ON transactions_727b50c3(user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_account 
  ON transactions_727b50c3(account_id);

CREATE INDEX IF NOT EXISTS idx_transactions_category 
  ON transactions_727b50c3(category_id);

CREATE INDEX IF NOT EXISTS idx_transactions_type 
  ON transactions_727b50c3(type);

CREATE INDEX IF NOT EXISTS idx_transactions_user_type_date 
  ON transactions_727b50c3(user_id, type, date DESC);

-- ====================================
-- CUENTAS
-- ====================================
CREATE INDEX IF NOT EXISTS idx_accounts_user 
  ON accounts_727b50c3(user_id);

CREATE INDEX IF NOT EXISTS idx_accounts_type 
  ON accounts_727b50c3(type);

-- ====================================
-- CATEGORÍAS
-- ====================================
CREATE INDEX IF NOT EXISTS idx_categories_user 
  ON categories_727b50c3(user_id);

CREATE INDEX IF NOT EXISTS idx_categories_type 
  ON categories_727b50c3(type);

-- ====================================
-- SUBCATEGORÍAS
-- ====================================
CREATE INDEX IF NOT EXISTS idx_subcategories_category 
  ON subcategories_727b50c3(category_id);

-- ====================================
-- PRESUPUESTOS
-- ====================================
CREATE INDEX IF NOT EXISTS idx_budgets_user_period 
  ON budgets_727b50c3(user_id, period DESC);

CREATE INDEX IF NOT EXISTS idx_budgets_category 
  ON budgets_727b50c3(category_id);

-- ====================================
-- GRUPOS FAMILIARES
-- ====================================
CREATE INDEX IF NOT EXISTS idx_family_groups_created_by 
  ON family_groups_727b50c3(created_by);

CREATE INDEX IF NOT EXISTS idx_family_groups_created_at 
  ON family_groups_727b50c3(created_at DESC);

-- ====================================
-- MIEMBROS DE GRUPOS
-- ====================================
CREATE INDEX IF NOT EXISTS idx_group_members_user 
  ON group_members_727b50c3(user_id);

CREATE INDEX IF NOT EXISTS idx_group_members_group 
  ON group_members_727b50c3(group_id);

CREATE INDEX IF NOT EXISTS idx_group_members_group_status 
  ON group_members_727b50c3(group_id, status) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_group_members_role 
  ON group_members_727b50c3(group_id, role);

-- ====================================
-- TRANSACCIONES GRUPALES
-- ====================================
CREATE INDEX IF NOT EXISTS idx_group_transactions_group_date 
  ON group_transactions_727b50c3(group_id, transaction_date DESC);

CREATE INDEX IF NOT EXISTS idx_group_transactions_user 
  ON group_transactions_727b50c3(shared_by_user_id);

CREATE INDEX IF NOT EXISTS idx_group_transactions_type 
  ON group_transactions_727b50c3(transaction_type);

CREATE INDEX IF NOT EXISTS idx_group_transactions_created 
  ON group_transactions_727b50c3(created_at DESC);

-- ====================================
-- REACCIONES
-- ====================================
CREATE INDEX IF NOT EXISTS idx_reactions_transaction 
  ON group_reactions_727b50c3(group_transaction_id);

CREATE INDEX IF NOT EXISTS idx_reactions_user 
  ON group_reactions_727b50c3(user_id);

-- ====================================
-- COMENTARIOS
-- ====================================
CREATE INDEX IF NOT EXISTS idx_comments_transaction 
  ON group_comments_727b50c3(group_transaction_id);

CREATE INDEX IF NOT EXISTS idx_comments_user 
  ON group_comments_727b50c3(user_id);

CREATE INDEX IF NOT EXISTS idx_comments_created 
  ON group_comments_727b50c3(created_at DESC);

-- ====================================
-- INVITACIONES DE GRUPOS (nueva tabla Script 1)
-- ====================================
CREATE INDEX IF NOT EXISTS idx_group_invitations_group 
  ON group_invitations_727b50c3(group_id);

CREATE INDEX IF NOT EXISTS idx_group_invitations_invited_by 
  ON group_invitations_727b50c3(invited_by_user_id);

CREATE INDEX IF NOT EXISTS idx_group_invitations_email 
  ON group_invitations_727b50c3(invited_email);

CREATE INDEX IF NOT EXISTS idx_group_invitations_status 
  ON group_invitations_727b50c3(status);

CREATE INDEX IF NOT EXISTS idx_group_invitations_token 
  ON group_invitations_727b50c3(invitation_token) WHERE status = 'pending';

-- ====================================
-- NOTIFICACIONES DE GRUPOS (nueva tabla Script 1)
-- ====================================
CREATE INDEX IF NOT EXISTS idx_group_notifications_group 
  ON group_notifications_727b50c3(group_id);

CREATE INDEX IF NOT EXISTS idx_group_notifications_user 
  ON group_notifications_727b50c3(triggered_by_user_id);

CREATE INDEX IF NOT EXISTS idx_group_notifications_type 
  ON group_notifications_727b50c3(notification_type);

CREATE INDEX IF NOT EXISTS idx_group_notifications_created 
  ON group_notifications_727b50c3(created_at DESC);

-- ====================================
-- INVITACIONES FAMILIARES (tabla existente)
-- ====================================
CREATE INDEX IF NOT EXISTS idx_family_invitations_group 
  ON family_invitations_727b50c3(group_id);

CREATE INDEX IF NOT EXISTS idx_family_invitations_email 
  ON family_invitations_727b50c3(email);

CREATE INDEX IF NOT EXISTS idx_family_invitations_invited_by 
  ON family_invitations_727b50c3(invited_by);

CREATE INDEX IF NOT EXISTS idx_family_invitations_status 
  ON family_invitations_727b50c3(status);

CREATE INDEX IF NOT EXISTS idx_family_invitations_code 
  ON family_invitations_727b50c3(code) WHERE status = 'pending';

-- ====================================
-- NOTIFICACIONES FAMILIARES (tabla existente)
-- ====================================
CREATE INDEX IF NOT EXISTS idx_family_notifications_user_created 
  ON family_notifications_727b50c3(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_family_notifications_user_unread 
  ON family_notifications_727b50c3(user_id, read) WHERE read = false;

CREATE INDEX IF NOT EXISTS idx_family_notifications_group 
  ON family_notifications_727b50c3(group_id);

CREATE INDEX IF NOT EXISTS idx_family_notifications_type 
  ON family_notifications_727b50c3(type);

-- ====================================
-- VERIFICACIÓN
-- ====================================
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename LIKE '%_727b50c3'
ORDER BY tablename, indexname;

-- Contar índices por tabla
SELECT 
  tablename,
  COUNT(*) as num_indices
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename LIKE '%_727b50c3'
GROUP BY tablename
ORDER BY tablename;

-- Mostrar solo los índices que creamos
SELECT 
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
  AND tablename LIKE '%_727b50c3'
ORDER BY tablename, indexname;
