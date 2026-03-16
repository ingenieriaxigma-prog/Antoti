/**
 * Integration Test: Multi-usuario (CRÍTICO)
 * 
 * Flujo probado:
 * 1. Usuario A crea transacciones y presupuestos
 * 2. Usuario A cierra sesión
 * 3. Usuario B inicia sesión
 * 4. Verifica que Usuario B NO ve datos de Usuario A
 * 5. Usuario B crea sus propias transacciones
 * 6. Usuario A vuelve a iniciar sesión
 * 7. Verifica que Usuario A solo ve SUS datos
 * 8. Verifica que Usuario A NO ve datos de Usuario B
 * 9. Verifica aislamiento total de datos entre usuarios
 * 
 * ⚠️ Este es el test MÁS CRÍTICO para seguridad
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, userEvent } from '../../setup/test-utils';
import { supabase } from '../../../utils/supabase/client';
import { generateTestEmail } from '../../setup/mock-data';
import App from '../../../App';

describe('Integration Test: Multi-usuario (Seguridad)', () => {
  let userA: {
    id: string;
    email: string;
    password: string;
    accessToken: string;
    accountId: string;
    categoryId: string;
    transactionId: string;
  };
  
  let userB: {
    id: string;
    email: string;
    password: string;
    accessToken: string;
    accountId: string;
    categoryId: string;
    transactionId: string;
  };

  beforeEach(async () => {
    // ==========================================
    // CREAR USUARIO A
    // ==========================================
    const emailA = generateTestEmail();
    const passwordA = 'UserAPassword123!';
    
    const signupAResponse = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/make-server-727b50c3/signup`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          email: emailA,
          password: passwordA,
          name: 'Usuario A',
        }),
      }
    );
    
    const signupAData = await signupAResponse.json();
    
    // Crear cuenta para Usuario A
    const accountAResponse = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/make-server-727b50c3/accounts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${signupAData.access_token}`,
        },
        body: JSON.stringify({
          name: 'Cuenta Usuario A',
          type: 'bank',
          balance: 1000000,
          icon: 'building-2',
          color: '#10b981',
        }),
      }
    );
    const accountAData = await accountAResponse.json();
    
    // Crear categoría para Usuario A
    const categoryAResponse = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/make-server-727b50c3/categories`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${signupAData.access_token}`,
        },
        body: JSON.stringify({
          name: 'Categoría Usuario A',
          type: 'income',
          icon: 'briefcase',
          color: '#3b82f6',
          subcategories: ['Subcategoría A'],
        }),
      }
    );
    const categoryAData = await categoryAResponse.json();
    
    // Crear transacción para Usuario A
    const transactionAResponse = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/make-server-727b50c3/transactions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${signupAData.access_token}`,
        },
        body: JSON.stringify({
          type: 'income',
          amount: 500000,
          category: categoryAData.id,
          subcategory: 'Subcategoría A',
          account: accountAData.id,
          date: new Date().toISOString(),
          note: 'Transacción privada de Usuario A',
        }),
      }
    );
    const transactionAData = await transactionAResponse.json();
    
    userA = {
      id: signupAData.user.id,
      email: emailA,
      password: passwordA,
      accessToken: signupAData.access_token,
      accountId: accountAData.id,
      categoryId: categoryAData.id,
      transactionId: transactionAData.id,
    };
    
    // ==========================================
    // CREAR USUARIO B
    // ==========================================
    const emailB = generateTestEmail();
    const passwordB = 'UserBPassword456!';
    
    const signupBResponse = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/make-server-727b50c3/signup`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          email: emailB,
          password: passwordB,
          name: 'Usuario B',
        }),
      }
    );
    
    const signupBData = await signupBResponse.json();
    
    // Crear cuenta para Usuario B
    const accountBResponse = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/make-server-727b50c3/accounts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${signupBData.access_token}`,
        },
        body: JSON.stringify({
          name: 'Cuenta Usuario B',
          type: 'bank',
          balance: 2000000,
          icon: 'wallet',
          color: '#f97316',
        }),
      }
    );
    const accountBData = await accountBResponse.json();
    
    // Crear categoría para Usuario B
    const categoryBResponse = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/make-server-727b50c3/categories`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${signupBData.access_token}`,
        },
        body: JSON.stringify({
          name: 'Categoría Usuario B',
          type: 'expense',
          icon: 'shopping-cart',
          color: '#ec4899',
          subcategories: ['Subcategoría B'],
        }),
      }
    );
    const categoryBData = await categoryBResponse.json();
    
    // Crear transacción para Usuario B
    const transactionBResponse = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/make-server-727b50c3/transactions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${signupBData.access_token}`,
        },
        body: JSON.stringify({
          type: 'expense',
          amount: 300000,
          category: categoryBData.id,
          subcategory: 'Subcategoría B',
          account: accountBData.id,
          date: new Date().toISOString(),
          note: 'Transacción privada de Usuario B',
        }),
      }
    );
    const transactionBData = await transactionBResponse.json();
    
    userB = {
      id: signupBData.user.id,
      email: emailB,
      password: passwordB,
      accessToken: signupBData.access_token,
      accountId: accountBData.id,
      categoryId: categoryBData.id,
      transactionId: transactionBData.id,
    };
  });

  afterEach(async () => {
    // Limpiar datos de ambos usuarios
    if (userA.id) {
      await supabase.from('transactions').delete().eq('user_id', userA.id);
      await supabase.from('accounts').delete().eq('user_id', userA.id);
      await supabase.from('categories').delete().eq('user_id', userA.id);
    }
    
    if (userB.id) {
      await supabase.from('transactions').delete().eq('user_id', userB.id);
      await supabase.from('accounts').delete().eq('user_id', userB.id);
      await supabase.from('categories').delete().eq('user_id', userB.id);
    }
  });

  it('debe aislar completamente los datos entre Usuario A y Usuario B', async () => {
    const user = userEvent.setup();
    
    // ==========================================
    // FASE 1: USUARIO A INICIA SESIÓN
    // ==========================================
    
    renderWithProviders(<App />);
    
    await waitFor(() => {
      expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument();
    });
    
    // Login como Usuario A
    const emailInput = screen.getByPlaceholderText(/correo electrónico/i);
    const passwordInput = screen.getByPlaceholderText(/contraseña/i);
    const loginButton = screen.getByRole('button', { name: /iniciar sesión/i });
    
    await user.type(emailInput, userA.email);
    await user.type(passwordInput, userA.password);
    await user.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText(/balance total/i)).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Verificar que Usuario A ve SUS datos
    await waitFor(() => {
      expect(screen.getByText(/transacción privada de usuario a/i)).toBeInTheDocument();
      expect(screen.getByText(/500\.000/i)).toBeInTheDocument(); // Su ingreso
    });
    
    // Verificar que Usuario A NO ve datos de Usuario B
    expect(screen.queryByText(/transacción privada de usuario b/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/cuenta usuario b/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/categoría usuario b/i)).not.toBeInTheDocument();
    
    // Verificar balance de Usuario A: $1,000,000 + $500,000 = $1,500,000
    await waitFor(() => {
      expect(screen.getByText(/1\.500\.000/i)).toBeInTheDocument();
    });
    
    // ==========================================
    // FASE 2: USUARIO A CIERRA SESIÓN
    // ==========================================
    
    // Navegar a Configuración
    const configButton = screen.getByLabelText(/configuración/i);
    await user.click(configButton);
    
    await waitFor(() => {
      expect(screen.getByText(/configuración/i)).toBeInTheDocument();
    });
    
    // Hacer logout
    const logoutButton = screen.getByRole('button', { name: /cerrar sesión/i });
    await user.click(logoutButton);
    
    // Confirmar logout
    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: /confirmar|sí/i });
      user.click(confirmButton);
    });
    
    // Verificar que volvimos a la pantalla de login
    await waitFor(() => {
      expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // ==========================================
    // FASE 3: USUARIO B INICIA SESIÓN
    // ==========================================
    
    // Login como Usuario B
    const emailInput2 = screen.getByPlaceholderText(/correo electrónico/i);
    const passwordInput2 = screen.getByPlaceholderText(/contraseña/i);
    const loginButton2 = screen.getByRole('button', { name: /iniciar sesión/i });
    
    await user.clear(emailInput2);
    await user.clear(passwordInput2);
    
    await user.type(emailInput2, userB.email);
    await user.type(passwordInput2, userB.password);
    await user.click(loginButton2);
    
    await waitFor(() => {
      expect(screen.getByText(/balance total/i)).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // ⚠️ CRÍTICO: Verificar que Usuario B ve SOLO SUS datos
    await waitFor(() => {
      expect(screen.getByText(/transacción privada de usuario b/i)).toBeInTheDocument();
      expect(screen.getByText(/300\.000/i)).toBeInTheDocument(); // Su gasto
    });
    
    // ⚠️ CRÍTICO: Verificar que Usuario B NO ve datos de Usuario A
    expect(screen.queryByText(/transacción privada de usuario a/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/cuenta usuario a/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/categoría usuario a/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/500\.000/i)).not.toBeInTheDocument(); // Monto de Usuario A
    
    // Verificar balance de Usuario B: $2,000,000 - $300,000 = $1,700,000
    await waitFor(() => {
      expect(screen.getByText(/1\.700\.000/i)).toBeInTheDocument();
    });
    
    // Verificar en pantalla de Cuentas
    const cuentasButton = screen.getByLabelText(/cuentas/i);
    await user.click(cuentasButton);
    
    await waitFor(() => {
      expect(screen.getByText(/mis cuentas/i)).toBeInTheDocument();
    });
    
    // Usuario B debe ver SOLO su cuenta
    await waitFor(() => {
      expect(screen.getByText(/cuenta usuario b/i)).toBeInTheDocument();
    });
    
    expect(screen.queryByText(/cuenta usuario a/i)).not.toBeInTheDocument();
    
    // Verificar en pantalla de Categorías
    const categoriasButton = screen.getByLabelText(/categorías/i);
    await user.click(categoriasButton);
    
    await waitFor(() => {
      expect(screen.getByText(/mis categorías/i)).toBeInTheDocument();
    });
    
    // Usuario B debe ver SOLO sus categorías
    await waitFor(() => {
      expect(screen.getByText(/categoría usuario b/i)).toBeInTheDocument();
    });
    
    expect(screen.queryByText(/categoría usuario a/i)).not.toBeInTheDocument();
    
    // ==========================================
    // FASE 4: USUARIO B CIERRA SESIÓN
    // ==========================================
    
    const configButton2 = screen.getByLabelText(/configuración/i);
    await user.click(configButton2);
    
    await waitFor(() => {
      expect(screen.getByText(/configuración/i)).toBeInTheDocument();
    });
    
    const logoutButton2 = screen.getByRole('button', { name: /cerrar sesión/i });
    await user.click(logoutButton2);
    
    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: /confirmar|sí/i });
      user.click(confirmButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // ==========================================
    // FASE 5: USUARIO A VUELVE A INICIAR SESIÓN
    // ==========================================
    
    const emailInput3 = screen.getByPlaceholderText(/correo electrónico/i);
    const passwordInput3 = screen.getByPlaceholderText(/contraseña/i);
    const loginButton3 = screen.getByRole('button', { name: /iniciar sesión/i });
    
    await user.clear(emailInput3);
    await user.clear(passwordInput3);
    
    await user.type(emailInput3, userA.email);
    await user.type(passwordInput3, userA.password);
    await user.click(loginButton3);
    
    await waitFor(() => {
      expect(screen.getByText(/balance total/i)).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // ⚠️ CRÍTICO: Verificar que Usuario A SIGUE viendo SOLO SUS datos
    await waitFor(() => {
      expect(screen.getByText(/transacción privada de usuario a/i)).toBeInTheDocument();
      expect(screen.getByText(/1\.500\.000/i)).toBeInTheDocument(); // Su balance
    });
    
    // ⚠️ CRÍTICO: Verificar que Usuario A NO ve datos de Usuario B
    expect(screen.queryByText(/transacción privada de usuario b/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/1\.700\.000/i)).not.toBeInTheDocument(); // Balance de Usuario B
    
    // ==========================================
    // FASE 6: VERIFICACIÓN EN BASE DE DATOS
    // ==========================================
    
    // Verificar que las transacciones están correctamente aisladas
    const { data: transactionsA, error: errorA } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userA.id);
    
    expect(errorA).toBeNull();
    expect(transactionsA).toHaveLength(1); // Solo 1 transacción de Usuario A
    expect(transactionsA![0].note).toBe('Transacción privada de Usuario A');
    
    const { data: transactionsB, error: errorB } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userB.id);
    
    expect(errorB).toBeNull();
    expect(transactionsB).toHaveLength(1); // Solo 1 transacción de Usuario B
    expect(transactionsB![0].note).toBe('Transacción privada de Usuario B');
    
    // Verificar que las cuentas están aisladas
    const { data: accountsA, error: accountsErrorA } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userA.id);
    
    expect(accountsErrorA).toBeNull();
    expect(accountsA![0].name).toBe('Cuenta Usuario A');
    
    const { data: accountsB, error: accountsErrorB } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userB.id);
    
    expect(accountsErrorB).toBeNull();
    expect(accountsB![0].name).toBe('Cuenta Usuario B');
    
    // Verificar que las categorías están aisladas
    const { data: categoriesA, error: categoriesErrorA } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userA.id);
    
    expect(categoriesErrorA).toBeNull();
    expect(categoriesA![0].name).toBe('Categoría Usuario A');
    
    const { data: categoriesB, error: categoriesErrorB } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userB.id);
    
    expect(categoriesErrorB).toBeNull();
    expect(categoriesB![0].name).toBe('Categoría Usuario B');
  });

  it('debe prevenir acceso a datos de otro usuario mediante API directa', async () => {
    // ⚠️ Test de seguridad: Intentar acceder a transacciones de Usuario A usando token de Usuario B
    
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/make-server-727b50c3/transactions`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userB.accessToken}`, // Token de Usuario B
        },
      }
    );
    
    const data = await response.json();
    
    // Verificar que Usuario B solo recibe SUS transacciones
    expect(data).toBeInstanceOf(Array);
    expect(data.length).toBe(1);
    expect(data[0].user_id).toBe(userB.id);
    expect(data[0].note).toBe('Transacción privada de Usuario B');
    
    // Verificar que NO recibe transacciones de Usuario A
    const hasUserATransaction = data.some((t: any) => t.user_id === userA.id);
    expect(hasUserATransaction).toBe(false);
  });

  it('debe prevenir modificación de datos de otro usuario', async () => {
    // ⚠️ Test de seguridad: Intentar editar transacción de Usuario A usando token de Usuario B
    
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/make-server-727b50c3/transactions/${userA.transactionId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userB.accessToken}`, // Token de Usuario B intentando editar dato de Usuario A
        },
        body: JSON.stringify({
          amount: 999999, // Intentar cambiar monto
          note: 'Hacked!', // Intentar cambiar nota
        }),
      }
    );
    
    // Debe retornar error de autorización
    expect(response.ok).toBe(false);
    expect(response.status).toBe(401); // Unauthorized o 403 Forbidden
    
    // Verificar que la transacción de Usuario A NO fue modificada
    const { data: transaction, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', userA.transactionId)
      .single();
    
    expect(error).toBeNull();
    expect(transaction!.amount).toBe(500000); // Valor original
    expect(transaction!.note).toBe('Transacción privada de Usuario A'); // Nota original
    expect(transaction!.user_id).toBe(userA.id); // Sigue perteneciendo a Usuario A
  });
});
