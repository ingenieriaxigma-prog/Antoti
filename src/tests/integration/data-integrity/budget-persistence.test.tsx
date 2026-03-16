/**
 * DATA INTEGRITY TEST: Persistencia de Presupuestos
 * 
 * Este test HUBIERA detectado el bug de presupuestos perdidos.
 * 
 * Qué prueba:
 * 1. ✅ Presupuesto se guarda en BD con TODOS los campos
 * 2. ✅ Presupuesto persiste después de reload
 * 3. ✅ Presupuesto persiste después de logout/login
 * 4. ✅ categoryId NO se pierde al guardar/cargar
 * 5. ✅ filterValidBudgets NO elimina presupuestos válidos
 * 
 * Bug que detecta:
 * - filterValidBudgets() eliminaba presupuestos con categoryId "inválido"
 * - Presupuestos se perdían al refrescar
 * - categoryId se perdía al pasar por validación
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

describe('DATA INTEGRITY: Persistencia de Presupuestos', () => {
  let testUserId: string;
  let testEmail: string;
  let testPassword: string;
  let accessToken: string;
  let categoryId: string;
  
  const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3`;

  beforeEach(async () => {
    // Crear usuario único
    testEmail = `test-budget-${Date.now()}@example.com`;
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
    
    // Crear categoría
    const categoryResponse = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        name: 'Alimentación Test',
        type: 'expense',
        icon: 'utensils',
        color: '#f97316',
      }),
    });
    
    const categoryData = await categoryResponse.json();
    categoryId = categoryData.id;
  });

  afterEach(async () => {
    // Cleanup - llamar al endpoint de limpieza si existe
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

  it('✅ debe guardar presupuesto con TODOS los campos intactos', async () => {
    // 1. Crear presupuesto con todos los campos
    const budgetData = {
      categoryId,
      amount: 500000,
      period: 'monthly',
      alertThreshold: 80,
    };
    
    const createResponse = await fetch(`${API_BASE}/budgets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ budgets: [budgetData] }),
    });
    
    expect(createResponse.ok).toBe(true);
    
    // 2. ✅ CRÍTICO - Verificar que se guardó en BD con TODOS los campos
    const getResponse = await fetch(`${API_BASE}/budgets`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    const { budgets } = await getResponse.json();
    
    // ✅ Este test HUBIERA FALLADO con el bug
    expect(budgets).toHaveLength(1);
    expect(budgets[0].categoryId).toBe(categoryId); // ← DETECTA si se pierde
    expect(budgets[0].amount).toBe(500000);
    expect(budgets[0].period).toBe('monthly');
    expect(budgets[0].alertThreshold).toBe(80);
  });

  it('✅ debe PERSISTIR presupuesto después de logout/login (multi-sesión)', async () => {
    // 1. Crear presupuesto
    const budgetData = {
      categoryId,
      amount: 500000,
      period: 'monthly',
    };
    
    await fetch(`${API_BASE}/budgets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ budgets: [budgetData] }),
    });
    
    // 2. ✅ CRÍTICO - Simular logout/login (como si fuera otro dispositivo)
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
    
    // 3. ✅ Verificar que el presupuesto SIGUE AHÍ con todos los campos
    const getBudgetsResponse = await fetch(`${API_BASE}/budgets`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${newAccessToken}`,
      },
    });
    
    const { budgets } = await getBudgetsResponse.json();
    
    // ✅ Este test HUBIERA DETECTADO el bug de presupuestos perdidos
    expect(budgets).toHaveLength(1);
    expect(budgets[0].categoryId).toBe(categoryId); // ← NO debe perderse
    expect(budgets[0].amount).toBe(500000);
  });

  it('✅ debe persistir MÚLTIPLES presupuestos sin pérdida de datos', async () => {
    // 1. Crear múltiples presupuestos
    const budgets = [
      { categoryId, amount: 500000, period: 'monthly' },
      { categoryId, amount: 100000, period: 'weekly' },
      { categoryId, amount: 1000000, period: 'yearly' },
    ];
    
    await fetch(`${API_BASE}/budgets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ budgets }),
    });
    
    // 2. ✅ Verificar que TODOS se guardaron
    const getResponse = await fetch(`${API_BASE}/budgets`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    const { budgets: savedBudgets } = await getResponse.json();
    
    // ✅ Este test detecta si filterValidBudgets elimina alguno
    expect(savedBudgets).toHaveLength(3);
    savedBudgets.forEach((budget: any) => {
      expect(budget.categoryId).toBe(categoryId); // ← TODOS deben tener categoryId
      expect(budget.amount).toBeGreaterThan(0);
      expect(budget.period).toBeDefined();
    });
  });

  it('✅ debe mantener presupuesto después de actualizar', async () => {
    // 1. Crear presupuesto
    const createResponse = await fetch(`${API_BASE}/budgets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ 
        budgets: [{ categoryId, amount: 500000, period: 'monthly' }] 
      }),
    });
    
    const { budgets: [createdBudget] } = await createResponse.json();
    
    // 2. Actualizar el presupuesto
    const updatedBudget = {
      ...createdBudget,
      amount: 600000, // Cambiar monto
    };
    
    await fetch(`${API_BASE}/budgets/${createdBudget.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(updatedBudget),
    });
    
    // 3. ✅ Verificar que se actualizó SIN perder campos
    const getResponse = await fetch(`${API_BASE}/budgets`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    const { budgets } = await getResponse.json();
    
    expect(budgets).toHaveLength(1);
    expect(budgets[0].amount).toBe(600000); // Nuevo valor
    expect(budgets[0].categoryId).toBe(categoryId); // NO debe perderse
    expect(budgets[0].period).toBe('monthly'); // NO debe perderse
  });

  it('✅ NO debe filtrar presupuestos con UUIDs válidos', async () => {
    // 1. Crear presupuesto con UUID válido
    const validBudget = {
      categoryId, // UUID válido
      amount: 500000,
      period: 'monthly',
    };
    
    const createResponse = await fetch(`${API_BASE}/budgets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ budgets: [validBudget] }),
    });
    
    expect(createResponse.ok).toBe(true);
    
    // 2. ✅ Verificar que NO se filtró
    const getResponse = await fetch(`${API_BASE}/budgets`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    const { budgets } = await getResponse.json();
    
    // ✅ Este test detecta si filterValidBudgets elimina presupuestos válidos
    expect(budgets).toHaveLength(1);
    expect(budgets[0].categoryId).toBe(categoryId);
  });

  it('✅ debe preservar alertThreshold después de guardar/cargar', async () => {
    // 1. Crear presupuesto con alertThreshold específico
    const budgetData = {
      categoryId,
      amount: 500000,
      period: 'monthly',
      alertThreshold: 75, // Valor específico
    };
    
    await fetch(`${API_BASE}/budgets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ budgets: [budgetData] }),
    });
    
    // 2. ✅ Cargar y verificar que alertThreshold NO se perdió
    const getResponse = await fetch(`${API_BASE}/budgets`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    const { budgets } = await getResponse.json();
    
    expect(budgets[0].alertThreshold).toBe(75); // NO debe perderse
  });
});
