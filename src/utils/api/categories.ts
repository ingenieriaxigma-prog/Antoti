import { projectId, publicAnonKey } from '../supabase/info';
import { Category } from '../../components/types';
import { filterValidCategories } from '../validation';
import { handle401Response } from '../auth-helper';
import { DEFAULT_CATEGORIES } from '../../constants/categories';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3`;

/**
 * ✅ MEJORADO: Sincroniza categorías con constantes centralizadas
 * - Actualiza nombres, emojis e iconos de categorías principales
 * - Agrega emojis a subcategorías
 * - Mantiene datos personalizados del usuario (balance, etc.)
 * - Solo sincroniza categorías del sistema (isSystem: true)
 */
function enrichSubcategoriesWithEmojis(categories: Category[]): Category[] {
  return categories.map(cat => {
    // Find the matching default category by ID (más preciso que name + type)
    let defaultCat = DEFAULT_CATEGORIES.find(dc => dc.id === cat.id);
    
    // Fallback: buscar por name + type si no se encuentra por ID
    if (!defaultCat) {
      defaultCat = DEFAULT_CATEGORIES.find(
        dc => dc.name === cat.name && dc.type === cat.type
      );
      
      // ✅ Si no se encuentra, es una categoría personalizada del usuario
      // No intentar sincronizarla, solo devolverla tal cual
      if (!defaultCat) {
        // Solo mostrar warning en desarrollo para categorías que deberían ser del sistema
        if (cat.isSystem) {
          console.warn(`⚠️  No default category found for system category: ${cat.name} (${cat.type})`);
        }
        return cat; // Devolver categoría personalizada sin modificar
      }
    }
    
    // ✅ Actualizar nombre, emoji e icon de la categoría principal desde DEFAULT_CATEGORIES
    const updatedCategory = {
      ...cat,
      name: defaultCat.name,      // Actualizar nombre
      emoji: defaultCat.emoji,    // Actualizar emoji
      icon: defaultCat.icon,      // Actualizar icon
      color: defaultCat.color,    // Actualizar color
      isSystem: defaultCat.isSystem, // Actualizar flag de sistema
    };
    
    if (!defaultCat.subcategories || !cat.subcategories) {
      return updatedCategory;
    }
    
    // Add emojis to subcategories
    const enrichedSubcategories = cat.subcategories.map(sub => {
      // Buscar por ID primero
      let defaultSub = defaultCat!.subcategories?.find(ds => ds.id === sub.id);
      
      // Fallback: buscar por name si no se encuentra por ID
      if (!defaultSub) {
        defaultSub = defaultCat!.subcategories?.find(ds => ds.name === sub.name);
      }
      
      // ✅ Solo warning en desarrollo para subcategorías del sistema
      if (!defaultSub && process.env.NODE_ENV === 'development') {
        console.warn(`   ⚠️  No emoji found for subcategory: ${sub.name}`);
      }
      
      return {
        ...sub,
        emoji: defaultSub?.emoji || sub.emoji || '📌', // Emoji por defecto si no se encuentra
      };
    });
    
    // Removed verbose console.log for production
    
    return {
      ...updatedCategory,
      subcategories: enrichedSubcategories,
    };
  });
}

/**
 * Get access token from localStorage
 */
function getAccessToken(): string | null {
  return localStorage.getItem('accessToken');
}

/**
 * Get all categories for the authenticated user from Supabase
 */
export async function getCategories(): Promise<Category[]> {
  const token = getAccessToken();
  
  if (!token) {
    // Silently return empty array - this is normal when user is not authenticated
    return [];
  }

  try {
    const response = await fetch(`${API_BASE}/categories`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      
      // If unauthorized, clear the invalid token
      if (response.status === 401) {
        handle401Response(error);
        throw new Error('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
      }
      
      throw new Error(error.error || 'Error al obtener categorías');
    }

    const data = await response.json();
    
    // ✅ Enrich subcategories with emojis from constants
    const enrichedCategories = enrichSubcategoriesWithEmojis(data.categories);
    
    return enrichedCategories;
  } catch (error) {
    console.error('Error fetching categories from API:', error);
    throw error;
  }
}

/**
 * Save categories to Supabase
 */
export async function saveCategories(categories: Category[]): Promise<void> {
  const token = getAccessToken();
  
  if (!token) {
    throw new Error('No estás autenticado');
  }

  // Filter out invalid categories before sending to server
  const validCategories = filterValidCategories(categories);
  
  // IMPORTANTE: SIEMPRE enviar al servidor, incluso si el array está vacío
  // Esto permite borrar todas las categorías cuando se resetea data
  if (validCategories.length === 0) {
    console.log('📝 Enviando array vacío al servidor para borrar todas las categorías');
  }
  
  if (validCategories.length < categories.length) {
    console.warn(`⚠️ Se ignoraron ${categories.length - validCategories.length} categorías con datos inválidos`);
  }

  try {
    const response = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ categories: validCategories }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al guardar categorías');
    }

    console.log('Categories saved successfully to Supabase');
  } catch (error) {
    console.error('Error saving categories to API:', error);
    throw error;
  }
}

/**
 * Delete a specific category
 */
export async function deleteCategory(categoryKey: string): Promise<Category[]> {
  const token = getAccessToken();
  
  if (!token) {
    throw new Error('No estás autenticado');
  }

  try {
    const response = await fetch(`${API_BASE}/categories/${categoryKey}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al eliminar categoría');
    }

    const data = await response.json();
    return data.categories || [];
  } catch (error) {
    console.error('Error deleting category from API:', error);
    throw error;
  }
}

/**
 * Delete ALL categories for the current user (used for reset)
 */
export async function deleteAllCategories(): Promise<void> {
  const token = getAccessToken();
  
  if (!token) {
    throw new Error('No estás autenticado');
  }

  try {
    const response = await fetch(`${API_BASE}/categories`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al eliminar categorías');
    }

    console.log('✅ All categories deleted successfully');
  } catch (error) {
    console.error('Error deleting all categories from API:', error);
    throw error;
  }
}

/**
 * Migrate categories from localStorage to Supabase
 * This is a one-time migration function
 */
export async function migrateCategoriesFromLocalStorage(): Promise<void> {
  try {
    // Check if already migrated
    const migrated = localStorage.getItem('categories_migrated');
    if (migrated === 'true') {
      console.log('Categories already migrated');
      return;
    }

    // Get categories from localStorage
    const localCategories = localStorage.getItem('categories');
    
    if (localCategories) {
      const categories = JSON.parse(localCategories);
      
      // Filter out invalid categories
      const validCategories = filterValidCategories(categories);
      
      if (validCategories.length > 0) {
        console.log(`Migrating ${validCategories.length} valid categories (skipped ${categories.length - validCategories.length} invalid) from localStorage to Supabase...`);
        
        // Save to Supabase
        await saveCategories(validCategories);
        
        console.log('Migration completed successfully');
      } else {
        console.log('No valid categories to migrate from localStorage');
      }
      
      // Mark as migrated (even if no valid data)
      localStorage.setItem('categories_migrated', 'true');
    } else {
      console.log('No categories to migrate from localStorage');
      localStorage.setItem('categories_migrated', 'true');
    }
  } catch (error) {
    console.error('Error during migration:', error);
    // Mark as migrated to prevent retry loops
    localStorage.setItem('categories_migrated', 'true');
    throw error;
  }
}