/**
 * 👥 CREATE GROUP MODAL
 * 
 * Modal para crear un nuevo grupo familiar.
 */

import React, { useState } from 'react';
import { X, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFamilyGroups } from '../hooks/useFamilyGroups';
import { validateGroupName } from '../services/family.service';
import { toast } from 'sonner@2.0.3';

interface CreateGroupModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const EMOJI_OPTIONS = [
  '🏠', '👨‍👩‍👧‍👦', '👪', '💰', '💵', 
  '🏦', '💳', '📊', '🎯', '⭐',
  '❤️', '🌟', '✨', '🔥', '🎉'
];

export function CreateGroupModal({ onClose, onSuccess }: CreateGroupModalProps) {
  const { createGroup } = useFamilyGroups();
  
  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🏠');
  const [currency, setCurrency] = useState('COP');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar nombre
    const validation = validateGroupName(name);
    if (!validation.valid) {
      setError(validation.error || 'Nombre inválido');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createGroup({
        name: name.trim(),
        emoji: selectedEmoji,
        config: {
          currency,
          requireApprovalToJoin: true, // Por defecto requiere invitación directa (más seguro)
          allowGuestView: false,
        },
      });

      toast.success('¡Grupo creado exitosamente!', {
        description: `${selectedEmoji} ${name} está listo`,
      });
      
      onSuccess();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear grupo';
      setError(errorMessage);
      toast.error('Error al crear grupo', {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
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
          className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#10B981] flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Crear Grupo Familiar
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Contenido */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6 pb-8">
            {/* Nombre del grupo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Grupo
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                placeholder="Ej: Mi Familia, Los González, etc."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
                maxLength={100}
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                {name.length}/100 caracteres
              </p>
            </div>

            {/* Emoji */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Elige un Emoji
              </label>
              <div className="grid grid-cols-5 gap-2">
                {EMOJI_OPTIONS.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setSelectedEmoji(emoji)}
                    className={`
                      text-3xl p-3 rounded-lg transition-all
                      ${selectedEmoji === emoji
                        ? 'bg-emerald-50 ring-2 ring-[#10B981] scale-110'
                        : 'bg-gray-100 hover:bg-gray-200'
                      }
                    `}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Moneda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Moneda
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
              >
                <option value="COP">🇨🇴 Peso Colombiano (COP)</option>
                <option value="USD">🇺🇸 Dólar (USD)</option>
                <option value="EUR">🇪🇺 Euro (EUR)</option>
                <option value="MXN">🇲🇽 Peso Mexicano (MXN)</option>
              </select>
            </div>

            {/* Preview */}
            <div className="p-4 bg-emerald-50 rounded-lg border-2 border-emerald-200">
              <p className="text-xs text-gray-600 mb-2">Vista Previa:</p>
              <div className="flex items-center gap-3">
                <div className="text-4xl">{selectedEmoji}</div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {name || 'Nombre del grupo'}
                  </p>
                  <p className="text-sm text-gray-600">
                    1 miembro · {currency}
                  </p>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-sm text-red-600">{error}</p>
              </motion.div>
            )}

            {/* Botones */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !name.trim()}
                className="flex-1 px-4 py-3 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creando...' : 'Crear Grupo'}
              </button>
            </div>
            
            {/* Espacio adicional para mejor scroll */}
            <div className="h-4" />
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}