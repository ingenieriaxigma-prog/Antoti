import React from 'react';
import { Info } from 'lucide-react';

// Importar los emojis del sistema (debe coincidir con TransactionCard.tsx)
const EMOJI_CATEGORIES = {
  aprobacion: {
    title: '👍 Aprobación',
    color: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
    emojis: [
      { emoji: '👍', label: 'Me gusta' },
      { emoji: '✅', label: 'Aprobado' },
      { emoji: '💚', label: 'Excelente' },
    ]
  },
  preocupacion: {
    title: '😰 Preocupación',
    color: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
    emojis: [
      { emoji: '😰', label: 'Preocupado' },
      { emoji: '😬', label: 'Incómodo' },
      { emoji: '🚨', label: 'Alerta' },
    ]
  },
  inteligente: {
    title: '💰 Inteligente',
    color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    emojis: [
      { emoji: '💰', label: 'Buen ahorro' },
      { emoji: '🎯', label: 'Acertado' },
      { emoji: '🧠', label: 'Inteligente' },
    ]
  },
  sorpresa: {
    title: '😱 ¡Caro!',
    color: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    emojis: [
      { emoji: '😱', label: '¡Caro!' },
      { emoji: '💸', label: 'Mucho dinero' },
      { emoji: '🤯', label: '¡Wow caro!' },
    ]
  },
  humor: {
    title: '😂 Humor',
    color: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    emojis: [
      { emoji: '😂', label: 'Jajaja' },
      { emoji: '🤣', label: 'Me muero' },
      { emoji: '😅', label: 'Ay no' },
    ]
  },
  duda: {
    title: '🤔 Duda',
    color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
    emojis: [
      { emoji: '🤔', label: 'Mmm...' },
      { emoji: '🧐', label: 'Déjame ver' },
      { emoji: '👀', label: 'Sospechoso' },
    ]
  },
  celebracion: {
    title: '🎉 Celebración',
    color: 'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800',
    emojis: [
      { emoji: '🎉', label: '¡Genial!' },
      { emoji: '🎊', label: '¡Fiesta!' },
      { emoji: '🥳', label: 'Celebremos' },
    ]
  },
  neutral: {
    title: '😶 Neutral',
    color: 'bg-gray-50 dark:bg-gray-700/20 border-gray-200 dark:border-gray-600',
    emojis: [
      { emoji: '😶', label: 'Sin palabras' },
      { emoji: '🤐', label: 'Me callo' },
      { emoji: '👻', label: 'Me voy' },
    ]
  },
  impresionante: {
    title: '🔥 Impresionante',
    color: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
    emojis: [
      { emoji: '🔥', label: 'Fire' },
      { emoji: '⚡', label: 'Increíble' },
      { emoji: '✨', label: 'Brillante' },
    ]
  },
  empatia: {
    title: '💔 Empatía',
    color: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800',
    emojis: [
      { emoji: '💔', label: 'Ay no' },
      { emoji: '😢', label: 'Triste' },
      { emoji: '😭', label: 'Me duele' },
    ]
  },
  apoyo: {
    title: '🤝 Apoyo',
    color: 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800',
    emojis: [
      { emoji: '🤝', label: 'Te apoyo' },
      { emoji: '💪', label: 'Fuerza' },
      { emoji: '🫂', label: 'Abrazo' },
    ]
  },
  alerta: {
    title: '⚠️ Alerta',
    color: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    emojis: [
      { emoji: '⚠️', label: 'Cuidado' },
      { emoji: '🛑', label: 'Alto' },
    ]
  },
};

interface StickersCatalogProps {
  onClose?: () => void;
}

export function StickersCatalog({ onClose }: StickersCatalogProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-[#10B981] p-4 text-white">
        <h2 className="text-xl font-bold mb-1">🎭 Lenguaje de Stickers</h2>
        <p className="text-sm text-emerald-100">
          Comunícate con tu familia de forma más expresiva
        </p>
      </div>

      {/* Info banner */}
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-200 dark:border-emerald-800 p-3">
        <div className="flex items-start gap-2 text-sm text-emerald-800 dark:text-emerald-200">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>
            Cada emoji tiene un significado específico para finanzas. Úsalos para reaccionar a las transacciones de tu familia.
          </p>
        </div>
      </div>

      {/* Categories grid */}
      <div className="p-4 max-h-[600px] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(EMOJI_CATEGORIES).map(([key, category]) => (
            <div
              key={key}
              className={`border rounded-lg p-3 ${category.color}`}
            >
              <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                {category.title}
              </h3>
              <div className="space-y-1">
                {category.emojis.map((item) => (
                  <div
                    key={item.emoji}
                    className="flex items-center gap-2 text-sm"
                  >
                    <span className="text-xl">{item.emoji}</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer con ejemplos */}
      <div className="bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          💡 Ejemplos de uso
        </h3>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-start gap-2">
            <span className="text-lg">💰🎯</span>
            <p>Compra inteligente del supermercado con descuentos</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-lg">😱💸</span>
            <p>Celular nuevo muy caro</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-lg">😂😅</span>
            <p>Pizza a domicilio por tercera vez en la semana</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-lg">💪🫂</span>
            <p>Pago de colegiatura - apoyo familiar</p>
          </div>
        </div>
      </div>

      {/* Close button (opcional) */}
      {onClose && (
        <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
          >
            Entendido
          </button>
        </div>
      )}
    </div>
  );
}
