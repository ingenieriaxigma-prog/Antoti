/**
 * =====================================================
 * PWA UTILITIES
 * =====================================================
 * 
 * Service Worker registration and PWA features
 * 
 * Features:
 * - Service Worker registration
 * - Install prompt handling
 * - Update notifications
 * - Offline detection
 * 
 * =====================================================
 */

import { toast } from 'sonner@2.0.3';

/**
 * Register Service Worker
 */
export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      });

      console.log('✅ Service Worker registered successfully:', registration.scope);

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available
              toast.info('Nueva versión disponible', {
                description: 'Hay una actualización de Oti disponible',
                action: {
                  label: 'Actualizar',
                  onClick: () => {
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                    window.location.reload();
                  }
                },
                duration: 10000
              });
            }
          });
        }
      });

      // Auto-update check every 30 minutes
      setInterval(() => {
        registration.update();
      }, 30 * 60 * 1000);

      return registration;
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      return null;
    }
  } else {
    console.warn('⚠️  Service Workers not supported in this browser');
    return null;
  }
}

/**
 * Handle PWA install prompt
 */
let deferredPrompt: any = null;

export function initInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    
    // Save the event for later use
    deferredPrompt = e;
    
    console.log('💾 PWA install prompt available');
    
    // Show custom install button/banner
    showInstallPrompt();
  });

  // Handle successful installation
  window.addEventListener('appinstalled', () => {
    console.log('✅ PWA installed successfully');
    deferredPrompt = null;
    
    toast.success('¡Oti instalado!', {
      description: 'Ahora puedes usar Oti como una app nativa'
    });
  });
}

/**
 * Show custom install prompt
 */
function showInstallPrompt() {
  // Show a toast or custom UI to prompt installation
  toast.info('Instala Oti', {
    description: 'Agrega Oti a tu pantalla de inicio para acceso rápido',
    action: {
      label: 'Instalar',
      onClick: () => promptInstall()
    },
    duration: 10000
  });
}

/**
 * Trigger PWA installation
 */
export async function promptInstall() {
  if (!deferredPrompt) {
    console.warn('⚠️  Install prompt not available');
    toast.error('No disponible', {
      description: 'La instalación no está disponible en este momento'
    });
    return false;
  }

  // Show the install prompt
  deferredPrompt.prompt();
  
  // Wait for the user's response
  const { outcome } = await deferredPrompt.userChoice;
  
  console.log(`PWA install prompt outcome: ${outcome}`);
  
  if (outcome === 'accepted') {
    console.log('✅ User accepted the install prompt');
    toast.success('Instalando...', {
      description: 'Oti se está instalando en tu dispositivo'
    });
  } else {
    console.log('❌ User dismissed the install prompt');
  }
  
  // Clear the prompt
  deferredPrompt = null;
  
  return outcome === 'accepted';
}

/**
 * Check if app is installed
 */
export function isInstalled(): boolean {
  // Check if running in standalone mode
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true ||
         document.referrer.includes('android-app://');
}

/**
 * Check if install prompt is available
 */
export function canInstall(): boolean {
  return deferredPrompt !== null;
}

/**
 * Monitor online/offline status
 */
export function initOfflineDetection() {
  function updateOnlineStatus() {
    if (navigator.onLine) {
      toast.success('Conexión restaurada', {
        description: 'Volviste a estar online',
        duration: 3000
      });
    } else {
      toast.error('Sin conexión', {
        description: 'Estás trabajando offline. Los cambios se sincronizarán cuando vuelvas a estar online.',
        duration: 5000
      });
    }
  }

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  // Log initial status
  console.log(`📡 Connection status: ${navigator.onLine ? 'Online' : 'Offline'}`);
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('⚠️  Notifications not supported');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * Show local notification
 */
export function showNotification(title: string, options?: NotificationOptions) {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/icon-192x192.png',
      badge: '/icon-72x72.png',
      ...options
    });
  }
}

/**
 * Initialize all PWA features
 */
export async function initPWA() {
  console.log('🚀 Initializing PWA features...');
  
  // Register service worker
  await registerServiceWorker();
  
  // Init install prompt
  initInstallPrompt();
  
  // Init offline detection
  initOfflineDetection();
  
  // Log PWA status
  console.log('📱 PWA Status:', {
    installed: isInstalled(),
    canInstall: canInstall(),
    notifications: Notification.permission
  });
  
  console.log('✅ PWA initialization complete');
}
