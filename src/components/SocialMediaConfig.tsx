import { useState } from 'react';
import { ArrowLeft, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import OgImageGenerator from './OgImageGenerator';

interface SocialMediaConfigProps {
  onGoBack: () => void;
}

export default function SocialMediaConfig({ onGoBack }: SocialMediaConfigProps) {
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const metaTagsHTML = `<!-- 🔥 META TAGS PARA REDES SOCIALES -->
<meta property="og:title" content="Oti - Tu Asistente Financiero Personal con IA">
<meta property="og:description" content="Controla tus finanzas con inteligencia artificial: registra gastos, crea presupuestos, analiza tus hábitos y recibe asesoría financiera personalizada.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://www.finanzapersonal.com">
<meta property="og:site_name" content="Oti">
<meta property="og:locale" content="es_ES">
<meta property="og:image" content="[REEMPLAZA-CON-TU-URL-DE-IMAGEN]">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Oti - Tu Asistente Financiero Personal con IA">
<meta name="twitter:description" content="Controla tus finanzas con inteligencia artificial: registra gastos, crea presupuestos, analiza tus hábitos y recibe asesoría financiera personalizada.">
<meta name="twitter:image" content="[REEMPLAZA-CON-TU-URL-DE-IMAGEN]">`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onGoBack}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                🌐 Configuración Redes Sociales
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                WhatsApp, Facebook, Twitter, LinkedIn
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6 max-w-3xl mx-auto">
        {/* Estado actual */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                Acción requerida
              </h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Los scrapers de redes sociales NO ejecutan JavaScript. Necesitas agregar meta tags estáticas en el HTML base o usar un servicio de pre-rendering.
              </p>
            </div>
          </div>
        </div>

        {/* Paso 1: Generar imagen */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold flex-shrink-0">
              1
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Generar Imagen Open Graph
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Crea una imagen de 1200x630px optimizada para el preview en redes sociales
              </p>
              <button
                onClick={() => setShowImageGenerator(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                🎨 Generar Imagen
              </button>
            </div>
          </div>
        </div>

        {/* Paso 2: Subir imagen */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold flex-shrink-0">
              2
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Subir Imagen a un CDN
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Sube la imagen generada a un servicio público para obtener una URL permanente
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <a
                  href="https://imgbb.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  ImgBB <ExternalLink className="w-4 h-4" />
                </a>
                <a
                  href="https://cloudinary.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Cloudinary <ExternalLink className="w-4 h-4" />
                </a>
                <a
                  href="https://imgur.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Imgur <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Paso 3: Copiar meta tags */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold flex-shrink-0">
              3
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Copiar Meta Tags
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Reemplaza <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs">[REEMPLAZA-CON-TU-URL-DE-IMAGEN]</code> con la URL de tu imagen
              </p>
              <div className="relative">
                <pre className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-xs overflow-x-auto border border-gray-200 dark:border-gray-700">
                  <code className="text-gray-800 dark:text-gray-200">{metaTagsHTML}</code>
                </pre>
                <button
                  onClick={() => copyToClipboard(metaTagsHTML, 'meta-tags')}
                  className="absolute top-2 right-2 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded text-xs font-medium transition-colors"
                >
                  {copiedText === 'meta-tags' ? '✓ Copiado' : '📋 Copiar'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Paso 4: Soluciones de hosting */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold flex-shrink-0">
              4
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Implementar Solución
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Elige una de estas opciones según tu nivel técnico:
              </p>

              <div className="space-y-3">
                {/* Vercel/Netlify */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Vercel / Netlify (Recomendado)
                    </h3>
                    <span className="ml-auto text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded">
                      Gratis
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Despliega tu app en Vercel o Netlify. Detectan automáticamente los bots y sirven HTML pre-renderizado.
                  </p>
                  <div className="flex gap-2">
                    <a
                      href="https://vercel.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded font-medium transition-colors inline-flex items-center gap-1"
                    >
                      Vercel <ExternalLink className="w-3 h-3" />
                    </a>
                    <a
                      href="https://www.netlify.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded font-medium transition-colors inline-flex items-center gap-1"
                    >
                      Netlify <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Cloudflare Workers */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Cloudflare Workers
                    </h3>
                    <span className="ml-auto text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded">
                      Gratis
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Crea un Worker que intercepte las peticiones de bots y sirva HTML estático con meta tags.
                  </p>
                  <a
                    href="https://workers.cloudflare.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded font-medium transition-colors inline-flex items-center gap-1"
                  >
                    Cloudflare Workers <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Prerender.io */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Prerender.io
                    </h3>
                    <span className="ml-auto text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded">
                      $10/mes
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Servicio especializado en pre-renderizar apps para SEO y redes sociales.
                  </p>
                  <a
                    href="https://prerender.io/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded font-medium transition-colors inline-flex items-center gap-1"
                  >
                    Prerender.io <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Paso 5: Verificar */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold flex-shrink-0">
              5
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Verificar Configuración
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Prueba que tus meta tags funcionan correctamente
              </p>
              <div className="space-y-2">
                <a
                  href="https://developers.facebook.com/tools/debug/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg p-3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📘</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Facebook Debugger
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Verifica el preview de WhatsApp y Facebook
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </a>

                <a
                  href="https://www.linkedin.com/post-inspector/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg p-3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💼</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        LinkedIn Post Inspector
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Verifica el preview de LinkedIn
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </a>

                <a
                  href="https://cards-dev.twitter.com/validator"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg p-3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🐦</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Twitter Card Validator
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Verifica el preview de Twitter/X
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Documentación adicional */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📚</span>
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Documentación completa
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Consulta <code className="bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded">/META_TAGS_INSTRUCTIONS.md</code> para instrucciones detalladas.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de generador de imagen */}
      {showImageGenerator && (
        <OgImageGenerator onClose={() => setShowImageGenerator(false)} />
      )}
    </div>
  );
}
