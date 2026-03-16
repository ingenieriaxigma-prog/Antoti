/**
 * DATA INTEGRITY TEST: Persistencia de Transacciones
 * 
 * Este test HUBIERA detectado el bug de transacciones con referencias perdidas.
 * 
 * Qué prueba:
 * 1. ✅ Transacción se guarda con account, category, subcategory INTACTOS
 * 2. ✅ Referencias NO se pierden al guardar/cargar
 * 3. ✅ Transferencias mantienen toAccount
 * 4. ✅ filterValidTransactions NO limpia campos válidos
 * 5. ✅ Persistencia después de logout/login
 * 
 * Bug que detecta:
 * - filterValidTransactions() estaba limpiando account/category válidos
 * - Referencias se perdían al pasar por validación
 * - toAccount se perdía en transferencias
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

describe('DATA INTEGRITY: Persistencia de Transacciones', () => {
  let testUserId: string;
  let testEmail: string;
  let testPassword: string;
  let accessToken: string;
  let accountId: string;
  let categoryId: string;
  let subcategoryId: string;
  
  const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3`;

  beforeEach(async () => {
    // Crear usuario único
    testEmail = `test-txn-${Date.now()}@example.com`;
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
    
    // Crear cuenta
    const accountResponse = await fetch(`${API_BASE}/accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        name: 'Cuenta Test',
        type: 'bank',
        balance: 1000000,
        icon: 'building-2',
        color: '#10b981',
      }),
    });
    
    const accountData = await accountResponse.json();
    accountId = accountData.id;
    
    // Crear categoría con subcategoría
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
        subcategories: ['Supermercado', 'Restaurantes'],
      }),
    });
    
    const categoryData = await categoryResponse.json();
    categoryId = categoryData.id;
    subcategoryId = categoryData.subcategories[0].id;
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
        console.log('Cleanup error (ok):', error);
      }
    }
  });

  it('✅ debe guardar transacción con account, category y subcategory INTACTOS', async () => {
    // 1. Crear transacción con TODOS los campos de referencia
    const transactionData = {
      type: 'expense',
      amount: 50000,
      date: new Date().toISOString(),
      description: 'Compra en supermercado',
      account: accountId,        // ← NO debe perderse
      category: categoryId,      // ← NO debe perderse
      subcategory: subcategoryId, // ← NO debe perderse
    };
    
    const createResponse = await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ transactions: [transactionData] }),
    });
    
    expect(createResponse.ok).toBe(true);
    
    // 2. ✅ CRÍTICO - Verificar que TODOS los campos se guardaron
    const getResponse = await fetch(`${API_BASE}/transactions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    const { transactions } = await getResponse.json();
    
    // ✅ Este test HUBIERA DETECTADO el bug
    expect(transactions).toHaveLength(1);
    expect(transactions[0].account).toBe(accountId);        // ← DETECTA si se pierde
    expect(transactions[0].category).toBe(categoryId);      // ← DETECTA si se pierde
    expect(transactions[0].subcategory).toBe(subcategoryId); // ← DETECTA si se pierde
    expect(transactions[0].amount).toBe(50000);
  });

  it('✅ debe mantener referencias después de logout/login (multi-sesión)', async () => {
    // 1. Crear transacción
    const transactionData = {
      type: 'expense',
      amount: 50000,
      date: new Date().toISOString(),
      account: accountId,
      category: categoryId,
    };
    
    await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ transactions: [transactionData] }),
    });
    
    // 2. ✅ Simular login desde otro dispositivo
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
    
    // 3. ✅ Verificar que las referencias SIGUEN AHÍ
    const getResponse = await fetch(`${API_BASE}/transactions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${newAccessToken}`,
      },
    });
    
    const { transactions } = await getResponse.json();
    
    expect(transactions).toHaveLength(1);
    expect(transactions[0].account).toBe(accountId);   // ← NO debe perderse
    expect(transactions[0].category).toBe(categoryId); // ← NO debe perderse
  });

  it('✅ debe mantener toAccount en TRANSFERENCIAS', async () => {
    // 1. Crear segunda cuenta
    const account2Response = await fetch(`${API_BASE}/accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        name: 'Cuenta Destino',
        type: 'cash',
        balance: 0,
        icon: 'wallet',
        color: '#3b82f6',
      }),
    });
    
    const account2Data = await account2Response.json();
    const toAccountId = account2Data.id;
    
    // 2. Crear TRANSFERENCIA
    const transferData = {
      type: 'transfer',
      amount: 100000,
      date: new Date().toISOString(),
      description: 'Transferencia entre cuentas',
      account: accountId,      // ← Cuenta origen
      toAccount: toAccountId,  // ← Cuenta destino - CRÍTICO
    };
    
    const createResponse = await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ transactions: [transferData] }),
    });
    
    expect(createResponse.ok).toBe(true);
    
    // 3. ✅ CRÍTICO - Verificar que toAccount NO se perdió
    const getResponse = await fetch(`${API_BASE}/transactions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    const { transactions } = await getResponse.json();
    
    // ✅ Este test detecta si toAccount se pierde
    expect(transactions).toHaveLength(1);
    expect(transactions[0].type).toBe('transfer');
    expect(transactions[0].account).toBe(accountId);
    expect(transactions[0].toAccount).toBe(toAccountId); // ← CRÍTICO
  });

  it('✅ NO debe limpiar campos válidos de transacciones', async () => {
    // 1. Crear múltiples transacciones con diferentes combinaciones de campos
    const transactions = [
      // Gasto con todos los campos
      {
        type: 'expense',
        amount: 50000,
        date: new Date().toISOString(),
        account: accountId,
        category: categoryId,
        subcategory: subcategoryId,
      },
      // Ingreso sin subcategoría (válido)
      {
        type: 'income',
        amount: 200000,
        date: new Date().toISOString(),
        account: accountId,
        category: categoryId,
      },
    ];
    
    await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ transactions }),
    });
    
    // 2. ✅ Verificar que NINGUNA se filtró y TODOS los campos están intactos
    const getResponse = await fetch(`${API_BASE}/transactions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    const { transactions: savedTxns } = await getResponse.json();
    
    // ✅ Detecta si filterValidTransactions elimina transacciones válidas
    expect(savedTxns).toHaveLength(2);
    
    // Primera transacción - todos los campos
    const txn1 = savedTxns.find((t: any) => t.type === 'expense');
    expect(txn1.account).toBe(accountId);
    expect(txn1.category).toBe(categoryId);
    expect(txn1.subcategory).toBe(subcategoryId);
    
    // Segunda transacción - sin subcategoría pero válida
    const txn2 = savedTxns.find((t: any) => t.type === 'income');
    expect(txn2.account).toBe(accountId);
    expect(txn2.category).toBe(categoryId);
  });

  it('✅ debe mantener transacciones después de actualizar', async () => {
    // 1. Crear transacción
    const createResponse = await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ 
        transactions: [{
          type: 'expense',
          amount: 50000,
          date: new Date().toISOString(),
          account: accountId,
          category: categoryId,
        }]
      }),
    });
    
    const { transactions: [createdTxn] } = await createResponse.json();
    
    // 2. Actualizar monto
    const updatedTxn = {
      ...createdTxn,
      amount: 75000,
    };
    
    await fetch(`${API_BASE}/transactions/${createdTxn.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(updatedTxn),
    });
    
    // 3. ✅ Verificar que se actualizó SIN perder referencias
    const getResponse = await fetch(`${API_BASE}/transactions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    const { transactions } = await getResponse.json();
    
    expect(transactions).toHaveLength(1);
    expect(transactions[0].amount).toBe(75000);          // Nuevo valor
    expect(transactions[0].account).toBe(accountId);     // NO debe perderse
    expect(transactions[0].category).toBe(categoryId);   // NO debe perderse
  });

  it('✅ debe preservar tags después de guardar/cargar', async () => {
    // 1. Crear transacción con tags
    const transactionData = {
      type: 'expense',
      amount: 50000,
      date: new Date().toISOString(),
      account: accountId,
      category: categoryId,
      tags: ['trabajo', 'urgente'], // ← Tags
    };
    
    await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ transactions: [transactionData] }),
    });
    
    // 2. ✅ Verificar que tags NO se perdieron
    const getResponse = await fetch(`${API_BASE}/transactions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    const { transactions } = await getResponse.json();
    
    expect(transactions[0].tags).toEqual(['trabajo', 'urgente']);
  });
});
