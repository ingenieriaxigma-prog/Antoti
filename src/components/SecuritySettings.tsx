import { useState, useEffect } from 'react';
import { X, Lock, Fingerprint, Eye, EyeOff, Shield, Trash2, Check } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner@2.0.3';
import { motion, AnimatePresence } from 'framer-motion';

interface SecuritySettingsProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  userId: string;
  onSecurityChange?: () => void;
}

export default function SecuritySettings({ isOpen, onClose, darkMode, userId, onSecurityChange }: SecuritySettingsProps) {
  const [isPinEnabled, setIsPinEnabled] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [showSetupPin, setShowSetupPin] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [autoLockTime, setAutoLockTime] = useState(5); // minutos
  const [isChangingPin, setIsChangingPin] = useState(false);

  // Verificar disponibilidad de biometría
  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  // Cargar configuración actual
  useEffect(() => {
    if (isOpen) {
      loadSecuritySettings();
    }
  }, [isOpen, userId]);

  const checkBiometricAvailability = async () => {
    if (window.PublicKeyCredential) {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      setBiometricAvailable(available);
    }
  };

  const loadSecuritySettings = () => {
    try {
      const settings = localStorage.getItem(`security_${userId}`);
      if (settings) {
        const parsed = JSON.parse(settings);
        setIsPinEnabled(parsed.pinEnabled || false);
        setIsBiometricEnabled(parsed.biometricEnabled || false);
        setAutoLockTime(parsed.autoLockTime || 5);
      }
    } catch (error) {
      console.error('Error loading security settings:', error);
    }
  };

  const saveSecuritySettings = (settings: any) => {
    try {
      const current = localStorage.getItem(`security_${userId}`);
      const parsed = current ? JSON.parse(current) : {};
      const updated = { ...parsed, ...settings };
      localStorage.setItem(`security_${userId}`, JSON.stringify(updated));
      onSecurityChange?.();
    } catch (error) {
      console.error('Error saving security settings:', error);
      toast.error('Error al guardar configuración');
    }
  };

  const handleSetupPin = () => {
    if (!isPinEnabled) {
      setShowSetupPin(true);
      setIsChangingPin(false);
      setPin('');
      setConfirmPin('');
      setCurrentPin('');
    } else {
      // Cambiar PIN
      setIsChangingPin(true);
      setShowSetupPin(true);
      setPin('');
      setConfirmPin('');
      setCurrentPin('');
    }
  };

  const handleSavePin = () => {
    // Validar PIN actual si está cambiando
    if (isChangingPin) {
      const settings = localStorage.getItem(`security_${userId}`);
      if (settings) {
        const parsed = JSON.parse(settings);
        if (parsed.pin !== currentPin) {
          toast.error('PIN actual incorrecto');
          return;
        }
      }
    }

    // Validar longitud
    if (pin.length < 4 || pin.length > 6) {
      toast.error('El PIN debe tener entre 4 y 6 dígitos');
      return;
    }

    // Validar solo números
    if (!/^\d+$/.test(pin)) {
      toast.error('El PIN debe contener solo números');
      return;
    }

    // Validar confirmación
    if (pin !== confirmPin) {
      toast.error('Los PINs no coinciden');
      return;
    }

    // Guardar PIN
    saveSecuritySettings({
      pin: pin,
      pinEnabled: true,
      autoLockTime: autoLockTime,
    });

    setIsPinEnabled(true);
    setShowSetupPin(false);
    setPin('');
    setConfirmPin('');
    setCurrentPin('');
    toast.success(isChangingPin ? 'PIN actualizado correctamente' : 'PIN configurado correctamente');
  };

  const handleDisablePin = () => {
    saveSecuritySettings({
      pinEnabled: false,
      biometricEnabled: false,
    });
    setIsPinEnabled(false);
    setIsBiometricEnabled(false);
    toast.success('Seguridad con PIN desactivada');
  };

  const handleEnrollBiometric = async () => {
    if (!isPinEnabled) {
      toast.error('Primero debes configurar un PIN');
      return;
    }

    if (!biometricAvailable) {
      toast.error('Tu dispositivo no soporta autenticación biométrica');
      return;
    }

    try {
      // Crear credencial WebAuthn
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge: challenge,
        rp: {
          name: "Xigma Finanzas",
          id: window.location.hostname,
        },
        user: {
          id: new TextEncoder().encode(userId),
          name: userId,
          displayName: "Usuario Xigma",
        },
        pubKeyCredParams: [{ alg: -7, type: "public-key" }],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
        },
        timeout: 60000,
        attestation: "none",
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
      }) as PublicKeyCredential;

      if (credential) {
        // Guardar ID de credencial
        saveSecuritySettings({
          biometricEnabled: true,
          credentialId: Array.from(new Uint8Array(credential.rawId)),
        });
        setIsBiometricEnabled(true);
        toast.success('Autenticación biométrica configurada');
      }
    } catch (error: any) {
      console.error('Error enrolling biometric:', error);
      if (error.name === 'NotAllowedError') {
        toast.error('Autenticación cancelada');
      } else {
        toast.error('Error al configurar biometría');
      }
    }
  };

  const handleDisableBiometric = () => {
    saveSecuritySettings({
      biometricEnabled: false,
      credentialId: null,
    });
    setIsBiometricEnabled(false);
    toast.success('Autenticación biométrica desactivada');
  };

  const handleAutoLockChange = (minutes: number) => {
    setAutoLockTime(minutes);
    saveSecuritySettings({
      autoLockTime: minutes,
    });
    toast.success(`Auto-bloqueo configurado a ${minutes} minutos`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#A8E063] via-[#56C596] to-[#0FA07F] p-6 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-white text-xl">Seguridad</h2>
                <p className="text-white/80 text-sm">PIN y autenticación biométrica</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* PIN Section */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-2xl p-5 mb-4`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Lock className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <div>
                  <h3 className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    PIN de Seguridad
                  </h3>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {isPinEnabled ? 'PIN configurado' : 'Protege tu app con un PIN'}
                  </p>
                </div>
              </div>
              {isPinEnabled && (
                <Check className="w-5 h-5 text-green-500" />
              )}
            </div>

            {!showSetupPin ? (
              <div className="flex gap-2">
                {!isPinEnabled ? (
                  <Button
                    onClick={handleSetupPin}
                    className="flex-1 bg-gradient-to-r from-[#A8E063] via-[#56C596] to-[#0FA07F] hover:opacity-90 text-white"
                  >
                    Configurar PIN
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleSetupPin}
                      variant="outline"
                      className="flex-1"
                    >
                      Cambiar PIN
                    </Button>
                    <Button
                      onClick={handleDisablePin}
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {isChangingPin && (
                  <div>
                    <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      PIN Actual
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPin ? 'text' : 'password'}
                        value={currentPin}
                        onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="••••••"
                        className={`w-full px-4 py-3 rounded-xl border-2 ${
                          darkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:border-blue-500 focus:outline-none transition-colors`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPin(!showCurrentPin)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showCurrentPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Nuevo PIN (4-6 dígitos)
                  </label>
                  <div className="relative">
                    <input
                      type={showPin ? 'text' : 'password'}
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="••••••"
                      className={`w-full px-4 py-3 rounded-xl border-2 ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:border-blue-500 focus:outline-none transition-colors`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Confirmar PIN
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPin ? 'text' : 'password'}
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="••••••"
                      className={`w-full px-4 py-3 rounded-xl border-2 ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:border-blue-500 focus:outline-none transition-colors`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPin(!showConfirmPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setShowSetupPin(false);
                      setPin('');
                      setConfirmPin('');
                      setCurrentPin('');
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSavePin}
                    className="flex-1 bg-gradient-to-r from-[#A8E063] via-[#56C596] to-[#0FA07F] hover:opacity-90 text-white"
                    disabled={!pin || !confirmPin || (isChangingPin && !currentPin)}
                  >
                    Guardar
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Biometric Section */}
          {biometricAvailable && (
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-2xl p-5 mb-4`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Fingerprint className={`w-5 h-5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  <div>
                    <h3 className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Autenticación Biométrica
                    </h3>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {isBiometricEnabled ? 'Huella/Face ID configurada' : 'Usa tu huella o Face ID'}
                    </p>
                  </div>
                </div>
                {isBiometricEnabled && (
                  <Check className="w-5 h-5 text-green-500" />
                )}
              </div>

              <div className="flex gap-2">
                {!isBiometricEnabled ? (
                  <Button
                    onClick={handleEnrollBiometric}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-lime-600 hover:from-emerald-600 hover:to-lime-700 text-white"
                    disabled={!isPinEnabled}
                  >
                    <Fingerprint className="w-4 h-4 mr-2" />
                    Configurar Biometría
                  </Button>
                ) : (
                  <Button
                    onClick={handleDisableBiometric}
                    variant="outline"
                    className="flex-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Desactivar Biometría
                  </Button>
                )}
              </div>

              {!isPinEnabled && (
                <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Configura primero un PIN para habilitar la biometría
                </p>
              )}
            </div>
          )}

          {/* Auto-lock Section */}
          {isPinEnabled && (
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-2xl p-5`}>
              <h3 className={`mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Auto-bloqueo por inactividad
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {[1, 5, 10, 15, 30, 60].map((minutes) => (
                  <button
                    key={minutes}
                    onClick={() => handleAutoLockChange(minutes)}
                    className={`px-4 py-3 rounded-xl transition-all ${
                      autoLockTime === minutes
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : darkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {minutes < 60 ? `${minutes} min` : '1 hora'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}