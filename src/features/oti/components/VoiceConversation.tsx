/**
 * 🎙️ VOICE CONVERSATION - CONVERSACIÓN POR VOZ CON OTI
 * 
 * Interfaz conversacional avanzada estilo ChatGPT:
 * - Habla con Oti y escúchala responder
 * - Transcripción en tiempo real
 * - Orbe animado que responde a tu voz
 * - Conversación bidireccional continua
 * - Texto visible mientras hablas y Oti responde
 */

import { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Pause, Play, Settings, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner@2.0.3';
import { ttsService } from '../services/tts.service';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { 
  createConversation, 
  addMessageToConversation, 
  isUserAuthenticated 
} from '../services/conversation.service';
import type { OtiResponse } from '../types/structured-response.types'; // ✨ NUEVO: Importar tipos

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  structuredResponse?: OtiResponse; // ✨ NUEVO: Respuesta estructurada opcional
}

interface VoiceConversationProps {
  isOpen: boolean;
  onClose: () => void;
  contextData?: any;
  conversationHistory?: Array<{ role: string; content: string }>;
}

type ConversationState = 'idle' | 'listening' | 'processing' | 'speaking';

export function VoiceConversation({ 
  isOpen, 
  onClose,
  contextData,
  conversationHistory = []
}: VoiceConversationProps) {
  const [state, setState] = useState<ConversationState>('idle');
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // ✨ NUEVO: Estado de guardado
  
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const shouldAutoListenRef = useRef(false);
  const silenceTimeoutRef = useRef<any>(null);
  const stateRef = useRef<ConversationState>('idle'); // ✨ NUEVO: Ref para state
  const transcriptRef = useRef(''); // ✨ NUEVO: Ref para transcript
  const interimTranscriptRef = useRef(''); // ✨ NUEVO: Ref para interimTranscript
  
  // Sincronizar refs con state
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);
  
  useEffect(() => {
    interimTranscriptRef.current = interimTranscript;
  }, [interimTranscript]);

  // Inicializar Speech Recognition
  useEffect(() => {
    if (!isOpen) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Tu navegador no soporta reconocimiento de voz.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = false; // ✨ CAMBIO: Ahora es false para que se detenga automáticamente
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
        console.log('🎤 [VoiceConversation] Final transcript:', final);
        setTranscript(prev => (prev + ' ' + final).trim());
        setInterimTranscript('');
      }
    };

    recognition.onerror = (event: any) => {
      console.log('🎤 [VoiceConversation] Error:', event.error);
      
      // ✨ NUEVO: 'aborted' no es un error real, solo indica que se detuvo manualmente
      if (event.error === 'aborted') {
        console.log('🎤 [VoiceConversation] Recognition was aborted (not an error)');
        return;
      }
      
      if (event.error === 'no-speech') {
        // ✨ NUEVO: Si no hay habla, enviar lo que tengamos usando refs
        const currentText = transcriptRef.current.trim();
        if (currentText) {
          sendMessage(currentText);
        } else {
          setState('idle');
          toast.info('No se detectó audio. Intenta de nuevo.');
        }
        return;
      }
      
      if (event.error === 'not-allowed' || event.error === 'audio-capture') {
        setError('Permiso de micrófono denegado. Por favor habilita el micrófono.');
        setState('idle');
        return;
      }
      
      if (event.error === 'network') {
        setError('Error de red. Verifica tu conexión.');
        setState('idle');
        return;
      }
    };

    recognition.onend = () => {
      console.log('🎤 [VoiceConversation] Recognition ended');
      
      // ✨ ARREGLADO: Usar refs en lugar de state para tener valores actuales
      const currentText = (transcriptRef.current + ' ' + interimTranscriptRef.current).trim();
      const currentState = stateRef.current;
      
      console.log('🎤 [VoiceConversation] Current text on end:', currentText);
      console.log('🎤 [VoiceConversation] Current state on end:', currentState);
      
      if (currentText && currentState === 'listening') {
        console.log('🎤 [VoiceConversation] Auto-sending message on end:', currentText);
        sendMessage(currentText);
      } else if (shouldAutoListenRef.current && currentState === 'idle' && !isPaused) {
        // Si deberíamos seguir escuchando y estamos en idle, reiniciar
        setTimeout(() => {
          if (shouldAutoListenRef.current) {
            startListening();
          }
        }, 500);
      }
    };

    recognitionRef.current = recognition;

    // Cleanup
    return () => {
      console.log('🧹 [VoiceConversation] Cleaning up speech recognition...');
      if (recognitionRef.current) {
        try {
          // ✅ FIX CRÍTICO: Primero abort, luego stop para liberar micrófono
          recognitionRef.current.abort();
          recognitionRef.current.stop();
          recognitionRef.current = null; // ✅ Limpiar referencia
          console.log('✅ [VoiceConversation] Speech recognition cleaned up');
        } catch (e) {
          console.log('⚠️ Cleanup error (expected):', e);
        }
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
      // ✅ FIX: Detener TTS también
      ttsService.stop();
      console.log('✅ [VoiceConversation] Cleanup complete');
    };
  }, [isOpen]); // ✨ ARREGLADO: Solo depende de isOpen, no de state ni isPaused

  // Auto-scroll a mensajes nuevos
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Reset al abrir
  useEffect(() => {
    if (isOpen) {
      setMessages([]);
      setTranscript('');
      setInterimTranscript('');
      setState('idle');
      setError('');
      setIsPaused(false);
      shouldAutoListenRef.current = false;
      
      // Mensaje de bienvenida
      setTimeout(() => {
        const welcomeMessage: Message = {
          role: 'assistant',
          content: 'Hola, soy Oti. Toca el micrófono y háblame sobre tus finanzas.',
          timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
        
        // Reproducir mensaje de bienvenida si no está silenciado
        if (!isMuted) {
          ttsService.speak(welcomeMessage.content);
        }
      }, 300);
    } else {
      // Limpiar al cerrar
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log('Error stopping on close:', e);
        }
      }
      ttsService.stop();
      shouldAutoListenRef.current = false;
    }
  }, [isOpen, isMuted]);

  const startListening = () => {
    // ✨ NUEVO: Si Oti está hablando, interrumpirla primero
    if (state === 'speaking') {
      console.log('🛑 [VoiceConversation] Interrupting Oti to listen to user...');
      ttsService.stop();
      setState('idle'); // Cambiar a idle temporalmente para permitir listening
    }
    
    if (!recognitionRef.current || (state !== 'idle' && state !== 'speaking')) return;

    setError('');
    setTranscript('');
    setInterimTranscript('');
    shouldAutoListenRef.current = true;
    
    try {
      recognitionRef.current.start();
      setState('listening');
      console.log('🎤 [VoiceConversation] Started listening');
    } catch (err) {
      console.error('🎤 [VoiceConversation] Failed to start:', err);
      setError('No se pudo iniciar el reconocimiento.');
      shouldAutoListenRef.current = false;
    }
  };

  const stopListening = () => {
    shouldAutoListenRef.current = false;
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log('Error stopping:', e);
      }
    }

    // Si hay transcripción, enviarla
    const finalTranscript = (transcript + ' ' + interimTranscript).trim();
    if (finalTranscript) {
      sendMessage(finalTranscript);
    }
    
    setState('idle');
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    console.log('🎤 [VoiceConversation] Sending message:', text);

    // Agregar mensaje del usuario
    const userMessage: Message = {
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    
    // Limpiar transcripción
    setTranscript('');
    setInterimTranscript('');
    
    setState('processing');

    try {
      // Preparar historial completo
      const fullHistory = [
        ...conversationHistory,
        ...messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        {
          role: 'user',
          content: text,
        }
      ];

      console.log('🎤 [VoiceConversation] Calling Oti with history:', fullHistory);
      
      // Llamar a Oti
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3/oti-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            message: text,
            history: fullHistory,
            contextData,
            requestStructured: true, // ✨ ARREGLADO: Ahora sí solicita respuestas estructuradas como en chat de texto
          }),
        }
      );

      console.log('🎤 [VoiceConversation] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🎤 [VoiceConversation] Error response:', errorText);
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('🎤 [VoiceConversation] Response data:', data);
      console.log('🎤 [VoiceConversation] Has structuredResponse?', !!data.structuredResponse);
      console.log('🎤 [VoiceConversation] Response type:', typeof data.response);
      
      // ✨ NUEVO: Extraer texto limpio de respuesta estructurada para TTS
      let textForDisplay = '';
      let textForTTS = '';
      
      if (data.structuredResponse) {
        console.log('📊 [VoiceConversation] Structured response detected, extracting clean text...');
        const structured = data.structuredResponse as OtiResponse;
        
        // Construir texto limpio para lectura de voz
        const cleanTextParts: string[] = [];
        
        // 1. Agregar resumen
        if (structured.summary) {
          cleanTextParts.push(structured.summary);
        }
        
        // 2. Agregar contenido de cada sección
        if (structured.sections && structured.sections.length > 0) {
          structured.sections.forEach(section => {
            // Agregar título de sección si existe
            if (section.title) {
              cleanTextParts.push(`\n${section.title}.`);
            }
            
            // Agregar contenido de sección si existe
            if (section.content) {
              cleanTextParts.push(section.content);
            }
            
            // Agregar items de la sección si existen
            if (section.items && section.items.length > 0) {
              section.items.forEach(item => {
                cleanTextParts.push(item);
              });
            }
          });
        }
        
        // Unir todo el texto
        textForDisplay = cleanTextParts.join('\n\n');
        textForTTS = cleanTextParts.join('. '); // Para TTS usar puntos en lugar de saltos de línea
        
        console.log('✅ [VoiceConversation] Clean text extracted for TTS:', textForTTS.substring(0, 150) + '...');
      } else {
        // ✨ Fallback: usar data.response solo si NO hay structuredResponse
        console.log('📝 [VoiceConversation] No structured response, using plain text');
        textForDisplay = data.response;
        textForTTS = data.response;
      }
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: textForDisplay, // ✨ ARREGLADO: Usar texto limpio en lugar de JSON
        timestamp: new Date(),
        structuredResponse: data.structuredResponse, // ✨ NUEVO: Guardar respuesta estructurada
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Reproducir respuesta de Oti si no está silenciado
      setState('speaking');
      
      if (!isMuted) {
        console.log('🔊 [VoiceConversation] Speaking response...');
        await ttsService.speak(textForTTS);
      }
      
      // Después de hablar, volver a escuchar automáticamente si no está pausado
      console.log('✅ [VoiceConversation] Response complete, returning to idle');
      setState('idle');
      
      if (!isPaused && shouldAutoListenRef.current) {
        console.log('🎤 [VoiceConversation] Auto-restarting listening...');
        setTimeout(() => {
          startListening();
        }, 500);
      }
      
    } catch (error: any) {
      console.error('❌ [VoiceConversation] Error:', error);
      console.error('❌ [VoiceConversation] Error details:', error.message, error.stack);
      
      const errorMsg = error.message || 'Error desconocido';
      setError(`Error: ${errorMsg}`);
      setState('idle');
      toast.error('Error al comunicarse con Oti');
      
      // Mostrar error en la conversación también
      const errorMessage: Message = {
        role: 'assistant',
        content: `Lo siento, tuve un error al procesar tu mensaje: ${errorMsg}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleClose = async () => {
    console.log('🔴 [VoiceConversation] Closing and cleaning up...');
    
    // ✅ FIX CRÍTICO: Detener auto-listen primero
    shouldAutoListenRef.current = false;
    
    // ✅ FIX CRÍTICO: Detener y liberar reconocimiento de voz COMPLETAMENTE
    if (recognitionRef.current) {
      try {
        // Primero abort para cancelar inmediatamente
        recognitionRef.current.abort();
        // Luego stop para liberar recursos
        recognitionRef.current.stop();
        // Limpiar referencia
        recognitionRef.current = null;
        console.log('✅ [VoiceConversation] Speech recognition stopped and released');
      } catch (e) {
        console.log('⚠️ Error on close (may be expected):', e);
      }
    }
    
    // ✅ FIX: Detener TTS
    ttsService.stop();
    
    // ✅ Resetear estado
    setState('idle');
    setTranscript('');
    setInterimTranscript('');
    
    console.log('✅ [VoiceConversation] All audio services stopped');
    
    // ✨ NUEVO: Guardar conversación si hay mensajes y el usuario está autenticado
    if (messages.length > 1 && isUserAuthenticated()) { // > 1 porque el mensaje de bienvenida no cuenta
      try {
        console.log('💾 [VoiceConversation] Guardando conversación...');
        
        // Filtrar el mensaje de bienvenida
        const realMessages = messages.filter(m => 
          m.content !== 'Hola, soy Oti. Toca el micrófono y háblame sobre tus finanzas.'
        );
        
        if (realMessages.length === 0) {
          console.log('ℹ️ No hay mensajes reales para guardar');
          onClose();
          return;
        }
        
        // Obtener el primer mensaje del usuario para el título
        const firstUserMessage = realMessages.find(m => m.role === 'user');
        
        if (!firstUserMessage) {
          console.log('ℹ️ No hay mensaje del usuario para guardar');
          onClose();
          return;
        }
        
        // Crear la conversación con el primer mensaje
        const conversation = await createConversation({
          initialMessage: firstUserMessage.content,
        });
        
        console.log('✅ Conversación creada:', conversation.id);
        
        // Agregar los mensajes restantes uno por uno
        for (let i = 1; i < realMessages.length; i++) {
          const msg = realMessages[i];
          await addMessageToConversation(conversation.id, {
            role: msg.role,
            content: msg.content,
          });
        }
        
        console.log('✅ [VoiceConversation] Conversación guardada exitosamente');
        toast.success('Conversación guardada', {
          description: 'Puedes verla en tu historial de chats'
        });
        
      } catch (error: any) {
        console.error('❌ [VoiceConversation] Error al guardar conversación:', error);
        // No mostrar error al usuario, solo log
        console.log('ℹ️ La conversación no se guardó, pero esto no interrumpe el flujo');
      }
    } else {
      console.log('ℹ️ [VoiceConversation] No se guardó conversación (sin mensajes o sin autenticar)');
    }
    
    console.log('🔴 [VoiceConversation] Calling onClose()...');
    onClose();
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    
    if (!isPaused) {
      // Pausar: detener escucha y voz
      shouldAutoListenRef.current = false;
      if (recognitionRef.current && state === 'listening') {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log('Error pausing:', e);
        }
      }
      ttsService.stop();
      setState('idle');
      toast.info('Conversación pausada');
    } else {
      // Reanudar: volver a escuchar
      shouldAutoListenRef.current = true;
      if (state === 'idle') {
        startListening();
      }
      toast.info('Conversación reanudada');
    }
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    
    if (newMuted) {
      ttsService.stop();
      toast.info('Audio silenciado');
    } else {
      toast.info('Audio activado');
    }
  };

  if (!isOpen) return null;

  const currentText = (transcript + ' ' + interimTranscript).trim();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        {/* Header con controles superiores */}
        <div className="absolute top-0 left-0 right-0 safe-area-top px-4 py-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              state === 'listening' ? 'bg-red-500 animate-pulse' :
              state === 'processing' ? 'bg-yellow-500 animate-pulse' :
              state === 'speaking' ? 'bg-blue-500 animate-pulse' :
              'bg-green-500'
            }`} />
            <p className="text-white/80 text-sm">
              {state === 'listening' ? 'Escuchando...' :
               state === 'processing' ? 'Procesando...' :
               state === 'speaking' ? 'Oti hablando...' :
               'Lista para hablar'}
            </p>
          </div>
        </div>

        {/* Mensajes de conversación */}
        <div className="flex-1 overflow-y-auto px-6 pt-16 pb-32">
          <div className="max-w-2xl mx-auto space-y-4">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-800 text-white border border-gray-700'
                }`}>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className="text-xs mt-1 opacity-60">
                    {message.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* Mensaje actual siendo transcrito */}
            {currentText && state === 'listening' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-end"
              >
                <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-emerald-600/50 text-white border border-emerald-500/50">
                  <p className="text-sm leading-relaxed">{currentText}</p>
                  <p className="text-xs mt-1 opacity-60">Transcribiendo...</p>
                </div>
              </motion.div>
            )}

            {/* Indicador de procesamiento */}
            {state === 'processing' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-gray-800 text-white border border-gray-700 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <p className="text-sm">Oti está pensando...</p>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Orbe central animado */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            animate={{
              scale: state === 'listening' ? [1, 1.1, 1] : state === 'speaking' ? [1, 1.15, 1] : 1,
              opacity: messages.length > 0 ? 0.3 : 1,
            }}
            transition={{
              scale: {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              },
              opacity: {
                duration: 0.3,
              }
            }}
            className="relative"
          >
            {/* Orbe principal con gradiente */}
            <div className="w-64 h-64 rounded-full bg-gradient-to-br from-blue-200 via-blue-400 to-blue-600 blur-2xl opacity-80" />
            
            {/* Ondas expansivas cuando está activo */}
            {(state === 'listening' || state === 'speaking') && (
              <>
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-blue-400"
                  animate={{
                    scale: [1, 1.5],
                    opacity: [0.8, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-blue-300"
                  animate={{
                    scale: [1, 1.8],
                    opacity: [0.6, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut",
                    delay: 0.5,
                  }}
                />
              </>
            )}
          </motion.div>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-32 left-4 right-4 max-w-md mx-auto"
          >
            <div className="bg-red-500/20 border border-red-500 rounded-xl px-4 py-3 backdrop-blur-xl">
              <p className="text-red-200 text-sm text-center">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Botones de control inferiores */}
        <div className="absolute bottom-0 left-0 right-0 safe-area-bottom pb-8 pt-4">
          <div className="flex items-center justify-center gap-6">
            {/* Botón de silencio */}
            <button
              onClick={toggleMute}
              className="w-14 h-14 rounded-full bg-gray-800 hover:bg-gray-700 text-white flex items-center justify-center transition-all active:scale-95 border border-gray-700"
            >
              {isMuted ? (
                <VolumeX className="w-6 h-6" />
              ) : (
                <Volume2 className="w-6 h-6" />
              )}
            </button>

            {/* Botón principal de micrófono */}
            <button
              onClick={state === 'listening' ? stopListening : startListening}
              disabled={state === 'processing'}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-2xl ${
                state === 'listening'
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : state === 'idle' || state === 'speaking'
                  ? 'bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700'
                  : 'bg-gray-700 cursor-not-allowed'
              }`}
            >
              {state === 'processing' ? (
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              ) : state === 'listening' ? (
                <Mic className="w-8 h-8 text-white" />
              ) : (
                <MicOff className="w-8 h-8 text-white" />
              )}
            </button>

            {/* Botón de pausa/reanudar */}
            <button
              onClick={togglePause}
              className="w-14 h-14 rounded-full bg-gray-800 hover:bg-gray-700 text-white flex items-center justify-center transition-all active:scale-95 border border-gray-700"
            >
              {isPaused ? (
                <Play className="w-6 h-6" />
              ) : (
                <Pause className="w-6 h-6" />
              )}
            </button>

            {/* Botón de cerrar */}
            <button
              onClick={handleClose}
              className="w-14 h-14 rounded-full bg-gray-800 hover:bg-gray-700 text-white flex items-center justify-center transition-all active:scale-95 border border-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Hint */}
          <p className="text-center text-white/50 text-xs mt-4">
            {state === 'idle' 
              ? 'Toca el micrófono para comenzar a hablar' 
              : state === 'listening'
              ? 'Habla naturalmente, estoy escuchando...'
              : state === 'processing'
              ? 'Procesando tu mensaje...'
              : 'Puedes interrumpirme tocando el micrófono...'}
          </p>
        </div>
      </div>
    </AnimatePresence>
  );
}