/**
 * ⚡ QUICK SHARE BUTTON
 * 
 * Botón para compartir rápidamente una transacción personal en grupos.
 */

import React, { useState } from 'react';
import { Share2, Users, Check, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner@2.0.3';
import { useAuth } from '../../../contexts/AuthContext';
import { useFamilyGroups } from '../hooks/useFamilyGroups';
import { familyService } from '../services/family.service';
import type { Transaction } from '../../transactions/types/transaction.types';
import { useApp } from '../../../contexts/AppContext';
import { CategoryService } from '../../categories/services/category.service';

interface QuickShareButtonProps {
  transaction: Transaction;
  onShared?: () => void;
  compact?: boolean;
}

export function QuickShareButton({ transaction, onShared, compact = false }: QuickShareButtonProps) {
  const { getAccessToken } = useAuth();
  const { groups, isLoading: loadingGroups } = useFamilyGroups();
  const { categories } = useApp();
  const [showMenu, setShowMenu] = useState(false);
  const [sharingTo, setSharingTo] = useState<string | null>(null);

  const handleShare = async (groupId: string, groupName: string) => {
    try {
      setSharingTo(groupId);
      const accessToken = await getAccessToken();

      if (!accessToken) {
        throw new Error('No se pudo obtener el token de acceso');
      }

      // Obtener nombres de categoría y subcategoría
      let categoryName: string | null = null;
      let subcategoryName: string | null = null;

      if (transaction.category) {
        const category = CategoryService.getCategoryById(transaction.category, categories);
        if (category) {
          categoryName = category.name;
          
          // Si hay subcategoría, buscarla dentro de la categoría
          if (transaction.subcategory && category.subcategories) {
            const subcategory = category.subcategories.find(
              sub => sub.id === transaction.subcategory
            );
            if (subcategory) {
              subcategoryName = subcategory.name;
            }
          }
        }
      }

      // Compartir la transacción con nombres en lugar de IDs
      await familyService.shareTransaction(accessToken, groupId, {
        originalTransactionId: transaction.id,
        description: transaction.note,
        amount: transaction.amount,
        type: transaction.type as 'expense' | 'income',
        date: transaction.date,
        category: categoryName,
        subcategory: subcategoryName,
      });

      toast.success(`Compartido en ${groupName} ✓`);
      setShowMenu(false);
      onShared?.();
    } catch (error) {
      console.error('Error al compartir transacción:', error);
      toast.error('Error al compartir transacción');
    } finally {
      setSharingTo(null);
    }
  };

  if (loadingGroups) {
    return null;
  }

  // Si no hay grupos, no mostrar el botón
  if (!groups || groups.length === 0) {
    return null;
  }

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Compartir en grupo"
        >
          <Share2 className="w-4 h-4 text-gray-600" />
        </button>

        {/* Menú de grupos */}
        <AnimatePresence>
          {showMenu && (
            <>
              {/* Overlay */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMenu(false)}
              />
              
              {/* Menú */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
              >
                <div className="p-3 border-b border-gray-200 bg-gray-50">
                  <p className="text-sm font-medium text-gray-700">
                    Compartir en grupo
                  </p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {groups.map((group) => (
                    <button
                      key={group.id}
                      onClick={() => handleShare(group.id, group.name)}
                      disabled={sharingTo !== null}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors disabled:opacity-50 text-left"
                    >
                      <div className="text-2xl">{group.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {group.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {group.memberCount} {group.memberCount === 1 ? 'miembro' : 'miembros'}
                        </p>
                      </div>
                      {sharingTo === group.id ? (
                        <Loader className="w-4 h-4 text-emerald-500 animate-spin flex-shrink-0" />
                      ) : (
                        <Share2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
      >
        <Share2 className="w-4 h-4" />
        <span>Compartir en Grupo</span>
      </button>

      {/* Menú de grupos */}
      <AnimatePresence>
        {showMenu && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowMenu(false)}
            />
            
            {/* Menú */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
            >
              <div className="p-4 border-b border-gray-200 bg-emerald-50">
                <div className="flex items-center gap-2 text-[#10B981]">
                  <Users className="w-5 h-5" />
                  <p className="font-semibold">Selecciona un grupo</p>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {groups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => handleShare(group.id, group.name)}
                    disabled={sharingTo !== null}
                    className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors disabled:opacity-50 border-b border-gray-100 last:border-b-0 text-left"
                  >
                    <div className="text-3xl">{group.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {group.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {group.memberCount} {group.memberCount === 1 ? 'miembro' : 'miembros'}
                      </p>
                    </div>
                    {sharingTo === group.id ? (
                      <Loader className="w-5 h-5 text-emerald-500 animate-spin flex-shrink-0" />
                    ) : (
                      <Share2 className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
