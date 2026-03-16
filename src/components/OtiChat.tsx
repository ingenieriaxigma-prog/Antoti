import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Sparkles, MessageSquare, TrendingUp, Target, Receipt, Loader2, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { OtiAvatar } from './branding/OtiAvatar';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ✨ NUEVO: Contexto financiero del usuario
interface FinancialContext {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  topCategories: Array<{ name: string; amount: number }>;
}

// ✨ NUEVO: Estados de Oti para indicador visual
type OtiStatus = 'online' | 'thinking' | 'typing';

interface OtiChatProps {
  onNavigate: (screen: string) => void;
}

export default function OtiChat({ onNavigate }: OtiChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hola, soy Oti 👋 Tu asistente personal de finanzas. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otiStatus, setOtiStatus] = useState<OtiStatus>('online');
  const [financialContext, setFinancialContext] = useState<FinancialContext | null>(null); // ✨ NUEVO: Contexto financiero
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
    '¿Cómo puedo ahorrar más dinero?',
    '¿Qué es un presupuesto y cómo crearlo?',
    '¿Cómo uso la app para registrar gastos?',
    'Dame consejos para reducir deudas',
  ]); // ✨ NUEVO: Preguntas dinámicas
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ✨ NUEVO: Cargar contexto financiero al montar el componente
  useEffect(() => {
    loadFinancialContext();
    loadConversationHistory(); // ✨ NUEVO: Cargar historial
  }, []);

  // ✨ NUEVO: Guardar historial cada vez que cambian los mensajes
  useEffect(() => {
    if (messages.length > 1) { // Solo guardar si hay más que el mensaje inicial
      saveConversationHistory();
    }
  }, [messages]);

  const loadFinancialContext = async () => {
    try {
      // ✨ ARREGLADO: Usar 'accessToken' en lugar de 'supabase_access_token'
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        console.log('ℹ️ No access token found - using default questions');
        return;
      }

      console.log('🔑 Access token found, loading financial context...');

      // TODO: Cargar contexto financiero real desde el backend
      // const context = await fetchFinancialContext(accessToken);
      
      // Por ahora usamos preguntas por defecto
      console.log('ℹ️ Financial context loading not yet implemented');
    } catch (error) {
      console.error('❌ Error loading financial context:', error);
      // Continuar sin contexto
    }
  };

  // ✨ NUEVO: Cargar historial de conversación desde localStorage
  const loadConversationHistory = () => {
    try {
      const savedMessages = localStorage.getItem('oti_conversation_history');
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        // Convertir timestamps de string a Date
        const messagesWithDates = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDates);
        console.log('✅ Conversation history loaded:', messagesWithDates.length, 'messages');
      }
    } catch (error) {
      console.error('❌ Error loading conversation history:', error);
    }
  };

  // ✨ NUEVO: Guardar historial de conversación en localStorage
  const saveConversationHistory = () => {
    try {
      localStorage.setItem('oti_conversation_history', JSON.stringify(messages));
    } catch (error) {
      console.error('❌ Error saving conversation history:', error);
    }
  };

  // ✨ NUEVO: Iniciar nueva conversación
  const handleNewConversation = () => {
    const initialMessage: Message = {
      id: '1',
      role: 'assistant',
      content: 'Hola, soy Oti 👋 Tu asistente personal de finanzas. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date(),
    };
    setMessages([initialMessage]);
    localStorage.removeItem('oti_conversation_history');
    toast.success('Nueva conversación iniciada');
    console.log('🔄 Nueva conversación iniciada');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(), // Generate UUID v4
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setOtiStatus('thinking'); // ✨ NUEVO: Oti está pensando

    try {
      // ✨ NUEVO: Simular "typing" después de 500ms
      setTimeout(() => setOtiStatus('typing'), 500);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3/oti-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            message: userMessage.content,
            history: messages.map(m => ({
              role: m.role,
              content: m.content,
            })),
            contextData: financialContext, // ✨ NUEVO: Enviar contexto financiero
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al comunicarse con Oti');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setOtiStatus('online'); // ✨ NUEVO: Volver a online
    } catch (error) {
      console.error('Error sending message to Oti:', error);
      toast.error('No pude conectarme con Oti. Intenta de nuevo.');
      setOtiStatus('online'); // ✨ NUEVO: Volver a online en error
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  // ✨ NUEVO: Función helper para obtener texto de estado
  const getStatusText = () => {
    switch (otiStatus) {
      case 'thinking':
        return 'Pensando...';
      case 'typing':
        return 'Escribiendo...';
      default:
        return 'En línea';
    }
  };

  // ✨ NUEVO: Función helper para obtener color de estado
  const getStatusColor = () => {
    switch (otiStatus) {
      case 'thinking':
        return 'bg-yellow-400';
      case 'typing':
        return 'bg-blue-400';
      default:
        return 'bg-green-400';
    }
  };

  // ✨ NUEVO: Iconos para preguntas sugeridas
  const suggestionIcons = [MessageSquare, Target, TrendingUp, Receipt];

  return (
    <div className="flex flex-col mobile-screen-height bg-gray-50 dark:bg-gray-950 prevent-overscroll" data-tour="oti-chat-screen">
      {/* ✨ MEJORADO: Header con estado animado */}
      <div className="fixed-top-header bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-4 shadow-lg safe-area-top">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-3 flex-1">
            {/* ✨ MEJORADO: Avatar con animación de pulso cuando está activo */}
            <div className="relative">
              <div className={`w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center ${
                otiStatus !== 'online' ? 'animate-pulse' : ''
              }`}>
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              {/* ✨ NUEVO: Indicador de estado (bolita verde/amarilla/azul) */}
              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusColor()} rounded-full border-2 border-white ${
                otiStatus !== 'online' ? 'animate-pulse' : ''
              }`} />
            </div>
            <div>
              <h1 className="text-white">Oti</h1>
              {/* ✨ MEJORADO: Estado dinámico en el subtítulo */}
              <p className="text-xs text-white/80">{getStatusText()}</p>
            </div>
          </div>
          {/* ✨ NUEVO: Botón de nueva conversación */}
          {messages.length > 1 && (
            <button
              onClick={handleNewConversation}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Nueva conversación"
            >
              <RotateCcw className="w-5 h-5 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Messages - Scrollable con padding para header fijo (sin bottom nav) */}
      <div className="flex-1 overflow-y-auto top-header-spacing momentum-scroll px-4 py-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            {/* ✨ MEJORADO: Avatar para mensajes de Oti */}
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center mr-2 flex-shrink-0 shadow-md">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                  : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
              <p
                className={`text-xs mt-1.5 ${
                  message.role === 'user' ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {formatTime(message.timestamp)}
              </p>
            </div>
            {/* ✨ NUEVO: Avatar pequeño para mensajes del usuario */}
            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center ml-2 flex-shrink-0 shadow-md text-white text-xs font-bold">
                Tú
              </div>
            )}
          </div>
        ))}

        {/* ✨ MEJORADO: Indicador de carga con animación */}
        {isLoading && (
          <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center mr-2 flex-shrink-0 shadow-md">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                  {otiStatus === 'thinking' ? 'Pensando...' : 'Escribiendo...'}
                </p>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ✨ MEJORADO: Tarjetas visuales premium para preguntas sugeridas */}
      {messages.length === 1 && (
        <div className="flex-shrink-0 px-4 pb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">
            💡 Pregúntame sobre:
          </p>
          <div className="grid grid-cols-2 gap-3">
            {suggestedQuestions.map((question, index) => {
              const Icon = suggestionIcons[index];
              return (
                <button
                  key={index}
                  onClick={() => setInput(question)}
                  className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-lg transition-all duration-200 text-left overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-orange-500/10 to-pink-500/10 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex items-start gap-2">
                    <Icon className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                      {question}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Input - Fixed */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 py-3 safe-area-bottom">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu pregunta..."
            className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[44px] max-h-[120px] transition-all"
            rows={1}
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white h-11 w-11 rounded-xl flex-shrink-0 p-0 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}