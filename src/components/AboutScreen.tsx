import { ArrowLeft, Sparkles, Heart, Code, Mail, Globe, Github, Linkedin, Trophy, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { OtiLogo } from './OtiLogo';

interface AboutScreenProps {
  onGoBack: () => void;
}

export default function AboutScreen({ onGoBack }: AboutScreenProps) {
  const appVersion = '1.0.0';
  const buildDate = 'Enero 2026';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#A8E063] via-[#56C596] to-[#0FA07F] text-white sticky top-0 z-10 shadow-lg">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onGoBack}
              className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="flex-1">Acerca de</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 space-y-6 max-w-2xl mx-auto">
        {/* App Logo & Name Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 text-center"
        >
          {/* Oti Logo */}
          <motion.div
            className="inline-flex items-center justify-center mb-4"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <OtiLogo variant="isotipo" className="w-32 h-32" />
          </motion.div>

          <h2 className="text-gray-900 dark:text-white mb-1">
            Oti
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Tu compañero financiero inteligente
          </p>

          {/* Version Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 px-4 py-2 rounded-full">
            <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm text-emerald-700 dark:text-emerald-300">
              Versión {appVersion}
            </span>
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            Actualizado: {buildDate}
          </p>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6"
        >
          <h3 className="text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-500" />
            Acerca de la App
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
            Una aplicación móvil de finanzas personales completa y moderna, diseñada para ayudarte a tomar el control total de tu dinero con inteligencia artificial.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Gestiona tus transacciones, cuentas, presupuestos y obtén análisis financieros inteligentes con nuestro asistente IA "Oti".
          </p>
        </motion.div>

        {/* Features Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6"
        >
          <h3 className="text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Características Principales
          </h3>
          <div className="space-y-3">
            {[
              'Registro de transacciones con reconocimiento de voz',
              'Gestión inteligente de cuentas y categorías',
              'Presupuestos mensuales con alertas',
              'Estadísticas y gráficos avanzados',
              'Carga de extractos bancarios con IA',
              'Asesor financiero con GPT-4o',
              'Chat "Oti" - Asistente de IA',
              'Sistema de temas dinámicos y modo oscuro',
              'Autenticación multi-usuario con Supabase',
              'Tour interactivo para nuevos usuarios',
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="flex items-start gap-3"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#A8E063] via-[#56C596] to-[#0FA07F] mt-2 shrink-0" />
                <p className="text-sm text-gray-600 dark:text-gray-300">{feature}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Developer Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6"
        >
          <h3 className="text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Code className="w-5 h-5 text-purple-500" />
            Desarrollado por
          </h3>
          
          {/* Xigma Ing Logo */}
          <div className="mb-4 flex items-center justify-center gap-3">
            <svg
              width="40"
              height="40"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M50 10 L80 25 L80 60 L50 75 L20 60 L20 25 Z"
                stroke="url(#gradient-logo)"
                strokeWidth="3"
                fill="none"
              />
              <path
                d="M35 35 L65 65 M65 35 L35 65"
                stroke="url(#gradient2-logo)"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="gradient-logo" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#14b8a6" />
                </linearGradient>
                <linearGradient id="gradient2-logo" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="50%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#14b8a6" />
                </linearGradient>
              </defs>
            </svg>
            <div>
              <p className="font-bold text-gray-900 dark:text-white">Xigma Ing.</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Ingeniería & Tecnología</p>
            </div>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            Soluciones tecnológicas innovadoras para la gestión financiera personal y empresarial.
          </p>

          {/* Contact Links */}
          <div className="space-y-2">
            <a
              href="mailto:contacto@xigmaing.com"
              className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 dark:text-white">Contacto</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">sistema@xigma.com.co</p>
              </div>
            </a>

            <a
              href="https://www.xigma.com.co"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-950/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 dark:text-white">Sitio Web</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">www.xigma.com.co</p>
              </div>
            </a>

            <a
              href="https://github.com/xigmaing"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Github className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 dark:text-white">GitHub</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">@xigmaing</p>
              </div>
            </a>

            <a
              href="https://linkedin.com/company/xigmaing"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Linkedin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 dark:text-white">LinkedIn</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Xigma Ing.</p>
              </div>
            </a>
          </div>
        </motion.div>

        {/* Legal & Tech Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6"
        >
          <h3 className="text-gray-900 dark:text-white mb-3">
            Tecnologías
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              'React',
              'TypeScript',
              'Tailwind CSS',
              'Motion',
              'Supabase',
              'PostgreSQL',
              'OpenAI GPT-4o',
              'Hono',
              'Web Speech API',
              'Recharts',
            ].map((tech, index) => (
              <motion.span
                key={tech}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.05 }}
                className="px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 text-blue-700 dark:text-blue-300 rounded-full text-xs"
              >
                {tech}
              </motion.span>
            ))}
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            © 2026 Xigma Ing. Todos los derechos reservados - Ing. Fabian S.M.S.
          </p>
        </motion.div>

        {/* Thank You Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-[#A8E063] via-[#56C596] to-[#0FA07F] rounded-2xl shadow-lg p-6 text-center text-white"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="inline-block mb-3"
          >
            <Heart className="w-8 h-8" />
          </motion.div>
          <h3 className="mb-2">
            ¡Gracias por usar nuestra app!
          </h3>
          <p className="text-sm opacity-90">
            Tu confianza nos impulsa a seguir mejorando cada día.
          </p>
        </motion.div>
      </div>
    </div>
  );
}