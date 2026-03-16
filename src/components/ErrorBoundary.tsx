/**
 * ErrorBoundary
 * 
 * Componente que captura errores de React y muestra una UI de fallback
 * en lugar de que la app crashee completamente.
 * 
 * Uso:
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Actualizar estado para mostrar UI de fallback
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log del error (siempre se muestra porque es crítico)
    console.error('❌ [ErrorBoundary] Error capturado:', error);
    console.error('📍 [ErrorBoundary] Component stack:', errorInfo.componentStack);

    this.setState({
      error,
      errorInfo,
    });

    // Aquí podrías enviar el error a un servicio de logging (Sentry, LogRocket, etc.)
    // this.logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Si hay un callback de reset, ejecutarlo
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-red-900/20 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-red-200 dark:border-red-900/50"
          >
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-3">
              ¡Oops! Algo salió mal
            </h1>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
              La aplicación encontró un error inesperado. No te preocupes, tus datos están seguros.
            </p>

            {/* Error details (only in development) */}
            {(() => {
              // Detectar desarrollo de manera segura
              const isDev = typeof window !== 'undefined' && 
                (window.location.hostname === 'localhost' || 
                 window.location.hostname === '127.0.0.1' ||
                 window.location.hostname.includes('local'));
              
              return isDev && this.state.error ? (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-900/50">
                  <p className="text-sm font-semibold text-red-900 dark:text-red-400 mb-2">
                    Error técnico (solo visible en desarrollo):
                  </p>
                  <pre className="text-xs text-red-800 dark:text-red-300 overflow-auto max-h-32">
                    {this.state.error.toString()}
                  </pre>
                </div>
              ) : null;
            })()}

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                <Home className="w-5 h-5" />
                Volver al inicio
              </button>

              <button
                onClick={this.handleReload}
                className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-3 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                <RefreshCw className="w-5 h-5" />
                Recargar aplicación
              </button>
            </div>

            {/* Support info */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Si el problema persiste, contacta a soporte técnico
              </p>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;