/**
 * 💾 SERVICIO DE CONVERSACIONES - FRONTEND
 * 
 * Gestiona las operaciones CRUD de conversaciones con Oti
 * a través del backend.
 */

import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import type {
  Conversation,
  ConversationSummary,
  CreateConversationRequest,
  UpdateConversationRequest,
  AddMessageRequest,
} from '../types/conversation.types';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3`;

/**
 * Obtiene el token de acceso del usuario actual
 */
function getAccessToken(): string | null {
  return localStorage.getItem('accessToken');
}

/**
 * Headers comunes para todas las peticiones
 */
function getHeaders(): HeadersInit {
  const accessToken = getAccessToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': accessToken ? `Bearer ${accessToken}` : `Bearer ${publicAnonKey}`,
  };
}

/**
 * Verificar si el usuario está autenticado
 */
export function isUserAuthenticated(): boolean {
  return !!getAccessToken();
}

/**
 * Crear una nueva conversación
 */
export async function createConversation(
  data: CreateConversationRequest = {}
): Promise<Conversation> {
  if (!isUserAuthenticated()) {
    throw new Error('Debes iniciar sesión para usar esta función');
  }

  const response = await fetch(`${API_BASE}/conversations`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al crear conversación');
  }

  const result = await response.json();
  return result.conversation;
}

/**
 * Listar todas las conversaciones del usuario
 */
export async function listConversations(): Promise<ConversationSummary[]> {
  if (!isUserAuthenticated()) {
    console.log('ℹ️ Usuario no autenticado - retornando lista vacía');
    return [];
  }

  const response = await fetch(`${API_BASE}/conversations`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('❌ Error al listar conversaciones:', error);
    // Si es error de autenticación, retornar lista vacía en lugar de lanzar error
    if (response.status === 401) {
      console.log('ℹ️ Sesión inválida - retornando lista vacía');
      return [];
    }
    throw new Error(error.error || 'Error al listar conversaciones');
  }

  const result = await response.json();
  return result.conversations;
}

/**
 * Obtener una conversación específica con todos sus mensajes
 */
export async function getConversation(conversationId: string): Promise<Conversation> {
  if (!isUserAuthenticated()) {
    throw new Error('Debes iniciar sesión para ver conversaciones');
  }

  const response = await fetch(`${API_BASE}/conversations/${conversationId}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al obtener conversación');
  }

  const result = await response.json();
  return result.conversation;
}

/**
 * Actualizar el título de una conversación
 */
export async function updateConversationTitle(
  conversationId: string,
  data: UpdateConversationRequest
): Promise<Conversation> {
  const response = await fetch(`${API_BASE}/conversations/${conversationId}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al actualizar conversación');
  }

  const result = await response.json();
  return result.conversation;
}

/**
 * Eliminar una conversación
 */
export async function deleteConversation(conversationId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/conversations/${conversationId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al eliminar conversación');
  }
}

/**
 * Agregar un mensaje a una conversación existente
 */
export async function addMessageToConversation(
  conversationId: string,
  message: AddMessageRequest
): Promise<Conversation> {
  const response = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al agregar mensaje');
  }

  const result = await response.json();
  return result.conversation;
}

/**
 * Generar título automático basado en el primer mensaje del usuario
 * usando GPT-4o (llamada al backend)
 */
export async function generateConversationTitle(
  firstUserMessage: string
): Promise<string> {
  const response = await fetch(`${API_BASE}/conversations/generate-title`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ message: firstUserMessage }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al generar título');
  }

  const result = await response.json();
  return result.title;
}