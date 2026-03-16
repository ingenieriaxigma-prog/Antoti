import { useRef } from 'react';
import otiIsologoLight from 'figma:asset/769764b6ad1c637a72e4172f3a22f74ce04d9c7b.png';

/**
 * 🎨 Open Graph Image Generator
 * 
 * Componente para generar una imagen Open Graph de 1200x630px
 * optimizada para WhatsApp, Facebook, Twitter, LinkedIn
 */
export default function OgImageGenerator({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dimensiones Open Graph estándar
    canvas.width = 1200;
    canvas.height = 630;

    // Fondo gradiente verde esmeralda (tema Oti)
    const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
    gradient.addColorStop(0, '#10b981'); // Verde esmeralda principal
    gradient.addColorStop(0.5, '#059669'); // Verde más oscuro
    gradient.addColorStop(1, '#047857'); // Verde profundo
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 630);

    // Overlay para mejor contraste
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, 1200, 630);

    // Texto principal
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 72px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Oti', 600, 280);

    // Subtítulo
    ctx.font = '38px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#f0fdf4'; // Verde muy claro
    ctx.fillText('Tu Asistente Financiero Personal con IA', 600, 340);

    // Descripción
    ctx.font = '28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#dcfce7'; // Verde pastel
    const description = 'Controla tus finanzas con inteligencia artificial';
    ctx.fillText(description, 600, 400);

    // Características
    ctx.font = '24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#d1fae5';
    ctx.fillText('✓ Registra gastos  ✓ Presupuestos  ✓ Estadísticas  ✓ Asesoría IA', 600, 460);

    // Logo (si está disponible)
    const logo = new Image();
    logo.crossOrigin = 'anonymous';
    logo.onload = () => {
      // Dibujar logo centrado en la parte superior
      const logoSize = 120;
      ctx.drawImage(logo, 600 - logoSize / 2, 80, logoSize, logoSize);

      // Descargar la imagen
      const link = document.createElement('a');
      link.download = 'oti-og-image-1200x630.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    logo.onerror = () => {
      // Si el logo falla, descargar sin él
      const link = document.createElement('a');
      link.download = 'oti-og-image-1200x630.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    logo.src = otiIsologoLight;
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 relative">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <span className="text-2xl text-gray-500 dark:text-gray-400">×</span>
        </button>
        
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            🎨 Generar Imagen Open Graph
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Esta imagen se usa para el preview en WhatsApp, Facebook, Twitter y LinkedIn
          </p>
        </div>

        {/* Preview */}
        <div className="aspect-[1200/630] w-full bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 rounded-lg relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center p-8">
            <img 
              src={otiIsologoLight} 
              alt="Oti Logo" 
              className="w-20 h-20 mb-4 rounded-full shadow-lg"
            />
            <h1 className="text-4xl font-bold mb-2">Oti</h1>
            <p className="text-xl opacity-90 mb-2">
              Tu Asistente Financiero Personal con IA
            </p>
            <p className="text-base opacity-75 mb-4">
              Controla tus finanzas con inteligencia artificial
            </p>
            <p className="text-sm opacity-60">
              ✓ Registra gastos  ✓ Presupuestos  ✓ Estadísticas  ✓ Asesoría IA
            </p>
          </div>
        </div>

        {/* Información */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-emerald-500">📐</span>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Dimensiones</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                1200 x 630 píxeles (Open Graph estándar)
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-500">🌐</span>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Compatible con</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                WhatsApp, Facebook, Twitter, LinkedIn, Discord
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-500">📤</span>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Siguiente paso</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Sube la imagen a un CDN (ImgBB, Cloudinary) y usa la URL en las meta tags
              </p>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-3">
          <button
            onClick={downloadImage}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            ⬇️ Descargar Imagen (1200x630)
          </button>
          <button
            onClick={() => window.open('https://imgbb.com/', '_blank')}
            className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            📤 Subir a ImgBB
          </button>
        </div>

        {/* Canvas oculto para generar la imagen */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Instrucciones */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            📝 Instrucciones:
          </h3>
          <ol className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
            <li>Descarga la imagen usando el botón verde</li>
            <li>Sube la imagen a ImgBB, Cloudinary o tu servidor</li>
            <li>Copia la URL de la imagen subida</li>
            <li>Usa esa URL en la meta tag: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">og:image</code></li>
            <li>Verifica en: <a href="https://developers.facebook.com/tools/debug/" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:underline">Facebook Debugger</a></li>
          </ol>
        </div>
      </div>
    </div>
  );
}