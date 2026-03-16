/**
 * 👥 FAMILY GROUPS - SERVICE
 * 
 * Servicio para interactuar con la API de finanzas familiares.
 * 
 * IMPORTANTE: Este servicio es 100% independiente de los servicios existentes.
 */

import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import type {
  FamilyGroup,
  FamilyGroupWithMembers,
  GroupTransaction,
  GroupTransactionWithDetails,
  GroupReaction,
  GroupComment,
  GroupNotification,
  CreateGroupDTO,
  UpdateGroupDTO,
  ShareTransactionDTO,
  AddReactionDTO,
  AddCommentDTO,
  CreateGroupResponse,
  ListGroupsResponse,
  GetGroupResponse,
  ShareTransactionResponse,
  ListTransactionsResponse,
  AddReactionResponse,
  AddCommentResponse,
  GetNotificationsResponse,
} from '../types/family.types';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3`;

/**
 * Helper para obtener headers con autorización
 */
function getHeaders(accessToken: string): HeadersInit {
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
// GRUPOS
// =====================

/**
 * Crear un nuevo grupo familiar
 */
export async function createGroup(
  accessToken: string,
  data: CreateGroupDTO
): Promise<CreateGroupResponse> {
  const response = await fetch(`${API_BASE}/family/groups`, {
    method: 'POST',
    headers: getHeaders(accessToken),
    body: JSON.stringify(data),
  });

  return handleResponse<CreateGroupResponse>(response);
}

/**
 * Listar grupos del usuario autenticado
 */
export async function listGroups(
  accessToken: string
): Promise<FamilyGroupWithMembers[]> {
  const response = await fetch(`${API_BASE}/family/groups`, {
    method: 'GET',
    headers: getHeaders(accessToken),
  });

  const data = await handleResponse<ListGroupsResponse>(response);
  return data.groups;
}

/**
 * Obtener detalles de un grupo específico
 */
export async function getGroup(
  accessToken: string,
  groupId: string
): Promise<GetGroupResponse> {
  const response = await fetch(`${API_BASE}/family/groups/${groupId}`, {
    method: 'GET',
    headers: getHeaders(accessToken),
  });

  return handleResponse<GetGroupResponse>(response);
}

/**
 * Actualizar un grupo
 */
export async function updateGroup(
  groupId: string,
  data: UpdateGroupDTO
): Promise<FamilyGroup> {
  // Obtener accessToken desde el contexto
  const accessToken = localStorage.getItem('accessToken') || '';
  
  const response = await fetch(`${API_BASE}/family/groups/${groupId}`, {
    method: 'PATCH',
    headers: getHeaders(accessToken),
    body: JSON.stringify(data),
  });

  return handleResponse<FamilyGroup>(response);
}

/**
 * Eliminar un grupo (solo admin)
 */
export async function deleteGroup(
  groupId: string
): Promise<void> {
  // Obtener accessToken desde el contexto
  const accessToken = localStorage.getItem('accessToken') || '';
  
  const response = await fetch(`${API_BASE}/family/groups/${groupId}`, {
    method: 'DELETE',
    headers: getHeaders(accessToken),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || `Error ${response.status}`);
  }
}

// =====================
// TRANSACCIONES
// =====================

/**
 * Compartir una transacción en un grupo
 */
export async function shareTransaction(
  accessToken: string,
  groupId: string,
  data: ShareTransactionDTO
): Promise<GroupTransaction> {
  console.log('🌐 [shareTransaction] Calling API:', {
    url: `${API_BASE}/family/groups/${groupId}/transactions`,
    groupId,
    hasReceiptUrl: !!data.receiptUrl,
  });
  
  const response = await fetch(`${API_BASE}/family/groups/${groupId}/transactions`, {
    method: 'POST',
    headers: getHeaders(accessToken),
    body: JSON.stringify(data),
  });

  console.log('📡 [shareTransaction] Response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ [shareTransaction] Error response:', errorText);
    throw new Error(errorText || `Error ${response.status}`);
  }
  
  const result = await response.json() as ShareTransactionResponse;
  console.log('✅ [shareTransaction] Success:', {
    transactionId: result.transaction?.id,
    hasReceiptUrl: !!result.transaction?.receiptUrl,
  });
  
  return result.transaction;
}

/**
 * Listar transacciones de un grupo
 */
export async function listGroupTransactions(
  accessToken: string,
  groupId: string,
  options?: {
    limit?: number;
    offset?: number;
    startDate?: string;
    endDate?: string;
  }
): Promise<GroupTransactionWithDetails[]> {
  const params = new URLSearchParams();
  
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.offset) params.append('offset', options.offset.toString());
  if (options?.startDate) params.append('startDate', options.startDate);
  if (options?.endDate) params.append('endDate', options.endDate);

  const url = `${API_BASE}/family/groups/${groupId}/transactions?${params.toString()}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders(accessToken),
  });

  const data = await handleResponse<ListTransactionsResponse>(response);
  return data.transactions;
}

// =====================
// REACCIONES
// =====================

/**
 * Agregar reacción a una transacción
 */
export async function addReaction(
  accessToken: string,
  groupId: string,
  transactionId: string,
  data: AddReactionDTO
): Promise<GroupReaction> {
  const response = await fetch(
    `${API_BASE}/family/groups/${groupId}/transactions/${transactionId}/reactions`,
    {
      method: 'POST',
      headers: getHeaders(accessToken),
      body: JSON.stringify(data),
    }
  );

  const result = await handleResponse<AddReactionResponse>(response);
  return result.reaction;
}

/**
 * Eliminar reacción de una transacción
 */
export async function removeReaction(
  accessToken: string,
  groupId: string,
  transactionId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/family/groups/${groupId}/transactions/${transactionId}/reactions`,
    {
      method: 'DELETE',
      headers: getHeaders(accessToken),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || `Error ${response.status}`);
  }
}

/**
 * Actualizar transacción grupal
 */
export async function updateGroupTransaction(
  accessToken: string,
  groupId: string,
  transactionId: string,
  updates: Partial<ShareTransactionDTO>
): Promise<GroupTransaction> {
  const response = await fetch(
    `${API_BASE}/family/groups/${groupId}/transactions/${transactionId}`,
    {
      method: 'PUT',
      headers: getHeaders(accessToken),
      body: JSON.stringify(updates),
    }
  );

  const result = await handleResponse<{ transaction: GroupTransaction }>(response);
  return result.transaction;
}

/**
 * Eliminar transacción grupal
 */
export async function deleteGroupTransaction(
  accessToken: string,
  groupId: string,
  transactionId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/family/groups/${groupId}/transactions/${transactionId}`,
    {
      method: 'DELETE',
      headers: getHeaders(accessToken),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || `Error ${response.status}`);
  }
}

// =====================
// COMENTARIOS
// =====================

/**
 * Agregar comentario a una transacción
 */
export async function addComment(
  accessToken: string,
  groupId: string,
  transactionId: string,
  data: AddCommentDTO
): Promise<GroupComment> {
  const response = await fetch(
    `${API_BASE}/family/groups/${groupId}/transactions/${transactionId}/comments`,
    {
      method: 'POST',
      headers: getHeaders(accessToken),
      body: JSON.stringify(data),
    }
  );

  const result = await handleResponse<AddCommentResponse>(response);
  return result.comment;
}

/**
 * Eliminar comentario
 * Nota: Se implementará en fase posterior
 */
export async function deleteComment(
  accessToken: string,
  groupId: string,
  transactionId: string,
  commentId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/family/groups/${groupId}/transactions/${transactionId}/comments/${commentId}`,
    {
      method: 'DELETE',
      headers: getHeaders(accessToken),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || `Error ${response.status}`);
  }
}

// =====================
// NOTIFICACIONES
// =====================

/**
 * Obtener notificaciones del usuario
 */
export async function getNotifications(
  accessToken: string,
  options?: {
    limit?: number;
  }
): Promise<GetNotificationsResponse> {
  const params = new URLSearchParams();
  if (options?.limit) params.append('limit', options.limit.toString());

  const url = `${API_BASE}/family/notifications?${params.toString()}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders(accessToken),
  });

  return handleResponse<GetNotificationsResponse>(response);
}

/**
 * Marcar notificación como leída
 */
export async function markNotificationAsRead(
  accessToken: string,
  notificationId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/family/notifications/${notificationId}/read`,
    {
      method: 'POST',
      headers: getHeaders(accessToken),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || `Error ${response.status}`);
  }
}

/**
 * Marcar todas las notificaciones como leídas
 */
export async function markAllNotificationsAsRead(
  accessToken: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/family/notifications/read-all`,
    {
      method: 'POST',
      headers: getHeaders(accessToken),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || `Error ${response.status}`);
  }
}

// =====================
// HELPERS & UTILS
// =====================

/**
 * Convertir monto a formato de moneda
 */
export function formatCurrency(amount: number, currency: string = 'COP'): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Convertir fecha ISO a formato local
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Convertir fecha ISO a formato relativo (hace 2 días, etc.)
 */
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes <= 1 ? 'Ahora' : `Hace ${diffMinutes} minutos`;
    }
    return diffHours === 1 ? 'Hace 1 hora' : `Hace ${diffHours} horas`;
  }

  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
  if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;
  
  return `Hace ${Math.floor(diffDays / 365)} años`;
}

/**
 * Validar nombre de grupo
 */
export function validateGroupName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'El nombre es requerido' };
  }
  
  if (name.trim().length < 3) {
    return { valid: false, error: 'El nombre debe tener al menos 3 caracteres' };
  }
  
  if (name.trim().length > 100) {
    return { valid: false, error: 'El nombre no puede tener más de 100 caracteres' };
  }
  
  return { valid: true };
}

/**
 * Validar monto de transacción
 */
export function validateAmount(amount: number): { valid: boolean; error?: string } {
  if (amount <= 0) {
    return { valid: false, error: 'El monto debe ser mayor a cero' };
  }
  
  if (amount > 999999999) {
    return { valid: false, error: 'El monto es demasiado grande' };
  }
  
  return { valid: true };
}

/**
 * Validar comentario
 */
export function validateComment(text: string): { valid: boolean; error?: string } {
  if (!text || text.trim().length === 0) {
    return { valid: false, error: 'El comentario no puede estar vacío' };
  }
  
  if (text.trim().length > 500) {
    return { valid: false, error: 'El comentario no puede tener más de 500 caracteres' };
  }
  
  return { valid: true };
}

/**
 * Obtener icono de tipo de transacción
 */
export function getTransactionTypeIcon(type: string): string {
  switch (type) {
    case 'expense':
      return '💸';
    case 'income':
      return '💰';
    case 'transfer':
      return '🔄';
    default:
      return '📝';
  }
}

/**
 * Obtener color de tipo de transacción
 */
export function getTransactionTypeColor(type: string): string {
  switch (type) {
    case 'expense':
      return '#EF4444'; // red
    case 'income':
      return '#10B981'; // green
    case 'transfer':
      return '#3B82F6'; // blue
    default:
      return '#6B7280'; // gray
  }
}

// =====================
// GESTIÓN DE MIEMBROS
// =====================

/**
 * Actualizar información de un miembro del grupo
 */
export async function updateGroupMember(
  groupId: string,
  memberId: string,
  data: {
    nickname?: string;
    emoji?: string;
    role?: 'admin' | 'member' | 'viewer';
  }
): Promise<void> {
  // Obtener accessToken desde el contexto
  const accessToken = localStorage.getItem('accessToken') || '';
  
  const url = `${API_BASE}/family/groups/${groupId}/members/${memberId}`;
  
  console.log('📡 updateGroupMember - Request:', {
    url,
    method: 'PATCH',
    hasToken: !!accessToken,
    tokenLength: accessToken.length,
    data
  });
  
  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: getHeaders(accessToken),
      body: JSON.stringify(data),
    });

    console.log('📡 updateGroupMember - Response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
      console.error('📡 updateGroupMember - Error response:', error);
      throw new Error(error.error || `Error ${response.status}`);
    }
    
    console.log('✅ updateGroupMember - Success');
  } catch (error) {
    console.error('📡 updateGroupMember - Fetch error:', error);
    throw error;
  }
}

/**
 * Remover un miembro del grupo (por admin) o salir del grupo (usuario normal)
 */
export async function removeGroupMember(
  groupId: string,
  memberId: string
): Promise<void> {
  // Obtener accessToken desde el contexto
  const accessToken = localStorage.getItem('accessToken') || '';
  
  const response = await fetch(
    `${API_BASE}/family/groups/${groupId}/members/${memberId}`,
    {
      method: 'DELETE',
      headers: getHeaders(accessToken),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || `Error ${response.status}`);
  }
}

/**
 * Salir del grupo (usuario abandona el grupo por su propia voluntad)
 */
export async function leaveGroup(
  groupId: string
): Promise<void> {
  // Obtener accessToken desde el contexto
  const accessToken = localStorage.getItem('accessToken') || '';
  
  const response = await fetch(
    `${API_BASE}/family/groups/${groupId}/leave`,
    {
      method: 'POST',
      headers: getHeaders(accessToken),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || `Error ${response.status}`);
  }
}

/**
 * Invitar un miembro al grupo
 */
export async function inviteMember(
  groupId: string,
  data: { email: string }
): Promise<{ code: string; invitationId: string }> {
  // Obtener accessToken desde el contexto
  const accessToken = localStorage.getItem('accessToken') || '';
  
  const response = await fetch(
    `${API_BASE}/family/groups/${groupId}/invitations`,
    {
      method: 'POST',
      headers: getHeaders(accessToken),
      body: JSON.stringify(data),
    }
  );

  return handleResponse<{ code: string; invitationId: string }>(response);
}

// =====================
// EXPORT DEFAULT
// =====================

export const familyService = {
  // Grupos
  createGroup,
  listGroups,
  getGroup,
  updateGroup,
  deleteGroup,
  leaveGroup,
  
  // Transacciones
  shareTransaction,
  listGroupTransactions,
  
  // Reacciones
  addReaction,
  removeReaction,
  
  // Comentarios
  addComment,
  deleteComment,
  
  // Notificaciones
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  
  // Miembros
  updateGroupMember,
  removeGroupMember,
  inviteMember,
  
  // Helpers
  formatCurrency,
  formatDate,
  formatRelativeDate,
  validateGroupName,
  validateAmount,
  validateComment,
  getTransactionTypeIcon,
  getTransactionTypeColor,
};
