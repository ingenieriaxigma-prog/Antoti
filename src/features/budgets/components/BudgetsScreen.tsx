/**
 * BudgetsScreen Component
 * 
 * Main screen for managing budgets
 * 
 * Features:
 * - View all budgets with progress
 * - Add/Edit/Delete budgets
 * - Monthly budget summary
 * - Alert thresholds
 */

import { useState, useMemo, useCallback } from 'react';
import { toast } from 'sonner@2.0.3';
import { useLocalization } from '../../../hooks/useLocalization';
import { useApp } from '../../../contexts/AppContext'; // ✅ NEW: Import useApp hook
import BottomNav from '../../../components/BottomNav';
import SpeedDial from '../../../components/dashboard/SpeedDial'; // ✅ NEW: Import SpeedDial
import { ThemeHeaderEffects } from '../../../components/ThemeHeaderEffects'; // 🎨 Import theme effects
import { OtiSpacerMessage } from '../../../components/OtiSpacerMessage'; // 📱 WhatsApp-style spacer
import VoiceBudgetRecognition, { BudgetVoiceCommand } from '../../../components/VoiceBudgetRecognition'; // 🎤 Import voice recognition
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';
import { BudgetsHeader } from './BudgetsHeader';
import { BudgetSummaryCard } from './BudgetSummaryCard';
import { BudgetsList } from './BudgetsList';
import { BudgetService } from '../services';
import type { Budget, BudgetsScreenProps } from '../types';

// Import existing modals from old location temporarily
import AddBudgetModal from '../../../components/budgets/AddBudgetModal';
import CategoryManagerModal from '../../../components/budgets/CategoryManagerModal';

// 🎓 NEW: Import BudgetTour
import { BudgetTour, shouldShowBudgetTour } from '../../../components/tours/BudgetTour';

export function BudgetsScreen({
  budgets,
  categories,
  transactions,
  onNavigate,
  onAddBudget,
  onUpdateBudget,
  onDeleteBudget,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onSelectBudget,
}: BudgetsScreenProps) {
  // State
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [alertThreshold, setAlertThreshold] = useState('80');
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [deleteBudgetId, setDeleteBudgetId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  // ✨ NEW: Month and year for budget creation
  const [budgetMonth, setBudgetMonth] = useState<number | null>(null);
  const [budgetYear, setBudgetYear] = useState<number | null>(null);
  // 🎤 NEW: Voice conversation modal
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  // 🎓 NEW: Budget Tour state
  const [showBudgetTour, setShowBudgetTour] = useState(shouldShowBudgetTour());

  const { t } = useLocalization();
  
  // ✅ NEW: Use shared month/year from AppContext
  const { 
    selectedMonth: currentMonthNum, 
    selectedYear: currentYear, 
    setSelectedMonth, 
    setSelectedYear
  } = useApp();
  
  // Get current theme from localStorage
  const theme = localStorage.getItem('colorTheme') || 'blue';

  // 🎨 Theme color mappings for FAB button
  const getThemeFABColors = (currentTheme: string) => {
    const themeColors: Record<string, { bg: string; bgDark: string; hover: string; hoverDark: string }> = {
      blue: { 
        bg: 'bg-blue-600', 
        bgDark: 'dark:bg-blue-500', 
        hover: 'hover:bg-blue-700', 
        hoverDark: 'dark:hover:bg-blue-600' 
      },
      green: { 
        bg: 'bg-emerald-600', 
        bgDark: 'dark:bg-emerald-500', 
        hover: 'hover:bg-emerald-700', 
        hoverDark: 'dark:hover:bg-emerald-600' 
      },
      purple: { 
        bg: 'bg-purple-600', 
        bgDark: 'dark:bg-purple-500', 
        hover: 'hover:bg-purple-700', 
        hoverDark: 'dark:hover:bg-purple-600' 
      },
      orange: { 
        bg: 'bg-orange-600', 
        bgDark: 'dark:bg-orange-500', 
        hover: 'hover:bg-orange-700', 
        hoverDark: 'dark:hover:bg-orange-600' 
      },
      pink: { 
        bg: 'bg-pink-600', 
        bgDark: 'dark:bg-pink-500', 
        hover: 'hover:bg-pink-700', 
        hoverDark: 'dark:hover:bg-pink-600' 
      },
      teal: { 
        bg: 'bg-teal-600', 
        bgDark: 'dark:bg-teal-500', 
        hover: 'hover:bg-teal-700', 
        hoverDark: 'dark:hover:bg-teal-600' 
      },
      christmas: { 
        bg: 'bg-red-600', 
        bgDark: 'dark:bg-green-500', 
        hover: 'hover:bg-red-700', 
        hoverDark: 'dark:hover:bg-green-600' 
      },
      rainbow: { 
        bg: 'bg-gradient-to-r from-pink-500 to-purple-600', 
        bgDark: 'dark:bg-gradient-to-r dark:from-pink-400 dark:to-purple-500', 
        hover: 'hover:opacity-90', 
        hoverDark: '' 
      },
    };
    return themeColors[currentTheme] || themeColors.green;
  };

  const fabColors = getThemeFABColors(theme);
  
  // ✅ Current date info (using shared month/year)
  const currentMonth = useMemo(() => {
    return new Date(currentYear, currentMonthNum).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  }, [currentMonthNum, currentYear]);

  // ✅ Utility functions
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  }, []);

  const getCategoryName = useCallback(
    (categoryId: string) => {
      return categories.find((c) => c.id === categoryId)?.name || '';
    },
    [categories]
  );

  const getCategoryColor = useCallback(
    (categoryId: string) => {
      return categories.find((c) => c.id === categoryId)?.color || '#6b7280';
    },
    [categories]
  );

  // ✅ Calculate spent amount for a category
  const getSpentAmount = useCallback(
    (categoryId: string) => {
      return BudgetService.calculateCategoryExpense(
        categoryId,
        transactions,
        currentMonthNum,
        currentYear
      );
    },
    [transactions, currentMonthNum, currentYear]
  );

  // ✅ Calculate budget status
  const getBudgetStatus = useCallback(
    (budget: Budget) => {
      const spent = getSpentAmount(budget.categoryId);
      const percentage = BudgetService.calculateUsagePercentage(budget, spent);
      const remaining = BudgetService.calculateRemaining(budget, spent);
      const status = BudgetService.getBudgetStatus(budget, spent);

      return { spent, percentage, remaining, status };
    },
    [getSpentAmount]
  );

  // ✅ Filter categories
  const expenseCategories = useMemo(() => {
    return categories.filter((c) => c.type === 'expense');
  }, [categories]);

  const categoriesWithoutBudget = useMemo(() => {
    return expenseCategories.filter(
      (c) => !budgets.some((b) => b.categoryId === c.id)
    );
  }, [expenseCategories, budgets]);

  const availableCategories = useMemo(() => {
    return editingBudget ? expenseCategories : categoriesWithoutBudget;
  }, [editingBudget, expenseCategories, categoriesWithoutBudget]);

  // ✅ Calculate totals
  const { totalBudget, totalSpent, overallPercentage } = useMemo(() => {
    const total = BudgetService.calculateTotalBudget(budgets, currentMonthNum, currentYear);
    const spent = BudgetService.calculateTotalSpent(budgets, transactions, currentMonthNum, currentYear);
    const percentage = total > 0 ? (spent / total) * 100 : 0;

    return {
      totalBudget: total,
      totalSpent: spent,
      overallPercentage: percentage,
    };
  }, [budgets, transactions, currentMonthNum, currentYear]);

  // ✅ Prepare budgets with status for list
  const budgetsWithStatus = useMemo(() => {
    // 🔧 FIX: Filter budgets that apply to the current month/year
    // Only show budgets that match the selected month using the fallback logic
    const uniqueCategories = [...new Set(budgets.map(b => b.categoryId))];
    
    const applicableBudgets = uniqueCategories
      .map(categoryId => {
        // Get the budget that applies to current month (using fallback logic)
        const applicableBudget = BudgetService.getBudgetForMonth(
          categoryId,
          currentMonthNum,
          currentYear,
          budgets
        );
        return applicableBudget;
      })
      .filter((budget): budget is Budget => budget !== undefined); // Remove undefined values
    
    return applicableBudgets.map(budget => ({
      budget,
      status: getBudgetStatus(budget),
      categoryName: getCategoryName(budget.categoryId),
      categoryColor: getCategoryColor(budget.categoryId),
      categoryEmoji: categories.find(c => c.id === budget.categoryId)?.emoji,
    }));
  }, [budgets, currentMonthNum, currentYear, getBudgetStatus, getCategoryName, getCategoryColor, categories]);

  // ✅ Filter budgets by search query
  const filteredBudgetsWithStatus = useMemo(() => {
    if (!searchQuery.trim()) {
      return budgetsWithStatus;
    }
    
    const query = searchQuery.toLowerCase().trim();
    return budgetsWithStatus.filter(item => 
      item.categoryName.toLowerCase().includes(query)
    );
  }, [budgetsWithStatus, searchQuery]);

  // ✅ Handlers
  const handleAddBudget = useCallback(() => {
    if (!selectedCategory || !budgetAmount) return;

    // 🔧 VALIDATION: Check if a budget already exists for this category + month/year combination
    const conflictingBudget = budgets.find(b => 
      b.categoryId === selectedCategory && // Same category
      (b.month ?? null) === (budgetMonth ?? null) && // Same month (treating undefined as null)
      (b.year ?? null) === (budgetYear ?? null) // Same year (treating undefined as null)
    );

    if (conflictingBudget) {
      const categoryName = getCategoryName(selectedCategory);
      const periodDesc = budgetMonth !== null && budgetYear !== null
        ? `${['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][budgetMonth]} ${budgetYear}`
        : budgetMonth !== null
        ? `${['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][budgetMonth]} (todos los años)`
        : budgetYear !== null
        ? `todos los meses de ${budgetYear}`
        : 'todos los meses/años';
      
      toast.error('Presupuesto duplicado', {
        description: `Ya existe un presupuesto de ${categoryName} para ${periodDesc}`,
      });
      return;
    }

    const categoryName = getCategoryName(selectedCategory);

    onAddBudget({
      categoryId: selectedCategory,
      amount: parseFloat(budgetAmount),
      period: 'monthly',
      alertThreshold: parseFloat(alertThreshold),
      month: budgetMonth ?? null,  // 🔧 FIX: Use nullish coalescing to preserve null
      year: budgetYear ?? null,    // 🔧 FIX: Use nullish coalescing to preserve null
    });

    toast.success(t('budgets.created'), {
      description: `${categoryName} - ${formatCurrency(parseFloat(budgetAmount))}`,
    });

    setSelectedCategory('');
    setBudgetAmount('');
    setAlertThreshold('80');
    setBudgetMonth(null);  // 🔧 FIX: Reset month to null
    setBudgetYear(null);   // 🔧 FIX: Reset year to null
    setShowAddForm(false);
  }, [selectedCategory, budgetAmount, alertThreshold, budgetMonth, budgetYear, budgets, getCategoryName, onAddBudget, t, formatCurrency]);

  const handleEditBudget = useCallback((budget: Budget) => {
    setEditingBudget(budget);
    setSelectedCategory(budget.categoryId);
    setBudgetAmount(budget.amount.toString());
    setAlertThreshold((budget.alertThreshold || 80).toString());
    // 🔧 FIX: Load current month and year values
    setBudgetMonth(budget.month ?? null);
    setBudgetYear(budget.year ?? null);
    setShowAddForm(true);
  }, []);

  const handleUpdateBudget = useCallback(() => {
    if (!editingBudget || !budgetAmount) return;

    // 🔧 VALIDATION: Check if changing month/year would create a conflict
    const isChangingPeriod = 
      editingBudget.month !== (budgetMonth ?? null) || 
      editingBudget.year !== (budgetYear ?? null);

    if (isChangingPeriod) {
      // Check if another budget exists for this category + new month/year combination
      const conflictingBudget = budgets.find(b => 
        b.id !== editingBudget.id && // Not the same budget
        b.categoryId === editingBudget.categoryId && // Same category
        (b.month ?? null) === (budgetMonth ?? null) && // Same month (treating undefined as null)
        (b.year ?? null) === (budgetYear ?? null) // Same year (treating undefined as null)
      );

      if (conflictingBudget) {
        const categoryName = getCategoryName(editingBudget.categoryId);
        const periodDesc = budgetMonth !== null && budgetYear !== null
          ? `${['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][budgetMonth]} ${budgetYear}`
          : budgetMonth !== null
          ? `${['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][budgetMonth]} (todos los años)`
          : budgetYear !== null
          ? `todos los meses de ${budgetYear}`
          : 'todos los meses/años';
        
        toast.error('Conflicto de presupuesto', {
          description: `Ya existe un presupuesto de ${categoryName} para ${periodDesc}`,
        });
        return;
      }
    }

    onUpdateBudget(editingBudget.id, {
      amount: parseFloat(budgetAmount),
      alertThreshold: parseFloat(alertThreshold),
      month: budgetMonth ?? null,  // ✨ NEW: Update month
      year: budgetYear ?? null,    // ✨ NEW: Update year
    });

    toast.success(t('budgets.updated'));

    setEditingBudget(null);
    setSelectedCategory('');
    setBudgetAmount('');
    setAlertThreshold('80');
    setBudgetMonth(null);  // Reset month to null
    setBudgetYear(null);   // Reset year to null
    setShowAddForm(false);
  }, [editingBudget, budgetAmount, alertThreshold, budgetMonth, budgetYear, budgets, getCategoryName, onUpdateBudget, t]);

  const handleDeleteBudget = useCallback(() => {
    if (!deleteBudgetId) return;

    onDeleteBudget(deleteBudgetId);
    toast.success(t('budgets.deleted'));
    setDeleteBudgetId(null);
  }, [deleteBudgetId, onDeleteBudget, t]);

  const handleCloseForm = useCallback(() => {
    setShowAddForm(false);
    setEditingBudget(null);
    setSelectedCategory('');
    setBudgetAmount('');
    setAlertThreshold('80');
    setBudgetMonth(null);  // 🔧 FIX: Reset month to null
    setBudgetYear(null);   // 🔧 FIX: Reset year to null
  }, []);

  // 🎤 Handler for voice budget command
  const handleVoiceBudgetCommand = useCallback((command: BudgetVoiceCommand) => {
    console.log('🎤 Voice budget command received:', command);
    
    // Pre-fill the form with voice command data
    setSelectedCategory(command.categoryId);
    setBudgetAmount(command.amount.toString());
    setAlertThreshold((command.alertThreshold || 80).toString());
    setBudgetMonth(command.month ?? null);
    setBudgetYear(command.year ?? null);
    
    // Close voice modal and open form modal
    setShowVoiceInput(false);
    setShowAddForm(true);
  }, []);

  return (
    <div className="flex flex-col mobile-screen-height bg-gray-50 dark:bg-gray-950 prevent-overscroll relative">
      {/* Header */}
      <BudgetsHeader
        onNavigate={onNavigate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onTourClick={() => {
          console.log('🎓 Starting Budget Tour');
          setShowBudgetTour(true);
        }}
        showTourBadge={shouldShowBudgetTour()}
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto content-with-header-sm-and-nav momentum-scroll">
        {/* Budget Summary */}
        <BudgetSummaryCard
          totalBudget={totalBudget}
          totalSpent={totalSpent}
          overallPercentage={overallPercentage}
          formatCurrency={formatCurrency}
          currentMonth={currentMonth}
          selectedMonth={currentMonthNum}
          selectedYear={currentYear}
          onMonthChange={(month, year) => {
            setSelectedMonth(month);
            setSelectedYear(year);
          }}
        />

        {/* Budgets List */}
        <div className="p-4 sm:p-6 space-y-4 pb-24" data-tour="budget-list">
          <BudgetsList
            budgets={budgets}
            budgetsWithStatus={filteredBudgetsWithStatus}
            formatCurrency={formatCurrency}
            onSelect={onSelectBudget}
            onEdit={handleEditBudget}
            onDelete={(id) => setDeleteBudgetId(id)}
          />

          {/* WhatsApp-style Spacer - Evita que el FAB tape contenido */}
          <OtiSpacerMessage
            message="Has visto todos tus presupuestos. Usa Oti para más opciones"
            show={budgets.length > 0}
          />
        </div>
      </div>

      {/* Add/Edit Budget Modal */}
      <AddBudgetModal
        isOpen={showAddForm}
        editingBudget={editingBudget}
        selectedCategory={selectedCategory}
        budgetAmount={budgetAmount}
        alertThreshold={alertThreshold}
        availableCategories={availableCategories}
        budgets={budgets}
        getCategoryName={getCategoryName}
        getCategoryColor={getCategoryColor}
        onClose={handleCloseForm}
        onSelectCategory={setSelectedCategory}
        onBudgetAmountChange={setBudgetAmount}
        onAlertThresholdChange={setAlertThreshold}
        onSubmit={editingBudget ? handleUpdateBudget : handleAddBudget}
        onManageCategories={() => setShowCategoryManager(true)}
        canAddCategory={!!onAddCategory}
        selectedMonth={budgetMonth}
        selectedYear={budgetYear}
        onMonthChange={setBudgetMonth}
        onYearChange={setBudgetYear}
      />

      {/* Category Manager Modal */}
      {showCategoryManager && onAddCategory && onUpdateCategory && onDeleteCategory && (
        <CategoryManagerModal
          isOpen={showCategoryManager}
          categories={expenseCategories}
          onClose={() => setShowCategoryManager(false)}
          onAddCategory={onAddCategory}
          onUpdateCategory={onUpdateCategory}
          onDeleteCategory={onDeleteCategory}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteBudgetId !== null} onOpenChange={() => setDeleteBudgetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('budgets.deleteBudget')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('budgets.deleteConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteBudgetId(null)}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteBudget}
              className="bg-red-600 hover:bg-red-700"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Oti FAB - Asistente Inteligente (Derecha) */}
      {/* En móvil: fixed right-6. En desktop: absolute right-6 dentro del contenedor */}
      <div className="absolute bottom-20 right-6 z-40">
        <SpeedDial
          context="budgets"
          onChatClick={() => onNavigate('oti-chat')}
          onVoiceClick={() => setShowVoiceInput(true)}
          onManualClick={() => setShowAddForm(true)}
          theme={theme}
        />
      </div>

      {/* 🎤 Voice Conversation Modal */}
      {showVoiceInput && (
        <VoiceBudgetRecognition
          categories={categories}
          currentMonth={currentMonthNum}
          currentYear={currentYear}
          onBudgetCommand={handleVoiceBudgetCommand}
          onClose={() => setShowVoiceInput(false)}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNav currentScreen="budgets" onNavigate={onNavigate} />

      {/* 🎓 Tour System */}
      {showBudgetTour && (
        <BudgetTour onComplete={() => setShowBudgetTour(false)} />
      )}
    </div>
  );
}