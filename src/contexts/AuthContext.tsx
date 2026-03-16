/**
 * AuthContext
 * 
 * Context para manejar el estado de autenticación
 * - Usuario actual
 * - Token de acceso
 * - Estado de carga
 * - Funciones de login/logout
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { projectId } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';
// ❌ ELIMINADO: CleanupService ya no es necesario
import { logger } from '../utils/logger';
import { supabase } from '../utils/supabase/client';

interface User {
  id: string;
  email: string;
  name: string;
  photoUrl?: string | null;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  occupation?: string;
}

interface AuthContextType {
  // State
  isAuthenticated: boolean;
  currentUser: User | null;
  accessToken: string | null;
  isCheckingAuth: boolean;
  isResettingPassword: boolean;
  resetToken: string | null;
  
  // Actions
  setIsAuthenticated: (value: boolean) => void;
  setCurrentUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  setIsCheckingAuth: (value: boolean) => void;
  setIsResettingPassword: (value: boolean) => void;
  setResetToken: (token: string | null) => void;
  getAccessToken: () => Promise<string | null>;
  handleAuthSuccess: (user: User, token: string, refreshToken: string) => void;
  handleLogout: () => void;
  handleUpdateProfile: (updates: { name?: string; photoUrl?: string | null }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return localStorage.getItem('accessToken');
  });
  const [refreshToken, setRefreshToken] = useState<string | null>(() => {
    return localStorage.getItem('refreshToken');
  });
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  // ✅ Helper function to fetch complete user profile from database
  const fetchUserProfile = async (token: string): Promise<User | null> => {
    try {
      console.log('🔍 [fetchUserProfile] Fetching user profile from database...');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3/session`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      console.log('🔍 [fetchUserProfile] Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ [fetchUserProfile] User profile received:', {
          id: data.user?.id?.substring(0, 8) + '...',
          email: data.user?.email,
          name: data.user?.name,
          hasPhotoUrl: !!data.user?.photoUrl,
          photoUrlPreview: data.user?.photoUrl?.substring(0, 50) + '...',
        });
        return data.user;
      }
      
      console.warn('❌ [fetchUserProfile] Failed to fetch profile, status:', response.status);
      return null;
    } catch (error) {
      logger.error('❌ [fetchUserProfile] Error fetching user profile:', error);
      return null;
    }
  };

  // ✅ FIX CRÍTICO: Sincronizar accessToken con localStorage automáticamente
  useEffect(() => {
    if (accessToken) {
      const storedToken = localStorage.getItem('accessToken');
      if (storedToken !== accessToken) {
        localStorage.setItem('accessToken', accessToken);
      }
    }
  }, [accessToken]);

  // ✅ FIX CRÍTICO: Sincronizar currentUser con localStorage automáticamente
  useEffect(() => {
    if (currentUser) {
      const storedUser = localStorage.getItem('currentUser');
      const storedUserObj = storedUser ? JSON.parse(storedUser) : null;
      if (JSON.stringify(storedUserObj) !== JSON.stringify(currentUser)) {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
      }
    }
  }, [currentUser]);

  // Check authentication on mount
  useEffect(() => {
    let authListener: any = null;

    const checkAuth = async () => {
      logger.log('🚀 [AuthContext] Iniciando checkAuth...');
      logger.log('📍 [AuthContext] URL actual:', window.location.href);
      logger.log('📍 [AuthContext] Hash:', window.location.hash);
      logger.log('📍 [AuthContext] Search params:', window.location.search);
      
      // 🔥 SÚPER CRÍTICO: Configurar el listener PRIMERO, ANTES de cualquier verificación
      // Esto asegura que capturemos el evento PASSWORD_RECOVERY que Supabase dispara automáticamente
      logger.log('⚡ [AuthContext] Configurando listener de auth state ANTES de verificaciones...');
      
      const { data: authData } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
        logger.log('🔔 [AuthContext] Auth state change event:', event, { hasSession: !!session, sessionType: session?.user?.aud });
        
        // PASSWORD_RECOVERY event is triggered when user clicks the reset link
        if (event === 'PASSWORD_RECOVERY' && session?.access_token) {
          logger.log('✅✅✅ [AuthContext] PASSWORD_RECOVERY event detected!');
          logger.log('🔐 [AuthContext] Setting reset token and showing ResetPasswordScreen');
          logger.log('🔑 [AuthContext] Token preview:', session.access_token.substring(0, 30) + '...');
          
          setResetToken(session.access_token);
          setIsResettingPassword(true);
          setIsCheckingAuth(false);
          
          // Clean up the URL
          window.history.replaceState(null, '', window.location.pathname);
          return;
        }
        
        // Handle OAuth sign-in (Google, etc.)
        if (event === 'SIGNED_IN' && session?.access_token) {
          logger.log('✅ [AuthContext] User signed in (possibly via OAuth)');
          
          // Check if this is an OAuth sign-in
          const user = session.user;
          if (user && user.app_metadata?.provider) {
            logger.log('🔐 [AuthContext] OAuth sign-in detected:', user.app_metadata.provider);
            
            // ✅ FIX: Get complete profile from database (including photoUrl)
            const completeProfile = await fetchUserProfile(session.access_token);
            
            // Extract user info
            const userData = completeProfile || {
              id: user.id,
              email: user.email || '',
              name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario',
              photoUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
            };
            
            // Store tokens
            localStorage.setItem('accessToken', session.access_token);
            localStorage.setItem('refreshToken', session.refresh_token || '');
            localStorage.setItem('currentUser', JSON.stringify(userData));
            
            // Update state
            setAccessToken(session.access_token);
            setRefreshToken(session.refresh_token || '');
            setCurrentUser(userData);
            setIsAuthenticated(true);
            setIsCheckingAuth(false);
            
            logger.log('✅ [AuthContext] OAuth user authenticated successfully');
            
            // Capturar información del dispositivo (non-blocking)
            fetch(`https://${projectId}.supabase.co/functions/v1/make-server-727b50c3/capture-device`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${session.access_token}`,
              }
            })
              .then(res => {
                if (!res.ok) {
                  throw new Error(`HTTP ${res.status}`);
                }
                return res.json();
              })
              .catch(err => {
                logger.warn('⚠️ Error capturando info de dispositivo (no crítico):', err);
              });
            
            // Mostrar mensaje de éxito
            toast.success(`¡Bienvenido ${userData.name}! 🎉`);
            
            return;
          }
        }

        // 🔄 Handle token refresh
        if (event === 'TOKEN_REFRESHED' && session?.access_token) {
          logger.log('🔄 [AuthContext] Token refreshed, updating state');
          
          localStorage.setItem('accessToken', session.access_token);
          setAccessToken(session.access_token);
          
          if (session.refresh_token) {
            localStorage.setItem('refreshToken', session.refresh_token);
            setRefreshToken(session.refresh_token);
          }
          
          logger.log('✅ [AuthContext] Tokens updated after refresh');
        }
      });

      authListener = authData.subscription;
      
      logger.log('✅ [AuthContext] Listener configurado - ahora verificando auth...');
      
      // 🔥 CRÍTICO: Dar tiempo a Supabase para procesar la URL y disparar eventos
      // Especialmente importante para PASSWORD_RECOVERY y OAuth
      logger.log('⏳ [AuthContext] Esperando 100ms para que Supabase procese la URL...');
      await new Promise(resolve => setTimeout(resolve, 100));
      
      logger.log('✅ [AuthContext] Continuando con verificaciones de auth...');
      
      // 🔥🔥🔥 SÚPER CRÍTICO: Verificar INMEDIATAMENTE si hay una sesión de RECOVERY
      // Esto debe hacerse ANTES de cualquier otra cosa porque el evento PASSWORD_RECOVERY
      // puede no dispararse si la página ya cargó
      try {
        logger.log('🔍 [AuthContext] Verificando si hay sesión de recovery activa...');
        const { data: { session: recoverySession }, error: recoveryError } = await supabase.auth.getSession();
        
        logger.log('🔍 [AuthContext] Sesión obtenida:', {
          hasSession: !!recoverySession,
          hasAccessToken: !!recoverySession?.access_token,
          userAud: recoverySession?.user?.aud,
          userEmail: recoverySession?.user?.email
        });
        
        // Verificar si es una sesión de recovery
        // En Supabase, después de hacer clic en el link de recovery, se crea una sesión temporal
        if (recoverySession?.access_token) {
          // Verificar el hash de la URL para confirmar que es recovery
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const typeFromHash = hashParams.get('type');
          
          logger.log('🔍 [AuthContext] Type from hash:', typeFromHash);
          
          // Si el hash dice "recovery" o si no hay hash pero venimos de Supabase
          const isRecoveryLink = typeFromHash === 'recovery' || 
                                document.referrer.includes('supabase.co/auth/v1/verify');
          
          logger.log('🔍 [AuthContext] Is recovery link?:', isRecoveryLink, {
            typeFromHash,
            referrer: document.referrer
          });
          
          if (isRecoveryLink) {
            logger.log('✅✅✅ [AuthContext] SESIÓN DE RECOVERY DETECTADA!');
            logger.log('🔐 [AuthContext] Mostrando pantalla de reset de contraseña...');
            logger.log('🔑 [AuthContext] Token preview:', recoverySession.access_token.substring(0, 30) + '...');
            
            setResetToken(recoverySession.access_token);
            setIsResettingPassword(true);
            setIsCheckingAuth(false);
            
            // Limpiar la URL
            window.history.replaceState(null, '', window.location.pathname);
            
            logger.log('✅ [AuthContext] ResetPasswordScreen configurada - debería mostrarse ahora');
            return; // EXIT EARLY - No continuar con otras verificaciones
          }
        }
        
        logger.log('ℹ️ [AuthContext] No es una sesión de recovery, continuando...');
        
      } catch (error) {
        logger.error('❌ [AuthContext] Error verificando sesión de recovery:', error);
      }
      
      // Extraer tokens del hash para verificaciones fallback
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessTokenFromHash = hashParams.get('access_token');
      const refreshTokenFromHash = hashParams.get('refresh_token');
      const typeFromHash = hashParams.get('type');
      
      logger.log('🔍 [AuthContext] Tokens en hash (fallback check):', {
        hasAccessToken: !!accessTokenFromHash,
        hasRefreshToken: !!refreshTokenFromHash,
        type: typeFromHash
      });
      
      // 🔥 CRÍTICO: Primero checkear si hay una sesión activa de Supabase (OAuth callback)
      // Esto DEBE ir ANTES de buscar el hash, porque el callback de OAuth no usa hash
      
      // Detectar si venimos de un callback de OAuth (el referrer será accounts.google.com)
      const comesFromOAuth = document.referrer.includes('accounts.google.com') || 
                             document.referrer.includes('oauth');
      
      logger.debug('[AuthContext] Viene de OAuth?:', comesFromOAuth);
      logger.debug('[AuthContext] Referrer:', document.referrer);
      
      // 🔥 Si venimos de OAuth, configurar listener PRIMERO y esperar el evento SIGNED_IN
      if (comesFromOAuth) {
        logger.info('[AuthContext] OAuth callback detectado - procesando sesión...');
        
        // 🔥 CRÍTICO: Forzar a Supabase a procesar la URL inmediatamente
        // detectSessionInUrl no siempre funciona automáticamente, hay que llamar getSession()
        try {
          logger.debug('[AuthContext] Llamando getSession() para forzar procesamiento...');
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          
          logger.debug('[AuthContext] Resultado de getSession():', {
            hasSession: !!sessionData?.session,
            hasAccessToken: !!sessionData?.session?.access_token,
            error: sessionError
          });
          
          if (sessionError) {
            logger.error('[AuthContext] Error en getSession():', sessionError);
          }
          
          // Si ya tenemos sesión, procesarla inmediatamente
          if (sessionData?.session?.access_token) {
            logger.info('[AuthContext] ¡SESIÓN OAUTH OBTENIDA INMEDIATAMENTE!');
            const session = sessionData.session;
            const user = session.user;
            
            // ✅ FIX: Get complete profile from database (including photoUrl)
            const completeProfile = await fetchUserProfile(session.access_token);
            
            const userData = completeProfile || {
              id: user.id,
              email: user.email || '',
              name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario',
              photoUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
            };

            logger.debug('[AuthContext] Usuario OAuth:', userData);
            logger.debug('[AuthContext] Access Token:', session.access_token);

            // Guardar en localStorage
            localStorage.setItem('currentUser', JSON.stringify(userData));
            localStorage.setItem('accessToken', session.access_token);
            if (session.refresh_token) {
              localStorage.setItem('refreshToken', session.refresh_token);
            }

            // Actualizar estado
            setCurrentUser(userData);
            setAccessToken(session.access_token);
            if (session.refresh_token) {
              setRefreshToken(session.refresh_token);
            }
            setIsAuthenticated(true);
            setIsCheckingAuth(false);

            logger.info('[AuthContext] OAuth login completado exitosamente!');
            toast.success(`¡Bienvenido ${userData.name}! 🎉`);
            
            // Limpiar la URL de los parámetros OAuth
            window.history.replaceState({}, document.title, window.location.pathname);
            
            return; // Salir temprano - ya procesamos el OAuth
          }
          
        } catch (error) {
          logger.error('[AuthContext] Error forzando getSession():', error);
        }
        
        // Si getSession() no devolvió sesión, esperar por el evento
        logger.debug('[AuthContext] getSession() no devolvió sesión, esperando evento SIGNED_IN...');
        
        // Crear una promesa que se resolverá cuando llegue el evento SIGNED_IN
        const waitForOAuthSession = new Promise<any>((resolve) => {
          const { data: authData } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
            logger.debug('[AuthContext] Evento durante espera OAuth:', event, { hasSession: !!session });
            
            if (event === 'SIGNED_IN' && session?.access_token) {
              logger.info('[AuthContext] ¡SIGNED_IN recibido! Procesando...');
              authListener = authData.subscription;
              resolve(session);
            }
          });
        });
        
        // Esperar máximo 10 segundos por el evento
        const timeoutPromise = new Promise<null>((resolve) => {
          setTimeout(() => {
            logger.debug('[AuthContext] Timeout esperando evento OAuth');
            resolve(null);
          }, 10000);
        });
        
        const oauthSession = await Promise.race([waitForOAuthSession, timeoutPromise]);
        
        if (oauthSession?.access_token) {
          logger.info('[AuthContext] SESIÓN OAUTH OBTENIDA VÍA EVENTO!');
          logger.debug('📧 Email:', oauthSession.user?.email);
          logger.debug('🔑 Provider:', oauthSession.user?.app_metadata?.provider);
          
          // ✅ FIX: Get complete profile from database (including photoUrl)
          const completeProfile = await fetchUserProfile(oauthSession.access_token);
          
          const userData = completeProfile || {
            id: oauthSession.user.id,
            email: oauthSession.user.email || '',
            name: oauthSession.user.user_metadata?.full_name || 
                  oauthSession.user.user_metadata?.name || 
                  oauthSession.user.email?.split('@')[0] || 
                  'Usuario',
            photoUrl: oauthSession.user.user_metadata?.avatar_url || 
                      oauthSession.user.user_metadata?.picture || 
                      null,
          };
          
          // Store tokens
          localStorage.setItem('accessToken', oauthSession.access_token);
          if (oauthSession.refresh_token) {
            localStorage.setItem('refreshToken', oauthSession.refresh_token);
          }
          localStorage.setItem('currentUser', JSON.stringify(userData));
          
          // Update state immediately
          setAccessToken(oauthSession.access_token);
          if (oauthSession.refresh_token) {
            setRefreshToken(oauthSession.refresh_token);
          }
          setCurrentUser(userData);
          setIsAuthenticated(true);
          setIsCheckingAuth(false);
          
          // Clean URL (remove any fragments)
          window.history.replaceState(null, '', window.location.pathname);
          
          // Show success message
          toast.success(`¡Bienvenido ${userData.name}! 🎉`);
          
          logger.info('[AuthContext] OAuth login completado exitosamente!');
          
          // Background tasks
          // CleanupService.silentCleanup(oauthSession.access_token).catch(err => {
          //   logger.warn('⚠️ Error en limpieza automática (no crítico):', err);
          // });
          
          fetch(`https://${projectId}.supabase.co/functions/v1/make-server-727b50c3/capture-device`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${oauthSession.access_token}`,
            }
          })
            .then(res => {
              if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
              }
              return res.json();
            })
            .catch(err => {
              logger.warn('⚠️ Error capturando info de dispositivo (no crítico):', err);
            });
          
          return; // Exit early - user is now authenticated
        } else {
          logger.error('[AuthContext] No se recibió evento SIGNED_IN en el tiempo esperado');
          // Continuar con flujo normal
        }
      }
      
      // Función helper para obtener sesión con retry (para callbacks de OAuth)
      const getSessionWithRetry = async (maxRetries = 10): Promise<any> => {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          logger.debug(`🔄 [AuthContext] Intento ${attempt}/${maxRetries} de obtener sesión...`);
          
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (session?.access_token) {
            logger.info('✅ [AuthContext] ¡Sesión encontrada en intento', attempt, '!');
            return { session, error };
          }
          
          // Si no es el último intento, esperar antes de reintentar
          if (attempt < maxRetries) {
            logger.debug(`⏳ [AuthContext] Sesión no encontrada, esperando 1000ms...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        logger.error('❌ [AuthContext] No se encontró sesión después de', maxRetries, 'intentos');
        return { session: null, error: null };
      };
      
      // Si venimos de OAuth, usar retry logic; si no, obtener sesión normalmente
      const { session: initialSession, error: sessionError } = comesFromOAuth
        ? await getSessionWithRetry(10)
        : await supabase.auth.getSession().then(({ data, error }) => ({ session: data.session, error }));
      
      if (initialSession?.access_token) {
        logger.info('[AuthContext] SESIÓN ACTIVA DE SUPABASE DETECTADA!');
        logger.debug('📧 Email:', initialSession.user?.email);
        logger.debug('🔑 Provider:', initialSession.user?.app_metadata?.provider);
        
        // Verificar si es un login OAuth (Google, etc)
        if (initialSession.user?.app_metadata?.provider) {
          logger.info('✅✅✅ [AuthContext] OAuth login detectado - procesando...');
          
          // ✅ FIX: Get complete profile from database (including photoUrl)
          const completeProfile = await fetchUserProfile(initialSession.access_token);
          
          const userData = completeProfile || {
            id: initialSession.user.id,
            email: initialSession.user.email || '',
            name: initialSession.user.user_metadata?.full_name || 
                  initialSession.user.user_metadata?.name || 
                  initialSession.user.email?.split('@')[0] || 
                  'Usuario',
            photoUrl: initialSession.user.user_metadata?.avatar_url || 
                      initialSession.user.user_metadata?.picture || 
                      null,
          };
          
          // Store tokens
          localStorage.setItem('accessToken', initialSession.access_token);
          if (initialSession.refresh_token) {
            localStorage.setItem('refreshToken', initialSession.refresh_token);
          }
          localStorage.setItem('currentUser', JSON.stringify(userData));
          
          // Update state immediately
          setAccessToken(initialSession.access_token);
          if (initialSession.refresh_token) {
            setRefreshToken(initialSession.refresh_token);
          }
          setCurrentUser(userData);
          setIsAuthenticated(true);
          setIsCheckingAuth(false);
          
          // Clean URL (remove any fragments)
          window.history.replaceState(null, '', window.location.pathname);
          
          // Show success message
          toast.success(`¡Bienvenido ${userData.name}! 🎉`);
          
          logger.info('[AuthContext] OAuth login completado exitosamente!');
          
          // Background tasks
          // CleanupService.silentCleanup(initialSession.access_token).catch(err => {
          //   logger.warn('⚠️ Error en limpieza automática (no crítico):', err);
          // });
          
          fetch(`https://${projectId}.supabase.co/functions/v1/make-server-727b50c3/capture-device`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${initialSession.access_token}`,
            }
          })
            .then(res => {
              if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
              }
              return res.json();
            })
            .catch(err => {
              logger.warn('⚠️ Error capturando info de dispositivo (no crítico):', err);
            });
          
          // Set up listener for future events (but don't continue checking)
          const { data: authData } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
            logger.debug('[AuthContext] Auth event (post-OAuth):', event);
          });
          authListener = authData.subscription;
          
          return; // Exit early - user is now authenticated
        }
      }

      // SOLUCIÓN ROBUSTA: Detectar OAuth callback inmediatamente (FALLBACK)
      // Cuando Google redirige, la URL tiene formato: #access_token=xxx&refresh_token=yyy
      // ✅ Ya declaramos hashParams, accessTokenFromHash y typeFromHash al inicio
      // Solo necesitamos usarlos aquí (no re-declararlos)
      
      // ✅ FIX CRÍTICO: Si es type=recovery, NO procesarlo como OAuth
      // (Ya se verificó al inicio, esto es redundante pero lo dejamos como fallback)
      if (typeFromHash === 'recovery' && accessTokenFromHash) {
        logger.log('🔐 [AuthContext] PASSWORD RECOVERY detected in hash (fallback check)! Showing reset screen...');
        setResetToken(accessTokenFromHash);
        setIsResettingPassword(true);
        setIsCheckingAuth(false);
        
        // Clean up the URL
        window.history.replaceState(null, '', window.location.pathname);
        return; // ✅ Exit early - don't process as OAuth
      }
      
      if (accessTokenFromHash && typeFromHash !== 'recovery') { // ✅ Solo procesar como OAuth si NO es recovery
        logger.info('[AuthContext] OAUTH DETECTED IN URL! Processing immediately...');
        
        // Get user info from Supabase using the access token
        const { data: { user }, error: userError } = await supabase.auth.getUser(accessTokenFromHash);
        
        if (user && !userError) {
          logger.info('✅✅✅ [AuthContext] User data retrieved from OAuth token:', user.email);
          
          // ✅ FIX: Get complete profile from database (including photoUrl)
          const completeProfile = await fetchUserProfile(accessTokenFromHash);
          
          const userData = completeProfile || {
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario',
            photoUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
          };
          
          // Store tokens
          localStorage.setItem('accessToken', accessTokenFromHash);
          if (refreshTokenFromHash) {
            localStorage.setItem('refreshToken', refreshTokenFromHash);
          }
          localStorage.setItem('currentUser', JSON.stringify(userData));
          
          // Update state immediately
          setAccessToken(accessTokenFromHash);
          if (refreshTokenFromHash) {
            setRefreshToken(refreshTokenFromHash);
          }
          setCurrentUser(userData);
          setIsAuthenticated(true);
          setIsCheckingAuth(false);
          
          // Clean URL
          window.history.replaceState(null, '', window.location.pathname);
          
          // Show success message
          toast.success(`¡Bienvenido ${userData.name}! 🎉`);
          
          logger.info('[AuthContext] OAuth login completed successfully!');
          
          // Background tasks
          // CleanupService.silentCleanup(accessTokenFromHash).catch(err => {
          //   logger.warn('⚠️ Error en limpieza automática (no crítico):', err);
          // });
          
          fetch(`https://${projectId}.supabase.co/functions/v1/make-server-727b50c3/capture-device`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessTokenFromHash}`,
            }
          })
            .then(res => {
              if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
              }
              return res.json();
            })
            .catch(err => {
              logger.warn('⚠️ Error capturando info de dispositivo (no crítico):', err);
            });
          
          return; // Exit early, don't continue with normal auth flow
        } else {
          logger.error('❌ [AuthContext] Error getting user from OAuth token:', userError);
        }
      }

      // Check for existing session (if not already handled above)
      // This handles password recovery flows
      logger.log('🔍 [AuthContext] Initial session check:', { 
        hasSession: !!initialSession, 
        userAud: initialSession?.user?.aud,
        accessTokenPreview: initialSession?.access_token?.substring(0, 20) + '...' 
      });

      // Check if this is a recovery session
      if (initialSession?.access_token && initialSession?.user?.aud === 'authenticated') {
        // Check if user needs to reset password (recovery flow)
        // In Supabase, after clicking the reset link, a temporary session is created
        // We need to check the URL hash for confirmation
        const hash = window.location.hash;
        
        if (hash && (hash.includes('type=recovery') || hash.includes('access_token'))) {
          logger.log('✅ [AuthContext] Recovery session detected via hash!');
          setResetToken(initialSession.access_token);
          setIsResettingPassword(true);
          setIsCheckingAuth(false);
          window.history.replaceState(null, '', window.location.pathname);
          return;
        }
      }
      
      logger.log('ℹ️ [AuthContext] Not a recovery link, proceeding with normal auth check');
      
      // Normal authentication check
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        logger.log('No access token found - user needs to login');
        setIsCheckingAuth(false);
        setIsAuthenticated(false);
        return;
      }

      try {
        logger.log('Verifying existing session...');
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3/session`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          logger.log('Session verified successfully');
          setCurrentUser(data.user);
          setAccessToken(token);
          setIsAuthenticated(true);
          
          // Ejecutar limpieza automática de datos inválidos en segundo plano
          // Esto previene errores causados por datos corruptos con IDs inválidos
          // CleanupService.silentCleanup(token).catch(err => {
          //   logger.warn('⚠️ Error en limpieza automática (no crítico):', err);
          // });
        } else {
          // Invalid token, clear it - this is normal, not an error
          logger.log('Session expired or invalid - clearing stored token');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setAccessToken(null);
          setRefreshToken(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        // Network error or server unavailable - don't log as error, just info
        logger.log('Unable to verify session (network/server issue) - clearing tokens');
        console.info('ℹ️ [AuthContext] Session verification failed (may be network issue):', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setAccessToken(null);
        setRefreshToken(null);
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();

    // ✅ NUEVO: Listener para detectar cuando auth-helper limpia el localStorage
    const handleAuthCleared = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('🔴 [AuthContext] Evento auth:cleared recibido - cerrando sesión...');
      
      // Limpiar el estado
      setIsAuthenticated(false);
      setCurrentUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      setIsCheckingAuth(false);
      
      // El mensaje ya fue mostrado por clearAuthAndReload()
      console.log('✅ [AuthContext] Estado limpiado - mostrando pantalla de login');
    };

    window.addEventListener('auth:cleared', handleAuthCleared);

    return () => {
      if (authListener) {
        authListener.unsubscribe();
      }
      window.removeEventListener('auth:cleared', handleAuthCleared);
    };
  }, []);

  // Auto-refresh token every 50 minutes (tokens expire in 60 minutes)
  useEffect(() => {
    // Don't try to refresh if not authenticated or no refresh token available
    if (!isAuthenticated || !refreshToken) {
      // If user is authenticated but has no refresh token, they're using old tokens
      // They'll need to re-login when the access token expires naturally
      if (isAuthenticated && !refreshToken) {
        logger.warn('⚠️ Session usando tokens antiguos - se requiere re-login cuando expire el access token');
      }
      return;
    }

    const refreshAccessToken = async () => {
      try {
        logger.log('🔄 Auto-refreshing access token...');
        
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3/refresh-token`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh_token: refreshToken }),
          }
        );

        if (!response.ok) {
          logger.log('❌ Token refresh failed - session expired');
          // Token refresh failed, clear everything and show login screen
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setAccessToken(null);
          setRefreshToken(null);
          setCurrentUser(null);
          setIsAuthenticated(false);
          // Don't show error toast during initial mount/auto-refresh
          // Only show if user was actively using the app
          return;
        }

        const data = await response.json();
        
        // Update tokens
        localStorage.setItem('accessToken', data.access_token);
        localStorage.setItem('refreshToken', data.refresh_token);
        setAccessToken(data.access_token);
        setRefreshToken(data.refresh_token);
        
        logger.log('✅ Access token refreshed successfully');
      } catch (error) {
        logger.error('Error refreshing token:', error);
        // On error, clear everything silently
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setAccessToken(null);
        setRefreshToken(null);
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
    };

    // Refresh token every 50 minutes (50 * 60 * 1000 ms)
    const intervalId = setInterval(refreshAccessToken, 50 * 60 * 1000);

    // Don't refresh immediately on mount - this was causing the issue
    // Only set up the interval for future refreshes
    
    return () => {
      clearInterval(intervalId);
    };
  }, [isAuthenticated, refreshToken]);

  // Handle successful authentication
  const handleAuthSuccess = async (user: User, token: string, refreshToken: string) => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('refreshToken', refreshToken);
    setAccessToken(token);
    setRefreshToken(refreshToken);
    setCurrentUser(user);
    setIsAuthenticated(true);
    
    logger.log('User authenticated successfully:', user.email);
    
    // Ejecutar limpieza automática de datos inválidos en segundo plano
    // Esto previene errores causados por datos corruptos con IDs inválidos
    // CleanupService.silentCleanup(token).catch(err => {
    //   logger.warn('⚠️ Error en limpieza automática (no crítico):', err);
    // });
  };

  // Handle logout
  const handleLogout = () => {
    // ✅ FIX: Clear ALL localStorage data to prevent data leakage between accounts
    logger.log('🔄 [Logout] Clearing all localStorage data...');
    
    // Auth data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
    
    // App data - CRITICAL: Clear to prevent data mixing between users
    localStorage.removeItem('transactions');
    localStorage.removeItem('accounts');
    localStorage.removeItem('categories');
    localStorage.removeItem('budgets');
    
    // UI state
    localStorage.removeItem('currentScreen');
    localStorage.removeItem('darkMode');
    localStorage.removeItem('colorTheme');
    
    // Clear React state
    setAccessToken(null);
    setRefreshToken(null);
    setCurrentUser(null);
    setIsAuthenticated(false);
    
    // Sign out from Supabase
    supabase.auth.signOut().catch(err => {
      logger.warn('⚠️ Error signing out from Supabase:', err);
    });
    
    // Show success message
    toast.success('Sesión cerrada exitosamente');
    
    logger.log('✅ [Logout] User logged out successfully - all data cleared');
  };

  // Handle profile update
  const handleUpdateProfile = async (updates: { name?: string; photoUrl?: string | null }) => {
    if (!accessToken || !currentUser) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3/update-profile`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify(updates),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar perfil');
      }

      // Update local state with the updated user data
      setCurrentUser(data.user);
      
      logger.log('Profile updated successfully:', data.user);
    } catch (error) {
      logger.error('Error updating profile:', error);
      throw error; // Re-throw to let Settings.tsx handle the error
    }
  };

  // Get access token helper - intenta refrescar si es necesario
  const getAccessToken = async (): Promise<string | null> => {
    // Si ya tenemos un token en el estado, devolverlo
    if (accessToken) {
      return accessToken;
    }

    // Si no hay token en el estado, intentar obtenerlo de Supabase
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        // Actualizar el estado y localStorage con el nuevo token
        setAccessToken(session.access_token);
        localStorage.setItem('accessToken', session.access_token);
        
        if (session.refresh_token) {
          setRefreshToken(session.refresh_token);
          localStorage.setItem('refreshToken', session.refresh_token);
        }
        
        return session.access_token;
      }
    } catch (error) {
      console.error('❌ Error al obtener sesión de Supabase:', error);
    }

    return null;
  };

  const value: AuthContextType = {
    isAuthenticated,
    currentUser,
    accessToken,
    isCheckingAuth,
    isResettingPassword,
    resetToken,
    setIsAuthenticated,
    setCurrentUser,
    setAccessToken,
    setIsCheckingAuth,
    setIsResettingPassword,
    setResetToken,
    getAccessToken,
    handleAuthSuccess,
    handleLogout,
    handleUpdateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}