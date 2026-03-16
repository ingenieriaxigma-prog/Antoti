/**
 * 🚀 GROUP SPEED DIAL - Oti Asistente Inteligente UNIFICADO para Grupos
 * 
 * ✨ VERSIÓN MODAL: Bottom Sheet con explicaciones claras de cada opción
 * 
 * FAB expandible específico para grupos familiares.
 * Botón principal con ícono "+" (gradiente verde esmeralda), abre modal con 4 opciones:
 * 1. 💬 Chat con Oti (Asistente IA completo)
 * 2. 🎤 Habla tu gasto (transacción grupal por voz)
 * 3. 📸 Escanea recibo (escanear recibo grupal)
 * 4. ✏️ Llenar formulario (transacción grupal manual)
 * 
 * Posicionado en esquina inferior izquierda para no interferir con acciones
 */

import { useState } from 'react';
import { Mic, Edit3, X, Camera, MessageCircle, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GroupSpeedDialProps {
  onChatClick: () => void;
  onVoiceClick: () => void;
  onManualClick: () => void;
  onImageClick: () => void;
}

export function GroupSpeedDial({ onChatClick, onVoiceClick, onManualClick, onImageClick }: GroupSpeedDialProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleChatClick = () => {
    setIsOpen(false);
    onChatClick();
  };

  const handleVoiceClick = () => {
    setIsOpen(false);
    onVoiceClick();
  };

  const handleManualClick = () => {
    setIsOpen(false);
    onManualClick();
  };

  const handleImageClick = () => {
    setIsOpen(false);
    onImageClick();
  };

  const handleBackdropClick = () => {
    setIsOpen(false);
  };

  const handleToggle = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <>
      {/* Backdrop - Solo visible cuando está abierto */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleBackdropClick}
            className="fixed inset-0 bg-black/40 dark:bg-black/60 z-[45] backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Modal Bottom Sheet */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ 
              type: 'spring',
              damping: 30,
              stiffness: 300
            }}
            className="fixed inset-x-0 bottom-0 z-50 bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl max-w-lg mx-auto"
            style={{ maxHeight: '85vh' }}
          >
            {/* Handle bar - Indicador para deslizar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            </div>

            {/* Contenido del Modal */}
            <div className="px-6 pb-8 pt-4 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 80px)' }}>
              {/* Título */}
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
                ¿Cómo quieres registrar la transacción grupal?
              </h2>

              {/* Opciones */}
              <div className="space-y-3">
                {/* Opción 1: Chat con Oti */}
                <motion.button
                  onClick={handleChatClick}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-2 border-emerald-200 dark:border-emerald-700 rounded-2xl p-4 text-left transition-all hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-lg"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 via-green-500 to-lime-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        Chat con Oti
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        Pregúntale a tu asistente IA sobre las finanzas del grupo
                      </p>
                    </div>
                  </div>
                </motion.button>

                {/* Opción 2: Habla tu gasto */}
                <motion.button
                  onClick={handleVoiceClick}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-2 border-emerald-200 dark:border-emerald-700 rounded-2xl p-4 text-left transition-all hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-lg"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                      <Mic className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        🎤 Habla tu gasto
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1 leading-relaxed">
                        Di la transacción grupal y Oti la registra automáticamente
                      </p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 italic">
                        Ej: "Gastamos 80 mil en mercado familiar"
                      </p>
                    </div>
                  </div>
                </motion.button>

                {/* Opción 3: Escanea recibo */}
                <motion.button
                  onClick={handleImageClick}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-2xl p-4 text-left transition-all hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        📸 Escanea recibo
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1 leading-relaxed">
                        Toma foto al ticket y la IA extrae los datos del grupo
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 italic">
                        Funciona con recibos y extractos bancarios
                      </p>
                    </div>
                  </div>
                </motion.button>

                {/* Opción 4: Llenar formulario */}
                <motion.button
                  onClick={handleManualClick}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-700/20 dark:to-slate-700/20 border-2 border-gray-200 dark:border-gray-600 rounded-2xl p-4 text-left transition-all hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-lg"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                      <Edit3 className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        ✏️ Llenar formulario
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1 leading-relaxed">
                        Ingresa todos los detalles de la transacción grupal
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                        Máximo control sobre cada campo
                      </p>
                    </div>
                  </div>
                </motion.button>
              </div>

              {/* Botón Cancelar */}
              <motion.button
                onClick={handleBackdropClick}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB - Botón "+" */}
      <motion.button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleToggle();
        }}
        className="w-16 h-16 text-white rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110 relative overflow-hidden group z-50"
        style={{ 
          background: isOpen 
            ? 'rgb(239, 68, 68)' 
            : 'linear-gradient(to bottom right, #10b981, #059669)',
          boxShadow: isOpen 
            ? '0 10px 25px -5px rgba(239, 68, 68, 0.5)'
            : '0 12px 30px -5px rgba(16, 185, 129, 0.5)',
          touchAction: 'manipulation',
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú de acciones'}
      >
        {/* Ícono "+" o "X" para cerrar */}
        <motion.div
          animate={{ 
            rotate: isOpen ? 45 : 0,
            scale: isOpen ? 1 : [1, 1.08, 1]
          }}
          transition={{ 
            duration: 0.3, 
            ease: 'easeInOut',
            scale: { 
              repeat: isOpen ? 0 : Infinity, 
              duration: 2.5,
              ease: 'easeInOut'
            }
          }}
          className="flex items-center justify-center relative w-full h-full"
        >
          <Plus className="w-8 h-8" />
        </motion.div>

        {/* Shimmer effect - Gradient animado */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
          animate={{
            x: isOpen ? 0 : [-100, 100]
          }}
          transition={{
            x: {
              repeat: Infinity,
              duration: 2,
              ease: 'linear'
            }
          }}
        />
      </motion.button>
    </>
  );
}