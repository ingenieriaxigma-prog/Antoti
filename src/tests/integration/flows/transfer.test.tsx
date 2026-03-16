/**
 * Integration Test: Transferencia entre Cuentas
 * 
 * Flujo probado:
 * 1. Usuario tiene 2 cuentas:
 *    - Cuenta A: $1,000,000
 *    - Cuenta B: $500,000
 * 2. Crea transferencia de $300,000 de A → B
 * 3. Verifica que el balance de A = $700,000
 * 4. Verifica que el balance de B = $800,000
 * 5. Verifica que la transferencia aparece en ambas cuentas
 * 6. Verifica que el balance total NO cambió ($1,500,000)
 * 7. Verifica que se guardó correctamente en Supabase
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, userEvent } from '../../setup/test-utils';
import { supabase } from '../../../utils/supabase/client';
import { generateTestEmail } from '../../setup/mock-data';
import App from '../../../App';

describe('Integration Test: Transferencia entre Cuentas', () => {
  let testUserId: string;
  let testEmail: string;
  let testPassword: string;
  let accessToken: string;
  let accountAId: string;
  let accountBId: string;

  beforeEach(async () => {
    testEmail = generateTestEmail();
    testPassword = 'TestPassword123!';
    
    // Crear usuario
    const signupResponse = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/make-server-727b50c3/signup`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          name: 'Test User',
        }),
      }
    );
    
    const signupData = await signupResponse.json();
    testUserId = signupData.user.id;
    accessToken = signupData.access_token;
    
    // Crear Cuenta A (origen)
    const accountAResponse = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/make-server-727b50c3/accounts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: 'Bancolombia Test',
          type: 'bank',
          balance: 1000000,
          icon: 'building-2',
          color: '#FFDE00',
        }),
      }
    );
    
    const accountAData = await accountAResponse.json();
    accountAId = accountAData.id;
    
    // Crear Cuenta B (destino)
    const accountBResponse = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/make-server-727b50c3/accounts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: 'Nequi Test',
          type: 'digital',
          balance: 500000,
          icon: 'smartphone',
          color: '#FF006B',
        }),
      }
    );
    
    const accountBData = await accountBResponse.json();
    accountBId = accountBData.id;
  });

  afterEach(async () => {
    if (testUserId) {
      await supabase.from('transactions').delete().eq('user_id', testUserId);
      await supabase.from('accounts').delete().eq('user_id', testUserId);
    }
  });

  it('debe transferir $300,000 entre cuentas y actualizar balances correctamente', async () => {
    const user = userEvent.setup();
    
    // 1. Login
    renderWithProviders(<App />);
    
    await waitFor(() => {
      expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument();
    });
    
    const emailInput = screen.getByPlaceholderText(/correo electrónico/i);
    const passwordInput = screen.getByPlaceholderText(/contraseña/i);
    const loginButton = screen.getByRole('button', { name: /iniciar sesión/i });
    
    await user.type(emailInput, testEmail);
    await user.type(passwordInput, testPassword);
    await user.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText(/balance total/i)).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // 2. Verificar balance total inicial: $1,500,000
    await waitFor(() => {
      expect(screen.getByText(/1\.500\.000/i)).toBeInTheDocument();
    });
    
    // 3. Verificar balances individuales
    // Navegar a pantalla de Cuentas
    const cuentasButton = screen.getByLabelText(/cuentas/i);
    await user.click(cuentasButton);
    
    await waitFor(() => {
      expect(screen.getByText(/mis cuentas/i)).toBeInTheDocument();
    });
    
    // Verificar cuenta A: $1,000,000
    await waitFor(() => {
      expect(screen.getByText(/bancolombia test/i)).toBeInTheDocument();
    });
    
    const accountACard = screen.getByText(/bancolombia test/i).closest('div');
    expect(accountACard).toHaveTextContent(/1\.000\.000/i);
    
    // Verificar cuenta B: $500,000
    const accountBCard = screen.getByText(/nequi test/i).closest('div');
    expect(accountBCard).toHaveTextContent(/500\.000/i);
    
    // 4. Crear transferencia
    const dashboardButton = screen.getByLabelText(/inicio|dashboard/i);
    await user.click(dashboardButton);
    
    await waitFor(() => {
      expect(screen.getByText(/balance total/i)).toBeInTheDocument();
    });
    
    const newTransactionButton = screen.getByLabelText(/nueva transacción/i);
    await user.click(newTransactionButton);
    
    await waitFor(() => {
      expect(screen.getByText(/tipo de transacción/i)).toBeInTheDocument();
    });
    
    // 5. Seleccionar tipo "Transferencia"
    const transferTab = screen.getByRole('button', { name: /transferencia/i });
    await user.click(transferTab);
    
    // 6. Ingresar monto: $300,000
    const amountField = screen.getByText(/monto/i);
    await user.click(amountField);
    
    await user.click(screen.getAllByText('3')[0]); // 3
    await user.click(screen.getAllByText('0')[0]); // 0
    await user.click(screen.getAllByText('0')[0]); // 0
    await user.click(screen.getAllByText('0')[0]); // 0
    await user.click(screen.getAllByText('0')[0]); // 0
    await user.click(screen.getAllByText('0')[0]); // 0
    // Resultado: 300000
    
    // 7. Seleccionar cuenta origen (De: Bancolombia)
    const fromAccountField = screen.getByText(/de.*cuenta/i);
    await user.click(fromAccountField);
    
    await waitFor(() => {
      expect(screen.getByText(/bancolombia test/i)).toBeInTheDocument();
    });
    
    await user.click(screen.getByText(/bancolombia test/i));
    
    // 8. Seleccionar cuenta destino (A: Nequi)
    const toAccountField = screen.getByText(/a.*cuenta/i);
    await user.click(toAccountField);
    
    await waitFor(() => {
      expect(screen.getByText(/nequi test/i)).toBeInTheDocument();
    });
    
    await user.click(screen.getByText(/nequi test/i));
    
    // 9. Agregar nota
    const noteInput = screen.getByPlaceholderText(/agregar nota/i);
    await user.type(noteInput, 'Transferencia de prueba');
    
    // 10. Guardar transferencia
    const saveButton = screen.getByRole('button', { name: /guardar/i });
    await user.click(saveButton);
    
    // 11. Verificar confirmación
    await waitFor(() => {
      expect(screen.getByText(/transacción creada exitosamente/i)).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // 12. Volver al dashboard
    await waitFor(() => {
      expect(screen.getByText(/balance total/i)).toBeInTheDocument();
    });
    
    // 13. Verificar que el balance total NO cambió (sigue en $1,500,000)
    await waitFor(() => {
      expect(screen.getByText(/1\.500\.000/i)).toBeInTheDocument();
    });
    
    // 14. Verificar que la transferencia aparece en el dashboard
    await waitFor(() => {
      expect(screen.getByText(/transferencia de prueba/i)).toBeInTheDocument();
      expect(screen.getByText(/300\.000/i)).toBeInTheDocument();
    });
    
    // 15. Verificar balances actualizados en pantalla de Cuentas
    await user.click(cuentasButton);
    
    await waitFor(() => {
      expect(screen.getByText(/mis cuentas/i)).toBeInTheDocument();
    });
    
    // Cuenta A (origen): $1,000,000 - $300,000 = $700,000
    await waitFor(() => {
      const accountACard = screen.getByText(/bancolombia test/i).closest('div');
      expect(accountACard).toHaveTextContent(/700\.000/i);
    });
    
    // Cuenta B (destino): $500,000 + $300,000 = $800,000
    await waitFor(() => {
      const accountBCard = screen.getByText(/nequi test/i).closest('div');
      expect(accountBCard).toHaveTextContent(/800\.000/i);
    });
    
    // 16. Verificar en la base de datos
    
    // Verificar transacción de transferencia
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', testUserId)
      .eq('type', 'transfer')
      .single();
    
    expect(transactionError).toBeNull();
    expect(transaction).toMatchObject({
      user_id: testUserId,
      type: 'transfer',
      amount: 300000,
      account: accountAId, // Cuenta origen
      to_account: accountBId, // Cuenta destino
      note: 'Transferencia de prueba',
    });
    
    // Verificar balance de cuenta A
    const { data: accountA, error: accountAError } = await supabase
      .from('accounts')
      .select('balance')
      .eq('id', accountAId)
      .single();
    
    expect(accountAError).toBeNull();
    expect(accountA!.balance).toBe(700000); // 1,000,000 - 300,000
    
    // Verificar balance de cuenta B
    const { data: accountB, error: accountBError } = await supabase
      .from('accounts')
      .select('balance')
      .eq('id', accountBId)
      .single();
    
    expect(accountBError).toBeNull();
    expect(accountB!.balance).toBe(800000); // 500,000 + 300,000
  });

  it('debe prevenir transferencia si no hay fondos suficientes', async () => {
    const user = userEvent.setup();
    
    // 1. Login
    renderWithProviders(<App />);
    
    await waitFor(() => {
      expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument();
    });
    
    const emailInput = screen.getByPlaceholderText(/correo electrónico/i);
    const passwordInput = screen.getByPlaceholderText(/contraseña/i);
    const loginButton = screen.getByRole('button', { name: /iniciar sesión/i });
    
    await user.type(emailInput, testEmail);
    await user.type(passwordInput, testPassword);
    await user.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText(/balance total/i)).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // 2. Intentar transferir $2,000,000 (más de lo que hay en cuenta A: $1,000,000)
    const newTransactionButton = screen.getByLabelText(/nueva transacción/i);
    await user.click(newTransactionButton);
    
    await waitFor(() => {
      expect(screen.getByText(/tipo de transacción/i)).toBeInTheDocument();
    });
    
    const transferTab = screen.getByRole('button', { name: /transferencia/i });
    await user.click(transferTab);
    
    // 3. Ingresar monto excesivo: $2,000,000
    const amountField = screen.getByText(/monto/i);
    await user.click(amountField);
    
    await user.click(screen.getAllByText('2')[0]); // 2
    await user.click(screen.getAllByText('0')[0]); // 0
    await user.click(screen.getAllByText('0')[0]); // 0
    await user.click(screen.getAllByText('0')[0]); // 0
    await user.click(screen.getAllByText('0')[0]); // 0
    await user.click(screen.getAllByText('0')[0]); // 0
    await user.click(screen.getAllByText('0')[0]); // 0
    
    // 4. Seleccionar cuenta origen
    const fromAccountField = screen.getByText(/de.*cuenta/i);
    await user.click(fromAccountField);
    
    await waitFor(() => {
      expect(screen.getByText(/bancolombia test/i)).toBeInTheDocument();
    });
    
    await user.click(screen.getByText(/bancolombia test/i));
    
    // 5. Seleccionar cuenta destino
    const toAccountField = screen.getByText(/a.*cuenta/i);
    await user.click(toAccountField);
    
    await waitFor(() => {
      expect(screen.getByText(/nequi test/i)).toBeInTheDocument();
    });
    
    await user.click(screen.getByText(/nequi test/i));
    
    // 6. Intentar guardar
    const saveButton = screen.getByRole('button', { name: /guardar/i });
    await user.click(saveButton);
    
    // 7. Verificar mensaje de error
    await waitFor(() => {
      expect(screen.getByText(/fondos insuficientes|saldo insuficiente/i)).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // 8. Verificar que NO se creó la transacción en la base de datos
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', testUserId)
      .eq('type', 'transfer');
    
    expect(error).toBeNull();
    expect(transactions).toHaveLength(0); // No debe haber transferencias
    
    // 9. Verificar que los balances NO cambiaron
    const { data: accountA, error: accountAError } = await supabase
      .from('accounts')
      .select('balance')
      .eq('id', accountAId)
      .single();
    
    expect(accountAError).toBeNull();
    expect(accountA!.balance).toBe(1000000); // Sin cambios
    
    const { data: accountB, error: accountBError } = await supabase
      .from('accounts')
      .select('balance')
      .eq('id', accountBId)
      .single();
    
    expect(accountBError).toBeNull();
    expect(accountB!.balance).toBe(500000); // Sin cambios
  });

  it('debe prevenir transferencia de una cuenta a sí misma', async () => {
    const user = userEvent.setup();
    
    // 1. Login
    renderWithProviders(<App />);
    
    await waitFor(() => {
      expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument();
    });
    
    const emailInput = screen.getByPlaceholderText(/correo electrónico/i);
    const passwordInput = screen.getByPlaceholderText(/contraseña/i);
    const loginButton = screen.getByRole('button', { name: /iniciar sesión/i });
    
    await user.type(emailInput, testEmail);
    await user.type(passwordInput, testPassword);
    await user.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText(/balance total/i)).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // 2. Crear transferencia
    const newTransactionButton = screen.getByLabelText(/nueva transacción/i);
    await user.click(newTransactionButton);
    
    await waitFor(() => {
      expect(screen.getByText(/tipo de transacción/i)).toBeInTheDocument();
    });
    
    const transferTab = screen.getByRole('button', { name: /transferencia/i });
    await user.click(transferTab);
    
    // 3. Ingresar monto
    const amountField = screen.getByText(/monto/i);
    await user.click(amountField);
    
    await user.click(screen.getAllByText('1')[0]); // 1
    await user.click(screen.getAllByText('0')[0]); // 0
    await user.click(screen.getAllByText('0')[0]); // 0
    await user.click(screen.getAllByText('0')[0]); // 0
    await user.click(screen.getAllByText('0')[0]); // 0
    await user.click(screen.getAllByText('0')[0]); // 0
    
    // 4. Seleccionar misma cuenta para origen y destino
    const fromAccountField = screen.getByText(/de.*cuenta/i);
    await user.click(fromAccountField);
    
    await waitFor(() => {
      expect(screen.getByText(/bancolombia test/i)).toBeInTheDocument();
    });
    
    await user.click(screen.getByText(/bancolombia test/i));
    
    const toAccountField = screen.getByText(/a.*cuenta/i);
    await user.click(toAccountField);
    
    await waitFor(() => {
      expect(screen.getAllByText(/bancolombia test/i).length).toBeGreaterThan(0);
    });
    
    // Intentar seleccionar la misma cuenta
    const sameAccountOption = screen.getAllByText(/bancolombia test/i)[0];
    await user.click(sameAccountOption);
    
    // 5. Intentar guardar
    const saveButton = screen.getByRole('button', { name: /guardar/i });
    
    // El botón debe estar deshabilitado o mostrar error
    if (!saveButton.hasAttribute('disabled')) {
      await user.click(saveButton);
      
      // 6. Verificar mensaje de error
      await waitFor(() => {
        expect(screen.getByText(/no puedes transferir.*misma cuenta|cuenta origen.*destino/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    }
    
    // 7. Verificar que NO se creó la transacción
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', testUserId)
      .eq('type', 'transfer');
    
    expect(error).toBeNull();
    expect(transactions).toHaveLength(0);
  });
});
