/**
 * 📨 USE INVITATIONS HOOK
 * 
 * Hook personalizado para gestionar invitaciones a grupos familiares
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import * as invitationService from '../services/invitation.service';
import type { FamilyInvitation, CreateInvitationDTO } from '../types/family.types';

export function useInvitations() {
  const { accessToken } = useAuth();
  const [invitations, setInvitations] = useState<FamilyInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Cargar invitaciones recibidas
   */
  const loadInvitations = useCallback(async () => {
    if (!accessToken) {
      setInvitations([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await invitationService.getMyInvitations(accessToken);
      setInvitations(data.invitations);
      setError(null);
    } catch (err) {
      // Manejar errores de red (Failed to fetch)
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        // Error de red - silenciosamente establecer lista vacía
        setInvitations([]);
        setError(null);
        return;
      }
      
      // Solo mostrar error si no es 401, 404, o 500
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar invitaciones';
      const is401or404or500 = errorMessage.includes('401') || 
                              errorMessage.includes('404') || 
                              errorMessage.includes('500');
      
      if (!is401or404or500) {
        setError(errorMessage);
        console.error('❌ Error loading invitations:', err);
      } else {
        setInvitations([]);
        setError(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  /**
   * Enviar invitación
   */
  const sendInvitation = useCallback(async (data: CreateInvitationDTO) => {
    if (!accessToken) {
      throw new Error('Usuario no autenticado');
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await invitationService.sendInvitation(accessToken, data);
      console.log('✅ Invitación enviada:', result);
      return result.invitation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al enviar invitación';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

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
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al unirse con código';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  /**
   * Refrescar invitaciones
   */
  const refreshInvitations = useCallback(async () => {
    await loadInvitations();
  }, [loadInvitations]);

  /**
   * Cargar invitaciones al montar
   */
  useEffect(() => {
    loadInvitations();
  }, [loadInvitations]);

  return {
    invitations,
    pendingCount: invitations.length,
    isLoading,
    error,
    sendInvitation,
    acceptInvitation,
    rejectInvitation,
    joinWithCode,
    refreshInvitations,
  };
}