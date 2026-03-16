/**
 * 📸 IMAGE RECEIPT CAPTURE
 * 
 * Componente para capturar o seleccionar imagen de recibo/factura.
 * Usa GPT-4 Vision para interpretar el contenido y crear transacciones.
 */

import React, { useState, useRef } from 'react';
import { X, Camera, Upload, Loader2, FileImage, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import type { Category } from '../../../types';

interface ImageReceiptCaptureProps {
  categories: Category[];
  onClose: () => void;
  onReceiptProcessed: (data: ReceiptData) => void;
}

export interface ReceiptData {
  type: 'income' | 'expense';
  amount: number;
  category?: string;
  subcategory?: string;
  description?: string;
  date?: string;
  imageBase64: string;
  imageFile: File;
}

export function ImageReceiptCapture({ 
  categories, 
  onClose, 
  onReceiptProcessed 
}: ImageReceiptCaptureProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Manejar selección de archivo
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona una imagen válida');
      return;
    }

    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('La imagen es demasiado grande. Máximo 10MB');
      return;
    }

    setError(null);
    setSelectedFile(file);

    // Mostrar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Procesar imagen con GPT-4 Vision
  const handleProcessImage = async () => {
    if (!selectedImage || !selectedFile) return;

    setIsProcessing(true);
    setError(null);
    setProcessingStep('Analizando imagen con IA...');

    try {
      // Convertir imagen a base64 sin el prefijo
      const base64Data = selectedImage.split(',')[1];

      console.log('📸 Sending image to GPT-4 Vision API');
      setProcessingStep('Extrayendo información del recibo...');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 segundos

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3/parse-receipt-image`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            imageBase64: base64Data,
            categories,
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error processing receipt:', errorData);
        throw new Error(errorData.error || 'Error procesando la imagen');
      }

      const data = await response.json();
      console.log('✅ Receipt processed:', data);

      setProcessingStep('¡Listo! Creando transacción...');

      // Pasar datos al componente padre
      onReceiptProcessed({
        ...data.receipt,
        imageBase64: selectedImage,
        imageFile: selectedFile,
      });

      toast.success('📸 Recibo procesado exitosamente');
      onClose();

    } catch (error: any) {
      console.error('❌ Error processing receipt:', error);
      
      if (error.name === 'AbortError') {
        setError('⏱️ El procesamiento tardó demasiado. Intenta con una imagen más clara o pequeña.');
      } else {
        // Mejorar mensajes de error específicos
        let errorMessage = error.message || 'Error procesando la imagen';
        
        if (errorMessage.includes('no parece ser un recibo')) {
          errorMessage = '📸 La IA no pudo identificar un recibo en la imagen. Asegúrate de que la foto sea clara y muestre el texto y números del recibo.';
        } else if (errorMessage.includes('no se pudo detectar el monto')) {
          errorMessage = '💰 No se pudo detectar el monto total. Asegúrate de que el total sea visible en la imagen.';
        } else if (errorMessage.includes('AI service not configured')) {
          errorMessage = '🔧 El servicio de IA no está configurado correctamente.';
        }
        
        setError(errorMessage);
      }
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col"
        style={{ height: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fijo */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <Camera className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Escanear Recibo
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Sube una foto de tu recibo o factura
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            disabled={isProcessing}
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 pb-24 min-h-0">
          {/* Preview de imagen */}
          {selectedImage ? (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                <img
                  src={selectedImage}
                  alt="Preview"
                  className="w-full h-auto object-contain bg-gray-50 dark:bg-gray-900"
                />
                {!isProcessing && (
                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      setSelectedFile(null);
                      setError(null);
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Estado de procesamiento */}
              {isProcessing && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        {processingStep}
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                        Esto puede tomar unos segundos...
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-900 dark:text-red-100">
                        Error al procesar
                      </p>
                      <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Botón procesar - Dentro del contenido scrollable */}
              {!isProcessing && (
                <button
                  onClick={handleProcessImage}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all shadow-xl shadow-blue-500/40 flex items-center justify-center gap-2 active:scale-[0.98] mb-4"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Procesar Recibo con IA
                </button>
              )}
            </div>
          ) : (
            /* Opciones de captura */
            <div className="space-y-4">
              {/* Tomar foto */}
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Camera className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Tomar Foto
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Usa la cámara de tu dispositivo
                    </p>
                  </div>
                </div>
              </button>

              {/* Seleccionar de galería */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all group"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Seleccionar de Galería
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Elige una foto existente
                    </p>
                  </div>
                </div>
              </button>

              {/* Info */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <FileImage className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <p className="font-medium">La IA puede detectar:</p>
                    <ul className="list-disc list-inside space-y-0.5 text-gray-600 dark:text-gray-400">
                      <li>Recibos de supermercado</li>
                      <li>Facturas de servicios</li>
                      <li>Comprobantes de pago</li>
                      <li>Recibos de restaurantes</li>
                      <li>Tickets de compra</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>



        {/* Hidden inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </motion.div>
    </motion.div>
  );
}
