/**
 * 🎵 CONTROLES DE AUDIO - FASE 6
 * 
 * Controles para reproducir/pausar/detener mensajes con TTS
 * Muestra en cada mensaje de Oti
 */

import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Pause, Play, Square } from 'lucide-react';
import { ttsService } from '../../features/oti/services/tts.service';
import type { OtiResponse } from '../../features/oti/types/structured-response.types';

interface AudioControlsProps {
  text: string;
  messageId: string;
  structuredResponse?: OtiResponse;
}

export function AudioControls({ text, messageId, structuredResponse }: AudioControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    // Verificar si TTS está habilitado
    const settings = ttsService.getSettings();
    setIsEnabled(settings.enabled && ttsService.isSupported());
  }, []);

  /**
   * Extraer texto limpio de una respuesta estructurada
   */
  const extractTextFromStructured = (response: OtiResponse): string => {
    const parts: string[] = [];
    
    // Agregar resumen si existe
    if (response.summary) {
      parts.push(response.summary);
    }
    
    // Agregar secciones
    if (response.sections && response.sections.length > 0) {
      response.sections.forEach(section => {
        if (section.title) {
          parts.push(section.title);
        }
        if (section.content) {
          parts.push(section.content);
        }
        // Agregar items de la sección
        if (section.items && section.items.length > 0) {
          section.items.forEach(item => {
            parts.push(item);
          });
        }
      });
    }
    
    return parts.join('. ');
  };

  const handlePlay = () => {
    // Determinar qué texto usar
    let textToSpeak = text;
    
    if (structuredResponse) {
      textToSpeak = extractTextFromStructured(structuredResponse);
    }
    
    const success = ttsService.speak(textToSpeak, {
      onStart: () => {
        setIsPlaying(true);
        setIsPaused(false);
      },
      onEnd: () => {
        setIsPlaying(false);
        setIsPaused(false);
      },
      onError: (error) => {
        // Solo resetear estado, no mostrar error al usuario
        setIsPlaying(false);
        setIsPaused(false);
      },
      onPause: () => {
        setIsPaused(true);
      },
      onResume: () => {
        setIsPaused(false);
      },
    });

    if (!success) {
      console.log('ℹ️ No se pudo reproducir el audio (TTS deshabilitado)');
    }
  };

  const handlePause = () => {
    ttsService.pause();
    setIsPaused(true);
  };

  const handleResume = () => {
    ttsService.resume();
    setIsPaused(false);
  };

  const handleStop = () => {
    ttsService.stop();
    setIsPlaying(false);
    setIsPaused(false);
  };

  if (!isEnabled) {
    return null; // No mostrar controles si TTS no está disponible
  }

  return (
    <div className="flex items-center gap-1 mt-2">
      {!isPlaying ? (
        <button
          onClick={handlePlay}
          className="p-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg transition-colors group"
          title="Escuchar mensaje"
        >
          <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
        </button>
      ) : (
        <>
          {isPaused ? (
            <button
              onClick={handleResume}
              className="p-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
              title="Reanudar"
            >
              <Play className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="p-1.5 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-lg transition-colors"
              title="Pausar"
            >
              <Pause className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            </button>
          )}
          <button
            onClick={handleStop}
            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
            title="Detener"
          >
            <Square className="w-4 h-4 text-red-600 dark:text-red-400" />
          </button>
        </>
      )}

      {/* Indicador de reproducción */}
      {isPlaying && !isPaused && (
        <div className="flex items-center gap-0.5 ml-1">
          <div className="w-1 h-2 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
          <div className="w-1 h-3 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
          <div className="w-1 h-2 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
        </div>
      )}
    </div>
  );
}