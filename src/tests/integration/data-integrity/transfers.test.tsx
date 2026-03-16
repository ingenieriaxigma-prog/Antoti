/**
 * DATA INTEGRITY TEST: Transferencias entre Cuentas
 * 
 * 🔴 CRÍTICO: Balance de ambas cuentas debe ser exacto
 * 
 * Qué prueba:
 * 1. ✅ Transferencia descuenta de cuenta origen
 * 2. ✅ Transferencia suma a cuenta destino
 * 3. ✅ Monto es EXACTAMENTE el mismo en ambas
 * 4. ✅ toAccount NO se pierde
 * 5. ✅ Eliminar transferencia revierte AMBAS cuentas
 * 6. ✅ Transferencia entre mismo tipo de cuenta funciona
 * 
 * Bugs que detecta:
 * - Solo se descuenta pero no se suma
 * - Montos diferentes en origen/destino
 * - toAccount undefined
 * - Balance incorrecto al eliminar
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

describe('💸 DATA INTEGRITY: Transferencias entre Cuentas', () => {
  let testUserId: string;
  let accessToken: string;
  const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-727b50c3`;

  beforeEach(async () => {
    const email = `test-transfer-${Date.now()}@example.com`;
    const password = 'TestPassword123!';
    
    const signupResponse = await fetch(`${API_BASE}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({
        email,
        password,
        name: 'Test User',
      }),
    });
    
    const signupData = await signupResponse.json();
    testUserId = signupData.user.id;
    accessToken = signupData.access_token;
  });

  afterEach(async () => {
    if (testUserId) {
      try {
        await fetch(`${API_BASE}/test/cleanup/${testUserId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
      } catch (error) {
        console.log('Cleanup error (ok):', error);
      }
    }
  });

  it('✅ Transferencia descuenta de cuenta origen', async () => {
    // 1. Crear cuenta origen con balance inicial
    const origen = await createAccount(accessToken, {
      name: 'Efectivo',
      type: 'cash',
      balance: 1000000,
    });
    
    const destino = await createAccount(accessToken, {
      name: 'Banco',
      type: 'bank',
      balance: 500000,
    });
    
    // 2. Crear transferencia de 100,000
    await createTransaction(accessToken, {
      type: 'transfer',
      amount: 100000,
      description: 'Transferencia Test',
      account: origen.id,
      toAccount: destino.id,
      date: new Date().toISOString(),
    });
    
    // 3. ✅ Verificar que se descontó de origen
    const updatedOrigen = await getAccount(accessToken, origen.id);
    
    expect(updatedOrigen.balance).toBe(900000); // 1,000,000 - 100,000
  });

  it('✅ Transferencia suma a cuenta destino', async () => {
    // 1. Crear cuentas
    const origen = await createAccount(accessToken, {
      name: 'Efectivo',
      type: 'cash',
      balance: 1000000,
    });
    
    const destino = await createAccount(accessToken, {
      name: 'Banco',
      type: 'bank',
      balance: 500000,
    });
    
    // 2. Crear transferencia
    await createTransaction(accessToken, {
      type: 'transfer',
      amount: 100000,
      description: 'Transferencia Test',
      account: origen.id,
      toAccount: destino.id,
      date: new Date().toISOString(),
    });
    
    // 3. ✅ Verificar que se sumó a destino
    const updatedDestino = await getAccount(accessToken, destino.id);
    
    expect(updatedDestino.balance).toBe(600000); // 500,000 + 100,000
  });

  it('✅ Monto es EXACTAMENTE el mismo en ambas cuentas', async () => {
    const origen = await createAccount(accessToken, {
      name: 'Cuenta A',
      type: 'cash',
      balance: 1000000,
    });
    
    const destino = await createAccount(accessToken, {
      name: 'Cuenta B',
      type: 'bank',
      balance: 500000,
    });
    
    const balanceAntes = {
      origen: origen.balance,
      destino: destino.balance,
      total: origen.balance + destino.balance,
    };
    
    // Transferir
    await createTransaction(accessToken, {
      type: 'transfer',
      amount: 150000,
      description: 'Test',
      account: origen.id,
      toAccount: destino.id,
      date: new Date().toISOString(),
    });
    
    // ✅ Verificar balances
    const updatedOrigen = await getAccount(accessToken, origen.id);
    const updatedDestino = await getAccount(accessToken, destino.id);
    
    const balanceDespues = {
      origen: updatedOrigen.balance,
      destino: updatedDestino.balance,
      total: updatedOrigen.balance + updatedDestino.balance,
    };
    
    // Monto descontado = monto sumado
    expect(balanceAntes.origen - updatedOrigen.balance).toBe(150000);
    expect(updatedDestino.balance - balanceAntes.destino).toBe(150000);
    
    // Total del sistema NO cambia
    expect(balanceDespues.total).toBe(balanceAntes.total);
  });

  it('✅ toAccount NO se pierde al guardar/cargar', async () => {
    const origen = await createAccount(accessToken, {
      name: 'Origen',
      type: 'cash',
      balance: 1000000,
    });
    
    const destino = await createAccount(accessToken, {
      name: 'Destino',
      type: 'bank',
      balance: 500000,
    });
    
    // Crear transferencia
    await createTransaction(accessToken, {
      type: 'transfer',
      amount: 100000,
      description: 'Test Transfer',
      account: origen.id,
      toAccount: destino.id,
      date: new Date().toISOString(),
    });
    
    // ✅ Cargar transacción y verificar toAccount
    const { transactions } = await fetch(`${API_BASE}/transactions`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    }).then(r => r.json());
    
    const transfer = transactions.find((t: any) => t.type === 'transfer');
    
    expect(transfer).toBeDefined();
    expect(transfer.toAccount).toBe(destino.id); // ✅ NO debe ser undefined
  });

  it('✅ Eliminar transferencia revierte AMBAS cuentas', async () => {
    // 1. Crear cuentas y transferencia
    const origen = await createAccount(accessToken, {
      name: 'Origen',
      type: 'cash',
      balance: 1000000,
    });
    
    const destino = await createAccount(accessToken, {
      name: 'Destino',
      type: 'bank',
      balance: 500000,
    });
    
    const transaction = await createTransaction(accessToken, {
      type: 'transfer',
      amount: 200000,
      description: 'Test',
      account: origen.id,
      toAccount: destino.id,
      date: new Date().toISOString(),
    });
    
    // Balances después de transferencia
    let origenBalance = (await getAccount(accessToken, origen.id)).balance;
    let destinoBalance = (await getAccount(accessToken, destino.id)).balance;
    
    expect(origenBalance).toBe(800000); // 1,000,000 - 200,000
    expect(destinoBalance).toBe(700000); // 500,000 + 200,000
    
    // 2. Eliminar transferencia
    await fetch(`${API_BASE}/transactions/${transaction.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    
    // 3. ✅ Verificar que se revirtieron AMBAS cuentas
    origenBalance = (await getAccount(accessToken, origen.id)).balance;
    destinoBalance = (await getAccount(accessToken, destino.id)).balance;
    
    expect(origenBalance).toBe(1000000); // Volvió al original
    expect(destinoBalance).toBe(500000); // Volvió al original
  });

  it('✅ Transferencia entre mismo tipo de cuenta funciona', async () => {
    // Crear 2 cuentas del mismo tipo (ambas cash)
    const cuenta1 = await createAccount(accessToken, {
      name: 'Efectivo 1',
      type: 'cash',
      balance: 1000000,
    });
    
    const cuenta2 = await createAccount(accessToken, {
      name: 'Efectivo 2',
      type: 'cash',
      balance: 500000,
    });
    
    // Transferir entre cuentas del mismo tipo
    await createTransaction(accessToken, {
      type: 'transfer',
      amount: 300000,
      description: 'Transfer entre cash',
      account: cuenta1.id,
      toAccount: cuenta2.id,
      date: new Date().toISOString(),
    });
    
    // ✅ Verificar balances
    const updated1 = await getAccount(accessToken, cuenta1.id);
    const updated2 = await getAccount(accessToken, cuenta2.id);
    
    expect(updated1.balance).toBe(700000); // 1,000,000 - 300,000
    expect(updated2.balance).toBe(800000); // 500,000 + 300,000
  });
});

// ===== HELPER FUNCTIONS =====

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

async function getAccount(token: string, id: string) {
  const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-727b50c3/accounts`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const { accounts } = await response.json();
  return accounts.find((a: any) => a.id === id);
}
