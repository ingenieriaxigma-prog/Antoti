/**
 * 👥 FAMILY GROUPS - HOOK: useFamilyGroups
 * 
 * Hook personalizado para gestionar grupos familiares.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import * as familyService from '../services/family.service';
import type {
  FamilyGroupWithMembers,
  CreateGroupDTO,
  UpdateGroupDTO,
} from '../types/family.types';

interface UseFamilyGroupsReturn {
  groups: FamilyGroupWithMembers[];
  selectedGroup: FamilyGroupWithMembers | null;
  isLoading: boolean;
  error: string | null;
  createGroup: (data: CreateGroupDTO) => Promise<any>;
  refreshGroups: () => Promise<void>;
  selectGroup: (groupId: string | null) => void;
}

/**
 * Hook para gestionar grupos familiares
 */
export function useFamilyGroups(): UseFamilyGroupsReturn {
  const { accessToken } = useAuth();
  const [groups, setGroups] = useState<FamilyGroupWithMembers[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Obtener el grupo seleccionado
   */
  const selectedGroup = groups.find(g => g.id === selectedGroupId) || null;

  /**
   * Cargar grupos del usuario
   */
  const loadGroups = useCallback(async () => {
    if (!accessToken) {
      setGroups([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const fetchedGroups = await familyService.listGroups(accessToken);
      setGroups(fetchedGroups);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar grupos';
      setError(errorMessage);
      console.error('Error al cargar grupos familiares:', err);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  /**
   * Crear nuevo grupo
   */
  const createGroup = useCallback(async (data: CreateGroupDTO) => {
    if (!accessToken) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const result = await familyService.createGroup(accessToken, data);
      
      console.log('✅ Grupo creado exitosamente:', result);
      
      // Deseleccionar cualquier grupo actualmente seleccionado
      setSelectedGroupId(null);
      localStorage.removeItem('selectedFamilyGroupId');
      
      // No actualizamos el estado aquí - el componente llamará a refreshGroups()
      setIsLoading(false);
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear grupo';
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  }, [accessToken]);

  /**
   * Refrescar lista de grupos
   */
  const refreshGroups = useCallback(async () => {
    await loadGroups();
  }, [loadGroups]);

  /**
   * Seleccionar un grupo
   */
  const selectGroup = useCallback((groupId: string | null) => {
    setSelectedGroupId(groupId);
    
    // Guardar en localStorage para persistencia
    if (groupId) {
      localStorage.setItem('selectedFamilyGroupId', groupId);
    } else {
      localStorage.removeItem('selectedFamilyGroupId');
    }
  }, []);

  /**
   * Cargar grupos al montar el componente
   */
  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  /**
   * Restaurar grupo seleccionado desde localStorage
   */
  useEffect(() => {
    const savedGroupId = localStorage.getItem('selectedFamilyGroupId');
    if (savedGroupId && groups.length > 0) {
      const groupExists = groups.some(g => g.id === savedGroupId);
      if (groupExists) {
        setSelectedGroupId(savedGroupId);
      }
    }
  }, [groups]);

  return {
    groups,
    selectedGroup,
    isLoading,
    error,
    createGroup,
    refreshGroups,
    selectGroup,
  };
}