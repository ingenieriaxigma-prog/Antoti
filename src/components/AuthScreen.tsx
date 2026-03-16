import { motion } from 'framer-motion';
import { useState } from 'react';
import { Eye, EyeOff, Loader2, Mail, Lock, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { OtiLogo } from './OtiLogo';

interface AuthScreenProps {
  onAuthSuccess: (user: { id: string; email: string; name: string }, accessToken: string, refreshToken: string) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(false); // Changed to false to show Signup by default
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Por favor ingresa tu correo electrónico');
      return;
    }

    setIsLoading(true);

    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3/forgot-password`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Manejo especial para rate limit
        if (response.status === 429) {
          const retryMinutes = Math.ceil((data.retryAfter || 3600) / 60);
          
          // Distinguir entre rate limit de usuario vs servidor
          if (data.code === 'USER_RATE_LIMIT_EXCEEDED') {
            toast.error(
              data.message || `Has alcanzado el límite de 3 intentos. Por favor espera ${retryMinutes} minutos e intenta nuevamente.`,
              { duration: 10000 }
            );
          } else if (data.code === 'SERVER_RATE_LIMIT_EXCEEDED') {
            toast.error(
              data.message || `El servidor ha alcanzado el límite de correos por hora. Por favor espera ${retryMinutes} minutos.`,
              { duration: 10000 }
            );
          } else {
            toast.error(
              data.message || `Límite de intentos alcanzado. Por favor espera ${retryMinutes} minutos e intenta nuevamente.`,
              { duration: 8000 }
            );
          }
        } else {
          toast.error(data.error || 'Error al enviar el correo de recuperación');
        }
        return;
      }

      // Mostrar mensaje de éxito con intentos restantes
      const attemptsRemaining = data.attemptsRemaining ?? null;
      if (attemptsRemaining !== null && attemptsRemaining > 0) {
        toast.success(
          `¡Correo enviado! Revisa tu bandeja de entrada. Intentos restantes hoy: ${attemptsRemaining}/3`,
          { duration: 6000 }
        );
      } else if (attemptsRemaining === 0) {
        toast.success(
          '¡Correo enviado! Revisa tu bandeja de entrada. ⚠️ Este fue tu último intento disponible.',
          { duration: 8000 }
        );
      } else {
        toast.success('¡Correo de recuperación enviado! Revisa tu bandeja de entrada.');
      }
      
      setIsForgotPassword(false);
      setIsLogin(true);
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error('Error de conexión. Por favor intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    if (!isLogin && !name) {
      toast.error('Por favor ingresa tu nombre');
      return;
    }

    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = isLogin ? 'login' : 'signup';
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3/${endpoint}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          email,
          password,
          ...(isLogin ? {} : { name }),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show more helpful error messages
        if (data.error) {
          toast.error(data.error);
          
          // Si es login y el error menciona credenciales inválidas, mostrar ayuda adicional
          if (isLogin && (
            data.error.includes('Invalid login credentials') || 
            data.error.includes('Contraseña incorrecta') ||
            data.error.includes('no existe')
          )) {
            setPassword('');
            
            // Mostrar información de ayuda después de 2 segundos
            setTimeout(() => {
              toast.info('💡 ¿Primera vez? Usa la pestaña "Registrarse" para crear tu cuenta.', {
                duration: 6000,
              });
            }, 2000);
          }
        } else {
          // Error genérico
          toast.error('❌ Error de autenticación. Por favor verifica tus datos.');
          
          if (isLogin) {
            setTimeout(() => {
              toast.info('💡 Si no tienes cuenta, usa la pestaña "Registrarse" para crear una.', {
                duration: 5000,
              });
            }, 2500);
          }
        }
        
        // Log error details for debugging
        console.error('❌ Login error:', data.error);
        console.error('   Error status:', response.status);
        
        return;
      }

      // ✅ Check if email verification is required
      if (data.requiresVerification) {
        toast.success('✅ Cuenta creada exitosamente!', {
          description: `📧 Hemos enviado un email de verificación a ${email}. Por favor revisa tu bandeja de entrada (y carpeta de spam) antes de iniciar sesión.`,
          duration: 10000,
        });
        
        // Switch to login mode
        setIsLogin(true);
        setPassword('');
        return;
      }

      // Success - auto-login
      toast.success(isLogin ? '¡Bienvenido de nuevo!' : '¡Cuenta creada exitosamente!');
      onAuthSuccess(data.user, data.access_token, data.refresh_token);
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('Error de conexión. Por favor intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    
    try {
      // Import Supabase client singleton
      const { supabase } = await import('../utils/supabase/client');

      console.log('🔐 [Google Login] Initiating OAuth flow...');

      // Initiate Google OAuth flow
      // IMPORTANT: Complete setup at https://supabase.com/docs/guides/auth/social-login/auth-google
      // NO especificar redirectTo - dejar que Supabase use su URL por defecto
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('❌ [Google Login] Error:', error);
        
        // Check if provider is not enabled
        if (error.message.includes('provider') || error.message.includes('enabled')) {
          toast.error('⚠️ Google login no está configurado. Por favor contacta al administrador.', {
            duration: 6000,
          });
        } else {
          toast.error(`Error al iniciar sesión con Google: ${error.message}`);
        }
        setIsGoogleLoading(false);
        return;
      }

      console.log('✅ [Google Login] Redirecting to Google...');
      // The user will be redirected to Google for authentication
      // After successful auth, they'll be redirected back to the app
      toast.info('Redirigiendo a Google...', { duration: 2000 });
      
    } catch (error) {
      console.error('❌ [Google Login] Catch error:', error);
      toast.error('Error al iniciar sesión con Google');
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo Oficial de Oti */}
        <div className="text-center mb-10">
          <motion.div
            className="flex justify-center"
            initial={{ scale: 0.8, opacity: 0, y: -20 }}
            animate={{ 
              scale: 1, 
              opacity: 1, 
              y: 0,
            }}
            transition={{ 
              type: 'spring', 
              stiffness: 200, 
              damping: 15,
              duration: 0.6
            }}
          >
            <motion.div
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              whileHover={{ scale: 1.05 }}
              className="relative"
              style={{
                filter: 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.1)) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.06))'
              }}
            >
              <OtiLogo className="w-28 h-20" />
            </motion.div>
          </motion.div>

          {/* ✨ Frase Motivacional */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-6 text-gray-600 dark:text-gray-400 text-sm sm:text-base max-w-sm mx-auto"
          >
            {isLogin 
              ? 'Bienvenido de nuevo' 
              : 'Toma el control de tus finanzas'}
          </motion.p>
        </div>

        {/* Auth Form */}
        <motion.div
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-800"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          {/* Forgot Password View */}
          {isForgotPassword ? (
            <>
              <div className="mb-6">
                <h2 className="text-gray-900 dark:text-white text-xl mb-2">Recuperar Contraseña</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ingresa tu correo para restablecer tu contraseña
                </p>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-5">
                {/* Email field */}
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <Input
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11 border-gray-300 dark:border-gray-700 focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Submit button con gradiente verde Oti */}
                <Button
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #004D2C 0%, #00A651 50%, #B8E61A 100%)',
                  }}
                  className="w-full hover:opacity-90 text-white h-12 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      Enviando...
                    </span>
                  ) : (
                    'Enviar Correo'
                  )}
                </Button>

                {/* Back button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setIsLogin(true);
                  }}
                  className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors py-2"
                >
                  ← Volver
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Tabs con colores oficiales Oti */}
              <div className="flex gap-2 mb-8">
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-3 text-sm font-medium transition-all border-b-2 ${
                    isLogin
                      ? 'border-emerald-500 dark:border-lime-500 text-emerald-600 dark:text-lime-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Iniciar Sesión
                </button>
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-3 text-sm font-medium transition-all border-b-2 ${
                    !isLogin
                      ? 'border-emerald-500 dark:border-lime-500 text-emerald-600 dark:text-lime-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Registrarse
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name field (only for signup) */}
                {!isLogin && (
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Nombre
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                      <Input
                        type="text"
                        placeholder="Tu nombre"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10 h-11 border-gray-300 dark:border-gray-700 focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                )}

                {/* Email field */}
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <Input
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11 border-gray-300 dark:border-gray-700 focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password field */}
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="•••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-11 border-gray-300 dark:border-gray-700 focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {!isLogin && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Mínimo 6 caracteres</p>
                  )}
                </div>

                {/* Google Login Button - MOVIDO ARRIBA */}
                <div className="mt-6">
                  <Button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isGoogleLoading || isLoading}
                    className="w-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 h-12 rounded-xl transition-all border-2 border-gray-300 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-lime-500 shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    {isGoogleLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-4 h-4 border-2 border-gray-700 dark:border-gray-300 border-t-transparent rounded-full"
                        />
                        Conectando...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        Continuar con Google
                      </span>
                    )}
                  </Button>
                </div>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">o usa tu correo</span>
                  </div>
                </div>

                {/* Submit Button - Crear Cuenta / Iniciar Sesión */}
                <Button
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #004D2C 0%, #00A651 50%, #B8E61A 100%)',
                  }}
                  className="w-full hover:opacity-90 text-white h-12 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      Procesando...
                    </span>
                  ) : (
                    isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'
                  )}
                </Button>

                {/* Forgot password link con color verde Oti */}
                {isLogin && (
                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-sm text-emerald-600 dark:text-lime-400 hover:text-emerald-700 dark:hover:text-lime-300 transition-colors"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                )}
              </form>
            </>
          )}
        </motion.div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-xs">
            © 2026 Xigma Ing.
          </p>
        </div>
      </motion.div>
    </div>
  );
}