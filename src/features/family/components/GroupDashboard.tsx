/**
 * 👥 GROUP DASHBOARD
 * 
 * Dashboard principal de un grupo familiar con sistema de pestañas.
 */

import { useState, useMemo, useEffect, useCallback, Suspense } from 'react';
import { ArrowLeft, Users, TrendingUp, TrendingDown, Calendar, MessageCircle, Mic, ChevronLeft, ChevronRight, BarChart3, List, Plus, Info, Settings, BarChart2, FileText } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { motion } from 'framer-motion';
import type { Group, Transaction as PersonalTransaction, Category, Account } from '../../../types';
import type { GroupTransaction } from '../../../types/family';
import { useGroupTransactions } from '../hooks/useGroupTransactions';
import { GroupTransactionItem } from './GroupTransactionItem';
import { ShareTransactionModal } from './ShareTransactionModal';
import { OtiSpacerMessage } from '../../../components/OtiSpacerMessage';
import { GroupCharts } from './GroupCharts';
import { MemberStatsModal } from './MemberStatsModal';
import type { GroupMemberSummary } from './MemberStatsModal';
import { getColombiaTime, parseLocalDate, getTodayLocalDate } from '../../../utils/dateUtils'; // ✅ Import date utils
import VoiceRecognition from '../../../components/VoiceRecognition'; // ✅ FIX: Default import
import { ImageReceiptCapture, type ReceiptData } from './ImageReceiptCapture';
import { TabNavigation, type Tab } from './TabNavigation';
import { TransactionCard } from './TransactionCard';
import { GroupSpeedDial } from './GroupSpeedDial';
import OtiChatV3 from '../../../components/OtiChatV3'; // ✅ FIX: Default import
import { useApp } from '../../../contexts/AppContext';
import { supabase } from '../../../utils/supabase/client';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { GroupDetailsModal } from './GroupDetailsModal';
import { GroupTransactionsList } from './GroupTransactionsList';
import type { GroupTransactionWithDetails } from '../types';

interface GroupDashboardProps {
  group: Group;
  onBack: () => void;
  highlightTransactionId?: string | null;
  onOtiChatOpenChange?: (isOpen: boolean) => void;
  onGroupDeleted?: () => void;
}

export function GroupDashboard({ group, onBack, highlightTransactionId, onOtiChatOpenChange, onGroupDeleted }: GroupDashboardProps) {
  const { 
    transactions, 
    isLoading, 
    updateTransaction,
    deleteTransaction,
    addReaction, 
    removeReaction, 
    addComment,
    shareTransaction 
  } = useGroupTransactions({ 
    groupId: group.id,
    autoLoad: true 
  });
  
  const [activeTab, setActiveTab] = useState<'transactions' | 'stats'>('transactions');
  
  // ✅ FIX: Use Colombia time for initial state
  const colombiaTime = getColombiaTime();
  const [selectedMonth, setSelectedMonth] = useState<number>(colombiaTime.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(colombiaTime.getFullYear());
  
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMemberStats, setSelectedMemberStats] = useState<GroupMemberSummary | null>(null);
  const [showOtiChat, setShowOtiChat] = useState(false);
  const [showVoiceRecognition, setShowVoiceRecognition] = useState(false);
  const [showImageCapture, setShowImageCapture] = useState(false);
  
  // Obtener contexto de la app para categorías y cuentas
  const { categories, accounts } = useApp();

  // ✅ Voice command handler - Crea transacción compartida en el grupo
  const handleVoiceCommand = useCallback(async (command: {
    type: 'income' | 'expense' | 'transfer';
    amount: number;
    category?: string;
    subcategory?: string;
    account?: string;
    toAccount?: string;
    note?: string;
  }) => {
    try {
      console.log('🎤 GroupDashboard: Processing voice command for group', group.id, command);
      
      // Convertir IDs de categoría y subcategoría a nombres
      let categoryName: string | null = null;
      let subcategoryName: string | null = null;
      
      if (command.category) {
        const category = categories.find(cat => cat.id === command.category);
        if (category) {
          categoryName = category.name;
          console.log('✅ Found category:', categoryName, 'for ID:', command.category);
          
          if (command.subcategory && category.subcategories) {
            const subcategory = category.subcategories.find(
              sub => sub.id === command.subcategory
            );
            if (subcategory) {
              subcategoryName = subcategory.name;
              console.log('✅ Found subcategory:', subcategoryName, 'for ID:', command.subcategory);
            }
          }
        } else {
          console.warn('⚠️ Category not found for ID:', command.category);
        }
      }
      
      // Crear transacción compartida en el grupo
      await shareTransaction({
        type: command.type,
        amount: command.amount,
        category: categoryName,
        subcategory: subcategoryName,
        description: command.note || null,
        date: getTodayLocalDate(), // ✅ Use local date
        visibility: 'all',
      });
      
      const typeEmoji = command.type === 'expense' ? '💸' : '💰';
      const typeName = command.type === 'expense' ? 'Gasto' : 'Ingreso';
      
      toast.success(`${typeEmoji} ¡Transacción grupal creada!`, {
        description: `${typeName} de $${command.amount.toLocaleString()} compartido en ${group.name}`,
      });
      
    } catch (error) {
      console.error('❌ Error in handleVoiceCommand:', error);
      toast.error('Error al compartir transacción', {
        description: error instanceof Error ? error.message : 'Error desconocido',
      });
    } finally {
      setShowVoiceRecognition(false);
    }
  }, [shareTransaction, group.id, categories]);

  // ✅ Receipt image handler - Procesa recibo y sube imagen a Supabase Storage
  const handleReceiptProcessed = useCallback(async (receiptData: ReceiptData) => {
    try {
      console.log('📸 GroupDashboard: Processing receipt data', receiptData);
      
      // Convertir IDs de categoría y subcategoría a nombres
      let categoryName: string | null = null;
      let subcategoryName: string | null = null;
      
      if (receiptData.category) {
        const category = categories.find(cat => cat.id === receiptData.category);
        if (category) {
          categoryName = category.name;
          console.log('✅ Found category:', categoryName, 'for ID:', receiptData.category);
          
          if (receiptData.subcategory && category.subcategories) {
            const subcategory = category.subcategories.find(
              sub => sub.id === receiptData.subcategory
            );
            if (subcategory) {
              subcategoryName = subcategory.name;
              console.log('✅ Found subcategory:', subcategoryName, 'for ID:', receiptData.subcategory);
            }
          }
        }
      }

      // Subir imagen al servidor (maneja RLS y storage correctamente)
      const fileName = `receipt_${group.id}_${Date.now()}.${receiptData.imageFile.type.split('/')[1]}`;
      
      console.log('📤 Uploading receipt image via server:', fileName);
      
      // Obtener token de sesión actual (si existe)
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const accessToken = currentSession?.access_token || publicAnonKey;
      
      console.log('🔑 Using token for upload:', currentSession?.access_token ? 'User token' : 'Public anon key');
      
      const uploadResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3/upload-receipt-image`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            imageBase64: receiptData.imageBase64,
            fileName,
            contentType: receiptData.imageFile.type,
          }),
        }
      );

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        console.error('❌ Error uploading receipt image:', errorData);
        
        // Dar mensaje más específico si es problema de autenticación
        if (uploadResponse.status === 401) {
          throw new Error('Tu sesión ha expirado. Por favor cierra sesión y vuelve a iniciar sesión.');
        }
        
        throw new Error(errorData.error || 'Error al subir el comprobante');
      }

      const uploadData = await uploadResponse.json();
      console.log('✅ Receipt image uploaded:', uploadData.path);
      
      const receiptUrl = uploadData.signedUrl;
      console.log('✅ Receipt URL:', receiptUrl);

      // Crear transacción compartida con comprobante adjunto
      await shareTransaction({
        type: receiptData.type,
        amount: receiptData.amount,
        category: categoryName,
        subcategory: subcategoryName,
        description: receiptData.description || null,
        date: receiptData.date || getTodayLocalDate(), // ✅ Use local date
        visibility: 'all',
        receiptUrl, // ✨ Nuevo campo para el comprobante
      });
      
      const typeEmoji = receiptData.type === 'expense' ? '💸' : '💰';
      const typeName = receiptData.type === 'expense' ? 'Gasto' : 'Ingreso';
      
      toast.success(`${typeEmoji} ¡Recibo procesado!`, {
        description: `${typeName} de $${receiptData.amount.toLocaleString()} con comprobante adjunto`,
      });
      
    } catch (error) {
      console.error('❌ Error in handleReceiptProcessed:', error);
      toast.error('Error al procesar recibo', {
        description: error instanceof Error ? error.message : 'Error desconocido',
      });
    } finally {
      setShowImageCapture(false);
    }
  }, [shareTransaction, group.id, categories]);

  // Filtrar transacciones por mes/año seleccionado
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const txDate = parseLocalDate(transaction.transactionDate); // ✅ FIX: Use parseLocalDate instead of new Date
      return txDate.getMonth() === selectedMonth && txDate.getFullYear() === selectedYear;
    });
  }, [transactions, selectedMonth, selectedYear]);

  // Calcular estadísticas basadas en transacciones filtradas
  const stats = useMemo(() => {
    const totalExpenses = filteredTransactions
      .filter(t => t.transactionType === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalIncome = filteredTransactions
      .filter(t => t.transactionType === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpenses;

    return { totalExpenses, totalIncome, balance };
  }, [filteredTransactions]);

  // Estadísticas por miembro
  const memberActivity = useMemo(() => {
    const activity = new Map<string, { count: number; total: number }>();
    
    filteredTransactions.forEach(transaction => {
      const memberId = transaction.sharedByUserId;
      const current = activity.get(memberId) || { count: 0, total: 0 };
      activity.set(memberId, {
        count: current.count + 1,
        total: current.total + transaction.amount,
      });
    });

    return Array.from(activity.entries())
      .map(([userId, data]) => {
        const member = group.members.find(m => m.userId === userId);
        return {
          userId,
          nickname: member?.nickname || 'Desconocido',
          emoji: member?.emoji || '👤',
          ...data,
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [filteredTransactions, group.members]);

  // Tabs
  const tabs: Tab[] = [
    { id: 'transactions', label: 'Transacciones', icon: FileText, badge: filteredTransactions.length },
    { id: 'stats', label: 'Estadísticas', icon: BarChart3 },
  ];

  return (
    <div>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Volver a grupos</span>
        </button>

        <div className="flex items-start justify-between">
          {/* Info del grupo */}
          <div className="flex items-center gap-4">
            <div className="text-5xl">{group.emoji}</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {group.name}
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Users className="w-4 h-4" />
                <span>
                  {group.memberCount} {group.memberCount === 1 ? 'miembro' : 'miembros'}
                </span>
                <span className="text-gray-400 dark:text-gray-500">·</span>
                <span>{group.currency}</span>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2">
            {/* Botón gestionar grupo */}
            <button
              onClick={() => setShowDetailsModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Gestionar</span>
            </button>
          </div>
        </div>

        {/* Miembros */}
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          {group.members.map((member) => (
            <button
              key={member.id}
              onClick={() => setSelectedMemberStats(member)}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:border-emerald-300 dark:hover:border-emerald-500 border border-transparent rounded-full transition-all group"
              title={`Ver estadísticas de ${member.nickname}`}
            >
              <span className="text-lg">{member.emoji}</span>
              <span className="text-sm text-gray-700 dark:text-gray-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">{member.nickname}</span>
              {member.role === 'admin' && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Admin</span>
              )}
              <BarChart2 className="w-3 h-3 text-gray-400 dark:text-gray-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
            </button>
          ))}
        </div>
      </div>

      {/* Navegador de Mes */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => {
              if (selectedMonth === 0) {
                setSelectedMonth(11);
                setSelectedYear(selectedYear - 1);
              } else {
                setSelectedMonth(selectedMonth - 1);
              }
            }}
            className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Calendar className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
          
          <div className="flex-1 text-center">
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {new Date(selectedYear, selectedMonth).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          
          <button
            onClick={() => {
              if (selectedMonth === 11) {
                setSelectedMonth(0);
                setSelectedYear(selectedYear + 1);
              } else {
                setSelectedMonth(selectedMonth + 1);
              }
            }}
            className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Calendar className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Resumen Minimalista - 3 Columnas */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {/* Ingresos */}
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium uppercase tracking-wide">
              Ingresos
            </p>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">
              ${stats.totalIncome.toLocaleString()}
            </p>
          </div>

          {/* Gastos */}
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium uppercase tracking-wide">
              Gastos
            </p>
            <p className="text-lg font-bold text-red-600 dark:text-red-400">
              ${stats.totalExpenses.toLocaleString()}
            </p>
          </div>

          {/* Balance */}
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium uppercase tracking-wide">
              Balance
            </p>
            <p className={`text-lg font-bold ${stats.balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
              ${stats.balance.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Navegación por pestañas */}
      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as typeof activeTab)}
      />

      {/* Contenido según tab activo */}
      {activeTab === 'transactions' && (
        <TransactionsTab
          groupId={group.id}
          transactions={filteredTransactions}
          isLoading={isLoading}
          members={group.members}
          onUpdateTransaction={updateTransaction}
          onDeleteTransaction={deleteTransaction}
          onAddReaction={addReaction}
          onRemoveReaction={removeReaction}
          onAddComment={addComment}
          highlightTransactionId={highlightTransactionId}
        />
      )}

      {activeTab === 'stats' && (
        <StatsTab
          transactions={filteredTransactions}
          currency={group.currency}
          members={group.members}
        />
      )}

      {/* Oti FAB - Asistente Inteligente Unificado (Derecha, estilo WhatsApp) */}
      <div className="fixed bottom-20 right-6 z-40">
        <GroupSpeedDial
          onChatClick={() => {
            setShowOtiChat(true);
            onOtiChatOpenChange?.(true);
          }}
          onVoiceClick={() => {
            // Validar que existan categorías y cuentas
            if (!categories || categories.length === 0) {
              toast.error('Cargando categorías... Por favor intenta de nuevo en un momento.');
              return;
            }
            if (!accounts || accounts.length === 0) {
              toast.error('Cargando cuentas... Por favor intenta de nuevo en un momento.');
              return;
            }
            setShowVoiceRecognition(true);
          }}
          onImageClick={() => {
            // Validar que existan categorías
            if (!categories || categories.length === 0) {
              toast.error('Cargando categorías... Por favor intenta de nuevo en un momento.');
              return;
            }
            setShowImageCapture(true);
          }}
          onManualClick={() => setShowShareModal(true)}
        />
      </div>

      {/* OtiChat Modal */}
      {showOtiChat && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-white dark:bg-gray-900"
        >
          <Suspense fallback={
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">Cargando OtiChat...</p>
              </div>
            </div>
          }>
            {/* OtiChat con botón cerrar integrado */}
            <OtiChatV3
              onNavigate={(screen: string) => {
                if (screen === 'back') {
                  setShowOtiChat(false);
                  onOtiChatOpenChange?.(false);
                } else if (screen.startsWith('back:')) {
                  // Cerrar chat y cambiar a pestaña específica
                  const tab = screen.split(':')[1] as 'summary' | 'transactions' | 'stats';
                  setShowOtiChat(false);
                  onOtiChatOpenChange?.(false);
                  setActiveTab(tab);
                }
              }}
              currentScreen="groups"
              theme="green"
              groupId={group.id}
            />
          </Suspense>
        </motion.div>
      )}

      {/* Modal compartir transacción */}
      {showShareModal && (
        <ShareTransactionModal
          group={group}
          onClose={() => setShowShareModal(false)}
          onSuccess={() => setShowShareModal(false)}
        />
      )}

      {/* Modal detalles del grupo */}
      {showDetailsModal && (
        <GroupDetailsModal
          group={group}
          onClose={() => setShowDetailsModal(false)}
          onGroupDeleted={() => {
            setShowDetailsModal(false);
            onBack(); // Volver a la lista de grupos
            onGroupDeleted?.(); // Llamar a la función de eliminación del grupo
          }}
          onGroupUpdated={() => {
            // Cuando se actualiza el grupo (ej: nombre de miembro), refrescar la lista
            console.log('🔄 GroupDashboard: onGroupUpdated called - calling onGroupDeleted');
            onGroupDeleted?.(); // Usar el mismo callback para refrescar los grupos
          }}
        />
      )}

      {/* Modal estadísticas de miembro */}
      {selectedMemberStats && (
        <MemberStatsModal
          member={selectedMemberStats}
          transactions={transactions}
          currency={group.currency}
          onClose={() => setSelectedMemberStats(null)}
        />
      )}

      {/* Modal reconocimiento de voz */}
      {showVoiceRecognition && (
        <VoiceRecognition
          accounts={accounts}
          categories={categories}
          onVoiceCommand={handleVoiceCommand}
          onClose={() => setShowVoiceRecognition(false)}
        />
      )}

      {/* Modal captura de imagen de recibo */}
      {showImageCapture && (
        <ImageReceiptCapture
          categories={categories}
          onReceiptProcessed={handleReceiptProcessed}
          onClose={() => setShowImageCapture(false)}
        />
      )}
    </div>
  );
}

/**
 * TAB 1: TRANSACCIONES
 */
interface TransactionsTabProps {
  groupId: string;
  transactions: GroupTransactionWithDetails[];
  isLoading: boolean;
  members: Array<{ id: string; userId: string; nickname: string; emoji: string }>;
  onUpdateTransaction?: (transactionId: string, updates: any) => Promise<void>;
  onDeleteTransaction?: (transactionId: string) => Promise<void>;
  onAddReaction?: (transactionId: string, emoji: string) => Promise<void>;
  onRemoveReaction?: (transactionId: string) => Promise<void>;
  onAddComment?: (transactionId: string, text: string) => Promise<void>;
  highlightTransactionId?: string | null;
}

function TransactionsTab({
  groupId,
  transactions,
  isLoading,
  members,
  onUpdateTransaction,
  onDeleteTransaction,
  onAddReaction,
  onRemoveReaction,
  onAddComment,
  highlightTransactionId,
}: TransactionsTabProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Todas las Transacciones
      </h3>

      <GroupTransactionsList
        groupId={groupId}
        transactions={transactions}
        isLoading={isLoading}
        members={members}
        onUpdateTransaction={onUpdateTransaction}
        onDeleteTransaction={onDeleteTransaction}
        onAddReaction={onAddReaction}
        onRemoveReaction={onRemoveReaction}
        onAddComment={onAddComment}
        highlightTransactionId={highlightTransactionId}
      />

      {/* WhatsApp-style Spacer - Evita que el FAB tape contenido */}
      <OtiSpacerMessage
        message="Has visto todas las transacciones del grupo. Usa Oti para compartir más"
        show={transactions.length > 0}
      />
    </div>
  );
}

/**
 * TAB 2: ESTADÍSTICAS
 */
interface StatsTabProps {
  transactions: GroupTransactionWithDetails[];
  currency: string;
  members: Array<{ id: string; userId: string; nickname: string; emoji: string }>;
}

function StatsTab({ transactions, currency, members }: StatsTabProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Análisis y Gráficos
      </h3>

      {transactions.length === 0 ? (
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No hay datos suficientes para mostrar estadísticas en este período
          </p>
        </div>
      ) : (
        <GroupCharts 
          transactions={transactions}
          currency={currency}
          members={members}
        />
      )}

      {/* WhatsApp-style Spacer - Evita que el FAB tape contenido */}
      <OtiSpacerMessage
        message="Has revisado las estadísticas. Pregúntale a Oti para más análisis"
        show={transactions.length > 0}
      />
    </div>
  );
}