/**
 * 🆕 SPRINT 2: Modal de Confirmación de Creación
 * 
 * Modal que muestra los detalles de un elemento antes de crearlo
 * y solicita confirmación del usuario.
 */

import { X, Check, AlertCircle } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import type { TransactionData, BudgetData, AccountData } from '../types/structured-response.types';

interface CreationConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  data: TransactionData | BudgetData | AccountData | null;
  type: 'transaction' | 'budget' | 'account';
}

export function CreationConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  data,
  type
}: CreationConfirmationModalProps) {
  if (!isOpen || !data) return null;

  const renderTransactionDetails = (data: TransactionData) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <span className="text-sm text-gray-600 dark:text-gray-400">Tipo:</span>
        <span className={`font-medium ${data.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
          {data.type === 'income' ? '💰 Ingreso' : '💸 Gasto'}
        </span>
      </div>
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <span className="text-sm text-gray-600 dark:text-gray-400">Monto:</span>
        <span className="font-bold text-lg">
          ${data.amount.toLocaleString('es-CO')}
        </span>
      </div>
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <span className="text-sm text-gray-600 dark:text-gray-400">Descripción:</span>
        <span className="font-medium">{data.description}</span>
      </div>
      {data.categoryName && (
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <span className="text-sm text-gray-600 dark:text-gray-400">Categoría:</span>
          <span className="font-medium">{data.categoryName}</span>
        </div>
      )}
      {data.accountName && (
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <span className="text-sm text-gray-600 dark:text-gray-400">Cuenta:</span>
          <span className="font-medium">{data.accountName}</span>
        </div>
      )}
      {data.date && (
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <span className="text-sm text-gray-600 dark:text-gray-400">Fecha:</span>
          <span className="font-medium">
            {new Date(data.date).toLocaleDateString('es-ES', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
          </span>
        </div>
      )}
      {data.notes && (
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <span className="text-sm text-gray-600 dark:text-gray-400 block mb-1">Notas:</span>
          <p className="text-sm">{data.notes}</p>
        </div>
      )}
    </div>
  );

  const renderBudgetDetails = (data: BudgetData) => (
    <div className="space-y-3">
      {data.categoryName && (
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <span className="text-sm text-gray-600 dark:text-gray-400">Categoría:</span>
          <span className="font-medium">{data.categoryName}</span>
        </div>
      )}
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <span className="text-sm text-gray-600 dark:text-gray-400">Límite Mensual:</span>
        <span className="font-bold text-lg text-emerald-600">
          ${data.amount.toLocaleString('es-CO')}
        </span>
      </div>
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <span className="text-sm text-gray-600 dark:text-gray-400">Mes:</span>
        <span className="font-medium">
          {new Date(data.month + '-01').toLocaleDateString('es-ES', { 
            month: 'long', 
            year: 'numeric' 
          })}
        </span>
      </div>
      {data.notes && (
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <span className="text-sm text-gray-600 dark:text-gray-400 block mb-1">Notas:</span>
          <p className="text-sm">{data.notes}</p>
        </div>
      )}
    </div>
  );

  const renderAccountDetails = (data: AccountData) => {
    const typeLabels = {
      bank: '🏦 Banco',
      cash: '💵 Efectivo',
      savings: '🐷 Ahorro',
      credit: '💳 Tarjeta de crédito',
      investment: '📈 Inversión'
    };

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <span className="text-sm text-gray-600 dark:text-gray-400">Nombre:</span>
          <span className="font-medium">{data.name}</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <span className="text-sm text-gray-600 dark:text-gray-400">Tipo:</span>
          <span className="font-medium">{typeLabels[data.type]}</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <span className="text-sm text-gray-600 dark:text-gray-400">Balance Inicial:</span>
          <span className="font-bold text-lg text-emerald-600">
            ${data.balance.toLocaleString('es-CO')}
          </span>
        </div>
        {data.notes && (
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span className="text-sm text-gray-600 dark:text-gray-400 block mb-1">Notas:</span>
            <p className="text-sm">{data.notes}</p>
          </div>
        )}
      </div>
    );
  };

  const renderDetails = () => {
    switch (type) {
      case 'transaction':
        return renderTransactionDetails(data as TransactionData);
      case 'budget':
        return renderBudgetDetails(data as BudgetData);
      case 'account':
        return renderAccountDetails(data as AccountData);
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-white" />
            <h2 className="font-semibold text-white">Confirmar Creación</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          <div className="mb-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Revisa los detalles antes de confirmar:
            </p>
          </div>

          {renderDetails()}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
          >
            <Check className="w-4 h-4 mr-2" />
            Confirmar
          </Button>
        </div>
      </div>
    </div>
  );
}
