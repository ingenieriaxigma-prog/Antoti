/**
 * 💬 TIPOS DE DATOS: CONVERSACIONES DE OTI
 * 
 * Define la estructura de datos para el historial de conversaciones
 * que se guarda en Supabase KV Store.
 */

/**
 * Mensaje individual en una conversación
 */
export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // ISO 8601 format
}

/**
 * Conversación completa con todos sus mensajes
 */
export interface Conversation {
  id: string;
  userId: string;
  title: string;
  messages: ConversationMessage[];
  createdAt: string; // ISO 8601 format
  updatedAt: string; // ISO 8601 format
}

/**
 * Conversación resumida para listar (sin mensajes)
 */
export interface ConversationSummary {
  id: string;
  userId: string;
  title: string;
  messageCount: number;
  lastMessagePreview: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Request para crear nueva conversación
 */
export interface CreateConversationRequest {
  title?: string; // Opcional, se auto-genera si no se provee
  initialMessage?: string; // Mensaje inicial del usuario
}

/**
 * Request para actualizar título de conversación
 */
export interface UpdateConversationRequest {
  title: string;
}

/**
 * Request para agregar mensaje a conversación
 */
export interface AddMessageRequest {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Response al crear conversación
 */
export interface CreateConversationResponse {
  conversation: Conversation;
}

/**
 * Response al listar conversaciones
 */
export interface ListConversationsResponse {
  conversations: ConversationSummary[];
}

/**
 * Response al obtener conversación
 */
export interface GetConversationResponse {
  conversation: Conversation;
}
