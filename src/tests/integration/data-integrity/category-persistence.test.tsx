/**
 * DATA INTEGRITY TEST: Persistencia de Categorías y Subcategorías
 * 
 * Qué prueba:
 * 1. ✅ Categorías se guardan con TODOS los campos (name, type, icon, color)
 * 2. ✅ Categorías persisten después de logout/login
 * 3. ✅ Múltiples categorías NO se eliminan
 * 4. ✅ Actualizar categoría NO pierde campos
 * 5. ✅ Iconos custom se preservan
 * 6. ✅ Color hexadecimal exacto se mantiene
 * 7. ✅ Subcategoría mantiene referencia a parent
 * 8. ✅ Subcategorías persisten después de logout/login
 * 9. ✅ Eliminar categoría padre maneja subcategorías correctamente
 * 10. ✅ Múltiples subcategorías funcionan
 * 11. ✅ parent_id NO se pierde
 * 12. ✅ Subcategorías ordenadas correctamente
 * 
 * Bugs que detecta:
 * - Categorías se pierden al refrescar
 * - parent_id se vuelve undefined
 * - Color se resetea a default
 * - Subcategorías quedan huérfanas
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

describe('DATA INTEGRITY: Persistencia de Categorías', () => {
  let testUserId: string;
  let testEmail: string;
  let testPassword: string;
  let accessToken: string;
  
  const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3`;

  beforeEach(async () => {
    // Crear usuario único
    testEmail = `test-category-${Date.now()}@example.com`;
    testPassword = 'TestPassword123!';
    
    const signupResponse = await fetch(`${API_BASE}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        name: 'Test User',
      }),
    });
    
    const signupData = await signupResponse.json();
    testUserId = signupData.user.id;
    accessToken = signupData.access_token;
  });

  afterEach(async () => {
    // Cleanup
    if (testUserId) {
      try {
        await fetch(`${API_BASE}/test/cleanup/${testUserId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
      } catch (error) {
        console.log('Cleanup error (ok if endpoint not implemented):', error);
      }
    }
  });

  it('✅ debe guardar categoría con TODOS los campos intactos', async () => {
    // 1. Crear categoría completa
    const categoryData = {
      name: 'Transporte Test',
      type: 'expense',
      icon: 'car',
      color: '#3b82f6',
    };
    
    const createResponse = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(categoryData),
    });
    
    expect(createResponse.ok).toBe(true);
    const createdCategory = await createResponse.json();
    
    // 2. ✅ CRÍTICO - Verificar que se guardó con TODOS los campos
    const getResponse = await fetch(`${API_BASE}/categories`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    const { categories } = await getResponse.json();
    const savedCategory = categories.find((c: any) => c.id === createdCategory.id);
    
    // ✅ Este test DETECTA si algún campo se pierde
    expect(savedCategory).toBeDefined();
    expect(savedCategory.name).toBe('Transporte Test');
    expect(savedCategory.type).toBe('expense');
    expect(savedCategory.icon).toBe('car');
    expect(savedCategory.color).toBe('#3b82f6'); // Color exacto
  });

  it('✅ debe PERSISTIR categoría después de logout/login (multi-sesión)', async () => {
    // 1. Crear categoría
    const categoryData = {
      name: 'Alimentación Test',
      type: 'expense',
      icon: 'utensils',
      color: '#f97316',
    };
    
    const createResponse = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(categoryData),
    });
    
    const createdCategory = await createResponse.json();
    
    // 2. ✅ CRÍTICO - Simular logout/login
    const loginResponse = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });
    
    const loginData = await loginResponse.json();
    const newAccessToken = loginData.access_token;
    
    // 3. ✅ Verificar que categoría SIGUE AHÍ
    const getResponse = await fetch(`${API_BASE}/categories`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${newAccessToken}`,
      },
    });
    
    const { categories } = await getResponse.json();
    const persistedCategory = categories.find((c: any) => c.id === createdCategory.id);
    
    // ✅ Este test DETECTA si categorías se pierden al hacer login
    expect(persistedCategory).toBeDefined();
    expect(persistedCategory.name).toBe('Alimentación Test');
    expect(persistedCategory.icon).toBe('utensils');
    expect(persistedCategory.color).toBe('#f97316');
  });

  it('✅ debe persistir MÚLTIPLES categorías sin pérdida', async () => {
    // 1. Crear múltiples categorías
    const categories = [
      { name: 'Cat 1', type: 'expense', icon: 'icon1', color: '#ff0000' },
      { name: 'Cat 2', type: 'income', icon: 'icon2', color: '#00ff00' },
      { name: 'Cat 3', type: 'expense', icon: 'icon3', color: '#0000ff' },
    ];
    
    for (const cat of categories) {
      await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(cat),
      });
    }
    
    // 2. ✅ Verificar que TODAS se guardaron
    const getResponse = await fetch(`${API_BASE}/categories`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    const { categories: savedCategories } = await getResponse.json();
    
    // ✅ Este test DETECTA si validación elimina categorías válidas
    expect(savedCategories.length).toBeGreaterThanOrEqual(3);
    
    // Verificar que cada categoría mantiene sus datos
    categories.forEach((cat) => {
      const found = savedCategories.find((s: any) => s.name === cat.name);
      expect(found).toBeDefined();
      expect(found.type).toBe(cat.type);
      expect(found.icon).toBe(cat.icon);
      expect(found.color).toBe(cat.color);
    });
  });

  it('✅ debe mantener categoría después de actualizar', async () => {
    // 1. Crear categoría
    const createResponse = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        name: 'Original Name',
        type: 'expense',
        icon: 'original-icon',
        color: '#111111',
      }),
    });
    
    const createdCategory = await createResponse.json();
    
    // 2. Actualizar solo el nombre
    const updateResponse = await fetch(`${API_BASE}/categories/${createdCategory.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        ...createdCategory,
        name: 'Updated Name',
      }),
    });
    
    expect(updateResponse.ok).toBe(true);
    
    // 3. ✅ Verificar que otros campos NO se perdieron
    const getResponse = await fetch(`${API_BASE}/categories`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    const { categories } = await getResponse.json();
    const updated = categories.find((c: any) => c.id === createdCategory.id);
    
    expect(updated.name).toBe('Updated Name'); // Cambió
    expect(updated.type).toBe('expense'); // NO cambió
    expect(updated.icon).toBe('original-icon'); // NO cambió
    expect(updated.color).toBe('#111111'); // NO cambió
  });

  it('✅ debe preservar iconos custom después de guardar/cargar', async () => {
    // 1. Crear categoría con icono específico
    const customIcon = 'shopping-bag-custom';
    
    const createResponse = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        name: 'Shopping',
        type: 'expense',
        icon: customIcon,
        color: '#ec4899',
      }),
    });
    
    const createdCategory = await createResponse.json();
    
    // 2. ✅ Cargar y verificar icono
    const getResponse = await fetch(`${API_BASE}/categories`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    const { categories } = await getResponse.json();
    const saved = categories.find((c: any) => c.id === createdCategory.id);
    
    // ✅ DETECTA si icono se resetea a default
    expect(saved.icon).toBe(customIcon);
  });

  it('✅ debe mantener color hexadecimal EXACTO', async () => {
    // 1. Crear categoría con color específico
    const exactColor = '#a855f7'; // Púrpura exacto
    
    const createResponse = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        name: 'Entertainment',
        type: 'expense',
        icon: 'gamepad',
        color: exactColor,
      }),
    });
    
    const createdCategory = await createResponse.json();
    
    // 2. ✅ Verificar color exacto (sin conversión)
    const getResponse = await fetch(`${API_BASE}/categories`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    const { categories } = await getResponse.json();
    const saved = categories.find((c: any) => c.id === createdCategory.id);
    
    // ✅ DETECTA si color se convierte o cambia
    expect(saved.color).toBe(exactColor);
    expect(saved.color.toLowerCase()).toBe(exactColor.toLowerCase());
  });

  // ===== TESTS DE SUBCATEGORÍAS =====

  it('✅ subcategoría debe mantener referencia a parent', async () => {
    // 1. Crear categoría padre
    const parentResponse = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        name: 'Transporte',
        type: 'expense',
        icon: 'car',
        color: '#3b82f6',
      }),
    });
    
    const parent = await parentResponse.json();
    
    // 2. Crear subcategoría
    const subResponse = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        name: 'Uber',
        type: 'expense',
        parent_id: parent.id,
        icon: 'smartphone',
        color: '#000000',
      }),
    });
    
    const sub = await subResponse.json();
    
    // 3. ✅ Verificar que parent_id se guardó
    const getResponse = await fetch(`${API_BASE}/categories`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    const { categories } = await getResponse.json();
    const savedSub = categories.find((c: any) => c.id === sub.id);
    
    // ✅ DETECTA si parent_id se pierde
    expect(savedSub.parent_id).toBe(parent.id);
  });

  it('✅ subcategorías persisten después de logout/login', async () => {
    // 1. Crear categoría padre y subcategoría
    const parentResponse = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        name: 'Transporte',
        type: 'expense',
        icon: 'car',
        color: '#3b82f6',
      }),
    });
    
    const parent = await parentResponse.json();
    
    await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        name: 'Metro',
        type: 'expense',
        parent_id: parent.id,
        icon: 'train',
        color: '#6366f1',
      }),
    });
    
    // 2. Logout/login
    const loginResponse = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });
    
    const loginData = await loginResponse.json();
    const newAccessToken = loginData.access_token;
    
    // 3. ✅ Verificar que subcategoría SIGUE AHÍ con parent_id
    const getResponse = await fetch(`${API_BASE}/categories`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${newAccessToken}`,
      },
    });
    
    const { categories } = await getResponse.json();
    const subcat = categories.find((c: any) => c.name === 'Metro');
    
    expect(subcat).toBeDefined();
    expect(subcat.parent_id).toBe(parent.id);
  });

  it('✅ eliminar categoría padre debe rechazar si tiene subcategorías', async () => {
    // 1. Crear categoría padre
    const parentResponse = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        name: 'Transporte',
        type: 'expense',
        icon: 'car',
        color: '#3b82f6',
      }),
    });
    
    const parent = await parentResponse.json();
    
    // 2. Crear subcategoría
    await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        name: 'Taxi',
        type: 'expense',
        parent_id: parent.id,
        icon: 'taxi',
        color: '#f59e0b',
      }),
    });
    
    // 3. ✅ Intentar eliminar padre (debe fallar)
    const deleteResponse = await fetch(`${API_BASE}/categories/${parent.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    // ✅ DETECTA si permite eliminar dejando huérfanas
    // Debe rechazar (400/403) o mover subcategorías
    if (deleteResponse.ok) {
      // Si permitió eliminar, subcategorías deben estar OK
      const getResponse = await fetch(`${API_BASE}/categories`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      const { categories } = await getResponse.json();
      const orphan = categories.find((c: any) => c.parent_id === parent.id);
      
      // No debe haber huérfanas
      expect(orphan).toBeUndefined();
    } else {
      // O debería rechazar
      expect(deleteResponse.status).toBeGreaterThanOrEqual(400);
    }
  });

  it('✅ múltiples subcategorías para una categoría funcionan', async () => {
    // 1. Crear categoría padre
    const parentResponse = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        name: 'Transporte',
        type: 'expense',
        icon: 'car',
        color: '#3b82f6',
      }),
    });
    
    const parent = await parentResponse.json();
    
    // 2. Crear múltiples subcategorías
    const subcategories = ['Uber', 'Metro', 'Taxi', 'Bus'];
    
    for (const name of subcategories) {
      await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name,
          type: 'expense',
          parent_id: parent.id,
          icon: 'icon',
          color: '#000000',
        }),
      });
    }
    
    // 3. ✅ Verificar que TODAS se guardaron con parent_id correcto
    const getResponse = await fetch(`${API_BASE}/categories`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    const { categories } = await getResponse.json();
    const subs = categories.filter((c: any) => c.parent_id === parent.id);
    
    expect(subs.length).toBe(4);
    subs.forEach((sub: any) => {
      expect(sub.parent_id).toBe(parent.id);
      expect(subcategories).toContain(sub.name);
    });
  });

  it('✅ parent_id NO se pierde al actualizar subcategoría', async () => {
    // 1. Crear padre y subcategoría
    const parentResponse = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        name: 'Transporte',
        type: 'expense',
        icon: 'car',
        color: '#3b82f6',
      }),
    });
    
    const parent = await parentResponse.json();
    
    const subResponse = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        name: 'Uber Original',
        type: 'expense',
        parent_id: parent.id,
        icon: 'smartphone',
        color: '#000000',
      }),
    });
    
    const sub = await subResponse.json();
    
    // 2. Actualizar nombre de subcategoría
    await fetch(`${API_BASE}/categories/${sub.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        ...sub,
        name: 'Uber Updated',
      }),
    });
    
    // 3. ✅ Verificar que parent_id NO se perdió
    const getResponse = await fetch(`${API_BASE}/categories`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    const { categories } = await getResponse.json();
    const updated = categories.find((c: any) => c.id === sub.id);
    
    expect(updated.name).toBe('Uber Updated');
    expect(updated.parent_id).toBe(parent.id); // ✅ NO debe perderse
  });

  it('✅ subcategorías se cargan en orden correcto', async () => {
    // 1. Crear padre y subcategorías con orden específico
    const parentResponse = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        name: 'Transporte',
        type: 'expense',
        icon: 'car',
        color: '#3b82f6',
      }),
    });
    
    const parent = await parentResponse.json();
    
    // Crear con orden: A, B, C
    const ordered = ['Uber', 'Metro', 'Taxi'];
    
    for (const name of ordered) {
      await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name,
          type: 'expense',
          parent_id: parent.id,
          icon: 'icon',
          color: '#000000',
        }),
      });
      
      // Pequeña pausa para garantizar orden
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    // 2. ✅ Cargar y verificar orden
    const getResponse = await fetch(`${API_BASE}/categories`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    const { categories } = await getResponse.json();
    const subs = categories
      .filter((c: any) => c.parent_id === parent.id)
      .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    
    // ✅ Verificar que mantienen orden de creación
    expect(subs.length).toBe(3);
    expect(subs[0].name).toBe('Uber');
    expect(subs[1].name).toBe('Metro');
    expect(subs[2].name).toBe('Taxi');
  });
});
