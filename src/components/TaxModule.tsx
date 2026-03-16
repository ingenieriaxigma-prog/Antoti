import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  Check,
  AlertCircle,
  Download,
  Upload,
  FileText,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileCheck,
  Printer,
  Share2,
  ArrowRightLeft,
  Lightbulb,
  Info,
  Calculator,
  Wallet,
  BookOpen,
  ChevronRight,
  X,
} from 'lucide-react';
import { Transaction, Account, Category } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { toast } from 'sonner@2.0.3';
import BottomNav from './BottomNav';
import { useApp } from '../contexts/AppContext';
import TaxReports from './TaxReports';
import { parseLocalDate, getColombiaTime } from '../utils/dateUtils'; // ✅ Import date utils

interface TaxModuleProps {
  onBack: () => void;
  onNavigate: (screen: string) => void;
  transactions: Transaction[];
  accounts: Account[];
  darkMode?: boolean;
}

// Tipo para los tips/consejos tributarios
interface TaxTip {
  type: 'error' | 'warning' | 'success' | 'info';
  icon: any;
  title: string;
  description: string;
  action: string | null;
  onActionClick: (() => void) | null;
}

// Topes DIAN 2025 (Colombia) - Estos valores deberían actualizarse cada año
const TAX_LIMITS = {
  income: 59465000, // Ingresos brutos anuales en COP
  assets: 188205000, // Patrimonio bruto en COP
  consumptions: 59465000, // Consumos mediante tarjeta de crédito
  purchases: 59465000, // Compras y consumos totales
  deposits: 59465000, // Consignaciones bancarias
};

export default function TaxModule({ onBack, onNavigate, transactions, accounts, darkMode = false }: TaxModuleProps) {
  const [currentYear, setCurrentYear] = useState(getColombiaTime().getFullYear()); // ✅ FIX: Use Colombia time
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const { categories } = useApp(); // ✅ Obtener categorías del contexto

  // Calcular totales del año
  const calculateYearlyTotals = () => {
    const yearTransactions = transactions.filter(t => {
      const date = parseLocalDate(t.date); // ✅ FIX: Parse local date
      return date.getFullYear() === currentYear;
    });

    // Ingresos totales (excluye transferencias)
    const totalIncome = yearTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    // Egresos totales
    const totalExpenses = yearTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Transferencias entre cuentas (no cuenta como ingreso)
    const transfers = yearTransactions
      .filter(t => t.type === 'transfer')
      .reduce((sum, t) => sum + t.amount, 0);

    return { totalIncome, totalExpenses, transfers };
  };

  // Calcular patrimonio actual
  const calculateAssets = () => {
    return accounts.reduce((sum, acc) => sum + acc.balance, 0);
  };

  // Proyección anual basada en datos actuales
  const calculateYearlyProjection = () => {
    const currentMonth = getColombiaTime().getMonth() + 1; // ✅ FIX: Use Colombia time - 1-12
    const { totalIncome } = calculateYearlyTotals();
    
    if (currentMonth === 0) return 0;
    
    const monthlyAverage = totalIncome / currentMonth;
    const projectedYearly = monthlyAverage * 12;
    
    return projectedYearly;
  };

  // Detectar transferencias entre cuentas propias
  const getInternalTransfers = () => {
    return transactions.filter(t => t.type === 'transfer');
  };

  // Calcular nivel de riesgo
  const calculateRiskLevel = () => {
    const { totalIncome } = calculateYearlyTotals();
    const projection = calculateYearlyProjection();
    const assets = calculateAssets();
    
    const incomePercentage = (projection / TAX_LIMITS.income) * 100;
    const assetsPercentage = (assets / TAX_LIMITS.assets) * 100;
    
    const maxPercentage = Math.max(incomePercentage, assetsPercentage);
    
    if (maxPercentage >= 90) return { level: 'high', color: 'text-red-500', label: 'Alto' };
    if (maxPercentage >= 70) return { level: 'medium', color: 'text-yellow-500', label: 'Medio' };
    return { level: 'low', color: 'text-green-500', label: 'Bajo' };
  };

  // Calcular meses para alcanzar el tope
  const calculateMonthsToLimit = () => {
    const currentMonth = getColombiaTime().getMonth() + 1; // ✅ FIX: Use Colombia time
    const { totalIncome } = calculateYearlyTotals();
    const monthlyAverage = totalIncome / currentMonth;
    
    if (monthlyAverage === 0) return Infinity;
    
    const remainingToLimit = TAX_LIMITS.income - totalIncome;
    const monthsToLimit = Math.ceil(remainingToLimit / monthlyAverage);
    
    return monthsToLimit;
  };

  const { totalIncome, totalExpenses, transfers } = calculateYearlyTotals();
  const assets = calculateAssets();
  const projection = calculateYearlyProjection();
  const risk = calculateRiskLevel();
  const monthsToLimit = calculateMonthsToLimit();
  const internalTransfers = getInternalTransfers();

  const incomePercentage = Math.min((projection / TAX_LIMITS.income) * 100, 100);
  const assetsPercentage = Math.min((assets / TAX_LIMITS.assets) * 100, 100);

  const shouldDeclare = projection >= TAX_LIMITS.income || assets >= TAX_LIMITS.assets;

  // Consejos personalizados
  const getTaxTips = () => {
    const tips: TaxTip[] = [];

    // Transferencias entre cuentas
    if (internalTransfers.length > 0) {
      tips.push({
        type: 'warning',
        icon: ArrowRightLeft,
        title: '⚠️ Transferencias entre cuentas',
        description: `Has realizado ${internalTransfers.length} transferencias entre tus cuentas este año. La DIAN no diferencia estas transferencias de ingresos reales. Mantén un registro claro de estas transacciones.`,
        action: 'Ver transferencias',
        onActionClick: () => {
          // Navegar a transacciones con filtro de transferencias
          onNavigate('transactions');
          // TODO: Aplicar filtro de transferencias cuando se implemente el state compartido
          toast.info('Mostrando todas las transacciones. Filtra por "Transferencias" para ver solo ese tipo.');
        },
      });
    }

    // Cerca del tope
    if (incomePercentage >= 70 && incomePercentage < 90) {
      tips.push({
        type: 'info',
        icon: AlertTriangle,
        title: '📊 Te acercas al tope de ingresos',
        description: `Has alcanzado el ${incomePercentage.toFixed(1)}% del tope de ingresos. En aproximadamente ${monthsToLimit} meses podrías estar obligado a declarar renta.`,
        action: 'Ver proyección',
        onActionClick: () => {
          // Cambiar al tab de Dashboard
          setSelectedTab('dashboard');
          toast.success('Revisa el dashboard para ver la proyección detallada');
        },
      });
    }

    // Superó el tope
    if (shouldDeclare) {
      tips.push({
        type: 'error',
        icon: AlertCircle,
        title: '🚨 Obligado a declarar renta',
        description: 'Según tus ingresos o patrimonio proyectados, estarás obligado a declarar renta este año. Comienza a preparar tu documentación.',
        action: 'Ver requisitos',
        onActionClick: () => {
          // Cambiar al tab de Reportes
          setSelectedTab('reports');
          toast.info('Genera reportes tributarios para preparar tu declaración');
        },
      });
    }

    // Deducciones posibles
    const healthExpenses = transactions.filter(t => 
      t.type === 'expense' && t.category && ['6'].includes(t.category)
    ).reduce((sum, t) => sum + t.amount, 0);

    if (healthExpenses > 0 && shouldDeclare) {
      tips.push({
        type: 'success',
        icon: Lightbulb,
        title: '💡 Deducciones de salud disponibles',
        description: `Has gastado $${healthExpenses.toLocaleString('es-CO')} en salud. Estos gastos pueden ser deducibles de tu declaración de renta.`,
        action: 'Ver deducciones',
        onActionClick: () => {
          // Cambiar al tab de Reportes
          setSelectedTab('reports');
          toast.success('Genera el reporte de gastos deducibles para ver el detalle');
        },
      });
    }

    // Buena práctica: Ahorro
    const savingsRate = ((totalIncome - totalExpenses) / totalIncome) * 100;
    if (savingsRate > 20) {
      tips.push({
        type: 'success',
        icon: CheckCircle2,
        title: '✅ Excelente tasa de ahorro',
        description: `Estás ahorrando el ${savingsRate.toFixed(1)}% de tus ingresos. Esto demuestra una buena salud financiera ante la DIAN.`,
        action: null,
        onActionClick: null,
      });
    }

    // Consejo general
    if (tips.length === 0) {
      tips.push({
        type: 'info',
        icon: Info,
        title: '📚 Educación tributaria',
        description: 'Mantén un registro ordenado de todas tus transacciones. Esto facilitará el proceso si necesitas declarar renta en el futuro.',
        action: 'Aprender más',
        onActionClick: () => {
          // Scroll a la guía educativa
          toast.info('Revisa la guía educativa más abajo para aprender más');
        },
      });
    }

    return tips;
  };

  const tips = getTaxTips();

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="mobile-screen-height bg-gray-50 dark:bg-gray-950 flex flex-col prevent-overscroll">
      {/* Header - Fixed al top */}
      <div className="fixed-top-header bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-4 safe-area-top z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-3 -ml-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors touch-manipulation active:scale-95"
            aria-label="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl">Declaración de Renta</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Gestión tributaria {currentYear}</p>
          </div>
          <Calculator className="w-6 h-6 text-blue-500" />
        </div>
      </div>

      {/* Content - Scrollable con padding para header MEDIANO y nav fijos */}
      <div className="flex-1 overflow-y-auto content-with-fixed-header-and-nav momentum-scroll">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          {/* Tabs Navigation */}
          <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-10">
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent rounded-none border-0">
              <TabsTrigger 
                value="dashboard" 
                className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none py-3"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger 
                value="tips" 
                className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none py-3"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Consejos
              </TabsTrigger>
              <TabsTrigger 
                value="reports" 
                className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none py-3"
              >
                <FileText className="w-4 h-4 mr-2" />
                Reportes
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="mt-0 p-4 space-y-4">
            {/* Alert de estado */}
            <Alert className={`${shouldDeclare ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800' : 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800'}`}>
              <AlertCircle className={`h-4 w-4 ${shouldDeclare ? 'text-red-500' : 'text-blue-500'}`} />
              <AlertDescription className={shouldDeclare ? 'text-red-700 dark:text-red-300' : 'text-blue-700 dark:text-blue-300'}>
                {shouldDeclare 
                  ? '⚠️ Deberás declarar renta este año según tu situación actual' 
                  : '✅ No estás obligado a declarar renta según los datos actuales'}
              </AlertDescription>
            </Alert>

            {/* Estado Tributario */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  Estado Tributario {currentYear}
                </CardTitle>
                <CardDescription>
                  Nivel de riesgo: <span className={risk.color}>{risk.label}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Ingresos */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Ingresos proyectados</span>
                    <span className="text-sm">{formatCurrency(projection)}</span>
                  </div>
                  <Progress value={incomePercentage} className="h-2" />
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">{incomePercentage.toFixed(1)}% del tope</span>
                    <span className="text-xs text-gray-500">Tope: {formatCurrency(TAX_LIMITS.income)}</span>
                  </div>
                </div>

                {/* Patrimonio */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Patrimonio actual</span>
                    <span className="text-sm">{formatCurrency(assets)}</span>
                  </div>
                  <Progress value={assetsPercentage} className="h-2" />
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">{assetsPercentage.toFixed(1)}% del tope</span>
                    <span className="text-xs text-gray-500">Tope: {formatCurrency(TAX_LIMITS.assets)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resumen del Año */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-500" />
                  Resumen Año {currentYear}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Ingresos totales</span>
                    </div>
                    <span className="text-green-600 dark:text-green-400">{formatCurrency(totalIncome)}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-red-500" />
                      <span className="text-sm">Gastos totales</span>
                    </div>
                    <span className="text-red-600 dark:text-red-400">{formatCurrency(totalExpenses)}</span>
                  </div>

                  {internalTransfers.length > 0 && (
                    <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                      <div className="flex items-center gap-2">
                        <ArrowRightLeft className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm">Transferencias internas</span>
                      </div>
                      <span className="text-yellow-600 dark:text-yellow-400">{internalTransfers.length}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">Balance neto</span>
                    </div>
                    <span className={`${totalIncome - totalExpenses >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatCurrency(totalIncome - totalExpenses)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Proyección */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-purple-500" />
                  Proyección y Alertas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!shouldDeclare && monthsToLimit < 12 && (
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm">
                        Al ritmo actual, alcanzarás el tope de ingresos en aproximadamente{' '}
                        <strong>{monthsToLimit} {monthsToLimit === 1 ? 'mes' : 'meses'}</strong>.
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Planifica con anticipación para el cumplimiento tributario.
                      </p>
                    </div>
                  </div>
                )}

                {shouldDeclare && (
                  <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm">
                        Estás <strong>obligado a declarar renta</strong> este año.
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Las fechas de declaración suelen ser entre agosto y octubre.
                      </p>
                    </div>
                  </div>
                )}

                {!shouldDeclare && monthsToLimit >= 12 && (
                  <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm">
                        Al ritmo actual, <strong>no deberás declarar renta</strong> este año.
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Continúa monitoreando tu situación tributaria.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tips Tab */}
          <TabsContent value="tips" className="mt-0 p-4 space-y-4">
            <div className="space-y-3">
              {tips.map((tip, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`
                    ${tip.type === 'error' ? 'border-red-200 dark:border-red-800' : ''}
                    ${tip.type === 'warning' ? 'border-yellow-200 dark:border-yellow-800' : ''}
                    ${tip.type === 'success' ? 'border-green-200 dark:border-green-800' : ''}
                    ${tip.type === 'info' ? 'border-blue-200 dark:border-blue-800' : ''}
                  `}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className={`
                          p-2 rounded-lg
                          ${tip.type === 'error' ? 'bg-red-100 dark:bg-red-950' : ''}
                          ${tip.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-950' : ''}
                          ${tip.type === 'success' ? 'bg-green-100 dark:bg-green-950' : ''}
                          ${tip.type === 'info' ? 'bg-blue-100 dark:bg-blue-950' : ''}
                        `}>
                          <tip.icon className={`
                            w-5 h-5
                            ${tip.type === 'error' ? 'text-red-500' : ''}
                            ${tip.type === 'warning' ? 'text-yellow-500' : ''}
                            ${tip.type === 'success' ? 'text-green-500' : ''}
                            ${tip.type === 'info' ? 'text-blue-500' : ''}
                          `} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm mb-1">{tip.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{tip.description}</p>
                          {tip.action && (
                            <Button variant="ghost" size="sm" className="mt-2 h-8 px-2" onClick={tip.onActionClick}>
                              {tip.action}
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Guía educativa */}
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                  Guía de Educación Tributaria
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="text-sm">📚 Temas importantes:</h4>
                  <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>Las transferencias entre tus propias cuentas pueden interpretarse como ingresos adicionales por la DIAN</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>Mantén comprobantes de todas tus transacciones importantes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>Los gastos de salud, educación y dependientes pueden ser deducibles</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>Declarar renta a tiempo evita sanciones e intereses</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>Consulta con un contador si superas los topes o tienes dudas</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="mt-0 p-4 space-y-4">
            <TaxReports 
              transactions={transactions} 
              accounts={accounts} 
              categories={categories}
              currentYear={currentYear}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Navigation */}
      <BottomNav currentScreen="tax" onNavigate={(screen) => {
        if (screen === 'tax') return; // Ya estamos en tax
        // Para otras pantallas, volver y luego navegar
        onBack();
        onNavigate(screen);
      }} darkMode={darkMode} />
    </div>
  );
}