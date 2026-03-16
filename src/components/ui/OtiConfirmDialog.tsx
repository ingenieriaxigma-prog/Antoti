/**
 * 🎨 OTI CONFIRM DIALOG
 * 
 * Componente de confirmación con identidad de marca Oti.
 * Reemplazo premium de window.confirm() con logo, colores brand y animaciones.
 * 
 * @example
 * // Uso imperativo (como window.confirm)
 * const confirmed = await otiConfirm({
 *   title: '¿Eliminar transacción?',
 *   description: 'Esta acción no se puede deshacer',
 *   variant: 'danger'
 * });
 * 
 * @example
 * // Uso declarativo (con estado React)
 * <OtiConfirmDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="¿Continuar?"
 *   description="Esto realizará una acción importante"
 *   onConfirm={handleConfirm}
 * />
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { OtiLogo } from '../OtiLogo';

export type OtiConfirmVariant = 'success' | 'warning' | 'danger' | 'info';

export interface OtiConfirmDialogProps {
  /** Controla si el diálogo está abierto */
  open?: boolean;
  
  /** Callback cuando cambia el estado open */
  onOpenChange?: (open: boolean) => void;
  
  /** Título del diálogo */
  title: string;
  
  /** Descripción detallada */
  description?: string;
  
  /** Variante visual */
  variant?: OtiConfirmVariant;
  
  /** Texto del botón de confirmación */
  confirmText?: string;
  
  /** Texto del botón de cancelación */
  cancelText?: string;
  
  /** Callback al confirmar */
  onConfirm?: () => void | Promise<void>;
  
  /** Callback al cancelar */
  onCancel?: () => void;
  
  /** Mostrar botón de cancelar */
  showCancel?: boolean;
  
  /** Disabled state para botones */
  loading?: boolean;
}

// Configuración de variantes
const variantConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'from-emerald-500 to-teal-600',
    iconColor: 'text-emerald-500',
    buttonColor: 'bg-emerald-500 hover:bg-emerald-600',
    borderColor: 'border-emerald-200 dark:border-emerald-700/50',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'from-amber-500 to-orange-600',
    iconColor: 'text-amber-500',
    buttonColor: 'bg-amber-500 hover:bg-amber-600',
    borderColor: 'border-amber-200 dark:border-amber-700/50',
  },
  danger: {
    icon: AlertCircle,
    bgColor: 'from-red-500 to-rose-600',
    iconColor: 'text-red-500',
    buttonColor: 'bg-red-500 hover:bg-red-600',
    borderColor: 'border-red-200 dark:border-red-700/50',
  },
  info: {
    icon: Info,
    bgColor: 'from-blue-500 to-indigo-600',
    iconColor: 'text-blue-500',
    buttonColor: 'bg-blue-500 hover:bg-blue-600',
    borderColor: 'border-blue-200 dark:border-blue-700/50',
  },
};

export function OtiConfirmDialog({
  open = false,
  onOpenChange,
  title,
  description,
  variant = 'warning',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  showCancel = true,
  loading = false,
}: OtiConfirmDialogProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  const handleClose = () => {
    if (loading) return;
    onOpenChange?.(false);
    onCancel?.();
  };

  const handleConfirm = async () => {
    if (loading) return;
    await onConfirm?.();
    onOpenChange?.(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]"
            onClick={handleBackdropClick}
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md pointer-events-auto"
            >
              <div className={`
                bg-white dark:bg-gray-900
                rounded-2xl shadow-2xl
                border-2 ${config.borderColor}
                overflow-hidden
              `}>
                {/* Header con Logo Oti */}
                <div className={`
                  relative
                  bg-gradient-to-br ${config.bgColor}
                  px-6 pt-6 pb-4
                `}>
                  {/* Logo Oti */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
                    className="flex justify-center mb-3"
                  >
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <OtiLogo 
                        variant="isotipo" 
                        forceTheme="light"
                        className="w-12 h-12"
                      />
                    </div>
                  </motion.div>

                  {/* Close button */}
                  <button
                    onClick={handleClose}
                    disabled={loading}
                    className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors disabled:opacity-50"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>

                  {/* Title */}
                  <h2 className="text-xl font-bold text-white text-center">
                    {title}
                  </h2>
                </div>

                {/* Body */}
                <div className="px-6 py-5">
                  {/* Icon + Description */}
                  <div className="flex items-start gap-3 mb-6">
                    <div className={`flex-shrink-0 ${config.iconColor}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    {description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    {showCancel && (
                      <button
                        onClick={handleClose}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {cancelText}
                      </button>
                    )}
                    <button
                      onClick={handleConfirm}
                      disabled={loading}
                      className={`
                        flex-1 px-4 py-2.5 text-sm font-medium text-white
                        ${config.buttonColor}
                        rounded-xl transition-colors
                        disabled:opacity-50 disabled:cursor-not-allowed
                        shadow-lg shadow-black/10
                      `}
                    >
                      {loading ? 'Procesando...' : confirmText}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// UTILITY FUNCTIONS - Para uso imperativo (como window.confirm)
// ============================================================================

interface OtiConfirmOptions {
  title: string;
  description?: string;
  variant?: OtiConfirmVariant;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

// Estado global para el diálogo imperativo
let imperativeDialog: {
  show: (options: OtiConfirmOptions) => Promise<boolean>;
} | null = null;

/**
 * Hook para habilitar el uso imperativo de otiConfirm()
 * Debe ser usado una vez en el root de la app (App.tsx)
 */
export function useOtiConfirmProvider() {
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    options: OtiConfirmOptions;
    resolver: ((value: boolean) => void) | null;
  }>({
    open: false,
    options: { title: '' },
    resolver: null,
  });

  useEffect(() => {
    imperativeDialog = {
      show: (options: OtiConfirmOptions) => {
        return new Promise<boolean>((resolve) => {
          setDialogState({
            open: true,
            options,
            resolver: resolve,
          });
        });
      },
    };

    return () => {
      imperativeDialog = null;
    };
  }, []);

  const handleConfirm = () => {
    dialogState.resolver?.(true);
    setDialogState((prev) => ({ ...prev, open: false }));
  };

  const handleCancel = () => {
    dialogState.resolver?.(false);
    setDialogState((prev) => ({ ...prev, open: false }));
  };

  return (
    <OtiConfirmDialog
      open={dialogState.open}
      onOpenChange={(open) => {
        if (!open) {
          handleCancel();
        }
      }}
      title={dialogState.options.title}
      description={dialogState.options.description}
      variant={dialogState.options.variant}
      confirmText={dialogState.options.confirmText}
      cancelText={dialogState.options.cancelText}
      showCancel={dialogState.options.showCancel}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );
}

/**
 * Función imperativa para mostrar diálogo de confirmación
 * Retorna Promise<boolean> - true si confirma, false si cancela
 * 
 * @example
 * const confirmed = await otiConfirm({
 *   title: '¿Eliminar transacción?',
 *   description: 'Esta acción no se puede deshacer',
 *   variant: 'danger'
 * });
 * if (confirmed) {
 *   // Usuario confirmó
 * }
 */
export async function otiConfirm(options: OtiConfirmOptions): Promise<boolean> {
  if (!imperativeDialog) {
    console.warn(
      'otiConfirm() requiere que useOtiConfirmProvider() esté habilitado en App.tsx'
    );
    // Fallback a window.confirm si no está habilitado
    return window.confirm(`${options.title}\n\n${options.description || ''}`);
  }

  return imperativeDialog.show(options);
}
