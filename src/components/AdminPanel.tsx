import { useState, useEffect } from 'react';
import { Users, Shield, Search, Activity, TrendingUp, ArrowLeft, Eye, Trash2, Loader2, X, Ban, CheckCircle, BarChart, ChevronLeft, ChevronRight, Monitor, Smartphone, Tablet, Chrome, Globe, Database } from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '../utils/logger';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import AdminDashboard from './AdminDashboard';
import AdminMetrics from './AdminMetrics';
import { otiConfirm } from './ui/OtiConfirmDialog';
// ❌ REMOVED: Migration module no longer needed - migrations complete

interface AdminPanelProps {
  accessToken: string | null;
  onGoBack: () => void;
  darkMode?: boolean;
}

interface User {
  id: string;
  email: string;
  name?: string;
  photoUrl?: string;
  created_at: string;
  last_sign_in_at?: string;
  email_confirmed_at?: string;
  enabled?: boolean;
}

interface DeviceInfo {
  browser: string;
  os: string;
  deviceType: 'Desktop' | 'Mobile' | 'Tablet';
  userAgent: string;
  lastAccess: string;
}

interface UserDetails extends User {
  statistics: {
    transactions: {
      total: number;
      income: number;
      expense: number;
      transfers: number;
    };
    amounts: {
      totalIncome: number;
      totalExpense: number;
      balance: number;
    };
    accounts: number;
    categories: number;
    budgets: number;
  };
  device?: DeviceInfo | null;
}

interface SystemStats {
  users: {
    total: number;
    active24h: number;
    active7days: number;
    active30days: number;
    new24h: number;
    new7days: number;
    new30days: number;
  };
  data: {
    totalTransactions: number;
    totalAccounts: number;
    totalCategories: number;
    totalBudgets: number;
  };
  timestamp: string;
}

export default function AdminPanel({ accessToken, onGoBack, darkMode }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'users' | 'search' | 'migration' | 'cleanup'>('overview');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showCleanupUserDialog, setShowCleanupUserDialog] = useState(false); // NEW: Dialog for cleanup tab
  
  // Cleanup state
  const [cleanupEmail, setCleanupEmail] = useState('');
  const [cleanupLoading, setCleanupLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const usersPerPage = 10;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getBrowserColor = (browser: string) => {
    const colors: Record<string, string> = {
      'Chrome': 'text-yellow-600 dark:text-yellow-400',
      'Firefox': 'text-orange-600 dark:text-orange-400',
      'Safari': 'text-blue-600 dark:text-blue-400',
      'Edge': 'text-teal-600 dark:text-teal-400',
      'Opera': 'text-red-600 dark:text-red-400',
    };
    return colors[browser] || 'text-gray-600 dark:text-gray-400';
  };

  const getOSColor = (os: string) => {
    const colors: Record<string, string> = {
      'Windows': 'text-blue-600 dark:text-blue-400',
      'macOS': 'text-gray-800 dark:text-gray-300',
      'Linux': 'text-yellow-600 dark:text-yellow-400',
      'Android': 'text-green-600 dark:text-green-400',
      'iOS': 'text-gray-700 dark:text-gray-400',
    };
    return colors[os] || 'text-gray-600 dark:text-gray-400';
  };

  const getDeviceIcon = (deviceType: 'Desktop' | 'Mobile' | 'Tablet') => {
    const icons = {
      'Desktop': Monitor,
      'Mobile': Smartphone,
      'Tablet': Tablet,
    };
    return icons[deviceType] || Monitor;
  };

  const loadUsers = async (page: number = currentPage) => {
    setLoading(true);
    try {
      const { projectId } = await import('../utils/supabase/info');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3/dev/users?page=${page}&limit=${usersPerPage}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar usuarios');
      }

      setUsers(data.users || []);
      setTotalUsers(data.pagination?.total || 0);
      setTotalPages(data.pagination?.totalPages || 0);
      setCurrentPage(data.pagination?.page || 1);
    } catch (error: any) {
      logger.error('Error loading users:', error);
      toast.error('Error al cargar usuarios', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      loadUsers(page);
    }
  };

  const loadSystemStats = async () => {
    setLoading(true);
    try {
      const { projectId } = await import('../utils/supabase/info');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3/admin/stats`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar estadísticas');
      }

      setSystemStats(data.stats);
    } catch (error: any) {
      logger.error('Error loading stats:', error);
      toast.error('Error al cargar estadísticas', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const { projectId } = await import('../utils/supabase/info');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3/admin/users/search/${encodeURIComponent(query)}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al buscar usuarios');
      }

      setSearchResults(data.users || []);
      toast.success(`Se encontraron ${data.total} usuario(s)`);
    } catch (error: any) {
      logger.error('Error searching users:', error);
      toast.error('Error al buscar usuarios', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserDetails = async (userId: string) => {
    logger.log('🔍 Loading user details for:', userId);
    setLoading(true);
    try {
      const { projectId } = await import('../utils/supabase/info');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3/admin/users/${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      const data = await response.json();
      logger.log('📊 User details response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar detalles del usuario');
      }

      setSelectedUser(data.user);
      setShowUserDetails(true);
      logger.log('✅ Modal should be visible now');
    } catch (error: any) {
      logger.error('❌ Error loading user details:', error);
      toast.error('Error al cargar detalles', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentlyEnabled: boolean) => {
    try {
      const { projectId } = await import('../utils/supabase/info');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3/admin/users/${userId}/toggle-status`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cambiar el estado del usuario');
      }

      const action = currentlyEnabled ? 'deshabilitado' : 'habilitado';
      toast.success(`Usuario ${action} exitosamente`, {
        description: data.message
      });
      
      // Reload users
      if (activeTab === 'users') {
        await loadUsers();
      } else if (activeTab === 'search') {
        await searchUsers(searchQuery);
      }
    } catch (error: any) {
      logger.error('Error toggling user status:', error);
      toast.error('Error al cambiar el estado', {
        description: error.message
      });
    }
  };

  const handleCleanupAll = async () => {
    setCleanupLoading(true);
    try {
      const { projectId } = await import('../utils/supabase/info');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3/admin/cleanup-all`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en la limpieza');
      }

      const totalRecords = 
        (data.summary.postgres?.transactions || 0) +
        (data.summary.postgres?.budgets || 0) +
        (data.summary.postgres?.accounts || 0) +
        (data.summary.postgres?.categories || 0);
      
      const message = data.summary.users.skippedSuperUser 
        ? `${data.summary.users.deleted} usuarios y ${totalRecords} registros eliminados (tu sesión está preservada)`
        : `${data.summary.users.deleted} usuarios y ${totalRecords} registros eliminados`;
      
      toast.success('✅ Limpieza completada exitosamente', {
        description: message
      });

      setShowCleanupDialog(false);
      
      // Reload data
      await loadSystemStats();
      setUsers([]);
    } catch (error: any) {
      logger.error('Error cleaning up:', error);
      toast.error('Error en la limpieza', {
        description: error.message
      });
    } finally {
      setCleanupLoading(false);
    }
  };

  const handleCleanupUser = async () => {
    if (!cleanupEmail.trim()) {
      toast.error('Por favor ingresa un email');
      return;
    }

    setCleanupLoading(true);
    try {
      const { projectId } = await import('../utils/supabase/info');
      
      logger.log(`\n========================================`);
      logger.log(`🗑️  Requesting complete cleanup for: ${cleanupEmail}`);
      logger.log(`========================================\n`);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3/admin/users/cleanup/${encodeURIComponent(cleanupEmail)}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al limpiar usuario');
      }

      logger.log('📝 Cleanup response:', data);

      const parts = [];
      if (data.authDeleted) parts.push('Auth');
      if (data.postgresDeleted) parts.push('Postgres');
      
      const deletedWhat = parts.length > 0 ? parts.join(' + ') : 'Nada';
      
      // Show appropriate toast based on what was deleted
      if (data.authDeleted && data.postgresDeleted) {
        toast.success('✅ Usuario eliminado completamente', {
          description: 'El usuario puede registrarse nuevamente desde cero.',
          duration: 5000,
        });
      } else if (data.postgresDeleted && !data.authDeleted) {
        toast.warning('⚠️ Limpieza parcial', {
          description: 'Se eliminó de Postgres pero falló Auth. Ve a Supabase Dashboard → Authentication → Users y elimina manualmente.',
          duration: 10000,
        });
      } else if (data.authDeleted && !data.postgresDeleted) {
        toast.warning('⚠️ Limpieza parcial', {
          description: 'Se eliminó de Auth pero falló Postgres. Revisa los logs.',
          duration: 10000,
        });
      } else {
        toast.error('❌ No se pudo eliminar el usuario', {
          description: data.message || 'Verifica que el email sea correcto.',
          duration: 10000,
        });
      }

      setCleanupEmail('');
      setShowCleanupUserDialog(false);
      
      // Reload data if needed
      if (activeTab === 'users') {
        await loadUsers();
      } else if (activeTab === 'overview') {
        await loadSystemStats();
      }
    } catch (error: any) {
      logger.error('❌ Error cleaning up user:', error);
      toast.error('Error al limpiar usuario', {
        description: error.message
      });
    } finally {
      setCleanupLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'overview') {
      loadSystemStats();
    } else if (activeTab === 'users') {
      setCurrentPage(1); // Reset to page 1 when entering users tab
      loadUsers(1);
    }
  }, [activeTab]);

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onGoBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg -ml-2 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h1 className="text-gray-900 dark:text-white">Panel de Administración</h1>
          </div>
          <div className="w-9" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
              activeTab === 'overview'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Vista General
            </div>
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
              activeTab === 'metrics'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <BarChart className="w-4 h-4" />
              Métricas
            </div>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
              activeTab === 'users'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Usuarios
            </div>
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
              activeTab === 'search'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Buscar
            </div>
          </button>
          {/* ❌ REMOVED: Migración and Limpieza tabs - no longer needed */}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-purple-600 dark:text-purple-400 animate-spin" />
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && !loading && systemStats && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Usuarios</p>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{systemStats.users.total}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  +{systemStats.users.new7days} esta semana
                </p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Usuarios Activos</p>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{systemStats.users.active7days}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Últimos 7 días
                </p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Transacciones</p>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{systemStats.data.totalTransactions}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Total en el sistema
                </p>
              </div>
            </div>

            {/* Activity Details */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actividad Reciente</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Últimas 24 horas</span>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{systemStats.users.active24h} activos</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">+{systemStats.users.new24h} nuevos</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Últimos 30 días</span>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{systemStats.users.active30days} activos</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">+{systemStats.users.new30days} nuevos</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Cuentas</span>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">{systemStats.data.totalAccounts}</p>
                  </div>
                  <div className="flex flex-col p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Categorías</span>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">{systemStats.data.totalCategories}</p>
                  </div>
                  <div className="flex flex-col p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Presupuestos</span>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">{systemStats.data.totalBudgets}</p>
                  </div>
                  <div className="flex flex-col p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Transacciones</span>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">{systemStats.data.totalTransactions}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Dashboard with Charts, Financial Stats, and User Rankings */}
            <AdminDashboard accessToken={accessToken} darkMode={darkMode} />

            {/* Danger Zone */}
            <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-6 border-2 border-red-200 dark:border-red-900/30">
              <h2 className="text-lg font-semibold text-red-900 dark:text-red-400 mb-2">Zona Peligrosa</h2>
              <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                Estas acciones son irreversibles y eliminarán todos los datos del sistema.
              </p>
              <button
                onClick={async () => {
                  const confirmed = await otiConfirm({
                    title: '⚠️ ADVERTENCIA CRÍTICA',
                    description: 'Estás a punto de ELIMINAR COMPLETAMENTE:\n\n• Todos los usuarios registrados\n• Todas las transacciones\n• Todas las cuentas\n• Todas las categorías\n• Todos los presupuestos\n• Todos los datos en la base de datos\n\nEsta acción NO SE PUEDE DESHACER.',
                    variant: 'danger',
                    confirmText: 'Sí, eliminar todo',
                    cancelText: 'Cancelar'
                  });
                  
                  if (confirmed) {
                    handleCleanupAll();
                  }
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Limpiar Toda la Base de Datos
              </button>
            </div>
          </div>
        )}

        {/* Metrics Tab */}
        {activeTab === 'metrics' && !loading && (
          <AdminMetrics accessToken={accessToken} darkMode={darkMode} />
        )}

        {/* Users Tab */}
        {activeTab === 'users' && !loading && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Total: {totalUsers} usuario(s)
                </h2>
                {totalUsers > 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Mostrando {((currentPage - 1) * usersPerPage) + 1} - {Math.min(currentPage * usersPerPage, totalUsers)} de {totalUsers}
                  </p>
                )}
              </div>
              <button
                onClick={() => loadUsers(currentPage)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
              >
                Recargar
              </button>
            </div>

            {users.map((user) => (
              <div
                key={user.id}
                className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white flex-shrink-0">
                    {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 dark:text-white truncate">{user.name || 'Sin nombre'}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        user.enabled !== false
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>
                        {user.enabled !== false ? '✓ Activo' : '✗ Deshabilitado'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{user.email}</p>
                    <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>Registro: {formatDate(user.created_at)}</span>
                      {user.last_sign_in_at && (
                        <span>• Último acceso: {formatDate(user.last_sign_in_at)}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleToggleUserStatus(user.id, user.enabled !== false)}
                      className={`p-2 rounded-lg transition-colors ${
                        user.enabled !== false
                          ? 'hover:bg-orange-50 dark:hover:bg-orange-900/20'
                          : 'hover:bg-green-50 dark:hover:bg-green-900/20'
                      }`}
                      title={user.enabled !== false ? 'Deshabilitar usuario' : 'Habilitar usuario'}
                    >
                      {user.enabled !== false ? (
                        <Ban className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                      )}
                    </button>
                    <button
                      onClick={() => loadUserDetails(user.id)}
                      className="p-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </button>
                    <button
                      onClick={async () => {
                        const confirmed = await otiConfirm({
                          title: '¿Eliminar usuario?',
                          description: `Estás a punto de eliminar a ${user.email}. Esta acción eliminará todos sus datos (transacciones, cuentas, categorías, etc.) y no se puede deshacer.`,
                          variant: 'danger',
                          confirmText: 'Eliminar',
                          cancelText: 'Cancelar'
                        });
                        
                        if (confirmed) {
                          // Call handleDeleteUser directly with the user
                          setLoading(true);
                          try {
                            const { projectId } = await import('../utils/supabase/info');
                            
                            logger.log(`\n========================================`);
                            logger.log(`🗑️  Requesting complete cleanup for: ${user.email}`);
                            logger.log(`========================================\n`);
                            
                            const response = await fetch(
                              `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3/admin/users/cleanup/${encodeURIComponent(user.email)}`,
                              {
                                method: 'DELETE',
                                headers: {
                                  'Authorization': `Bearer ${accessToken}`
                                }
                              }
                            );

                            const data = await response.json();

                            if (!response.ok) {
                              throw new Error(data.error || 'Error al eliminar usuario');
                            }

                            logger.log('📝 Cleanup response:', data);

                            const parts = [];
                            if (data.authDeleted) parts.push('Auth');
                            if (data.userDeleted) parts.push('Usuario');
                            if (data.dataDeleted?.transactions > 0) parts.push(`${data.dataDeleted.transactions} transacciones`);
                            if (data.dataDeleted?.accounts > 0) parts.push(`${data.dataDeleted.accounts} cuentas`);
                            if (data.dataDeleted?.categories > 0) parts.push(`${data.dataDeleted.categories} categorías`);
                            if (data.dataDeleted?.budgets > 0) parts.push(`${data.dataDeleted.budgets} presupuestos`);

                            const description = parts.length > 0 ? `Eliminado: ${parts.join(', ')}` : 'Usuario eliminado';

                            toast.success('Usuario eliminado exitosamente', {
                              description: description
                            });

                            await loadUsers();
                          } catch (error: any) {
                            logger.error('Error al eliminar usuario:', error);
                            toast.error('Error al eliminar usuario', {
                              description: error.message
                            });
                          } finally {
                            setLoading(false);
                          }
                        }
                      }}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {users.length === 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-800">
                <Users className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No hay usuarios registrados</p>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Anterior</span>
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 7) {
                      pageNum = i + 1;
                    } else if (currentPage <= 4) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 3) {
                      pageNum = totalPages - 6 + i;
                    } else {
                      pageNum = currentPage - 3 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`w-10 h-10 rounded-lg text-sm transition-colors ${
                          currentPage === pageNum
                            ? 'bg-purple-600 text-white'
                            : 'bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="text-sm text-gray-700 dark:text-gray-300">Siguiente</span>
                  <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por email o nombre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      searchUsers(searchQuery);
                    }
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <button
                onClick={() => searchUsers(searchQuery)}
                disabled={!searchQuery.trim() || loading}
                className="w-full mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Buscar
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-4">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white flex-shrink-0">
                        {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 dark:text-white truncate">{user.name || 'Sin nombre'}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            user.enabled !== false
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          }`}>
                            {user.enabled !== false ? '✓ Activo' : '✗ Deshabilitado'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{user.email}</p>
                        <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>Registro: {formatDate(user.created_at)}</span>
                          {user.last_sign_in_at && (
                            <span>• Último acceso: {formatDate(user.last_sign_in_at)}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleToggleUserStatus(user.id, user.enabled !== false)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.enabled !== false
                              ? 'hover:bg-orange-50 dark:hover:bg-orange-900/20'
                              : 'hover:bg-green-50 dark:hover:bg-green-900/20'
                          }`}
                          title={user.enabled !== false ? 'Deshabilitar usuario' : 'Habilitar usuario'}
                        >
                          {user.enabled !== false ? (
                            <Ban className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                          )}
                        </button>
                        <button
                          onClick={() => loadUserDetails(user.id)}
                          className="p-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </button>
                        <button
                          onClick={async () => {
                            const confirmed = await otiConfirm({
                              title: '¿Eliminar usuario?',
                              description: `Estás a punto de eliminar a ${user.email}. Esta acción eliminará todos sus datos (transacciones, cuentas, categorías, etc.) y no se puede deshacer.`,
                              variant: 'danger',
                              confirmText: 'Eliminar',
                              cancelText: 'Cancelar'
                            });
                            
                            if (confirmed) {
                              setLoading(true);
                              try {
                                const { projectId } = await import('../utils/supabase/info');
                                
                                logger.log(`\n========================================`);
                                logger.log(`🗑️  Requesting complete cleanup for: ${user.email}`);
                                logger.log(`========================================\n`);
                                
                                const response = await fetch(
                                  `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3/admin/users/cleanup/${encodeURIComponent(user.email)}`,
                                  {
                                    method: 'DELETE',
                                    headers: {
                                      'Authorization': `Bearer ${accessToken}`
                                    }
                                  }
                                );

                                const data = await response.json();

                                if (!response.ok) {
                                  throw new Error(data.error || 'Error al eliminar usuario');
                                }

                                logger.log('📝 Cleanup response:', data);

                                const parts = [];
                                if (data.authDeleted) parts.push('Auth');
                                if (data.userDeleted) parts.push('Usuario');
                                if (data.dataDeleted?.transactions > 0) parts.push(`${data.dataDeleted.transactions} transacciones`);
                                if (data.dataDeleted?.accounts > 0) parts.push(`${data.dataDeleted.accounts} cuentas`);
                                if (data.dataDeleted?.categories > 0) parts.push(`${data.dataDeleted.categories} categorías`);
                                if (data.dataDeleted?.budgets > 0) parts.push(`${data.dataDeleted.budgets} presupuestos`);

                                const description = parts.length > 0 ? `Eliminado: ${parts.join(', ')}` : 'Usuario eliminado';

                                toast.success('Usuario eliminado exitosamente', {
                                  description: description
                                });

                                await searchUsers(searchQuery);
                              } catch (error: any) {
                                logger.error('Error al eliminar usuario:', error);
                                toast.error('Error al eliminar usuario', {
                                  description: error.message
                                });
                              } finally {
                                setLoading(false);
                              }
                            }
                          }}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchQuery && searchResults.length === 0 && !loading && (
              <div className="bg-white dark:bg-gray-900 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-800">
                <Search className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No se encontraron resultados</p>
              </div>
            )}
          </div>
        )}

        {/* ❌ REMOVED: Migration and Cleanup tabs - no longer needed */}
        
        {/* Cleanup Tab - KEPT for Nuclear Reset feature */}
        {activeTab === 'cleanup' && (
          <div className="space-y-4">
            {/* 🔥 NUCLEAR RESET - Nuevo bloque */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 rounded-xl p-6 border-2 border-red-300 dark:border-red-800">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-2 flex items-center gap-2">
                  🔥 Reset Nuclear del Sistema
                </h3>
                <p className="text-sm text-red-800 dark:text-red-300 font-medium mb-2">
                  ⚠️ ADVERTENCIA: Esta acción es IRREVERSIBLE y eliminará:
                </p>
                <ul className="text-sm text-red-700 dark:text-red-400 space-y-1 ml-4 mb-3">
                  <li>• TODOS los usuarios (incluyendo super usuarios)</li>
                  <li>• TODOS los datos de TODAS las tablas</li>
                  <li>• Configuraciones, transacciones, cuentas, categorías</li>
                  <li>• El sistema quedará completamente limpio</li>
                </ul>
                <p className="text-xs text-red-600 dark:text-red-500 italic">
                  Solo usa esto si quieres empezar completamente desde cero.
                </p>
              </div>
              
              <button
                onClick={async () => {
                  const confirmed = await otiConfirm({
                    title: '🔥 ¿ESTÁS ABSOLUTAMENTE SEGURO?',
                    description: 'Esto eliminará:\n• TODOS los usuarios\n• TODOS los datos\n• No hay vuelta atrás\n\n¿Continuar con el Reset Nuclear?',
                    variant: 'danger',
                    confirmText: 'Sí, continuar',
                    cancelText: 'Cancelar'
                  });
                  
                  if (!confirmed) return;
                  
                  const doubleConfirm = await otiConfirm({
                    title: '⚠️ ÚLTIMA CONFIRMACIÓN',
                    description: 'Escribe mentalmente "CONFIRMO" si realmente quieres hacer esto.\n\n¿Proceder con la eliminación total?',
                    variant: 'danger',
                    confirmText: 'CONFIRMO - Eliminar todo',
                    cancelText: 'Cancelar'
                  });
                  
                  if (!doubleConfirm) return;
                  
                  setCleanupLoading(true);
                  
                  try {
                    const { projectId } = await import('../utils/supabase/info');
                    
                    const response = await fetch(
                      `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3/admin/nuclear-reset`,
                      {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                      }
                    );
                    
                    const data = await response.json();
                    
                    if (response.ok) {
                      toast.success(`✅ ${data.message}`, {
                        description: `Usuarios eliminados: ${data.details.deletedUsers}, Registros eliminados: ${data.details.deletedRecords}`,
                        duration: 5000,
                      });
                      
                      // Esperar 2 segundos y recargar la página
                      setTimeout(() => {
                        window.location.href = '/';
                      }, 2000);
                    } else {
                      toast.error('Error en reset nuclear: ' + (data.error || 'Error desconocido'));
                    }
                  } catch (error) {
                    logger.error('Error:', error);
                    toast.error('Error al ejecutar reset nuclear');
                  } finally {
                    setCleanupLoading(false);
                  }
                }}
                disabled={cleanupLoading}
                className="w-full px-6 py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white rounded-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 text-base font-semibold shadow-lg"
              >
                {cleanupLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Ejecutando Reset Nuclear...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    🔥 EJECUTAR RESET NUCLEAR
                  </>
                )}
              </button>
            </div>

            {/* Limpieza de usuario individual (existente) */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Limpieza Completa de Usuario</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Esta función eliminará TODOS los datos del usuario especificado tanto de Postgres como de Supabase Auth.
                  El usuario podrá registrarse nuevamente desde cero.
                </p>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Email del usuario a eliminar completamente..."
                  value={cleanupEmail}
                  onChange={(e) => setCleanupEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && cleanupEmail.trim()) {
                      setShowCleanupUserDialog(true);
                    }
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <button
                onClick={() => setShowCleanupUserDialog(true)}
                disabled={!cleanupEmail.trim() || cleanupLoading}
                className="w-full mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {cleanupLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Eliminar Usuario Completamente
                  </>
                )}
              </button>
            </div>
            
            {/* Warning Box */}
            <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-xl p-4 border border-yellow-200 dark:border-yellow-900/30">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                    ¿El usuario sigue apareciendo como "registrado"?
                  </h4>
                  <p className="text-xs text-yellow-700 dark:text-yellow-400 mb-2">
                    Si después de la limpieza el email sigue diciendo que ya está registrado, es porque solo se eliminó de Postgres pero no de Authentication.
                  </p>
                  <p className="text-xs font-medium text-yellow-800 dark:text-yellow-300">
                    <strong>Solución:</strong> Ve a tu Dashboard de Supabase → Authentication → Users → busca el email → elimínalo manualmente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Details Dialog */}
      {showUserDetails && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Detalles del Usuario</h2>
              <button
                onClick={() => {
                  logger.log('🔴 Closing user details modal');
                  setShowUserDetails(false);
                  setSelectedUser(null);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-2xl">
                  {selectedUser.name ? selectedUser.name[0].toUpperCase() : selectedUser.email[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">{selectedUser.name || 'Sin nombre'}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedUser.email}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Transacciones</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedUser.statistics.transactions.total}</p>
                  <div className="mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-400">
                    <p>Ingresos: {selectedUser.statistics.transactions.income}</p>
                    <p>Gastos: {selectedUser.statistics.transactions.expense}</p>
                    <p>Transferencias: {selectedUser.statistics.transactions.transfers}</p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Balance</p>
                  <p className={`text-2xl font-bold ${
                    selectedUser.statistics.amounts.balance >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {formatCurrency(selectedUser.statistics.amounts.balance)}
                  </p>
                  <div className="mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-400">
                    <p>Ingresos: {formatCurrency(selectedUser.statistics.amounts.totalIncome)}</p>
                    <p>Gastos: {formatCurrency(selectedUser.statistics.amounts.totalExpense)}</p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Cuentas</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedUser.statistics.accounts}</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Categorías</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedUser.statistics.categories}</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 col-span-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Presupuestos</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedUser.statistics.budgets}</p>
                </div>
              </div>

              {/* Account Info */}
              <div className="space-y-2 text-sm">
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Registro:</span> {formatDate(selectedUser.created_at)}
                </p>
                {selectedUser.last_sign_in_at && (
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Último acceso:</span> {formatDate(selectedUser.last_sign_in_at)}
                  </p>
                )}
                {selectedUser.email_confirmed_at && (
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Email confirmado:</span> {formatDate(selectedUser.email_confirmed_at)}
                  </p>
                )}
              </div>

              {/* Device Info */}
              {selectedUser.device && (
                <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    {(() => {
                      const DeviceIconComponent = getDeviceIcon(selectedUser.device.deviceType);
                      return <DeviceIconComponent className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
                    })()}
                    Información del Dispositivo
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-purple-100 dark:border-purple-800/30">
                      <div className="flex items-center gap-2 mb-2">
                        {(() => {
                          const DeviceIconComponent = getDeviceIcon(selectedUser.device.deviceType);
                          return <DeviceIconComponent className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
                        })()}
                        <p className="text-xs text-gray-700 dark:text-gray-300">Dispositivo</p>
                      </div>
                      <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">{selectedUser.device.deviceType}</p>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-4 border border-yellow-100 dark:border-yellow-800/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Chrome className={`w-4 h-4 ${getBrowserColor(selectedUser.device.browser)}`} />
                        <p className="text-xs text-gray-700 dark:text-gray-300">Navegador</p>
                      </div>
                      <p className={`text-sm font-semibold ${getBrowserColor(selectedUser.device.browser)}`}>
                        {selectedUser.device.browser}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Globe className={`w-4 h-4 ${getOSColor(selectedUser.device.os)}`} />
                        <p className="text-xs text-gray-700 dark:text-gray-300">Sistema Operativo</p>
                      </div>
                      <p className={`text-sm font-semibold ${getOSColor(selectedUser.device.os)}`}>
                        {selectedUser.device.os}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-100 dark:border-green-800/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <p className="text-xs text-gray-700 dark:text-gray-300">Última Conexión</p>
                      </div>
                      <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                        {formatDate(selectedUser.device.lastAccess)}
                      </p>
                    </div>
                  </div>

                  {/* User Agent (collapsible/expandable) */}
                  <details className="mt-4">
                    <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center gap-1">
                      <span>Ver User Agent completo</span>
                      <span className="text-[10px]">▼</span>
                    </summary>
                    <div className="mt-3 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg font-mono break-all border border-gray-200 dark:border-gray-700">
                      {selectedUser.device.userAgent}
                    </div>
                  </details>
                </div>
              )}

              {/* No Device Info */}
              {!selectedUser.device && (
                <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                    <Monitor className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Sin información de dispositivo
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Se capturará en el próximo inicio de sesión
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cleanup User Dialog */}
      <AlertDialog open={showCleanupUserDialog} onOpenChange={setShowCleanupUserDialog}>
        <AlertDialogContent className="bg-white dark:bg-gray-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-900 dark:text-red-400">⚠️ Limpieza Completa de Usuario ⚠️</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-gray-500 dark:text-gray-400 space-y-2">
                <p>
                  Estás a punto de eliminar completamente a <strong className="text-gray-900 dark:text-white">{cleanupEmail}</strong>:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Todas sus transacciones</li>
                  <li>Todas sus cuentas</li>
                  <li>Todas sus categorías y subcategorías</li>
                  <li>Todos sus presupuestos</li>
                  <li>Su perfil de usuario</li>
                  <li>Su cuenta de autenticación (Auth)</li>
                </ul>
                <p className="font-semibold text-red-600 dark:text-red-400 mt-3">
                  El usuario podrá registrarse nuevamente desde cero.
                </p>
                <p className="font-bold text-red-600 dark:text-red-400 mt-2">
                  Esta acción NO SE PUEDE DESHACER.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-0"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCleanupEmail('');
                setShowCleanupUserDialog(false);
              }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowCleanupUserDialog(false);
                await handleCleanupUser();
              }}
              disabled={cleanupLoading}
              className="bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-400"
            >
              {cleanupLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Eliminando...
                </>
              ) : (
                'Sí, eliminar completamente'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}