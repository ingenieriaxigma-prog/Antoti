import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Loader2, Keyboard } from 'lucide-react';
import { Account, Category } from '../types';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface VoiceRecognitionProps {
  accounts: Account[];
  categories: Category[];
  onVoiceCommand: (command: VoiceCommand) => void;
  onClose: () => void;
}

export interface VoiceCommand {
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  category?: string;
  subcategory?: string;
  account?: string;
  toAccount?: string;
  note?: string;
}

export default function VoiceRecognition({ 
  accounts, 
  categories, 
  onVoiceCommand,
  onClose 
}: VoiceRecognitionProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState('');
  const [textInput, setTextInput] = useState('');
  const [useTextInput, setUseTextInput] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'prompt' | 'checking'>('checking');
  const recognitionRef = useRef<any>(null);

  // ✅ DEBUG: Log accounts and categories on mount
  useEffect(() => {
    console.log('🎤 VoiceRecognition mounted with:');
    console.log('   - Accounts:', accounts?.length || 0, accounts);
    console.log('   - Categories:', categories?.length || 0, categories);
  }, []);

  // ✅ Check microphone permissions on mount
  useEffect(() => {
    const checkMicPermissions = async () => {
      try {
        // Try to check permission status if supported
        if (navigator.permissions && navigator.permissions.query) {
          const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          console.log('🎤 Microphone permission status:', result.state);
          setMicPermission(result.state as 'granted' | 'denied' | 'prompt');
          
          // If denied, auto-switch to text input
          if (result.state === 'denied') {
            setUseTextInput(true);
          }
        } else {
          // Browser doesn't support permissions API, assume prompt
          setMicPermission('prompt');
        }
      } catch (err) {
        console.log('🎤 Could not check microphone permissions:', err);
        setMicPermission('prompt');
      }
    };
    
    checkMicPermissions();
  }, []);

  // ✅ FIX CRÍTICO: Cleanup cuando el componente se desmonta
  useEffect(() => {
    return () => {
      console.log('🎤 VoiceRecognition unmounting - stopping microphone');
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          recognitionRef.current.abort();
          recognitionRef.current = null;
        } catch (e) {
          console.log('Cleanup error (safe to ignore):', e);
        }
      }
    };
  }, []);

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Tu navegador no soporta reconocimiento de voz.');
      setUseTextInput(true); // Auto switch to text input
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      setInterimTranscript(interim);
      if (final) {
        setTranscript(final);
        // ✅ Detener micrófono inmediatamente después de obtener resultado
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch (e) {
            console.log('Stop error after final result:', e);
          }
        }
        setIsListening(false);
        processVoiceCommand(final);
      }
    };

    recognition.onerror = (event: any) => {
      console.log('Speech recognition error:', event.error);
      
      setIsListening(false);
      
      // ✅ SIEMPRE detener el micrófono en caso de error
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log('Stop error in onerror:', e);
        }
      }
      
      // For permission errors, silently switch to text input
      if (event.error === 'not-allowed' || event.error === 'audio-capture') {
        setUseTextInput(true);
        // Don't show error - just switch modes
        return;
      }
      
      // For other errors, show a message but don't block the UI
      if (event.error === 'no-speech') {
        setError('No se detectó audio. Intenta de nuevo.');
      } else if (event.error === 'network') {
        setUseTextInput(true);
      }
    };

    recognition.onend = () => {
      console.log('🎤 Speech recognition ended');
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    // ✅ Cleanup mejorado
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          recognitionRef.current.abort();
        } catch (e) {
          console.log('Cleanup error in recognition setup:', e);
        }
      }
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setInterimTranscript('');
      setError('');
      
      // Try to start recognition directly - let browser handle permission prompt
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start recognition:', err);
        setError('No se pudo iniciar el reconocimiento. Usa la opción de texto.');
        setUseTextInput(true);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleTryAgain = () => {
    setError('');
    setTranscript('');
    setInterimTranscript('');
    setIsProcessing(false);
    // Automatically start listening again
    startListening();
  };

  // ✅ FIX: Detener micrófono antes de cerrar
  const handleClose = () => {
    console.log('🎤 Closing VoiceRecognition - ensuring microphone is stopped');
    
    // Stop listening if active
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      } catch (e) {
        console.log('Error stopping on close:', e);
      }
    }
    
    setIsListening(false);
    onClose();
  };

  const processVoiceCommand = async (text: string) => {
    setIsProcessing(true);
    setError('');
    
    try {
      console.log('🎤 Processing voice command with AI:', text);
      
      // ✅ FIX: Validate accounts and categories before sending
      if (!accounts || !Array.isArray(accounts) || accounts.length === 0) {
        console.error('❌ No accounts available');
        setError('No hay cuentas disponibles. Por favor crea una cuenta primero.');
        setIsProcessing(false);
        return;
      }

      if (!categories || !Array.isArray(categories) || categories.length === 0) {
        console.error('❌ No categories available');
        setError('No hay categorías disponibles. Por favor espera a que carguen las categorías.');
        setIsProcessing(false);
        return;
      }

      console.log(`📊 Sending to backend: ${accounts.length} accounts, ${categories.length} categories`);
      
      // Call the AI endpoint to parse the command
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3/parse-voice-command`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            text,
            accounts,
            categories,
          }),
          signal: controller.signal,
        }
      );
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error parsing voice command:', errorData);
        setError(errorData.error || 'No pude procesar el comando. Intenta de nuevo.');
        setIsProcessing(false);
        return;
      }

      const data = await response.json();
      console.log('✅ Parsed command:', data.command);

      // Validate the parsed command
      const command: VoiceCommand = data.command;
      
      // ✅ FIX: Clean invalid subcategories (when subcategory ID = category ID)
      if (command.category && command.subcategory && command.category === command.subcategory) {
        console.log('🧹 [VoiceRecognition] Cleaning invalid subcategory (same as category)');
        command.subcategory = null;
      }
      
      if (!command.type || !command.amount || command.amount <= 0) {
        setError('No pude detectar un tipo o monto válido. Intenta de nuevo.');
        setIsProcessing(false);
        return;
      }

      // Call the parent callback with the parsed command
      console.log('🎤 Calling onVoiceCommand with:', command);
      onVoiceCommand(command);
      setIsProcessing(false);
    } catch (error: any) {
      console.error('❌ Error processing voice command:', error);
      
      // Handle different error types
      if (error.name === 'AbortError') {
        setError('La conexión tardó demasiado. Verifica tu internet e intenta de nuevo.');
      } else if (error.message && error.message.includes('fetch')) {
        setError('Sin conexión a internet. Verifica tu red e intenta de nuevo.');
      } else if (error.message && error.message.includes('JSON')) {
        setError('Error al procesar la respuesta. Intenta de nuevo.');
      } else {
        setError('Error al procesar el comando. Verifica tu conexión.');
      }
      
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-gray-900 dark:text-white">Comando de Voz</h3>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col items-center gap-6">
          {!useTextInput ? (
            <>
              {/* Microphone Button */}
              <button
                onClick={isListening ? stopListening : startListening}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                  isListening
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="w-12 h-12 text-white animate-spin" />
                ) : isListening ? (
                  <Mic className="w-12 h-12 text-white" />
                ) : (
                  <MicOff className="w-12 h-12 text-white" />
                )}
              </button>

              {/* Status */}
              <div className="text-center">
                {isProcessing ? (
                  <p className="text-gray-900 dark:text-white">Procesando con IA...</p>
                ) : isListening ? (
                  <p className="text-gray-900 dark:text-white">Escuchando...</p>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">Toca el micrófono para hablar</p>
                )}
              </div>

              {/* Transcript */}
              {(transcript || interimTranscript) && (
                <div className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Texto reconocido:</p>
                  <p className="text-gray-900 dark:text-white">
                    {transcript || interimTranscript}
                  </p>
                </div>
              )}

              {/* Try Again Button - Shows when there's an error */}
              {error && transcript && (
                <button
                  onClick={handleTryAgain}
                  className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-semibold"
                >
                  <Mic className="w-5 h-5" />
                  Grabar de Nuevo
                </button>
              )}

              {/* Switch to Text Input */}
              <button
                onClick={() => setUseTextInput(true)}
                className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                <Keyboard className="w-4 h-4" />
                Escribir comando en su lugar
              </button>

              {/* Voice Examples Hint */}
              <div className="w-full p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-left">
                <p className="text-xs text-blue-900 dark:text-blue-300 font-semibold mb-1">
                  💡 Ejemplos de comandos:
                </p>
                <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-0.5">
                  <li>• "Gasté 50 mil en transporte"</li>
                  <li>• "Compré un café por 5000"</li>
                  <li>• "Recibí 2 millones de salario"</li>
                </ul>
              </div>
            </>
          ) : (
            <>
              {/* Text Input */}
              <div className="w-full space-y-4">
                {/* Info message when auto-switched */}
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                    🎤 El micrófono no está disponible
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-400 mb-2">
                    Puedes escribir tu comando aquí, o habilitar el micrófono siguiendo estos pasos:
                  </p>
                  <ol className="text-xs text-blue-700 dark:text-blue-400 space-y-1 list-decimal list-inside">
                    <li>Busca el ícono 🔒 o 🎤 en la barra de dirección</li>
                    <li>Haz clic y permite el acceso al micrófono</li>
                    <li>Recarga la página e intenta de nuevo</li>
                  </ol>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Escribe tu comando:
                  </label>
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Ej: Gasté 50 mil en transporte"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    autoFocus
                  />
                </div>
                
                <button
                  onClick={() => {
                    if (textInput.trim()) {
                      processVoiceCommand(textInput);
                    }
                  }}
                  disabled={!textInput.trim() || isProcessing}
                  className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Procesando con IA...
                    </>
                  ) : (
                    'Procesar Comando'
                  )}
                </button>

                {/* Try Again Button for Text Mode */}
                {error && textInput && (
                  <button
                    onClick={() => {
                      setError('');
                      setIsProcessing(false);
                      // Focus back on textarea
                    }}
                    className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-semibold"
                  >
                    <Keyboard className="w-5 h-5" />
                    Editar y Reintentar
                  </button>
                )}
              </div>

              {/* Switch back to Voice */}
              <button
                onClick={() => setUseTextInput(false)}
                className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                <Mic className="w-4 h-4" />
                Usar voz en su lugar
              </button>
            </>
          )}

          {/* Instructions */}
          <div className="w-full p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-300 mb-2">✨ Ejemplos con IA:</p>
            <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
              <li>• "Me pagaron 2 millones de salario"</li>
              <li>• "Compré pan por 150 mil"</li>
              <li>• "Gasté medio millón en supermercado"</li>
              <li>• "Transferí 100 mil de banco a efectivo"</li>
              <li>• "Recibí dos millones y medio"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}