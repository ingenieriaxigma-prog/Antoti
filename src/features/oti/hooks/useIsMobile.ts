/**
 * 📱 HOOK PARA DETECTAR DISPOSITIVOS MÓVILES
 */

import { useState, useEffect } from 'react';

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detectar si es móvil por:
    // 1. Touch capability
    // 2. Screen width
    // 3. User agent
    const checkIsMobile = () => {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth < 768;
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      
      return hasTouch && (isSmallScreen || isMobileUA);
    };

    setIsMobile(checkIsMobile());

    // Redetectar en resize
    const handleResize = () => {
      setIsMobile(checkIsMobile());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}
