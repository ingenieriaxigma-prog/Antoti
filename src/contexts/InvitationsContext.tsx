/**
 * 📨 INVITATIONS CONTEXT
 * 
 * Contexto global para gestionar invitaciones de grupos familiares.
 * Permite que cualquier pantalla pueda acceder al contador de invitaciones pendientes.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import * as invitationService from '../features/family/services/invitation.service';
import type { FamilyInvitation } from '../features/family/types/family.types';

interface InvitationsContextType {
  invitations: FamilyInvitation[];
  pendingCount: number;
  isLoading: boolean;
  error: string | null;
  refreshInvitations: () => Promise<void>;
  acceptInvitation: (invitationId: string) => Promise<any>;
  rejectInvitation: (invitationId: string) => Promise<void>;
  joinWithCode: (code: string) => Promise<any>;
}

const InvitationsContext = createContext<InvitationsContextType | null>(null);

interface InvitationsProviderProps {
  children: ReactNode;
}

export function InvitationsProvider({ children }: InvitationsProviderProps) {
  const { accessToken, isAuthenticated } = useAuth();
  const [invitations, setInvitations] = useState<FamilyInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Cargar invitaciones recibidas
   */
  const loadInvitations = useCallback(async () => {
    if (!accessToken || !isAuthenticated) {
      setInvitations([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await invitationService.getMyInvitations(accessToken);
      setInvitations(data.invitations);
      setError(null); // Limpiar error previo si la carga fue exitosa
    } catch (err) {
      // ✅ FIX: Manejar todos los errores silenciosamente (incluyendo timeouts)
      // Las invitaciones no son críticas para el funcionamiento de la app
      setInvitations([]);
      setError(null);
      
      // Solo logear en desarrollo
      if (process.env.NODE_ENV === 'development') {
        console.debug('❌ Error loading invitations (non-critical):', err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, isAuthenticated]);

  /**
   * Aceptar invitación
   */
  const acceptInvitation = useCallback(async (invitationId: string) => {
    if (!accessToken) {
      throw new Error('Usuario no autenticado');
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await invitationService.acceptInvitation(accessToken, invitationId);
      
      // Eliminar invitación de la lista local
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      
      console.log('✅ Invitación aceptada:', result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al aceptar invitación';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  /**
   * Rechazar invitación
   */
  const rejectInvitation = useCallback(async (invitationId: string) => {
    if (!accessToken) {
      throw new Error('Usuario no autenticado');
    }

    setIsLoading(true);
    setError(null);

    try {
      await invitationService.rejectInvitation(accessToken, invitationId);
      
      // Eliminar invitación de la lista local
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      
      console.log('✅ Invitación rechazada');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al rechazar invitación';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  /**
   * Unirse con código
   */
  const joinWithCode = useCallback(async (code: string) => {
    if (!accessToken) {
      throw new Error('Usuario no autenticado');
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await invitationService.joinWithCode(accessToken, code);
      console.log('✅ Unido al grupo con código:', result);
      
      // Refrescar invitaciones
      await loadInvitations();
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al unirse con código';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, loadInvitations]);

  /**
   * Refrescar invitaciones
   */
  const refreshInvitations = useCallback(async () => {
    await loadInvitations();
  }, [loadInvitations]);

  /**
   * Cargar invitaciones al montar y cuando cambia la autenticación
   */
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      loadInvitations();
    }
  }, [isAuthenticated, accessToken, loadInvitations]);

  /**
   * Polling cada 60 segundos para nuevas invitaciones
   * ⚠️ DESHABILITADO para evitar sobrecarga del servidor (broken pipe errors)
   */
  useEffect(() => {
    if (!accessToken || !isAuthenticated) return;

    // ⚠️ POLLING DESHABILITADO - Causaba broken pipe errors
    // Solo cargar invitaciones manualmente cuando el usuario lo solicite
    // const interval = setInterval(() => {
    //   loadInvitations();
    // }, 60000); // 60 segundos

    // return () => clearInterval(interval);
  }, [accessToken, isAuthenticated, loadInvitations]);

  const value: InvitationsContextType = {
    invitations,
    pendingCount: invitations.length,
    isLoading,
    error,
    refreshInvitations,
    acceptInvitation,
    rejectInvitation,
    joinWithCode,
  };

  return (
    <InvitationsContext.Provider value={value}>
      {children}
    </InvitationsContext.Provider>
  );
}

/**
 * Hook para usar el contexto de invitaciones
 */
export function useGlobalInvitations() {
  const context = useContext(InvitationsContext);
  
  if (!context) {
    throw new Error('useGlobalInvitations debe usarse dentro de InvitationsProvider');
  }
  
  return context;
}