import { useEffect, useState } from 'react';

interface ThemeHeaderEffectsProps {
  theme: string;
}

/**
 * ThemeHeaderEffects Component
 * 
 * Efectos visuales temáticos para los headers de las pantallas principales
 * según el tema seleccionado por el usuario.
 * 
 * Efectos por tema:
 * - Navidad (christmas): ❄️ Efecto de nieve cayendo
 * - Rosa (pink): 🌸 Pétalos flotantes
 * - Turquesa (teal): 🌊 Burbujas ascendentes
 * - Arcoíris (rainbow): ✨ Confetti de colores
 * - Azul (blue): 💎 Geometría flotante
 * - Naranja (orange): 🔥 Chispas ascendentes
 * - Morado (purple): ✨ Estrellas brillantes
 * - Verde (green): 🍃 Hojas flotantes
 */
export function ThemeHeaderEffects({ theme }: ThemeHeaderEffectsProps) {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    delay: number;
    duration: number;
    size: number;
  }>>([]);

  useEffect(() => {
    // Generar partículas aleatorias
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4,
      size: 4 + Math.random() * 8,
    }));
    setParticles(newParticles);
  }, [theme]);

  // No mostrar efectos si no hay tema
  if (!theme) {
    return null;
  }

  return (
    <>
      <style>{`
        @keyframes snowfall {
          0% { 
            transform: translateY(-10px) translateX(0) rotate(0deg); 
            opacity: 0; 
          }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { 
            transform: translateY(100px) translateX(20px) rotate(360deg); 
            opacity: 0; 
          }
        }
        
        @keyframes petalFloat {
          0% { 
            transform: translateY(-10px) translateX(0) rotate(0deg); 
            opacity: 0; 
          }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { 
            transform: translateY(100px) translateX(-30px) rotate(-180deg); 
            opacity: 0; 
          }
        }
        
        @keyframes bubbleRise {
          0% { 
            transform: translateY(100px) scale(0); 
            opacity: 0; 
          }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { 
            transform: translateY(-20px) scale(1); 
            opacity: 0; 
          }
        }
        
        @keyframes confettiFall {
          0% { 
            transform: translateY(-10px) rotate(0deg) scale(1); 
            opacity: 0; 
          }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { 
            transform: translateY(100px) rotate(720deg) scale(0.5); 
            opacity: 0; 
          }
        }
        
        @keyframes geometricFloat {
          0%, 100% { 
            transform: translateY(0) rotate(0deg); 
            opacity: 0.3; 
          }
          50% { 
            transform: translateY(-20px) rotate(180deg); 
            opacity: 0.6; 
          }
        }
        
        @keyframes sparkRise {
          0% { 
            transform: translateY(20px) scale(0); 
            opacity: 0; 
          }
          50% { 
            opacity: 1; 
            transform: translateY(-50px) scale(1); 
          }
          100% { 
            transform: translateY(-100px) scale(0); 
            opacity: 0; 
          }
        }
        
        @keyframes starTwinkle {
          0%, 100% { 
            transform: scale(0) rotate(0deg); 
            opacity: 0; 
          }
          50% { 
            transform: scale(1) rotate(180deg); 
            opacity: 1; 
          }
        }
        
        @keyframes leafFloat {
          0% { 
            transform: translateY(-10px) translateX(0) rotate(0deg); 
            opacity: 0; 
          }
          10% { opacity: 0.7; }
          90% { opacity: 0.7; }
          100% { 
            transform: translateY(100px) translateX(15px) rotate(360deg); 
            opacity: 0; 
          }
        }
      `}</style>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* ❄️ NAVIDAD - Nieve cayendo */}
        {theme === 'christmas' && (
          <>
            {particles.map((particle) => (
              <div
                key={particle.id}
                className="absolute top-0 w-2 h-2 bg-white rounded-full shadow-lg"
                style={{
                  left: `${particle.x}%`,
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  animation: `snowfall ${particle.duration}s linear ${particle.delay}s infinite`,
                  opacity: 0.8,
                  boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
                }}
              />
            ))}
            {/* Cristales de hielo */}
            {particles.slice(0, 5).map((particle) => (
              <div
                key={`ice-${particle.id}`}
                className="absolute top-0"
                style={{
                  left: `${particle.x}%`,
                  animation: `snowfall ${particle.duration + 1}s linear ${particle.delay + 1}s infinite`,
                  fontSize: '16px',
                  opacity: 0.6,
                }}
              >
                ❄️
              </div>
            ))}
          </>
        )}

        {/* 🌸 ROSA - Pétalos flotantes */}
        {theme === 'pink' && (
          <>
            {particles.map((particle) => (
              <div
                key={particle.id}
                className="absolute top-0"
                style={{
                  left: `${particle.x}%`,
                  width: `${particle.size}px`,
                  height: `${particle.size * 1.5}px`,
                  background: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)',
                  borderRadius: '50% 0 50% 0',
                  animation: `petalFloat ${particle.duration}s ease-in-out ${particle.delay}s infinite`,
                  opacity: 0.7,
                }}
              />
            ))}
            {/* Flores emoji */}
            {particles.slice(0, 8).map((particle) => (
              <div
                key={`flower-${particle.id}`}
                className="absolute top-0"
                style={{
                  left: `${particle.x}%`,
                  animation: `petalFloat ${particle.duration + 0.5}s ease-in-out ${particle.delay + 0.5}s infinite`,
                  fontSize: '14px',
                  opacity: 0.6,
                }}
              >
                🌸
              </div>
            ))}
          </>
        )}

        {/* 🌊 TURQUESA - Burbujas ascendentes */}
        {theme === 'teal' && (
          <>
            {particles.map((particle) => (
              <div
                key={particle.id}
                className="absolute bottom-0 rounded-full border-2 border-teal-300/40"
                style={{
                  left: `${particle.x}%`,
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4), rgba(20, 184, 166, 0.2))',
                  animation: `bubbleRise ${particle.duration}s ease-in ${particle.delay}s infinite`,
                  boxShadow: 'inset 0 0 8px rgba(255, 255, 255, 0.3)',
                }}
              />
            ))}
          </>
        )}

        {/* 🏳️‍🌈 ARCOÍRIS - Confetti de colores */}
        {theme === 'rainbow' && (
          <>
            {particles.map((particle, index) => {
              const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];
              const color = colors[index % colors.length];
              return (
                <div
                  key={particle.id}
                  className="absolute top-0"
                  style={{
                    left: `${particle.x}%`,
                    width: `${particle.size}px`,
                    height: `${particle.size * 2}px`,
                    backgroundColor: color,
                    animation: `confettiFall ${particle.duration}s linear ${particle.delay}s infinite`,
                    opacity: 0.8,
                  }}
                />
              );
            })}
          </>
        )}

        {/* 💎 AZUL - Geometría flotante */}
        {theme === 'blue' && (
          <>
            {particles.slice(0, 10).map((particle) => (
              <div
                key={particle.id}
                className="absolute"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.delay * 10}%`,
                  width: `${particle.size + 4}px`,
                  height: `${particle.size + 4}px`,
                  border: '2px solid rgba(59, 130, 246, 0.4)',
                  animation: `geometricFloat ${particle.duration + 2}s ease-in-out ${particle.delay}s infinite`,
                }}
              />
            ))}
          </>
        )}

        {/* 🔥 NARANJA - Chispas ascendentes */}
        {theme === 'orange' && (
          <>
            {particles.map((particle) => (
              <div
                key={particle.id}
                className="absolute bottom-0"
                style={{
                  left: `${particle.x}%`,
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  background: 'radial-gradient(circle, #fbbf24 0%, #f97316 50%, #dc2626 100%)',
                  borderRadius: '50%',
                  animation: `sparkRise ${particle.duration - 1}s ease-out ${particle.delay}s infinite`,
                  boxShadow: '0 0 10px rgba(249, 115, 22, 0.6)',
                }}
              />
            ))}
          </>
        )}

        {/* ✨ MORADO - Estrellas brillantes */}
        {theme === 'purple' && (
          <>
            {particles.map((particle) => (
              <div
                key={particle.id}
                className="absolute"
                style={{
                  left: `${particle.x}%`,
                  top: `${Math.random() * 100}%`,
                  fontSize: '16px',
                  animation: `starTwinkle ${particle.duration}s ease-in-out ${particle.delay}s infinite`,
                }}
              >
                ✨
              </div>
            ))}
          </>
        )}

        {/* 🍃 VERDE - Hojas flotantes */}
        {theme === 'green' && (
          <>
            {particles.slice(0, 12).map((particle) => (
              <div
                key={particle.id}
                className="absolute top-0"
                style={{
                  left: `${particle.x}%`,
                  fontSize: '14px',
                  animation: `leafFloat ${particle.duration}s ease-in-out ${particle.delay}s infinite`,
                  opacity: 0.6,
                }}
              >
                🍃
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
}
