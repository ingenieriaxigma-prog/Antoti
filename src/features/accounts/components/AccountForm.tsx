/**
 * AccountForm Component
 * 
 * Modal form for creating/editing accounts
 */

import { Plus, Info, ArrowRight } from 'lucide-react';
import { useLocalization } from '../../../hooks/useLocalization';
import type { AccountFormProps, AccountTypeConfig } from '../types';

interface AccountFormPropsExtended extends AccountFormProps {
  accountTypeConfig: Record<string, AccountTypeConfig>;
}

export function AccountForm({
  show,
  editingAccount,
  accountName,
  accountType,
  accountBalance,
  onAccountNameChange,
  onAccountTypeChange,
  onAccountBalanceChange,
  onSubmit,
  onClose,
  accountTypeConfig,
}: AccountFormPropsExtended) {
  const { t } = useLocalization();

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center sm:justify-center">
      <div className="bg-white dark:bg-gray-900 w-full sm:max-w-md sm:rounded-t-2xl rounded-t-2xl animate-slide-up max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-gray-900 dark:text-white">
              {editingAccount ? t('accounts.editAccount') : t('accounts.newAccount')}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Close"
            >
              <Plus className="w-5 h-5 text-gray-600 dark:text-gray-400 rotate-45" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 pb-24">
          {/* Account Type Selector */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              {t('accounts.accountType')}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(accountTypeConfig).map(([type, config]) => {
                const Icon = config.icon;
                return (
                  <button
                    key={type}
                    onClick={() => onAccountTypeChange(type as any)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                      accountType === type
                        ? 'bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500'
                        : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                    type="button"
                  >
                    <Icon
                      className="w-6 h-6"
                      style={{ color: accountType === type ? config.color : '#9ca3af' }}
                    />
                    <span className="text-xs text-gray-700 dark:text-gray-300">
                      {config.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Account Name Input */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              {t('accounts.accountName')}
            </label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => onAccountNameChange(e.target.value)}
              placeholder={t('accounts.accountName')}
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border-0 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Initial Balance Input - DESHABILITADO */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              {t('accounts.initialBalance')}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                $
              </span>
              <input
                type="number"
                value="0"
                disabled
                placeholder="0"
                className="w-full pl-8 pr-4 py-3 bg-gray-200 dark:bg-gray-800 border-0 rounded-xl text-gray-500 dark:text-gray-500 placeholder:text-gray-400 dark:placeholder:text-gray-600 cursor-not-allowed opacity-60"
              />
            </div>
            
            {/* 💡 Mensaje Educativo */}
            <div className="mt-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <Info className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 space-y-3">
                  <p className="text-sm text-emerald-800 dark:text-emerald-300">
                    <span className="font-semibold">¿Necesitas registrar un saldo inicial?</span>
                  </p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
                    Para mantener la trazabilidad completa de tus finanzas, los saldos iniciales deben registrarse como <strong>transacciones</strong>.
                  </p>
                  
                  {/* Sección: Dinero que TIENES */}
                  <div className="pt-2 space-y-1.5">
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                      <span className="text-base">📥</span>
                      PARA DINERO QUE TIENES (cuentas positivas):
                    </p>
                    <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 ml-6">
                      <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Ve a <strong>Transacciones</strong> → Crear <strong>INGRESO</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 ml-6">
                      <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Selecciona la categoría que mejor represente tu saldo</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 ml-6">
                      <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Elige esta cuenta y registra el monto</span>
                    </div>
                  </div>

                  {/* Sección: Deudas y Préstamos */}
                  <div className="pt-2 space-y-1.5 border-t border-emerald-200 dark:border-emerald-700">
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                      <span className="text-base">📤</span>
                      PARA DEUDAS Y PRÉSTAMOS (cuentas negativas):
                    </p>
                    <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 ml-6">
                      <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Ve a <strong>Transacciones</strong> → Crear <strong>GASTO</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 ml-6">
                      <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Usa la categoría <strong>💳 Préstamos y Créditos</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 ml-6">
                      <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Elige esta cuenta y registra cuánto debes</span>
                    </div>
                  </div>

                  {/* Ejemplos */}
                  <div className="pt-2 border-t border-emerald-200 dark:border-emerald-700">
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 italic">
                      💡 Ejemplos: "Salario" para dinero guardado, "Inversiones" para portafolio, "Préstamos" para deuda con amigo
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={onSubmit}
            className="w-full py-3 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all shadow-lg"
          >
            {editingAccount ? t('accounts.editAccount') : t('accounts.newAccount')}
          </button>
        </div>
      </div>
    </div>
  );
}