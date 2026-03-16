-- ========================================
-- PARTE 3: IMPLEMENTAR ROW LEVEL SECURITY (VERIFICADO)
-- ========================================
-- Ejecutar TERCERO - Implementa seguridad a nivel de fila
-- 100% VERIFICADO contra esquema real de BD

-- ====================================
-- 1. HABILITAR RLS EN TODAS LAS TABLAS
-- ====================================
ALTER TABLE transactions_727b50c3 ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts_727b50c3 ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories_727b50c3 ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories_727b50c3 ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets_727b50c3 ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_groups_727b50c3 ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members_727b50c3 ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_transactions_727b50c3 ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_reactions_727b50c3 ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_comments_727b50c3 ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_invitations_727b50c3 ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_notifications_727b50c3 ENABLE ROW LEVEL SECURITY;

-- ====================================
-- 2. POLÍTICAS PARA TRANSACCIONES
-- ====================================
DROP POLICY IF EXISTS "users_own_transactions_select" ON transactions_727b50c3;
CREATE POLICY "users_own_transactions_select"
  ON transactions_727b50c3 FOR SELECT
  USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "users_own_transactions_insert" ON transactions_727b50c3;
CREATE POLICY "users_own_transactions_insert"
  ON transactions_727b50c3 FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "users_own_transactions_update" ON transactions_727b50c3;
CREATE POLICY "users_own_transactions_update"
  ON transactions_727b50c3 FOR UPDATE
  USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "users_own_transactions_delete" ON transactions_727b50c3;
CREATE POLICY "users_own_transactions_delete"
  ON transactions_727b50c3 FOR DELETE
  USING (auth.uid()::text = user_id);

-- ====================================
-- 3. POLÍTICAS PARA CUENTAS
-- ====================================
DROP POLICY IF EXISTS "users_own_accounts_select" ON accounts_727b50c3;
CREATE POLICY "users_own_accounts_select"
  ON accounts_727b50c3 FOR SELECT
  USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "users_own_accounts_insert" ON accounts_727b50c3;
CREATE POLICY "users_own_accounts_insert"
  ON accounts_727b50c3 FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "users_own_accounts_update" ON accounts_727b50c3;
CREATE POLICY "users_own_accounts_update"
  ON accounts_727b50c3 FOR UPDATE
  USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "users_own_accounts_delete" ON accounts_727b50c3;
CREATE POLICY "users_own_accounts_delete"
  ON accounts_727b50c3 FOR DELETE
  USING (auth.uid()::text = user_id);

-- ====================================
-- 4. POLÍTICAS PARA CATEGORÍAS
-- ====================================
DROP POLICY IF EXISTS "users_own_categories_select" ON categories_727b50c3;
CREATE POLICY "users_own_categories_select"
  ON categories_727b50c3 FOR SELECT
  USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "users_own_categories_insert" ON categories_727b50c3;
CREATE POLICY "users_own_categories_insert"
  ON categories_727b50c3 FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "users_own_categories_update" ON categories_727b50c3;
CREATE POLICY "users_own_categories_update"
  ON categories_727b50c3 FOR UPDATE
  USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "users_own_categories_delete" ON categories_727b50c3;
CREATE POLICY "users_own_categories_delete"
  ON categories_727b50c3 FOR DELETE
  USING (auth.uid()::text = user_id);

-- ====================================
-- 5. POLÍTICAS PARA SUBCATEGORÍAS
-- ====================================
DROP POLICY IF EXISTS "users_own_subcategories_select" ON subcategories_727b50c3;
CREATE POLICY "users_own_subcategories_select"
  ON subcategories_727b50c3 FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM categories_727b50c3
    WHERE categories_727b50c3.id = subcategories_727b50c3.category_id
    AND categories_727b50c3.user_id = auth.uid()::text
  ));

DROP POLICY IF EXISTS "users_own_subcategories_insert" ON subcategories_727b50c3;
CREATE POLICY "users_own_subcategories_insert"
  ON subcategories_727b50c3 FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM categories_727b50c3
    WHERE categories_727b50c3.id = subcategories_727b50c3.category_id
    AND categories_727b50c3.user_id = auth.uid()::text
  ));

DROP POLICY IF EXISTS "users_own_subcategories_update" ON subcategories_727b50c3;
CREATE POLICY "users_own_subcategories_update"
  ON subcategories_727b50c3 FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM categories_727b50c3
    WHERE categories_727b50c3.id = subcategories_727b50c3.category_id
    AND categories_727b50c3.user_id = auth.uid()::text
  ));

DROP POLICY IF EXISTS "users_own_subcategories_delete" ON subcategories_727b50c3;
CREATE POLICY "users_own_subcategories_delete"
  ON subcategories_727b50c3 FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM categories_727b50c3
    WHERE categories_727b50c3.id = subcategories_727b50c3.category_id
    AND categories_727b50c3.user_id = auth.uid()::text
  ));

-- ====================================
-- 6. POLÍTICAS PARA PRESUPUESTOS
-- ====================================
DROP POLICY IF EXISTS "users_own_budgets_select" ON budgets_727b50c3;
CREATE POLICY "users_own_budgets_select"
  ON budgets_727b50c3 FOR SELECT
  USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "users_own_budgets_insert" ON budgets_727b50c3;
CREATE POLICY "users_own_budgets_insert"
  ON budgets_727b50c3 FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "users_own_budgets_update" ON budgets_727b50c3;
CREATE POLICY "users_own_budgets_update"
  ON budgets_727b50c3 FOR UPDATE
  USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "users_own_budgets_delete" ON budgets_727b50c3;
CREATE POLICY "users_own_budgets_delete"
  ON budgets_727b50c3 FOR DELETE
  USING (auth.uid()::text = user_id);

-- ====================================
-- 7. POLÍTICAS PARA GRUPOS FAMILIARES
-- CORREGIDO: usa 'created_by' en lugar de 'owner_id'
-- ====================================
DROP POLICY IF EXISTS "members_view_groups" ON family_groups_727b50c3;
CREATE POLICY "members_view_groups"
  ON family_groups_727b50c3 FOR SELECT
  USING (
    created_by = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM group_members_727b50c3
      WHERE group_members_727b50c3.group_id = family_groups_727b50c3.id
      AND group_members_727b50c3.user_id = auth.uid()::text
      AND group_members_727b50c3.status = 'active'
    )
  );

DROP POLICY IF EXISTS "users_create_groups" ON family_groups_727b50c3;
CREATE POLICY "users_create_groups"
  ON family_groups_727b50c3 FOR INSERT
  WITH CHECK (auth.uid()::text = created_by);

DROP POLICY IF EXISTS "admins_update_groups" ON family_groups_727b50c3;
CREATE POLICY "admins_update_groups"
  ON family_groups_727b50c3 FOR UPDATE
  USING (
    created_by = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM group_members_727b50c3
      WHERE group_members_727b50c3.group_id = family_groups_727b50c3.id
      AND group_members_727b50c3.user_id = auth.uid()::text
      AND group_members_727b50c3.role = 'admin'
      AND group_members_727b50c3.status = 'active'
    )
  );

DROP POLICY IF EXISTS "owners_delete_groups" ON family_groups_727b50c3;
CREATE POLICY "owners_delete_groups"
  ON family_groups_727b50c3 FOR DELETE
  USING (created_by = auth.uid()::text);

-- ====================================
-- 8. POLÍTICAS PARA MIEMBROS
-- ====================================
DROP POLICY IF EXISTS "members_view_members" ON group_members_727b50c3;
CREATE POLICY "members_view_members"
  ON group_members_727b50c3 FOR SELECT
  USING (
    user_id = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM group_members_727b50c3 gm
      WHERE gm.group_id = group_members_727b50c3.group_id
      AND gm.user_id = auth.uid()::text
      AND gm.status = 'active'
    )
  );

DROP POLICY IF EXISTS "admins_add_members" ON group_members_727b50c3;
CREATE POLICY "admins_add_members"
  ON group_members_727b50c3 FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members_727b50c3
      WHERE group_members_727b50c3.group_id = group_members_727b50c3.group_id
      AND group_members_727b50c3.user_id = auth.uid()::text
      AND group_members_727b50c3.role IN ('admin', 'owner')
      AND group_members_727b50c3.status = 'active'
    )
  );

DROP POLICY IF EXISTS "admins_update_members" ON group_members_727b50c3;
CREATE POLICY "admins_update_members"
  ON group_members_727b50c3 FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM group_members_727b50c3 gm
      WHERE gm.group_id = group_members_727b50c3.group_id
      AND gm.user_id = auth.uid()::text
      AND gm.role IN ('admin', 'owner')
      AND gm.status = 'active'
    )
  );

DROP POLICY IF EXISTS "users_leave_groups" ON group_members_727b50c3;
CREATE POLICY "users_leave_groups"
  ON group_members_727b50c3 FOR DELETE
  USING (user_id = auth.uid()::text);

-- ====================================
-- 9. POLÍTICAS PARA TRANSACCIONES GRUPALES
-- CORREGIDO: usa 'shared_by_user_id' en lugar de 'user_id'
-- ====================================
DROP POLICY IF EXISTS "members_view_group_transactions" ON group_transactions_727b50c3;
CREATE POLICY "members_view_group_transactions"
  ON group_transactions_727b50c3 FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members_727b50c3
      WHERE group_members_727b50c3.group_id = group_transactions_727b50c3.group_id
      AND group_members_727b50c3.user_id = auth.uid()::text
      AND group_members_727b50c3.status = 'active'
    )
  );

DROP POLICY IF EXISTS "members_create_transactions" ON group_transactions_727b50c3;
CREATE POLICY "members_create_transactions"
  ON group_transactions_727b50c3 FOR INSERT
  WITH CHECK (
    auth.uid()::text = shared_by_user_id AND
    EXISTS (
      SELECT 1 FROM group_members_727b50c3
      WHERE group_members_727b50c3.group_id = group_transactions_727b50c3.group_id
      AND group_members_727b50c3.user_id = auth.uid()::text
      AND group_members_727b50c3.status = 'active'
    )
  );

DROP POLICY IF EXISTS "owners_update_transactions" ON group_transactions_727b50c3;
CREATE POLICY "owners_update_transactions"
  ON group_transactions_727b50c3 FOR UPDATE
  USING (auth.uid()::text = shared_by_user_id);

DROP POLICY IF EXISTS "owners_delete_transactions" ON group_transactions_727b50c3;
CREATE POLICY "owners_delete_transactions"
  ON group_transactions_727b50c3 FOR DELETE
  USING (auth.uid()::text = shared_by_user_id);

-- ====================================
-- 10. POLÍTICAS PARA REACCIONES
-- ====================================
DROP POLICY IF EXISTS "members_view_reactions" ON group_reactions_727b50c3;
CREATE POLICY "members_view_reactions"
  ON group_reactions_727b50c3 FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_transactions_727b50c3 gt
      JOIN group_members_727b50c3 gm ON gm.group_id = gt.group_id
      WHERE gt.id = group_reactions_727b50c3.group_transaction_id
      AND gm.user_id = auth.uid()::text
      AND gm.status = 'active'
    )
  );

DROP POLICY IF EXISTS "members_add_reactions" ON group_reactions_727b50c3;
CREATE POLICY "members_add_reactions"
  ON group_reactions_727b50c3 FOR INSERT
  WITH CHECK (
    auth.uid()::text = user_id AND
    EXISTS (
      SELECT 1 FROM group_transactions_727b50c3 gt
      JOIN group_members_727b50c3 gm ON gm.group_id = gt.group_id
      WHERE gt.id = group_reactions_727b50c3.group_transaction_id
      AND gm.user_id = auth.uid()::text
      AND gm.status = 'active'
    )
  );

DROP POLICY IF EXISTS "users_delete_reactions" ON group_reactions_727b50c3;
CREATE POLICY "users_delete_reactions"
  ON group_reactions_727b50c3 FOR DELETE
  USING (auth.uid()::text = user_id);

-- ====================================
-- 11. POLÍTICAS PARA COMENTARIOS
-- ====================================
DROP POLICY IF EXISTS "members_view_comments" ON group_comments_727b50c3;
CREATE POLICY "members_view_comments"
  ON group_comments_727b50c3 FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_transactions_727b50c3 gt
      JOIN group_members_727b50c3 gm ON gm.group_id = gt.group_id
      WHERE gt.id = group_comments_727b50c3.group_transaction_id
      AND gm.user_id = auth.uid()::text
      AND gm.status = 'active'
    )
  );

DROP POLICY IF EXISTS "members_add_comments" ON group_comments_727b50c3;
CREATE POLICY "members_add_comments"
  ON group_comments_727b50c3 FOR INSERT
  WITH CHECK (
    auth.uid()::text = user_id AND
    EXISTS (
      SELECT 1 FROM group_transactions_727b50c3 gt
      JOIN group_members_727b50c3 gm ON gm.group_id = gt.group_id
      WHERE gt.id = group_comments_727b50c3.group_transaction_id
      AND gm.user_id = auth.uid()::text
      AND gm.status = 'active'
    )
  );

DROP POLICY IF EXISTS "users_delete_comments" ON group_comments_727b50c3;
CREATE POLICY "users_delete_comments"
  ON group_comments_727b50c3 FOR DELETE
  USING (auth.uid()::text = user_id);

-- ====================================
-- 12. POLÍTICAS PARA INVITACIONES
-- ====================================
DROP POLICY IF EXISTS "users_view_invitations" ON family_invitations_727b50c3;
CREATE POLICY "users_view_invitations"
  ON family_invitations_727b50c3 FOR SELECT
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR
    invited_by = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM group_members_727b50c3
      WHERE group_members_727b50c3.group_id = family_invitations_727b50c3.group_id
      AND group_members_727b50c3.user_id = auth.uid()::text
      AND group_members_727b50c3.role IN ('admin', 'owner')
    )
  );

DROP POLICY IF EXISTS "admins_create_invitations" ON family_invitations_727b50c3;
CREATE POLICY "admins_create_invitations"
  ON family_invitations_727b50c3 FOR INSERT
  WITH CHECK (
    auth.uid()::text = invited_by AND
    EXISTS (
      SELECT 1 FROM group_members_727b50c3
      WHERE group_members_727b50c3.group_id = family_invitations_727b50c3.group_id
      AND group_members_727b50c3.user_id = auth.uid()::text
      AND group_members_727b50c3.role IN ('admin', 'owner')
    )
  );

DROP POLICY IF EXISTS "recipients_update_invitations" ON family_invitations_727b50c3;
CREATE POLICY "recipients_update_invitations"
  ON family_invitations_727b50c3 FOR UPDATE
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- ====================================
-- 13. POLÍTICAS PARA NOTIFICACIONES
-- ====================================
DROP POLICY IF EXISTS "users_view_notifications" ON family_notifications_727b50c3;
CREATE POLICY "users_view_notifications"
  ON family_notifications_727b50c3 FOR SELECT
  USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "system_create_notifications" ON family_notifications_727b50c3;
CREATE POLICY "system_create_notifications"
  ON family_notifications_727b50c3 FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "users_update_notifications" ON family_notifications_727b50c3;
CREATE POLICY "users_update_notifications"
  ON family_notifications_727b50c3 FOR UPDATE
  USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "users_delete_notifications" ON family_notifications_727b50c3;
CREATE POLICY "users_delete_notifications"
  ON family_notifications_727b50c3 FOR DELETE
  USING (auth.uid()::text = user_id);

-- ====================================
-- VERIFICACIÓN
-- ====================================
-- Verificar RLS habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE '%_727b50c3'
ORDER BY tablename;

-- Contar políticas por tabla
SELECT 
  schemaname,
  tablename,
  COUNT(*) as num_policies
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename LIKE '%_727b50c3'
GROUP BY schemaname, tablename
ORDER BY tablename;

-- Ver todas las políticas
SELECT 
  tablename,
  policyname,
  cmd as command,
  CASE 
    WHEN roles = '{public}' THEN 'PUBLIC'
    ELSE array_to_string(roles, ', ')
  END as roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename LIKE '%_727b50c3'
ORDER BY tablename, cmd, policyname;
