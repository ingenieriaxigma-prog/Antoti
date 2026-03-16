/**
 * 📨 INVITATIONS LIST
 * 
 * Lista de invitaciones pendientes con acciones
 */

import React from 'react';
import { X, Mail, Clock, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner@2.0.3';
import { useInvitations } from '../hooks/useInvitations';
import type { FamilyInvitation } from '../types/family.types';

interface InvitationsListProps {
  onClose: () => void;
  onAccepted?: () => void;
}

export function InvitationsList({ onClose, onAccepted }: InvitationsListProps) {
  const { 
    invitations, 
    isLoading, 
    acceptInvitation, 
    rejectInvitation 
  } = useInvitations();

  const handleAccept = async (invitation: FamilyInvitation) => {
    try {
      await acceptInvitation(invitation.id);
      toast.success('¡Te uniste al grupo!', {
        description: `Ahora eres miembro de ${invitation.groupName}`,
      });
      onAccepted?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al aceptar';
      toast.error('Error al aceptar invitación', {
        description: errorMessage,
      });
    }
  };

  const handleReject = async (invitation: FamilyInvitation) => {
    try {
      await rejectInvitation(invitation.id);
      toast.success('Invitación rechazada');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al rechazar';
      toast.error('Error al rechazar invitación', {
        description: errorMessage,
      });
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
          onClick={onClose}
          className="absolute inset-0"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-[#10B981] px-6 py-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-6 h-6" />
                <div>
                  <h2 className="text-2xl font-bold">Invitaciones</h2>
                  <p className="text-emerald-100 text-sm">
                    {invitations.length === 0
                      ? 'No tienes invitaciones pendientes'
                      : `${invitations.length} ${invitations.length === 1 ? 'invitación pendiente' : 'invitaciones pendientes'}`
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              // Loading skeleton
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : invitations.length === 0 ? (
              // Estado vacío
              <EmptyState />
            ) : (
              // Lista de invitaciones
              <div className="space-y-4">
                {invitations.map(invitation => (
                  <InvitationCard
                    key={invitation.id}
                    invitation={invitation}
                    onAccept={() => handleAccept(invitation)}
                    onReject={() => handleReject(invitation)}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

/**
 * Tarjeta de invitación individual
 */
interface InvitationCardProps {
  invitation: FamilyInvitation;
  onAccept: () => void;
  onReject: () => void;
}

function InvitationCard({ invitation, onAccept, onReject }: InvitationCardProps) {
  const expiresAt = new Date(invitation.expiresAt);
  const now = new Date();
  const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-emerald-50 rounded-xl border-2 border-emerald-200 p-5 hover:shadow-lg transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        {/* Info del grupo */}
        <div className="flex items-center gap-3">
          <div className="text-4xl">{invitation.groupEmoji || '🏠'}</div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {invitation.groupName || 'Grupo Familiar'}
            </h3>
            <p className="text-sm text-gray-600">
              Invitado por <span className="font-medium">{invitation.invitedByEmail}</span>
            </p>
          </div>
        </div>

        {/* Tiempo restante */}
        <div className="flex items-center gap-1 text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
          <Clock className="w-3 h-3" />
          <span>{daysLeft} {daysLeft === 1 ? 'día' : 'días'}</span>
        </div>
      </div>

      {/* Código de invitación */}
      <div className="bg-white rounded-lg px-3 py-2 mb-4 border border-gray-200">
        <p className="text-xs text-gray-500 mb-1">Código de invitación:</p>
        <code className="text-sm font-mono font-bold text-emerald-600">
          {invitation.code}
        </code>
      </div>

      {/* Acciones */}
      <div className="flex gap-2">
        <button
          onClick={onAccept}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg hover:shadow-lg transition-all font-medium"
        >
          <CheckCircle className="w-4 h-4" />
          Aceptar
        </button>
        <button
          onClick={onReject}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium"
        >
          <XCircle className="w-4 h-4" />
          Rechazar
        </button>
      </div>
    </motion.div>
  );
}

/**
 * Estado vacío
 */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-24 h-24 mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
        <Mail className="w-12 h-12 text-[#10B981]" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        No hay invitaciones
      </h3>
      <p className="text-gray-600 max-w-md">
        Cuando alguien te invite a un grupo familiar, las invitaciones aparecerán aquí.
      </p>
    </div>
  );
}
