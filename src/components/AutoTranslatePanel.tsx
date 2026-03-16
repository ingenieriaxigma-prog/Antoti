/**
 * 🌍 Panel de Auto-Traducción
 * 
 * Componente para ejecutar la traducción automática
 * y descargar los archivos generados
 */

import { useState } from 'react';
import { Download, Loader2, CheckCircle, XCircle, Languages } from 'lucide-react';
import { runAutoTranslation, objectToTypeScript } from '../utils/auto-translate';
import { toast } from 'sonner@2.0.3';

export default function AutoTranslatePanel() {
  const [isTranslating, setIsTranslating] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [files, setFiles] = useState<any>(null);

  const handleTranslate = async () => {
    setIsTranslating(true);
    setResults(null);
    setFiles(null);

    try {
      const { results: translationResults, files: generatedFiles } = await runAutoTranslation();
      setResults(translationResults);
      setFiles(generatedFiles);

      if (translationResults.errors.length === 0) {
        toast.success('¡Traducción completada exitosamente!', {
          description: 'Descarga los archivos usando los botones de abajo',
        });
      } else {
        toast.warning('Traducción completada con algunos errores', {
          description: 'Revisa la consola para más detalles',
        });
      }
    } catch (error: any) {
      console.error('Error en auto-traducción:', error);
      toast.error('Error durante la traducción', {
        description: error.message,
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Archivo ${filename} descargado`);
  };

  const copyToClipboard = async (content: string, filename: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success(`Contenido de ${filename} copiado al portapapeles`);
    } catch (error) {
      toast.error('Error al copiar al portapapeles');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-950 dark:via-blue-950/20 dark:to-purple-950/20 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-white/60 dark:border-gray-800/50 p-6 mb-6 shadow-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Languages className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Auto-Traducción con GPT-4
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Traduce automáticamente desde Español a Inglés y Portugués
              </p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200 font-semibold">
              ℹ️ Cómo funciona
            </p>
            <ul className="text-xs text-blue-700 dark:text-blue-300 mt-2 space-y-1 list-disc list-inside">
              <li>Usa el archivo <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">es.ts</code> como base</li>
              <li>GPT-4 traduce manteniendo la estructura exacta</li>
              <li>Genera archivos <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">en.ts</code> y <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">pt.ts</code></li>
              <li>Descarga los archivos y reemplázalos en <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">/i18n/locales/</code></li>
            </ul>
          </div>

          <button
            onClick={handleTranslate}
            disabled={isTranslating}
            className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
          >
            {isTranslating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Traduciendo con GPT-4...
              </>
            ) : (
              <>
                <Languages className="w-5 h-5" />
                Iniciar Traducción Automática
              </>
            )}
          </button>
        </div>

        {/* Results */}
        {results && (
          <div className="space-y-4">
            {/* Status */}
            <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-white/60 dark:border-gray-800/50 p-6 shadow-xl">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                📊 Resultados
              </h2>
              
              <div className="space-y-3">
                {/* English */}
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🇬🇧</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      English
                    </span>
                  </div>
                  {results.en ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>

                {/* Portuguese */}
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🇧🇷</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      Português (Brasil)
                    </span>
                  </div>
                  {results.pt ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>

              {results.errors.length > 0 && (
                <div className="mt-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-3 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-200 font-semibold">
                    ⚠️ Errores encontrados:
                  </p>
                  <ul className="text-xs text-red-700 dark:text-red-300 mt-2 space-y-1">
                    {results.errors.map((err: string, i: number) => (
                      <li key={i}>• {err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Download Buttons */}
            {files && (
              <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-white/60 dark:border-gray-800/50 p-6 shadow-xl">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  💾 Descargar Archivos
                </h2>

                <div className="space-y-3">
                  {/* English File */}
                  {files.en && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🇬🇧</span>
                          <code className="text-sm font-mono text-gray-900 dark:text-white">
                            en.ts
                          </code>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {(files.en.length / 1024).toFixed(1)} KB
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => downloadFile(files.en, 'en.ts')}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Descargar
                        </button>
                        <button
                          onClick={() => copyToClipboard(files.en, 'en.ts')}
                          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                          📋 Copiar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Portuguese File */}
                  {files.pt && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🇧🇷</span>
                          <code className="text-sm font-mono text-gray-900 dark:text-white">
                            pt.ts
                          </code>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {(files.pt.length / 1024).toFixed(1)} KB
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => downloadFile(files.pt, 'pt.ts')}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Descargar
                        </button>
                        <button
                          onClick={() => copyToClipboard(files.pt, 'pt.ts')}
                          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                          📋 Copiar
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 p-3 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-200 font-semibold">
                    ✅ Próximos pasos:
                  </p>
                  <ol className="text-xs text-green-700 dark:text-green-300 mt-2 space-y-1 list-decimal list-inside">
                    <li>Descarga los archivos <code className="bg-green-100 dark:bg-green-800 px-1 rounded">en.ts</code> y <code className="bg-green-100 dark:bg-green-800 px-1 rounded">pt.ts</code></li>
                    <li>Reemplázalos en la carpeta <code className="bg-green-100 dark:bg-green-800 px-1 rounded">/i18n/locales/</code></li>
                    <li>Revisa las traducciones críticas (títulos, botones, errores)</li>
                    <li>Prueba cambiando el idioma en la app</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info */}
        <div className="mt-6 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-white/60 dark:border-gray-800/50 p-6 shadow-xl">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            📚 Información Técnica
          </h2>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Modelo:</span>
              <span className="font-mono text-gray-900 dark:text-white">GPT-4o</span>
            </div>
            <div className="flex justify-between">
              <span>Archivo base:</span>
              <span className="font-mono text-gray-900 dark:text-white">/i18n/locales/es.ts</span>
            </div>
            <div className="flex justify-between">
              <span>Idiomas destino:</span>
              <span className="font-mono text-gray-900 dark:text-white">en, pt</span>
            </div>
            <div className="flex justify-between">
              <span>Temperatura:</span>
              <span className="font-mono text-gray-900 dark:text-white">0.3 (determinístico)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
