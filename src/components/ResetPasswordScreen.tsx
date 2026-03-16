import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Sparkles, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface ResetPasswordScreenProps {
  accessToken: string;
  onSuccess: () => void;
}

export default function ResetPasswordScreen({ accessToken, onSuccess }: ResetPasswordScreenProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!newPassword || !confirmPassword) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);

    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3/reset-password`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Error al cambiar la contraseña');
        return;
      }

      // Success
      setIsSuccess(true);
      toast.success('¡Contraseña actualizada exitosamente!');
      
      // Wait 2 seconds before redirecting
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('Error de conexión. Por favor intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 via-emerald-600 to-teal-500 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="text-center">
            <motion.div
              className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white shadow-lg mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            >
              <CheckCircle className="w-14 h-14 text-green-600" />
            </motion.div>
            
            <motion.h1
              className="text-white mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              ¡Contraseña Actualizada!
            </motion.h1>
            
            <motion.p
              className="text-white/90 mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Tu contraseña ha sido cambiada exitosamente.
              <br />
              Redirigiendo al inicio de sesión...
            </motion.p>

            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white shadow-lg mb-4"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Sparkles className="w-10 h-10 text-purple-600" />
          </motion.div>
          <h1 className="text-white mb-2">
            Nueva Contraseña
          </h1>
          <p className="text-white/80 text-sm">
            Ingresa tu nueva contraseña para continuar
          </p>
        </div>

        {/* Form */}
        <motion.div
          className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password field */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                Nueva Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10 pr-10"
                  disabled={isLoading}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Mínimo 6 caracteres
              </p>
            </div>

            {/* Confirm Password field */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Password strength indicator */}
            {newPassword && (
              <div className="space-y-2">
                <div className="flex gap-1">
                  <div className={`h-1 flex-1 rounded ${newPassword.length >= 6 ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div className={`h-1 flex-1 rounded ${newPassword.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div className={`h-1 flex-1 rounded ${newPassword.length >= 10 && /[A-Z]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`} />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {newPassword.length < 6 && 'Contraseña débil'}
                  {newPassword.length >= 6 && newPassword.length < 8 && 'Contraseña aceptable'}
                  {newPassword.length >= 8 && newPassword.length < 10 && 'Contraseña buena'}
                  {newPassword.length >= 10 && /[A-Z]/.test(newPassword) && 'Contraseña fuerte'}
                </p>
              </div>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 text-white py-6 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  Actualizando...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Lock className="w-5 h-5" />
                  Cambiar Contraseña
                </span>
              )}
            </Button>
          </form>

          {/* Info message */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl">
            <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
              🔒 Después de cambiar tu contraseña, podrás iniciar sesión con tus nuevas credenciales
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-white/60 text-xs">
            © 2025 Xigma Ing. • Tus datos están protegidos
          </p>
        </div>
      </motion.div>
    </div>
  );
}
