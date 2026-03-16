/**
 * ⚙️ CONFIGURACIÓN DE TTS - FASE 6
 * 
 * Modal para configurar opciones de Text-to-Speech:
 * - Habilitar/deshabilitar TTS
 * - Auto-reproducción
 * - Selección de voz
 * - Velocidad de lectura
 * - Tono de voz
 * - Volumen
 */

import { useState, useEffect } from 'react';
import { X, Volume2, Zap, Sliders } from 'lucide-react';
import { ttsService, type TTSSettings, type VoiceOption } from '../../features/oti/services/tts.service';
import { Button } from '../ui/button';

interface TTSSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TTSSettingsModal({ isOpen, onClose }: TTSSettingsProps) {
  const [settings, setSettings] = useState<TTSSettings>(ttsService.getSettings());
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [testText] = useState('Hola, soy Oti, tu asistente financiero personal.');

  useEffect(() => {
    if (isOpen) {
      loadVoices();
    }
  }, [isOpen]);

  const loadVoices = () => {
    const availableVoices = ttsService.getAvailableVoices();
    setVoices(availableVoices);
    
    if (availableVoices.length === 0) {
      console.warn('⚠️ No hay voces en español disponibles');
    }
  };

  const handleUpdateSetting = (key: keyof TTSSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    ttsService.updateSettings(newSettings);
  };

  const handleTestVoice = () => {
    ttsService.stop();
    ttsService.speak(testText);
  };

  if (!isOpen) return null;

  const isSupported = ttsService.isSupported();

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md animate-in slide-in-from-bottom duration-300 overflow-hidden border border-gray-200 dark:border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Volume2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Configuración de Voz
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Personaliza cómo Oti te habla
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          {!isSupported ? (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-sm text-red-700 dark:text-red-300">
                ⚠️ Tu navegador no soporta Text-to-Speech
              </p>
            </div>
          ) : (
            <>
              {/* Habilitar TTS */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Habilitar voz
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Activa o desactiva la lectura de mensajes
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enabled}
                    onChange={(e) => handleUpdateSetting('enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
                </label>
              </div>

              {/* Auto-reproducción */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-orange-500" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Auto-reproducción
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Leer automáticamente nuevos mensajes
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoPlay}
                    onChange={(e) => handleUpdateSetting('autoPlay', e.target.checked)}
                    disabled={!settings.enabled}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500 peer-disabled:opacity-50"></div>
                </label>
              </div>

              {settings.enabled && (
                <>
                  {/* Selección de voz */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                      <Sliders className="w-4 h-4 text-orange-500" />
                      Voz
                    </label>
                    <select
                      value={settings.voice || ''}
                      onChange={(e) => handleUpdateSetting('voice', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl border-2 border-transparent focus:border-orange-500 focus:outline-none transition-colors text-sm"
                    >
                      {voices.length === 0 ? (
                        <option>Cargando voces...</option>
                      ) : (
                        voices.map((voice) => (
                          <option key={voice.name} value={voice.name}>
                            {voice.name} ({voice.lang})
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Velocidad */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-900 dark:text-white">
                        Velocidad
                      </label>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {settings.rate.toFixed(1)}x
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.1"
                      value={settings.rate}
                      onChange={(e) => handleUpdateSetting('rate', parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-orange-500"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Lento</span>
                      <span>Normal</span>
                      <span>Rápido</span>
                    </div>
                  </div>

                  {/* Tono */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-900 dark:text-white">
                        Tono
                      </label>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {settings.pitch.toFixed(1)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.1"
                      value={settings.pitch}
                      onChange={(e) => handleUpdateSetting('pitch', parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-orange-500"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Grave</span>
                      <span>Normal</span>
                      <span>Agudo</span>
                    </div>
                  </div>

                  {/* Volumen */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-900 dark:text-white">
                        Volumen
                      </label>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {Math.round(settings.volume * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings.volume}
                      onChange={(e) => handleUpdateSetting('volume', parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-orange-500"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Silencio</span>
                      <span>Máximo</span>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex gap-2">
            <Button
              onClick={handleTestVoice}
              disabled={!settings.enabled}
              className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white"
            >
              <Volume2 className="w-4 h-4 mr-2" />
              Probar voz
            </Button>
            <Button
              onClick={onClose}
              className="flex-1 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700"
            >
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}