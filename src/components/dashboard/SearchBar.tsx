/**
 * SearchBar
 * 
 * Componente de búsqueda memoizado con debounce integrado.
 */

import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { debounce } from '../../utils/performance';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

function SearchBar({ 
  onSearch, 
  placeholder = 'Buscar transacciones...', 
  className = '' 
}: SearchBarProps) {
  const [localQuery, setLocalQuery] = useState('');

  // Debounce de la búsqueda para no hacer llamadas excesivas
  useEffect(() => {
    const debouncedSearch = debounce((query: string) => {
      onSearch(query);
    }, 300);

    debouncedSearch(localQuery);
  }, [localQuery, onSearch]);

  const handleClear = () => {
    setLocalQuery('');
    onSearch('');
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        <Search className="w-5 h-5" />
      </div>
      
      <input
        type="text"
        value={localQuery}
        onChange={(e) => setLocalQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-400"
      />
      
      {localQuery && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="Limpiar búsqueda"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

// No necesitamos memo aquí porque el estado interno maneja los cambios
export default SearchBar;
