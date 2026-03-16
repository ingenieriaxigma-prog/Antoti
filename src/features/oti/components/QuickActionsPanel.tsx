/**
 * ⚡ PANEL DE QUICK ACTIONS - FASE 5 (MOBILE-FIRST)
 * 
 * Panel de accesos rápidos optimizado para dispositivos móviles
 * - MÓVIL: Bottom sheet táctil con botones grandes
 * - DESKTOP: Modal centrado con búsqueda y teclado
 */

import { useState, useEffect, useRef } from 'react';
import { X, Search, Command, ChevronDown } from 'lucide-react';
import { QUICK_ACTIONS, getQuickActionsForContext, type QuickAction, type OtiAction, type OtiScreenContext } from '../types/structured-response.types';
import { useIsMobile } from '../hooks/useIsMobile';

interface QuickActionsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: OtiAction) => void;
  currentContext?: OtiScreenContext; // 🆕 Contexto actual
}

export function QuickActionsPanel({ isOpen, onClose, onAction, currentContext = 'home' }: QuickActionsPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const startY = useRef(0);
  const currentY = useRef(0);

  // 🆕 Obtener acciones según el contexto actual
  const contextActions = getQuickActionsForContext(currentContext);

  // Filtrar acciones por búsqueda
  const filteredActions = contextActions.filter(quickAction => 
    quickAction.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    quickAction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    quickAction.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Resetear cuando se abre/cierra
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedIndex(0);
      if (!isMobile) {
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    }
  }, [isOpen, isMobile]);

  // Navegación con teclado (solo desktop)
  useEffect(() => {
    if (isMobile) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredActions.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredActions[selectedIndex]) {
            handleSelectAction(filteredActions[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredActions, selectedIndex, isMobile]);

  const handleSelectAction = (quickAction: QuickAction) => {
    onAction(quickAction.action);
    onClose();
  };

  // Gestos táctiles para cerrar (swipe down en móvil)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile) return;
    currentY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (!isMobile) return;
    const deltaY = currentY.current - startY.current;
    
    // Si swipe hacia abajo más de 100px, cerrar
    if (deltaY > 100) {
      onClose();
    }
  };

  // Agrupar acciones por categoría
  const groupedActions = filteredActions.reduce((acc, action) => {
    if (!acc[action.category]) {
      acc[action.category] = [];
    }
    acc[action.category].push(action);
    return acc;
  }, {} as Record<string, QuickAction[]>);

  const categoryLabels = {
    finance: '💰 Finanzas',
    data: '📊 Datos',
    view: '👁️ Vistas',
    help: '❓ Ayuda',
  };

  if (!isOpen) return null;

  // ========================================
  // VERSIÓN MÓVIL: Bottom Sheet
  // ========================================
  if (isMobile) {
    return (
      <div 
        className="fixed inset-0 bg-black/50 z-50 flex items-end animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div 
          className="bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl w-full max-h-[85vh] animate-in slide-in-from-bottom duration-300 flex flex-col"
          onClick={(e) => e.stopPropagation()}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Handle para arrastrar */}
          <div className="flex justify-center py-3 border-b border-gray-200 dark:border-gray-800">
            <div className="w-12 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl">
              <Command className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Acciones Rápidas
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Toca para ejecutar
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors active:scale-95"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Search input */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Buscar acción..."
                className="w-full pl-12 pr-4 py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl border-2 border-transparent focus:border-emerald-500 focus:outline-none transition-colors text-base"
              />
            </div>
          </div>

          {/* Actions list - MÓVIL */}
          <div className="overflow-y-auto flex-1">
            {filteredActions.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  No se encontraron acciones
                </p>
              </div>
            ) : (
              <div className="p-3">
                {Object.entries(groupedActions).map(([category, actions]) => (
                  <div key={category} className="mb-4">
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 px-3 py-2 uppercase tracking-wider">
                      {categoryLabels[category as keyof typeof categoryLabels]}
                    </p>
                    <div className="space-y-2">
                      {actions.map((quickAction) => (
                        <button
                          key={quickAction.id}
                          onClick={() => handleSelectAction(quickAction)}
                          className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-850 border border-gray-200 dark:border-gray-700 active:scale-[0.98] transition-all shadow-sm active:shadow-md"
                        >
                          {/* Icon - MÁS GRANDE para móvil */}
                          <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-md">
                            <span className="text-2xl">{quickAction.icon}</span>
                          </div>

                          {/* Content */}
                          <div className="flex-1 text-left min-w-0">
                            <p className="text-base font-semibold text-gray-900 dark:text-white break-words leading-tight">
                              {quickAction.label}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {quickAction.description}
                            </p>
                          </div>

                          {/* Arrow */}
                          <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              {filteredActions.length} acciones disponibles • Desliza hacia abajo para cerrar
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ========================================
  // VERSIÓN DESKTOP: Modal centrado
  // ========================================
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20 animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 animate-in slide-in-from-top-4 duration-300 overflow-hidden border border-gray-200 dark:border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg">
            <Command className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Acciones Rápidas
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Busca y ejecuta acciones con el teclado
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Search input */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Buscar acción..."
              className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl border-2 border-transparent focus:border-emerald-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Actions list - DESKTOP */}
        <div className="overflow-y-auto max-h-96">
          {filteredActions.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No se encontraron acciones
              </p>
            </div>
          ) : (
            <div className="p-2">
              {Object.entries(groupedActions).map(([category, actions]) => (
                <div key={category} className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-2">
                    {categoryLabels[category as keyof typeof categoryLabels]}
                  </p>
                  <div className="space-y-1">
                    {actions.map((quickAction) => {
                      const globalIndex = filteredActions.indexOf(quickAction);
                      const isSelected = globalIndex === selectedIndex;

                      return (
                        <button
                          key={quickAction.id}
                          onClick={() => handleSelectAction(quickAction)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group ${
                            isSelected
                              ? 'bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-2 border-emerald-500'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800 border-2 border-transparent'
                          }`}
                        >
                          {/* Icon */}
                          <div className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                            isSelected 
                              ? 'bg-emerald-500 text-white' 
                              : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30'
                          }`}>
                            <span className="text-lg">{quickAction.icon}</span>
                          </div>

                          {/* Content */}
                          <div className="flex-1 text-left min-w-0">
                            <p className={`text-sm font-medium truncate ${
                              isSelected 
                                ? 'text-emerald-700 dark:text-emerald-300' 
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {quickAction.label}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {quickAction.description}
                            </p>
                          </div>

                          {/* Shortcut */}
                          {quickAction.shortcut && (
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-mono ${
                              isSelected
                                ? 'bg-emerald-200 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-300'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                            }`}>
                              {quickAction.shortcut}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span>↑↓ Navegar</span>
              <span>↵ Seleccionar</span>
              <span>Esc Cerrar</span>
            </div>
            <span>{filteredActions.length} acciones</span>
          </div>
        </div>
      </div>
    </div>
  );
}