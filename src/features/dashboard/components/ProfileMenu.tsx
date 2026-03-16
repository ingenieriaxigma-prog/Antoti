/**
 * 👤 ProfileMenu Component - Menú de Perfil con Avatar
 * 
 * Menú desplegable profesional con avatar personalizado que contiene:
 * - Avatar circular con foto de perfil o iniciales del usuario
 * - Información del usuario (nombre y email)
 * - Toggle de modo oscuro inline
 * - Centro de Ayuda
 * - Configuración
 * - Ver Tutorial
 * - Cerrar Sesión
 * 
 * Patrón inspirado en Gmail, LinkedIn, Notion
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Moon,
  Sun,
  HelpCircle,
  Settings,
  GraduationCap,
  LogOut,
  User,
} from 'lucide-react';

// ✅ Use AuthContext User type instead of Supabase User
interface User {
  id: string;
  email: string;
  name: string;
  photoUrl?: string | null;
}

interface ProfileMenuProps {
  user: User | null;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onHelpClick: () => void;
  onSettingsClick: () => void;
  onTutorialClick: () => void;
  onLogout: () => void;
}

export function ProfileMenu({
  user,
  darkMode,
  onToggleDarkMode,
  onHelpClick,
  onSettingsClick,
  onTutorialClick,
  onLogout,
}: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Obtener iniciales del usuario
  const getUserInitials = () => {
    if (!user) return 'U';
    
    // Intentar obtener el nombre del user_metadata
    const name = user.name || user.email?.split('@')[0] || 'Usuario';
    
    // Obtener primeras 2 letras
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getUserName = () => {
    if (!user) return 'Usuario';
    return user.name || user.email?.split('@')[0] || 'Usuario';
  };

  const getUserEmail = () => {
    if (!user) return '';
    return user.email || '';
  };

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleMenuItemClick = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  return (
    <div className="relative z-50" ref={menuRef}>
      {/* Avatar Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        data-tour="profile-menu"
        className="flex items-center gap-2 p-1.5 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors touch-target relative z-50 cursor-pointer"
        aria-label="Menú de perfil"
        type="button"
        style={{ pointerEvents: 'auto' }}
      >
        {/* Avatar Circle with Photo or Initials */}
        {user?.photoUrl ? (
          <img
            src={user.photoUrl}
            alt={getUserName()}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-[#10B981]"
          />
        ) : (
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#10B981] flex items-center justify-center text-white font-bold text-sm">
            {getUserInitials()}
          </div>
        )}
        
        {/* Chevron (solo en desktop) */}
        <ChevronDown
          className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform duration-200 hidden sm:block ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2 w-64 sm:w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
          >
            {/* User Info Section */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                {/* Avatar with Photo or Initials */}
                {user?.photoUrl ? (
                  <img
                    src={user.photoUrl}
                    alt={getUserName()}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#10B981]"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#10B981] flex items-center justify-center text-white font-bold text-lg">
                    {getUserInitials()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                    {getUserName()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {getUserEmail()}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {/* Dark Mode Toggle - Inline */}
              <button
                onClick={onToggleDarkMode}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {darkMode ? (
                    <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  ) : (
                    <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  )}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {darkMode ? 'Modo Claro' : 'Modo Oscuro'}
                  </span>
                </div>
                
                {/* Toggle Switch */}
                <div
                  className={`w-11 h-6 rounded-full transition-colors ${
                    darkMode ? 'bg-[#10B981]' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 mt-0.5 ${
                      darkMode ? 'translate-x-5.5' : 'translate-x-0.5'
                    }`}
                  />
                </div>
              </button>

              {/* Divider */}
              <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />

              {/* Help Center */}
              <button
                onClick={() => handleMenuItemClick(onHelpClick)}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <HelpCircle className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Centro de Ayuda
                </span>
              </button>

              {/* Tutorial */}
              <button
                onClick={() => handleMenuItemClick(onTutorialClick)}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <GraduationCap className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Ver Tutorial
                </span>
              </button>

              {/* Settings */}
              <button
                onClick={() => handleMenuItemClick(onSettingsClick)}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Configuración
                </span>
              </button>

              {/* Divider */}
              <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />

              {/* Logout */}
              <button
                onClick={() => handleMenuItemClick(onLogout)}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium text-red-600 dark:text-red-400">
                  Cerrar Sesión
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}