/**
 * StatisticsScreen Component
 * 
 * Main screen for viewing financial statistics and analytics
 * 
 * Features:
 * - Monthly income/expense breakdown
 * - Category analysis with pie chart
 * - Monthly trends with bar chart
 * - Top categories list
 * - Period comparisons
 */

import { useState, useMemo, useCallback } from 'react';
import { ArrowLeft, Sparkles, BarChart3, GraduationCap } from 'lucide-react';
import { useLocalization } from '../../../hooks/useLocalization';
import { useApp } from '../../../contexts/AppContext'; // ✅ NEW: Import useApp hook
import BottomNav from '../../../components/BottomNav';
import SpeedDial from '../../../components/dashboard/SpeedDial'; // ✅ NEW: Import SpeedDial
import { ThemeHeaderEffects } from '../../../components/ThemeHeaderEffects'; // 🎨 Import theme effects
import { OtiSpacerMessage } from '../../../components/OtiSpacerMessage'; // 📱 WhatsApp-style spacer
// 🎓 NEW: Import StatisticsTour
import { StatisticsTour, shouldShowStatisticsTour } from '../../../components/tours/StatisticsTour';
import { parseLocalDate } from '../../../utils/dateUtils';
import { StatisticsService } from '../services';
import type { StatisticsProps, StatisticsViewType } from '../types';

// Import existing optimized statistics components
import {
  MonthYearSelector,
  SummaryCards,
  CategoryPieChart,
  MonthlyBarChart,
  CategoryList,
} from '../../../components/statistics';

export function StatisticsScreen({
  transactions,
  categories,
  budgets,
  onNavigate,
  onSelectBudget,
  onSelectCategory,
  onGoBack,
}: StatisticsProps) {
  const [viewType, setViewType] = useState<StatisticsViewType>('expense');
  // 🎓 NEW: Statistics Tour state
  const [showStatisticsTour, setShowStatisticsTour] = useState(shouldShowStatisticsTour());

  const { t } = useLocalization();
  
  // ✅ NEW: Use shared month/year from AppContext instead of local state
  const { selectedMonth, selectedYear, setSelectedMonth, setSelectedYear } = useApp();

  // ✅ Format currency
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  }, []);

  // ✅ Filter transactions by month
  const monthTransactions = useMemo(() => {
    return StatisticsService.filterByMonth(
      transactions,
      selectedMonth,
      selectedYear,
      true // exclude transfers
    );
  }, [transactions, selectedMonth, selectedYear]);

  // ✅ Calculate category data
  const categoryData = useMemo(() => {
    return StatisticsService.calculateCategoryStats(
      monthTransactions,
      categories,
      viewType
    );
  }, [monthTransactions, categories, viewType]);

  // ✅ Calculate monthly trend
  const monthlyData = useMemo(() => {
    return StatisticsService.calculateMonthlyTrend(transactions, 6);
  }, [transactions]);

  // ✅ Calculate period summary
  const periodSummary = useMemo(() => {
    return StatisticsService.calculatePeriodSummary(
      transactions,
      selectedMonth,
      selectedYear
    );
  }, [transactions, selectedMonth, selectedYear]);

  // ✅ Calculate totals
  const totalIncome = useMemo(() => {
    return monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthTransactions]);

  const totalExpense = useMemo(() => {
    return monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthTransactions]);

  const balance = totalIncome - totalExpense;

  // ✅ Handlers
  const handlePreviousMonth = useCallback(() => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  }, [selectedMonth, selectedYear, setSelectedMonth, setSelectedYear]);

  const handleNextMonth = useCallback(() => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  }, [selectedMonth, selectedYear, setSelectedMonth, setSelectedYear]);

  const handleCategoryClick = useCallback((categoryId: string) => {
    // Create category key for navigation
    const categoryKey = `${categoryId}`;
    onSelectCategory(categoryKey, selectedMonth, selectedYear);
  }, [onSelectCategory, selectedMonth, selectedYear]);
  
  // Get current theme from localStorage
  const theme = localStorage.getItem('colorTheme') || 'blue';

  return (
    <div className="flex flex-col mobile-screen-height bg-gradient-to-br from-emerald-50/30 via-teal-50/20 to-green-50/30 dark:bg-gray-950">
      {/* ✅ HEADER: Same style as Budgets and Accounts */}
      <div className="fixed-top-header bg-white dark:bg-gray-900 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-800 shadow-sm z-10 safe-area-top relative overflow-hidden">
        {/* 🎨 Efectos temáticos del header */}
        <ThemeHeaderEffects theme={theme} />
        
        <div className="flex items-center justify-between gap-3 relative z-10">
          {/* Left: Back button */}
          <button
            onClick={onGoBack}
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors touch-target-md tap-scale shrink-0"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-300" />
          </button>
          
          {/* Center: Title */}
          <h1 className="flex-1 text-center text-base sm:text-lg text-gray-900 dark:text-white">
            {t('statistics.title')}
          </h1>
          
          {/* Right: Tour button */}
          <button
            onClick={() => setShowStatisticsTour(true)}
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-full transition-colors touch-target-md tap-scale shrink-0 group"
            aria-label="Ver tour de estadísticas"
            data-tour="tour-button"
          >
            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto content-with-fixed-header-and-nav momentum-scroll">
        <div className="p-4 sm:p-6 space-y-6">
          {/* Month/Year Selector */}
          <MonthYearSelector
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onPreviousMonth={handlePreviousMonth}
            onNextMonth={handleNextMonth}
          />

          {/* Summary Cards */}
          <SummaryCards
            monthIncome={totalIncome} // ✅ CORREGIDO: monthIncome en vez de totalIncome
            monthExpenses={totalExpense} // ✅ CORREGIDO: monthExpenses en vez de totalExpense
            viewType={viewType} // ✅ AGREGADO
            onViewTypeChange={setViewType} // ✅ AGREGADO
            formatCurrency={formatCurrency}
          />

          {/* Category Pie Chart */}
          <CategoryPieChart
            data={categoryData}
            viewType={viewType}
            formatCurrency={formatCurrency}
          />

          {/* Category List */}
          <CategoryList
            data={categoryData}
            total={viewType === 'income' ? totalIncome : totalExpense}
            formatCurrency={formatCurrency}
            onCategoryClick={handleCategoryClick}
          />

          {/* Monthly Bar Chart */}
          <MonthlyBarChart
            data={monthlyData}
            formatCurrency={formatCurrency}
          />

          {/* Empty State */}
          {categoryData.length === 0 && monthlyData.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                {t('statistics.noData')}
              </p>
            </div>
          )}
          
          {/* WhatsApp-style Spacer */}
          <OtiSpacerMessage
            message="Has visto todas tus estadísticas. Pregúntale a Oti sobre tu análisis financiero"
            show={categoryData.length > 0}
          />
        </div>
      </div>

      {/* Oti FAB - Solo Chat (Asistente IA para análisis) */}
      <div className="absolute bottom-20 right-6 z-40" data-tour="quick-actions">
        <SpeedDial
          context="statistics"
          onChatClick={() => onNavigate('oti-chat')}
          theme={theme}
        />
      </div>

      {/* Bottom Navigation */}
      <BottomNav currentScreen="statistics" onNavigate={onNavigate} />
      
      {/* 🎓 Tour System */}
      {showStatisticsTour && (
        <StatisticsTour onComplete={() => setShowStatisticsTour(false)} />
      )}
    </div>
  );
}