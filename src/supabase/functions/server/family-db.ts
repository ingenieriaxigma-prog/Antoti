/**
 * 👥 FAMILY GROUPS - DATABASE HELPER
 * 
 * Funciones para interactuar con las tablas de familia en Postgres.
 * 
 * IMPORTANTE: Este módulo es 100% independiente del código existente.
 */

import { createClient } from "npm:@supabase/supabase-js@2";

// =====================
// TYPES
// =====================

export interface FamilyGroup {
  id: string;
  name: string;
  emoji: string;
  created_by: string;
  require_approval_to_join: boolean;
  allow_guest_view: boolean;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'admin' | 'member' | 'viewer';
  status: 'active' | 'pending' | 'inactive';
  nickname: string;
  emoji: string;
  auto_share_expenses: boolean;
  auto_share_income: boolean;
  notifications_enabled: boolean;
  joined_at: string;
  created_at: string;
}

export interface GroupTransaction {
  id: string;
  group_id: string;
  original_transaction_id: string | null;
  shared_by_user_id: string;
  transaction_type: 'expense' | 'income' | 'transfer';
  amount: number;
  category: string | null;
  subcategory: string | null;
  description: string | null;
  transaction_date: string;
  visibility: 'all' | 'admins';
  is_intrafamily_transfer: boolean;
  involved_members: string[] | null;
  created_at: string;
}

export interface GroupReaction {
  id: string;
  group_transaction_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export interface GroupComment {
  id: string;
  group_transaction_id: string;
  user_id: string;
  text: string;
  created_at: string;
}

export interface GroupNotification {
  id: string;
  group_id: string;
  notification_type: 'new_transaction' | 'new_member' | 'member_left' | 'reaction' | 'comment' | 'member_joined';
  triggered_by_user_id: string;
  group_transaction_id: string | null;
  message: string;
  read_by: Record<string, string>;
  created_at: string;
}

export interface GroupInvitation {
  id: string;
  group_id: string;
  invited_email: string | null;
  invited_user_id: string | null;
  invited_by_user_id: string;
  proposed_role: 'member' | 'viewer';
  proposed_nickname: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  invitation_token: string;
  created_at: string;
  expires_at: string;
  responded_at: string | null;
}

// =====================
// DATABASE FUNCTIONS - GROUPS
// =====================

/**
 * Crear un nuevo grupo familiar
 */
export async function createFamilyGroup(
  supabase: any,
  data: {
    name: string;
    emoji?: string;
    created_by: string;
    require_approval_to_join?: boolean;
    allow_guest_view?: boolean;
    currency?: string;
  }
): Promise<FamilyGroup> {
  const { data: group, error } = await supabase
    .from('family_groups_727b50c3')
    .insert({
      name: data.name,
      emoji: data.emoji || '🏠',
      created_by: data.created_by,
      require_approval_to_join: data.require_approval_to_join ?? true,
      allow_guest_view: data.allow_guest_view ?? false,
      currency: data.currency || 'COP',
    })
    .select()
    .single();

  if (error) throw error;
  return group;
}

/**
 * Obtener grupos de un usuario
 */
export async function getUserGroups(
  supabase: any,
  userId: string
): Promise<FamilyGroup[]> {
  const { data, error } = await supabase
    .from('family_groups_727b50c3')
    .select(`
      *,
      group_members_727b50c3!inner(user_id, status)
    `)
    .eq('group_members_727b50c3.user_id', userId)
    .eq('group_members_727b50c3.status', 'active');

  if (error) throw error;
  return data || [];
}

/**
 * Obtener un grupo por ID
 */
export async function getGroupById(
  supabase: any,
  groupId: string
): Promise<FamilyGroup | null> {
  const { data, error } = await supabase
    .from('family_groups_727b50c3')
    .select('*')
    .eq('id', groupId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data;
}

/**
 * Actualizar un grupo
 */
export async function updateFamilyGroup(
  supabase: any,
  groupId: string,
  updates: Partial<FamilyGroup>
): Promise<FamilyGroup> {
  const { data, error } = await supabase
    .from('family_groups_727b50c3')
    .update(updates)
    .eq('id', groupId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// =====================
// DATABASE FUNCTIONS - MEMBERS
// =====================

/**
 * Agregar miembro a un grupo
 */
export async function addGroupMember(
  supabase: any,
  data: {
    group_id: string;
    user_id: string;
    role?: 'admin' | 'member' | 'viewer';
    status?: 'active' | 'pending';
    nickname?: string;
    emoji?: string;
  }
): Promise<GroupMember> {
  const { data: member, error } = await supabase
    .from('group_members_727b50c3')
    .insert({
      group_id: data.group_id,
      user_id: data.user_id,
      role: data.role || 'member',
      status: data.status || 'active',
      nickname: data.nickname || 'Miembro',
      emoji: data.emoji || '👤',
    })
    .select()
    .single();

  if (error) throw error;
  return member;
}

/**
 * Obtener miembros de un grupo
 */
export async function getGroupMembers(
  supabase: any,
  groupId: string,
  activeOnly = true
): Promise<GroupMember[]> {
  let query = supabase
    .from('group_members_727b50c3')
    .select('*')
    .eq('group_id', groupId);

  if (activeOnly) {
    query = query.eq('status', 'active');
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

/**
 * Verificar si usuario es miembro activo de un grupo
 */
export async function isUserGroupMember(
  supabase: any,
  groupId: string,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('group_members_727b50c3')
    .select('id')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  return !error && data !== null;
}

/**
 * Verificar si usuario es admin de un grupo
 */
export async function isUserGroupAdmin(
  supabase: any,
  groupId: string,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('group_members_727b50c3')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  return !error && data?.role === 'admin';
}

/**
 * Obtener miembro específico por user_id
 */
export async function getGroupMemberByUserId(
  supabase: any,
  groupId: string,
  userId: string
): Promise<GroupMember | null> {
  console.log(`🔍 getGroupMemberByUserId: groupId=${groupId}, userId=${userId}`);
  
  const { data, error } = await supabase
    .from('group_members_727b50c3')
    .select('*')
    .eq('group_id', groupId)
    .eq('user_id', userId);

  if (error) {
    console.error('❌ Error getting member:', error);
    throw error;
  }
  
  console.log(`   Found ${data?.length || 0} members`);
  
  if (!data || data.length === 0) {
    console.log('   No member found');
    return null;
  }
  
  // Si hay múltiples, tomar el primero con status 'active'
  const activeMember = data.find((m: any) => m.status === 'active') || data[0];
  console.log(`   Returning member:`, activeMember);
  
  return activeMember;
}

/**
 * Actualizar miembro
 */
export async function updateGroupMember(
  supabase: any,
  memberId: string,
  updates: Partial<GroupMember>
): Promise<GroupMember> {
  const { data, error } = await supabase
    .from('group_members_727b50c3')
    .update(updates)
    .eq('id', memberId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// =====================
// DATABASE FUNCTIONS - TRANSACTIONS
// =====================

/**
 * Compartir transacción en grupo
 */
export async function shareTransactionToGroup(
  supabase: any,
  data: {
    group_id: string;
    original_transaction_id: string | null;
    shared_by_user_id: string;
    transaction_type: 'expense' | 'income' | 'transfer';
    amount: number;
    category: string | null;
    subcategory?: string | null;
    description: string | null;
    transaction_date: string;
    visibility?: 'all' | 'admins';
    is_intrafamily_transfer?: boolean;
    involved_members?: string[];
    receipt_url?: string | null; // ✨ URL del comprobante
  }
): Promise<GroupTransaction> {
  console.log('🔵 shareTransactionToGroup called with:', {
    group_id: data.group_id,
    amount: data.amount,
    description: data.description,
    has_receipt: !!data.receipt_url
  });

  // Construir el objeto de inserción sin receipt_url primero
  const insertData: any = {
    group_id: data.group_id,
    original_transaction_id: data.original_transaction_id,
    shared_by_user_id: data.shared_by_user_id,
    transaction_type: data.transaction_type,
    amount: data.amount,
    category: data.category,
    subcategory: data.subcategory || null,
    description: data.description,
    transaction_date: data.transaction_date,
    visibility: data.visibility || 'all',
    is_intrafamily_transfer: data.is_intrafamily_transfer || false,
    involved_members: data.involved_members || null,
  };

  // Verificar si la columna receipt_url existe antes de intentar usarla
  if (data.receipt_url) {
    console.log('🔍 Checking if receipt_url column exists...');
    const { error: checkError } = await supabase
      .from('group_transactions_727b50c3')
      .select('receipt_url')
      .limit(1);
    
    if (!checkError) {
      // La columna existe, podemos usarla
      console.log('✅ receipt_url column exists, adding to insert');
      insertData.receipt_url = data.receipt_url;
    } else if (checkError.message?.includes('column "receipt_url" does not exist')) {
      // La columna no existe
      console.warn('⚠️  receipt_url column does not exist in group_transactions_727b50c3');
      console.warn('⚠️  Receipt URL will not be saved:',data.receipt_url);
      console.warn('⚠️  Please create the column by running this SQL in Supabase dashboard:');
      console.warn('⚠️  ALTER TABLE group_transactions_727b50c3 ADD COLUMN receipt_url TEXT;');
      // No agregar el campo receipt_url al insertData
    } else {
      // Otro tipo de error, mejor incluir el campo por si acaso
      console.log('❓ Unknown error checking column, will try to include receipt_url anyway');
      insertData.receipt_url = data.receipt_url;
    }
  }

  console.log('📝 Inserting into group_transactions_727b50c3...');
  const { data: transaction, error } = await supabase
    .from('group_transactions_727b50c3')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('❌ Error inserting group transaction:', error);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error details:', error.details);
    console.error('❌ Error hint:', error.hint);
    console.error('❌ Error message:', error.message);
    throw error;
  }
  
  console.log('✅ Group transaction created:', transaction.id);
  return transaction;
}

/**
 * Obtener transacciones de un grupo
 */
export async function getGroupTransactions(
  supabase: any,
  groupId: string,
  options?: {
    limit?: number;
    offset?: number;
    startDate?: string;
    endDate?: string;
  }
): Promise<GroupTransaction[]> {
  console.log('🔍 getGroupTransactions called:', { groupId, options });
  
  let query = supabase
    .from('group_transactions_727b50c3')
    .select('*')
    .eq('group_id', groupId)
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false }); // Ordenar también por hora de creación

  if (options?.startDate) {
    query = query.gte('transaction_date', options.startDate);
  }
  if (options?.endDate) {
    query = query.lte('transaction_date', options.endDate);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  console.log('🔍 Executing query...');
  const { data, error } = await query;

  if (error) {
    console.error('❌ Error fetching group transactions:', error);
    throw error;
  }
  
  console.log(`✅ Query returned ${data?.length || 0} transactions`);
  
  return data || [];
}

/**
 * Actualizar transacción de grupo
 */
export async function updateGroupTransaction(
  supabase: any,
  transactionId: string,
  updates: {
    amount?: number;
    category?: string | null;
    subcategory?: string | null;
    description?: string | null;
    transaction_date?: string;
    transaction_type?: 'expense' | 'income' | 'transfer';
  }
): Promise<GroupTransaction> {
  const { data: transaction, error } = await supabase
    .from('group_transactions_727b50c3')
    .update(updates)
    .eq('id', transactionId)
    .select()
    .single();

  if (error) throw error;
  return transaction;
}

/**
 * Eliminar transacción de grupo
 */
export async function deleteGroupTransaction(
  supabase: any,
  transactionId: string
): Promise<void> {
  // Primero eliminar reacciones y comentarios
  await supabase
    .from('group_reactions_727b50c3')
    .delete()
    .eq('group_transaction_id', transactionId);

  await supabase
    .from('group_comments_727b50c3')
    .delete()
    .eq('group_transaction_id', transactionId);

  // Eliminar la transacción
  const { error } = await supabase
    .from('group_transactions_727b50c3')
    .delete()
    .eq('id', transactionId);

  if (error) throw error;
}

/**
 * Remover miembro de un grupo
 */
export async function removeGroupMember(
  supabase: any,
  memberId: string
): Promise<void> {
  const { error } = await supabase
    .from('group_members_727b50c3')
    .update({ status: 'inactive' })
    .eq('id', memberId);

  if (error) throw error;
}

// =====================
// DATABASE FUNCTIONS - REACTIONS
// =====================

/**
 * Agregar reacción a transacción
 */
export async function addReaction(
  supabase: any,
  data: {
    group_transaction_id: string;
    user_id: string;
    emoji: string;
  }
): Promise<GroupReaction> {
  const { data: reaction, error } = await supabase
    .from('group_reactions_727b50c3')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  
  // Obtener el group_id de la transacción para buscar el miembro
  const { data: transaction } = await supabase
    .from('group_transactions_727b50c3')
    .select('group_id')
    .eq('id', data.group_transaction_id)
    .single();
  
  if (transaction) {
    // Buscar el nickname y emoji del usuario
    const { data: memberData } = await supabase
      .from('group_members_727b50c3')
      .select('nickname, emoji')
      .eq('group_id', transaction.group_id)
      .eq('user_id', data.user_id)
      .single();
    
    if (memberData) {
      return {
        ...reaction,
        userNickname: memberData.nickname,
        userEmoji: memberData.emoji,
      };
    }
  }
  
  return reaction;
}

/**
 * Eliminar reacción
 */
export async function removeReaction(
  supabase: any,
  groupTransactionId: string,
  userId: string
): Promise<void> {
  console.log('🗑️  removeReaction called:', { groupTransactionId, userId });
  
  const { data, error } = await supabase
    .from('group_reactions_727b50c3')
    .delete()
    .eq('group_transaction_id', groupTransactionId)
    .eq('user_id', userId)
    .select();

  if (error) {
    console.error('❌ Error removing reaction from DB:', error);
    throw error;
  }

  console.log('✅ Reaction removed from DB:', data);
}

/**
 * Obtener reacciones de una transacción con información del usuario
 */
export async function getReactions(
  supabase: any,
  groupTransactionId: string
): Promise<GroupReaction[]> {
  // Primero obtener las reacciones
  const { data: reactions, error } = await supabase
    .from('group_reactions_727b50c3')
    .select('*')
    .eq('group_transaction_id', groupTransactionId);

  if (error) throw error;
  
  if (!reactions || reactions.length === 0) return [];
  
  // Obtener el group_id de la transacción
  const { data: transaction } = await supabase
    .from('group_transactions_727b50c3')
    .select('group_id')
    .eq('id', groupTransactionId)
    .single();
  
  if (!transaction) return reactions;
  
  // Para cada reacción, buscar el nickname y emoji del usuario
  const reactionsWithUserInfo = await Promise.all(
    reactions.map(async (reaction: any) => {
      const { data: memberData } = await supabase
        .from('group_members_727b50c3')
        .select('nickname, emoji')
        .eq('group_id', transaction.group_id)
        .eq('user_id', reaction.user_id)
        .single();
      
      return {
        ...reaction,
        userNickname: memberData?.nickname || 'Usuario',
        userEmoji: memberData?.emoji || '👤',
      };
    })
  );
  
  return reactionsWithUserInfo;
}

// =====================
// DATABASE FUNCTIONS - COMMENTS
// =====================

/**
 * Agregar comentario a transacción
 */
export async function addComment(
  supabase: any,
  data: {
    group_transaction_id: string;
    user_id: string;
    text: string;
  }
): Promise<GroupComment> {
  const { data: comment, error } = await supabase
    .from('group_comments_727b50c3')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  
  // Obtener el group_id de la transacción para buscar el miembro
  const { data: transaction } = await supabase
    .from('group_transactions_727b50c3')
    .select('group_id')
    .eq('id', data.group_transaction_id)
    .single();
  
  if (transaction) {
    // Buscar el nickname y emoji del usuario
    const { data: memberData } = await supabase
      .from('group_members_727b50c3')
      .select('nickname, emoji')
      .eq('group_id', transaction.group_id)
      .eq('user_id', data.user_id)
      .single();
    
    if (memberData) {
      return {
        ...comment,
        userNickname: memberData.nickname,
        userEmoji: memberData.emoji,
      };
    }
  }
  
  return comment;
}

/**
 * Obtener comentarios de una transacción con información del usuario
 */
export async function getComments(
  supabase: any,
  groupTransactionId: string
): Promise<GroupComment[]> {
  // Primero obtener los comentarios
  const { data: comments, error } = await supabase
    .from('group_comments_727b50c3')
    .select('*')
    .eq('group_transaction_id', groupTransactionId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  
  if (!comments || comments.length === 0) return [];
  
  // Obtener el group_id de la transacción
  const { data: transaction } = await supabase
    .from('group_transactions_727b50c3')
    .select('group_id')
    .eq('id', groupTransactionId)
    .single();
  
  if (!transaction) return comments;
  
  // Para cada comentario, buscar el nickname y emoji del usuario
  const commentsWithUserInfo = await Promise.all(
    comments.map(async (comment: any) => {
      const { data: memberData } = await supabase
        .from('group_members_727b50c3')
        .select('nickname, emoji')
        .eq('group_id', transaction.group_id)
        .eq('user_id', comment.user_id)
        .single();
      
      return {
        ...comment,
        userNickname: memberData?.nickname || 'Usuario',
        userEmoji: memberData?.emoji || '👤',
      };
    })
  );
  
  return commentsWithUserInfo;
}

// =====================
// DATABASE FUNCTIONS - NOTIFICATIONS
// =====================

/**
 * Crear notificación
 */
export async function createNotification(
  supabase: any,
  data: {
    group_id: string;
    notification_type: GroupNotification['notification_type'];
    triggered_by_user_id: string;
    message: string;
    group_transaction_id?: string;
  }
): Promise<GroupNotification> {
  const { data: notification, error } = await supabase
    .from('group_notifications_727b50c3')
    .insert({
      group_id: data.group_id,
      notification_type: data.notification_type,
      triggered_by_user_id: data.triggered_by_user_id,
      message: data.message,
      group_transaction_id: data.group_transaction_id || null,
    })
    .select()
    .single();

  if (error) throw error;
  return notification;
}

/**
 * Alias para createNotification (para compatibilidad con invitaciones)
 */
export async function createGroupNotification(
  supabase: any,
  data: {
    group_id: string;
    type: string;
    title?: string;
    message: string;
    data?: any;
    created_by: string;
    target_user_id?: string;
  }
): Promise<any> {
  // Mapear el tipo al formato de notificación
  const notificationType = data.type === 'invitation_received' ? 'new_member' 
    : data.type === 'member_joined' ? 'member_joined'
    : 'new_member';

  return createNotification(supabase, {
    group_id: data.group_id,
    notification_type: notificationType as any,
    triggered_by_user_id: data.created_by,
    message: data.message,
  });
}

/**
 * Obtener notificaciones de un grupo para un usuario
 */
export async function getUserGroupNotifications(
  supabase: any,
  userId: string,
  limit = 50
): Promise<GroupNotification[]> {
  // Primero obtener grupos del usuario
  const { data: memberData, error: memberError } = await supabase
    .from('group_members_727b50c3')
    .select('group_id')
    .eq('user_id', userId)
    .eq('status', 'active');

  if (memberError) throw memberError;

  const groupIds = (memberData || []).map((m: any) => m.group_id);

  if (groupIds.length === 0) return [];

  // Obtener notificaciones de esos grupos
  const { data, error } = await supabase
    .from('group_notifications_727b50c3')
    .select('*')
    .in('group_id', groupIds)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  
  // Para cada notificación, buscar manualmente el nickname del usuario
  const notifications = await Promise.all(
    (data || []).map(async (notif: any) => {
      // Obtener el miembro del grupo que disparó la notificación
      const { data: memberData } = await supabase
        .from('group_members_727b50c3')
        .select('nickname, emoji')
        .eq('group_id', notif.group_id)
        .eq('user_id', notif.triggered_by_user_id)
        .single();
      
      // Obtener el nombre del grupo
      const { data: groupData } = await supabase
        .from('family_groups_727b50c3')
        .select('name')
        .eq('id', notif.group_id)
        .single();
      
      return {
        ...notif,
        triggered_by_name: memberData?.nickname || 'Usuario',
        group_name: groupData?.name || 'Grupo',
      };
    })
  );
  
  return notifications;
}

/**
 * Marcar notificación como leída
 */
export async function markNotificationAsRead(
  supabase: any,
  notificationId: string,
  userId: string
): Promise<void> {
  // Obtener notificación actual
  const { data: notification, error: fetchError } = await supabase
    .from('group_notifications_727b50c3')
    .select('read_by')
    .eq('id', notificationId)
    .single();

  if (fetchError) throw fetchError;

  // Actualizar read_by
  const readBy = notification.read_by || {};
  readBy[userId] = new Date().toISOString();

  const { error: updateError } = await supabase
    .from('group_notifications_727b50c3')
    .update({ read_by: readBy })
    .eq('id', notificationId);

  if (updateError) throw updateError;
}

// =====================
// HELPER FUNCTIONS
// =====================

/**
 * Validar nombre de grupo
 */
export function validateGroupName(name: string): boolean {
  return name && name.trim().length >= 3 && name.trim().length <= 100;
}

/**
 * Validar emoji
 */
export function validateEmoji(emoji: string): boolean {
  return emoji && emoji.length >= 1 && emoji.length <= 10;
}