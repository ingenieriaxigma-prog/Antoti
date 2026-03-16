import { Home, Target, Wallet, PieChart, MoreHorizontal, Users } from 'lucide-react';
import { useLocalization } from '../hooks/useLocalization';
import { useGlobalInvitations } from '../contexts/InvitationsContext';

interface BottomNavProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  theme?: string;
  darkMode?: boolean;
  showOnboarding?: boolean; // ✅ NEW: Para bajar z-index durante tour
}

export default function BottomNav({ currentScreen, onNavigate, theme = 'blue', darkMode = false, showOnboarding = false }: BottomNavProps) {
  const { t } = useLocalization();
  const { pendingCount } = useGlobalInvitations();
  
  // Orden: Inicio, Presupuesto, Cuentas, Estadísticas, Grupos, Más
  const navItems = [
    { id: 'dashboard', label: t('navigation.home'), icon: Home },
    { id: 'budgets', label: t('navigation.budgetsShort'), icon: Target },
    { id: 'accounts', label: t('navigation.accounts'), icon: Wallet },
    { id: 'statistics', label: t('navigation.statisticsShort'), icon: PieChart },
    { id: 'family', label: 'Grupos', icon: Users, badge: pendingCount }, // ✨ Renombrado de "Familia" a "Grupos"
    { id: 'settings', label: t('navigation.settingsShort'), icon: MoreHorizontal },
  ];

  return (
    <div 
      data-tour="bottom-nav"
      className={`fixed-bottom-nav bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg relative overflow-hidden safe-area-bottom ${showOnboarding ? 'z-[5]' : 'z-50'}`}
    >
      <div className={`grid grid-cols-6 h-18 sm:h-20 relative ${showOnboarding ? 'z-[5]' : 'z-10'}`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              data-tour={`nav-${item.id}`}
              className={`flex flex-col items-center justify-center gap-0.5 sm:gap-1 transition-all touch-target tap-scale relative ${ 
                isActive
                  ? ''
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              style={isActive ? { color: 'var(--theme-primary)' } : {}}
            >
              {/* Badge de notificaciones - Solo mostrar si hay pendientes */}
              {item.badge !== undefined && item.badge > 0 && (
                <div className="absolute top-1.5 right-1/2 translate-x-3 sm:translate-x-4 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg z-10">
                  {item.badge > 9 ? '9+' : item.badge}
                </div>
              )}
              
              <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className="text-[10px] sm:text-xs leading-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}