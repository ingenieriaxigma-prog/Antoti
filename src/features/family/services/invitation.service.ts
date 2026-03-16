/**
 * 📨 INVITATION SERVICE
 * 
 * Servicio para gestionar invitaciones a grupos familiares
 */

import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import type {
  FamilyInvitation,
  CreateInvitationDTO,
  FamilyGroup,
  GroupMember,
} from '../types/family.types';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3`;

/**
 * Helper para generar headers
 */
function getHeaders(accessToken: string) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  };
}

/**
 * Helper para manejar respuestas HTTP
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || `Error ${response.status}`);
  }
  return response.json();
}

// =====================
// INVITACIONES
// =====================

/**
 * Enviar invitación por email
 */
export async function sendInvitation(
  accessToken: string,
  data: CreateInvitationDTO
): Promise<{ invitation: FamilyInvitation }> {
  const response = await fetch(`${API_BASE}/family/invitations`, {
    method: 'POST',
    headers: getHeaders(accessToken),
    body: JSON.stringify(data),
  });

  return handleResponse<{ invitation: FamilyInvitation }>(response);
}

/**
 * Obtener invitaciones recibidas
 */
export async function getMyInvitations(
  accessToken: string
): Promise<{ invitations: FamilyInvitation[] }> {
  const response = await fetch(`${API_BASE}/family/invitations`, {
    method: 'GET',
    headers: getHeaders(accessToken),
  });

  return handleResponse<{ invitations: FamilyInvitation[] }>(response);
}

/**
 * Aceptar invitación
 */
export async function acceptInvitation(
  accessToken: string,
  invitationId: string
): Promise<{ member: GroupMember; group: FamilyGroup }> {
  const response = await fetch(`${API_BASE}/family/invitations/${invitationId}/accept`, {
    method: 'POST',
    headers: getHeaders(accessToken),
  });

  return handleResponse<{ member: GroupMember; group: FamilyGroup }>(response);
}

/**
 * Rechazar invitación
 */
export async function rejectInvitation(
  accessToken: string,
  invitationId: string
): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE}/family/invitations/${invitationId}/reject`, {
    method: 'POST',
    headers: getHeaders(accessToken),
  });

  return handleResponse<{ message: string }>(response);
}

/**
 * Unirse a grupo con código
 */
export async function joinWithCode(
  accessToken: string,
  code: string
): Promise<{ member: GroupMember; group: FamilyGroup }> {
  const response = await fetch(`${API_BASE}/family/join/${code}`, {
    method: 'POST',
    headers: getHeaders(accessToken),
  });

  return handleResponse<{ member: GroupMember; group: FamilyGroup }>(response);
}
