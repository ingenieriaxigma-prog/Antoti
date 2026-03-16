/**
 * DATA INTEGRITY TEST: Balance de Cuentas
 * 
 * Este test HUBIERA detectado el bug de balances reseteados.
 * 
 * Qué prueba:
 * 1. ✅ Balance se recalcula correctamente desde transacciones
 * 2. ✅ Balance persiste después de logout/login
 * 3. ✅ Balance se actualiza al crear/eliminar transacciones
 * 4. ✅ Transferencias actualizan AMBAS cuentas correctamente
 * 5. ✅ Balance NO se resetea a cero al refrescar
 * 
 * Bug que detecta:
 * - Balance se reseteaba a cero al hacer login desde otro dispositivo
 * - filterValidAccounts eliminaba cuentas válidas
 * - Balance no se recalculaba correctamente
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

describe('DATA INTEGRITY: Balance de Cuentas', () => {
  let testUserId: string;
  let testEmail: string;
  let testPassword: string;
  let accessToken: string;
  let accountId: string;
  let categoryId: string;
  
  const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3`;

  beforeEach(async () => {
    // Crear usuario único
    testEmail = `test-balance-${Date.now()}@example.com`;
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
    
    // Crear cuenta con balance inicial
    const accountResponse = await fetch(`${API_BASE}/accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        name: 'Cuenta Test',
        type: 'bank',
        balance: 1000000, // 1 millón inicial
        icon: 'building-2',
        color: '#10b981',
      }),
    });
    
    const accountData = await accountResponse.json();
    accountId = accountData.id;
    
    // Crear categoría para transacciones
    const categoryResponse = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        name: 'Categoría Test',
        type: 'expense',
        icon: 'tag',
        color: '#f97316',
      }),
    });
    
    const categoryData = await categoryResponse.json();
    categoryId = categoryData.id;
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

  it('✅ debe mantener balance inicial después de logout/login', async () => {
    // 1. Verificar balance inicial
    let getResponse = await fetch(`${API_BASE}/accounts`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    let { accounts } = await getResponse.json();
    expect(accounts[0].balance).toBe(1000000);
    
    // 2. ✅ CRÍTICO - Simular login desde otro dispositivo
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
    
    // 3. ✅ Verificar que balance NO se reseteó a cero
    getResponse = await fetch(`${API_BASE}/accounts`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${newAccessToken}`,
      },
    });
    
    ({ accounts } = await getResponse.json());
    
    // ✅ Este test HUBIERA DETECTADO el bug de balance reseteado
    expect(accounts).toHaveLength(1);
    expect(accounts[0].balance).toBe(1000000); // ← NO debe ser 0
  });

  it('✅ debe actualizar balance correctamente al crear INGRESO', async () => {
    // 1. Crear ingreso de +100,000
    await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ 
        transactions: [{
          type: 'income',
          amount: 100000,
          date: new Date().toISOString(),
          account: accountId,
          category: categoryId,
        }]
      }),
    });
    
    // 2. ✅ Verificar que balance se actualizó
    const getResponse = await fetch(`${API_BASE}/accounts`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    const { accounts } = await getResponse.json();
    
    // Balance = 1,000,000 (inicial) + 100,000 (ingreso) = 1,100,000
    expect(accounts[0].balance).toBe(1100000);
  });

  it('✅ debe actualizar balance correctamente al crear GASTO', async () => {
    // 1. Crear gasto de -50,000
    await fetch(`${API_BASE}/transactions`, {
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
    
    // 2. ✅ Verificar que balance se actualizó
    const getResponse = await fetch(`${API_BASE}/accounts`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    const { accounts } = await getResponse.json();
    
    // Balance = 1,000,000 (inicial) - 50,000 (gasto) = 950,000
    expect(accounts[0].balance).toBe(950000);
  });

  it('✅ debe mantener balance correcto después de múltiples transacciones', async () => {
    // 1. Crear múltiples transacciones
    await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ 
        transactions: [
          { type: 'income', amount: 200000, date: new Date().toISOString(), account: accountId, category: categoryId },
          { type: 'expense', amount: 50000, date: new Date().toISOString(), account: accountId, category: categoryId },
          { type: 'income', amount: 100000, date: new Date().toISOString(), account: accountId, category: categoryId },
          { type: 'expense', amount: 30000, date: new Date().toISOString(), account: accountId, category: categoryId },
        ]
      }),
    });
    
    // 2. ✅ Verificar balance calculado correctamente
    const getResponse = await fetch(`${API_BASE}/accounts`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    const { accounts } = await getResponse.json();
    
    // Balance = 1,000,000 + 200,000 - 50,000 + 100,000 - 30,000 = 1,220,000
    expect(accounts[0].balance).toBe(1220000);
  });

  it('✅ debe recalcular balance correctamente después de logout/login con transacciones', async () => {
    // 1. Crear transacciones
    await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ 
        transactions: [
          { type: 'income', amount: 100000, date: new Date().toISOString(), account: accountId, category: categoryId },
          { type: 'expense', amount: 50000, date: new Date().toISOString(), account: accountId, category: categoryId },
        ]
      }),
    });
    
    // Balance debería ser: 1,000,000 + 100,000 - 50,000 = 1,050,000
    
    // 2. ✅ CRÍTICO - Login desde otro dispositivo
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
    
    // 3. ✅ Verificar que balance se RECALCULÓ correctamente
    const getResponse = await fetch(`${API_BASE}/accounts`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${newAccessToken}`,
      },
    });
    
    const { accounts } = await getResponse.json();
    
    // ✅ Este test detecta si el balance NO se recalcula
    expect(accounts[0].balance).toBe(1050000);
  });

  it('✅ debe actualizar AMBAS cuentas en una transferencia', async () => {
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
        balance: 500000,
        icon: 'wallet',
        color: '#3b82f6',
      }),
    });
    
    const account2Data = await account2Response.json();
    const toAccountId = account2Data.id;
    
    // 2. Crear transferencia de 100,000 de cuenta1 a cuenta2
    await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ 
        transactions: [{
          type: 'transfer',
          amount: 100000,
          date: new Date().toISOString(),
          account: accountId,
          toAccount: toAccountId,
        }]
      }),
    });
    
    // 3. ✅ Verificar que AMBAS cuentas se actualizaron
    const getResponse = await fetch(`${API_BASE}/accounts`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    const { accounts } = await getResponse.json();
    
    const account1 = accounts.find((a: any) => a.id === accountId);
    const account2 = accounts.find((a: any) => a.id === toAccountId);
    
    // Cuenta origen: 1,000,000 - 100,000 = 900,000
    expect(account1.balance).toBe(900000);
    
    // Cuenta destino: 500,000 + 100,000 = 600,000
    expect(account2.balance).toBe(600000);
  });

  it('✅ debe recalcular balance al eliminar transacción', async () => {
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
          amount: 100000,
          date: new Date().toISOString(),
          account: accountId,
          category: categoryId,
        }]
      }),
    });
    
    const { transactions: [createdTxn] } = await createResponse.json();
    
    // Balance después de gasto: 1,000,000 - 100,000 = 900,000
    let getResponse = await fetch(`${API_BASE}/accounts`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    let { accounts } = await getResponse.json();
    expect(accounts[0].balance).toBe(900000);
    
    // 2. Eliminar la transacción
    await fetch(`${API_BASE}/transactions/${createdTxn.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    // 3. ✅ Verificar que balance volvió al inicial
    getResponse = await fetch(`${API_BASE}/accounts`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    ({ accounts } = await getResponse.json());
    
    expect(accounts[0].balance).toBe(1000000); // Volvió al inicial
  });

  it('✅ NO debe filtrar cuentas con UUIDs válidos', async () => {
    // 1. Crear cuenta con todos los campos válidos
    const validAccount = {
      name: 'Cuenta Válida',
      type: 'bank',
      balance: 2000000,
      icon: 'building-2',
      color: '#10b981',
    };
    
    const createResponse = await fetch(`${API_BASE}/accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(validAccount),
    });
    
    expect(createResponse.ok).toBe(true);
    
    // 2. ✅ Verificar que NO se filtró
    const getResponse = await fetch(`${API_BASE}/accounts`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    const { accounts } = await getResponse.json();
    
    // ✅ Detecta si filterValidAccounts elimina cuentas válidas
    expect(accounts).toHaveLength(2); // La inicial + la nueva
    
    const newAccount = accounts.find((a: any) => a.name === 'Cuenta Válida');
    expect(newAccount).toBeDefined();
    expect(newAccount.balance).toBe(2000000);
  });
});
