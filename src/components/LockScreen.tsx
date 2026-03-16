import { useState, useEffect, useRef } from 'react';
import { Lock, Fingerprint, Delete, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner@2.0.3';

interface LockScreenProps {
  darkMode: boolean;
  userId: string;
  onUnlock: () => void;
}

export default function LockScreen({ darkMode, userId, onUnlock }: LockScreenProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [showBiometric, setShowBiometric] = useState(false);
  const [pinLength, setPinLength] = useState(6); // Default to 6
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    console.log('🔒 LockScreen mounted');
    loadPinLength();
    checkBiometric();
    // Focus first input
    inputRefs.current[0]?.focus();
    
    return () => {
      console.log('🔓 LockScreen unmounted');
    };
  }, []);

  const loadPinLength = () => {
    try {
      const settings = localStorage.getItem(`security_${userId}`);
      if (settings) {
        const parsed = JSON.parse(settings);
        if (parsed.pin) {
          setPinLength(parsed.pin.length);
          console.log('📌 PIN length:', parsed.pin.length);
        }
      }
    } catch (error) {
      console.error('Error loading PIN length:', error);
    }
  };

  const checkBiometric = async () => {
    try {
      const settings = localStorage.getItem(`security_${userId}`);
      if (settings) {
        const parsed = JSON.parse(settings);
        if (parsed.biometricEnabled && window.PublicKeyCredential) {
          const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          setBiometricAvailable(available && parsed.biometricEnabled);
          setShowBiometric(available && parsed.biometricEnabled);
        }
      }
    } catch (error) {
      console.error('Error checking biometric:', error);
    }
  };

  const handlePinInput = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newPin = pin.split('');
    newPin[index] = value;
    const updatedPin = newPin.join('');
    setPin(updatedPin);
    setError(false);

    // Auto-verify when 6 digits entered
    if (updatedPin.length === pinLength) {
      verifyPin(updatedPin);
    }
  };

  const handleDelete = () => {
    if (pin.length > 0) {
      const newPin = pin.slice(0, -1);
      setPin(newPin);
      setError(false);
      inputRefs.current[newPin.length]?.focus();
    }
  };

  const verifyPin = (inputPin: string) => {
    try {
      const settings = localStorage.getItem(`security_${userId}`);
      if (settings) {
        const parsed = JSON.parse(settings);
        if (parsed.pin === inputPin) {
          // Success
          toast.success('Desbloqueado correctamente');
          onUnlock();
        } else {
          // Error
          setError(true);
          setAttempts(prev => prev + 1);
          setPin('');
          inputRefs.current[0]?.focus();
          
          if (attempts >= 2) {
            toast.error('Demasiados intentos fallidos');
          } else {
            toast.error('PIN incorrecto');
          }
        }
      }
    } catch (error) {
      console.error('Error verifying PIN:', error);
      toast.error('Error al verificar PIN');
    }
  };

  const handleBiometric = async () => {
    try {
      const settings = localStorage.getItem(`security_${userId}`);
      if (!settings) return;

      const parsed = JSON.parse(settings);
      if (!parsed.credentialId) return;

      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge: challenge,
        timeout: 60000,
        userVerification: "required",
        rpId: window.location.hostname,
      };

      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions,
      });

      if (assertion) {
        toast.success('Autenticado correctamente');
        onUnlock();
      }
    } catch (error: any) {
      console.error('Error with biometric:', error);
      if (error.name === 'NotAllowedError') {
        toast.error('Autenticación cancelada');
      } else {
        toast.error('Error en autenticación biométrica');
      }
    }
  };

  return (
    <div className={`fixed inset-0 z-[10000] ${darkMode ? 'bg-gray-900' : 'bg-white'} flex items-center justify-center`}>
      <div className="w-full max-w-md px-6">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="flex justify-center mb-8"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center shadow-2xl">
            <svg
              width="48"
              height="48"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M50 10 L80 25 L80 60 L50 75 L20 60 L20 25 Z"
                stroke="white"
                strokeWidth="3"
                fill="none"
              />
              <path
                d="M35 35 L65 65 M65 35 L35 65"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <h1 className={`text-2xl mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Bienvenido de vuelta
          </h1>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Ingresa tu PIN para continuar
          </p>
        </motion.div>

        {/* PIN Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex justify-center gap-3 mb-6">
            {Array.from({ length: pinLength }).map((_, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="password"
                inputMode="none"
                readOnly
                maxLength={1}
                value={pin[index] || ''}
                className={`w-12 h-14 text-center text-2xl rounded-xl border-2 transition-all ${
                  error
                    ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
                    : pin[index]
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                    : darkMode
                    ? 'border-gray-700 bg-gray-800 text-white'
                    : 'border-gray-300 bg-white text-gray-900'
                } focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              />
            ))}
          </div>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-center gap-2 text-red-600 text-sm mb-4"
              >
                <AlertCircle className="w-4 h-4" />
                <span>PIN incorrecto. Intenta nuevamente.</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => {
                  if (pin.length < pinLength) {
                    const index = pin.length;
                    handlePinInput(num.toString(), index);
                  }
                }}
                className={`h-14 rounded-xl text-xl transition-all flex items-center justify-center ${
                  darkMode
                    ? 'bg-gray-800 text-white hover:bg-gray-700 active:bg-gray-600'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300'
                } shadow-sm hover:shadow-md`}
              >
                {num}
              </button>
            ))}
            <button
              onClick={handleDelete}
              className={`h-14 rounded-xl transition-all flex items-center justify-center ${
                darkMode
                  ? 'bg-gray-800 text-white hover:bg-gray-700 active:bg-gray-600'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300'
              } shadow-sm hover:shadow-md`}
            >
              <Delete className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                if (pin.length < pinLength) {
                  const index = pin.length;
                  handlePinInput('0', index);
                }
              }}
              className={`h-14 rounded-xl text-xl transition-all flex items-center justify-center ${
                darkMode
                  ? 'bg-gray-800 text-white hover:bg-gray-700 active:bg-gray-600'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300'
              } shadow-sm hover:shadow-md`}
            >
              0
            </button>
            <div /> {/* Empty space */}
          </div>
        </motion.div>

        {/* Biometric */}
        {showBiometric && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <button
              onClick={handleBiometric}
              className={`mx-auto flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                darkMode
                  ? 'bg-gradient-to-r from-emerald-600 to-lime-600 hover:from-emerald-700 hover:to-lime-700'
                  : 'bg-gradient-to-r from-emerald-500 to-lime-500 hover:from-emerald-600 hover:to-lime-600'
              } text-white shadow-lg hover:shadow-xl`}
            >
              <Fingerprint className="w-5 h-5" />
              <span>Usar Huella/Face ID</span>
            </button>
          </motion.div>
        )}

        {/* Attempts counter */}
        {attempts > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-center mt-6 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
          >
            Intentos fallidos: {attempts}
          </motion.div>
        )}
      </div>
    </div>
  );
}