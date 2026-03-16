/**
 * 🔔 NOTIFICATION SETTINGS
 * 
 * Panel de configuración de preferencias de notificaciones personales.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, BellOff, DollarSign, Moon, Calendar, Wallet, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { useNotificationPreferences } from '../../hooks/useNotificationPreferences';
import { toast } from 'sonner@2.0.3';
import { otiConfirm } from '../ui/OtiConfirmDialog';

interface NotificationSettingsProps {
  onClose?: () => void;
}

export function NotificationSettings({ onClose }: NotificationSettingsProps) {
  const { preferences, updatePreference, resetPreferences } = useNotificationPreferences();
  const [expandedSection, setExpandedSection] = useState<string | null>('budgets');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleReset = async () => {
    const confirmed = await otiConfirm({
      title: '¿Restablecer preferencias?',
      description: 'Todas las preferencias volverán a sus valores por defecto. Esta acción no se puede deshacer.',
      variant: 'warning',
      confirmText: 'Sí, restablecer',
      cancelText: 'Cancelar'
    });

    if (confirmed) {
      resetPreferences();
      toast.success('✅ Preferencias restablecidas');
    }
  };

  const weekDays = [
    { value: 0, label: 'D' },
    { value: 1, label: 'L' },
    { value: 2, label: 'M' },
    { value: 3, label: 'X' },
    { value: 4, label: 'J' },
    { value: 5, label: 'V' },
    { value: 6, label: 'S' },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-gray-900 dark:text-white">Configuración de Notificaciones</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Personaliza tus alertas y recordatorios</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        
        {/* 💰 Presupuestos */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden"
        >
          <button
            onClick={() => toggleSection('budgets')}
            className="w-full p-4 flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <h3 className="text-gray-900 dark:text-white">Alertas de Presupuestos</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {preferences.budgetAlerts ? 'Activado' : 'Desactivado'}
                </p>
              </div>
            </div>
            {expandedSection === 'budgets' ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSection === 'budgets' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 pb-4 space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Habilitar alertas</span>
                <button
                  onClick={() => updatePreference('budgetAlerts', !preferences.budgetAlerts)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    preferences.budgetAlerts ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <motion.div
                    animate={{ x: preferences.budgetAlerts ? 24 : 2 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full"
                  />
                </button>
              </div>

              {preferences.budgetAlerts && (
                <div className="space-y-2">
                  <label className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    Umbrales de alerta (%)
                    <Info className="w-4 h-4 text-gray-400" />
                  </label>
                  <div className="flex gap-2">
                    {[50, 75, 80, 90, 100].map(threshold => (
                      <button
                        key={threshold}
                        onClick={() => {
                          const current = preferences.budgetThresholds;
                          const updated = current.includes(threshold)
                            ? current.filter(t => t !== threshold)
                            : [...current, threshold].sort((a, b) => a - b);
                          updatePreference('budgetThresholds', updated);
                        }}
                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                          preferences.budgetThresholds.includes(threshold)
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {threshold}%
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Selecciona los porcentajes en los que quieres recibir alertas
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* 🌙 Recordatorios Diarios */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden"
        >
          <button
            onClick={() => toggleSection('daily')}
            className="w-full p-4 flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <div>
                <h3 className="text-gray-900 dark:text-white">Recordatorios Nocturnos</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {preferences.dailyReminder ? `${preferences.dailyReminderTime}` : 'Desactivado'}
                </p>
              </div>
            </div>
            {expandedSection === 'daily' ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSection === 'daily' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 pb-4 space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Habilitar recordatorios</span>
                <button
                  onClick={() => updatePreference('dailyReminder', !preferences.dailyReminder)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    preferences.dailyReminder ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <motion.div
                    animate={{ x: preferences.dailyReminder ? 24 : 2 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full"
                  />
                </button>
              </div>

              {preferences.dailyReminder && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-700 dark:text-gray-300">Hora del recordatorio</label>
                    <input
                      type="time"
                      value={preferences.dailyReminderTime}
                      onChange={(e) => updatePreference('dailyReminderTime', e.target.value)}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-700 dark:text-gray-300">Días de la semana</label>
                    <div className="flex gap-2">
                      {weekDays.map(day => (
                        <button
                          key={day.value}
                          onClick={() => {
                            const current = preferences.dailyReminderDays;
                            const updated = current.includes(day.value)
                              ? current.filter(d => d !== day.value)
                              : [...current, day.value].sort();
                            updatePreference('dailyReminderDays', updated);
                          }}
                          className={`w-10 h-10 rounded-lg text-sm transition-colors ${
                            preferences.dailyReminderDays.includes(day.value)
                              ? 'bg-indigo-500 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* 📅 Declaración de Renta */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden"
        >
          <button
            onClick={() => toggleSection('tax')}
            className="w-full p-4 flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <h3 className="text-gray-900 dark:text-white">Declaración de Renta</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {preferences.taxReminders ? 'Activado' : 'Desactivado'}
                </p>
              </div>
            </div>
            {expandedSection === 'tax' ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSection === 'tax' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 pb-4 space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Habilitar recordatorios</span>
                <button
                  onClick={() => updatePreference('taxReminders', !preferences.taxReminders)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    preferences.taxReminders ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <motion.div
                    animate={{ x: preferences.taxReminders ? 24 : 2 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full"
                  />
                </button>
              </div>

              {preferences.taxReminders && (
                <div className="space-y-2">
                  <label className="text-sm text-gray-700 dark:text-gray-300">Meses de alerta</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 1, label: 'Enero' },
                      { value: 2, label: 'Febrero' },
                      { value: 3, label: 'Marzo' },
                    ].map(month => (
                      <button
                        key={month.value}
                        onClick={() => {
                          const current = preferences.taxReminderMonths;
                          const updated = current.includes(month.value)
                            ? current.filter(m => m !== month.value)
                            : [...current, month.value].sort();
                          updatePreference('taxReminderMonths', updated);
                        }}
                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                          preferences.taxReminderMonths.includes(month.value)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {month.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Te alertaremos en los meses seleccionados antes de abril
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* 💳 Balance de Cuentas */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden"
        >
          <button
            onClick={() => toggleSection('balance')}
            className="w-full p-4 flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <Wallet className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <div>
                <h3 className="text-gray-900 dark:text-white">Balance de Cuentas</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {preferences.lowBalanceAlerts ? 'Activado' : 'Desactivado'}
                </p>
              </div>
            </div>
            {expandedSection === 'balance' ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSection === 'balance' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 pb-4 space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Alerta de balance bajo</span>
                <button
                  onClick={() => updatePreference('lowBalanceAlerts', !preferences.lowBalanceAlerts)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    preferences.lowBalanceAlerts ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <motion.div
                    animate={{ x: preferences.lowBalanceAlerts ? 24 : 2 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full"
                  />
                </button>
              </div>

              {preferences.lowBalanceAlerts && (
                <div className="space-y-2">
                  <label className="text-sm text-gray-700 dark:text-gray-300">Umbral mínimo (COP)</label>
                  <input
                    type="number"
                    value={preferences.lowBalanceThreshold}
                    onChange={(e) => updatePreference('lowBalanceThreshold', Number(e.target.value))}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                    step="10000"
                    min="0"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Te alertaremos cuando una cuenta tenga menos de este monto
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Alerta de sobregiro</span>
                <button
                  onClick={() => updatePreference('negativeBalanceAlerts', !preferences.negativeBalanceAlerts)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    preferences.negativeBalanceAlerts ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <motion.div
                    animate={{ x: preferences.negativeBalanceAlerts ? 24 : 2 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full"
                  />
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex gap-3">
        <button
          onClick={handleReset}
          className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          Restablecer
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all"
          >
            Guardar
          </button>
        )}
      </div>
    </div>
  );
}