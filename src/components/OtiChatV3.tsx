/**
 * 💬 OTICHAT V3 - CON HISTORIAL PERSISTENTE EN BASE DE DATOS
 * 
 * Fase 3 completa:
 * - Múltiples conversaciones guardadas en Supabase
 * - Panel lateral de historial
 * - Auto-generación de títulos
 * - Cambio entre conversaciones
 * - Eliminar conversaciones
 * 
 * Fase 4 completa:
 * - Respuestas estructuradas con secciones diferenciadas
 * - Diagnósticos, recomendaciones y acciones
 * - Acciones interactivas desde el chat
 * - Renderizado visual mejorado
 * 
 * Fase 5 completa (MOBILE-FIRST):
 * - Panel de Quick Actions responsive (Bottom Sheet en móvil, Modal en desktop)
 * - FAB (Floating Action Button) para móviles
 * - Atajos de teclado para desktop (Ctrl+K, Ctrl+N, Ctrl+T, etc.)
 * - 10 acciones predefinidas categorizadas
 * - Búsqueda inteligente de acciones
 * - Navegación con gestos táctiles (swipe down) y teclado
 * - Detección automática de dispositivo móvil
 * 
 * Fase 6 completa (TEXT-TO-SPEECH):
 * - Servicio TTS con Web Speech API nativa
 * - Controles de audio en cada mensaje de Oti (Play, Pause, Stop)
 * - Modal de configuración de voz con opciones avanzadas
 * - Selección de voz en español
 * - Control de velocidad, tono y volumen
 * - Limpieza automática de markdown y emojis para TTS
 * - Persistencia de preferencias en localStorage
 * - Indicadores visuales de reproducción
 * 
 * Fase 7 completa (SPEECH-TO-TEXT):
 * - Componente de entrada de voz para enviar mensajes
 * - Reconocimiento de voz en español
 * - Integración con Web Speech API para STT
 * - Indicadores visuales de grabación
 * - Control de grabación y envío de mensajes de voz
 */

import { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, Send, Sparkles, Loader2, MessageCircle, Zap, 
  TrendingUp, HelpCircle, RotateCcw, History, Trash2, Plus,
  X, Edit2, Check, Bolt, Volume2, Mic, // ✨ FASE 7: Agregar icono Mic
  DollarSign, PiggyBank, Target, Wallet, ArrowLeftRight, BarChart3, // 🆕 Iconos contextuales
  Receipt, Lightbulb, TrendingDown, Settings, Calculator // 🆕 Más iconos
} from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { getTodayLocalDate } from '../utils/dateUtils'; // ✅ Import getTodayLocalDate
import { fetchFinancialContext, generatePersonalizedQuestions, type FinancialContext } from '../features/oti/services/oti-context.service';
import {
  createConversation,
  listConversations,
  getConversation,
  deleteConversation,
  addMessageToConversation,
  updateConversationTitle,
  generateConversationTitle,
  isUserAuthenticated,
  type Conversation,
  type ConversationSummary,
} from '../features/oti/services/conversation.service';
import { StructuredMessage } from './oti/StructuredMessage';
import type { OtiResponse, OtiAction } from '../features/oti/types/structured-response.types';
import type { OtiScreenContext } from '../features/oti/types/structured-response.types';
import { isStructuredResponse, isSimpleResponse, isErrorResponse } from '../features/oti/types/structured-response.types';
import { QuickActionsPanel } from '../features/oti/components/QuickActionsPanel';
import { useIsMobile } from '../features/oti/hooks/useIsMobile';
import { AudioControls } from './oti/AudioControls';
import { TTSSettingsModal } from './oti/TTSSettings';
import { ttsService } from '../features/oti/services/tts.service';
import { VoiceConversation } from '../features/oti/components/VoiceConversation'; // ✨ FASE 7: Conversación por voz
import { CreationConfirmationModal } from '../features/oti/components/CreationConfirmationModal'; // 🆕 SPRINT 2
import { OtiCreationService } from '../features/oti/services/creation.service'; // 🆕 SPRINT 2
import type { TransactionData, BudgetData, AccountData } from '../features/oti/types/structured-response.types'; // 🆕 SPRINT 2
import { useTransactions, useAccounts, useBudgets } from '../hooks'; // 🆕 Importar hooks para creación
import { useApp } from '../contexts/AppContext'; // 🆕 Importar contexto para acceder a datos
import { OtiLoader } from './OtiLoader'; // ✨ Importar OtiLoader

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  structuredResponse?: OtiResponse; // ✨ NUEVO: Respuesta estructurada parseada
}

type OtiStatus = 'online' | 'thinking' | 'typing';

interface OtiChatProps {
  onNavigate: (screen: string) => void;
  currentScreen?: OtiScreenContext; // 🆕 Contexto de pantalla actual
  theme?: string; // 🎨 NEW: Theme prop for dynamic colors
  groupId?: string; // 🆕 ID del grupo para contexto de finanzas grupales
}

/**
 * 🔧 Helper para extraer el texto del mensaje según el tipo de respuesta
 */
function getMessageText(message: Message): string {
  if (!message.structuredResponse) {
    return message.content;
  }

  if (isSimpleResponse(message.structuredResponse)) {
    return message.structuredResponse.content;
  }

  if (isErrorResponse(message.structuredResponse)) {
    return message.structuredResponse.message;
  }

  // Si es structured, no hay texto simple, se renderiza con StructuredMessage
  return message.content;
}

export default function OtiChatV3({ onNavigate, currentScreen = 'home', theme = 'green', groupId }: OtiChatProps) {
  // 🆕 Mensajes de bienvenida según contexto
  const getWelcomeMessage = () => {
    switch (currentScreen) {
      case 'home':
        return 'Hola 👋 Estoy en **Inicio**. Puedo ayudarte a registrar gastos, analizar tu flujo de efectivo o darte consejos personalizados.';
      case 'budgets':
        return 'Hola 👋 Estoy en **Presupuestos**. Puedo crear presupuestos individuales o diseñar un **plan financiero completo** para ti.';
      case 'accounts':
        return 'Hola 👋 Estoy en **Cuentas**. Puedo crear nuevas cuentas, hacer transferencias o analizar tu balance consolidado.';
      case 'transactions':
        return 'Hola 👋 Estoy en **Transacciones**. Puedo ayudarte a analizar tus movimientos o registrar nuevas transacciones.';
      case 'groups':
        return 'Hola 👋 Estoy en **Grupos**. Puedo ayudarte a analizar gastos compartidos, gestionar miembros o darte consejos para optimizar las finanzas grupales.';
      default:
        return 'Hola, soy Oti 👋 Tu asistente personal de finanzas. ¿En qué puedo ayudarte hoy?';
    }
  };

  // 🆕 Sugerencias según contexto
  const getContextSuggestions = () => {
    switch (currentScreen) {
      case 'home':
        return [
          '💸 Registrar un gasto rápido',
          '📊 ¿Cómo va mi mes actual?',
          '💡 Dame consejos de ahorro',
          '📈 Analiza mi flujo de efectivo'
        ];
      case 'budgets':
        return [
          '➕ Crear un presupuesto',
          '🧠 Diseñar plan financiero completoeto',
          '📊 ¿Cómo van mis presupuestos?',
          '⚙️ Optimizar mi distribución'
        ];
      case 'accounts':
        return [
          '➕ Crear una cuenta nueva',
          '🔄 Transferir entre cuentas',
          '💰 Ver balance total',
          '📈 Proyectar flujo de caja'
        ];
      case 'transactions':
        return [
          '💸 Registrar nueva transacción',
          '📊 Analizar mis gastos',
          '🔍 Buscar una transacción',
          '💡 Consejos para ahorrar'
        ];
      default:
        return [
          '¿Cómo puedo ahorrar más dinero?',
          '¿Qué es un presupuesto y cómo crearlo?',
          '¿Cómo uso la app para registrar gastos?',
          'Dame consejos para reducir deudas'
        ];
    }
  };

  // 🎨 Theme color mappings
  const getThemeGradient = (currentTheme: string) => {
    const themeGradients: Record<string, string> = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-emerald-500 to-green-600',
      purple: 'from-purple-500 to-indigo-600',
      orange: 'from-orange-500 to-orange-600',
      pink: 'from-pink-500 to-pink-600',
      teal: 'from-teal-500 to-cyan-600',
      christmas: 'from-red-500 to-green-600',
      rainbow: 'from-pink-500 via-purple-500 to-blue-500',
    };
    return themeGradients[currentTheme] || 'from-emerald-500 to-green-600';
  };

  // 🆕 Icono y color según contexto (ahora usa el tema global)
  const getContextDisplay = () => {
    const gradient = getThemeGradient(theme);
    
    switch (currentScreen) {
      case 'home':
        return { icon: '🏠', label: 'Inicio', color: gradient };
      case 'budgets':
        return { icon: '💰', label: 'Presupuestos', color: gradient };
      case 'accounts':
        return { icon: '🏦', label: 'Cuentas', color: gradient };
      case 'transactions':
        return { icon: '📝', label: 'Transacciones', color: gradient };
      default:
        return { icon: '🤖', label: 'Chat', color: gradient };
    }
  };

  const contextDisplay = getContextDisplay();

  // 🆕 Hooks para acceder a datos y operaciones de la aplicación
  const { accounts, categories } = useApp();
  const { addTransaction } = useTransactions();
  const { addAccount } = useAccounts();
  const { addBudget } = useBudgets();

  // Estado de mensajes - Mensaje de bienvenida dinámico
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: getWelcomeMessage(),
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otiStatus, setOtiStatus] = useState<OtiStatus>('online');
  
  // Estado de conversaciones
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editingTitleValue, setEditingTitleValue] = useState('');
  
  // ✨ FASE 5: Quick Actions y atajos de teclado
  const [showQuickActions, setShowQuickActions] = useState(false);
  
  // ✨ FASE 6: TTS Settings
  const [showTTSSettings, setShowTTSSettings] = useState(false);
  
  // ✨ FASE 7: STT (Speech-to-Text)
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  
  // ✨ FASE 7: Handler para transcripción de voz
  const handleVoiceTranscript = (text: string) => {
    console.log('🎤 [OtiChat] Voice transcript received:', text);
    setInput(text);
    toast.success('Texto transcrito correctamente');
  };
  
  // 🆕 SPRINT 2: Estado del modal de confirmación de creación
  const [showCreationModal, setShowCreationModal] = useState(false);
  const [pendingCreation, setPendingCreation] = useState<{
    action: OtiAction;
    type: 'transaction' | 'budget' | 'account';
    data: TransactionData | BudgetData | AccountData;
  } | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // Contexto financiero
  const [financialContext, setFinancialContext] = useState<FinancialContext | null>(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>(getContextSuggestions());
  const [isLoadingContext, setIsLoadingContext] = useState(true); // 🆕 Estado de carga del contexto
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();

  // Cargar contexto financiero y lista de conversaciones al iniciar
  useEffect(() => {
    loadFinancialContext();
    loadConversationsList();
  }, []);

  // 🆕 Recargar sugerencias cuando cambia la pantalla actual
  useEffect(() => {
    if (financialContext) {
      const personalizedQuestions = generatePersonalizedQuestions(financialContext, currentScreen);
      setSuggestedQuestions(personalizedQuestions);
    } else {
      // Si no hay contexto, usar las sugerencias básicas del contexto de pantalla
      const personalizedQuestions = generatePersonalizedQuestions(null, currentScreen);
      setSuggestedQuestions(personalizedQuestions);
    }
    
    // Actualizar mensaje de bienvenida si solo hay un mensaje
    if (messages.length === 1) {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: getWelcomeMessage(),
        timestamp: new Date(),
      }]);
    }
  }, [currentScreen]);

  // Scroll al final cuando cambian los mensajes (SOLO si hay más de 1 mensaje)
  useEffect(() => {
    // No hacer scroll automático si solo está el mensaje de bienvenida
    if (messages.length > 1) {
      scrollToBottom();
    }
  }, [messages]);

  // Ajustar altura del textarea
  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  // ✨ FASE 5: Atajos de teclado globales
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K: Abrir panel de Quick Actions
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        setShowQuickActions(true);
        return;
      }

      // Esc: Cerrar paneles abiertos
      if (e.key === 'Escape') {
        if (showQuickActions) {
          setShowQuickActions(false);
          return;
        }
        if (showHistory) {
          setShowHistory(false);
          return;
        }
      }

      // Solo procesar otros atajos si no hay modales abiertos y no estamos escribiendo
      if (showQuickActions || showHistory || document.activeElement === textareaRef.current) {
        return;
      }

      // Ctrl+N: Nueva conversación
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        handleNewConversation();
        toast.info('Nueva conversación');
        return;
      }

      // Ctrl+H: Abrir historial
      if (e.ctrlKey && e.key === 'h') {
        e.preventDefault();
        setShowHistory(true);
        return;
      }

      // Ctrl+/: Focus en input
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        textareaRef.current?.focus();
        return;
      }

      // Navegación rápida con Ctrl + letra
      const navShortcuts: Record<string, string> = {
        't': 'transactions',
        'b': 'budgets',
        's': 'statistics',
        'a': 'accounts',
        'i': 'advisor',
      };

      if (e.ctrlKey && navShortcuts[e.key]) {
        e.preventDefault();
        onNavigate(navShortcuts[e.key]);
        toast.success(`Navegando a ${navShortcuts[e.key]}...`);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showQuickActions, showHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  // =====================
  // CONTEXTO FINANCIERO
  // =====================

  const loadFinancialContext = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        console.log('ℹ️ No access token found - using default questions');
        setIsLoadingContext(false);
        return;
      }

      console.log('🔑 Access token found, loading financial context...');

      const context = await fetchFinancialContext(accessToken);
      
      if (context) {
        setFinancialContext(context);
        const personalizedQuestions = generatePersonalizedQuestions(context, currentScreen);
        setSuggestedQuestions(personalizedQuestions);
        
        console.log('✅ Financial context loaded successfully');
      }
    } catch (error) {
      console.error('❌ Error loading financial context:', error);
    } finally {
      setIsLoadingContext(false);
    }
  };

  // =====================
  // CONVERSACIONES
  // =====================

  const loadConversationsList = async () => {
    try {
      setIsLoadingConversations(true);
      const convs = await listConversations();
      setConversations(convs);
      console.log(`✅ Loaded ${convs.length} conversations`);
    } catch (error) {
      console.error('❌ Error loading conversations:', error);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const loadConversation = async (conversationId: string) => {
    try {
      const conversation = await getConversation(conversationId);
      
      // Convertir mensajes de string a Date y parsear structuredResponse si existe
      const messagesWithDates: Message[] = conversation.messages.map(msg => {
        const message: Message = {
          ...msg,
          timestamp: new Date(msg.timestamp),
        };
        
        // 🔑 CRÍTICO: Intentar parsear structuredResponse si el content es JSON
        if (msg.role === 'assistant' && msg.content) {
          try {
            const parsed = JSON.parse(msg.content);
            if (parsed.type && ['simple', 'structured', 'error'].includes(parsed.type)) {
              message.structuredResponse = parsed as OtiResponse;
              console.log('✅ Parsed structured response for message:', msg.id.substring(0, 8));
            }
          } catch (e) {
            // No es JSON, dejar como texto plano
            console.log('ℹ️ Message is plain text, not structured:', msg.id.substring(0, 8));
          }
        }
        
        return message;
      });
      
      setMessages(messagesWithDates);
      setCurrentConversationId(conversationId);
      setShowHistory(false);
      
      console.log(`✅ Loaded conversation: ${conversation.title} with ${messagesWithDates.length} messages`);
      toast.success(`Conversación cargada: ${conversation.title}`);
    } catch (error) {
      console.error('❌ Error loading conversation:', error);
      toast.error('Error al cargar conversación');
    }
  };

  const handleNewConversation = async () => {
    try {
      // No crear inmediatamente, solo limpiar estado local
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: getWelcomeMessage(),
          timestamp: new Date(),
        },
      ]);
      setCurrentConversationId(null);
      setShowHistory(false);
      
      toast.success('Nueva conversación iniciada');
      console.log('🔄 Nueva conversación iniciada');
    } catch (error) {
      console.error('❌ Error creating new conversation:', error);
      toast.error('Error al crear conversación');
    }
  };

  const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar cargar la conversación al eliminar
    
    try {
      await deleteConversation(conversationId);
      
      // Si estamos viendo la conversación eliminada, limpiar
      if (currentConversationId === conversationId) {
        handleNewConversation();
      }
      
      // Recargar lista
      await loadConversationsList();
      
      toast.success('Conversación eliminada');
      console.log(`🗑️ Deleted conversation: ${conversationId}`);
    } catch (error) {
      console.error('❌ Error deleting conversation:', error);
      toast.error('Error al eliminar conversación');
    }
  };

  const handleUpdateTitle = async (conversationId: string) => {
    if (!editingTitleValue.trim()) {
      setEditingTitleId(null);
      return;
    }
    
    try {
      await updateConversationTitle(conversationId, { title: editingTitleValue });
      await loadConversationsList();
      setEditingTitleId(null);
      toast.success('Título actualizado');
    } catch (error) {
      console.error('❌ Error updating title:', error);
      toast.error('Error al actualizar título');
    }
  };

  // =====================
  // ENVIAR MENSAJES
  // =====================

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setOtiStatus('thinking');

    try {
      // Si no hay conversación activa Y el usuario está autenticado, crear una nueva
      let conversationId = currentConversationId;
      
      if (!conversationId && isUserAuthenticated()) {
        console.log('📝 Creating new conversation...');
        
        try {
          // Crear conversación con el primer mensaje
          const newConv = await createConversation({
            initialMessage: userMessage.content,
          });
          
          conversationId = newConv.id;
          setCurrentConversationId(conversationId);
          
          // Recargar lista de conversaciones
          await loadConversationsList();
          
          console.log(`✅ New conversation created: ${newConv.id} - "${newConv.title}"`);
        } catch (error) {
          console.error('⚠️ Error creating conversation (will continue without persistence):', error);
          // Continuar sin persistencia si falla
        }
      } else if (conversationId && isUserAuthenticated()) {
        try {
          // Guardar mensaje del usuario en conversación existente
          await addMessageToConversation(conversationId, {
            role: 'user',
            content: userMessage.content,
          });
        } catch (error) {
          console.error('⚠️ Error saving user message (will continue):', error);
          // Continuar aunque falle el guardado
        }
      } else {
        console.log('ℹ️ User not authenticated - conversation will not be saved');
      }

      // Obtener respuesta de Oti
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
            contextData: financialContext,
            requestStructured: true, // ✨ ACTIVADO: Respuestas estructuradas con secciones y acciones
            groupId, // 🆕 ID del grupo para contexto de finanzas grupales
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al comunicarse con Oti');
      }

      const data = await response.json();

      // ✨ NUEVO: Intentar parsear respuesta estructurada si viene en JSON
      let structuredResponse: OtiResponse | undefined;
      
      if (data.isStructured && data.parsedResponse) {
        // Backend ya parseó la respuesta
        structuredResponse = data.parsedResponse;
      } else {
        // Intentar parsear si la respuesta es JSON
        try {
          const parsed = JSON.parse(data.response);
          if (parsed.type && ['simple', 'structured', 'error'].includes(parsed.type)) {
            structuredResponse = parsed as OtiResponse;
          }
        } catch (e) {
          // No es JSON, es respuesta de texto plano
        }
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        structuredResponse, // ✨ NUEVO: Guardar respuesta estructurada si existe
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Guardar respuesta de Oti en la conversación (solo si está autenticado)
      if (conversationId && isUserAuthenticated()) {
        try {
          await addMessageToConversation(conversationId, {
            role: 'assistant',
            content: assistantMessage.content,
          });
          
          // Recargar lista para actualizar timestamp
          await loadConversationsList();
        } catch (error) {
          console.error('⚠️ Error saving assistant message (will continue):', error);
          // Continuar aunque falle el guardado
        }
      }
      
      setOtiStatus('online');
    } catch (error) {
      console.error('Error sending message to Oti:', error);
      toast.error('No pude conectarme con Oti. Intenta de nuevo.');
      setOtiStatus('online');
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

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

  const getStatusColor = () => {
    switch (otiStatus) {
      case 'thinking':
        return 'bg-yellow-400';
      case 'typing':
        return 'bg-blue-400';
      default:
        return 'bg-orange-400';
    }
  };

  // 🆕 Iconos según contexto
  const getContextIcons = () => {
    switch (currentScreen) {
      case 'home':
        return [DollarSign, BarChart3, Lightbulb, TrendingUp];
      case 'budgets':
        return [Target, Calculator, BarChart3, Settings];
      case 'accounts':
        return [Wallet, ArrowLeftRight, PiggyBank, TrendingUp];
      case 'transactions':
        return [Receipt, BarChart3, MessageCircle, Lightbulb];
      default:
        return [MessageCircle, Zap, TrendingUp, HelpCircle];
    }
  };

  const suggestionIcons = getContextIcons();

  // =====================
  // ACCIONES ESTRUCTURADAS
  // =====================

  const handleAction = (action: OtiAction) => {
    console.log('🎯 Action triggered:', action);
    console.log('📍 Current context - Screen:', currentScreen, 'GroupId:', groupId);
    
    switch (action.type) {
      case 'navigate':
        if (action.target) {
          // 🆕 Si estamos en contexto de grupo, manejar navegación especial
          if (groupId) {
            if (action.target === 'transactions') {
              toast.success('Mostrando transacciones del grupo...');
              onNavigate('back:transactions');
              return;
            } else if (action.target === 'statistics') {
              toast.success('Mostrando estadísticas del grupo...');
              onNavigate('back:stats');
              return;
            } else if (action.target === 'dashboard' || action.target === 'home') {
              toast.success('Mostrando resumen del grupo...');
              onNavigate('back:summary');
              return;
            }
            // Para otras navegaciones, salir del grupo y navegar normalmente
          }
          
          // 🔄 FIX: Si está navegando a "transactions" probablemente es para crear una transacción
          // Mejor navegar a "dashboard" que es la pantalla de inicio
          const targetScreen = action.target === 'transactions' ? 'dashboard' : action.target;
          toast.success(`Navegando a ${targetScreen === 'dashboard' ? 'Inicio' : action.target}...`);
          onNavigate(targetScreen);
        }
        break;
      
      case 'create':
        // 🆕 SPRINT 2: Manejar creación de elementos
        handleCreateAction(action);
        break;
      
      case 'view':
        // 🆕 Si estamos en contexto de grupo, manejar vistas específicas
        if (groupId) {
          const label = action.label.toLowerCase();
          if (label.includes('transacc')) {
            toast.success('Mostrando transacciones del grupo...');
            onNavigate('back:transactions');
            return;
          } else if (label.includes('estadística') || label.includes('gráfico') || label.includes('análisis')) {
            toast.success('Mostrando estadísticas del grupo...');
            onNavigate('back:stats');
            return;
          } else if (label.includes('resumen') || label.includes('dashboard')) {
            toast.success('Mostrando resumen del grupo...');
            onNavigate('back:summary');
            return;
          }
        }
        
        toast.info(`Viendo: ${action.label}`);
        // Podría navegar a vista de detalles
        break;
      
      case 'edit':
        toast.info(`Editando: ${action.label}`);
        // Podría abrir modal de edición
        break;
      
      case 'external':
        if (action.url) {
          window.open(action.url, '_blank');
          toast.success('Enlace abierto en nueva pestaña');
        }
        break;
      
      default:
        console.warn('Unknown action type:', action.type);
    }
  };

  // 🆕 SPRINT 2: Handler para acciones de creación
  const handleCreateAction = (action: OtiAction) => {
    console.log('🆕 Create action:', action);
    
    // 🔄 COMPATIBILITY: Detectar si tiene params en lugar de creationData
    let creationData = action.creationData;
    
    // Si no hay creationData pero sí params, convertir params a creationData
    if (!creationData && action.params) {
      console.log('🔄 Converting legacy params format to creationData...');
      console.log('📦 Original params:', action.params);
      creationData = convertParamsToCreationData(action.params, action);
      if (creationData) {
        console.log('✅ Converted successfully:', creationData);
      } else {
        console.error('❌ Conversion failed');
      }
    }
    
    // Verificar si tiene datos de creación
    if (!creationData) {
      toast.error('No hay datos para crear este elemento');
      console.error('❌ Action missing both creationData and params:', action);
      return;
    }

    // Determinar el tipo de elemento
    let type: 'transaction' | 'budget' | 'account';
    const data = creationData;

    // Detectar tipo por estructura de datos
    if ('type' in data && ('amount' in data) && ('description' in data || 'categoryName' in data)) {
      type = 'transaction';
    } else if ('amount' in data && ('month' in data || 'categoryName' in data)) {
      // Si tiene amount y categoryName pero no description, podría ser presupuesto
      type = data.month ? 'budget' : 'transaction';
    } else if ('name' in data && ('balance' in data)) {
      type = 'account';
    } else {
      toast.error('Tipo de elemento desconocido');
      console.error('Unknown creation data structure:', data);
      return;
    }

    // Si requiere confirmación, abrir modal
    if (action.requiresConfirmation !== false) {
      setPendingCreation({ action, type, data });
      setShowCreationModal(true);
    } else {
      // Crear directamente sin confirmación
      executeCreation(type, data, action.label);
    }
  };

  // 🆕 SPRINT 2: Convertir params legacy a creationData
  const convertParamsToCreationData = (params: any, action: OtiAction): TransactionData | BudgetData | AccountData | null => {
    console.log('🔧 Converting params:', params);
    
    // ✅ FIX: Obtener la fecha actual en zona horaria de Colombia (UTC-5)
    const today = new Date();
    // Ajustar a UTC-5 (Colombia)
    const colombiaOffset = -5 * 60; // -5 horas en minutos
    const localOffset = today.getTimezoneOffset(); // Offset local del navegador
    const colombiaTime = new Date(today.getTime() + (localOffset + colombiaOffset) * 60 * 1000);
    
    const year = colombiaTime.getUTCFullYear();
    const month = String(colombiaTime.getUTCMonth() + 1).padStart(2, '0');
    const day = String(colombiaTime.getUTCDate()).padStart(2, '0');
    
    const currentDate = `${year}-${month}-${day}`; // YYYY-MM-DD (ej: 2025-11-24)
    const currentMonth = `${year}-${month}`; // YYYY-MM (ej: 2025-11)
    
    console.log('📅 Current date (Colombia):', currentDate, 'Current month:', currentMonth);
    
    // Detectar tipo de conversión
    if (params.type === 'expense' || params.type === 'income') {
      // Es una transacción
      return {
        type: params.type,
        amount: params.amount || 0,
        description: params.description || action.description || action.label || 'Sin descripción',
        categoryName: params.category || params.categoryName,
        date: params.date || currentDate, // ✅ Usar fecha actual correcta
        accountName: params.account || params.accountName,
      } as TransactionData;
    } 
    else if (params.category && params.amount && !params.type) {
      // Podría ser presupuesto (tiene category y amount pero no type)
      return {
        categoryName: params.category || params.categoryName,
        amount: params.amount,
        month: params.month || currentMonth, // ✅ Usar mes actual correcto
      } as BudgetData;
    }
    else if (params.name && (params.balance !== undefined || params.initialBalance !== undefined)) {
      // Es una cuenta
      return {
        name: params.name,
        type: params.accountType || params.type || 'bank',
        balance: params.balance !== undefined ? params.balance : params.initialBalance,
      } as AccountData;
    }
    
    console.error('Could not convert params to creationData:', params);
    return null;
  };

  // 🆕 SPRINT 2: Ejecutar creación de elemento
  const executeCreation = async (
    type: 'transaction' | 'budget' | 'account',
    data: TransactionData | BudgetData | AccountData,
    label: string
  ) => {
    setIsCreating(true);
    
    try {
      let result;
      
      switch (type) {
        case 'transaction':
          // 🔑 CRÍTICO: Usar el hook addTransaction para actualizar estado local inmediatamente
          const txData = data as TransactionData;
          
          console.log('💳 [OtiChat] Creating transaction with data:', txData);
          
          // ✅ Validación: Verificar que hay cuentas disponibles
          if (!accounts || accounts.length === 0) {
            console.error('❌ No accounts available');
            result = { success: false, error: 'No hay cuentas disponibles. Crea una cuenta primero en la sección de Cuentas.' };
            break;
          }
          
          // ✅ Validación: Verificar que el monto sea válido
          if (!txData.amount || txData.amount <= 0) {
            console.error('❌ Invalid amount:', txData.amount);
            result = { success: false, error: 'El monto debe ser mayor a cero.' };
            break;
          }
          
          // Buscar la categoría por nombre
          let category = null;
          if (txData.categoryName) {
            category = categories.find(cat => 
              cat.name.toLowerCase() === txData.categoryName.toLowerCase()
            );
            console.log(`🔍 Category search for "${txData.categoryName}":`, category ? `Found: ${category.name}` : 'Not found');
          }
          
          // Buscar la cuenta por nombre o usar la primera disponible
          let account = accounts[0]; // Por defecto
          if (txData.accountName) {
            const foundAccount = accounts.find(acc => 
              acc.name.toLowerCase() === txData.accountName.toLowerCase()
            );
            if (foundAccount) {
              account = foundAccount;
              console.log(`🏦 Account search for "${txData.accountName}": Found: ${account.name}`);
            } else {
              console.log(`⚠️ Account "${txData.accountName}" not found, using default: ${account?.name}`);
            }
          } else {
            console.log(`ℹ️ No account specified, using default: ${account?.name}`);
          }
          
          if (!account) {
            result = { success: false, error: 'No hay cuentas disponibles. Crea una cuenta primero.' };
            break;
          }
          
          // ✅ Usar description o notes (lo que esté disponible)
          const transactionNote = txData.description || txData.notes || '';
          
          // ✅ Crear transacción usando el hook (esto actualiza el estado local inmediatamente)
          console.log('📝 Creating transaction with:', {
            type: txData.type,
            amount: txData.amount,
            note: transactionNote,
            category: category?.id || undefined,
            categoryName: category?.name,
            account: account.id,
            accountName: account.name,
            date: txData.date || getTodayLocalDate(), // ✅ Use local date
          });
          
          try {
            addTransaction({
              type: txData.type,
              amount: txData.amount,
              note: transactionNote,
              category: category?.id,
              account: account.id,
              date: txData.date || getTodayLocalDate(), // ✅ Use local date
              tags: txData.tags || []
            });
            
            console.log('✅ Transaction created successfully via hook');
            result = { success: true };
          } catch (txError) {
            console.error('❌ Error calling addTransaction:', txError);
            result = { success: false, error: `Error al crear la transacción: ${txError}` };
          }
          break;
          
        case 'budget':
          // 🔑 CRÍTICO: Usar el hook addBudget para actualizar estado local inmediatamente
          const budgetData = data as BudgetData;
          
          console.log('💰 [OtiChat] Creating budget with data:', budgetData);
          
          // Buscar la categoría por nombre
          let budgetCategory = null;
          if (budgetData.categoryName) {
            budgetCategory = categories.find(cat => 
              cat.name.toLowerCase() === budgetData.categoryName.toLowerCase()
            );
            console.log(`🔍 Category search for "${budgetData.categoryName}":`, budgetCategory ? `Found: ${budgetCategory.name}` : 'Not found');
          }
          
          if (!budgetCategory) {
            result = { success: false, error: `No se encontró la categoría "${budgetData.categoryName}"` };
            break;
          }
          
          // ✅ Crear presupuesto usando el hook
          console.log('📝 Creating budget with:', {
            categoryId: budgetCategory.id,
            categoryName: budgetCategory.name,
            amount: budgetData.amount,
            period: 'monthly',
            alertThreshold: 80,
          });
          
          addBudget({
            categoryId: budgetCategory.id,
            amount: budgetData.amount,
            period: 'monthly' as const,
            alertThreshold: 80,
          });
          
          console.log('✅ Budget created successfully via hook');
          result = { success: true };
          break;
          
        case 'account':
          // 🔑 CRÍTICO: Usar el hook addAccount para actualizar estado local inmediatamente
          const accountData = data as AccountData;
          
          console.log('🏦 [OtiChat] Creating account with data:', accountData);
          
          // ✅ Crear cuenta usando el hook
          addAccount({
            name: accountData.name,
            type: accountData.type,
            balance: accountData.balance,
            currency: accountData.currency || 'COP',
            color: accountData.color || '#10b981',
            icon: accountData.icon || '💰',
          });
          
          console.log('✅ Account created successfully via hook');
          result = { success: true };
          break;
          
        default:
          throw new Error(`Tipo desconocido: ${type}`);
      }

      if (result.success) {
        toast.success(`✅ ${label} creado exitosamente`);
        
        // Agregar mensaje de confirmación al chat
        const confirmationMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `✅ Perfecto! He creado **${label}**. Los datos se han guardado correctamente y ya están disponibles en tu ${type === 'transaction' ? 'lista de transacciones' : type === 'budget' ? 'presupuestos' : 'cuentas'}.`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, confirmationMessage]);

        // Recargar contexto financiero para reflejar cambios en próximas sugerencias
        await loadFinancialContext();
        
        // Cerrar modal
        setShowCreationModal(false);
        setPendingCreation(null);
        
        console.log(`✅ ${type} created successfully via hooks (state updated immediately)`);
      } else {
        toast.error(`❌ Error: ${result.error}`);
        
        // Agregar mensaje de error al chat
        const errorMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `❌ Lo siento, no pude crear el elemento. ${result.error}`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
        
        console.error(`❌ Error creating ${type}:`, result.error);
      }
    } catch (error) {
      console.error('Error in executeCreation:', error);
      toast.error('Error inesperado al crear el elemento');
      
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '❌ Ocurrió un error inesperado. Por favor intenta de nuevo.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsCreating(false);
    }
  };

  // 🆕 SPRINT 2: Confirmar creación desde modal
  const handleConfirmCreation = () => {
    if (!pendingCreation) return;
    
    const { type, data, action } = pendingCreation;
    executeCreation(type, data, action.label);
  };

  // 🆕 SPRINT 2: Cancelar creación
  const handleCancelCreation = () => {
    setShowCreationModal(false);
    setPendingCreation(null);
    toast.info('Creación cancelada');
  };

  return (
    <div className="flex w-full mobile-screen-height bg-gray-50 dark:bg-gray-950 prevent-overscroll overflow-hidden">
      {/* ✨ FASE 5: Panel de Quick Actions - CON CONTEXTO */}
      <QuickActionsPanel 
        isOpen={showQuickActions}
        onClose={() => setShowQuickActions(false)}
        onAction={handleAction}
        currentContext={currentScreen}
      />

      {/* ✨ FASE 6: Modal de configuración TTS */}
      <TTSSettingsModal
        isOpen={showTTSSettings}
        onClose={() => setShowTTSSettings(false)}
      />

      {/* ✨ FASE 7: Modal de conversación por voz (STT + TTS integrado) */}
      <VoiceConversation
        isOpen={showVoiceInput}
        onClose={() => setShowVoiceInput(false)}
        contextData={financialContext}
        conversationHistory={messages.map(m => ({
          role: m.role,
          content: m.content,
        }))}
      />

      {/* Panel lateral de historial */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200" onClick={() => setShowHistory(false)}>
          <div 
            className="fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-gray-900 shadow-2xl animate-in slide-in-from-left duration-300 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del panel */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-900 dark:text-white">Historial</h2>
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <Button
                onClick={handleNewConversation}
                className={`w-full bg-gradient-to-r ${contextDisplay.color} hover:opacity-90 text-white transition-opacity`}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva conversación
              </Button>
            </div>

            {/* Lista de conversaciones */}
            <div className="overflow-y-auto" style={{ height: 'calc(100% - 120px)' }}>
              {isLoadingConversations ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-700" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No hay conversaciones guardadas
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    Inicia una nueva conversación para comenzar
                  </p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                        currentConversationId === conv.id
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => loadConversation(conv.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          {editingTitleId === conv.id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={editingTitleValue}
                                onChange={(e) => setEditingTitleValue(e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    handleUpdateTitle(conv.id);
                                  }
                                }}
                                className="flex-1 px-2 py-1 text-sm border border-emerald-500 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateTitle(conv.id);
                                }}
                                className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded"
                              >
                                <Check className="w-4 h-4 text-emerald-600" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {conv.title}
                                </h3>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingTitleId(conv.id);
                                    setEditingTitleValue(conv.title);
                                  }}
                                  className="md:opacity-0 md:group-hover:opacity-100 opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-opacity flex-shrink-0"
                                  aria-label="Editar título"
                                >
                                  <Edit2 className="w-3 h-3 text-gray-500" />
                                </button>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                                {conv.lastMessagePreview}
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                {formatDate(conv.updatedAt)} • {conv.messageCount} mensajes
                              </p>
                            </>
                          )}
                        </div>
                        <button
                          onClick={(e) => handleDeleteConversation(conv.id, e)}
                          className="md:opacity-0 md:group-hover:opacity-100 opacity-100 p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-opacity flex-shrink-0"
                          aria-label="Eliminar conversación"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pantalla principal del chat */}
      <div className="flex-1 flex flex-col w-full max-w-full min-w-0 overflow-hidden">
        {/* Header - Fijo en la parte superior, optimizado con layout limpio */}
        <div className={`fixed-top-header bg-gradient-to-r ${contextDisplay.color} shadow-lg safe-area-top ${currentScreen === 'groups' ? 'z-[70]' : 'z-40'}`}>
          {/* Contenido del header */}
          <div className="px-4 py-3 w-full max-w-full">
            <div className="flex items-center gap-3 w-full max-w-full">
              <button
                onClick={() => onNavigate(currentScreen === 'groups' ? 'back' : 'dashboard')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <div className="relative flex-shrink-0">
                  <div className={`w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center ${
                    otiStatus !== 'online' ? 'animate-pulse' : ''
                  }`}>
                    <span className="text-xl">{contextDisplay.icon}</span>
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusColor()} rounded-full border-2 border-white ${
                    otiStatus !== 'online' ? 'animate-pulse' : ''
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-white font-medium truncate">Oti · {contextDisplay.label}</h1>
                  <p className="text-xs text-white/80 truncate">{getStatusText()}</p>
                </div>
              </div>
              <button
                onClick={() => setShowTTSSettings(true)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                title="Configurar voz"
              >
                <Volume2 className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={() => setShowHistory(true)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                title="Historial"
              >
                <History className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={() => setShowHistory(true)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                title="Ver conversaciones"
              >
                <MessageCircle className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto top-header-spacing bottom-input-spacing momentum-scroll px-4 pt-8 pb-3 space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
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
                {message.structuredResponse && isStructuredResponse(message.structuredResponse) ? (
                  <StructuredMessage response={message.structuredResponse} onAction={handleAction} />
                ) : (
                  <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{getMessageText(message)}</p>
                )}
                <p
                  className={`text-xs mt-1.5 ${
                    message.role === 'user' ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {formatTime(message.timestamp)}
                </p>
                {/* ✨ FASE 6: Controles de audio para mensajes de Oti */}
                {message.role === 'assistant' && (
                  <AudioControls 
                    text={getMessageText(message)} 
                    messageId={message.id}
                    structuredResponse={message.structuredResponse}
                  />
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-center my-4 animate-in fade-in duration-300">
              <OtiLoader 
                message={otiStatus === 'thinking' ? 'Oti está pensando...' : 'Oti está escribiendo...'} 
                size="sm"
              />
            </div>
          )}

          {/* Preguntas sugeridas - DENTRO del área de mensajes */}
          {messages.length === 1 && !isLoadingContext && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 -mt-1">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2.5 text-center">
                💡 Pregúntame sobre:
              </p>
              <div className="grid grid-cols-2 gap-2.5">
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

          {/* Indicador de carga del contexto */}
          {messages.length === 1 && isLoadingContext && (
            <div className="animate-in fade-in duration-300 text-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-orange-500 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Cargando sugerencias personalizadas...
              </p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input - Fijo en la parte inferior */}
        <div className={`fixed-bottom-input bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 safe-area-bottom ${currentScreen === 'groups' ? 'z-[70]' : ''}`}>
          <div className="px-3 py-3 w-full max-w-full">
            <div className="flex items-end gap-2 w-full max-w-full">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu pregunta..."
                className="flex-1 min-w-0 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[44px] max-h-[120px] transition-all"
                rows={1}
                disabled={isLoading}
              />
              {/* ✨ FASE 7: Botón de voz (STT) */}
              <button
                onClick={() => setShowVoiceInput(true)}
                disabled={isLoading}
                className="bg-gradient-to-r from-emerald-500 to-lime-600 hover:from-emerald-600 hover:to-lime-700 text-white h-11 w-11 rounded-xl flex-shrink-0 p-0 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center"
                title="Hablar con Oti"
              >
                <Mic className="w-5 h-5" />
              </button>
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
      </div>

      {/* ✨ FASE 5: FAB (Floating Action Button) - SIEMPRE VISIBLE */}
      <button
        onClick={() => setShowQuickActions(true)}
        className={`fixed bottom-20 left-4 w-14 h-14 bg-gradient-to-br from-[#A8E063] via-[#56C596] to-[#0FA07F] hover:opacity-90 text-white rounded-full shadow-2xl flex items-center justify-center active:scale-95 transition-all animate-in fade-in slide-in-from-bottom duration-500 ${currentScreen === 'groups' ? 'z-[70]' : 'z-40'}`}
        aria-label="Acciones rápidas"
      >
        <Bolt className="w-6 h-6" />
        {/* Indicador pulsante para llamar la atención */}
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A8E063] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-[#56C596]"></span>
        </span>
      </button>

      {/* 🆕 SPRINT 2: Modal de confirmación de creación */}
      <CreationConfirmationModal
        isOpen={showCreationModal}
        onClose={handleCancelCreation}
        onConfirm={handleConfirmCreation}
        title={pendingCreation?.action.label || ''}
        data={pendingCreation?.data || null}
        type={pendingCreation?.type || 'transaction'}
      />
    </div>
  );
}