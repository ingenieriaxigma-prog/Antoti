/**
 * DATA INTEGRITY TEST: Autenticación Multi-Usuario
 * 
 * ⚠️ CRÍTICO PARA SEGURIDAD ⚠️
 * 
 * Qué prueba:
 * 1. ✅ Usuario A NO ve transacciones de Usuario B
 * 2. ✅ Usuario A NO ve presupuestos de Usuario B
 * 3. ✅ Usuario A NO ve cuentas de Usuario B
 * 4. ✅ Usuario A NO ve categorías de Usuario B
 * 5. ✅ Crear cuenta como Usuario A NO afecta a Usuario B
 * 6. ✅ Eliminar transacción como Usuario A NO elimina de Usuario B
 * 7. ✅ Búsqueda NO devuelve datos de otros usuarios
 * 8. ✅ Estadísticas solo muestran datos del usuario actual
 * 9. ✅ Token expirado devuelve 401
 * 10. ✅ Token de Usuario A NO funciona para datos de Usuario B
 * 11. ✅ Logout invalida el token
 * 12. ✅ Login simultáneo en 2 dispositivos funciona
 * 13. ✅ Cambiar contraseña invalida tokens antiguos
 * 14. ✅ Refresh token funciona correctamente
 * 
 * Bugs que detecta:
 * - Usuario ve datos de otros (CRÍTICO - fallo de seguridad)
 * - Token no se valida correctamente
 * - Sesiones se mezclan
 * - Falta de aislamiento de datos
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

describe('🔒 DATA INTEGRITY: Autenticación Multi-Usuario (SEGURIDAD)', () => {
  let userA: { id: string; email: string; password: string; token: string };
  let userB: { id: string; email: string; password: string; token: string };
  
  const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3`;

  beforeEach(async () => {
    // Crear Usuario A
    const emailA = `user-a-${Date.now()}@test.com`;
    const passwordA = 'PasswordA123!';
    
    const signupA = await fetch(`${API_BASE}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({
        email: emailA,
        password: passwordA,
        name: 'User A',
      }),
    });
    
    const dataA = await signupA.json();
    userA = {
      id: dataA.user.id,
      email: emailA,
      password: passwordA,
      token: dataA.access_token,
    };
    
    // Pequeña pausa para asegurar usuarios diferentes
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Crear Usuario B
    const emailB = `user-b-${Date.now()}@test.com`;
    const passwordB = 'PasswordB123!';
    
    const signupB = await fetch(`${API_BASE}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({
        email: emailB,
        password: passwordB,
        name: 'User B',
      }),
    });
    
    const dataB = await signupB.json();
    userB = {
      id: dataB.user.id,
      email: emailB,
      password: passwordB,
      token: dataB.access_token,
    };
  });

  afterEach(async () => {
    // Cleanup
    try {
      if (userA) {
        await fetch(`${API_BASE}/test/cleanup/${userA.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${userA.token}` },
        });
      }
      if (userB) {
        await fetch(`${API_BASE}/test/cleanup/${userB.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${userB.token}` },
        });
      }
    } catch (error) {
      console.log('Cleanup error (ok):', error);
    }
  });

  it('🔴 CRÍTICO: Usuario A NO ve transacciones de Usuario B', async () => {
    // 1. Usuario A crea transacción PRIVADA
    const categoryA = await createCategory(userA.token, {
      name: 'Privada de A',
      type: 'expense',
      icon: 'lock',
      color: '#ff0000',
    });
    
    const accountA = await createAccount(userA.token, {
      name: 'Cuenta de A',
      type: 'cash',
      balance: 1000000,
    });
    
    await createTransaction(userA.token, {
      type: 'expense',
      amount: 50000,
      description: 'TRANSACCIÓN SECRETA DE USUARIO A',
      category: categoryA.id,
      account: accountA.id,
      date: new Date().toISOString(),
    });
    
    // 2. Usuario B crea transacción PRIVADA
    const categoryB = await createCategory(userB.token, {
      name: 'Privada de B',
      type: 'expense',
      icon: 'shield',
      color: '#0000ff',
    });
    
    const accountB = await createAccount(userB.token, {
      name: 'Cuenta de B',
      type: 'cash',
      balance: 2000000,
    });
    
    await createTransaction(userB.token, {
      type: 'expense',
      amount: 100000,
      description: 'TRANSACCIÓN SECRETA DE USUARIO B',
      category: categoryB.id,
      account: accountB.id,
      date: new Date().toISOString(),
    });
    
    // 3. ✅ VERIFICAR: Usuario A solo ve SU transacción
    const responseA = await fetch(`${API_BASE}/transactions`, {
      headers: { 'Authorization': `Bearer ${userA.token}` },
    });
    
    const { transactions: transactionsA } = await responseA.json();
    
    // 🔴 CRÍTICO: Si ve 2 transacciones, hay FALLO DE SEGURIDAD
    expect(transactionsA).toHaveLength(1);
    expect(transactionsA[0].description).toBe('TRANSACCIÓN SECRETA DE USUARIO A');
    expect(transactionsA[0].description).not.toContain('USUARIO B');
    
    // 4. ✅ VERIFICAR: Usuario B solo ve SU transacción
    const responseB = await fetch(`${API_BASE}/transactions`, {
      headers: { 'Authorization': `Bearer ${userB.token}` },
    });
    
    const { transactions: transactionsB } = await responseB.json();
    
    expect(transactionsB).toHaveLength(1);
    expect(transactionsB[0].description).toBe('TRANSACCIÓN SECRETA DE USUARIO B');
    expect(transactionsB[0].description).not.toContain('USUARIO A');
  });

  it('🔴 CRÍTICO: Usuario A NO ve presupuestos de Usuario B', async () => {
    // 1. Usuario A crea presupuesto
    const categoryA = await createCategory(userA.token, {
      name: 'Cat A',
      type: 'expense',
      icon: 'icon',
      color: '#ff0000',
    });
    
    await createBudget(userA.token, {
      categoryId: categoryA.id,
      amount: 500000,
      period: 'monthly',
    });
    
    // 2. Usuario B crea presupuesto
    const categoryB = await createCategory(userB.token, {
      name: 'Cat B',
      type: 'expense',
      icon: 'icon',
      color: '#0000ff',
    });
    
    await createBudget(userB.token, {
      categoryId: categoryB.id,
      amount: 1000000,
      period: 'monthly',
    });
    
    // 3. ✅ Usuario A solo ve SU presupuesto
    const responseA = await fetch(`${API_BASE}/budgets`, {
      headers: { 'Authorization': `Bearer ${userA.token}` },
    });
    
    const { budgets: budgetsA } = await responseA.json();
    
    expect(budgetsA).toHaveLength(1);
    expect(budgetsA[0].amount).toBe(500000);
    
    // 4. ✅ Usuario B solo ve SU presupuesto
    const responseB = await fetch(`${API_BASE}/budgets`, {
      headers: { 'Authorization': `Bearer ${userB.token}` },
    });
    
    const { budgets: budgetsB } = await responseB.json();
    
    expect(budgetsB).toHaveLength(1);
    expect(budgetsB[0].amount).toBe(1000000);
  });

  it('🔴 CRÍTICO: Usuario A NO ve cuentas de Usuario B', async () => {
    // 1. Usuario A crea cuenta
    await createAccount(userA.token, {
      name: 'Efectivo de A',
      type: 'cash',
      balance: 500000,
    });
    
    // 2. Usuario B crea cuenta
    await createAccount(userB.token, {
      name: 'Banco de B',
      type: 'bank',
      balance: 2000000,
    });
    
    // 3. ✅ Usuario A solo ve SU cuenta
    const responseA = await fetch(`${API_BASE}/accounts`, {
      headers: { 'Authorization': `Bearer ${userA.token}` },
    });
    
    const { accounts: accountsA } = await responseA.json();
    
    expect(accountsA).toHaveLength(1);
    expect(accountsA[0].name).toBe('Efectivo de A');
    
    // 4. ✅ Usuario B solo ve SU cuenta
    const responseB = await fetch(`${API_BASE}/accounts`, {
      headers: { 'Authorization': `Bearer ${userB.token}` },
    });
    
    const { accounts: accountsB } = await responseB.json();
    
    expect(accountsB).toHaveLength(1);
    expect(accountsB[0].name).toBe('Banco de B');
  });

  it('🔴 CRÍTICO: Usuario A NO ve categorías de Usuario B', async () => {
    // 1. Usuario A crea categoría custom
    await createCategory(userA.token, {
      name: 'Categoría Privada A',
      type: 'expense',
      icon: 'lock-a',
      color: '#ff0000',
    });
    
    // 2. Usuario B crea categoría custom
    await createCategory(userB.token, {
      name: 'Categoría Privada B',
      type: 'income',
      icon: 'lock-b',
      color: '#0000ff',
    });
    
    // 3. ✅ Usuario A NO debe ver categoría de B
    const responseA = await fetch(`${API_BASE}/categories`, {
      headers: { 'Authorization': `Bearer ${userA.token}` },
    });
    
    const { categories: categoriesA } = await responseA.json();
    
    const categoryOfB = categoriesA.find((c: any) => c.name === 'Categoría Privada B');
    expect(categoryOfB).toBeUndefined();
    
    // 4. ✅ Usuario B NO debe ver categoría de A
    const responseB = await fetch(`${API_BASE}/categories`, {
      headers: { 'Authorization': `Bearer ${userB.token}` },
    });
    
    const { categories: categoriesB } = await responseB.json();
    
    const categoryOfA = categoriesB.find((c: any) => c.name === 'Categoría Privada A');
    expect(categoryOfA).toBeUndefined();
  });

  it('✅ Crear cuenta como Usuario A NO afecta a Usuario B', async () => {
    // 1. Usuario B tiene 1 cuenta
    await createAccount(userB.token, {
      name: 'Cuenta Original de B',
      type: 'cash',
      balance: 1000000,
    });
    
    const beforeB = await fetch(`${API_BASE}/accounts`, {
      headers: { 'Authorization': `Bearer ${userB.token}` },
    }).then(r => r.json());
    
    expect(beforeB.accounts).toHaveLength(1);
    
    // 2. Usuario A crea 5 cuentas
    for (let i = 0; i < 5; i++) {
      await createAccount(userA.token, {
        name: `Cuenta ${i} de A`,
        type: 'cash',
        balance: 100000,
      });
    }
    
    // 3. ✅ Usuario B sigue teniendo solo 1 cuenta
    const afterB = await fetch(`${API_BASE}/accounts`, {
      headers: { 'Authorization': `Bearer ${userB.token}` },
    }).then(r => r.json());
    
    expect(afterB.accounts).toHaveLength(1);
    expect(afterB.accounts[0].name).toBe('Cuenta Original de B');
  });

  it('✅ Eliminar transacción como Usuario A NO elimina de Usuario B', async () => {
    // 1. Usuario A crea transacción
    const categoryA = await createCategory(userA.token, {
      name: 'Cat A',
      type: 'expense',
      icon: 'icon',
      color: '#ff0000',
    });
    const accountA = await createAccount(userA.token, {
      name: 'Account A',
      type: 'cash',
      balance: 1000000,
    });
    const transactionA = await createTransaction(userA.token, {
      type: 'expense',
      amount: 50000,
      description: 'Transaction A',
      category: categoryA.id,
      account: accountA.id,
      date: new Date().toISOString(),
    });
    
    // 2. Usuario B crea transacción
    const categoryB = await createCategory(userB.token, {
      name: 'Cat B',
      type: 'expense',
      icon: 'icon',
      color: '#0000ff',
    });
    const accountB = await createAccount(userB.token, {
      name: 'Account B',
      type: 'cash',
      balance: 2000000,
    });
    await createTransaction(userB.token, {
      type: 'expense',
      amount: 100000,
      description: 'Transaction B',
      category: categoryB.id,
      account: accountB.id,
      date: new Date().toISOString(),
    });
    
    // 3. Usuario A elimina SU transacción
    await fetch(`${API_BASE}/transactions/${transactionA.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${userA.token}` },
    });
    
    // 4. ✅ Usuario B todavía tiene SU transacción
    const responseB = await fetch(`${API_BASE}/transactions`, {
      headers: { 'Authorization': `Bearer ${userB.token}` },
    });
    
    const { transactions: transactionsB } = await responseB.json();
    
    expect(transactionsB).toHaveLength(1);
    expect(transactionsB[0].description).toBe('Transaction B');
  });

  it('✅ Búsqueda NO devuelve datos de otros usuarios', async () => {
    // 1. Usuario A crea transacción con palabra clave
    const categoryA = await createCategory(userA.token, {
      name: 'Cat A',
      type: 'expense',
      icon: 'icon',
      color: '#ff0000',
    });
    const accountA = await createAccount(userA.token, {
      name: 'Account A',
      type: 'cash',
      balance: 1000000,
    });
    await createTransaction(userA.token, {
      type: 'expense',
      amount: 50000,
      description: 'Compra en SUPERMERCADO',
      category: categoryA.id,
      account: accountA.id,
      date: new Date().toISOString(),
    });
    
    // 2. Usuario B crea transacción con MISMA palabra clave
    const categoryB = await createCategory(userB.token, {
      name: 'Cat B',
      type: 'expense',
      icon: 'icon',
      color: '#0000ff',
    });
    const accountB = await createAccount(userB.token, {
      name: 'Account B',
      type: 'cash',
      balance: 2000000,
    });
    await createTransaction(userB.token, {
      type: 'expense',
      amount: 100000,
      description: 'Compra en SUPERMERCADO',
      category: categoryB.id,
      account: accountB.id,
      date: new Date().toISOString(),
    });
    
    // 3. ✅ Usuario A busca "SUPERMERCADO" y solo ve SU resultado
    const searchA = await fetch(`${API_BASE}/transactions?search=SUPERMERCADO`, {
      headers: { 'Authorization': `Bearer ${userA.token}` },
    });
    
    const resultsA = await searchA.json();
    
    expect(resultsA.transactions).toHaveLength(1);
    expect(resultsA.transactions[0].amount).toBe(50000);
  });

  it('✅ Estadísticas solo muestran datos del usuario actual', async () => {
    // 1. Usuario A crea transacciones
    const categoryA = await createCategory(userA.token, {
      name: 'Comida',
      type: 'expense',
      icon: 'utensils',
      color: '#f97316',
    });
    const accountA = await createAccount(userA.token, {
      name: 'Account A',
      type: 'cash',
      balance: 1000000,
    });
    
    await createTransaction(userA.token, {
      type: 'expense',
      amount: 100000,
      description: 'Gasto A',
      category: categoryA.id,
      account: accountA.id,
      date: new Date().toISOString(),
    });
    
    // 2. Usuario B crea transacciones
    const categoryB = await createCategory(userB.token, {
      name: 'Transporte',
      type: 'expense',
      icon: 'car',
      color: '#3b82f6',
    });
    const accountB = await createAccount(userB.token, {
      name: 'Account B',
      type: 'cash',
      balance: 2000000,
    });
    
    await createTransaction(userB.token, {
      type: 'expense',
      amount: 500000,
      description: 'Gasto B',
      category: categoryB.id,
      account: accountB.id,
      date: new Date().toISOString(),
    });
    
    // 3. ✅ Usuario A ve solo SUS estadísticas
    const statsA = await fetch(`${API_BASE}/statistics`, {
      headers: { 'Authorization': `Bearer ${userA.token}` },
    }).then(r => r.json());
    
    expect(statsA.totalExpenses).toBe(100000); // Solo su gasto
    
    // 4. ✅ Usuario B ve solo SUS estadísticas
    const statsB = await fetch(`${API_BASE}/statistics`, {
      headers: { 'Authorization': `Bearer ${userB.token}` },
    }).then(r => r.json());
    
    expect(statsB.totalExpenses).toBe(500000); // Solo su gasto
  });

  it('🔒 Token expirado devuelve 401 Unauthorized', async () => {
    // 1. Token inválido/expirado
    const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.token';
    
    // 2. ✅ Debe rechazar acceso
    const response = await fetch(`${API_BASE}/transactions`, {
      headers: { 'Authorization': `Bearer ${fakeToken}` },
    });
    
    expect(response.status).toBe(401);
  });

  it('🔒 Token de Usuario A NO funciona para datos de Usuario B', async () => {
    // 1. Usuario B crea cuenta
    const accountB = await createAccount(userB.token, {
      name: 'Cuenta Privada de B',
      type: 'cash',
      balance: 1000000,
    });
    
    // 2. ✅ Usuario A intenta acceder con SU token al ID de B (debe fallar)
    const response = await fetch(`${API_BASE}/accounts/${accountB.id}`, {
      headers: { 'Authorization': `Bearer ${userA.token}` },
    });
    
    // Debe devolver 404 (no encontrado) o 403 (prohibido)
    expect(response.ok).toBe(false);
    expect([403, 404]).toContain(response.status);
  });

  it('✅ Logout invalida el token', async () => {
    // 1. Usuario A hace logout
    await fetch(`${API_BASE}/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${userA.token}` },
    });
    
    // 2. ✅ Token ya NO debe funcionar
    const response = await fetch(`${API_BASE}/transactions`, {
      headers: { 'Authorization': `Bearer ${userA.token}` },
    });
    
    expect(response.status).toBe(401);
  });

  it('✅ Login simultáneo en 2 dispositivos funciona', async () => {
    // 1. Login en "dispositivo 1"
    const login1 = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({
        email: userA.email,
        password: userA.password,
      }),
    });
    
    const data1 = await login1.json();
    const token1 = data1.access_token;
    
    // 2. Login en "dispositivo 2"
    const login2 = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({
        email: userA.email,
        password: userA.password,
      }),
    });
    
    const data2 = await login2.json();
    const token2 = data2.access_token;
    
    // 3. ✅ AMBOS tokens deben funcionar
    const response1 = await fetch(`${API_BASE}/accounts`, {
      headers: { 'Authorization': `Bearer ${token1}` },
    });
    
    const response2 = await fetch(`${API_BASE}/accounts`, {
      headers: { 'Authorization': `Bearer ${token2}` },
    });
    
    expect(response1.ok).toBe(true);
    expect(response2.ok).toBe(true);
  });

  it('✅ Cambiar contraseña invalida tokens antiguos', async () => {
    // 1. Token actual funciona
    const beforeChange = await fetch(`${API_BASE}/transactions`, {
      headers: { 'Authorization': `Bearer ${userA.token}` },
    });
    
    expect(beforeChange.ok).toBe(true);
    
    // 2. Cambiar contraseña
    await fetch(`${API_BASE}/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userA.token}`,
      },
      body: JSON.stringify({
        oldPassword: userA.password,
        newPassword: 'NewPassword456!',
      }),
    });
    
    // 3. ✅ Token antiguo ya NO debe funcionar
    const afterChange = await fetch(`${API_BASE}/transactions`, {
      headers: { 'Authorization': `Bearer ${userA.token}` },
    });
    
    expect(afterChange.status).toBe(401);
  });

  it('✅ Refresh token funciona correctamente', async () => {
    // 1. Obtener refresh token
    const loginResponse = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({
        email: userA.email,
        password: userA.password,
      }),
    });
    
    const loginData = await loginResponse.json();
    const refreshToken = loginData.refresh_token;
    
    // 2. ✅ Usar refresh token para obtener nuevo access token
    const refreshResponse = await fetch(`${API_BASE}/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    });
    
    const refreshData = await refreshResponse.json();
    const newAccessToken = refreshData.access_token;
    
    // 3. ✅ Nuevo token debe funcionar
    const testResponse = await fetch(`${API_BASE}/transactions`, {
      headers: { 'Authorization': `Bearer ${newAccessToken}` },
    });
    
    expect(testResponse.ok).toBe(true);
  });
});

// ===== HELPER FUNCTIONS =====

async function createCategory(token: string, data: any) {
  const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-727b50c3/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

async function createAccount(token: string, data: any) {
  const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-727b50c3/accounts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

async function createTransaction(token: string, data: any) {
  const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-727b50c3/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

async function createBudget(token: string, data: any) {
  const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-727b50c3/budgets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ budgets: [data] }),
  });
  const result = await response.json();
  return result.budgets[0];
}
