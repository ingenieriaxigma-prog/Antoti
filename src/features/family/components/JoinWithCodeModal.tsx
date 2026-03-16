/**
 * 🔑 JOIN WITH CODE MODAL
 * 
 * Modal para unirse a un grupo usando código de invitación
 */

import React, { useState } from 'react';
import { X, Key, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner@2.0.3';
import { useInvitations } from '../hooks/useInvitations';

interface JoinWithCodeModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function JoinWithCodeModal({ onClose, onSuccess }: JoinWithCodeModalProps) {
  const [code, setCode] = useState('');
  const { joinWithCode, isLoading } = useInvitations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      toast.error('Ingresa un código de invitación');
      return;
    }

    // Validar formato básico (FAM-XXXXXXXX)
    const codePattern = /^FAM-[A-Z0-9]{8}$/i;
    if (!codePattern.test(code.trim())) {
      toast.error('Formato de código inválido', {
        description: 'El código debe tener el formato: FAM-XXXXXXXX',
      });
      return;
    }

    try {
      const result = await joinWithCode(code.trim().toUpperCase());
      toast.success('¡Te uniste al grupo!', {
        description: `Ahora eres miembro de ${result.group.name}`,
      });
      onSuccess();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al unirse';
      toast.error('Error al unirse con código', {
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
          className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full"
        >
          {/* Header */}
          <div className="bg-[#10B981] px-6 py-6 text-white rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Key className="w-6 h-6" />
                <div>
                  <h2 className="text-2xl font-bold">Unirse con Código</h2>
                  <p className="text-emerald-100 text-sm">
                    Ingresa el código de invitación
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
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Input de código */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código de Invitación
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="FAM-XXXXXXXX"
                maxLength={12}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono text-center text-lg tracking-wider"
                disabled={isLoading}
                autoFocus
              />
              <p className="text-sm text-gray-500 mt-2">
                El código tiene el formato: <code className="font-mono">FAM-XXXXXXXX</code>
              </p>
            </div>

            {/* Instrucciones */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-emerald-900">
                  <p className="font-medium mb-1">¿Cómo obtener un código?</p>
                  <ul className="space-y-1 text-emerald-700">
                    <li>• Pide a un administrador del grupo que te invite</li>
                    <li>• Recibirás el código por email o mensaje</li>
                    <li>• El código es válido por 7 días</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-medium"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading || !code.trim()}
                className="flex-1 px-4 py-3 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isLoading ? 'Uniéndose...' : 'Unirse al Grupo'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
