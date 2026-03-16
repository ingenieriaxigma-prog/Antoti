/**
 * BudgetsHeader Component
 * 
 * Displays the header with back navigation, centered title, and search
 */

import { memo, useState, useRef, useEffect } from 'react';
import { ArrowLeft, Search, X, GraduationCap } from 'lucide-react';
import { useLocalization } from '../../../hooks/useLocalization';
import { ThemeHeaderEffects } from '../../../components/ThemeHeaderEffects'; // 🎨 Import theme effects
import type { BudgetsHeaderProps } from '../types';

const BudgetsHeader = memo<BudgetsHeaderProps>(({ 
  onNavigate,
  searchQuery,
  onSearchChange,
  onTourClick, // 🎓 NEW: Tour callback
  showTourBadge, // 🎓 NEW: Show "new" badge
}) => {
  const { t } = useLocalization();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Get current theme from localStorage
  const theme = localStorage.getItem('colorTheme') || 'blue';
  
  // Focus input when search expands
  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);
  
  // Handle search toggle
  const handleSearchToggle = () => {
    if (isSearchExpanded && searchQuery) {
      // Clear search if closing with active query
      onSearchChange('');
    }
    setIsSearchExpanded(!isSearchExpanded);
  };
  
  return (
    <div className="fixed-top-header bg-white dark:bg-gray-900 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-800 shadow-sm z-10 safe-area-top relative overflow-hidden">
      {/* 🎨 Efectos temáticos del header */}
      <ThemeHeaderEffects theme={theme} />
      
      <div className="flex items-center justify-between gap-3 relative z-10">
        {/* Left: Back button */}
        <button 
          onClick={() => onNavigate('dashboard')} 
          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors touch-target-md tap-scale shrink-0"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-300" />
        </button>
        
        {/* Center: Title or Search Input */}
        {isSearchExpanded ? (
          <div className="flex-1 flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar presupuesto..."
              className="flex-1 bg-transparent text-sm sm:text-base text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="shrink-0 w-5 h-5 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                aria-label="Clear search"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 dark:text-gray-400" />
              </button>
            )}
          </div>
        ) : (
          <h1 className="flex-1 text-center text-base sm:text-lg text-gray-900 dark:text-white">
            {t('budgets.title')}
          </h1>
        )}
        
        {/* Right: Search Toggle Button */}
        <button
          onClick={handleSearchToggle}
          className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full transition-all touch-target-md tap-scale shrink-0 ${
            isSearchExpanded 
              ? 'bg-emerald-100 dark:bg-emerald-900/30' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          aria-label={isSearchExpanded ? "Cerrar búsqueda" : "Buscar presupuestos"}
        >
          <Search className={`w-5 h-5 sm:w-6 sm:h-6 ${
            isSearchExpanded 
              ? 'text-emerald-600 dark:text-emerald-400' 
              : 'text-gray-600 dark:text-gray-300'
          }`} />
        </button>
        
        {/* Right: Tour Button */}
        <button
          onClick={onTourClick}
          className={`relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full transition-all touch-target-md tap-scale shrink-0 ${
            showTourBadge ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          aria-label="Tour de presupuestos"
        >
          <GraduationCap className={`w-5 h-5 sm:w-6 sm:h-6 ${
            showTourBadge ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-300'
          }`} />
          {showTourBadge && (
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
          )}
        </button>
      </div>
    </div>
  );
});

BudgetsHeader.displayName = 'BudgetsHeader';

export { BudgetsHeader };