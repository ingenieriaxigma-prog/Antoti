/**
 * 👥 GROUP DETAILS MODAL
 * 
 * Modal para ver detalles del grupo, gestionar miembros e invitar participantes.
 */

import React, { useState, useEffect } from 'react';
import { X, Users, Mail, Copy, Settings, Crown, UserPlus, Check, Edit3, Share2, Trash2, AlertTriangle, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner@2.0.3';
import { useAuth } from '../../../contexts/AuthContext';
import { useInvitations } from '../hooks/useInvitations';
import { ManageMembersModal } from './ManageMembersModal';
import { ShareInviteLinkModal } from './ShareInviteLinkModal';
import { familyService } from '../services/family.service';
import type { FamilyGroupWithMembers } from '../types/family.types';
import { otiConfirm } from '../../../components/ui/OtiConfirmDialog';

interface GroupDetailsModalProps {
  group: FamilyGroupWithMembers;
  onClose: () => void;
  onGroupDeleted?: () => void;
  onGroupUpdated?: () => void; // Callback para cuando se actualiza el grupo (ej: nombres de miembros)
}

export function GroupDetailsModal({ group, onClose, onGroupDeleted, onGroupUpdated }: GroupDetailsModalProps) {
  const { currentUser: user } = useAuth();
  const [activeTab, setActiveTab] = useState<'members' | 'invite' | 'settings'>('members');
  const [inviteEmail, setInviteEmail] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [showManageMembers, setShowManageMembers] = useState(false);
  const [showShareLink, setShowShareLink] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLeavingGroup, setIsLeavingGroup] = useState(false);
  const [hasChanges, setHasChanges] = useState(false); // Track if there were any changes
  
  // Estado local para miembros y grupo (permite actualizar sin recargar)
  const [localMembers, setLocalMembers] = useState(group.members || []);
  const [localGroup, setLocalGroup] = useState(group);
  
  // Sincronizar cuando cambie el prop group (por si viene actualizado desde fuera)
  useEffect(() => {
    setLocalGroup(group);
    setLocalMembers(group.members || []);
  }, [group]);
  
  const { sendInvitation, isLoading: isInviting } = useInvitations();
  
  // Verificar si el usuario actual es admin
  const currentMember = group.members?.find(m => m.userId === user?.id);
  const isAdmin = currentMember?.role === 'admin';

  // Generar código de invitación (usando el ID del grupo)
  const inviteCode = `FAM-${group.id.substring(0, 8).toUpperCase()}`;
  
  // Función para cerrar el modal y notificar si hubo cambios
  const handleClose = () => {
    console.log('🚪 handleClose called:', { hasChanges });
    if (hasChanges) {
      console.log('📢 Calling onGroupUpdated()...');
      onGroupUpdated?.(); // Notificar que hubo cambios
    }
    onClose();
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteEmail.trim()) {
      toast.error('Ingresa un correo electrónico');
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      toast.error('Correo electrónico inválido');
      return;
    }

    try {
      await sendInvitation({
        groupId: group.id,
        email: inviteEmail,
      });
      toast.success(`Invitación enviada a ${inviteEmail}`);
      setInviteEmail('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al enviar invitación';
      toast.error('Error al invitar', { description: errorMessage });
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopiedCode(true);
      toast.success('Código copiado al portapapeles');
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      toast.error('Error al copiar código');
    }
  };

  const handleLeaveGroup = async () => {
    const confirmed = await otiConfirm({
      title: `¿Salir del grupo "${group.name}"?`,
      description: 'Ya no podrás ver las transacciones compartidas. Necesitarás una nueva invitación para volver a unirte.',
      variant: 'warning',
      confirmText: 'Sí, salir del grupo',
      cancelText: 'Cancelar'
    });

    if (!confirmed) {
      return;
    }

    setIsLeavingGroup(true);
    try {
      await familyService.leaveGroup(group.id);
      toast.success(`Has salido del grupo "${group.name}"`);
      onGroupDeleted?.(); // Usamos el mismo callback para volver a la lista
      handleClose();
    } catch (error: any) {
      console.error('Error al salir del grupo:', error);
      const errorMessage = error?.message || 'Error al salir del grupo';
      toast.error(errorMessage);
    } finally {
      setIsLeavingGroup(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-[#10B981] px-6 py-6 text-white">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-4xl">{localGroup.emoji}</div>
                <div>
                  <h2 className="text-2xl font-bold">{localGroup.name}</h2>
                  <p className="text-emerald-100 text-sm">
                    {localGroup.memberCount} {localGroup.memberCount === 1 ? 'miembro' : 'miembros'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('members')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'members'
                    ? 'bg-white text-emerald-600'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <Users className="w-4 h-4" />
                Miembros
              </button>
              <button
                onClick={() => setActiveTab('invite')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'invite'
                    ? 'bg-white text-emerald-600'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <Mail className="w-4 h-4" />
                Invitar
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-white text-emerald-600'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <Settings className="w-4 h-4" />
                Config
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'members' && (
              <MembersTab 
                members={localMembers}
                groupId={group.id}
                currentUserId={user?.id}
                isCurrentUserAdmin={isAdmin}
                onManageMembers={() => setShowManageMembers(true)}
                onMemberUpdated={(memberId, updates) => {
                  setLocalMembers(prev => 
                    prev.map(m => m.id === memberId ? { ...m, ...updates } : m)
                  );
                  setHasChanges(true); // Marcar que hubo cambios
                }}
              />
            )}
            {activeTab === 'invite' && (
              <InviteTab
                inviteCode={inviteCode}
                inviteEmail={inviteEmail}
                setInviteEmail={setInviteEmail}
                isInviting={isInviting}
                copiedCode={copiedCode}
                onInvite={handleInvite}
                onCopyCode={handleCopyCode}
                onShareLink={() => setShowShareLink(true)}
              />
            )}
            {activeTab === 'settings' && (
              <SettingsTab 
                group={localGroup} 
                isAdmin={isAdmin}
                isDeleting={isDeleting}
                isLeavingGroup={isLeavingGroup}
                onGroupUpdated={(updates) => {
                  setLocalGroup(prev => ({ 
                    ...prev, 
                    ...updates,
                    // Mantener memberCount actualizado
                    memberCount: prev.memberCount 
                  }));
                  setHasChanges(true); // Marcar que hubo cambios
                }}
                onDeleteGroup={async () => {
                  const confirmed = await otiConfirm({
                    title: '¿Eliminar grupo permanentemente?',
                    description: `Se eliminará el grupo "${group.name}" y todas sus transacciones compartidas. Esta acción no se puede deshacer.`,
                    variant: 'danger',
                    confirmText: 'Sí, eliminar grupo',
                    cancelText: 'Cancelar'
                  });

                  if (!confirmed) {
                    return;
                  }
                  
                  setIsDeleting(true);
                  try {
                    await familyService.deleteGroup(group.id);
                    toast.success('Grupo eliminado correctamente');
                    onGroupDeleted?.();
                    handleClose();
                  } catch (error) {
                    console.error('Error al eliminar grupo:', error);
                    const errorMessage = error instanceof Error ? error.message : 'Error al eliminar el grupo';
                    toast.error(errorMessage);
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                onLeaveGroup={handleLeaveGroup}
              />
            )}
          </div>
        </motion.div>

        {/* Modal de gestión de miembros */}
        {showManageMembers && (
          <ManageMembersModal
            group={group}
            onClose={() => setShowManageMembers(false)}
            onMemberUpdated={() => {
              // Aquí podrías refrescar los datos del grupo si es necesario
              setShowManageMembers(false);
              onGroupUpdated?.(); // Notificar al padre que el grupo se actualizó
            }}
            onUserLeftGroup={() => {
              // Usuario salió del grupo - cerrar modal y notificar al padre
              setShowManageMembers(false);
              handleClose();
              onGroupDeleted?.(); // Usar el mismo callback porque el efecto es el mismo
            }}
          />
        )}

        {/* Modal de compartir link */}
        {showShareLink && (
          <ShareInviteLinkModal
            group={group}
            inviteCode={inviteCode}
            onClose={() => setShowShareLink(false)}
          />
        )}
      </div>
    </AnimatePresence>
  );
}

/**
 * Tab de Miembros
 */
interface MembersTabProps {
  members: any[];
  groupId: string;
  currentUserId?: string;
  isCurrentUserAdmin: boolean;
  onManageMembers: () => void;
  onMemberUpdated?: (memberId: string, updates: any) => void;
}

function MembersTab({ members, groupId, currentUserId, isCurrentUserAdmin, onManageMembers, onMemberUpdated }: MembersTabProps) {
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editedNickname, setEditedNickname] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleEditClick = (member: any) => {
    console.log('✏️ Iniciando edición de nombre:', {
      memberId: member.id,
      currentNickname: member.nickname
    });
    setEditingMemberId(member.id);
    setEditedNickname(member.nickname);
  };

  const handleSaveName = async (member: any) => {
    if (!editedNickname.trim()) {
      toast.error('El nombre no puede estar vacío');
      return;
    }

    setIsSaving(true);
    try {
      console.log('🔄 Actualizando nombre:', {
        groupId,
        memberId: member.id,
        nickname: editedNickname.trim()
      });
      
      await familyService.updateGroupMember(groupId, member.id, {
        nickname: editedNickname.trim(),
      });
      
      console.log('✅ Nombre actualizado correctamente');
      toast.success('Nombre actualizado correctamente');
      
      // Actualizar el estado local
      onMemberUpdated?.(member.id, { nickname: editedNickname.trim() });
      
      // Cerrar modo de edición
      setEditingMemberId(null);
    } catch (error) {
      console.error('❌ Error completo al actualizar nombre:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      toast.error(`Error: ${error instanceof Error ? error.message : 'Error al actualizar nombre'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    console.log('❌ Cancelando edición de nombre');
    setEditingMemberId(null);
    setEditedNickname('');
  };
  
  return (
    <div className="space-y-3">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Miembros del Grupo ({members.length})
          </h3>
          {isCurrentUserAdmin && (
            <button
              onClick={onManageMembers}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium shadow-sm"
            >
              <Edit3 className="w-4 h-4" />
              Gestionar Miembros
            </button>
          )}
        </div>
        {isCurrentUserAdmin && (
          <p className="text-xs text-gray-500 mt-2">
            Presiona "Gestionar Miembros" para editar roles y eliminar miembros
          </p>
        )}
      </div>
      
      {members.map((member) => {
        const isCurrentUser = member.userId === currentUserId;
        const isEditing = editingMemberId === member.id;
        
        return (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-gray-50 rounded-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="text-2xl">{member.emoji || '👤'}</div>
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editedNickname}
                        onChange={(e) => setEditedNickname(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Ingresa tu nombre"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleSaveName(member)}
                          disabled={isSaving}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 text-sm font-medium"
                        >
                          <Check className="w-4 h-4" />
                          {isSaving ? 'Guardando...' : 'Guardar'}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancel}
                          disabled={isSaving}
                          className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 text-sm font-medium"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900">{member.nickname}</p>
                        {isCurrentUser && (
                          <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full font-medium">
                            Tú
                          </span>
                        )}
                        {member.role === 'admin' && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                            <Crown className="w-3 h-3" />
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {member.role === 'admin' ? 'Administrador' : member.role === 'viewer' ? 'Observador' : 'Miembro'}
                      </p>
                    </>
                  )}
                </div>
              </div>
              
              {/* Botón de editar - Solo para el usuario actual */}
              {isCurrentUser && !isEditing && (
                <button
                  type="button"
                  onClick={() => handleEditClick(member)}
                  className="ml-2 p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  title="Editar mi nombre"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        );
      })}

      {members.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hay miembros aún
        </div>
      )}
    </div>
  );
}

/**
 * Tab de Invitar
 */
function InviteTab({
  inviteCode,
  inviteEmail,
  setInviteEmail,
  isInviting,
  copiedCode,
  onInvite,
  onCopyCode,
  onShareLink,
}: {
  inviteCode: string;
  inviteEmail: string;
  setInviteEmail: (email: string) => void;
  isInviting: boolean;
  copiedCode: boolean;
  onInvite: (e: React.FormEvent) => void;
  onCopyCode: () => void;
  onShareLink: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Título */}
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Invitar Nuevos Miembros
        </h3>
        <p className="text-sm text-gray-600">
          Comparte el código o link de invitación para que otros se unan al grupo
        </p>
      </div>

      {/* Botón de compartir link - OPCIÓN PRINCIPAL */}
      <div>
        <button
          onClick={onShareLink}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl hover:shadow-lg transition-all font-medium"
        >
          <Share2 className="w-5 h-5" />
          <span>Compartir Link de Invitación</span>
        </button>
        <p className="text-xs text-gray-500 mt-2 text-center">
          📱 Comparte por WhatsApp, email, SMS o genera código QR
        </p>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 bg-white text-sm text-gray-500">o usa el código</span>
        </div>
      </div>

      {/* Código de invitación */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Código de Invitación
        </h3>
        
        <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-300">
          <p className="text-sm text-gray-600 mb-3">
            O comparte este código directamente:
          </p>
          
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-white px-4 py-3 rounded-lg border border-gray-200">
              <code className="text-lg font-mono font-bold text-emerald-600">
                {inviteCode}
              </code>
            </div>
            
            <button
              onClick={onCopyCode}
              className="px-4 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2"
            >
              {copiedCode ? (
                <>
                  <Check className="w-5 h-5" />
                  <span className="hidden sm:inline">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  <span className="hidden sm:inline">Copiar</span>
                </>
              )}
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-3">
          Las personas pueden usar este código en la app para unirse al grupo.
        </p>
      </div>
    </div>
  );
}

/**
 * Tab de Configuración
 */
function SettingsTab({ 
  group, 
  isAdmin, 
  isDeleting,
  isLeavingGroup, 
  onDeleteGroup,
  onLeaveGroup,
  onGroupUpdated
}: { 
  group: FamilyGroupWithMembers; 
  isAdmin: boolean;
  isDeleting: boolean;
  isLeavingGroup: boolean;
  onDeleteGroup: () => void;
  onLeaveGroup: () => void;
  onGroupUpdated?: (updates: Partial<FamilyGroupWithMembers>) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedName, setEditedName] = useState(group.name);
  const [editedEmoji, setEditedEmoji] = useState(group.emoji);
  const [editedCurrency, setEditedCurrency] = useState(group.currency || 'COP');
  const [requireApproval, setRequireApproval] = useState(group.requireApprovalToJoin ?? true); // Default true (más seguro)
  const [allowGuests, setAllowGuests] = useState(group.allowGuestView || false);

  const handleSave = async () => {
    if (!editedName.trim()) {
      toast.error('El nombre del grupo no puede estar vacío');
      return;
    }

    setIsSaving(true);
    try {
      const updates = {
        name: editedName.trim(),
        emoji: editedEmoji,
        currency: editedCurrency,
        requireApprovalToJoin: requireApproval,
        allowGuestView: allowGuests,
      };
      
      await familyService.updateGroup(group.id, updates);
      
      toast.success('Configuración guardada correctamente');
      
      // Actualizar el estado local
      onGroupUpdated?.(updates);
      
      // Cerrar modo de edición
      setIsEditing(false);
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      toast.error('Error al guardar configuración');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedName(group.name);
    setEditedEmoji(group.emoji);
    setEditedCurrency(group.currency || 'COP');
    setRequireApproval(group.requireApprovalToJoin ?? true); // Default true (más seguro)
    setAllowGuests(group.allowGuestView || false);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Configuración del Grupo
        </h3>
        {isAdmin && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors font-medium"
          >
            <Edit3 className="w-4 h-4" />
            Editar
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Nombre del grupo */}
        <div className="p-4 bg-gray-50 rounded-xl">
          <label className="block text-sm text-gray-600 mb-2">Nombre del Grupo</label>
          {isEditing && isAdmin ? (
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Ej: Familia González"
            />
          ) : (
            <p className="font-semibold text-gray-900">{group.name}</p>
          )}
        </div>

        {/* Emoji del grupo */}
        <div className="p-4 bg-gray-50 rounded-xl">
          <label className="block text-sm text-gray-600 mb-2">Emoji del Grupo</label>
          {isEditing && isAdmin ? (
            <input
              type="text"
              value={editedEmoji}
              onChange={(e) => setEditedEmoji(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-2xl"
              placeholder="🏠"
              maxLength={2}
            />
          ) : (
            <p className="text-2xl">{group.emoji}</p>
          )}
        </div>

        {/* Moneda */}
        <div className="p-4 bg-gray-50 rounded-xl">
          <label className="block text-sm text-gray-600 mb-2">Moneda</label>
          {isEditing && isAdmin ? (
            <select
              value={editedCurrency}
              onChange={(e) => setEditedCurrency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="COP">COP - Peso Colombiano</option>
              <option value="USD">USD - Dólar Estadounidense</option>
              <option value="EUR">EUR - Euro</option>
              <option value="MXN">MXN - Peso Mexicano</option>
              <option value="ARS">ARS - Peso Argentino</option>
            </select>
          ) : (
            <p className="font-semibold text-gray-900">{group.currency || 'COP'}</p>
          )}
        </div>

        {/* Requiere aprobación */}
        <div className="p-4 bg-gray-50 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Requiere aprobación para unirse</label>
            {isEditing && isAdmin ? (
              <button
                onClick={() => setRequireApproval(!requireApproval)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  requireApproval ? 'bg-emerald-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    requireApproval ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            ) : (
              <p className="font-semibold text-gray-900">{group.requireApprovalToJoin ? 'Sí' : 'No'}</p>
            )}
          </div>
          
          {/* Texto explicativo */}
          {requireApproval ? (
            <div className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <span className="text-emerald-600 text-sm">🔒</span>
              <p className="text-xs text-emerald-700 flex-1">
                <strong>Solo invitaciones directas por email</strong> (recomendado). Más seguro: solo las personas que invites pueden unirse.
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <span className="text-amber-600 text-sm">⚠️</span>
              <p className="text-xs text-amber-700 flex-1">
                <strong>Código abierto</strong>. Cualquier persona con el código de invitación podrá unirse al grupo sin aprobación previa.
              </p>
            </div>
          )}
        </div>

        {/* Permitir vista de invitados */}
        <div className="p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-600">Permitir vista de invitados</label>
            {isEditing && isAdmin ? (
              <button
                onClick={() => setAllowGuests(!allowGuests)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  allowGuests ? 'bg-emerald-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    allowGuests ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            ) : (
              <p className="font-semibold text-gray-900">{group.allowGuestView ? 'Sí' : 'No'}</p>
            )}
          </div>
        </div>

        {/* Fecha de creación */}
        <div className="p-4 bg-gray-50 rounded-xl">
          <label className="block text-sm text-gray-600 mb-2">Creado</label>
          <p className="font-semibold text-gray-900">
            {group.createdAt ? new Date(group.createdAt).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }) : 'Fecha no disponible'}
          </p>
        </div>
      </div>

      {/* Botones de acción al editar */}
      {isEditing && isAdmin && (
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <Check className="w-5 h-5" />
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Salir del grupo - Para TODOS los usuarios */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-orange-900 mb-1">
                Salir del Grupo
              </h4>
              <p className="text-sm text-orange-800">
                Si sales del grupo, ya no podrás ver las transacciones compartidas. Necesitarás una nueva invitación para volver a unirte.
              </p>
              {isAdmin && (
                <p className="text-xs text-orange-900 font-medium mt-2">
                  ⚠️ Si eres el único administrador, debes asignar otro administrador antes de salir.
                </p>
              )}
            </div>
          </div>
          
          <button
            onClick={onLeaveGroup}
            disabled={isLeavingGroup}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <LogOut className="w-5 h-5" />
            {isLeavingGroup ? 'Saliendo...' : 'Salir del Grupo'}
          </button>
        </div>
      </div>

      {/* Zona de peligro - Solo para admins */}
      {isAdmin && (
        <div className="mt-6">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-red-900 mb-1">
                  Zona de Peligro
                </h4>
                <p className="text-sm text-red-800">
                  Esta acción es permanente y no se puede deshacer. Todos los datos del grupo serán eliminados.
                </p>
              </div>
            </div>
            
            <button
              onClick={onDeleteGroup}
              disabled={isDeleting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <Trash2 className="w-5 h-5" />
              {isDeleting ? 'Eliminando...' : 'Eliminar Grupo Permanentemente'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}