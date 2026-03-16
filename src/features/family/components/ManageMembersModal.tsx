/**
 * 👥 MANAGE MEMBERS MODAL
 * 
 * Modal para gestionar miembros del grupo (editar, cambiar roles, remover).
 */

import React, { useState } from 'react';
import { X, Crown, User, Eye, Edit2, Trash2, Mail, Copy, Check, LogOut, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner@2.0.3';
import { useAuth } from '../../../contexts/AuthContext';
import type { FamilyGroupWithMembers, GroupMemberSummary, MemberRole } from '../types/family.types';
import { familyService } from '../services/family.service';
import { otiConfirm } from '../../../components/ui/OtiConfirmDialog';

interface ManageMembersModalProps {
  group: FamilyGroupWithMembers;
  onClose: () => void;
  onMemberUpdated?: () => void;
  onUserLeftGroup?: () => void;
}

export function ManageMembersModal({ group, onClose, onMemberUpdated, onUserLeftGroup }: ManageMembersModalProps) {
  const { currentUser: user } = useAuth();
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ nickname: '', emoji: '', role: 'member' as MemberRole });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInviteSection, setShowInviteSection] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [codeCopied, setCodeCopied] = useState(false);
  const [isLeavingGroup, setIsLeavingGroup] = useState(false);

  // Verificar si el usuario actual es admin
  const currentMember = group.members.find(m => m.userId === user?.id);
  const isAdmin = currentMember?.role === 'admin';

  const handleStartEdit = (member: GroupMemberSummary) => {
    setEditingMemberId(member.id);
    setEditForm({
      nickname: member.nickname,
      emoji: member.emoji,
      role: member.role
    });
  };

  const handleCancelEdit = () => {
    setEditingMemberId(null);
    setEditForm({ nickname: '', emoji: '', role: 'member' });
  };

  const handleUpdateMember = async (memberId: string) => {
    if (!editForm.nickname.trim()) {
      toast.error('El nickname no puede estar vacío');
      return;
    }

    setIsSubmitting(true);
    try {
      await familyService.updateGroupMember(group.id, memberId, {
        nickname: editForm.nickname.trim(),
        emoji: editForm.emoji,
        role: editForm.role
      });

      toast.success('Miembro actualizado correctamente');
      setEditingMemberId(null);
      onMemberUpdated?.();
    } catch (error) {
      console.error('Error al actualizar miembro:', error);
      toast.error('Error al actualizar miembro');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    const confirmed = await otiConfirm({
      title: `¿Remover a ${memberName}?`,
      description: 'Esta persona ya no podrá acceder a las transacciones del grupo.',
      variant: 'danger',
      confirmText: 'Sí, remover',
      cancelText: 'Cancelar'
    });

    if (!confirmed) {
      return;
    }

    setIsSubmitting(true);
    try {
      await familyService.removeGroupMember(group.id, memberId);
      toast.success(`${memberName} ha sido removido del grupo`);
      onMemberUpdated?.();
    } catch (error) {
      console.error('Error al remover miembro:', error);
      toast.error('Error al remover miembro');
    } finally {
      setIsSubmitting(false);
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
      onUserLeftGroup?.();
      onClose();
    } catch (error: any) {
      console.error('Error al salir del grupo:', error);
      const errorMessage = error?.message || 'Error al salir del grupo';
      toast.error(errorMessage);
    } finally {
      setIsLeavingGroup(false);
    }
  };

  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error('Ingresa un email válido');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await familyService.inviteMember(group.id, { email: inviteEmail.trim() });
      toast.success(`Invitación enviada a ${inviteEmail}`);
      setInviteCode(result.code);
      setInviteEmail('');
    } catch (error) {
      console.error('Error al enviar invitación:', error);
      toast.error('Error al enviar invitación');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      setCodeCopied(true);
      toast.success('Código copiado al portapapeles');
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  const getRoleIcon = (role: MemberRole) => {
    switch (role) {
      case 'admin': return <Crown className="w-4 h-4" />;
      case 'viewer': return <Eye className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getRoleLabel = (role: MemberRole) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'viewer': return 'Observador';
      default: return 'Miembro';
    }
  };

  const getRoleColor = (role: MemberRole) => {
    switch (role) {
      case 'admin': return 'text-yellow-600 bg-yellow-50';
      case 'viewer': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Gestionar Miembros
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {group.members.length} {group.members.length === 1 ? 'miembro' : 'miembros'} en {group.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Sección de invitar */}
          {isAdmin && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <button
                onClick={() => setShowInviteSection(!showInviteSection)}
                className="flex items-center gap-2 text-emerald-700 font-medium mb-3"
              >
                <Mail className="w-5 h-5" />
                <span>Invitar nuevo miembro</span>
              </button>

              <AnimatePresence>
                {showInviteSection && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-3"
                  >
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="correo@ejemplo.com"
                        className="flex-1 px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        disabled={isSubmitting}
                      />
                      <button
                        onClick={handleSendInvite}
                        disabled={isSubmitting || !inviteEmail.trim()}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                      >
                        Enviar
                      </button>
                    </div>

                    {inviteCode && (
                      <div className="bg-white rounded-lg p-3 border border-emerald-300">
                        <p className="text-sm text-gray-600 mb-2">Código de invitación generado:</p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 px-3 py-2 bg-gray-50 rounded border border-gray-200 font-mono text-sm">
                            {inviteCode}
                          </code>
                          <button
                            onClick={handleCopyCode}
                            className="p-2 hover:bg-emerald-100 rounded-lg transition-colors"
                            title="Copiar código"
                          >
                            {codeCopied ? (
                              <Check className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <Copy className="w-5 h-5 text-gray-600" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Lista de miembros */}
          <div className="space-y-3">
            {group.members.map((member) => {
              const isCurrentUser = member.userId === user?.id;
              const isEditing = editingMemberId === member.id;
              const canEdit = isAdmin && !isCurrentUser;
              const canRemove = isAdmin && !isCurrentUser;

              return (
                <motion.div
                  key={member.id}
                  layout
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:border-emerald-300 transition-colors"
                >
                  {isEditing ? (
                    // Modo edición
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={editForm.emoji}
                          onChange={(e) => setEditForm({ ...editForm, emoji: e.target.value })}
                          placeholder="😊"
                          maxLength={2}
                          className="w-16 text-center text-2xl px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          value={editForm.nickname}
                          onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
                          placeholder="Nickname"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rol
                        </label>
                        <select
                          value={editForm.role}
                          onChange={(e) => setEditForm({ ...editForm, role: e.target.value as MemberRole })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        >
                          <option value="admin">Administrador</option>
                          <option value="member">Miembro</option>
                          <option value="viewer">Observador</option>
                        </select>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateMember(member.id)}
                          disabled={isSubmitting}
                          className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={isSubmitting}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Modo vista
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="text-3xl">{member.emoji}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900">
                              {member.nickname}
                            </h3>
                            {isCurrentUser && (
                              <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full font-medium">
                                Tú
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                              {getRoleIcon(member.role)}
                              {getRoleLabel(member.role)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Acciones - Solo para admins y NO para el usuario actual */}
                      {isAdmin && !isCurrentUser && (
                        <div className="flex items-center gap-2 ml-2">
                          <button
                            onClick={() => handleStartEdit(member)}
                            className="p-3 hover:bg-emerald-50 border-2 border-emerald-300 rounded-lg transition-colors shadow-sm"
                            title="Editar miembro"
                          >
                            <Edit2 className="w-5 h-5 text-emerald-600" />
                          </button>
                          <button
                            onClick={() => handleRemoveMember(member.id, member.nickname)}
                            disabled={isSubmitting}
                            className="p-3 hover:bg-red-50 border-2 border-red-300 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
                            title="Eliminar del grupo"
                          >
                            <Trash2 className="w-5 h-5 text-red-600" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Info sobre roles */}
          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
            <p className="font-medium text-gray-900 mb-2">Sobre los roles:</p>
            <ul className="space-y-1">
              <li className="flex items-start gap-2">
                <Crown className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <span><strong>Administrador:</strong> Puede gestionar el grupo, miembros e invitaciones</span>
              </li>
              <li className="flex items-start gap-2">
                <User className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                <span><strong>Miembro:</strong> Puede compartir transacciones y ver todo el grupo</span>
              </li>
              <li className="flex items-start gap-2">
                <Eye className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span><strong>Observador:</strong> Solo puede ver transacciones, no puede compartir</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 space-y-3">
          {/* Botón para salir del grupo (para todos los usuarios) */}
          <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
            <div className="flex items-start gap-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-orange-900 text-sm mb-1">
                  Salir del Grupo
                </h4>
                <p className="text-xs text-orange-800">
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
              onClick={handleLeaveGroup}
              disabled={isLeavingGroup}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              {isLeavingGroup ? 'Saliendo...' : 'Salir del Grupo'}
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </div>
  );
}