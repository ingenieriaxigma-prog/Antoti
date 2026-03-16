/**
 * 💸 TRANSACTION CARD
 * 
 * Tarjeta de transacción compartida con reacciones y comentarios.
 */

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Smile, Send, X, Edit2, Trash2, MoreVertical, FileImage, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { useGroupTransactions } from '../hooks/useGroupTransactions';
import type { GroupTransactionWithDetails } from '../types/family.types';
import { formatCurrency, formatRelativeDate, getTransactionTypeIcon } from '../services/family.service';
import { toast } from 'sonner@2.0.3';
import { EditTransactionModal } from './EditTransactionModal';

interface TransactionCardProps {
  groupId: string;
  transaction: GroupTransactionWithDetails;
  onUpdateTransaction?: (transactionId: string, updates: any) => Promise<void>;
  onDeleteTransaction?: (transactionId: string) => Promise<void>;
  onAddReaction?: (transactionId: string, emoji: string) => Promise<void>;
  onRemoveReaction?: (transactionId: string) => Promise<void>;
  onAddComment?: (transactionId: string, text: string) => Promise<void>;
  isHighlighted?: boolean;
}

// 🎭 Sistema de Reacciones Contextuales para Finanzas Familiares
// Los 12 emojis más usados en contexto financiero

interface EmojiReaction {
  emoji: string;
  label: string;
  category: 'positivo' | 'negativo' | 'neutro';
}

const REACTION_EMOJIS: EmojiReaction[] = [
  // 💚 Positivos - Aprueban la decisión financiera
  { emoji: '👍', label: 'Me gusta', category: 'positivo' },
  { emoji: '💚', label: 'Excelente', category: 'positivo' },
  { emoji: '💰', label: 'Buen ahorro', category: 'positivo' },
  { emoji: '🎯', label: 'Acertado', category: 'positivo' },
  
  // ⚠️ Negativos - Preocupación o alerta
  { emoji: '😱', label: '¡Caro!', category: 'negativo' },
  { emoji: '😰', label: 'Preocupado', category: 'negativo' },
  { emoji: '👀', label: 'Sospechoso', category: 'negativo' },
  { emoji: '💸', label: 'Mucho dinero', category: 'negativo' },
  
  // 😊 Neutrales - Reacciones emocionales
  { emoji: '🎉', label: 'Celebremos', category: 'neutro' },
  { emoji: '😂', label: 'Jajaja', category: 'neutro' },
  { emoji: '🤔', label: 'Mmm...', category: 'neutro' },
  { emoji: '💪', label: 'Fuerza', category: 'neutro' },
];

export function TransactionCard({ 
  groupId, 
  transaction,
  onUpdateTransaction,
  onDeleteTransaction,
  onAddReaction,
  onRemoveReaction,
  onAddComment,
  isHighlighted = false
}: TransactionCardProps) {
  const { currentUser } = useAuth();
  const cardRef = useRef<HTMLDivElement>(null);
  const reactionPickerRef = useRef<HTMLDivElement>(null);
  
  // Fallback: crear instancia del hook si no se pasan las funciones (para backward compatibility)
  const hookInstance = useGroupTransactions({ 
    groupId,
    autoLoad: false 
  });
  
  const updateTransaction = onUpdateTransaction || hookInstance.updateTransaction;
  const deleteTransaction = onDeleteTransaction || hookInstance.deleteTransaction;
  const addReaction = onAddReaction || hookInstance.addReaction;
  const removeReaction = onRemoveReaction || hookInstance.removeReaction;
  const addComment = onAddComment || hookInstance.addComment;

  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [selectedReactionEmoji, setSelectedReactionEmoji] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Verificar si el usuario es el creador de la transacción
  const isOwner = currentUser?.id === transaction.sharedByUserId;

  // Debug: log para verificar ownership
  useEffect(() => {
    console.log('🔍 Transaction ownership check:', {
      userId: currentUser?.id,
      sharedByUserId: transaction.sharedByUserId,
      isOwner,
      transactionId: transaction.id
    });
  }, [currentUser?.id, transaction.sharedByUserId, isOwner, transaction.id]);

  // Auto-scroll y expandir comentarios si está destacada
  useEffect(() => {
    if (isHighlighted && cardRef.current) {
      console.log('🎯 Scrolling to highlighted transaction:', transaction.id);
      
      // Esperar un poco para que el componente se renderice completamente
      setTimeout(() => {
        cardRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        
        // Expandir comentarios automáticamente
        setShowComments(true);
      }, 300);
    }
  }, [isHighlighted, transaction.id]);

  // Cerrar menú de acciones al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showActionsMenu && cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setShowActionsMenu(false);
      }
    };

    if (showActionsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showActionsMenu]);

  // Cerrar picker de reacciones con ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showReactionPicker) {
        setShowReactionPicker(false);
      }
    };

    if (showReactionPicker) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showReactionPicker]);

  // Agrupar reacciones por emoji
  const reactionSummary = React.useMemo(() => {
    const summary = new Map<string, { count: number; userIds: string[]; userNames: string[]; hasUserReacted: boolean }>();
    
    transaction.reactions.forEach(reaction => {
      const existing = summary.get(reaction.emoji) || { count: 0, userIds: [], userNames: [], hasUserReacted: false };
      existing.count++;
      existing.userIds.push(reaction.userId);
      existing.userNames.push(`${reaction.userEmoji || '👤'} ${reaction.userNickname || 'Usuario'}`);
      if (reaction.userId === currentUser?.id) {
        existing.hasUserReacted = true;
      }
      summary.set(reaction.emoji, existing);
    });

    return Array.from(summary.entries()).map(([emoji, data]) => ({
      emoji,
      ...data,
    }));
  }, [transaction.reactions, currentUser?.id]);

  // Verificar si el usuario ya reaccionó
  const userReaction = transaction.reactions.find(r => r.userId === currentUser?.id);

  // Color según tipo de transacción
  const typeColors = {
    expense: 'bg-red-50 border-red-200 text-red-700',
    income: 'bg-green-50 border-green-200 text-green-700',
    transfer: 'bg-blue-50 border-blue-200 text-blue-700',
  };

  const handleReaction = async (emoji: string) => {
    try {
      // 1. VIBRACIÓN HÁPTICA INMEDIATA (estilo Facebook)
      if ('vibrate' in navigator) {
        navigator.vibrate(50); // 50ms de vibración
      }
      
      // 2. Mostrar animación: emoji seleccionado + ocultar los demás
      setSelectedReactionEmoji(emoji);
      
      // 3. Esperar 250ms para que el usuario vea la animación estilo Facebook
      await new Promise(resolve => setTimeout(resolve, 250));
      
      // 4. Ejecutar la acción en segundo plano
      // Siempre llamar a addReaction, el servidor maneja la lógica de:
      // - Toggle: si hace clic en el mismo emoji, lo elimina
      // - Update: si hace clic en diferente emoji, lo actualiza  
      // - Add: si no tiene reacción, la agrega
      addReaction(transaction.id, emoji); // Sin await para cerrar más rápido
      
      // 5. Cerrar el picker inmediatamente (estilo Facebook)
      setShowReactionPicker(false);
      setSelectedReactionEmoji(null);
      
      // 6. Mensaje apropiado según el caso (después de cerrar)
      if (userReaction?.emoji === emoji) {
        toast.success('Reacción eliminada');
      } else if (userReaction) {
        toast.success('Reacción actualizada');
      } else {
        toast.success('Reacción agregada');
      }
    } catch (error) {
      toast.error('Error al procesar reacción');
      setSelectedReactionEmoji(null);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    try {
      await addComment(transaction.id, commentText.trim());
      setCommentText('');
      toast.success('Comentario agregado');
    } catch (error) {
      toast.error('Error al agregar comentario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (updates: any) => {
    try {
      await updateTransaction(transaction.id, updates);
      setShowEditModal(false);
      setShowActionsMenu(false);
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleDeleteClick = () => {
    setShowActionsMenu(false);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteTransaction(transaction.id);
      toast.success('Transacción eliminada');
      setShowDeleteConfirm(false);
    } catch (error) {
      // Error already handled in hook
      setShowDeleteConfirm(false);
    }
  };

  return (
    <motion.div 
      ref={cardRef}
      className={`bg-white dark:bg-gray-800 border rounded-lg p-4 hover:shadow-md transition-all ${
        isHighlighted 
          ? 'border-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-800 shadow-lg' 
          : 'border-gray-200 dark:border-gray-700'
      }`}
      animate={isHighlighted ? {
        scale: [1, 1.02, 1],
      } : {}}
      transition={{ duration: 0.5, repeat: 2 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          {/* Tipo y monto */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">
              {getTransactionTypeIcon(transaction.transactionType)}
            </span>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeColors[transaction.transactionType as keyof typeof typeColors]}`}>
              {transaction.transactionType === 'expense' ? 'Gasto' : 
               transaction.transactionType === 'income' ? 'Ingreso' : 'Transferencia'}
            </span>
          </div>

          {/* Descripción */}
          <p className="font-semibold text-gray-900 dark:text-white mb-1 break-words">
            {transaction.description || 
              (transaction.category || transaction.subcategory 
                ? `${transaction.category || ''}${transaction.category && transaction.subcategory ? ' · ' : ''}${transaction.subcategory || ''}`
                : 'Sin descripción'
              )
            }
          </p>

          {/* Detalles */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
            {transaction.description && (transaction.category || transaction.subcategory) && (
              <>
                <span>
                  {transaction.category || ''}
                  {transaction.category && transaction.subcategory ? ' · ' : ''}
                  {transaction.subcategory || ''}
                </span>
                <span className="text-gray-400 dark:text-gray-500">·</span>
              </>
            )}
            <span>{formatRelativeDate(transaction.createdAt)}</span>
          </div>

          {/* Comprobante adjunto */}
          {transaction.receiptUrl && (
            <button
              onClick={() => window.open(transaction.receiptUrl!, '_blank')}
              className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <FileImage className="w-4 h-4" />
              Ver comprobante
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Monto y acciones */}
        <div className="flex items-start gap-2 flex-shrink-0">
          <div className="text-right">
            <p className={`text-lg font-bold whitespace-nowrap ${
              transaction.transactionType === 'expense' ? 'text-red-600 dark:text-red-400' :
              transaction.transactionType === 'income' ? 'text-green-600 dark:text-green-400' :
              'text-blue-600 dark:text-blue-400'
            }`}>
              {transaction.transactionType === 'expense' && '-'}
              {transaction.transactionType === 'income' && '+'}
              ${transaction.amount.toLocaleString()}
            </p>
          </div>

          {/* Botones de editar/eliminar (solo para el creador) */}
          {isOwner && (
            <div className="relative">
              <button
                onClick={() => setShowActionsMenu(!showActionsMenu)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Más opciones"
              >
                <MoreVertical className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>

              {/* Menú de acciones */}
              <AnimatePresence>
                {showActionsMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-20 min-w-[150px]"
                  >
                    <button
                      onClick={() => {
                        setShowEditModal(true);
                        setShowActionsMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      onClick={handleDeleteClick}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Compartido por */}
      {transaction.sharedByMember && (
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-600 dark:text-gray-400">
          <span>{transaction.sharedByMember.emoji}</span>
          <span>Compartido por {transaction.sharedByMember.nickname}</span>
        </div>
      )}

      {/* Reacciones */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {/* Reacciones existentes */}
        {reactionSummary.map(({ emoji, count, hasUserReacted, userNames }) => {
          // Buscar el label del emoji en nuestro catálogo
          const emojiData = REACTION_EMOJIS.find(r => r.emoji === emoji);
          const emojiLabel = emojiData?.label || emoji;
          
          return (
            <button
              key={emoji}
              onClick={() => handleReaction(emoji)}
              title={`${emojiLabel} - ${userNames.join(', ')}`}
              className={`
                flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-all hover:scale-105
                ${hasUserReacted 
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 ring-2 ring-emerald-400 dark:ring-emerald-500' 
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }
              `}
            >
              <span>{emoji}</span>
              <span className="font-medium">{count}</span>
            </button>
          );
        })}

        {/* Botón agregar reacción */}
        <div className="relative">
          <button
            onClick={() => setShowReactionPicker(!showReactionPicker)}
            className={`
              flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-all
              ${showReactionPicker 
                ? 'bg-emerald-100 dark:bg-emerald-900/30 ring-2 ring-emerald-400 dark:ring-emerald-500' 
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:scale-105'
              }
            `}
          >
            <Smile className={`w-4 h-4 ${showReactionPicker ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'}`} />
            {reactionSummary.length === 0 && <span className="text-gray-700 dark:text-gray-300">Reaccionar</span>}
          </button>

          {/* Picker de reacciones - Diseño espacioso y móvil-first */}
          <AnimatePresence>
            {showReactionPicker && (
              <>
                {/* Overlay oscuro para cerrar */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/20 z-[60]"
                  onClick={() => setShowReactionPicker(false)}
                />
                
                {/* Picker centrado en móvil - MÁS ANCHO */}
                <motion.div
                  ref={reactionPickerRef}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-emerald-200 dark:border-emerald-700 p-4 z-[70] w-[85vw] max-w-[340px]"
                >
                  {/* Header del picker */}
                  <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-3 text-center">
                    ¿Cómo te hace sentir? 💭
                  </div>
                  
                  {/* Grid de emojis - 3 columnas MÁS ANCHAS */}
                  <div className="grid grid-cols-3 gap-3">
                    {REACTION_EMOJIS.map((reaction) => {
                      const isSelected = selectedReactionEmoji === reaction.emoji;
                      const isOther = selectedReactionEmoji !== null && !isSelected;
                      
                      return (
                        <motion.button
                          key={reaction.emoji}
                          onClick={() => handleReaction(reaction.emoji)}
                          disabled={selectedReactionEmoji !== null}
                          // Animación estilo Facebook
                          animate={{
                            scale: isSelected ? 1.3 : isOther ? 0.5 : 1,
                            opacity: isOther ? 0 : 1,
                            y: isSelected ? -10 : 0,
                          }}
                          transition={{
                            duration: 0.2,
                            ease: [0.34, 1.56, 0.64, 1], // Bounce easing
                          }}
                          className={`relative group flex flex-col items-center gap-2 p-3 rounded-xl ${
                            isSelected
                              ? ''
                              : 'hover:bg-emerald-50 dark:hover:bg-emerald-900/30 active:scale-95'
                          }`}
                        >
                          {/* Emoji grande con animación de selección */}
                          <span className="text-3xl">
                            {reaction.emoji}
                          </span>
                          
                          {/* Label legible - Solo visible si NO está seleccionando */}
                          {!selectedReactionEmoji && (
                            <span className="text-[11px] text-gray-600 dark:text-gray-400 font-medium text-center leading-tight">
                              {reaction.label}
                            </span>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Botón comentarios */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm transition-colors ml-auto"
        >
          <MessageCircle className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          <span className="text-gray-700 dark:text-gray-300">{transaction.comments.length}</span>
        </button>
      </div>

      {/* Sección de comentarios */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3"
          >
            {/* Lista de comentarios */}
            <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
              {transaction.comments.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                  No hay comentarios aún
                </p>
              ) : (
                transaction.comments.map(comment => (
                  <div key={comment.id} className="flex gap-2 text-sm">
                    <div className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                      <p className="font-medium text-gray-900 dark:text-white mb-0.5 flex items-center gap-1">
                        {comment.userEmoji && <span>{comment.userEmoji}</span>}
                        <span>{comment.userNickname || 'Usuario'}</span>
                      </p>
                      <p className="text-gray-700 dark:text-gray-300">{comment.text}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatRelativeDate(comment.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Form agregar comentario */}
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Escribe un comentario..."
                className="flex-1 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                maxLength={500}
                disabled={isSubmitting}
              />
              <button
                type="submit"
                disabled={!commentText.trim() || isSubmitting}
                className="px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de edición */}
      {showEditModal && (
        <EditTransactionModal
          transaction={transaction}
          onClose={() => setShowEditModal(false)}
          onSave={handleEdit}
        />
      )}

      {/* Modal de confirmación de eliminación */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Eliminar transacción
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Esta acción no se puede deshacer
                  </p>
                </div>
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-6">
                ¿Estás seguro de que quieres eliminar esta transacción de <span className="font-semibold">${transaction.amount.toLocaleString()}</span>?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
