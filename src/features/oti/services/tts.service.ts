/**
 * 🔊 SERVICIO DE TEXT-TO-SPEECH (TTS) - FASE 6
 * 
 * Servicio para convertir texto a voz usando Web Speech API
 * Características:
 * - Síntesis de voz nativa del navegador
 * - Configuración de voz, velocidad y tono
 * - Controles de reproducción (play, pause, resume, stop)
 * - Persistencia de preferencias en localStorage
 * - Detección de voces disponibles en español
 */

export interface TTSSettings {
  enabled: boolean;
  autoPlay: boolean;
  voice: string | null; // Nombre de la voz seleccionada
  rate: number; // Velocidad (0.5 - 2.0)
  pitch: number; // Tono (0.0 - 2.0)
  volume: number; // Volumen (0.0 - 1.0)
}

export interface VoiceOption {
  name: string;
  lang: string;
  localService: boolean;
}

const DEFAULT_SETTINGS: TTSSettings = {
  enabled: true,
  autoPlay: false,
  voice: null,
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
};

const STORAGE_KEY = 'oti_tts_settings';

class TTSService {
  private synthesis: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private settings: TTSSettings = DEFAULT_SETTINGS;
  private voices: SpeechSynthesisVoice[] = [];
  private isInitialized = false;
  private isPaused = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      this.loadSettings();
      this.loadVoices();
    } else {
      console.warn('⚠️ Web Speech API no disponible en este navegador');
    }
  }

  /**
   * Cargar voces disponibles
   */
  private loadVoices() {
    if (!this.synthesis) return;

    const loadVoicesList = () => {
      this.voices = this.synthesis!.getVoices();
      
      if (this.voices.length > 0) {
        this.isInitialized = true;
        
        // ✨ PRIORIDAD: Buscar voces en este orden
        if (!this.settings.voice) {
          // 1. Primero: Voz de Colombia (es-CO)
          let selectedVoice = this.voices.find(v => v.lang.startsWith('es-CO'));
          
          // 2. Si no hay colombiana, buscar latinoamericana
          if (!selectedVoice) {
            selectedVoice = this.voices.find(v => 
              v.lang.startsWith('es-MX') || // México
              v.lang.startsWith('es-AR') || // Argentina
              v.lang.startsWith('es-CL') || // Chile
              v.lang.startsWith('es-PE')    // Perú
            );
          }
          
          // 3. Si no hay latinoamericana, cualquier español
          if (!selectedVoice) {
            selectedVoice = this.voices.find(v => v.lang.startsWith('es'));
          }
          
          if (selectedVoice) {
            this.settings.voice = selectedVoice.name;
            this.saveSettings();
            console.log(`🗣️ TTS: Voz seleccionada - ${selectedVoice.name} (${selectedVoice.lang})`);
          }
        }
        
        console.log(`✅ TTS: ${this.voices.length} voces cargadas`);
        
        // Log de voces en español disponibles
        const spanishVoices = this.voices.filter(v => v.lang.startsWith('es'));
        console.log('🗣️ Voces en español disponibles:', spanishVoices.map(v => `${v.name} (${v.lang})`));
      }
    };

    loadVoicesList();

    // Las voces pueden cargarse asincrónicamente
    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = loadVoicesList;
    }
  }

  /**
   * Obtener voces disponibles (filtradas por idioma español)
   */
  getAvailableVoices(): VoiceOption[] {
    if (!this.isInitialized) {
      return [];
    }

    // Filtrar voces en español
    return this.voices
      .filter(voice => voice.lang.startsWith('es'))
      .map(voice => ({
        name: voice.name,
        lang: voice.lang,
        localService: voice.localService,
      }));
  }

  /**
   * Obtener todas las voces (sin filtro)
   */
  getAllVoices(): VoiceOption[] {
    if (!this.isInitialized) {
      return [];
    }

    return this.voices.map(voice => ({
      name: voice.name,
      lang: voice.lang,
      localService: voice.localService,
    }));
  }

  /**
   * Cargar configuración desde localStorage
   */
  private loadSettings() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Error loading TTS settings:', error);
    }
  }

  /**
   * Guardar configuración en localStorage
   */
  private saveSettings() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.error('Error saving TTS settings:', error);
    }
  }

  /**
   * Obtener configuración actual
   */
  getSettings(): TTSSettings {
    return { ...this.settings };
  }

  /**
   * Actualizar configuración
   */
  updateSettings(newSettings: Partial<TTSSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  /**
   * Verificar si TTS está disponible
   */
  isSupported(): boolean {
    return this.synthesis !== null;
  }

  /**
   * Verificar si hay una voz activa reproduciéndose
   */
  isSpeaking(): boolean {
    return this.synthesis?.speaking || false;
  }

  /**
   * Verificar si está pausado
   */
  isPausedState(): boolean {
    return this.isPaused;
  }

  /**
   * Limpiar texto para TTS (remover markdown, emojis, etc.)
   */
  private cleanTextForSpeech(text: string): string {
    let cleaned = text;
    
    try {
      cleaned = text
        // Remover bloques de código
        .replace(/```[\s\S]*?```/g, '')
        // Remover código inline
        .replace(/`[^`]+`/g, '')
        // Remover markdown bold/italic (pero mantener el texto)
        .replace(/(\*\*|__)(.*?)\1/g, '$2')
        .replace(/(\*|_)(.*?)\1/g, '$2')
        // Remover links markdown (mantener solo el texto)
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        // Remover algunos emojis comunes
        .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
        .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Símbolos y pictogramas
        .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transporte
        .replace(/[\u{1F700}-\u{1F77F}]/gu, '') // Símbolos alquímicos
        // Remover múltiples espacios
        .replace(/\s+/g, ' ')
        // Remover saltos de línea excesivos
        .replace(/\n\s*\n/g, '. ')
        .replace(/\n/g, ' ')
        .trim();
    } catch (error) {
      console.warn('⚠️ Error limpiando texto para TTS:', error);
      // Si falla la limpieza, usar texto original limpio básico
      cleaned = text.replace(/\s+/g, ' ').trim();
    }

    // Si después de limpiar quedó muy poco texto, usar el original
    if (cleaned.length < 3 && text.length > cleaned.length) {
      console.warn('⚠️ Limpieza removió demasiado texto, usando original');
      return text.replace(/\s+/g, ' ').trim();
    }

    return cleaned;
  }

  /**
   * Hablar un texto
   */
  speak(
    text: string,
    callbacks?: {
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (error: SpeechSynthesisErrorEvent) => void;
      onPause?: () => void;
      onResume?: () => void;
    }
  ): boolean {
    if (!this.synthesis || !this.settings.enabled) {
      console.log('ℹ️ TTS deshabilitado o no soportado');
      return false;
    }

    // Detener cualquier reproducción anterior
    this.stop();

    // Limpiar texto
    const cleanedText = this.cleanTextForSpeech(text);

    if (!cleanedText) {
      console.warn('⚠️ Texto vacío después de limpieza');
      return false;
    }

    // Crear utterance
    this.currentUtterance = new SpeechSynthesisUtterance(cleanedText);

    // Configurar voz
    if (this.settings.voice) {
      const selectedVoice = this.voices.find(v => v.name === this.settings.voice);
      if (selectedVoice) {
        this.currentUtterance.voice = selectedVoice;
      }
    }

    // Configurar parámetros
    this.currentUtterance.rate = this.settings.rate;
    this.currentUtterance.pitch = this.settings.pitch;
    this.currentUtterance.volume = this.settings.volume;
    this.currentUtterance.lang = 'es-CO'; // ✨ CAMBIADO: Español de Colombia

    // Callbacks
    this.currentUtterance.onstart = () => {
      this.isPaused = false;
      console.log('🔊 TTS: Iniciado');
      callbacks?.onStart?.();
    };

    this.currentUtterance.onend = () => {
      this.isPaused = false;
      console.log('✅ TTS: Finalizado');
      callbacks?.onEnd?.();
    };

    this.currentUtterance.onerror = (event) => {
      this.isPaused = false;
      
      // Silenciar errores normales que no son críticos
      if (event.error === 'canceled' || event.error === 'interrupted') {
        console.log(`ℹ️ TTS ${event.error} (normal)`);
        callbacks?.onError?.(event);
        return;
      }
      
      // Solo loggear errores importantes
      const errorInfo = {
        error: event.error,
        message: event.message || 'Sin mensaje de error',
        charIndex: event.charIndex,
        utterance: event.utterance?.text?.substring(0, 50),
      };
      
      console.warn('⚠️ Error de TTS:', errorInfo);
      callbacks?.onError?.(event);
    };

    this.currentUtterance.onpause = () => {
      this.isPaused = true;
      console.log('⏸️ TTS: Pausado');
      callbacks?.onPause?.();
    };

    this.currentUtterance.onresume = () => {
      this.isPaused = false;
      console.log('▶️ TTS: Reanudado');
      callbacks?.onResume?.();
    };

    // Hablar
    this.synthesis.speak(this.currentUtterance);
    console.log(`🔊 TTS: Hablando "${cleanedText.substring(0, 50)}..."`);
    
    return true;
  }

  /**
   * Pausar reproducción
   */
  pause() {
    if (this.synthesis && this.synthesis.speaking && !this.isPaused) {
      this.synthesis.pause();
      this.isPaused = true;
    }
  }

  /**
   * Reanudar reproducción
   */
  resume() {
    if (this.synthesis && this.isPaused) {
      this.synthesis.resume();
      this.isPaused = false;
    }
  }

  /**
   * Detener reproducción
   */
  stop() {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.currentUtterance = null;
      this.isPaused = false;
    }
  }
}

// Singleton
export const ttsService = new TTSService();