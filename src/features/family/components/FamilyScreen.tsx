/**
 * 👥 FAMILY SCREEN - Pantalla Principal
 * 
 * Pantalla principal de finanzas familiares con gestión de grupos,
 * transacciones compartidas y notificaciones.
 */

import React, { useState, useEffect } from 'react';
import { Users, Plus, Mail, Bell, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFamilyGroups } from '../hooks/useFamilyGroups';
import { useInvitations } from '../hooks/useInvitations';
import { useUI } from '../../../contexts/UIContext';
import { CreateGroupModal } from './CreateGroupModal';
import { GroupCard } from './GroupCard';
import { GroupDashboard } from './GroupDashboard';
import { InvitationsList } from './InvitationsList';
import { InviteByEmailModal } from './InviteByEmailModal';
// 🎓 NEW: Import FamilyTour
import { FamilyTour, shouldShowFamilyTour } from '../../../components/tours/FamilyTour';
import BottomNav from '../../../components/BottomNav';

interface FamilyScreenProps {
  onNavigate: (screen: string) => void;
}

export function FamilyScreen({ onNavigate }: FamilyScreenProps) {
  const { groups, selectedGroup, isLoading, selectGroup, refreshGroups } = useFamilyGroups();
  const { pendingCount } = useInvitations();
  const { navigationParams, clearNavigationParams } = useUI();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInvitations, setShowInvitations] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [highlightTransactionId, setHighlightTransactionId] = useState<string | null>(null);
  const [isOtiChatOpen, setIsOtiChatOpen] = useState(false);
  // 🎓 NEW: Family Tour state
  const [showFamilyTour, setShowFamilyTour] = useState(shouldShowFamilyTour());
  
  // Detectar navegación con parámetros (desde notificaciones)
  useEffect(() => {
    if (navigationParams?.groupId && !isLoading && groups.length > 0) {
      selectGroup(navigationParams.groupId);
      
      if (navigationParams.highlightTransactionId) {
        setHighlightTransactionId(navigationParams.highlightTransactionId);
      }
      
      // Limpiar parámetros después de usarlos
      clearNavigationParams();
    }
  }, [navigationParams, isLoading, groups.length, selectGroup, clearNavigationParams]);

  return (
    <div className="min-h-screen bg-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 pb-20">{/* pb-20 para espacio del BottomNav */}
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Título */}
            <div className="flex items-center gap-3" data-tour="groups-header">
              <div className="w-10 h-10 rounded-xl bg-[#10B981] flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Grupos
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {groups.length === 0 
                    ? 'Crea tu primer grupo' 
                    : `${groups.length} ${groups.length === 1 ? 'grupo' : 'grupos'}`
                  }
                </p>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-2" data-tour="quick-actions">
              {/* Botón de Tour - Siempre visible */}
              <button
                onClick={() => setShowFamilyTour(true)}
                className="p-2 text-gray-400 hover:text-[#10B981] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
                title="Tutorial de Grupos"
              >
                <GraduationCap className="w-5 h-5" />
              </button>

              {/* Badge de invitaciones pendientes */}
              {pendingCount > 0 && (
                <button
                  onClick={() => setShowInvitations(true)}
                  className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  data-tour="notifications-button"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {pendingCount}
                  </span>
                </button>
              )}

              {/* Crear grupo */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg hover:shadow-lg transition-all"
                data-tour="create-group-button"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Crear Grupo</span>
              </button>

              {/* Invitar por email */}
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg hover:shadow-lg transition-all"
                data-tour="invite-button"
              >
                <Mail className="w-4 h-4" />
                <span className="hidden sm:inline">Invitar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {isLoading ? (
          // Loading skeleton
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          // Estado vacío
          <EmptyState onCreateGroup={() => setShowCreateModal(true)} />
        ) : selectedGroup ? (
          // Dashboard del grupo seleccionado
          <motion.div
            key={selectedGroup.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <GroupDashboard 
              group={selectedGroup} 
              onBack={() => {
                selectGroup(null);
                setHighlightTransactionId(null);
              }}
              highlightTransactionId={highlightTransactionId}
              onOtiChatOpenChange={setIsOtiChatOpen}
              onGroupDeleted={() => {
                // Refrescar la lista de grupos después de eliminar
                refreshGroups();
              }}
            />
          </motion.div>
        ) : (
          // Lista de grupos
          <div className="space-y-4" data-tour="groups-list">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Mis Grupos
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map(group => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <GroupCard
                    group={group}
                    onClick={() => selectGroup(group.id)}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal crear grupo */}
      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={async () => {
            setShowCreateModal(false);
            // Esperar un poco y luego refrescar la lista
            await new Promise(resolve => setTimeout(resolve, 300));
            await refreshGroups();
          }}
        />
      )}

      {/* Lista de invitaciones */}
      {showInvitations && (
        <InvitationsList
          onClose={() => setShowInvitations(false)}
          onAccepted={() => {
            refreshGroups();
            setShowInvitations(false);
          }}
        />
      )}

      {/* Modal invitar por email */}
      {showInviteModal && (
        <InviteByEmailModal
          groups={groups}
          onClose={() => setShowInviteModal(false)}
          onSuccess={() => {
            setShowInviteModal(false);
          }}
        />
      )}

      {/* 🎓 Tour System */}
      {showFamilyTour && (
        <FamilyTour onComplete={() => setShowFamilyTour(false)} />
      )}

      {/* Bottom Navigation - Oculto cuando OtiChat está abierto */}
      {!isOtiChatOpen && (
        <BottomNav
          currentScreen="family"
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
}

/**
 * Estado vacío - Cuando no hay grupos
 */
function EmptyState({ onCreateGroup }: { onCreateGroup: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
      data-tour="groups-empty-state"
    >
      <div className="w-32 h-32 mb-6 rounded-full bg-emerald-100 dark:from-emerald-900/30 dark:to-emerald-900/30 flex items-center justify-center">
        <Users className="w-16 h-16 text-[#10B981] dark:text-emerald-400" />
      </div>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
        Bienvenido a Grupos
      </h2>

      <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-8">
        Crea tu primer grupo para empezar a compartir transacciones,
        ver el progreso de todos y mantener a tu grupo financieramente unido.
      </p>

      <button
        onClick={onCreateGroup}
        className="flex items-center gap-2 px-6 py-3 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl hover:shadow-lg transition-all"
        data-tour="create-first-group-button"
      >
        <Plus className="w-5 h-5" />
        Crear mi Primer Grupo
      </button>

      {/* Beneficios */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl">
        <BenefitCard
          emoji="💸"
          title="Compartir Gastos"
          description="Comparte tus transacciones y mantén a todos informados"
          dataTour="benefit-share"
        />
        <BenefitCard
          emoji="💬"
          title="Comentar y Reaccionar"
          description="Comenta y reacciona a las transacciones de tu familia"
          dataTour="benefit-comment"
        />
        <BenefitCard
          emoji="📊"
          title="Ver Progreso"
          description="Visualiza el progreso financiero de todo el grupo"
          dataTour="benefit-progress"
        />
      </div>
    </motion.div>
  );
}

function BenefitCard({ 
  emoji, 
  title, 
  description,
  dataTour
}: { 
  emoji: string; 
  title: string; 
  description: string;
  dataTour?: string;
}) {
  return (
    <div className="text-center p-4" data-tour={dataTour}>
      <div className="text-4xl mb-2">{emoji}</div>
      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}