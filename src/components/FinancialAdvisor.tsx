import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, Loader2, AlertTriangle, TrendingUp, Target, RefreshCw } from 'lucide-react';
import { Transaction, Account, Category, Budget } from '../types';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';
import { OtiLoader } from './OtiLoader';
import { parseLocalDate, getColombiaTime } from '../utils/dateUtils'; // ✅ Import date utils

interface FinancialAdvisorProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  budgets: Budget[];
  onNavigate: (screen: string) => void;
  onGoBack: () => void;
}

interface FinancialAdvice {
  summary: string;
  insights: string[];
  warnings: string[];
  recommendations: string[];
  actionPlan: string[];
}

export default function FinancialAdvisor({
  transactions,
  accounts,
  categories,
  budgets,
  onNavigate,
  onGoBack,
}: FinancialAdvisorProps) {
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<FinancialAdvice | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getFinancialAdvice = async () => {
    setLoading(true);
    try {
      // Prepare data for analysis
      const now = getColombiaTime(); // ✅ FIX: Use Colombia time
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      // Get last 3 months of transactions
      const last3Months = transactions.filter(t => {
        const txDate = parseLocalDate(t.date); // ✅ FIX: Parse local date
        const monthsAgo = (currentYear - txDate.getFullYear()) * 12 + (currentMonth - txDate.getMonth());
        return monthsAgo >= 0 && monthsAgo < 3;
      });

      // Calculate key metrics
      const totalIncome = last3Months.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const totalExpenses = last3Months.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      const balance = totalIncome - totalExpenses;

      // Category breakdown
      const categorySpending = last3Months
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
          const categoryId = t.category || 'unknown';
          const category = categories.find(c => c.id === categoryId);
          const categoryName = category?.name || 'Sin categoría';
          
          if (!acc[categoryName]) {
            acc[categoryName] = 0;
          }
          acc[categoryName] += t.amount;
          return acc;
        }, {} as Record<string, number>);

      // Budget analysis
      const budgetAnalysis = budgets.map(budget => {
        const category = categories.find(c => c.id === budget.categoryId);
        const spent = last3Months
          .filter(t => t.type === 'expense' && t.category === budget.categoryId)
          .reduce((sum, t) => sum + t.amount, 0);
        
        return {
          category: category?.name || 'Unknown',
          budget: budget.amount,
          spent,
          percentage: (spent / budget.amount) * 100,
        };
      });

      // Account balances
      const accountBalances = accounts.map(acc => ({
        name: acc.name,
        type: acc.type,
        balance: acc.balance,
      }));

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3/financial-advice`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            totalIncome,
            totalExpenses,
            balance,
            categorySpending,
            budgetAnalysis,
            accountBalances,
            transactionCount: last3Months.length,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        console.error('Error getting financial advice:', errorData);
        toast.error('Error al obtener consejos financieros');
        return;
      }

      const data = await response.json();
      setAdvice(data.advice);
      toast.success('Análisis financiero completado');
    } catch (error) {
      console.error('Error getting financial advice:', error);
      toast.error('Error al conectar con el asesor financiero');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-load advice on mount
    getFinancialAdvice();
  }, []);

  return (
    <div className="flex flex-col mobile-screen-height bg-gray-50 dark:bg-gray-950 prevent-overscroll">
      {/* Header - Fixed al top (con hero section integrada) */}
      <div className="fixed-top-header bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 safe-area-top z-20">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onGoBack}
              className="p-3 -ml-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors touch-manipulation active:scale-95"
              aria-label="Volver"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <h1 className="text-gray-900 dark:text-white">Asesor Financiero IA</h1>
            <button
              onClick={getFinancialAdvice}
              disabled={loading}
              className="p-3 -mr-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 touch-manipulation active:scale-95"
              aria-label="Actualizar análisis"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="px-6 py-6 bg-gradient-to-br from-[#FF5722] via-[#FF1493] to-[#FF8B9D]">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-6 h-6 text-white" />
            <h2 className="text-white text-lg">Análisis de Salud Financiera</h2>
          </div>
          <p className="text-white/90 text-sm">
            Consejos personalizados basados en tus últimos 3 meses de actividad
          </p>
        </div>
      </div>

      {/* Content - Scrollable con padding para header GRANDE (hero integrado) */}
      <div className="flex-1 overflow-y-auto top-header-spacing-lg momentum-scroll">
        {loading && !advice ? (
          <div className="flex items-center justify-center h-full">
            <OtiLoader 
              message="Analizando tus finanzas con IA..." 
              size="md"
            />
          </div>
        ) : advice ? (
          <div className="p-4 space-y-4">
            {/* Summary */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-gray-900 dark:text-white">Resumen General</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {advice.summary}
              </p>
            </div>

            {/* Insights */}
            {advice.insights && advice.insights.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-gray-900 dark:text-white">Análisis de Patrones</h3>
                </div>
                <ul className="space-y-3">
                  {advice.insights.map((insight, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                      <p className="text-gray-700 dark:text-gray-300 flex-1">{insight}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {advice.warnings && advice.warnings.length > 0 && (
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <h3 className="text-gray-900 dark:text-white">Alertas Importantes</h3>
                </div>
                <ul className="space-y-3">
                  {advice.warnings.map((warning, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                      <p className="text-gray-700 dark:text-gray-300 flex-1">{warning}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {advice.recommendations && advice.recommendations.length > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h3 className="text-gray-900 dark:text-white">Recomendaciones</h3>
                </div>
                <ul className="space-y-3">
                  {advice.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                      <p className="text-gray-700 dark:text-gray-300 flex-1">{recommendation}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Plan */}
            {advice.actionPlan && advice.actionPlan.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-gray-900 dark:text-white">Plan de Acción</h3>
                </div>
                <ul className="space-y-3">
                  {advice.actionPlan.map((action, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                          {index + 1}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 flex-1 pt-0.5">{action}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Disclaimer */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                💡 Los consejos son generados por IA y deben ser considerados como orientación general. 
                Para asesoramiento financiero profesional, consulta con un experto certificado.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <Sparkles className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              No se pudo cargar el análisis
            </p>
            <button
              onClick={getFinancialAdvice}
              className="mt-4 px-6 py-3 rounded-xl text-white transition-colors"
              style={{ backgroundColor: 'var(--theme-primary)' }}
            >
              Intentar de nuevo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}