/**
 * Estado de un miembro del grupo
 */
export type MemberStatus = 'active' | 'inactive' | 'pending';

/**
 * Estado de una invitación
 */
export type InvitationStatus = 'pending' | 'accepted' | 'rejected' | 'expired';

/**
 * Invitación a grupo familiar
 */
export interface FamilyInvitation {
  id: string;
  groupId: string;
  groupName?: string;
  groupEmoji?: string;
  email: string;
  invitedBy: string;
  invitedByEmail?: string;
  status: InvitationStatus;
  code: string;
  createdAt: string;
  expiresAt: string;
  acceptedAt?: string;
  rejectedAt?: string;
}

/**
 * DTO para crear invitación
 */
export interface CreateInvitationDTO {
  groupId: string;
  email: string;
}

// =====================
// TIPOS EXISTENTES
// =====================

// =====================
// GRUPO FAMILIAR
// =====================

export interface FamilyGroup {
  id: string;
  name: string;
  emoji: string;
  createdBy: string;
  requireApprovalToJoin: boolean;
  allowGuestView: boolean;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyGroupWithMembers extends FamilyGroup {
  memberCount: number;
  members: GroupMemberSummary[];
}

// =====================
// MIEMBRO DEL GRUPO
// =====================

export type MemberRole = 'admin' | 'member' | 'viewer';

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: MemberRole;
  status: MemberStatus;
  nickname: string;
  emoji: string;
  autoShareExpenses: boolean;
  autoShareIncome: boolean;
  notificationsEnabled: boolean;
  joinedAt: string;
  createdAt: string;
}

export interface GroupMemberSummary {
  id: string;
  userId: string;
  nickname: string;
  emoji: string;
  role: MemberRole;
}

// =====================
// TRANSACCIÓN COMPARTIDA
// =====================

export type TransactionType = 'expense' | 'income' | 'transfer';
export type TransactionVisibility = 'all' | 'admins';

export interface GroupTransaction {
  id: string;
  groupId: string;
  originalTransactionId: string | null;
  sharedByUserId: string;
  transactionType: TransactionType;
  amount: number;
  category: string | null;
  subcategory: string | null;
  description: string | null;
  transactionDate: string;
  visibility: TransactionVisibility;
  isIntrafamilyTransfer: boolean;
  involvedMembers: string[] | null;
  receiptUrl: string | null; // ✨ URL del comprobante/recibo adjunto
  createdAt: string;
}

export interface GroupTransactionWithDetails extends GroupTransaction {
  reactions: GroupReaction[];
  comments: GroupComment[];
  sharedByMember?: GroupMemberSummary;
}

// =====================
// REACCIONES
// =====================

export interface GroupReaction {
  id: string;
  groupTransactionId: string;
  userId: string;
  emoji: string;
  createdAt: string;
  userNickname?: string;
  userEmoji?: string;
}

export interface GroupReactionSummary {
  emoji: string;
  count: number;
  userIds: string[];
  hasUserReacted: boolean;
}

// =====================
// COMENTARIOS
// =====================

export interface GroupComment {
  id: string;
  groupTransactionId: string;
  userId: string;
  text: string;
  createdAt: string;
  userNickname?: string;
  userEmoji?: string;
}

export interface GroupCommentWithUser extends GroupComment {
  userNickname?: string;
  userEmoji?: string;
}

// =====================
// NOTIFICACIONES
// =====================

export type NotificationType = 
  | 'new_transaction' 
  | 'new_member' 
  | 'member_left' 
  | 'reaction' 
  | 'comment' 
  | 'member_joined';

export interface GroupNotification {
  id: string;
  groupId: string;
  notificationType: NotificationType;
  triggeredByUserId: string;
  groupTransactionId: string | null;
  message: string;
  readBy: Record<string, string>;
  createdAt: string;
}

export interface GroupNotificationWithDetails extends GroupNotification {
  groupName?: string;
  groupEmoji?: string;
  isRead: boolean;
}

// =====================
// DTOs (Data Transfer Objects)
// =====================

export interface CreateGroupDTO {
  name: string;
  emoji?: string;
  config?: {
    requireApprovalToJoin?: boolean;
    allowGuestView?: boolean;
    currency?: string;
  };
}

export interface UpdateGroupDTO {
  name?: string;
  emoji?: string;
  requireApprovalToJoin?: boolean;
  allowGuestView?: boolean;
  currency?: string;
}

export interface InviteMemberDTO {
  email?: string;
  userId?: string;
  proposedRole?: 'member' | 'viewer';
  proposedNickname?: string;
}

export interface ShareTransactionDTO {
  originalTransactionId?: string | null;
  type: TransactionType;
  amount: number;
  category?: string | null;
  subcategory?: string | null;
  description?: string | null;
  date: string;
  visibility?: TransactionVisibility;
  isIntrafamilyTransfer?: boolean;
  involvedMembers?: string[];
  receiptUrl?: string | null; // ✨ URL del comprobante/recibo adjunto
}

export interface AddReactionDTO {
  emoji: string;
}

export interface AddCommentDTO {
  text: string;
}

export interface UpdateMemberDTO {
  nickname?: string;
  emoji?: string;
  role?: MemberRole;
  status?: MemberStatus;
  autoShareExpenses?: boolean;
  autoShareIncome?: boolean;
  notificationsEnabled?: boolean;
}

// =====================
// API RESPONSES
// =====================

export interface CreateGroupResponse {
  group: FamilyGroup;
  member: GroupMember;
}

export interface ListGroupsResponse {
  groups: FamilyGroupWithMembers[];
}

export interface GetGroupResponse {
  group: FamilyGroup & {
    members: GroupMember[];
  };
}

export interface ShareTransactionResponse {
  transaction: GroupTransaction;
}

export interface ListTransactionsResponse {
  transactions: GroupTransactionWithDetails[];
}

export interface AddReactionResponse {
  reaction: GroupReaction;
}

export interface AddCommentResponse {
  comment: GroupComment;
}

export interface GetNotificationsResponse {
  notifications: GroupNotification[];
  unreadCount: number;
}

// =====================
// UI STATE
// =====================

export interface FamilyState {
  groups: FamilyGroupWithMembers[];
  selectedGroupId: string | null;
  selectedGroup: FamilyGroupWithMembers | null;
  transactions: GroupTransactionWithDetails[];
  notifications: GroupNotificationWithDetails[];
  unreadNotificationsCount: number;
  isLoading: boolean;
  error: string | null;
}

// =====================
// HELPERS & UTILS
// =====================

export interface TransactionFilter {
  startDate?: string;
  endDate?: string;
  category?: string;
  type?: TransactionType;
  sharedByUserId?: string;
}

export interface NotificationFilter {
  unreadOnly?: boolean;
  groupId?: string;
  type?: NotificationType;
}

// =====================
// ESTADÍSTICAS
// =====================

export interface GroupStats {
  totalExpenses: number;
  totalIncome: number;
  balance: number;
  transactionCount: number;
  memberCount: number;
  mostActiveCategory: string | null;
  mostActiveUser: string | null;
}

export interface MemberStats {
  memberId: string;
  memberName: string;
  totalShared: number;
  transactionCount: number;
  lastActivity: string;
}