import { ArrowLeft, Check, Sparkles, Heart } from 'lucide-react';
import { useState } from 'react';
import BottomNav from './BottomNav';
import { ThemeConfirmationAnimation } from './ThemeConfirmationAnimation';
import type { ThemeKey } from '../types';
import { PROFILE_CARD_THEMES } from '../constants/theme';

interface ColorThemeProps {
  currentTheme: string;
  onSelectTheme: (theme: string) => void;
  onNavigate: (screen: string) => void;
}

const themes = [
  {
    id: 'blue',
    name: 'Azul',
    primary: '#3b82f6',
    secondary: '#60a5fa',
    gradient: 'from-blue-600 via-blue-500 to-blue-600',
    description: 'Fuerte y confiable',
    icon: '💪',
    decorationType: 'geometric',
  },
  {
    id: 'green',
    name: 'Verde',
    primary: '#10b981',
    secondary: '#34d399',
    gradient: 'from-emerald-500 via-emerald-600 to-emerald-700',
    description: 'Fresco y natural',
    icon: '🌿',
    decorationType: 'none',
  },
  {
    id: 'purple',
    name: 'Morado',
    primary: '#8b5cf6',
    secondary: '#a78bfa',
    gradient: 'from-purple-500 to-purple-600',
    description: 'Creativo y moderno',
    icon: '✨',
    decorationType: 'none',
  },
  {
    id: 'orange',
    name: 'Naranja',
    primary: '#f97316',
    secondary: '#fb923c',
    gradient: 'from-orange-500 to-orange-600',
    description: 'Energético y vibrante',
    icon: '🔥',
    decorationType: 'none',
  },
  {
    id: 'pink',
    name: 'Rosa',
    primary: '#ec4899',
    secondary: '#f472b6',
    gradient: 'from-pink-500 via-pink-400 to-pink-500',
    description: 'Delicado y encantador',
    icon: '🌸',
    decorationType: 'floral',
  },
  {
    id: 'teal',
    name: 'Turquesa',
    primary: '#14b8a6',
    secondary: '#2dd4bf',
    gradient: 'from-teal-500 to-teal-600',
    description: 'Equilibrado y sereno',
    icon: '🌊',
    decorationType: 'none',
  },
  {
    id: 'christmas',
    name: 'Navidad',
    primary: '#c62828',
    secondary: '#2e7d32',
    gradient: 'from-red-100 via-green-100 via-red-50 to-green-100',
    description: '¡Felices fiestas! 🎄🎅',
    icon: '🎄',
    decorationType: 'christmas',
  },
  {
    id: 'rainbow',
    name: 'Unisex',
    primary: '#ec4899',
    secondary: '#8b5cf6',
    gradient: 'from-red-500 via-yellow-500 via-green-500 via-blue-500 via-indigo-500 to-purple-500',
    description: 'Amor es amor ❤️🧡💛💚💙💜',
    icon: '🏳️‍🌈',
    decorationType: 'rainbow',
  },
];

// Decorative SVG components
const FloralDecoration = () => (
  <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
    {/* Delicate flowers */}
    <g className="animate-float">
      {/* Top right flower */}
      <circle cx="85%" cy="15%" r="8" fill="white" opacity="0.4" />
      <circle cx="82%" cy="12%" r="4" fill="white" opacity="0.3" />
      <circle cx="88%" cy="12%" r="4" fill="white" opacity="0.3" />
      <circle cx="82%" cy="18%" r="4" fill="white" opacity="0.3" />
      <circle cx="88%" cy="18%" r="4" fill="white" opacity="0.3" />
      <circle cx="85%" cy="15%" r="3" fill="#fff" opacity="0.6" />
      
      {/* Butterfly */}
      <path d="M 15 20 Q 12 15, 10 18 Q 8 16, 10 14 L 15 20 Z" fill="white" opacity="0.35" />
      <path d="M 15 20 Q 18 15, 20 18 Q 22 16, 20 14 L 15 20 Z" fill="white" opacity="0.35" />
      
      {/* Small flowers scattered */}
      <circle cx="20%" cy="75%" r="5" fill="white" opacity="0.3" />
      <circle cx="17%" cy="72%" r="2.5" fill="white" opacity="0.25" />
      <circle cx="23%" cy="72%" r="2.5" fill="white" opacity="0.25" />
      <circle cx="17%" cy="78%" r="2.5" fill="white" opacity="0.25" />
      <circle cx="23%" cy="78%" r="2.5" fill="white" opacity="0.25" />
      
      {/* Hearts */}
      <path d="M 80 75 Q 78 72, 80 70 Q 82 72, 80 75 Z" fill="white" opacity="0.3" />
      <path d="M 88 65 Q 86 62, 88 60 Q 90 62, 88 65 Z" fill="white" opacity="0.25" />
    </g>
  </svg>
);

const GeometricDecoration = () => (
  <svg className="absolute inset-0 w-full h-full opacity-15 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
    {/* Strong geometric shapes */}
    <g>
      {/* Hexagons */}
      <polygon points="85,10 95,15 95,25 85,30 75,25 75,15" fill="white" opacity="0.4" />
      <polygon points="15,70 25,75 25,85 15,90 5,85 5,75" fill="white" opacity="0.35" />
      
      {/* Triangles */}
      <polygon points="10,15 20,15 15,5" fill="white" opacity="0.3" />
      <polygon points="90,80 95,90 85,90" fill="white" opacity="0.3" />
      
      {/* Lines/Stripes */}
      <line x1="5%" y1="40%" x2="20%" y2="40%" stroke="white" strokeWidth="2" opacity="0.3" />
      <line x1="80%" y1="55%" x2="95%" y2="55%" stroke="white" strokeWidth="2" opacity="0.3" />
      
      {/* Squares */}
      <rect x="75" y="60" width="10" height="10" fill="white" opacity="0.25" />
      <rect x="20" y="25" width="8" height="8" fill="white" opacity="0.3" transform="rotate(45 24 29)" />
    </g>
  </svg>
);

const RainbowDecoration = () => (
  <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
    {/* Rainbow hearts and stars */}
    <g>
      {/* Hearts */}
      <path d="M 20 20 Q 15 15, 10 20 T 20 30 T 30 20 Q 25 15, 20 20 Z" fill="#ff0000" opacity="0.4" />
      <path d="M 80 70 Q 77 67, 74 70 T 80 77 T 86 70 Q 83 67, 80 70 Z" fill="#ff7700" opacity="0.4" />
      
      {/* Stars */}
      <path d="M 90 15 L 92 20 L 97 20 L 93 23 L 95 28 L 90 25 L 85 28 L 87 23 L 83 20 L 88 20 Z" fill="#ffff00" opacity="0.4" />
      <path d="M 15 75 L 17 80 L 22 80 L 18 83 L 20 88 L 15 85 L 10 88 L 12 83 L 8 80 L 13 80 Z" fill="#00ff00" opacity="0.4" />
      
      {/* Small circles */}
      <circle cx="50%" cy="15%" r="4" fill="#0000ff" opacity="0.35" />
      <circle cx="25%" cy="50%" r="5" fill="#4b0082" opacity="0.35" />
      <circle cx="75%" cy="45%" r="4" fill="#9400d3" opacity="0.35" />
      
      {/* Sparkles */}
      <path d="M 85 85 L 86 87 L 88 86 L 86 88 L 87 90 L 85 88 L 83 90 L 84 88 L 82 86 L 84 87 Z" fill="white" opacity="0.5" />
      <path d="M 30 30 L 31 32 L 33 31 L 31 33 L 32 35 L 30 33 L 28 35 L 29 33 L 27 31 L 29 32 Z" fill="white" opacity="0.5" />
    </g>
  </svg>
);

const ChristmasDecoration = () => (
  <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
    {/* Christmas decorations */}
    <g className="animate-float">
      {/* Snowflakes */}
      <g transform="translate(85, 15)">
        <circle cx="0" cy="0" r="1.5" fill="white" opacity="0.7" />
        <line x1="0" y1="-6" x2="0" y2="6" stroke="white" strokeWidth="1.2" opacity="0.6" />
        <line x1="-6" y1="0" x2="6" y2="0" stroke="white" strokeWidth="1.2" opacity="0.6" />
        <line x1="-4.5" y1="-4.5" x2="4.5" y2="4.5" stroke="white" strokeWidth="1.2" opacity="0.6" />
        <line x1="4.5" y1="-4.5" x2="-4.5" y2="4.5" stroke="white" strokeWidth="1.2" opacity="0.6" />
      </g>
      
      <g transform="translate(15, 75)">
        <circle cx="0" cy="0" r="1.5" fill="white" opacity="0.7" />
        <line x1="0" y1="-5" x2="0" y2="5" stroke="white" strokeWidth="1" opacity="0.6" />
        <line x1="-5" y1="0" x2="5" y2="0" stroke="white" strokeWidth="1" opacity="0.6" />
        <line x1="-4" y1="-4" x2="4" y2="4" stroke="white" strokeWidth="1" opacity="0.6" />
        <line x1="4" y1="-4" x2="-4" y2="4" stroke="white" strokeWidth="1" opacity="0.6" />
      </g>
      
      {/* Christmas Stars */}
      <path d="M 50 20 L 51.5 24 L 56 24 L 52.5 27 L 54 31 L 50 28 L 46 31 L 47.5 27 L 44 24 L 48.5 24 Z" fill="#ffd700" opacity="0.6" />
      
      {/* Christmas Tree */}
      <g transform="translate(25, 40)">
        <polygon points="0,-7 -5,-2 -3,-2 -6,2 -4,2 -7,6 7,6 4,2 6,2 3,-2 5,-2" 
          fill="#2e7d32" 
          opacity="0.7" />
        <rect x="-1.5" y="6" width="3" height="3" fill="#795548" opacity="0.6" />
        <path d="M 0 -8 L 0.5 -7 L 1.5 -7 L 0.7 -6.3 L 1 -5.3 L 0 -6 L -1 -5.3 L -0.7 -6.3 L -1.5 -7 L -0.5 -7 Z" 
          fill="#ffd700" 
          opacity="0.7" />
        <circle cx="-3" cy="1" r="1" fill="#c62828" opacity="0.7" />
        <circle cx="2" cy="0" r="1" fill="#c62828" opacity="0.7" />
      </g>
      
      {/* Candy Cane */}
      <g transform="translate(75, 60)">
        <path d="M 0 -7 Q 3 -7, 3 -4 Q 3 -2, 1 -1 L 1 6" 
          stroke="white" 
          strokeWidth="2.5" 
          fill="none" 
          opacity="0.6"
          strokeLinecap="round" />
        <line x1="0.5" y1="-6.5" x2="1.5" y2="-5.5" stroke="#c62828" strokeWidth="2" opacity="0.7" strokeLinecap="round" />
        <line x1="2" y1="-3.5" x2="2.5" y2="-2.5" stroke="#c62828" strokeWidth="2" opacity="0.7" strokeLinecap="round" />
        <line x1="1" y1="0" x2="1" y2="1.5" stroke="#c62828" strokeWidth="2" opacity="0.7" strokeLinecap="round" />
        <line x1="1" y1="3" x2="1" y2="4.5" stroke="#c62828" strokeWidth="2" opacity="0.7" strokeLinecap="round" />
      </g>
      
      {/* Holly berries */}
      <circle cx="20" cy="25" r="3" fill="#c62828" opacity="0.6" />
      <circle cx="17" cy="28" r="2.5" fill="#c62828" opacity="0.5" />
      <circle cx="23" cy="28" r="2.5" fill="#c62828" opacity="0.5" />
      
      <circle cx="80" cy="80" r="3" fill="#c62828" opacity="0.6" />
      <circle cx="77" cy="83" r="2.5" fill="#c62828" opacity="0.5" />
      <circle cx="83" cy="83" r="2.5" fill="#c62828" opacity="0.5" />
      
      {/* Small sparkles */}
      <path d="M 30 50 L 31 52 L 33 51 L 31 53 L 32 55 L 30 53 L 28 55 L 29 53 L 27 51 L 29 52 Z" fill="white" opacity="0.7" />
      <path d="M 70 60 L 71 62 L 73 61 L 71 63 L 72 65 L 70 63 L 68 65 L 69 63 L 67 61 L 69 62 Z" fill="white" opacity="0.7" />
    </g>
  </svg>
);

export default function ColorTheme({ currentTheme, onSelectTheme, onNavigate }: ColorThemeProps) {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);
  const [showAnimation, setShowAnimation] = useState(false);
  const [animatingTheme, setAnimatingTheme] = useState<ThemeKey | null>(null);

  const handleSelectTheme = (themeId: string) => {
    setSelectedTheme(themeId);
    onSelectTheme(themeId);
    
    // Show celebration animation
    setAnimatingTheme(themeId as ThemeKey);
    setShowAnimation(true);
  };

  const handleAnimationComplete = () => {
    setShowAnimation(false);
    setAnimatingTheme(null);
    // Auto-navigate back to settings
    setTimeout(() => {
      onNavigate('settings');
    }, 300); // Small delay for smooth transition
  };

  const renderDecoration = (decorationType: string) => {
    switch (decorationType) {
      case 'floral':
        return <FloralDecoration />;
      case 'geometric':
        return <GeometricDecoration />;
      case 'rainbow':
        return <RainbowDecoration />;
      case 'christmas':
        return <ChristmasDecoration />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col mobile-screen-height bg-gray-50 dark:bg-gray-950 prevent-overscroll">
      {/* Inline styles for animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        @keyframes rainbow-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .rainbow-animated {
          background-size: 200% 200%;
          animation: rainbow-shift 3s ease infinite;
        }
      `}</style>

      {/* Header - Fixed al top */}
      <div className="fixed-top-header bg-white dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-800 shadow-sm z-10 safe-area-top">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('settings')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg -ml-2 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <h1 className="text-gray-900 dark:text-white">Tema de Color</h1>
          <div className="w-9" />
        </div>
      </div>

      {/* Content - Scrollable con padding para header pequeño y nav fijos */}
      <div className="flex-1 overflow-y-auto content-with-header-sm-and-nav momentum-scroll">
        <div className="p-6">
          {/* Description */}
          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-400 text-center">
              Selecciona un tema de color para personalizar tu experiencia
            </p>
          </div>

          {/* Theme Options */}
          <div className="space-y-3">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleSelectTheme(theme.id)}
                className={`w-full bg-white dark:bg-gray-900 rounded-2xl border-2 transition-all overflow-hidden shadow-sm hover:shadow-md ${
                  selectedTheme === theme.id
                    ? 'border-current scale-[1.02]'
                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                }`}
                style={{
                  borderColor: selectedTheme === theme.id ? theme.primary : undefined,
                }}
              >
                {/* Color Preview - Más compacto */}
                <div 
                  className={`h-32 bg-gradient-to-br ${theme.gradient} relative overflow-hidden ${
                    theme.id === 'rainbow' ? 'rainbow-animated' : ''
                  }`}
                >
                  {/* Render decorations */}
                  {renderDecoration(theme.decorationType)}
                  
                  {/* Check badge - Más grande y mejor posicionado */}
                  {selectedTheme === theme.id && (
                    <div className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg z-10">
                      <Check className="w-6 h-6" style={{ color: theme.primary }} />
                    </div>
                  )}
                  
                  {/* Color circles - Más grandes y centrados */}
                  <div className="absolute inset-0 flex items-center justify-center z-5">
                    <div className="flex gap-4">
                      <div
                        className="w-16 h-16 rounded-full shadow-xl"
                        style={{ 
                          backgroundColor: theme.id === 'rainbow' 
                            ? 'rgba(236, 72, 153, 0.9)' 
                            : `${theme.primary}B3`
                        }}
                      />
                      <div
                        className="w-16 h-16 rounded-full shadow-xl"
                        style={{ 
                          backgroundColor: theme.id === 'rainbow' 
                            ? 'rgba(139, 92, 246, 0.9)' 
                            : `${theme.secondary}B3`
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Theme icon - Bottom left */}
                  <div className="absolute bottom-3 left-4 text-2xl opacity-80 z-5 filter drop-shadow-md">
                    {theme.icon}
                  </div>
                </div>

                {/* Theme Info - Más espaciado */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{theme.name}</h3>
                    {selectedTheme === theme.id && (
                      <span 
                        className="text-xs font-medium px-3 py-1.5 rounded-full" 
                        style={{ 
                          backgroundColor: theme.primary + '20', 
                          color: theme.primary 
                        }}
                      >
                        Activo
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-left">
                    {theme.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-300 text-center">
              💡 El tema de color se aplicará a todos los elementos de la aplicación
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav currentScreen="settings" onNavigate={onNavigate} />
      
      {/* Theme Confirmation Animation */}
      {showAnimation && animatingTheme && (
        <ThemeConfirmationAnimation
          theme={animatingTheme}
          gradient={PROFILE_CARD_THEMES[animatingTheme].gradient}
          onComplete={handleAnimationComplete}
        />
      )}
    </div>
  );
}