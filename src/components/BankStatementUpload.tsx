import { motion } from 'framer-motion';
import { useState, useRef } from 'react';
import { ArrowLeft, Upload, X, Check, Loader2, AlertCircle } from 'lucide-react';
import { Account, Category } from '../types';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { OtiLoader } from './OtiLoader';

interface BankStatementUploadProps {
  accounts: Account[];
  categories: Category[];
  onNavigate: (screen: string) => void;
  onAddTransaction: (transaction: any) => void;
  onAddMultipleTransactions?: (transactions: any[]) => void;
  onGoBack?: () => void; // ✅ NEW: Add onGoBack prop
}

interface DetectedTransaction {
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  suggestedCategory?: string;
  selected: boolean;
}

export default function BankStatementUpload({
  accounts,
  onNavigate,
  onAddTransaction,
  categories,
  onAddMultipleTransactions,
  onGoBack
}: BankStatementUploadProps) {
  const [selectedAccount, setSelectedAccount] = useState(accounts[0]?.id || '');
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [detectedTransactions, setDetectedTransactions] = useState<DetectedTransaction[]>([]);
  const [step, setStep] = useState<'upload' | 'review'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    // Validate file types and sizes
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic'];
    const maxSize = 5 * 1024 * 1024; // 5MB (reduced from 10MB due to Supabase Edge Function limits)
    
    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    for (const file of selectedFiles) {
      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name}: Tipo de archivo no válido. Solo imágenes (JPG, PNG, HEIC)`);
        continue;
      }

      if (file.size > maxSize) {
        toast.error(`${file.name}: El archivo debe ser menor a 5MB`);
        continue;
      }

      validFiles.push(file);

      // Create preview for images
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        if (newPreviews.length === validFiles.length) {
          setFilePreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
      toast.success(`${validFiles.length} imagen${validFiles.length > 1 ? 'es' : ''} seleccionada${validFiles.length > 1 ? 's' : ''}`);
    }

    // Reset input
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setFilePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const analyzeStatement = async () => {
    if (files.length === 0 || !selectedAccount) {
      toast.error('Por favor selecciona al menos un archivo y una cuenta');
      return;
    }

    setAnalyzing(true);

    try {
      // Create FormData
      const formData = new FormData();
      files.forEach(file => formData.append('files[]', file));
      formData.append('accountId', selectedAccount);

      console.log('📤 Uploading files:', files.map(f => ({ name: f.name, size: f.size, type: f.type })));
      console.log('🔑 Using projectId:', projectId);

      // Upload and analyze
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3/analyze-bank-statement`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: formData,
        }
      );

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Error analyzing statement:', errorData);
        
        if (errorData.error === 'OpenAI API key not configured') {
          toast.error('La clave API de OpenAI no está configurada. Por favor contacta al administrador.');
        } else if (errorData.error?.includes('PDF')) {
          toast.error(errorData.error);
        } else {
          toast.error(`Error al analizar el extracto: ${errorData.error || 'Error desconocido'}`);
        }
        return;
      }

      const data = await response.json();
      console.log('✅ Analysis complete:', data);
      
      if (data.transactions && data.transactions.length > 0) {
        setDetectedTransactions(data.transactions.map((t: any) => ({ ...t, selected: true })));
        setStep('review');
        toast.success(`Se detectaron ${data.transactions.length} transacciones`);
      } else {
        toast.error('No se detectaron transacciones en el extracto');
      }
    } catch (error: any) {
      console.error('❌ Error analyzing statement:', error);
      
      // More detailed error messages
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error('Error de conexión. Verifica tu conexión a internet y que el servidor esté disponible.');
      } else if (error.message) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error('Error inesperado al analizar el extracto');
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleTransactionSelection = (index: number) => {
    setDetectedTransactions(prev => 
      prev.map((t, i) => i === index ? { ...t, selected: !t.selected } : t)
    );
  };

  const importSelectedTransactions = () => {
    const selectedTxns = detectedTransactions.filter(t => t.selected);
    
    if (selectedTxns.length === 0) {
      toast.error('Por favor selecciona al menos una transacción');
      return;
    }

    // Convert detected transactions to app transaction format
    const transactionsToImport = selectedTxns.map(txn => ({
      type: txn.type,
      amount: txn.amount,
      account: selectedAccount,
      category: txn.suggestedCategory || undefined,
      date: txn.date,
      note: `Extracto: ${txn.description}`,
    }));

    // Use bulk import if available, otherwise import one by one
    if (onAddMultipleTransactions) {
      onAddMultipleTransactions(transactionsToImport);
      toast.success(`Se importaron ${transactionsToImport.length} transacciones`);
      setTimeout(() => {
        onNavigate('transactions');
      }, 100);
    } else {
      // Fallback: Import sequentially with delays
      let importedCount = 0;
      
      const importNext = (index: number) => {
        if (index >= transactionsToImport.length) {
          toast.success(`Se importaron ${importedCount} transacciones`);
          setTimeout(() => {
            onNavigate('transactions');
          }, 100);
          return;
        }
        
        onAddTransaction(transactionsToImport[index]);
        importedCount++;
        
        // Import next transaction after a small delay
        setTimeout(() => importNext(index + 1), 50);
      };
      
      importNext(0);
    }
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Sin categoría';
  };

  const getAccountName = (accountId: string) => {
    return accounts.find(a => a.id === accountId)?.name || '';
  };

  if (step === 'review') {
    return (
      <div className="flex flex-col mobile-screen-height bg-gray-50 dark:bg-gray-950 prevent-overscroll">
        {/* Header - Fixed al top */}
        <div className="fixed-top-header bg-white dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-800 safe-area-top">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep('upload')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg -ml-2 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <h1 className="text-gray-900 dark:text-white">
              Revisar Transacciones
            </h1>
            <button
              onClick={importSelectedTransactions}
              className="px-4 py-2 rounded-lg text-white transition-colors"
              style={{ backgroundColor: 'var(--theme-primary)' }}
            >
              Importar
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="flex-shrink-0 bg-blue-50 dark:bg-blue-900/20 px-6 py-3 border-b border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900 dark:text-blue-100">
              <p className="font-medium">Cuenta: {getAccountName(selectedAccount)}</p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Selecciona las transacciones que deseas importar
              </p>
            </div>
          </div>
        </div>

        {/* Transactions List - Scrollable con padding para header fijo */}
        <div className="flex-1 overflow-y-auto top-header-spacing-lg momentum-scroll">
          <div className="p-4 space-y-3 pb-32">
            {detectedTransactions.map((txn, index) => (
              <div
                key={index}
                onClick={() => toggleTransactionSelection(index)}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  txn.selected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    txn.selected
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {txn.selected && <Check className="w-4 h-4 text-white" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {txn.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(txn.date).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                        {txn.suggestedCategory && (
                          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                            Categoría: {getCategoryName(txn.suggestedCategory)}
                          </p>
                        )}
                      </div>
                      
                      <div className="text-right flex-shrink-0">
                        <p className={`font-medium ${
                          txn.type === 'income'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {txn.type === 'income' ? '+' : '-'}${txn.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="flex-shrink-0 bg-white dark:bg-gray-900 px-6 py-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {detectedTransactions.filter(t => t.selected).length} de {detectedTransactions.length} seleccionadas
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col mobile-screen-height bg-gray-50 dark:bg-gray-950 prevent-overscroll relative">
      {/* Analyzing Overlay */}
      {analyzing && (
        <div className="absolute inset-0 bg-gray-50/95 dark:bg-gray-950/95 z-50 flex items-center justify-center backdrop-blur-sm">
          <OtiLoader 
            message="Procesando extracto bancario con IA..." 
            size="md"
          />
        </div>
      )}

      {/* Header - Fixed al top */}
      <div className="fixed-top-header bg-white dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-800 safe-area-top z-20">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onGoBack ? onGoBack() : onNavigate('settings')}
            className="p-3 -ml-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors touch-manipulation active:scale-95"
            aria-label="Volver"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <h1 className="text-gray-900 dark:text-white">
            Cargar Extracto Bancario
          </h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Content - Scrollable con padding para header pequeño */}
      <div className="flex-1 overflow-y-auto top-header-spacing momentum-scroll">
        <div className="max-w-md mx-auto space-y-6 p-6">
          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900 dark:text-blue-100">
                <p className="font-medium mb-2">Cómo funciona:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs text-blue-700 dark:text-blue-300">
                  <li>Selecciona la cuenta a la que pertenece el extracto</li>
                  <li>Sube la imagen de tu extracto bancario</li>
                  <li>La IA analizará automáticamente las transacciones</li>
                  <li>Revisa y confirma las transacciones detectadas</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Account Selection */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Selecciona la cuenta
            </label>
            <div className="space-y-2">
              {accounts.map((account) => (
                <button
                  key={account.id}
                  onClick={() => setSelectedAccount(account.id)}
                  className={`w-full px-4 py-3 rounded-lg text-left transition-all border-2 ${
                    selectedAccount === account.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900 dark:text-white">{account.name}</span>
                    {selectedAccount === account.id && (
                      <Check className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* File Upload */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Sube tu extracto
            </label>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />

            {!files.length ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
              >
                <div className="flex flex-col items-center gap-3">
                  <Upload className="w-12 h-12 text-gray-400" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Haz clic para seleccionar
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Imágenes (máx. 5MB cada una)
                    </p>
                  </div>
                </div>
              </button>
            ) : (
              <div className="space-y-3">
                {/* File Previews */}
                {filePreviews.map((preview, index) => (
                  <div key={index} className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-48 object-contain bg-gray-100 dark:bg-gray-800"
                    />
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Agregar más archivos
                  </button>
                  <button
                    onClick={() => {
                      setFiles([]);
                      setFilePreviews([]);
                    }}
                    className="px-4 py-2 border border-red-300 dark:border-red-600 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Eliminar todos
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Analyze Button */}
          {files.length > 0 && (
            <button
              onClick={analyzeStatement}
              disabled={analyzing}
              className="w-full py-4 rounded-xl text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ backgroundColor: 'var(--theme-primary)' }}
            >
              <Upload className="w-5 h-5" />
              Analizar y Extraer Transacciones
            </button>
          )}
        </div>
      </div>
    </div>
  );
}