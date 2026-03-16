/**
 * Tax Reports Component
 * 
 * Implementación completa de los 4 reportes tributarios:
 * 1. Resumen Anual de Ingresos
 * 2. Certificado de Ingresos y Retenciones
 * 3. Gastos Deducibles (Salud, Educación, Otros)
 * 4. Historial de Transferencias
 */

import { useState } from 'react';
import { 
  Download, 
  FileText, 
  X, 
  Calendar,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  ArrowRightLeft,
  Heart,
  BookOpen,
  Home,
  ChevronRight,
} from 'lucide-react';
import { Transaction, Account, Category } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner@2.0.3';
import { parseLocalDate } from '../utils/dateUtils'; // ✅ Import date utils

interface TaxReportsProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  currentYear: number;
}

type ReportType = 'income' | 'certificate' | 'deductions' | 'transfers' | null;

export default function TaxReports({ transactions, accounts, categories, currentYear }: TaxReportsProps) {
  const [selectedReport, setSelectedReport] = useState<ReportType>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Obtener transacciones del año
  const getYearTransactions = () => {
    return transactions.filter(t => {
      const date = parseLocalDate(t.date); // ✅ FIX: Parse local date
      return date.getFullYear() === currentYear;
    });
  };

  // ============================================
  // REPORTE 1: Resumen Anual de Ingresos
  // ============================================
  const generateIncomeReport = () => {
    const yearTransactions = getYearTransactions();
    const incomeTransactions = yearTransactions.filter(t => t.type === 'income');

    // Agrupar por categoría
    const incomeByCategory: { [key: string]: { name: string; total: number; count: number; transactions: Transaction[] } } = {};

    incomeTransactions.forEach(t => {
      const category = categories.find(c => c.id === t.category);
      const categoryName = category?.name || 'Sin categoría';
      
      if (!incomeByCategory[categoryName]) {
        incomeByCategory[categoryName] = {
          name: categoryName,
          total: 0,
          count: 0,
          transactions: [],
        };
      }
      
      incomeByCategory[categoryName].total += t.amount;
      incomeByCategory[categoryName].count += 1;
      incomeByCategory[categoryName].transactions.push(t);
    });

    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);

    return {
      incomeByCategory: Object.values(incomeByCategory).sort((a, b) => b.total - a.total),
      totalIncome,
      transactionCount: incomeTransactions.length,
    };
  };

  // ============================================
  // REPORTE 2: Certificado de Ingresos
  // ============================================
  const generateCertificateData = () => {
    const yearTransactions = getYearTransactions();
    const incomeTransactions = yearTransactions.filter(t => t.type === 'income');
    const expenseTransactions = yearTransactions.filter(t => t.type === 'expense');

    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

    // Calcular deducciones (salud + educación)
    const deductibleExpenses = expenseTransactions.filter(t => {
      const category = categories.find(c => c.id === t.category);
      return category?.name === 'Salud' || category?.name === 'Educación';
    });

    const totalDeductions = deductibleExpenses.reduce((sum, t) => sum + t.amount, 0);
    const netIncome = totalIncome - totalDeductions;

    // Patrimonio actual
    const currentAssets = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    return {
      totalIncome,
      totalExpenses,
      totalDeductions,
      netIncome,
      currentAssets,
      incomeCount: incomeTransactions.length,
      deductionCount: deductibleExpenses.length,
    };
  };

  // ============================================
  // REPORTE 3: Gastos Deducibles
  // ============================================
  const generateDeductionsReport = () => {
    const yearTransactions = getYearTransactions();
    const expenseTransactions = yearTransactions.filter(t => t.type === 'expense');

    // Categorías deducibles
    const deductibleCategories = ['Salud', 'Educación', 'Vivienda'];
    
    const deductionsByCategory: { [key: string]: { name: string; total: number; count: number; transactions: Transaction[] } } = {};

    expenseTransactions.forEach(t => {
      const category = categories.find(c => c.id === t.category);
      const categoryName = category?.name || '';
      
      if (deductibleCategories.includes(categoryName)) {
        if (!deductionsByCategory[categoryName]) {
          deductionsByCategory[categoryName] = {
            name: categoryName,
            total: 0,
            count: 0,
            transactions: [],
          };
        }
        
        deductionsByCategory[categoryName].total += t.amount;
        deductionsByCategory[categoryName].count += 1;
        deductionsByCategory[categoryName].transactions.push(t);
      }
    });

    const totalDeductions = Object.values(deductionsByCategory).reduce((sum, cat) => sum + cat.total, 0);

    return {
      deductionsByCategory: Object.values(deductionsByCategory).sort((a, b) => b.total - a.total),
      totalDeductions,
      transactionCount: Object.values(deductionsByCategory).reduce((sum, cat) => sum + cat.count, 0),
    };
  };

  // ============================================
  // REPORTE 4: Historial de Transferencias
  // ============================================
  const generateTransfersReport = () => {
    const yearTransactions = getYearTransactions();
    const transfers = yearTransactions.filter(t => t.type === 'transfer');

    // Agrupar por mes
    const transfersByMonth: { [key: string]: Transaction[] } = {};

    transfers.forEach(t => {
      const date = parseLocalDate(t.date); // ✅ FIX: Parse local date
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!transfersByMonth[monthKey]) {
        transfersByMonth[monthKey] = [];
      }
      
      transfersByMonth[monthKey].push(t);
    });

    const totalTransferred = transfers.reduce((sum, t) => sum + t.amount, 0);

    return {
      transfers,
      transfersByMonth,
      totalTransferred,
      transferCount: transfers.length,
    };
  };

  // Descargar reporte como texto simple (por ahora)
  const downloadReport = (content: string, filename: string) => {
    try {
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Reporte descargado exitosamente');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Error al descargar el reporte');
    }
  };

  // Generar contenido del reporte de ingresos
  const downloadIncomeReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const data = generateIncomeReport();
      
      let content = `RESUMEN ANUAL DE INGRESOS ${currentYear}\n`;
      content += `Generado: ${new Date().toLocaleDateString('es-CO')}\n`;
      content += `\n${'='.repeat(60)}\n\n`;
      
      content += `RESUMEN GENERAL\n`;
      content += `-`.repeat(60) + `\n`;
      content += `Total de ingresos: ${formatCurrency(data.totalIncome)}\n`;
      content += `Número de transacciones: ${data.transactionCount}\n`;
      content += `\n`;
      
      content += `INGRESOS POR CATEGORÍA\n`;
      content += `-`.repeat(60) + `\n`;
      
      data.incomeByCategory.forEach((cat, index) => {
        content += `\n${index + 1}. ${cat.name}\n`;
        content += `   Total: ${formatCurrency(cat.total)} (${cat.count} transacciones)\n`;
        content += `   Promedio: ${formatCurrency(cat.total / cat.count)}\n`;
      });
      
      content += `\n${'='.repeat(60)}\n`;
      content += `\nNota: Este reporte es de carácter informativo y debe ser verificado con documentación oficial.\n`;
      
      downloadReport(content, `Resumen_Ingresos_${currentYear}.txt`);
      setIsGenerating(false);
      setSelectedReport(null);
    }, 500);
  };

  // Generar certificado de ingresos
  const downloadCertificate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const data = generateCertificateData();
      
      let content = `CERTIFICADO DE INGRESOS Y RETENCIONES\n`;
      content += `Año fiscal: ${currentYear}\n`;
      content += `Generado: ${new Date().toLocaleDateString('es-CO')}\n`;
      content += `\n${'='.repeat(60)}\n\n`;
      
      content += `INFORMACIÓN GENERAL\n`;
      content += `-`.repeat(60) + `\n`;
      content += `Total de ingresos brutos: ${formatCurrency(data.totalIncome)}\n`;
      content += `Total de gastos: ${formatCurrency(data.totalExpenses)}\n`;
      content += `Deducciones aplicables: ${formatCurrency(data.totalDeductions)}\n`;
      content += `Ingreso neto: ${formatCurrency(data.netIncome)}\n`;
      content += `Patrimonio actual: ${formatCurrency(data.currentAssets)}\n`;
      content += `\n`;
      
      content += `ESTADÍSTICAS\n`;
      content += `-`.repeat(60) + `\n`;
      content += `Transacciones de ingreso: ${data.incomeCount}\n`;
      content += `Deducciones registradas: ${data.deductionCount}\n`;
      content += `Tasa de ahorro: ${((data.netIncome / data.totalIncome) * 100).toFixed(2)}%\n`;
      
      content += `\n${'='.repeat(60)}\n`;
      content += `\nEste certificado es de carácter informativo y debe ser validado por un contador público.\n`;
      
      downloadReport(content, `Certificado_Ingresos_${currentYear}.txt`);
      setIsGenerating(false);
      setSelectedReport(null);
    }, 500);
  };

  // Generar reporte de deducciones
  const downloadDeductionsReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const data = generateDeductionsReport();
      
      let content = `GASTOS DEDUCIBLES ${currentYear}\n`;
      content += `Generado: ${new Date().toLocaleDateString('es-CO')}\n`;
      content += `\n${'='.repeat(60)}\n\n`;
      
      content += `RESUMEN GENERAL\n`;
      content += `-`.repeat(60) + `\n`;
      content += `Total de deducciones: ${formatCurrency(data.totalDeductions)}\n`;
      content += `Número de transacciones: ${data.transactionCount}\n`;
      content += `\n`;
      
      content += `DEDUCCIONES POR CATEGORÍA\n`;
      content += `-`.repeat(60) + `\n`;
      
      data.deductionsByCategory.forEach((cat, index) => {
        content += `\n${index + 1}. ${cat.name}\n`;
        content += `   Total: ${formatCurrency(cat.total)} (${cat.count} gastos)\n`;
        content += `   Promedio por gasto: ${formatCurrency(cat.total / cat.count)}\n`;
        
        // Listar transacciones
        content += `   Detalle:\n`;
        cat.transactions.slice(0, 10).forEach(t => {
          content += `   - ${formatDate(t.date)}: ${formatCurrency(t.amount)}`;
          if (t.note) content += ` (${t.note})`;
          content += `\n`;
        });
        if (cat.transactions.length > 10) {
          content += `   ... y ${cat.transactions.length - 10} más\n`;
        }
      });
      
      content += `\n${'='.repeat(60)}\n`;
      content += `\nImportante: Conserva todos los comprobantes de estos gastos para tu declaración de renta.\n`;
      
      downloadReport(content, `Gastos_Deducibles_${currentYear}.txt`);
      setIsGenerating(false);
      setSelectedReport(null);
    }, 500);
  };

  // Generar reporte de transferencias
  const downloadTransfersReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const data = generateTransfersReport();
      
      let content = `HISTORIAL DE TRANSFERENCIAS ${currentYear}\n`;
      content += `Generado: ${new Date().toLocaleDateString('es-CO')}\n`;
      content += `\n${'='.repeat(60)}\n\n`;
      
      content += `RESUMEN GENERAL\n`;
      content += `-`.repeat(60) + `\n`;
      content += `Total transferido: ${formatCurrency(data.totalTransferred)}\n`;
      content += `Número de transferencias: ${data.transferCount}\n`;
      content += `\n`;
      
      content += `DETALLE DE TRANSFERENCIAS\n`;
      content += `-`.repeat(60) + `\n\n`;
      
      data.transfers.forEach((t, index) => {
        const fromAccount = accounts.find(a => a.id === t.account);
        const toAccount = accounts.find(a => a.id === t.toAccount);
        
        content += `${index + 1}. ${formatDate(t.date)}\n`;
        content += `   De: ${fromAccount?.name || 'Cuenta desconocida'}\n`;
        content += `   Hacia: ${toAccount?.name || 'Cuenta desconocida'}\n`;
        content += `   Monto: ${formatCurrency(t.amount)}\n`;
        if (t.note) content += `   Nota: ${t.note}\n`;
        content += `\n`;
      });
      
      content += `${'='.repeat(60)}\n`;
      content += `\n⚠️ IMPORTANTE: Las transferencias entre cuentas propias NO son ingresos gravables.\n`;
      content += `La DIAN puede interpretar estas transacciones como ingresos si no están debidamente documentadas.\n`;
      content += `Asegúrate de poder demostrar que son movimientos entre tus propias cuentas.\n`;
      
      downloadReport(content, `Transferencias_${currentYear}.txt`);
      setIsGenerating(false);
      setSelectedReport(null);
    }, 500);
  };

  // Renderizar contenido del modal según el tipo de reporte
  const renderReportContent = () => {
    if (!selectedReport) return null;

    switch (selectedReport) {
      case 'income':
        const incomeData = generateIncomeReport();
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumen General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Total de ingresos:</span>
                  <span className="text-green-600 dark:text-green-400">{formatCurrency(incomeData.totalIncome)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Transacciones:</span>
                  <span>{incomeData.transactionCount}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Por Categoría</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {incomeData.incomeByCategory.map((cat, index) => (
                    <div key={index} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-sm">{cat.name}</span>
                          <p className="text-xs text-gray-500">{cat.count} transacciones</p>
                        </div>
                        <span className="text-sm">{formatCurrency(cat.total)}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${(cat.total / incomeData.totalIncome) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button 
              className="w-full"
              onClick={downloadIncomeReport}
              disabled={isGenerating}
            >
              <Download className="w-4 h-4 mr-2" />
              {isGenerating ? 'Generando...' : 'Descargar Reporte'}
            </Button>
          </div>
        );

      case 'certificate':
        const certData = generateCertificateData();
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información Financiera</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-950 rounded">
                  <span className="text-sm">Ingresos brutos:</span>
                  <span className="text-sm text-green-600 dark:text-green-400">{formatCurrency(certData.totalIncome)}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-red-50 dark:bg-red-950 rounded">
                  <span className="text-sm">Gastos totales:</span>
                  <span className="text-sm text-red-600 dark:text-red-400">{formatCurrency(certData.totalExpenses)}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-blue-50 dark:bg-blue-950 rounded">
                  <span className="text-sm">Deducciones:</span>
                  <span className="text-sm text-blue-600 dark:text-blue-400">{formatCurrency(certData.totalDeductions)}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-purple-50 dark:bg-purple-950 rounded border-2 border-purple-200 dark:border-purple-800">
                  <span className="text-sm">Ingreso neto:</span>
                  <span className="text-sm text-purple-600 dark:text-purple-400">{formatCurrency(certData.netIncome)}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
                  <span className="text-sm">Patrimonio actual:</span>
                  <span className="text-sm">{formatCurrency(certData.currentAssets)}</span>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Este certificado es informativo. Debe ser validado por un contador público para presentación oficial.
              </AlertDescription>
            </Alert>

            <Button 
              className="w-full"
              onClick={downloadCertificate}
              disabled={isGenerating}
            >
              <Download className="w-4 h-4 mr-2" />
              {isGenerating ? 'Generando...' : 'Descargar Certificado'}
            </Button>
          </div>
        );

      case 'deductions':
        const deductData = generateDeductionsReport();
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Deducible</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <div className="text-3xl text-purple-600 dark:text-purple-400 mb-2">
                    {formatCurrency(deductData.totalDeductions)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {deductData.transactionCount} gastos deducibles
                  </div>
                </div>
              </CardContent>
            </Card>

            {deductData.deductionsByCategory.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Por Categoría</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {deductData.deductionsByCategory.map((cat, index) => (
                      <div key={index} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          {cat.name === 'Salud' && <Heart className="w-4 h-4 text-red-500" />}
                          {cat.name === 'Educación' && <BookOpen className="w-4 h-4 text-blue-500" />}
                          {cat.name === 'Vivienda' && <Home className="w-4 h-4 text-green-500" />}
                          <span className="text-sm">{cat.name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">{cat.count} gastos</span>
                          <span className="text-sm">{formatCurrency(cat.total)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-gray-500">
                  <p>No se encontraron gastos deducibles en {currentYear}</p>
                  <p className="text-sm mt-2">Los gastos de salud, educación y vivienda son deducibles.</p>
                </CardContent>
              </Card>
            )}

            <Button 
              className="w-full"
              onClick={downloadDeductionsReport}
              disabled={isGenerating || deductData.deductionsByCategory.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              {isGenerating ? 'Generando...' : 'Descargar Reporte'}
            </Button>
          </div>
        );

      case 'transfers':
        const transferData = generateTransfersReport();
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumen de Transferencias</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Total transferido:</span>
                  <span className="text-orange-600 dark:text-orange-400">{formatCurrency(transferData.totalTransferred)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Número de transferencias:</span>
                  <span>{transferData.transferCount}</span>
                </div>
              </CardContent>
            </Card>

            {transferData.transfers.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Últimas Transferencias</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {transferData.transfers.slice(0, 10).map((t, index) => {
                      const fromAccount = accounts.find(a => a.id === t.account);
                      const toAccount = accounts.find(a => a.id === t.toAccount);
                      
                      return (
                        <div key={index} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-xs text-gray-500">{formatDate(t.date)}</span>
                            <span className="">{formatCurrency(t.amount)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <span>{fromAccount?.name}</span>
                            <ArrowRightLeft className="w-3 h-3" />
                            <span>{toAccount?.name}</span>
                          </div>
                          {t.note && (
                            <p className="text-xs text-gray-500 mt-1">{t.note}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-gray-500">
                  <p>No se encontraron transferencias en {currentYear}</p>
                </CardContent>
              </Card>
            )}

            <Alert className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-700 dark:text-yellow-300 text-sm">
                <strong>Importante:</strong> Las transferencias entre cuentas propias NO son ingresos gravables. 
                Conserva este reporte para demostrar que son movimientos internos.
              </AlertDescription>
            </Alert>

            <Button 
              className="w-full"
              onClick={downloadTransfersReport}
              disabled={isGenerating || transferData.transfers.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              {isGenerating ? 'Generando...' : 'Descargar Historial'}
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-500" />
            Reportes Tributarios
          </CardTitle>
          <CardDescription>Genera reportes para tu declaración de renta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-between h-auto py-3"
            onClick={() => setSelectedReport('income')}
          >
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-blue-500" />
              <div className="text-left">
                <div className="text-sm">Resumen Anual de Ingresos</div>
                <div className="text-xs text-gray-500">Exportar en formato PDF</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5" />
          </Button>

          <Button 
            variant="outline" 
            className="w-full justify-between h-auto py-3"
            onClick={() => setSelectedReport('certificate')}
          >
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-green-500" />
              <div className="text-left">
                <div className="text-sm">Certificado de Ingresos y Retenciones</div>
                <div className="text-xs text-gray-500">Preparación para declaración</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5" />
          </Button>

          <Button 
            variant="outline" 
            className="w-full justify-between h-auto py-3"
            onClick={() => setSelectedReport('deductions')}
          >
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-purple-500" />
              <div className="text-left">
                <div className="text-sm">Gastos Deducibles</div>
                <div className="text-xs text-gray-500">Salud, educación y otros</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5" />
          </Button>

          <Button 
            variant="outline" 
            className="w-full justify-between h-auto py-3"
            onClick={() => setSelectedReport('transfers')}
          >
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-orange-500" />
              <div className="text-left">
                <div className="text-sm">Historial de Transferencias</div>
                <div className="text-xs text-gray-500">Entre cuentas propias</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </CardContent>
      </Card>

      {/* Modal de Reportes */}
      <Dialog open={selectedReport !== null} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedReport === 'income' && <><TrendingUp className="w-5 h-5 text-blue-500" /> Resumen Anual de Ingresos</>}
              {selectedReport === 'certificate' && <><FileText className="w-5 h-5 text-green-500" /> Certificado de Ingresos</>}
              {selectedReport === 'deductions' && <><Heart className="w-5 h-5 text-purple-500" /> Gastos Deducibles</>}
              {selectedReport === 'transfers' && <><ArrowRightLeft className="w-5 h-5 text-orange-500" /> Transferencias</>}
            </DialogTitle>
            <DialogDescription>
              Año fiscal: {currentYear}
            </DialogDescription>
          </DialogHeader>
          
          {renderReportContent()}
        </DialogContent>
      </Dialog>
    </>
  );
}