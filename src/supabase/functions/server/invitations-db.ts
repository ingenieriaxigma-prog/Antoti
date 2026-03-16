/**
 * 📨 FAMILY INVITATIONS - DATABASE HELPER
 * 
 * Funciones para interactuar con la tabla family_invitations_727b50c3
 * Reemplaza el uso del KV store para invitaciones familiares
 * 
 * Migración: KV store (family_invitation:*) → SQL (family_invitations_727b50c3)
 */

import { createClient } from "npm:@supabase/supabase-js@2";

// =====================
// TYPES
// =====================

export interface FamilyInvitation {
  id: string;
  group_id: string;
  email: string;
  invited_by: string;
  invited_by_email: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  code: string;
  expires_at: string;
  created_at: string;
  accepted_at?: string;
  accepted_by?: string;
  rejected_at?: string;
}

// =====================
// CREATE
// =====================

/**
 * Crear nueva invitación
 */
export async function createInvitation(
  supabase: ReturnType<typeof createClient>,
  data: {
    group_id: string;
    email: string;
    invited_by: string;
    invited_by_email: string;
    code: string;
    expires_at: string;
  }
): Promise<FamilyInvitation> {
  const { data: invitation, error } = await supabase
    .from('family_invitations_727b50c3')
    .insert({
      group_id: data.group_id,
      email: data.email.toLowerCase(),
      invited_by: data.invited_by,
      invited_by_email: data.invited_by_email,
      status: 'pending',
      code: data.code,
      expires_at: data.expires_at,
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Error creating invitation:', error);
    throw new Error(`Error al crear invitación: ${error.message}`);
  }

  return invitation;
}

// =====================
// READ
// =====================

/**
 * Obtener invitación por ID
 */
export async function getInvitationById(
  supabase: ReturnType<typeof createClient>,
  invitationId: string
): Promise<FamilyInvitation | null> {
  const { data, error } = await supabase
    .from('family_invitations_727b50c3')
    .select('*')
    .eq('id', invitationId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No encontrado
    }
    console.error('❌ Error getting invitation by ID:', error);
    throw new Error(`Error al obtener invitación: ${error.message}`);
  }

  return data;
}

/**
 * Obtener invitación por código
 */
export async function getInvitationByCode(
  supabase: ReturnType<typeof createClient>,
  code: string
): Promise<FamilyInvitation | null> {
  const { data, error } = await supabase
    .from('family_invitations_727b50c3')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('status', 'pending')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No encontrado
    }
    console.error('❌ Error getting invitation by code:', error);
    throw new Error(`Error al obtener invitación por código: ${error.message}`);
  }

  return data;
}

/**
 * Verificar si existe invitación pendiente para un email en un grupo
 */
export async function hasPendingInvitation(
  supabase: ReturnType<typeof createClient>,
  groupId: string,
  email: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('family_invitations_727b50c3')
    .select('id')
    .eq('group_id', groupId)
    .eq('email', email.toLowerCase())
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .limit(1);

  if (error) {
    console.error('❌ Error checking pending invitation:', error);
    return false;
  }

  return (data?.length ?? 0) > 0;
}

/**
 * Obtener invitaciones pendientes de un usuario por email
 */
export async function getUserPendingInvitations(
  supabase: ReturnType<typeof createClient>,
  userEmail: string
): Promise<FamilyInvitation[]> {
  const { data, error } = await supabase
    .from('family_invitations_727b50c3')
    .select('*')
    .eq('email', userEmail.toLowerCase())
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error getting user pending invitations:', error);
    throw new Error(`Error al obtener invitaciones: ${error.message}`);
  }

  return data || [];
}

/**
 * Obtener todas las invitaciones de un grupo
 */
export async function getGroupInvitations(
  supabase: ReturnType<typeof createClient>,
  groupId: string,
  statusFilter?: 'pending' | 'accepted' | 'rejected' | 'expired'
): Promise<FamilyInvitation[]> {
  let query = supabase
    .from('family_invitations_727b50c3')
    .select('*')
    .eq('group_id', groupId);

  if (statusFilter) {
    query = query.eq('status', statusFilter);
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error('❌ Error getting group invitations:', error);
    throw new Error(`Error al obtener invitaciones del grupo: ${error.message}`);
  }

  return data || [];
}

// =====================
// UPDATE
// =====================

/**
 * Aceptar invitación
 */
export async function acceptInvitation(
  supabase: ReturnType<typeof createClient>,
  invitationId: string,
  acceptedBy: string
): Promise<FamilyInvitation> {
  const { data, error } = await supabase
    .from('family_invitations_727b50c3')
    .update({
      status: 'accepted',
      accepted_at: new Date().toISOString(),
      accepted_by: acceptedBy,
    })
    .eq('id', invitationId)
    .select()
    .single();

  if (error) {
    console.error('❌ Error accepting invitation:', error);
    throw new Error(`Error al aceptar invitación: ${error.message}`);
  }

  return data;
}

/**
 * Rechazar invitación
 */
export async function rejectInvitation(
  supabase: ReturnType<typeof createClient>,
  invitationId: string
): Promise<FamilyInvitation> {
  const { data, error } = await supabase
    .from('family_invitations_727b50c3')
    .update({
      status: 'rejected',
      rejected_at: new Date().toISOString(),
    })
    .eq('id', invitationId)
    .select()
    .single();

  if (error) {
    console.error('❌ Error rejecting invitation:', error);
    throw new Error(`Error al rechazar invitación: ${error.message}`);
  }

  return data;
}

/**
 * Marcar invitaciones expiradas
 * (Normalmente ejecutado por trigger automático, pero disponible manualmente)
 */
export async function markExpiredInvitations(
  supabase: ReturnType<typeof createClient>
): Promise<number> {
  const { data, error } = await supabase
    .from('family_invitations_727b50c3')
    .update({ status: 'expired' })
    .eq('status', 'pending')
    .lt('expires_at', new Date().toISOString())
    .select('id');

  if (error) {
    console.error('❌ Error marking expired invitations:', error);
    throw new Error(`Error al marcar invitaciones expiradas: ${error.message}`);
  }

  return data?.length || 0;
}

// =====================
// DELETE
// =====================

/**
 * Eliminar invitaciones de un grupo
 * (Útil al eliminar un grupo)
 */
export async function deleteGroupInvitations(
  supabase: ReturnType<typeof createClient>,
  groupId: string
): Promise<number> {
  const { data, error } = await supabase
    .from('family_invitations_727b50c3')
    .delete()
    .eq('group_id', groupId)
    .select('id');

  if (error) {
    console.error('❌ Error deleting group invitations:', error);
    throw new Error(`Error al eliminar invitaciones del grupo: ${error.message}`);
  }

  return data?.length || 0;
}

// =====================
// ANALYTICS (usando vistas)
// =====================

/**
 * Obtener estadísticas de invitaciones de un grupo
 * Usa la vista v_group_invitations_summary
 */
export async function getGroupInvitationStats(
  supabase: ReturnType<typeof createClient>,
  groupId: string
): Promise<{
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  expired: number;
} | null> {
  const { data, error } = await supabase
    .from('v_group_invitations_summary')
    .select('*')
    .eq('group_id', groupId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No hay datos
    }
    console.error('❌ Error getting invitation stats:', error);
    return null;
  }

  return data;
}
